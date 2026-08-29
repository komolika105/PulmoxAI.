import { Disclaimer } from "./Disclaimer";

export default function Footer() {
  return (
    <footer className="border-t mt-16" style={{ borderColor: "var(--color-border)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Disclaimer />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm" style={{ color: "var(--color-navy-soft)" }}>
          <p>© {new Date().getFullYear()} PulmoXAI. AI-assisted analysis — not a certified medical device.</p>
        </div>
      </div>
    </footer>
  );
}
