'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Technical Support');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please complete all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, category, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message.');
      }

      toast.success(data.message || 'Message sent successfully!');
      setSubmitted(true);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Error sending message.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-deep-green/10 text-deep-green flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[var(--text)]">Message Delivered</h3>
        <p className="text-xs text-[var(--muted)] max-w-sm mx-auto leading-relaxed">
          Thank you for reaching out to Wefik World. A member of our engineering team will review your message and reply to{' '}
          <strong className="text-[var(--text)]">{email}</strong> within 1 business day.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setSubmitted(false);
            setMessage('');
            setSubject('');
          }}
          className="text-xs rounded-xl mt-2"
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="contact-name" className="text-xs font-semibold text-[var(--text)]">
            Your Name <span className="text-rose-500">*</span>
          </label>
          <Input
            id="contact-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Rivera"
            className="h-10 text-xs rounded-xl bg-[var(--surface-2)]"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-email" className="text-xs font-semibold text-[var(--text)]">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <Input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@example.com"
            className="h-10 text-xs rounded-xl bg-[var(--surface-2)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="contact-category" className="text-xs font-semibold text-[var(--text)]">
            Inquiry Category
          </label>
          <select
            id="contact-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full h-10 px-3 text-xs rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-deep-green"
          >
            <option value="Technical Support">Technical Support</option>
            <option value="Pre-sale Question">Pre-sale Question</option>
            <option value="Commercial Licensing">Commercial Licensing</option>
            <option value="Custom Agency Development">Custom Agency Development (via wefik.in)</option>
            <option value="Account & Billing">Account & Billing</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="contact-subject" className="text-xs font-semibold text-[var(--text)]">
            Subject
          </label>
          <Input
            id="contact-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Question regarding theme deployment"
            className="h-10 text-xs rounded-xl bg-[var(--surface-2)]"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="contact-message" className="text-xs font-semibold text-[var(--text)]">
          Message <span className="text-rose-500">*</span>
        </label>
        <Textarea
          id="contact-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Please describe how our team can help you..."
          className="text-xs rounded-xl bg-[var(--surface-2)] resize-none"
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto h-11 px-8 rounded-xl bg-ink dark:bg-white text-white dark:text-ink hover:bg-black dark:hover:bg-slate-100 font-semibold text-xs flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>Send Message to Support</span>
        </Button>
      </div>
    </form>
  );
}
