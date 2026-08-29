import { CheckCircle2, Loader2 } from "lucide-react";

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-slate-100 ${className}`} />;
}

export function AnalyzingState({ stages, activeIndex }) {
  return (
    <div className="rounded-2xl border bg-white p-8" style={{ borderColor: "var(--color-border)" }}>
      <div className="flex items-center gap-3 mb-6">
        <Loader2 size={20} className="animate-spin" style={{ color: "var(--color-indigo)" }} />
        <p className="font-display text-lg font-semibold" style={{ color: "var(--color-navy)" }}>Analyzing X-ray...</p>
      </div>
      <ol className="space-y-3">
        {stages.map((stage, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          return (
            <li key={stage.key} className="flex items-center gap-3">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium"
                style={{
                  borderColor: done || active ? "var(--color-indigo)" : "var(--color-border)",
                  backgroundColor: done ? "var(--color-indigo)" : "transparent",
                  color: done ? "white" : active ? "var(--color-indigo)" : "var(--color-navy-soft)",
                }}
              >
                {done ? <CheckCircle2 size={14} /> : i + 1}
              </span>
              <span
                className={`text-sm ${active ? "font-medium" : ""}`}
                style={{ color: done || active ? "var(--color-navy)" : "var(--color-navy-soft)" }}
              >
                {stage.label}
              </span>
              {active && <Loader2 size={14} className="animate-spin ml-1" style={{ color: "var(--color-indigo)" }} />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed bg-slate-50/60 p-10 text-center" style={{ borderColor: "var(--color-border)" }}>
      {Icon && (
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white border" style={{ borderColor: "var(--color-border)", color: "var(--color-navy-soft)" }}>
          <Icon size={20} />
        </span>
      )}
      <p className="font-display text-base font-semibold" style={{ color: "var(--color-navy)" }}>{title}</p>
      {description && <p className="mt-1.5 text-sm" style={{ color: "var(--color-navy-soft)" }}>{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Unable to connect to the analysis server.", description, onRetry }) {
  return (
    <div className="rounded-2xl border p-8 text-center" style={{ borderColor: "#F3C6CE", backgroundColor: "#FDF4F5" }}>
      <p className="font-display text-base font-semibold" style={{ color: "var(--color-rose)" }}>{title}</p>
      {description && <p className="mt-1.5 text-sm" style={{ color: "var(--color-navy-soft)" }}>{description}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 rounded-lg px-4 py-2 text-sm font-medium text-white"
          style={{ backgroundColor: "var(--color-indigo)" }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
