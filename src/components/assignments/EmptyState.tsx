import { FileSearch, Plus } from "lucide-react";
import { PillButton } from "@/components/common/PillButton";

export function EmptyState({ onCreate }: { onCreate?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16">
      <div className="relative mb-4">
        <div className="h-20 w-20 grid place-items-center">
          <div className="relative">
            <div className="h-12 w-11 rounded-md border-2 border-[#e5e5e5] bg-white shadow-sm grid place-items-center rotate-[-3deg]">
              <FileSearch className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
            </div>
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 border-2 border-white grid place-items-center">
              <span className="text-[10px] font-bold text-white leading-none">×</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-[13px] font-semibold">No assignments yet</h2>
      <p className="mt-1.5 max-w-[360px] text-center text-[11px] text-muted-foreground leading-relaxed">
        Create your first assignment to start collecting and grading student submissions. You can
        set up rubrics, define marking criteria, and let AI assist with grading.
      </p>

      <div className="mt-4">
        <PillButton onClick={onCreate} leadingIcon={<Plus className="h-3 w-3" strokeWidth={2.5} />}>
          Create Your First Assignment
        </PillButton>
      </div>
    </div>
  );
}
