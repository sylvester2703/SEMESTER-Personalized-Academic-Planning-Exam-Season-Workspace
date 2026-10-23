import { NextRequest, NextResponse } from 'next/server';
import { generatePracticeQuestions } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid or missing JSON in request body' },
        { status: 400 }
      );
    }
    const { subjectName, topicTitle, count } = body || {};

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
