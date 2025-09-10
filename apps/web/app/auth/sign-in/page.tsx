"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Input, Button } from '@ria/web-ui';
import { auth } from '@ria/client';
import { ROUTES } from '@ria/utils';

// Enhanced sign-in page that uses the shared Input and Button components.
// It uses the auth client to persist sessions. If a session
// exists, the user is redirected to the portal. Errors are shown below
// the form.
export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    auth.getSession().then((session) => {
      if (session) {
        router.push(ROUTES.PORTAL as any);
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await auth.signIn(email, password);
      router.push(ROUTES.PORTAL as any);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800 text-center">
              <strong>Test Credentials:</strong> Use any email/password combination to sign in (demo mode)
            </p>
            <p className="text-xs text-blue-600 text-center mt-1">
              Example: test@example.com / password123
            </p>
          </div>
        </div>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              href={ROUTES.SIGN_UP}
              className="font-medium text-theme hover:text-theme/80"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}