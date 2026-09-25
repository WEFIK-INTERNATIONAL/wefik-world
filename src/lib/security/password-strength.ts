/**
 * src/lib/security/password-strength.ts
 * Rule-based password strength analyzer with zero external dependencies.
 * Enforces minimum 10 characters and assesses character diversity.
 */

export interface PasswordAnalysis {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Too short' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  isValid: boolean;
  requirements: {
    minChars: boolean;
    hasLower: boolean;
    hasUpper: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function evaluatePassword(password: string): PasswordAnalysis {
  const minChars = password.length >= 10;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const passedCriteria = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  if (!minChars) {
    return {
      score: 0,
      label: 'Too short',
      color: 'bg-red-500',
      isValid: false,
      requirements: { minChars, hasLower, hasUpper, hasNumber, hasSpecial },
    };
  }

  if (passedCriteria <= 1) {
    return {
      score: 1,
      label: 'Weak',
      color: 'bg-red-500',
      isValid: false,
      requirements: { minChars, hasLower, hasUpper, hasNumber, hasSpecial },
    };
  }

  if (passedCriteria === 2) {
    return {
      score: 2,
      label: 'Fair',
      color: 'bg-amber-500',
      isValid: true,
      requirements: { minChars, hasLower, hasUpper, hasNumber, hasSpecial },
    };
  }

  if (passedCriteria === 3) {
    return {
      score: 3,
      label: 'Good',
      color: 'bg-lime-500',
      isValid: true,
      requirements: { minChars, hasLower, hasUpper, hasNumber, hasSpecial },
    };
  }

  // 4 criteria + length >= 12 = Strong
  const isSuperStrong = password.length >= 12;
  return {
    score: 4,
    label: isSuperStrong ? 'Strong' : 'Good',
    color: 'bg-deep-green',
    isValid: true,
    requirements: { minChars, hasLower, hasUpper, hasNumber, hasSpecial },
  };
}
