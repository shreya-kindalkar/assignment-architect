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
          "rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center py-8 px-6 text-center",
          drag
            ? "border-brand bg-brand-soft/30"
            : "border-[#d5d5d5] bg-gray-50/30 hover:bg-gray-50",
        )}
      >
        <div className="h-12 w-12 rounded-full bg-white border border-[#e5e5e5] grid place-items-center shadow-sm">
          <UploadCloud className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
        </div>
        <p className="mt-3 text-[12px] font-medium">Choose a file or drag & drop it here</p>
        <p className="text-[11px] text-muted-foreground mt-1">JPEG, PNG, PDF, DOC</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 inline-flex items-center px-5 py-2 rounded-full border border-[#e5e5e5] bg-white text-[12px] font-medium hover:bg-gray-50"
        >
          Browse Files
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {name && (
          <p className="mt-3 text-[11px] text-muted-foreground truncate max-w-full">Selected: {name}</p>
        )}
      </div>
      <p className="text-center text-[10px] text-muted-foreground mt-2">
        Upload images of your preferred document/image
      </p>
    </div>
  );
}
