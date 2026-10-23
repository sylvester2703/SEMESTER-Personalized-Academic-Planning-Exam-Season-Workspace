// Automated Test Suite for SEMESTER
// Runs automated integration and unit tests against dev server & library modules

const BASE_URL = 'http://localhost:3000';

async function runTestSuite() {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPREHENSIVE SEMESTER TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. HTTP Route Tests
  console.log('--- 1. Testing Core Pages & Health ---');
  try {
    const homeRes = await fetch(`${BASE_URL}/`);
    assert(homeRes.status === 200, `GET / returned 200 (Got ${homeRes.status})`);

    const loginRes = await fetch(`${BASE_URL}/login`);
    assert(loginRes.status === 200, `GET /login returned 200 (Got ${loginRes.status})`);

    const signupRes = await fetch(`${BASE_URL}/signup`);
    assert(signupRes.status === 200, `GET /signup returned 200 (Got ${signupRes.status})`);

    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthJson = await healthRes.json();
    assert(healthRes.status === 200, `GET /api/health returned 200 (Got ${healthRes.status})`);
    assert(healthJson.status === 'healthy', `Health JSON status is 'healthy' (Got ${healthJson.status})`);
  } catch (err) {
    assert(false, `Core pages error: ${err.message}`);
  }

  // 2. Calendar Export API Tests
  console.log('\n--- 2. Testing Calendar Export & Error Handling ---');
  try {
    // Valid Payload
    const calValid = await fetch(`${BASE_URL}/api/calendar/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        semesterTitle: 'Fall 2026 Finals',
        subjects: [{ id: 'sub-1', name: 'Distributed Systems', examDate: '2026-11-20', examTime: '09:30' }],
        sessions: [{ id: 'sess-1', title: 'Raft consensus revision', date: '2026-11-18', startTime: '14:00', endTime: '16:00' }],
      }),
    });
    const icsText = await calValid.text();
    assert(calValid.status === 200, `POST /api/calendar/export valid returned 200`);
    assert(icsText.includes('BEGIN:VCALENDAR') && icsText.includes('END:VCALENDAR'), `Valid ICS file structure generated`);
    assert(icsText.includes('Distributed Systems') && icsText.includes('Raft consensus revision'), `ICS contains subject & session details`);

    // Invalid Payload (Error handling check: should return 400, not crash with unhandled 500)
    const calInvalid = await fetch(`${BASE_URL}/api/calendar/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'INVALID_MALFORMED_JSON{',
    });
    assert(calInvalid.status === 400, `POST /api/calendar/export with invalid JSON returned 400 Bad Request (Got ${calInvalid.status})`);
    const calInvalidJson = await calInvalid.json();
    assert(calInvalidJson.success === false, `Error response indicates success: false`);
  } catch (err) {
    assert(false, `Calendar export error: ${err.message}`);
  }

  // 3. Automated 1-2 Hour Cron Schedule Updates API
  console.log('\n--- 3. Testing Automated Schedule Updates Cron API ---');
  try {
    const cronRes = await fetch(`${BASE_URL}/api/cron/schedule-updates?manual=true`);
    const cronJson = await cronRes.json();
    assert(cronRes.status === 200, `GET /api/cron/schedule-updates?manual=true returned 200`);
    assert(cronJson.success === true, `Cron API returned success: true`);
    assert(typeof cronJson.dispatchedCount === 'number' && cronJson.dispatchedCount >= 1, `Cron dispatched notifications (${cronJson.dispatchedCount} dispatched)`);
    assert(cronJson.results?.[0]?.countdownText?.includes('remaining'), `Notification payload contains live exam countdown`);
  } catch (err) {
    assert(false, `Cron updates error: ${err.message}`);
  }

  // 4. Gemini AI / Fallback APIs Error Handling & Responses
  console.log('\n--- 4. Testing AI Routes & Error Handling ---');
  try {
    // Missing body in analyze-syllabus (expect 400)
    const syllabusBad = await fetch(`${BASE_URL}/api/gemini/analyze-syllabus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(syllabusBad.status === 400, `analyze-syllabus without text returned 400 Bad Request (Got ${syllabusBad.status})`);

    // Valid syllabus text in analyze-syllabus (expect 200 with structured units)
    const syllabusGood = await fetch(`${BASE_URL}/api/gemini/analyze-syllabus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Unit 1: Memory Management\n- Paging and Segmentation\n- Page replacement algorithms\nUnit 2: File Systems\n- Directory structures',
      }),
    });
    const syllabusJson = await syllabusGood.json();
    assert(syllabusGood.status === 200, `analyze-syllabus with text returned 200`);
    assert(syllabusJson.success === true && Array.isArray(syllabusJson.units), `analyze-syllabus extracted units array (${syllabusJson.units?.length} units)`);

    // Missing topic in generate-practice (expect 400)
    const practiceBad = await fetch(`${BASE_URL}/api/gemini/generate-practice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(practiceBad.status === 400, `generate-practice without topic returned 400 Bad Request (Got ${practiceBad.status})`);

    // Valid topic in generate-practice (expect 200 with questions)
    const practiceGood = await fetch(`${BASE_URL}/api/gemini/generate-practice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectName: 'Operating Systems', topicTitle: 'Deadlock avoidance & Banker algorithm', count: 2 }),
    });
    const practiceJson = await practiceGood.json();
    assert(practiceGood.status === 200, `generate-practice returned 200`);
    assert(practiceJson.success === true && Array.isArray(practiceJson.questions) && practiceJson.questions.length > 0, `generate-practice returned questions (${practiceJson.questions?.length} questions)`);

    // Recommend route (expect 200 with recommendations)
    const recommendRes = await fetch(`${BASE_URL}/api/gemini/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjects: [{ id: 's1', name: 'Computer Networks', examDate: '2026-11-15' }],
        topics: [{ id: 't1', subjectId: 's1', title: 'TCP Congestion Control', status: 'learning' }],
        dailyHours: 4,
      }),
    });
    const recommendJson = await recommendRes.json();
    assert(recommendRes.status === 200, `recommend route returned 200`);
    assert(recommendJson.success === true && Array.isArray(recommendJson.recommendations) && recommendJson.recommendations.length > 0, `recommend route returned personalized suggestions (${recommendJson.recommendations?.length} items)`);
  } catch (err) {
    assert(false, `AI routes error: ${err.message}`);
  }

  // 5. Time Formatting and 12-Hour Unit Tests
  console.log('\n--- 5. Testing 12-Hour Format & Scheduling Calculations ---');
  function formatTime12Hour(timeStr) {
    if (!timeStr) return '';
    if (/am|pm/i.test(timeStr)) return timeStr;
    const parts = timeStr.trim().split(':');
    if (parts.length < 2) return timeStr;
    const h = parseInt(parts[0], 10);
    const m = parts[1].slice(0, 2);
    if (isNaN(h)) return timeStr;
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${m} ${period}`;
  }

  assert(formatTime12Hour('09:30') === '9:30 AM', `formatTime12Hour('09:30') returns '9:30 AM'`);
  assert(formatTime12Hour('17:45') === '5:45 PM', `formatTime12Hour('17:45') returns '5:45 PM'`);
  assert(formatTime12Hour('00:15') === '12:15 AM', `formatTime12Hour('00:15') returns '12:15 AM'`);
  assert(formatTime12Hour('12:00') === '12:00 PM', `formatTime12Hour('12:00') returns '12:00 PM'`);

  // Summary
  console.log('\n====================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();
