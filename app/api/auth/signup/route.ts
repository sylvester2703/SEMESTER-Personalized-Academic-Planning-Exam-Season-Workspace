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

    const cleanEmail = email.trim().toLowerCase();
    let userRecord: any = null;

    // 1. Try to create user via Supabase Admin API with auto-confirmed email
    if (secretKey) {
      try {
        const adminRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
          method: 'POST',
          headers: {
            'apikey': secretKey,
            'Authorization': `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: cleanEmail,
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
        } else if (
          adminData.msg?.includes('already') ||
          adminData.message?.includes('already') ||
          adminData.error_code === 'email_exists'
        ) {
          // User already exists in Supabase. Find and update password so they can log in seamlessly
          try {
            const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
              headers: {
                'apikey': secretKey,
                'Authorization': `Bearer ${secretKey}`,
              },
            });
            const listData = await listRes.json();
            const existing = listData.users?.find(
              (u: any) => u.email?.toLowerCase() === cleanEmail
            );

            if (existing?.id) {
              await fetch(`${supabaseUrl}/auth/v1/admin/users/${existing.id}`, {
                method: 'PUT',
                headers: {
                  'apikey': secretKey,
                  'Authorization': `Bearer ${secretKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  password,
                  email_confirm: true,
                  user_metadata: {
                    full_name: fullName || existing.user_metadata?.full_name || 'Student',
                    phone: phone || existing.user_metadata?.phone || '',
                  },
                }),
              });
              userRecord = existing;
            }
          } catch (updateErr) {
            console.warn('[Auth API] Existing user password update skipped:', updateErr);
          }
        }
      } catch (adminErr) {
        console.warn('[Auth API] Admin endpoint unavailable, falling back to public signup:', adminErr);
      }
    }

    // 2. If admin creation was not available, try public signup
    if (!userRecord) {
      try {
        const pubRes = await fetch(`${supabaseUrl}/auth/v1/signup`, {
          method: 'POST',
          headers: {
            'apikey': publishableKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: cleanEmail,
            password,
            data: {
              full_name: fullName || 'Student',
              phone: phone || '',
            },
          }),
        });

        const pubData = await pubRes.json();
        if (pubRes.ok) {
          userRecord = pubData.user || pubData;
        } else if (pubData.msg?.includes('already') || pubData.error_code === 'email_exists') {
          return NextResponse.json({
            success: false,
            error: 'This email is already registered. Please click "Sign In" below to log into your account.',
          }, { status: 400 });
        } else {
          return NextResponse.json({
            success: false,
            error: pubData.msg || pubData.message || 'Unable to register user.',
          }, { status: pubRes.status });
        }
      } catch (pubErr: any) {
        console.warn('[Auth API] Public signup fetch failed:', pubErr);
      }
    }

    // 3. Obtain active JWT session token via password grant
    try {
      const tokenRes = await fetch(
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
    } catch (tokenErr) {
      console.warn('[Auth API] Token grant fetch failed:', tokenErr);
    }

    // If session could not be created via Supabase, return success with user record
    if (userRecord) {
      return NextResponse.json({
        success: true,
        user: userRecord,
        session: null,
        message: 'Account created. You can now sign in with your password.',
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Unable to connect to Supabase auth service. Please check your credentials or network connection.',
    }, { status: 500 });
  } catch (err: any) {
    console.error('[API Auth Signup Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
