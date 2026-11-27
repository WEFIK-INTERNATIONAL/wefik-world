'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

const emptySubscribe = () => () => {};

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'segmented';
}

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

export function ThemeToggle({ className = '', variant = 'icon' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isDark = mounted && resolvedTheme === 'dark';

  if (variant === 'segmented') {
    const activeTheme = mounted ? theme || 'system' : 'system';
    return (
      <div
        role="radiogroup"
        aria-label="Theme preference"
        className={`inline-flex items-center p-0.5 rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--border)] ${className}`}
      >
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
          const active = activeTheme === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(value)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[calc(var(--radius-sm)-2px)] text-xs font-medium transition-colors cursor-pointer ${
                active
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={`relative inline-flex items-center justify-center w-10 h-10 rounded-[var(--radius-sm)] border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[var(--brand)] cursor-pointer ${className}`}
    >
      <Sun
        className={`w-4 h-4 transition-transform duration-300 ${
          isDark ? 'rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100'
        }`}
      />
      <Moon
        className={`w-4 h-4 transition-transform duration-300 ${
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0 absolute'
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
