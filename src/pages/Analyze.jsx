import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import ImageUploader from "../components/ImageUploader";
import { AnalyzingState, ErrorState } from "../components/LoadingState";
import PredictionCard from "../components/PredictionCard";
import ProbabilityChart from "../components/ProbabilityChart";
import SegmentationViewer from "../components/SegmentationViewer";
import ExplainabilityViewer from "../components/ExplainabilityViewer";
import PerformanceCard from "../components/PerformanceCard";
import { DemoModeBadge } from "../components/Disclaimer";
import { usePrediction, STAGES } from "../hooks/usePrediction";
import { Play } from "lucide-react";

export default function Analyze() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { status, stageIndex, result, error, isDemoMode, analyze, reset } = usePrediction();

  useEffect(() => {
    return () => {
      if (previewUrl && !previewUrl.startsWith("/demo/")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileSelected = (f) => {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    reset();
  };

  const handleLoadDemo = () => {
    const idx = Math.floor(Math.random() * 3);
    const paths = ["/demo/xray-normal.svg", "/demo/xray-pneumonia.svg", "/demo/xray-tb.svg"];
    setFile({ __demoIndex: idx });
    setPreviewUrl(paths[idx]);
    reset();
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl(null);
    reset();
  };

  const handleAnalyze = () => {
    if (!file) return;
    if (file.__demoIndex !== undefined) {
      analyze(null, { demoCaseIndex: file.__demoIndex, forceDemo: true });
    } else {
      analyze(file, { demoCaseIndex: 0 });
    }
  };

  const isAnalyzing = status === "analyzing";

  return (
    <div>
      <PageHeader
        eyebrow="X-Ray Analysis"
        title="Analyze Chest X-Ray"
        subtitle="Upload a chest X-ray image to generate an AI-assisted prediction and interpretable explanation."
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 space-y-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <ImageUploader
              onFileSelected={handleFileSelected}
              onLoadDemo={handleLoadDemo}
              previewUrl={previewUrl}
              fileName={file?.name}
              onRemove={handleRemove}
              disabled={isAnalyzing}
            />
          </div>
          <div className="flex flex-col justify-end gap-3">
            <button
              onClick={handleAnalyze}
              disabled={!file || isAnalyzing}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-40"
              style={{ backgroundColor: "var(--color-indigo)" }}
            >
              <Play size={16} /> Analyze Image
            </button>
            <p className="text-xs text-center lg:text-left" style={{ color: "var(--color-navy-soft)" }}>
              Analysis typically completes in under a second once connected to the backend.
            </p>
          </div>
        </div>

        {isAnalyzing && <AnalyzingState stages={STAGES} activeIndex={stageIndex} />}

        {status === "error" && (
          <ErrorState description={error} onRetry={handleAnalyze} />
        )}

        {status === "done" && result && (
          <div className="space-y-8">
            {isDemoMode && (
              <div className="flex items-center gap-2">
                <DemoModeBadge />
                <span className="text-xs" style={{ color: "var(--color-navy-soft)" }}>
                  Backend unavailable — showing representative demo results.
                </span>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <PredictionCard
                prediction={result.prediction}
                confidence={result.confidence}
                uncertainty={result.uncertainty}
                calibrationStatus={result.calibration_status}
              />
              <ProbabilityChart probabilities={result.probabilities} />
            </div>

            <SegmentationViewer originalImage={result.original_image} segmentationImage={result.segmentation_image} />

            <ExplainabilityViewer
              gradcamImage={result.gradcam_image}
              gradcamPlusImage={result.gradcam_plus_image}
              limeImage={result.lime_image}
            />

            <PerformanceCard timings={result.timings_ms} totalSeconds={result.inference_time} modelSizeMb={result.model_size_mb} />
          </div>
        )}
      </div>

      {status === "done" && file && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 backdrop-blur p-3 sm:hidden" style={{ borderColor: "var(--color-border)" }}>
          <button
            onClick={handleAnalyze}
            className="w-full rounded-xl py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--color-indigo)" }}
          >
            Re-analyze
          </button>
        </div>
      )}
    </div>
  );
}
