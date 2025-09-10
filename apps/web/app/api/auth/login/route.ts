import { NextRequest, NextResponse } from 'next/server';
import { signIn } from 'next-auth/react';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Note: The actual authentication is handled by NextAuth
    // This endpoint is mainly for API documentation and potential future use
    // The real login should use NextAuth signIn function on the frontend

    return NextResponse.json({
      message: 'Login endpoint - use NextAuth signIn on frontend',
      redirectTo: '/api/auth/signin'
    }, { status: 200 });

  } catch (error: any) {
    console.error('Login error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}