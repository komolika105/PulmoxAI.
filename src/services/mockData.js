// Mock/demo data used only when the FastAPI backend is unavailable or in DEMO MODE.
// Structure mirrors the real /api/predict response documented in services/api.js
// so swapping to a live backend requires no changes to consuming components.

const DISEASE_CLASSES = ["Normal", "Pneumonia", "Tuberculosis", "Other"];

const DEMO_CASES = [
  {
    label: "Pneumonia — demo case",
    prediction: "Pneumonia",
    probabilities: { Normal: 0.03, Pneumonia: 0.942, Tuberculosis: 0.018, Other: 0.01 },
    image: "/demo/xray-pneumonia.svg",
  },
  {
    label: "Normal — demo case",
    prediction: "Normal",
    probabilities: { Normal: 0.961, Pneumonia: 0.021, Tuberculosis: 0.009, Other: 0.009 },
    image: "/demo/xray-normal.svg",
  },
  {
    label: "Tuberculosis — demo case",
    prediction: "Tuberculosis",
    probabilities: { Normal: 0.04, Pneumonia: 0.06, Tuberculosis: 0.874, Other: 0.026 },
    image: "/demo/xray-tb.svg",
  },
];

function jitter(base, spread) {
  return Math.round(base + (Math.random() - 0.5) * spread);
}

export function buildMockPrediction(caseIndex = 0) {
  const demoCase = DEMO_CASES[caseIndex % DEMO_CASES.length];
  const confidence = demoCase.probabilities[demoCase.prediction];

  const preprocessing = jitter(18, 6);
  const segmentation = jitter(31, 8);
  const classification = jitter(42, 10);
  const xai = jitter(76, 14);
  const total = preprocessing + segmentation + classification + xai;

  return {
    prediction: demoCase.prediction,
    confidence,
    probabilities: demoCase.probabilities,
    classes: DISEASE_CLASSES,
    segmentation_image: demoCase.image,
    original_image: demoCase.image,
    gradcam_image: demoCase.image,
    gradcam_plus_image: demoCase.image,
    lime_image: demoCase.image,
    inference_time: total / 1000,
    timings_ms: {
      preprocessing,
      segmentation,
      classification,
      xai_generation: xai,
      total,
    },
    model_size_mb: 30.8,
    uncertainty: confidence > 0.85 ? "Low" : confidence > 0.6 ? "Moderate" : "High",
    calibration_status: "Not yet evaluated",
    explanation_quality: null, // real metrics only — null renders "Evaluation unavailable"
    demo: true,
    generated_at: new Date().toISOString(),
  };
}

export const DEMO_CASE_LIST = DEMO_CASES.map((c, i) => ({ index: i, label: c.label }));

export const mockHistory = [
  {
    id: "h1",
    date: "2026-08-07T09:14:00Z",
    prediction: "Pneumonia",
    confidence: 0.942,
    inference_time: 0.167,
    thumbnail: "/demo/xray-pneumonia.svg",
  },
  {
    id: "h2",
    date: "2026-08-06T14:02:00Z",
    prediction: "Normal",
    confidence: 0.961,
    inference_time: 0.152,
    thumbnail: "/demo/xray-normal.svg",
  },
  {
    id: "h3",
    date: "2026-08-04T11:47:00Z",
    prediction: "Tuberculosis",
    confidence: 0.874,
    inference_time: 0.171,
    thumbnail: "/demo/xray-tb.svg",
  },
  {
    id: "h4",
    date: "2026-08-01T08:30:00Z",
    prediction: "Other",
    confidence: 0.583,
    inference_time: 0.163,
    thumbnail: "/demo/xray-normal.svg",
  },
];

export const datasetInfo = [
  { name: "NIH ChestX-ray14", images: "112,120", classes: 14, role: "Training" },
  { name: "CheXpert", images: "224,316", classes: 14, role: "Training" },
  { name: "RSNA Pneumonia", images: "26,684", classes: 2, role: "Validation" },
  { name: "Montgomery County TB", images: "138", classes: 2, role: "External Testing" },
  { name: "Shenzhen TB Dataset", images: "662", classes: 2, role: "External Testing" },
];

export const ablationStudy = [
  { model: "DenseNet121", accuracy: null, f1: null, auroc: null },
  { model: "U-Net + DenseNet121", accuracy: null, f1: null, auroc: null },
  { model: "EfficientNet", accuracy: null, f1: null, auroc: null },
  { model: "ResNet50", accuracy: null, f1: null, auroc: null },
];
