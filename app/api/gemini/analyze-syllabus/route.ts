import { NextRequest, NextResponse } from 'next/server';
import { extractSyllabusUnits } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Syllabus text content is required' },
        { status: 400 }
      );
    }

    const units = await extractSyllabusUnits(text);
    return NextResponse.json({ success: true, units });
  } catch (error: any) {
    console.error('Error in analyze-syllabus route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to analyze syllabus with Gemini AI',
      },
      { status: 500 }
    );
  }
}
