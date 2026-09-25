'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, ArrowRight, Sparkles } from 'lucide-react';

interface OnboardingChecklistProps {
  emailConfirmed: boolean;
  profileCompleted: boolean;
  mfaEnabled: boolean;
}

export function OnboardingChecklist({
  emailConfirmed,
  profileCompleted,
  mfaEnabled,
}: OnboardingChecklistProps) {
  const tasks = [
    {
      id: 'email',
      title: 'Verify primary email address',
      description: 'Ensures account recovery and purchase receipts.',
      completed: emailConfirmed,
      href: emailConfirmed ? undefined : '/login',
    },
    {
      id: 'profile',
      title: 'Complete your profile & avatar',
      description: 'Set your public display name and developer avatar.',
      completed: profileCompleted,
      href: '/account/settings',
    },
    {
      id: 'mfa',
      title: 'Enable Two-Factor Authentication (2FA)',
      description: 'Protect your commercial licenses with a TOTP authenticator app.',
      completed: mfaEnabled,
      href: '/account/settings?tab=security',
    },
    {
      id: 'marketplace',
      title: 'Explore themes & free tools',
      description: 'Browse production-ready WordPress themes and Next.js starters.',
      completed: false,
      href: '/marketplace',
    },
  ];

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  if (completedCount === tasks.length) {
    return null;
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-deep-green" />
            <h3 className="text-sm sm:text-base font-bold text-[var(--text)] font-display">Getting Started Checklist</h3>
          </div>
          <p className="text-xs text-slate mt-0.5">
            Complete your onboarding steps to maximize account security and unlock your workflow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 sm:w-32 h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
            <div
              className="h-full bg-deep-green transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-[var(--text)]">{progressPercent}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
              task.completed
                ? 'bg-deep-green/5 border-deep-green/20 text-slate'
                : 'bg-[var(--surface-2)] border-[var(--border)] hover:border-deep-green/40'
            }`}
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-deep-green shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-5 h-5 text-slate shrink-0 mt-0.5" />
            )}
            <div className="min-w-0 flex-1">
              <p
                className={`text-xs font-bold leading-snug ${
                  task.completed ? 'text-[var(--text)] line-through opacity-80' : 'text-[var(--text)]'
                }`}
              >
                {task.title}
              </p>
              <p className="text-[11px] text-slate mt-0.5 leading-relaxed">{task.description}</p>
              {!task.completed && task.href && (
                <Link
                  href={task.href}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-deep-green hover:underline mt-2"
                >
                  Complete step <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
