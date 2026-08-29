import { useCallback, useState } from "react";
import { analyzeXray, analyzeXrayDemo, BackendUnavailableError, InvalidImageError } from "../services/api";

export const STAGES = [
  { key: "preprocessing", label: "Preprocessing" },
  { key: "segmentation", label: "Lung segmentation" },
  { key: "classification", label: "Disease classification" },
  { key: "explanations", label: "Generating explanations" },
];

/**
 * Drives the analyze flow: stage progression, backend call (with automatic
 * demo-mode fallback), result state, and error state. Kept independent of
 * any single component so both Analyze and future pages can reuse it.
 */
export function usePrediction() {
  const [status, setStatus] = useState("idle"); // idle | analyzing | done | error
  const [stageIndex, setStageIndex] = useState(-1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const runStages = useCallback(async () => {
    for (let i = 0; i < STAGES.length; i += 1) {
      setStageIndex(i);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 420 + Math.random() * 260));
    }
  }, []);

  const analyze = useCallback(
    async (file, { demoCaseIndex = 0, forceDemo = false } = {}) => {
      setStatus("analyzing");
      setError(null);
      setResult(null);

      const stagesPromise = runStages();

      try {
        let data;
        if (forceDemo) {
          data = await analyzeXrayDemo(demoCaseIndex);
          setIsDemoMode(true);
        } else {
          try {
            data = await analyzeXray(file);
            setIsDemoMode(false);
          } catch (err) {
            if (err instanceof InvalidImageError) throw err;
            // Backend unreachable — fall back to demo mode so the UI remains usable.
            data = await analyzeXrayDemo(demoCaseIndex);
            setIsDemoMode(true);
          }
        }

        await stagesPromise;
        setResult(data);
        setStatus("done");
      } catch (err) {
        await stagesPromise;
        if (err instanceof InvalidImageError || err instanceof BackendUnavailableError) {
          setError(err.message);
        } else {
          setError("Something went wrong while analyzing this image. Please try again.");
        }
        setStatus("error");
      } finally {
        setStageIndex(-1);
      }
    },
    [runStages]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
    setError(null);
    setStageIndex(-1);
  }, []);

  return { status, stageIndex, result, error, isDemoMode, analyze, reset };
}
