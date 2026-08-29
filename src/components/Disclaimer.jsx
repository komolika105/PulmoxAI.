import { ShieldAlert } from "lucide-react";

export function Disclaimer({ compact = false }) {
  if (compact) {
    return (
      <p className="text-xs text-slate-500 leading-relaxed">
        <strong className="font-medium text-slate-600">AI-assisted result</strong> — not a substitute for professional medical diagnosis.
      </p>
    );
  }
  return (
    <div
      className="flex items-start gap-3 rounded-xl border px-4 py-3"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface-alt)" }}
    >
      <ShieldAlert size={18} className="mt-0.5 shrink-0" style={{ color: "var(--color-amber)" }} />
      <p className="text-sm leading-relaxed" style={{ color: "var(--color-navy-soft)" }}>
        <strong style={{ color: "var(--color-navy)" }}>AI-assisted analysis</strong> — this result is not a
        medical diagnosis. Always consult a qualified healthcare professional about your health.
      </p>
    </div>
  );
}

export function DemoModeBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide"
      style={{ borderColor: "#F3D48A", backgroundColor: "#FDF6E5", color: "var(--color-amber)" }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--color-amber)" }} />
      Demo Mode
    </span>
  );
}

export default Disclaimer;
