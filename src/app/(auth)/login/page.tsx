'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Mail, CheckCircle2 } from 'lucide-react';

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const errorParam = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam === 'auth_callback_failed'
      ? 'Authentication callback failed. Please try again.'
      : null
  );

  const supabase = createClient();

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectUrl)}`,
      },
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSubmitted(true);
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectUrl)}`,
      },
    });

    if (error) {
      setGoogleLoading(false);
      setErrorMessage(error.message);
    }
  }

  if (submitted) {
    return (
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-lime/20 rounded-full flex items-center justify-center text-deep-green mb-2 border border-lime/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          <CardDescription className="text-slate">
            We sent a magic sign-in link to <strong className="text-ink">{email}</strong>.
            Click the link in your inbox to sign in instantly.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => setSubmitted(false)}
            className="text-xs text-slate hover:text-ink"
          >
            Use a different email address
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-border shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <Link href="/" className="text-2xl font-bold tracking-tight text-ink">
            wefik<span className="text-deep-green">.world</span>
          </Link>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
        <CardDescription className="text-slate">
          Sign in to access your digital purchases, downloads, and licenses.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="p-3 text-xs bg-error/10 border border-error/20 text-error rounded-[10px]">
            {errorMessage}
          </div>
        )}

        {/* Google OAuth Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center justify-center gap-2 border-border hover:bg-surface h-11"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          Continue with Google
        </Button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-border w-full" />
          <span className="bg-white px-2 text-xs text-slate uppercase font-medium">Or</span>
        </div>

        {/* Magic Link Form */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-semibold text-slate">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@agency.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || googleLoading}
              className="h-11"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-ink hover:bg-black text-white h-11"
            disabled={loading || googleLoading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            Send Magic Link
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3 text-center text-xs text-slate">
        <div>
          Don&apos;t have an account?{' '}
          <Link
            href={`/signup?redirect=${encodeURIComponent(redirectUrl)}`}
            className="text-deep-green font-semibold hover:underline"
          >
            Sign up
          </Link>
        </div>
        <p className="text-[11px] text-slate/80">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-xs text-slate">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
