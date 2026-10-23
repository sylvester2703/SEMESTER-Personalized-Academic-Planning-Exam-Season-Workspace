import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://rqopkdzujnsdejlxudka.supabase.co';

const secretKey = process.env.SUPABASE_SECRET_KEY || '';

const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_TzdmEGcECq_rn-NHEENL_g_RUGZE0Ea';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, phone } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    // 1. Create auto-confirmed user via Supabase Admin API
    // This bypasses email verification rate limits (429) and allows instant student access
    let userRecord: any = null;
    let createdViaAdmin = false;

    try {
      const adminRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'apikey': secretKey,
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName || 'Student',
            phone: phone || '',
            email_verified: true,
          },
        }),
      });

      const adminData = await adminRes.json();

      if (adminRes.ok && adminData.id) {
        userRecord = adminData;
        createdViaAdmin = true;
      } else if (adminData.msg?.includes('already') || adminData.message?.includes('already')) {
        // User already registered, proceed to sign in
      }
    } catch (adminErr) {
      console.warn('[Auth API] Admin creation fallback to public signup:', adminErr);
    }

    // 2. If not created via admin, attempt public signup
    if (!createdViaAdmin && !userRecord) {
      const pubRes = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': publishableKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          data: {
            full_name: fullName || 'Student',
            phone: phone || '',
          },
        }),
      });

      const pubData = await pubRes.json();
      if (!pubRes.ok && !pubData.msg?.includes('already')) {
        const errorMsg = pubData.msg || pubData.message || 'Unable to register user';
        return NextResponse.json({ success: false, error: errorMsg }, { status: pubRes.status });
      }
      userRecord = pubData.user || pubData;
    }

    // 3. Authenticate and obtain active JWT session token
    const tokenRes = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          'apikey': publishableKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      }
    );

    const tokenData = await tokenRes.json();

    if (tokenRes.ok && tokenData.access_token) {
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
    }

    // If password grant failed due to unconfirmed email, return user info so client knows
    return NextResponse.json({
      success: true,
      user: userRecord,
      session: null,
      message: 'Account registered. Please log in or verify email if required.',
    });
  } catch (err: any) {
    console.error('[API Auth Signup Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
