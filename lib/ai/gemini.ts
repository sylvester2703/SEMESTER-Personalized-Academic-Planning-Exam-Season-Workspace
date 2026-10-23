/**
 * Server-Side Gemini AI Service
 * Powered by Google Gemini 2.5 Flash
 * Strictly executes on the server; API key is never sent to the browser.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';

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
 * Raw text generation via Gemini 2.5 Flash
 */
export async function generateWithGemini(prompt: string, systemInstruction?: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in the environment.');
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
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

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

export async function extractSyllabusUnits(syllabusText: string): Promise<ExtractedUnit[]> {
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
    // Sanitize in case markdown fences are returned
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err: any) {
    console.error('[Gemini Service] AI extraction failed, falling back to deterministic heuristic parsing:', err);
    // Deterministic fallback: extract units based on lines/headings
    const lines = syllabusText.split('\n').map(l => l.trim()).filter(Boolean);
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
          difficulty: 'moderate',
          estimatedMinutes: 45,
        });
      }
    }
    return units.length > 0 ? units : [
      {
        unitNumber: 1,
        title: 'Core Syllabus Unit',
        estimatedHours: 4,
        topics: [{ title: 'Overview & Key Concepts', difficulty: 'moderate', estimatedMinutes: 45 }],
      },
    ];
  }
}

/**
 * Generates active recall practice questions for a topic
 */
export interface PracticeQuestion {
  question: string;
  answer: string;
  keyPoints: string[];
}

export async function generatePracticeQuestions(
  subjectName: string,
  topicTitle: string,
  count: number = 3
): Promise<PracticeQuestion[]> {
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
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('[Gemini Service] Question generation failed:', err);
    // Deterministic fallback if API fails
    return [
      {
        question: `Explain the fundamental concept of ${topicTitle} and its primary application.`,
        answer: `Core conceptual foundation of ${topicTitle} covering definitions, primary trade-offs, and typical exam problem scenarios.`,
        keyPoints: ['Definition & Motivation', 'Core Mechanisms', 'Practical Trade-offs'],
      },
    ];
  }
}
