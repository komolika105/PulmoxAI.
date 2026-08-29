import { useState } from "react";
import { Download, Maximize2 } from "lucide-react";

const METHODS = [
  {
    key: "gradcam",
    title: "Grad-CAM",
    description: "Highlights image regions that contributed strongly to the predicted class.",
    legend: "Warmer regions indicate stronger influence on the prediction.",
  },
  {
    key: "gradcam_plus",
    title: "Grad-CAM++",
    description: "Provides refined class-specific localization of important regions.",
    legend: "Sharper, more localized activation compared to Grad-CAM.",
  },
  {
    key: "lime",
    title: "LIME",
    description: "Provides a local explanation by identifying image regions that influence the individual prediction.",
    legend: "Outlined superpixels show regions with the greatest local influence.",
  },
];

function ExplanationCard({ method, image }) {
  const [fullscreen, setFullscreen] = useState(false);

  const download = () => {
    const link = document.createElement("a");
    link.href = image;
    link.download = `pulmoxai-${method.key}.svg`;
    link.click();
  };

  return (
    <div className="rounded-2xl border bg-white p-5" style={{ borderColor: "var(--color-border)" }}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="font-display text-base font-semibold" style={{ color: "var(--color-navy)" }}>{method.title}</p>
        <div className="flex gap-1">
          <button onClick={() => setFullscreen(true)} aria-label={`View ${method.title} fullscreen`} className="rounded-lg border p-1.5 text-slate-500 hover:bg-slate-50" style={{ borderColor: "var(--color-border)" }}>
            <Maximize2 size={14} />
          </button>
          <button onClick={download} aria-label={`Download ${method.title} visualization`} className="rounded-lg border p-1.5 text-slate-500 hover:bg-slate-50" style={{ borderColor: "var(--color-border)" }}>
            <Download size={14} />
          </button>
        </div>
      </div>
      <p className="text-sm mb-3" style={{ color: "var(--color-navy-soft)" }}>{method.description}</p>
      <div className="aspect-square overflow-hidden rounded-xl border" style={{ borderColor: "var(--color-border)" }}>
        <img src={image} alt={`${method.title} explanation overlay`} className="h-full w-full object-cover" />
      </div>
      <p className="mt-2.5 text-xs" style={{ color: "var(--color-navy-soft)" }}>{method.legend}</p>

      {fullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6" onClick={() => setFullscreen(false)} role="dialog" aria-modal="true">
          <img src={image} alt={`${method.title} explanation, fullscreen`} className="max-h-full max-w-full rounded-xl" />
        </div>
      )}
    </div>
  );
}

export default function ExplainabilityViewer({ gradcamImage, gradcamPlusImage, limeImage }) {
  const images = { gradcam: gradcamImage, gradcam_plus: gradcamPlusImage, lime: limeImage };
  return (
    <div>
      <p className="font-display text-xl font-semibold mb-1" style={{ color: "var(--color-navy)" }}>
        Why did the model make this prediction?
      </p>
      <p className="text-sm mb-5" style={{ color: "var(--color-navy-soft)" }}>
        Three complementary explanation methods highlight the regions that influenced the classification.
      </p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {METHODS.map((method) => (
          <ExplanationCard key={method.key} method={method} image={images[method.key]} />
        ))}
      </div>
    </div>
  );
}

export { METHODS };
