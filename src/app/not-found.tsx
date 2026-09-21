import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <span className="text-xs font-semibold uppercase tracking-wider text-lime-dark bg-lime/20 px-3 py-1 rounded-full border border-lime/30 mb-4">
        404 — Page Not Found
      </span>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-ink tracking-tight mb-3">
        Lost in digital space?
      </h1>
      <p className="text-slate max-w-md text-base mb-8">
        The page or product you were looking for doesn&apos;t exist, was moved, or
        has been archived.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-ink text-white font-medium hover:bg-black transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/marketplace"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-surface border border-border text-ink font-medium hover:bg-slate-100 transition-colors"
        >
          Explore Marketplace
        </Link>
      </div>
    </main>
  );
}
