import { Link } from "react-router-dom";
import { ArrowRight, ScanLine, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";
import Disclaimer from "../components/Disclaimer";

function LungHero() {
  return (
    <div
      className="relative flex aspect-square w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl border mx-auto lg:mx-0"
      style={{ borderColor: "var(--color-border)", backgroundColor: "#0B1730" }}
    >
      <svg viewBox="0 0 320 320" className="h-full w-full opacity-90" aria-hidden="true">
        <defs>
          <linearGradient id="lungGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3654D6" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#3654D6" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <path
          d="M130 60c-20 0-34 22-38 52-4 30-2 70 6 98 6 20 16 34 28 34 10 0 14-14 14-40V90c0-18-4-30-10-30z"
          fill="url(#lungGrad)" stroke="#5B79E8" strokeWidth="1.5"
        />
        <path
          d="M190 60c20 0 34 22 38 52 4 30 2 70-6 98-6 20-16 34-28 34-10 0-14-14-14-40V90c0-18 4-30 10-30z"
          fill="url(#lungGrad)" stroke="#5B79E8" strokeWidth="1.5"
        />
        <rect x="153" y="70" width="14" height="170" rx="6" fill="#2A3A6B" />
        {Array.from({ length: 7 }).map((_, i) => (
          <path key={i} d={`M90 ${90 + i * 24} Q160 ${82 + i * 24} 230 ${90 + i * 24}`} stroke="#4A5B95" strokeWidth="1" fill="none" opacity="0.5" />
        ))}
      </svg>
      <div className="bg-gradient-to-b from-white/25 to-transparent scanline" />
      <div className="grid-backdrop absolute inset-0 opacity-30 mix-blend-overlay" />
      <span className="absolute bottom-4 left-4 font-mono text-[11px] text-white/60">real-time scan</span>
      <span className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur">
        <ScanLine size={12} /> scanning
      </span>
    </div>
  );
}

const HOW_IT_WORKS = [
  { icon: UploadCloud, title: "Upload your X-ray", body: "Add a chest X-ray image in seconds — JPG or PNG, no special setup." },
  { icon: ScanLine, title: "AI scans the image", body: "The image is analyzed and the lung region is automatically identified." },
  { icon: Sparkles, title: "Get a clear explanation", body: "See the result alongside a visual explanation of what the AI focused on." },
];

export default function Dashboard() {
  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide mb-5"
              style={{ borderColor: "var(--color-border)", color: "var(--color-indigo)" }}
            >
              <ShieldCheck size={12} /> AI-Assisted Analysis
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.08]" style={{ color: "var(--color-navy)" }}>
              Understand your chest X-ray in easy language
            </h1>
            <p className="mt-5 text-lg leading-relaxed max-w-xl" style={{ color: "var(--color-navy-soft)" }}>
              Upload a chest X-ray and get an AI-assisted analysis with a clear, visual explanation of what the result means — not just a label.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/analyze"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: "var(--color-indigo)" }}
              >
                Analyze Chest X-Ray <ArrowRight size={16} />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-slate-50"
                style={{ borderColor: "var(--color-border)", color: "var(--color-navy)" }}
              >
                Learn More
              </Link>
            </div>
          </div>
          <LungHero />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <p className="font-display text-xl font-semibold mb-6 text-center" style={{ color: "var(--color-navy)" }}>How it works</p>
        <div className="grid gap-5 sm:grid-cols-3">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.title} className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--color-border)" }}>
              <span className="flex h-10 w-10 items-center justify-center rounded-lg mb-4" style={{ backgroundColor: "var(--color-indigo-mist)", color: "var(--color-indigo)" }}>
                <step.icon size={18} />
              </span>
              <p className="font-mono text-xs mb-1" style={{ color: "var(--color-navy-soft)" }}>Step {i + 1}</p>
              <p className="font-display text-base font-semibold mb-1.5" style={{ color: "var(--color-navy)" }}>{step.title}</p>
              <p className="text-sm" style={{ color: "var(--color-navy-soft)" }}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <Disclaimer />
      </section>
    </div>
  );
}
