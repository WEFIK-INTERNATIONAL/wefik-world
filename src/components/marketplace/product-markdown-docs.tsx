'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy, AlertCircle } from 'lucide-react';

interface ProductMarkdownDocsProps {
  content: string;
}

function flattenText(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(flattenText).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return flattenText(node.props.children);
  }
  return '';
}

function extractLanguage(children: React.ReactNode): string {
  if (React.isValidElement<{ className?: string }>(children)) {
    const cls = children.props.className || '';
    const match = cls.match(/language-([\w-]+)/);
    if (match?.[1]) return match[1];
  }
  return 'code';
}

function fallbackCopyText(text: string): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const language = extractLanguage(children);
  const rawText = flattenText(children).replace(/\n$/, '');

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(rawText);
        setCopyStatus('copied');
      } else if (fallbackCopyText(rawText)) {
        setCopyStatus('copied');
      } else {
        setCopyStatus('error');
      }
    } catch {
      setCopyStatus(fallbackCopyText(rawText) ? 'copied' : 'error');
    }
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-2)]">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--surface)] border-b border-[var(--border)] text-xs text-[var(--text-secondary)] font-mono">
        <span>{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={
            copyStatus === 'copied'
              ? 'Code copied'
              : copyStatus === 'error'
              ? 'Failed to copy code'
              : 'Copy code to clipboard'
          }
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium bg-[var(--surface-2)] hover:bg-[var(--border)] text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          {copyStatus === 'copied' ? (
            <>
              <Check className="w-3.5 h-3.5 text-deep-green dark:text-lime" />
              <span>Copied</span>
            </>
          ) : copyStatus === 'error' ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-error" />
              <span>Failed</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs font-mono text-[var(--text-primary)] leading-relaxed [&_code]:bg-transparent [&_code]:p-0 [&_code]:border-0 [&_code]:rounded-none [&_code]:text-xs">
        {children}
      </pre>
    </div>
  );
}

export function ProductMarkdownDocs({ content }: ProductMarkdownDocsProps) {
  if (!content) return null;

  return (
    <div className="markdown-docs space-y-4 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-bold font-display text-[var(--text-primary)] pt-4 pb-2 border-b border-[var(--border)]">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg sm:text-xl font-bold font-display text-[var(--text-primary)] pt-3 pb-1 border-b border-[var(--border)]">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base sm:text-lg font-bold font-display text-[var(--text-primary)] pt-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm sm:text-base font-semibold text-[var(--text-primary)] pt-1">
              {children}
            </h4>
          ),
          p: ({ children }) => <p className="leading-relaxed mb-3">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1.5 pl-2 mb-4 text-[var(--text-secondary)]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1.5 pl-2 mb-4 text-[var(--text-secondary)]">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--text-primary)]">{children}</strong>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-deep-green dark:text-lime underline font-medium hover:opacity-80"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-lime pl-4 py-1 my-3 italic bg-[var(--surface-2)] rounded-r-lg text-[var(--text-primary)]">
              {children}
            </blockquote>
          ),
          img: ({ src, alt, ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={alt || ''}
              loading="lazy"
              className="max-w-full h-auto rounded-xl border border-[var(--border)] my-2"
              {...props}
            />
          ),
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          code: ({ className, children, ...props }) => (
            <code
              className={`px-1.5 py-0.5 rounded-md bg-[var(--surface-2)] text-[var(--text-primary)] font-mono text-[11px] border border-[var(--border)] ${
                className || ''
              }`.trim()}
              {...props}
            >
              {children}
            </code>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-xl border border-[var(--border)]">
              <table className="w-full text-left text-xs border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[var(--surface-2)] border-b border-[var(--border)] font-semibold text-[var(--text-primary)]">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-[var(--border)]">{children}</tbody>
          ),
          th: ({ children }) => <th className="p-3 font-bold">{children}</th>,
          td: ({ children }) => <td className="p-3 text-[var(--text-secondary)]">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
