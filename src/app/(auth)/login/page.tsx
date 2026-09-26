'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { PasswordStrengthMeter } from '@/components/auth/password-strength-meter';
import { evaluatePassword } from '@/lib/security/password-strength';
import {
  checkEmailRegistered,
  validateEmailDomain,
  requestMfaReset,
  confirmMfaReset,
  EmailCheckResult,
} from '@/lib/api-edge';
import { Logo } from '@/components/brand/logo';
import {
  Loader2,
  Mail,
  AlertCircle,
  ArrowRight,
  Shield,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

type AuthStep = 'email' | 'login' | 'signup' | 'totp' | 'check_inbox' | 'mfa_recovery';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('next') || searchParams.get('redirect') || '/account';
  const errorParam = searchParams.get('error');

  const supabase = createClient();

  // Primary form state
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // TOTP & MFA Reset State
  const [totpCode, setTotpCode] = useState('');
  const [mfaRecoveryCode, setMfaRecoveryCode] = useState('');
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);

  // UI state
  const [step, setStep] = useState<AuthStep>('email');
  const [emailCheckResult, setEmailCheckResult] = useState<EmailCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const getInitialErrorMessage = (param: string | null) => {
    if (!param) return null;
    if (param === 'link_expired' || param === 'auth_callback_failed') {
      return 'This login link expired or is invalid — please request a new one.';
    }
    if (param === 'access_denied') {
      return 'Login request was cancelled or access denied. Please try again.';
    }
    return 'Authentication failed. Please try again.';
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(getInitialErrorMessage(errorParam));

  // Check if user is already logged in
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace(redirectUrl);
      }
    });
  }, [supabase, router, redirectUrl]);

  // Step 1: Handle Email Submission & Account Discovery
  async function handleEmailContinue(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const check = await checkEmailRegistered(email);
    setEmailCheckResult(check);
    setLoading(false);

    if (check.registered) {
      setStep('login');
    } else {
      setStep('signup');
    }
  }

  // Step 2A: Handle Password Sign-In
  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setLoading(false);
      // Non-negotiable anti-enumeration: generic error message
      setErrorMessage('Invalid email or password.');
      return;
    }

    // Check for Two-Factor Authentication (AAL2 requirement)
    try {
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData && aalData.nextLevel === 'aal2' && aalData.currentLevel !== 'aal2') {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totpFactor = factors?.totp?.[0];
        if (totpFactor) {
          setMfaFactorId(totpFactor.id);
          setStep('totp');
          setLoading(false);
          return;
        }
      }
    } catch (mfaErr) {
      console.warn('MFA check bypass/error:', mfaErr);
    }

    setLoading(false);
    toast.success('Welcome back!');
    router.replace(redirectUrl);
  }

  // Step 2B: Handle TOTP 2FA Verification
  async function handleVerifyTotp(e: React.FormEvent) {
    e.preventDefault();
    if (!mfaFactorId || totpCode.length !== 6) {
      setErrorMessage('Please enter the 6-digit code from your authenticator app.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId,
      });

      if (challengeErr || !challenge) {
        setLoading(false);
        setErrorMessage(challengeErr?.message || 'Failed to challenge 2FA.');
        return;
      }

      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challenge.id,
        code: totpCode.trim(),
      });

      setLoading(false);

      if (verifyErr) {
        setErrorMessage('Invalid 6-digit verification code. Please check your app.');
        return;
      }

      toast.success('Authenticated successfully');
      router.replace(redirectUrl);
    } catch (err: unknown) {
      setLoading(false);
      setErrorMessage(err instanceof Error ? err.message : 'MFA verification failed.');
    }
  }

  // Step 2C: Handle New User Signup
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!agreeTerms) {
      setErrorMessage('You must agree to the Terms of Service and Privacy Policy to create an account.');
      return;
    }

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

    // 1. Verify email against blocked disposable domains and MX records via Edge Function
    const emailValidation = await validateEmailDomain(email);
    if (!emailValidation.ok) {
      setLoading(false);
      setErrorMessage(emailValidation.reason || 'Disposable email addresses are not permitted.');
      return;
    }

    // 2. Check Have I Been Pwned (HIBP) k-anonymity API
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

    // 3. Supabase Auth signUp
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectUrl)}`,
        data: {
          full_name: fullName.trim() || undefined,
          display_name: fullName.trim() || undefined,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setErrorMessage(signUpError.message);
      return;
    }

    setStep('check_inbox');
  }

  // Resend confirmation email
  async function handleResendConfirmation() {
    setLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectUrl)}`,
      },
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      toast.success('Confirmation email resent! Please check your inbox.');
    }
  }

  // Magic link option
  async function handleSendMagicLink() {
    if (!email) {
      setErrorMessage('Please enter an email address.');
      return;
    }

    setMagicLinkLoading(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectUrl)}`,
      },
    });

    setMagicLinkLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setStep('check_inbox');
    }
  }

  // Google OAuth
  async function handleGoogleOAuth() {
    setGoogleLoading(true);
    setErrorMessage(null);

    const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteOrigin}/auth/callback?next=${encodeURIComponent(redirectUrl)}`,
      },
    });

    if (error) {
      setGoogleLoading(false);
      setErrorMessage(error.message);
    }
  }

  // MFA Recovery Flow (Lost Authenticator)
  async function handleRequestMfaReset() {
    setLoading(true);
    setErrorMessage(null);
    const res = await requestMfaReset(email);
    setLoading(false);
    toast.info(res.message);
    setStep('mfa_recovery');
  }

  async function handleConfirmMfaReset(e: React.FormEvent) {
    e.preventDefault();
    if (!mfaRecoveryCode) {
      setErrorMessage('Please enter the 6-digit recovery code.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await confirmMfaReset(email, mfaRecoveryCode);
    setLoading(false);

    if (!res.ok) {
      setErrorMessage(res.error || 'Invalid or expired code.');
    } else {
      toast.success(res.message);
      setStep('login');
      setMfaRecoveryCode('');
    }
  }

  // Render Check Inbox View
  if (step === 'check_inbox') {
    return (
      <Card className="w-full max-w-md bg-[var(--surface)] border-[var(--border)] shadow-xl text-center">
        <CardHeader>
          <div className="mx-auto w-14 h-14 bg-deep-green/10 text-deep-green rounded-full flex items-center justify-center mb-2 border border-deep-green/20">
            <Mail className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-bold font-display text-[var(--text)]">Check your inbox</CardTitle>
          <CardDescription className="text-slate">
            We sent a verification link to <strong className="text-[var(--text)]">{email}</strong>.
            Click the link in your email to activate your account and proceed.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-3">
          <Button
            variant="outline"
            onClick={handleResendConfirmation}
            disabled={loading}
            className="w-full border-[var(--border)]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Resend Email
          </Button>
          <Button
            variant="ghost"
            onClick={() => setStep('email')}
            className="text-xs text-slate hover:text-[var(--text)]"
          >
            Use a different email address
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Render Lost Authenticator Recovery Modal / Screen
  if (step === 'mfa_recovery') {
    return (
      <Card className="w-full max-w-md bg-[var(--surface)] border-[var(--border)] shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-bold font-display text-[var(--text)]">Reset Two-Factor Authentication</CardTitle>
          <CardDescription className="text-slate text-xs">
            Enter the 6-digit verification code sent to your verified recovery email.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleConfirmMfaReset}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate">6-Digit Recovery Code</label>
              <Input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={mfaRecoveryCode}
                onChange={(e) => setMfaRecoveryCode(e.target.value.replace(/\D/g, ''))}
                className="text-center font-mono text-xl tracking-widest bg-[var(--surface-2)] border-[var(--border)]"
                autoFocus
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button type="submit" disabled={loading || mfaRecoveryCode.length !== 6} className="w-full bg-deep-green text-white hover:bg-deep-green/90">
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirm & Reset 2FA
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep('totp')}
              className="text-xs text-slate hover:text-[var(--text)]"
            >
              Back to Authenticator Screen
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  }

  // Render TOTP 2FA Verification View
  if (step === 'totp') {
    return (
      <Card className="w-full max-w-md bg-[var(--surface)] border-[var(--border)] shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-deep-green/10 text-deep-green rounded-full flex items-center justify-center mb-2">
            <Shield className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-bold font-display text-[var(--text)]">Two-Factor Authentication</CardTitle>
          <CardDescription className="text-slate text-xs">
            Open your authenticator app and enter the 6-digit verification code.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleVerifyTotp}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate">Authenticator Code</label>
              <Input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                className="text-center font-mono text-2xl tracking-widest bg-[var(--surface-2)] border-[var(--border)]"
                autoFocus
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" disabled={loading || totpCode.length !== 6} className="w-full bg-deep-green text-white hover:bg-deep-green/90">
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Verify Code
            </Button>
            <button
              type="button"
              onClick={handleRequestMfaReset}
              className="text-xs text-deep-green hover:underline font-medium"
            >
              Lost access to your authenticator? Reset via recovery email
            </button>
          </CardFooter>
        </form>
      </Card>
    );
  }

  // Standard Login / Signup Flow
  return (
    <Card className="w-full max-w-md bg-[var(--surface)] border-[var(--border)] shadow-xl transition-all duration-300">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-3">
          <Link href="/">
            <Logo size="lg" />
          </Link>
        </div>
        <CardTitle className="text-2xl font-bold font-display text-[var(--text)]">
          {step === 'signup' ? 'Create your account' : step === 'login' ? 'Welcome back' : 'Sign in to wefik.world'}
        </CardTitle>
        <CardDescription className="text-slate text-xs sm:text-sm">
          {step === 'signup'
            ? 'Get instant access to commercial themes, plugins, and downloads.'
            : step === 'login'
            ? `Signing in as ${email}`
            : 'Enter your email to continue.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Email Entry */}
        {step === 'email' && (
          <form onSubmit={handleEmailContinue} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate">Email address</label>
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
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <>
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        )}

        {/* STEP 2: Registered User Login */}
        {step === 'login' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            {/* If user authenticated with OAuth without password */}
            {emailCheckResult && !emailCheckResult.has_password && emailCheckResult.oauth_providers.includes('google') ? (
              <div className="p-4 rounded-xl bg-lime/10 border border-lime/30 text-left space-y-3">
                <p className="text-xs text-slate">
                  You previously connected this account with <strong>Google</strong>.
                </p>
                <Button
                  type="button"
                  onClick={handleGoogleOAuth}
                  disabled={googleLoading}
                  className="w-full bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-2)]"
                >
                  {googleLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Continue with Google
                </Button>
                <div className="text-center pt-1">
                  <Link
                    href={`/forgot-password?email=${encodeURIComponent(email)}`}
                    className="text-xs text-deep-green hover:underline"
                  >
                    Or set a password for email login
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate">Password</label>
                    <Link
                      href={`/forgot-password?email=${encodeURIComponent(email)}`}
                      className="text-xs text-deep-green hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                    className="bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)]"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                  />
                  <label htmlFor="remember" className="text-xs text-slate cursor-pointer">
                    Remember me on this device
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-deep-green text-white hover:bg-deep-green/90 font-medium"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Sign in'}
                </Button>
              </>
            )}

            {/* Unconfirmed Email Resend Banner */}
            {emailCheckResult && !emailCheckResult.confirmed && (
              <div className="pt-2 text-center border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <RefreshCw className="w-3 h-3" /> Resend confirmation email
                </button>
              </div>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-xs text-slate hover:text-[var(--text)] underline"
              >
                Change email address
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: New User Signup (Smooth Morph) */}
        {step === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4 animate-in fade-in-50 duration-200">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate">Full Name</label>
              <Input
                type="text"
                placeholder="Ada Lovelace"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoFocus
                className="bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)]"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate">Create Password (min 10 characters)</label>
              <Input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)]"
              />
              <PasswordStrengthMeter password={password} />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate">Confirm Password</label>
              <Input
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)]"
              />
            </div>

            <div className="flex items-start space-x-2 text-left pt-1">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(Boolean(checked))}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-xs text-slate leading-snug cursor-pointer">
                I agree to the{' '}
                <Link href="/licensing" target="_blank" className="text-deep-green hover:underline">
                  Commercial License Terms
                </Link>{' '}
                and Privacy Policy.
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-deep-green text-white hover:bg-deep-green/90 font-medium"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Create Account'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-xs text-slate hover:text-[var(--text)] underline"
              >
                Change email address
              </button>
            </div>
          </form>
        )}

        {/* Divider & Alternative OAuth Options */}
        {step === 'email' && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[var(--surface)] px-2 text-slate font-medium">Or continue with</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleOAuth}
                disabled={googleLoading}
                className="w-full border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text)] font-medium"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
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

              <Button
                type="button"
                variant="ghost"
                onClick={handleSendMagicLink}
                disabled={magicLinkLoading}
                className="w-full text-xs text-slate hover:text-[var(--text)] border border-transparent hover:border-[var(--border)]"
              >
                {magicLinkLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Mail className="w-3.5 h-3.5 mr-1.5" />}
                Email me a sign-in link
              </Button>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-center border-t border-[var(--border)] pt-4 text-xs text-slate">
        <span>Protected by Supabase Auth &amp; Enterprise Rate Limiting</span>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-var(--header-height)-10rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-deep-green" />
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
