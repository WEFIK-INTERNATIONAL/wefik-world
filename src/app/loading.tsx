export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-3 border-border border-t-lime rounded-full animate-spin" />
      <p className="text-xs text-slate font-medium uppercase tracking-wider">
        Loading wefik.world...
      </p>
    </div>
  );
}
