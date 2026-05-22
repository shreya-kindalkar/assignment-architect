import { MoreVertical, Eye, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { Assignment } from "@/types/assignment";

export interface AssignmentCardProps {
  assignment: Assignment;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function AssignmentCard({ assignment, onView, onDelete }: AssignmentCardProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="relative rounded-xl border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-semibold underline underline-offset-2 decoration-foreground/40">
          {assignment.title}
        </h3>
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="h-7 w-7 grid place-items-center rounded-md text-muted-foreground hover:bg-secondary"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {open && (
            <div className="absolute right-0 top-9 z-10 w-44 rounded-lg border border-border bg-surface shadow-lg overflow-hidden">
              <button
                onClick={() => {
                  onView?.(assignment.id);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary text-left"
              >
                <Eye className="h-3.5 w-3.5" /> View Assignment
              </button>
              <button
                onClick={() => {
                  onDelete?.(assignment.id);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between text-[12px]">
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground">Assigned on</span> : {assignment.assignedOn}
        </span>
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground">Due</span> : {assignment.due}
        </span>
      </div>
    </motion.div>
  );
}
