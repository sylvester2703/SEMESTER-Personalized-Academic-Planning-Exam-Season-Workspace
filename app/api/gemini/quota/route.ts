import { NextResponse } from 'next/server';
import { getDailyQuotaStatus } from '@/lib/ai/gemini';

export async function GET() {
  const quota = getDailyQuotaStatus();
  return NextResponse.json({
    success: true,
    quota,
  });
}
