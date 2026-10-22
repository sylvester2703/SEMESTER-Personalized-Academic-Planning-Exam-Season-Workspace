import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subjects = [], topics = [], dailyHours = 4 } = body;

    if (!subjects.length && !topics.length) {
      return NextResponse.json({
        success: true,
        recommendations: [
          {
            topicTitle: 'Add your courses and exam dates',
            subjectName: 'Getting Started',
            urgency: 'high',
            reason: 'Add your semester subjects to unlock personalized study recommendations.',
            suggestedMinutes: 30,
          },
        ],
      });
    }

    const systemPrompt = `You are an elite academic planning advisor for university students preparing for exams.
Analyze the student's subjects, exam dates, and topic statuses.
Suggest exactly 3 high-impact topics to study today.
Return strictly a JSON array of objects without markdown fences.
Format:
[
  {
    "topicTitle": "Topic title",
    "subjectName": "Subject name",
    "urgency": "critical" | "high" | "moderate",
    "reason": "Direct, clear explanation of why this topic needs study today based on exam proximity and difficulty",
    "suggestedMinutes": 45
  }
]`;

    const summaryData = {
      dailyHours,
      subjects: subjects.map((s: any) => ({ name: s.code || s.name, examDate: s.examDate })),
      topics: topics.slice(0, 30).map((t: any) => ({
        title: t.title,
        status: t.status,
        difficulty: t.difficulty,
        subjectId: t.subjectId,
      })),
    };

    const prompt = `Student Workspace Data:\n${JSON.stringify(summaryData, null, 2)}\nProvide the top 3 recommended study priorities for today.`;

    try {
      const raw = await generateWithGemini(prompt, systemPrompt);
      const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const recommendations = JSON.parse(cleaned);
      return NextResponse.json({ success: true, recommendations });
    } catch (aiErr: any) {
      console.warn('[Recommend Route] AI generation failed, using rule-based fallback:', aiErr.message);

      // Rule-based fallback: prioritize unconfident/learning topics from nearest exam
      const sortedSubjects = [...subjects].sort((a: any, b: any) => {
        if (!a.examDate) return 1;
        if (!b.examDate) return -1;
        return new Date(a.examDate).getTime() - new Date(b.examDate).getTime();
      });

      const fallbackRecs: any[] = [];
      for (const sub of sortedSubjects) {
        const subTopics = topics.filter((t: any) => t.subjectId === sub.id && t.status !== 'confident');
        for (const top of subTopics.slice(0, 2)) {
          if (fallbackRecs.length < 3) {
            fallbackRecs.push({
              topicTitle: top.title,
              subjectName: sub.name,
              urgency: sub.examDate ? 'high' : 'moderate',
              reason: `Nearest upcoming exam (${sub.name}) has unmastered topic '${top.title}'.`,
              suggestedMinutes: top.estimatedMinutes || 45,
            });
          }
        }
      }

      if (fallbackRecs.length === 0 && topics.length > 0) {
        fallbackRecs.push({
          topicTitle: topics[0].title,
          subjectName: 'Revision',
          urgency: 'moderate',
          reason: 'Review key concepts to maintain retention.',
          suggestedMinutes: 45,
        });
      }

      return NextResponse.json({ success: true, recommendations: fallbackRecs });
    }
  } catch (error: any) {
    console.error('Error in recommend route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
