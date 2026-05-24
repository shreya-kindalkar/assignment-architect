import { MoreVertical, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Assignment } from "@/types/assignment";

export interface AssignmentCardProps {
  assignment: Assignment;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function AssignmentCard({ assignment, onView, onDelete }: AssignmentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [menuOpen]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking the 3-dot menu area
    if (menuRef.current?.contains(e.target as Node)) return;
    onView?.(assignment.id);
  };

  const handleDeleteConfirm = () => {
    setConfirmDelete(false);
    onDelete?.(assignment.id);
  };

  return (
    <>
      {/* Card — fully clickable */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => e.key === "Enter" && handleCardClick(e as unknown as React.MouseEvent)}
        className="relative rounded-2xl border border-[#e5e5e5] bg-white p-5 flex flex-col min-h-[92px]
          shadow-[0_2px_10px_rgba(0,0,0,0.04)] cursor-pointer select-none
          transition-all duration-150 ease-out
          hover:shadow-[0_6px_16px_rgba(0,0,0,0.05)] hover:-translate-y-px
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[12px] font-semibold leading-snug text-foreground">
            {assignment.title}
          </h3>

          {/* 3-dot menu — secondary actions only */}
          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((o) => !o);
              }}
              className="h-6 w-6 grid place-items-center rounded text-muted-foreground
                hover:bg-gray-100 transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-7 z-20 w-44 rounded-xl border border-[#e5e5e5] bg-white shadow-lg overflow-hidden">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    setConfirmDelete(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[11px] text-rose-600 hover:bg-rose-50 text-left transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Assignment</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-muted-foreground leading-none">
          <span>
            <span className="font-semibold text-foreground">Assigned on</span> : {assignment.assignedOn}
          </span>
          <span>
            <span className="font-semibold text-foreground">Due</span> : {assignment.due}
          </span>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[14px]">Delete assignment?</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px] text-muted-foreground">
              <span className="font-medium text-foreground">&ldquo;{assignment.title}&rdquo;</span> and its
              generated paper will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="text-[12px] h-8 rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="text-[12px] h-8 rounded-full bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
