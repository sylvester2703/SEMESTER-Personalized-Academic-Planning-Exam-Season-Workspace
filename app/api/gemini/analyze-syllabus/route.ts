import { NextRequest, NextResponse } from 'next/server';
import { extractSyllabusUnits, getDailyQuotaStatus } from '@/lib/ai/gemini';

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
    const { text } = body || {};

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Syllabus text content is required' },
        { status: 400 }
      );
    }

    const result = await extractSyllabusUnits(text);
    return NextResponse.json({
      success: true,
      units: result.units,
      isAi: result.isAi,
      quotaWarning: result.quotaWarning,
      quota: result.quota || getDailyQuotaStatus(),
    });
  } catch (error: any) {
    console.error('Error in analyze-syllabus route:', error);
    const isQuotaError = error.message?.includes('Daily AI limit reached') || error.message?.includes('quota');
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to analyze syllabus with Gemini AI',
        quotaExceeded: isQuotaError,
        quota: getDailyQuotaStatus(),
      },
      { status: isQuotaError ? 429 : 500 }
    );
  }
}
