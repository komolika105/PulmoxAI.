export default function PageHeader({ eyebrow, title, subtitle, children }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-6">
      {eyebrow && (
        <p className="font-mono text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-indigo)" }}>
          {eyebrow}
        </p>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight" style={{ color: "var(--color-navy)" }}>
            {title}
          </h1>
          {subtitle && <p className="mt-2 max-w-2xl text-base" style={{ color: "var(--color-navy-soft)" }}>{subtitle}</p>}
        </div>
        {children && <div className="flex shrink-0 gap-2">{children}</div>}
      </div>
    </div>
  );
}
