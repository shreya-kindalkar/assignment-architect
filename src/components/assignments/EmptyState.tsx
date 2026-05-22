import { FileX, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { PillButton } from "@/components/common/PillButton";

export function EmptyState({ onCreate }: { onCreate?: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <div className="h-44 w-44 rounded-full bg-surface-muted grid place-items-center shadow-[0_30px_60px_-30px_rgba(0,0,0,0.15)]">
          <div className="relative">
            <div className="h-24 w-20 rounded-md bg-surface border border-border shadow-sm rotate-[-6deg] grid place-items-center">
              <FileX className="h-10 w-10 text-rose-500" strokeWidth={2.2} />
            </div>
            <div className="absolute -top-2 -right-3 h-5 w-5 rounded-full bg-rose-100 border border-rose-200" />
            <div className="absolute -bottom-3 -left-4 h-3 w-3 rounded-full bg-amber-300" />
          </div>
        </div>
        <span className="absolute -top-2 left-6 text-[11px] font-medium text-violet-600 bg-violet-100 rounded px-1.5 py-0.5 rotate-[-8deg]">
          Lalit Wagh
        </span>
      </motion.div>

      <h2 className="mt-8 text-lg font-semibold">No assignments yet</h2>
      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground leading-relaxed">
        Create your first assignment to start collecting and grading student submissions. You can set up
        rubrics, define marking criteria, and let AI assist with grading.
      </p>

      <div className="mt-7">
        <PillButton onClick={onCreate} leadingIcon={<Plus className="h-4 w-4" />}>
          Create Your First Assignment
        </PillButton>
      </div>
    </div>
  );
}
