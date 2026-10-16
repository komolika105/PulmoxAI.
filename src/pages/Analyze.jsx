import { useEffect, useRef, useState } from "react";
import PageHeader from "../components/PageHeader";
import ImageUploader from "../components/ImageUploader";
import { AnalyzingState, ErrorState } from "../components/LoadingState";
import PredictionCard from "../components/PredictionCard";
import ProbabilityChart from "../components/ProbabilityChart";
import SegmentationViewer from "../components/SegmentationViewer";
import ExplainabilityViewer from "../components/ExplainabilityViewer";
import { usePrediction, STAGES } from "../hooks/usePrediction";
import ErrorBoundary from "../components/ErrorBoundary";
import GeminiExplanation from "../components/GeminiExplanation";
import PerformanceCard from "../components/PerformanceCard";
import { DemoModeBadge } from "../components/Disclaimer";
import { exportReport } from "../services/api";
import { Play, Download } from "lucide-react";

export default function Analyze() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [geminiCardHeight, setGeminiCardHeight] = useState(null);
  const gradcamColumnRef = useRef(null);
  const { status, stageIndex, result, error, isDemoMode, analyze, reset } = usePrediction();

  useEffect(() => {
    if (!gradcamColumnRef.current) return;

    const updateHeight = () => {
      const height = gradcamColumnRef.current?.getBoundingClientRect().height;
      if (height) {
        setGeminiCardHeight(Math.round(height));
      }
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(gradcamColumnRef.current);

    return () => observer.disconnect();
  }, [result?.gradcam_image]);

  const handleExportPdf = async () => {
    if (!result) return;
    try {
      setExportingPdf(true);
      await exportReport({
        patient_name: file?.name ? `File: ${file.name}` : "Patient Scan",
        prediction: result.prediction,
        confidence: result.confidence,
        probabilities: result.probabilities,
        risk_score: result.risk_score,
        risk_scores: result.risk_scores,
        thresholds: result.thresholds,
        detected_conditions: result.detected_conditions,
        gradcam_image: result.gradcam_image,
      });
    } catch (err) {
      alert("Failed to export PDF report. Please check server logs.");
    } finally {
      setExportingPdf(false);
    }
  };

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
          <ErrorBoundary onReset={reset}>
            <div className="space-y-8">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl p-4 border bg-white" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-center gap-2">
                  {isDemoMode && <DemoModeBadge />}
                  <span className="text-xs font-medium" style={{ color: "var(--color-navy-soft)" }}>
                    {isDemoMode ? "Backend unavailable — showing demo mode" : "Live Backend Inference Verified"}
                  </span>
                </div>

                <button
                  onClick={handleExportPdf}
                  disabled={exportingPdf}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-sm transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: "var(--color-teal, #0d9488)" }}
                >
                  <Download size={14} />
                  {exportingPdf ? "Generating PDF..." : "Export PDF Diagnostic Report"}
                </button>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <PredictionCard
                  prediction={result.prediction}
                  confidence={result.confidence}
                  riskScore={result.risk_score}
                  detectedConditions={result.detected_conditions}
                  uncertainty={result.uncertainty}
                  calibrationStatus={result.calibration_status}
                />
                <ProbabilityChart
                  probabilities={result.probabilities}
                  riskScores={result.risk_scores}
                  thresholds={result.thresholds}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <p className="font-display text-xl font-semibold mb-1" style={{ color: "var(--color-navy)" }}>
                    Why did the model make this prediction?
                  </p>
                  <p className="text-sm" style={{ color: "var(--color-navy-soft)" }}>
                    The Grad-CAM heatmap and the AI explanation highlight the regions and reasoning that influenced the prediction.
                  </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] items-stretch">
                  <div
                    className="h-full min-h-[420px]"
                    style={geminiCardHeight ? { height: `${geminiCardHeight}px` } : undefined}
                  >
                    <GeminiExplanation
                      prediction={result.prediction}
                      confidence={result.confidence}
                      probabilities={result.probabilities}
                    />
                  </div>

                  <div ref={gradcamColumnRef} className="h-full min-h-[420px]">
                    <ExplainabilityViewer gradcamImage={result.gradcam_image} />
                  </div>
                </div>
              </div>

              <SegmentationViewer originalImage={result.original_image} segmentationImage={result.segmentation_image} />

              <PerformanceCard timings={result.timings_ms} totalSeconds={result.inference_time} modelSizeMb={result.model_size_mb} />
            </div>
          </ErrorBoundary>
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
