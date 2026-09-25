'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { requestRecoveryReset } from '@/lib/api-edge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Logo } from '@/components/brand/logo';
import { Loader2, Mail, CheckCircle2, ArrowLeft, AlertCircle, KeyRound } from 'lucide-react';

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [mode, setMode] = useState<'primary' | 'recovery'>('primary');
  const [email, setEmail] = useState(initialEmail);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  async function handlePrimaryReset(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
    } catch {
      // Anti-enumeration: Never disclose whether email exists or network errored
    }

    setLoading(false);
    // Non-negotiable anti-enumeration: ALWAYS show generic confirmation
    setSubmitted(true);
  }

  async function handleRecoveryReset(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !recoveryEmail) return;

    setLoading(true);
    setErrorMessage(null);

    await requestRecoveryReset(email, recoveryEmail);
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card className="w-full max-w-md bg-[var(--surface)] border-[var(--border)] shadow-xl text-center">
        <CardHeader>
          <div className="mx-auto w-14 h-14 bg-deep-green/10 text-deep-green rounded-full flex items-center justify-center mb-2 border border-deep-green/20">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-bold font-display text-[var(--text)]">Check your email</CardTitle>
          <CardDescription className="text-slate text-sm">
            If an account exists for this email, we&apos;ve sent a password reset link. Please check your inbox and spam folder.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3">
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full border-[var(--border)]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Return to sign in
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-xs text-slate hover:text-[var(--text)]"
          >
            Try another email address
          </button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-[var(--surface)] border-[var(--border)] shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-3">
          <Link href="/">
            <Logo size="lg" />
          </Link>
        </div>
        <CardTitle className="text-2xl font-bold font-display text-[var(--text)]">
          {mode === 'primary' ? 'Reset your password' : 'Reset via recovery email'}
        </CardTitle>
        <CardDescription className="text-slate text-xs sm:text-sm">
          {mode === 'primary'
            ? 'Enter your account email to receive a secure password reset link.'
            : 'Enter your account email and your verified secondary recovery email.'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorMessage && (
          <div className="p-3 mb-4 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {mode === 'primary' ? (
          <form onSubmit={handlePrimaryReset} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate">Account Email</label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-deep-green text-white hover:bg-deep-green/90 font-medium"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
              Send Reset Link
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRecoveryReset} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate">Account Email</label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)]"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate">Verified Recovery Email</label>
              <Input
                type="email"
                placeholder="recovery@example.com"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                required
                autoFocus
                className="bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)]"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-deep-green text-white hover:bg-deep-green/90 font-medium"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
              Send Recovery Link
            </Button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-[var(--border)] text-center space-y-2">
          {mode === 'primary' ? (
            <button
              type="button"
              onClick={() => setMode('recovery')}
              className="text-xs text-deep-green hover:underline font-medium block mx-auto"
            >
              Lost access to your primary email? Use recovery address
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMode('primary')}
              className="text-xs text-deep-green hover:underline font-medium block mx-auto"
            >
              Switch back to standard email reset
            </button>
          )}

          <Link href="/login" className="text-xs text-slate hover:text-[var(--text)] inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back to sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-var(--header-height)-10rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-deep-green" />
          </div>
        }
      >
        <ForgotPasswordContent />
      </Suspense>
    </div>
  );
}
