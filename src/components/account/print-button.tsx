'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.print()}
      className="text-xs border-[var(--border)] text-[var(--text)]"
    >
      <Printer className="w-3.5 h-3.5 mr-1.5" />
      Print / Save as PDF
    </Button>
  );
}
