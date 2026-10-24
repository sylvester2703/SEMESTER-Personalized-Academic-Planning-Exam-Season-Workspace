import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://rqopkdzujnsdejlxudka.supabase.co';

const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_TzdmEGcECq_rn-NHEENL_g_RUGZE0Ea';

const secretKey = process.env.SUPABASE_SECRET_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    let tokenRes = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          'apikey': publishableKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      }
    );

    let tokenData = await tokenRes.json();

    // If unconfirmed and admin key exists, auto-confirm and retry
    if (!tokenRes.ok && secretKey && (tokenData.msg?.includes('not confirmed') || tokenData.error_description?.includes('not confirmed'))) {
      try {
        const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
          headers: {
            'apikey': secretKey,
            'Authorization': `Bearer ${secretKey}`,
          },
        });
        const listData = await listRes.json();
        const existing = listData.users?.find((u: any) => u.email?.toLowerCase() === cleanEmail);
        if (existing?.id) {
          await fetch(`${supabaseUrl}/auth/v1/admin/users/${existing.id}`, {
            method: 'PUT',
            headers: {
              'apikey': secretKey,
              'Authorization': `Bearer ${secretKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email_confirm: true }),
          });

          // Retry password grant
          tokenRes = await fetch(
            `${supabaseUrl}/auth/v1/token?grant_type=password`,
            {
              method: 'POST',
              headers: {
                'apikey': publishableKey,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: cleanEmail,
                password,
              }),
            }
          );
          tokenData = await tokenRes.json();
        }
      } catch (adminConfirmErr) {
        console.warn('[Auth Signin] Auto-confirm attempt skipped:', adminConfirmErr);
      }
    }

    if (!tokenRes.ok) {
      let errorMsg = tokenData.msg || tokenData.error_description || tokenData.message || 'Invalid login credentials.';
      if (errorMsg.includes('Email not confirmed')) {
        errorMsg = 'Please verify your email address before signing in, or disable "Confirm email" in Supabase settings.';
      }
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: tokenRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      user: tokenData.user,
      session: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        token_type: tokenData.token_type,
        user: tokenData.user,
      },
    });
  } catch (err: any) {
    console.error('[API Auth Signin Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}
