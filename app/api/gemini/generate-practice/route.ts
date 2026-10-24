import { NextRequest, NextResponse } from 'next/server';
import { generatePracticeQuestions, getDailyQuotaStatus } from '@/lib/ai/gemini';

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

    const result = await generatePracticeQuestions(
      subjectName || 'Course Material',
      topicTitle,
      count || 3
    );

    return NextResponse.json({
      success: true,
      questions: result.questions,
      isAi: result.isAi,
      quotaWarning: result.quotaWarning,
      quota: result.quota || getDailyQuotaStatus(),
    });
  } catch (error: any) {
    console.error('Error in generate-practice route:', error);
    const isQuotaError = error.message?.includes('Daily AI limit reached') || error.message?.includes('quota');
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate practice questions',
        quotaExceeded: isQuotaError,
        quota: getDailyQuotaStatus(),
      },
      { status: isQuotaError ? 429 : 500 }
    );
  }
}
