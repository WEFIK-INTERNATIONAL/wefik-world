'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { PasswordStrengthMeter } from '@/components/auth/password-strength-meter';
import { evaluatePassword } from '@/lib/security/password-strength';
import { Logo } from '@/components/brand/logo';
import { Loader2, CheckCircle2, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

function ResetPasswordContent() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const analysis = evaluatePassword(password);
    if (!analysis.isValid) {
      setErrorMessage('Password must be at least 10 characters and satisfy strength requirements.');
      return;
    }

    setLoading(true);

    // 1. Check Have I Been Pwned (HIBP) k-anonymity API
    try {
      const pwnedRes = await fetch('/api/auth/check-pwned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const pwnedData = await pwnedRes.json();
      if (pwnedData.breached) {
        setLoading(false);
        setErrorMessage(
          'This password has appeared in an open data breach. For your protection, please choose a different password.'
        );
        return;
      }
    } catch {
      // Fail-open per specification
    }

    // 2. Update user password in Supabase
    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setSuccess(true);
    toast.success('Password updated successfully!');
  }

  if (success) {
    return (
      <Card className="w-full max-w-md bg-[var(--surface)] border-[var(--border)] shadow-xl text-center">
        <CardHeader>
          <div className="mx-auto w-14 h-14 bg-deep-green/10 text-deep-green rounded-full flex items-center justify-center mb-2 border border-deep-green/20">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-bold font-display text-[var(--text)]">Password Updated</CardTitle>
          <CardDescription className="text-slate text-sm">
            Your new password has been set. You can now access your account and dashboard.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            onClick={() => router.push('/account')}
            className="w-full bg-deep-green text-white hover:bg-deep-green/90 font-medium"
          >
            Continue to Account <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
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
        <CardTitle className="text-2xl font-bold font-display text-[var(--text)]">Set New Password</CardTitle>
        <CardDescription className="text-slate text-xs sm:text-sm">
          Please enter your new strong password below.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorMessage && (
          <div className="p-3 mb-4 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-slate">New Password (min 10 characters)</label>
            <Input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)]"
            />
            <PasswordStrengthMeter password={password} />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-slate">Confirm New Password</label>
            <Input
              type="password"
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)]"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-deep-green text-white hover:bg-deep-green/90 font-medium"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-var(--header-height)-10rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-deep-green" />
          </div>
        }
      >
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
