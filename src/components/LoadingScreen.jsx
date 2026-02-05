export default function LoadingScreen({ show = false, message = "Just a moment…", subtext = "" }) {
  if (!show) return null;

  return (
    <div
      className="loading-overlay fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loading-orbit" aria-hidden>
        <span className="orbit-ring orbit-ring--primary" />
        <span className="orbit-ring orbit-ring--accent" />
        <span className="orbit-dot orbit-dot--primary" />
        <span className="orbit-dot orbit-dot--accent" />
      </div>
      <div className="space-y-1 text-center">
        <p className="text-base font-semibold text-text">{message}</p>
        <p className="text-sm text-text-muted">
          {subtext || "Bringing in nearby events and suggestions."}
        </p>
      </div>
    </div>
  );
}
