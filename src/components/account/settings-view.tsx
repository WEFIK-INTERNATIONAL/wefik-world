'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PasswordStrengthMeter } from '@/components/auth/password-strength-meter';
import { evaluatePassword } from '@/lib/security/password-strength';
import {
  requestRecoveryEmailOtp,
  verifyRecoveryEmailOtp,
  removeRecoveryEmail,
  deleteUserAccount,
} from '@/lib/api-edge';
import {
  User,
  Bell,
  Shield,
  Upload,
  Trash2,
  CheckCircle2,
  KeyRound,
  Smartphone,
  AlertTriangle,
  Loader2,
  Mail,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface SettingsViewProps {
  initialProfile: {
    id: string;
    email: string;
    full_name: string | null;
    display_name: string | null;
    avatar_url: string | null;
    recovery_email: string | null;
    recovery_email_verified_at: string | null;
  };
}

export function SettingsView({ initialProfile }: SettingsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';

  const supabase = createClient();

  // Profile Form State
  const [fullName, setFullName] = useState(initialProfile.full_name || '');
  const [displayName, setDisplayName] = useState(initialProfile.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  // Notifications State
  const [productUpdates, setProductUpdates] = useState(true);
  const [newsletter, setNewsletter] = useState(false);

  // Security: Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Security: 2FA State
  const [hasMfa, setHasMfa] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [enrolling2FA, setEnrolling2FA] = useState(false);
  const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [enrollTotpCode, setEnrollTotpCode] = useState('');
  const [disabling2FA, setDisabling2FA] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableTotpCode, setDisableTotpCode] = useState('');

  // Security: Recovery Email State
  const [recoveryEmail, setRecoveryEmail] = useState(initialProfile.recovery_email || '');
  const [recoveryVerified, setRecoveryVerified] = useState(Boolean(initialProfile.recovery_email_verified_at));
  const [newRecoveryEmail, setNewRecoveryEmail] = useState('');
  const [recoveryOtpCode, setRecoveryOtpCode] = useState('');
  const [recoveryOtpStep, setRecoveryOtpStep] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // Security: Active Sessions
  const [userAgent] = useState(() => (typeof window !== 'undefined' ? navigator.userAgent : ''));
  const [sessionLoading, setSessionLoading] = useState(false);

  // Security: Delete Account State
  const [deleteEmailConfirm, setDeleteEmailConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Copied secret key helper
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    // Check existing MFA factor
    supabase.auth.mfa.listFactors().then(({ data: factors }) => {
      const totp = factors?.totp?.find((f) => f.status === 'verified');
      if (totp) {
        setHasMfa(true);
        setMfaFactorId(totp.id);
      }
    });
  }, [supabase]);

  // 1. Avatar Upload (square preview, <=2MB, delete old file on replace)
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG, and WebP images are allowed.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Avatar file size must be 2MB or less.');
      return;
    }

    setAvatarUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user.id;
      if (!userId) throw new Error('Not authenticated');

      // Delete existing avatar file if one was stored in avatars bucket
      if (avatarUrl && avatarUrl.includes('/storage/v1/object/public/avatars/')) {
        const oldPath = avatarUrl.split('/public/avatars/')[1];
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath]);
        }
      }

      // Upload new avatar file with timestamp
      const fileExt = file.name.split('.').pop() || 'png';
      const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const newUrl = publicData.publicUrl;

      setAvatarUrl(newUrl);

      // Save directly to profile
      await supabase
        .from('profiles')
        .update({ avatar_url: newUrl, updated_at: new Date().toISOString() })
        .eq('id', userId);

      toast.success('Avatar updated successfully!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload avatar.');
    } finally {
      setAvatarUploading(false);
    }
  }

  // 2. Save Profile Details
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          display_name: displayName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (error) throw error;
      toast.success('Profile details saved.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  }

  // 3. Security: Change Password (re-auth + HIBP check)
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please enter both your current and new password.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    const analysis = evaluatePassword(newPassword);
    if (!analysis.isValid) {
      toast.error('New password must be at least 10 characters and satisfy strength requirements.');
      return;
    }

    setPasswordSaving(true);

    try {
      // 1. Re-authenticate with current password
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('Session not found.');

      const { error: reauthErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (reauthErr) {
        toast.error('Incorrect current password.');
        setPasswordSaving(false);
        return;
      }

      // 2. Check HIBP
      const pwnedRes = await fetch('/api/auth/check-pwned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      const pwnedData = await pwnedRes.json();
      if (pwnedData.breached) {
        toast.error('This password appeared in a data breach. Please choose a different password.');
        setPasswordSaving(false);
        return;
      }

      // 3. Update password
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
      if (updateErr) throw updateErr;

      toast.success('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  }

  // 4. Security: 2FA TOTP Enrollment
  async function start2FAEnrollment() {
    setEnrolling2FA(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Wefik World Authenticator',
      });

      if (error || !data) throw error || new Error('Failed to start 2FA setup');

      setMfaFactorId(data.id);
      setQrCodeSvg(data.totp.qr_code);
      setSecretKey(data.totp.secret);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Could not initiate 2FA enrollment.');
      setEnrolling2FA(false);
    }
  }

  async function verifyAndActivate2FA(e: React.FormEvent) {
    e.preventDefault();
    if (!mfaFactorId || enrollTotpCode.length !== 6) return;

    try {
      const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId,
      });

      if (challengeErr || !challenge) throw challengeErr || new Error('Challenge failed');

      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challenge.id,
        code: enrollTotpCode.trim(),
      });

      if (verifyErr) {
        toast.error('Invalid code. Please check your authenticator app.');
        return;
      }

      setHasMfa(true);
      setEnrolling2FA(false);
      setQrCodeSvg(null);
      setSecretKey(null);
      setEnrollTotpCode('');
      toast.success('Two-Factor Authentication is now enabled!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Verification failed.');
    }
  }

  // 5. Security: Disable 2FA (requires current password + TOTP)
  async function handleDisable2FA(e: React.FormEvent) {
    e.preventDefault();
    if (!mfaFactorId || !disablePassword || disableTotpCode.length !== 6) {
      toast.error('Please enter your password and current 6-digit TOTP code.');
      return;
    }

    try {
      // Re-verify password
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('Not authenticated');

      const { error: reauthErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: disablePassword,
      });

      if (reauthErr) {
        toast.error('Incorrect password.');
        return;
      }

      // Verify challenge with current code
      const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId,
      });

      if (challengeErr || !challenge) throw challengeErr;

      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challenge.id,
        code: disableTotpCode.trim(),
      });

      if (verifyErr) {
        toast.error('Invalid authenticator code.');
        return;
      }

      // Unenroll
      await supabase.auth.mfa.unenroll({ factorId: mfaFactorId });

      setHasMfa(false);
      setMfaFactorId(null);
      setDisabling2FA(false);
      setDisablePassword('');
      setDisableTotpCode('');
      toast.success('Two-factor authentication has been disabled.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to disable 2FA.');
    }
  }

  // 6. Security: Recovery Email OTP Flow
  async function handleRequestRecoveryOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!newRecoveryEmail) return;

    setRecoveryLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await requestRecoveryEmailOtp(newRecoveryEmail, session.access_token);
      if (!res.ok) {
        toast.error(res.error || 'Failed to request code.');
      } else {
        toast.info(res.message);
        setRecoveryOtpStep(true);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to request recovery OTP.');
    } finally {
      setRecoveryLoading(false);
    }
  }

  async function handleVerifyRecoveryOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!recoveryOtpCode) return;

    setRecoveryLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await verifyRecoveryEmailOtp(newRecoveryEmail, recoveryOtpCode, session.access_token);
      if (!res.ok) {
        toast.error(res.error || 'Invalid code.');
      } else {
        toast.success(res.message);
        setRecoveryEmail(newRecoveryEmail);
        setRecoveryVerified(true);
        setRecoveryOtpStep(false);
        setNewRecoveryEmail('');
        setRecoveryOtpCode('');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to verify recovery OTP.');
    } finally {
      setRecoveryLoading(false);
    }
  }

  async function handleRemoveRecoveryEmail() {
    if (!confirm('Remove your recovery email? You will not be able to reset 2FA if you lose your authenticator.')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await removeRecoveryEmail(session.access_token);
      if (res.ok) {
        setRecoveryEmail('');
        setRecoveryVerified(false);
        toast.success('Recovery email removed.');
      } else {
        toast.error(res.error || 'Failed to remove recovery email.');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove recovery email.');
    }
  }

  // 7. Security: Sign Out All Other Devices
  async function handleSignOutOtherDevices() {
    setSessionLoading(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'others' });
      if (error) throw error;
      toast.success('Signed out of all other active sessions.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to sign out other sessions.');
    } finally {
      setSessionLoading(false);
    }
  }

  // 8. Danger Zone: Delete Account
  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!deleteEmailConfirm) return;

    setDeleteLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await deleteUserAccount(deleteEmailConfirm, session.access_token);
      if (!res.ok) {
        toast.error(res.error || 'Could not delete account.');
        setDeleteLoading(false);
      } else {
        toast.success('Your account has been deleted.');
        await supabase.auth.signOut();
        router.push('/');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An error occurred during account deletion.');
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold font-display text-[var(--text)]">Profile &amp; Security Settings</h2>
        <p className="text-xs sm:text-sm text-slate mt-0.5">
          Manage your identity, notification preferences, two-factor authentication, and account sessions.
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="bg-[var(--surface-2)] p-1 rounded-xl border border-[var(--border)] mb-6">
          <TabsTrigger value="profile" className="text-xs gap-1.5 data-[state=active]:bg-[var(--surface)]">
            <User className="w-3.5 h-3.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs gap-1.5 data-[state=active]:bg-[var(--surface)]">
            <Bell className="w-3.5 h-3.5" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs gap-1.5 data-[state=active]:bg-[var(--surface)]">
            <Shield className="w-3.5 h-3.5" />
            Security &amp; 2FA
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PROFILE */}
        <TabsContent value="profile" className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-6">
            <h3 className="text-base font-bold text-[var(--text)] font-display">Personal Identity</h3>

            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-6 border-b border-[var(--border)]">
              <Avatar className="w-20 h-20 border-2 border-[var(--border)]">
                <AvatarImage src={avatarUrl} className="object-cover" />
                <AvatarFallback className="bg-ink text-white text-lg font-bold">
                  {displayName.charAt(0).toUpperCase() || initialProfile.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={avatarUploading}
                      className="border-[var(--border)] text-xs pointer-events-none"
                    >
                      {avatarUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Upload className="w-3.5 h-3.5 mr-1.5" />}
                      Upload New Avatar
                    </Button>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <p className="text-[11px] text-slate">
                  Square image recommended. Max file size: 2MB (JPG, PNG, or WebP). Replaces previous avatar.
                </p>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate">Primary Email (Account ID)</label>
                <Input
                  type="email"
                  value={initialProfile.email}
                  disabled
                  className="bg-[var(--surface-2)] border-[var(--border)] text-slate cursor-not-allowed text-xs"
                />
                <span className="text-[10px] text-slate">To modify your primary account email, see the Security tab.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate">Display Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Alex"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-[var(--surface-2)] border-[var(--border)] text-xs text-[var(--text)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate">Full Name (for Tax Invoices)</label>
                <Input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-[var(--surface-2)] border-[var(--border)] text-xs text-[var(--text)]"
                />
              </div>

              <Button
                type="submit"
                disabled={profileSaving}
                className="bg-deep-green text-white hover:bg-deep-green/90 text-xs font-semibold"
              >
                {profileSaving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                Save Changes
              </Button>
            </form>
          </div>
        </TabsContent>

        {/* TAB 2: NOTIFICATIONS */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-[var(--text)] font-display">Communication Preferences</h3>
              <p className="text-xs text-slate mt-0.5">Control which product and community emails you receive.</p>
            </div>

            {/* Permanent Security Alert Box */}
            <div className="p-4 rounded-2xl bg-deep-green/5 border border-deep-green/20 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-deep-green shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-[var(--text)]">Security Alerts Are Always On</h5>
                <p className="text-[11px] text-slate mt-0.5 leading-relaxed">
                  For your protection, critical account notifications (password modifications, 2FA status changes, recovery email updates, and new device logins) cannot be disabled.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text)]">Product Release Changelogs</h4>
                  <p className="text-[11px] text-slate">Get notified when new versions of your purchased themes or plugins release.</p>
                </div>
                <input
                  type="checkbox"
                  checked={productUpdates}
                  onChange={(e) => setProductUpdates(e.target.checked)}
                  className="w-4 h-4 accent-deep-green cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text)]">The Wefik Journal Newsletter</h4>
                  <p className="text-[11px] text-slate">Bi-weekly engineering essays on WordPress Full-Site Editing, Web Performance, and Next.js.</p>
                </div>
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                  className="w-4 h-4 accent-deep-green cursor-pointer"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: SECURITY & 2FA */}
        <TabsContent value="security" className="space-y-6">
          {/* Two-Factor Authentication (TOTP) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
              <div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-deep-green" />
                  <h3 className="text-base font-bold text-[var(--text)] font-display">Two-Factor Authentication (2FA)</h3>
                </div>
                <p className="text-xs text-slate mt-0.5">
                  Protect your account with a time-based one-time password (TOTP) from an authenticator app.
                </p>
              </div>

              <div>
                {hasMfa ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-deep-green/10 text-deep-green border border-deep-green/20">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Enabled (TOTP)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    <AlertTriangle className="w-3.5 h-3.5" /> Disabled
                  </span>
                )}
              </div>
            </div>

            {!hasMfa && !enrolling2FA && (
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-xs text-slate max-w-lg">
                  Use Google Authenticator, 1Password, Authy, or Bitwarden to generate secure 6-digit codes.
                </p>
                <Button
                  size="sm"
                  onClick={start2FAEnrollment}
                  className="bg-deep-green text-white hover:bg-deep-green/90 text-xs font-semibold shrink-0"
                >
                  Set up 2FA
                </Button>
              </div>
            )}

            {/* 2FA Enrollment Wizard */}
            {enrolling2FA && qrCodeSvg && (
              <div className="p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-4 animate-in fade-in-50">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* QR Code Container (white background required for mobile camera contrast) */}
                  <div
                    style={{ backgroundColor: '#ffffff' }}
                    className="p-3 rounded-xl shadow-xs shrink-0 border border-[var(--border)]"
                  >
                    <div
                      dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                      className="w-40 h-40 flex items-center justify-center"
                    />
                  </div>

                  <div className="space-y-3 min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-[var(--text)]">Scan QR Code</h4>
                    <p className="text-xs text-slate leading-relaxed">
                      1. Scan this QR code using your authenticator app (Google Authenticator, Authy, etc.).
                    </p>
                    <p className="text-xs text-slate leading-relaxed">
                      2. Or enter the secret key manually if scanning isn&apos;t available:
                    </p>
                    {secretKey && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] font-mono text-xs text-[var(--text)]">
                        <span className="truncate select-all">{secretKey}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(secretKey);
                            setCopiedSecret(true);
                            setTimeout(() => setCopiedSecret(false), 2000);
                          }}
                          className="p-1 hover:text-deep-green shrink-0"
                        >
                          {copiedSecret ? <Check className="w-3.5 h-3.5 text-deep-green" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-deep-green/5 border border-deep-green/20 text-[11px] text-deep-green">
                  ℹ️ Note: If you lose your phone or authenticator app, your verified recovery email can be used to reset 2FA.
                </div>

                {/* Verification Code Form */}
                <form onSubmit={verifyAndActivate2FA} className="flex flex-col sm:flex-row items-end gap-3 pt-2">
                  <div className="w-full sm:w-64 space-y-1">
                    <label className="text-xs font-semibold text-slate">Enter 6-digit code</label>
                    <Input
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      value={enrollTotpCode}
                      onChange={(e) => setEnrollTotpCode(e.target.value.replace(/\D/g, ''))}
                      className="text-center font-mono text-lg tracking-widest bg-[var(--surface)] border-[var(--border)]"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      type="submit"
                      disabled={enrollTotpCode.length !== 6}
                      className="bg-deep-green text-white hover:bg-deep-green/90 text-xs font-semibold flex-1 sm:flex-initial"
                    >
                      Verify &amp; Enable
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setEnrolling2FA(false)}
                      className="text-xs text-slate hover:text-[var(--text)]"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Disable 2FA Section */}
            {hasMfa && !disabling2FA && (
              <div className="pt-2 flex justify-between items-center">
                <p className="text-xs text-slate">
                  Two-factor authentication is active on all logins from new sessions.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDisabling2FA(true)}
                  className="text-xs border-[var(--border)] text-red-500 hover:bg-red-500/10"
                >
                  Disable 2FA
                </Button>
              </div>
            )}

            {hasMfa && disabling2FA && (
              <form onSubmit={handleDisable2FA} className="p-4 rounded-xl bg-[var(--surface-2)] border border-red-500/20 space-y-3">
                <h5 className="text-xs font-bold text-red-500">Confirm Disabling 2FA</h5>
                <p className="text-[11px] text-slate">
                  Enter your current account password and current 6-digit TOTP code to confirm disabling.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    type="password"
                    placeholder="Current account password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    required
                    className="text-xs bg-[var(--surface)] border-[var(--border)]"
                  />
                  <Input
                    type="text"
                    placeholder="6-digit TOTP code"
                    maxLength={6}
                    value={disableTotpCode}
                    onChange={(e) => setDisableTotpCode(e.target.value.replace(/\D/g, ''))}
                    required
                    className="text-xs text-center font-mono tracking-widest bg-[var(--surface)] border-[var(--border)]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs">
                    Confirm Disable
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setDisabling2FA(false)} className="text-xs">
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Recovery Email Management */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2">
              <Mail className="w-5 h-5 text-deep-green" />
              <h3 className="text-base font-bold text-[var(--text)] font-display">Secondary Recovery Email</h3>
            </div>
            <p className="text-xs text-slate leading-relaxed max-w-xl">
              Used exclusively to reset your password if you lose primary email access, or to reset 2FA if you lose your authenticator device.
            </p>

            {recoveryVerified && recoveryEmail ? (
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-deep-green" />
                  <span className="font-mono text-xs font-semibold text-[var(--text)]">{recoveryEmail}</span>
                  <span className="text-[10px] text-deep-green font-bold bg-deep-green/10 px-2 py-0.5 rounded-full">Verified</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveRecoveryEmail}
                  className="text-xs text-red-500 hover:bg-red-500/10 self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {!recoveryOtpStep ? (
                  <form onSubmit={handleRequestRecoveryOtp} className="flex flex-col sm:flex-row items-end gap-3 max-w-lg">
                    <div className="space-y-1.5 w-full">
                      <label className="text-xs font-semibold text-slate">New Recovery Email</label>
                      <Input
                        type="email"
                        placeholder="secondary@example.com"
                        value={newRecoveryEmail}
                        onChange={(e) => setNewRecoveryEmail(e.target.value)}
                        required
                        className="bg-[var(--surface-2)] border-[var(--border)] text-xs text-[var(--text)]"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={recoveryLoading || !newRecoveryEmail}
                      className="bg-deep-green text-white hover:bg-deep-green/90 text-xs font-semibold shrink-0"
                    >
                      {recoveryLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                      Send Verification Code
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyRecoveryOtp} className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-3 max-w-md">
                    <p className="text-xs text-slate">
                      Enter the 6-digit code dispatched to <strong>{newRecoveryEmail}</strong>:
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        value={recoveryOtpCode}
                        onChange={(e) => setRecoveryOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="text-center font-mono tracking-widest text-base bg-[var(--surface)] border-[var(--border)]"
                        autoFocus
                      />
                      <Button
                        type="submit"
                        disabled={recoveryLoading || recoveryOtpCode.length !== 6}
                        className="bg-deep-green text-white hover:bg-deep-green/90 text-xs font-semibold shrink-0"
                      >
                        {recoveryLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                        Verify &amp; Save
                      </Button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRecoveryOtpStep(false)}
                      className="text-[11px] text-slate hover:text-[var(--text)] underline"
                    >
                      Use a different email
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Password Change Form */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2">
              <KeyRound className="w-5 h-5 text-deep-green" />
              <h3 className="text-base font-bold text-[var(--text)] font-display">Change Account Password</h3>
            </div>
            <p className="text-xs text-slate leading-relaxed">
              Requires re-authenticating with your current password. Checked against Have I Been Pwned breach records.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate">Current Password</label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="bg-[var(--surface-2)] border-[var(--border)] text-xs text-[var(--text)]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate">New Password (min 10 characters)</label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="bg-[var(--surface-2)] border-[var(--border)] text-xs text-[var(--text)]"
                />
                <PasswordStrengthMeter password={newPassword} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  className="bg-[var(--surface-2)] border-[var(--border)] text-xs text-[var(--text)]"
                />
              </div>

              <Button
                type="submit"
                disabled={passwordSaving}
                className="bg-deep-green text-white hover:bg-deep-green/90 text-xs font-semibold"
              >
                {passwordSaving && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                Update Password
              </Button>
            </form>
          </div>

          {/* Active Sessions & Devices */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="text-base font-bold text-[var(--text)] font-display">Active Sessions</h3>
                <p className="text-xs text-slate mt-0.5">Manage devices signed in to your account.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOutOtherDevices}
                disabled={sessionLoading}
                className="text-xs border-[var(--border)]"
              >
                {sessionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                Sign Out Other Devices
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-deep-green" />
                  <span className="text-xs font-bold text-[var(--text)]">Current Session</span>
                </div>
                <p className="text-[11px] font-mono text-slate truncate max-w-md mt-1">
                  {userAgent || 'Desktop Browser'}
                </p>
              </div>
              <span className="text-[11px] font-medium text-deep-green">Active Now</span>
            </div>
          </div>

          {/* Danger Zone: Delete Account */}
          <div className="p-6 sm:p-8 rounded-3xl bg-red-500/5 border border-red-500/20 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold font-display">Danger Zone: Delete Account</h3>
            </div>
            <p className="text-xs text-slate leading-relaxed max-w-xl">
              Permanently delete your profile and account credentials. Active subscriptions must be cancelled first. Financial order records are retained in anonymized form for mandatory tax and accounting compliance.
            </p>

            {!showDeleteConfirm ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-red-500 border-red-500/30 hover:bg-red-500/10"
              >
                Delete My Account
              </Button>
            ) : (
              <form onSubmit={handleDeleteAccount} className="p-4 rounded-xl bg-[var(--surface)] border border-red-500/30 space-y-3 max-w-md">
                <p className="text-xs text-[var(--text)] font-semibold">
                  Type your account email (<code>{initialProfile.email}</code>) to confirm:
                </p>
                <Input
                  type="email"
                  placeholder={initialProfile.email}
                  value={deleteEmailConfirm}
                  onChange={(e) => setDeleteEmailConfirm(e.target.value)}
                  required
                  className="text-xs bg-[var(--surface-2)] border-[var(--border)]"
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={deleteLoading || deleteEmailConfirm.toLowerCase() !== initialProfile.email.toLowerCase()}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                  >
                    {deleteLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                    Permanently Delete
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteEmailConfirm('');
                    }}
                    className="text-xs text-slate"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
