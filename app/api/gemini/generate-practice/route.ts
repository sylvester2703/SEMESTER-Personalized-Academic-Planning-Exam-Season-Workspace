import { NextRequest, NextResponse } from 'next/server';
import { generatePracticeQuestions } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subjectName, topicTitle, count } = body;

    if (!topicTitle) {
      return NextResponse.json(
        { success: false, error: 'Topic title is required' },
        { status: 400 }
      );
    }

    const questions = await generatePracticeQuestions(
      subjectName || 'Course Material',
      topicTitle,
      count || 3
    );

    return NextResponse.json({ success: true, questions });
  } catch (error: any) {
    console.error('Error in generate-practice route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate practice questions',
      },
      { status: 500 }
    );
  }
}
