import { useState } from "react";
import { Download, Maximize2 } from "lucide-react";

const METHOD = {
  key: "gradcam",
  title: "Grad-CAM",
  description: "Highlights the image regions that contributed most strongly to the prediction.",
  legend: "Warmer regions indicate stronger influence on the model’s decision.",
};

function ExplanationCard({ method, image }) {
  const [fullscreen, setFullscreen] = useState(false);

  const download = () => {
    const link = document.createElement("a");
    link.href = image;
    link.download = `pulmoxai-${method.key}.jpeg`;
    link.click();
  };

  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: "var(--color-border)" }}>
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5" style={{ borderColor: "var(--color-border)", backgroundColor: "rgba(16, 24, 40, 0.02)" }}>
        <div>
          <p className="font-display text-base font-semibold" style={{ color: "var(--color-navy)" }}>{method.title}</p>
          <p className="text-xs" style={{ color: "var(--color-navy-soft)" }}>{method.description}</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setFullscreen(true)} aria-label={`View ${method.title} fullscreen`} className="rounded-lg border p-1.5 text-slate-500 hover:bg-slate-50" style={{ borderColor: "var(--color-border)" }}>
            <Maximize2 size={14} />
          </button>
          <button onClick={download} aria-label={`Download ${method.title} visualization`} className="rounded-lg border p-1.5 text-slate-500 hover:bg-slate-50" style={{ borderColor: "var(--color-border)" }}>
            <Download size={14} />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="aspect-square overflow-hidden rounded-xl border bg-slate-50" style={{ borderColor: "var(--color-border)" }}>
          <img src={image} alt={`${method.title} explanation overlay`} className="h-full w-full object-cover" />
        </div>
        <p className="mt-3 text-xs" style={{ color: "var(--color-navy-soft)" }}>{method.legend}</p>
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6" onClick={() => setFullscreen(false)} role="dialog" aria-modal="true">
          <img src={image} alt={`${method.title} explanation, fullscreen`} className="max-h-full max-w-full rounded-xl" />
        </div>
      )}
    </div>
  );
}

export default function ExplainabilityViewer({ gradcamImage }) {
  return (
    <div className="h-full">
      <div className="grid gap-5 h-full">
        <ExplanationCard method={METHOD} image={gradcamImage} />
      </div>
    </div>
  );
}

export { METHOD };
