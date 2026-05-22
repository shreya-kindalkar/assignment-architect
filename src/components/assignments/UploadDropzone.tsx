import { UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function UploadDropzone({ onFile }: { onFile?: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [name, setName] = useState<string>();

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (f) {
      setName(f.name);
      onFile?.(f);
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center py-10 px-6 text-center",
          drag ? "border-brand bg-brand-soft/40" : "border-border bg-surface-muted/60 hover:bg-surface-muted",
        )}
      >
        <div className="h-11 w-11 rounded-full bg-surface border border-border grid place-items-center shadow-sm">
          <UploadCloud className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="mt-3 text-sm font-medium">Choose a file or drag & drop it here</p>
        <p className="text-[12px] text-muted-foreground mt-0.5">JPEG, PNG, upto 10MB</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 inline-flex items-center px-4 py-2 rounded-full border border-border bg-surface text-sm font-medium hover:bg-secondary"
        >
          Browse Files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {name && <p className="mt-3 text-xs text-muted-foreground truncate max-w-full">Selected: {name}</p>}
      </div>
      <p className="text-center text-[12px] text-muted-foreground mt-2">
        Upload images of your preferred document/image
      </p>
    </div>
  );
}
