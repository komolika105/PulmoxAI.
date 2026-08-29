import { useState } from "react";
import { Maximize2, MoveHorizontal } from "lucide-react";

export default function SegmentationViewer({ originalImage, segmentationImage }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--color-border)" }}>
      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="font-display text-base font-semibold" style={{ color: "var(--color-navy)" }}>
          Anatomical Lung Segmentation
        </p>
        <button
          onClick={() => setFullscreen(true)}
          className="rounded-lg border p-1.5 text-slate-500 hover:bg-slate-50"
          style={{ borderColor: "var(--color-border)" }}
          aria-label="View fullscreen"
        >
          <Maximize2 size={15} />
        </button>
      </div>
      <p className="text-sm mb-4" style={{ color: "var(--color-navy-soft)" }}>
        U-Net identifies the anatomical lung region to reduce the influence of irrelevant image regions during classification.
      </p>

      <div
        className="relative aspect-square w-full overflow-hidden rounded-xl border select-none"
        style={{ borderColor: "var(--color-border)" }}
      >
        <img src={originalImage} alt="Original chest X-ray" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}>
          <img src={segmentationImage} alt="Segmented lung region overlay" className="h-full w-full object-cover" draggable={false} />
        </div>
        <div className="absolute inset-y-0" style={{ left: `${sliderPos}%` }}>
          <div className="h-full w-0.5" style={{ backgroundColor: "white" }} />
          <span
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow"
            style={{ color: "var(--color-indigo)" }}
          >
            <MoveHorizontal size={14} />
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          aria-label="Comparison slider between original X-ray and segmented lung region"
        />
        <span className="absolute left-2 top-2 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white">Original</span>
        <span className="absolute right-2 top-2 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white">Segmented</span>
      </div>

      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setFullscreen(false)}
          role="dialog"
          aria-modal="true"
        >
          <img src={segmentationImage} alt="Segmented lung region, fullscreen" className="max-h-full max-w-full rounded-xl" />
        </div>
      )}
    </div>
  );
}
