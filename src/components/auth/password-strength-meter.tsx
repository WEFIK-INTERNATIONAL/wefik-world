'use client';

import React from 'react';
import { evaluatePassword } from '@/lib/security/password-strength';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) return null;

  const analysis = evaluatePassword(password);

  return (
    <div className="space-y-2 mt-2">
      {/* 4 Segment Progress Bar */}
      <div className="flex gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4].map((step) => {
          const isFilled = analysis.score >= step;
          return (
            <div
              key={step}
              className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                isFilled
                  ? analysis.score === 1
                    ? 'bg-red-500'
                    : analysis.score === 2
                    ? 'bg-amber-500'
                    : analysis.score === 3
                    ? 'bg-lime'
                    : 'bg-deep-green'
                  : 'bg-[var(--border)]'
              }`}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate">Strength:</span>
        <span
          className={`font-semibold ${
            analysis.score <= 1
              ? 'text-red-500'
              : analysis.score === 2
              ? 'text-amber-500'
              : analysis.score === 3
              ? 'text-deep-green'
              : 'text-deep-green font-bold'
          }`}
        >
          {analysis.label}
        </span>
      </div>

      {/* Checklist of rules */}
      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate pt-1">
        <div className="flex items-center gap-1">
          {analysis.requirements.minChars ? (
            <Check className="w-3 h-3 text-deep-green shrink-0" />
          ) : (
            <X className="w-3 h-3 text-red-400 shrink-0" />
          )}
          <span>Min 10 characters</span>
        </div>
        <div className="flex items-center gap-1">
          {analysis.requirements.hasUpper && analysis.requirements.hasLower ? (
            <Check className="w-3 h-3 text-deep-green shrink-0" />
          ) : (
            <X className="w-3 h-3 text-red-400 shrink-0" />
          )}
          <span>Upper & lowercase</span>
        </div>
        <div className="flex items-center gap-1">
          {analysis.requirements.hasNumber ? (
            <Check className="w-3 h-3 text-deep-green shrink-0" />
          ) : (
            <X className="w-3 h-3 text-red-400 shrink-0" />
          )}
          <span>At least 1 number</span>
        </div>
        <div className="flex items-center gap-1">
          {analysis.requirements.hasSpecial ? (
            <Check className="w-3 h-3 text-deep-green shrink-0" />
          ) : (
            <X className="w-3 h-3 text-red-400 shrink-0" />
          )}
          <span>Special character</span>
        </div>
      </div>
    </div>
  );
}
