import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <span className="text-xs font-semibold uppercase tracking-wider text-error bg-error/10 px-3 py-1 rounded-full border border-error/20 mb-4">
        403 — Access Denied
      </span>
      <h1 className="text-3xl sm:text-4xl font-bold text-ink tracking-tight mb-3">
        Administrator Privileges Required
      </h1>
      <p className="text-slate max-w-md text-sm mb-8">
        You do not have permission to access this area. If you believe this is an error, please contact the Wefik system administrator.
      </p>
      <div className="flex gap-3 justify-center">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-ink text-white font-medium hover:bg-black transition-colors"
        >
          Return Home
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-xl bg-surface border border-border text-ink font-medium hover:bg-slate-100 transition-colors"
        >
          My Dashboard
        </Link>
      </div>
    </main>
  );
}
