import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);
  const secretKeyConfigured = Boolean(process.env.SUPABASE_SECRET_KEY);

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      supabase: {
        configured: supabaseConfigured,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
      },
      gemini: {
        configured: geminiConfigured,
        model: 'gemini-3.8-flash',
      },
      privilegedBackend: {
        configured: secretKeyConfigured,
      },
    },
    version: '1.0.0',
    platform: 'SEMESTER on Vercel',
  });
}
