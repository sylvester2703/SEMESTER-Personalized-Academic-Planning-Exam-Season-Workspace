/**
 * Server-Side Gemini AI Service
 * Powered by Google Gemini
 * Strictly executes on the server; API key is never sent to the browser.
 * Includes a strict 15 requests/day limit (preserving a 5-request safety buffer from Google's 20/day limit).
 */

import fs from 'fs';
import path from 'path';

export const DAILY_AI_LIMIT = 15;
export const DAILY_AI_BUFFER = 5; // Buffer preserved from Google's 20 daily free-tier limit

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';

const QUOTA_FILE = path.join(process.cwd(), '.gemini_daily_quota.json');

interface QuotaData {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface QuotaStatus {
  used: number;
  limit: number;
  remaining: number;
  buffer: number;
  isExceeded: boolean;
  date: string;
}

/**
 * Returns current day quota status
 */
export function getDailyQuotaStatus(): QuotaStatus {
  const today = new Date().toISOString().slice(0, 10);
  let data: QuotaData = { date: today, count: 0 };

  try {
    if (fs.existsSync(QUOTA_FILE)) {
      const raw = fs.readFileSync(QUOTA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.date === today && typeof parsed.count === 'number') {
        data = parsed;
      }
    }
  } catch {
    // In-memory fallback
  }

  const isExceeded = data.count >= DAILY_AI_LIMIT;
  return {
    used: data.count,
    limit: DAILY_AI_LIMIT,
    remaining: Math.max(0, DAILY_AI_LIMIT - data.count),
    buffer: DAILY_AI_BUFFER,
    isExceeded,
    date: today,
  };
}

/**
 * Records an AI usage event
 */
export function recordAiUsage(increment = 1): QuotaStatus {
  const today = new Date().toISOString().slice(0, 10);
  let data: QuotaData = { date: today, count: 0 };

  try {
    if (fs.existsSync(QUOTA_FILE)) {
      const raw = fs.readFileSync(QUOTA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.date === today && typeof parsed.count === 'number') {
        data = parsed;
      }
    }
  } catch {
    // ignore
  }

  data.count += increment;
  data.date = today;

  try {
    fs.writeFileSync(QUOTA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // ignore
  }

  return getDailyQuotaStatus();
}

/**
 * Marks the daily quota as exhausted (e.g. on 429 response from upstream API)
 */
export function markQuotaExhausted(): QuotaStatus {
  const today = new Date().toISOString().slice(0, 10);
  const data: QuotaData = { date: today, count: DAILY_AI_LIMIT };

  try {
    fs.writeFileSync(QUOTA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // ignore
  }

  return getDailyQuotaStatus();
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
    code?: number;
  };
}

/**
 * Raw text generation via Gemini AI with 15/day quota enforcement
 */
export async function generateWithGemini(prompt: string, systemInstruction?: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
  }

  const quota = getDailyQuotaStatus();
  if (quota.isExceeded) {
    throw new Error(
      `Daily AI limit reached: You have reached the limit of ${DAILY_AI_LIMIT} AI requests per day (keeping ${DAILY_AI_BUFFER} requests buffer beforehand). Please try again tomorrow, or use our smart built-in rule-based tools.`
    );
  }

  const payload: any = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(6000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429 || errorText.includes('RESOURCE_EXHAUSTED') || errorText.includes('quota')) {
      markQuotaExhausted();
      throw new Error(
        `Daily AI limit reached: ${DAILY_AI_LIMIT} requests per day limit reached (keeping ${DAILY_AI_BUFFER} requests safety buffer beforehand). Free tier limit reached. Please try again tomorrow, or use our smart built-in rule-based tools.`
      );
    }
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  // Record successful request against daily quota
  recordAiUsage(1);

  const result: GeminiResponse = await response.json();
  const outputText = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!outputText) {
    throw new Error('Empty response received from Gemini AI.');
  }

  return outputText;
}

/**
 * Structured syllabus extraction into units and topics
 */
export interface ExtractedUnit {
  unitNumber: number;
  title: string;
  estimatedHours: number;
  topics: Array<{
    title: string;
    difficulty: 'easy' | 'moderate' | 'difficult';
    estimatedMinutes: number;
  }>;
}

export interface SyllabusExtractionResult {
  units: ExtractedUnit[];
  isAi: boolean;
  quotaWarning?: string;
  quota: QuotaStatus;
}

export async function extractSyllabusUnits(syllabusText: string): Promise<SyllabusExtractionResult> {
  const currentQuota = getDailyQuotaStatus();
  let quotaWarning: string | undefined;

  const systemPrompt = `You are an expert academic curriculum parser. 
Extract syllabus units and distinct examinable topics from the provided syllabus text.
Return strictly a valid JSON array of units without markdown fences, comments, or extra text.
Format:
[
  {
    "unitNumber": 1,
    "title": "Unit Name",
    "estimatedHours": 4,
    "topics": [
      {
        "title": "Topic title",
        "difficulty": "easy" | "moderate" | "difficult",
        "estimatedMinutes": 45
      }
    ]
  }
]`;

  const prompt = `Parse this academic syllabus text into structured units and study topics:\n\n${syllabusText.slice(0, 12000)}`;

  try {
    const raw = await generateWithGemini(prompt, systemPrompt);
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return {
        units: parsed,
        isAi: true,
        quota: getDailyQuotaStatus(),
      };
    }
  } catch (err: any) {
    console.warn('[Gemini Service] AI extraction fallback triggered:', err.message);
    if (err.message?.includes('Daily AI limit reached') || err.message?.includes('quota')) {
      quotaWarning = `Daily AI limit reached: ${DAILY_AI_LIMIT} requests per day limit reached (keeping ${DAILY_AI_BUFFER} requests buffer beforehand). Parsed using deterministic heuristic parser.`;
    }
  }

  // Deterministic fallback: extract units based on lines/headings
  const lines = syllabusText.split('\n').map((l) => l.trim()).filter(Boolean);
  const units: ExtractedUnit[] = [];
  let currentUnit: ExtractedUnit | null = null;
  let unitCount = 0;

  for (const line of lines) {
    if (/^(unit|module|chapter|part)\s+\d+/i.test(line) || (!currentUnit && lines.length > 0)) {
      unitCount += 1;
      currentUnit = {
        unitNumber: unitCount,
        title: line,
        estimatedHours: 4,
        topics: [],
      };
      units.push(currentUnit);
    } else if (currentUnit) {
      currentUnit.topics.push({
        title: line.replace(/^[-*•\d.]+\s*/, ''),
        difficulty: 'moderate' as const,
        estimatedMinutes: 45,
      });
    }
  }

  const finalUnits: ExtractedUnit[] = units.length > 0 ? units : [
    {
      unitNumber: 1,
      title: 'Core Syllabus Unit',
      estimatedHours: 4,
      topics: [{ title: 'Overview & Key Concepts', difficulty: 'moderate' as const, estimatedMinutes: 45 }],
    },
  ];

  return {
    units: finalUnits,
    isAi: false,
    quotaWarning,
    quota: getDailyQuotaStatus(),
  };
}

/**
 * Generates active recall practice questions for a topic
 */
export interface PracticeQuestion {
  question: string;
  answer: string;
  keyPoints: string[];
}

export interface PracticeQuestionResult {
  questions: PracticeQuestion[];
  isAi: boolean;
  quotaWarning?: string;
  quota: QuotaStatus;
}

export async function generatePracticeQuestions(
  subjectName: string,
  topicTitle: string,
  count: number = 3
): Promise<PracticeQuestionResult> {
  let quotaWarning: string | undefined;

  const systemPrompt = `You are a university professor preparing active recall questions for exam revision.
Generate exactly ${count} active recall questions for the specified topic.
Return strictly a valid JSON array of objects without markdown fences.
Format:
[
  {
    "question": "Clear conceptual question testing understanding",
    "answer": "Concise, precise explanation or model answer",
    "keyPoints": ["Key point 1", "Key point 2"]
  }
]`;

  const prompt = `Subject: ${subjectName}\nTopic: ${topicTitle}\nGenerate ${count} high-yield exam active recall questions.`;

  try {
    const raw = await generateWithGemini(prompt, systemPrompt);
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return {
        questions: parsed,
        isAi: true,
        quota: getDailyQuotaStatus(),
      };
    }
  } catch (err: any) {
    console.warn('[Gemini Service] Question generation fallback triggered:', err.message);
    if (err.message?.includes('Daily AI limit reached') || err.message?.includes('quota')) {
      quotaWarning = `Daily AI limit reached: ${DAILY_AI_LIMIT} requests per day limit reached (keeping ${DAILY_AI_BUFFER} requests buffer beforehand). Standard active recall prompt generated.`;
    }
  }

  // Deterministic fallback if API fails or quota exceeded
  return {
    questions: [
      {
        question: `Explain the fundamental concept of ${topicTitle} and its primary application.`,
        answer: `Core conceptual foundation of ${topicTitle} covering definitions, primary mechanisms, and typical exam problem scenarios.`,
        keyPoints: ['Definition & Motivation', 'Core Mechanisms', 'Practical Trade-offs'],
      },
    ],
    isAi: false,
    quotaWarning,
    quota: getDailyQuotaStatus(),
  };
}
