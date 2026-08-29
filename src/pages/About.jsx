import PageHeader from "../components/PageHeader";
import { Disclaimer } from "../components/Disclaimer";

const STACK = ["React", "Tailwind CSS", "FastAPI", "PyTorch"];

export default function About() {
  return (
    <div>
      <PageHeader eyebrow="About" title="About PulmoXAI" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 space-y-8">
        <div className="rounded-2xl border bg-white p-6 max-w-3xl" style={{ borderColor: "var(--color-border)" }}>
          <p className="text-base leading-relaxed" style={{ color: "var(--color-navy-soft)" }}>
            <strong style={{ color: "var(--color-navy)" }}>PulmoXAI</strong> helps you understand a chest X-ray
            by scanning it with AI and explaining, in plain language and with a clear visual overlay, what the
            result means and which regions the analysis focused on.
          </p>
          <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--color-navy-soft)" }}>
            It's built to make AI-assisted image analysis approachable — not a black box, but something you
            can actually see and understand.
          </p>
        </div>

        <div>
          <p className="font-display text-lg font-semibold mb-4" style={{ color: "var(--color-navy)" }}>Built with</p>
          <div className="flex flex-wrap gap-2">
            {STACK.map((t) => (
              <span key={t} className="rounded-full border px-3.5 py-1.5 text-sm font-medium" style={{ borderColor: "var(--color-border)", color: "var(--color-navy)" }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        <Disclaimer />
      </div>
    </div>
  );
}
