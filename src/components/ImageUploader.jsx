import { useCallback, useRef, useState } from "react";
import { FileImage, Sparkles, Trash2, UploadCloud } from "lucide-react";

const MAX_SIZE_MB = 10;
const ACCEPTED = ["image/jpeg", "image/jpg", "image/png"];

export default function ImageUploader({ onFileSelected, onLoadDemo, previewUrl, fileName, onRemove, disabled }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const validateAndSet = useCallback(
    (file) => {
      if (!file) return;
      if (!ACCEPTED.includes(file.type)) {
        setValidationError("Unsupported format. Upload a JPG or PNG image.");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setValidationError(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`);
        return;
      }
      setValidationError(null);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      validateAndSet(file);
    },
    [validateAndSet, disabled]
  );

  if (previewUrl) {
    return (
      <div className="rounded-2xl border bg-white p-4" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div
            className="relative aspect-square sm:w-48 sm:h-48 shrink-0 overflow-hidden rounded-xl border grid-backdrop"
            style={{ borderColor: "var(--color-border)" }}
          >
            <img src={previewUrl} alt="Uploaded chest X-ray preview" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-navy)" }}>
                <FileImage size={16} style={{ color: "var(--color-indigo)" }} />
                {fileName || "chest-xray.jpg"}
              </div>
              <p className="mt-1 text-xs" style={{ color: "var(--color-navy-soft)" }}>Ready for analysis.</p>
            </div>
            <button
              onClick={onRemove}
              disabled={disabled}
              className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              style={{ borderColor: "var(--color-border)" }}
            >
              <Trash2 size={14} /> Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled) inputRef.current?.click();
        }}
        aria-label="Upload chest X-ray image"
        className="cursor-pointer rounded-2xl border-2 border-dashed bg-white px-6 py-14 text-center transition-colors"
        style={{
          borderColor: isDragging ? "var(--color-indigo)" : "var(--color-border)",
          backgroundColor: isDragging ? "var(--color-indigo-mist)" : "white",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => validateAndSet(e.target.files?.[0])}
        />
        <span
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--color-indigo-mist)", color: "var(--color-indigo)" }}
        >
          <UploadCloud size={26} />
        </span>
        <p className="font-display text-base font-semibold" style={{ color: "var(--color-navy)" }}>
          Drag & drop a chest X-ray image
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--color-navy-soft)" }}>or click to browse your files</p>
        <p className="mt-4 font-mono text-xs" style={{ color: "var(--color-navy-soft)" }}>
          JPG, JPEG, PNG · Max {MAX_SIZE_MB} MB
        </p>
      </div>

      {validationError && (
        <p className="mt-2 text-sm" style={{ color: "var(--color-rose)" }} role="alert">
          {validationError}
        </p>
      )}

      <button
        onClick={onLoadDemo}
        disabled={disabled}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium disabled:opacity-50"
        style={{ color: "var(--color-indigo)" }}
      >
        <Sparkles size={14} /> Load demo X-ray instead
      </button>
    </div>
  );
}
