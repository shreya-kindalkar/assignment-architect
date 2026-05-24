import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { CreateAssignmentForm } from "@/components/assignments/CreateAssignmentForm";
import { useAssignmentStore } from "@/hooks/useAssignmentStore";
import { Loader2, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/create-assignment")({
  head: () => ({
    meta: [
      { title: "Create Assignment — PaperFlow" },
      { name: "description", content: "Set up a new assignment for your students." },
    ],
  }),
  component: CreateAssignmentPage,
});

const PROGRESS_STEPS = [
  { key: "job_started", label: "Initialize Queue & Async Job" },
  { key: "validating", label: "Validate Guidelines & Rubric" },
  { key: "generating_sections", label: "Structure Paper Sections" },
  { key: "generating_questions", label: "Draft Tailored Exam Questions" },
  { key: "generating_answers", label: "Author Complete Answer Key" },
  { key: "formatting_output", label: "Align JSON Schema Constraints" },
  { key: "generating_pdf", label: "Compile Professional Typography PDF" }
];

function CreateAssignmentPage() {
  const navigate = useNavigate();
  const {
    createAssignment,
    startSocketListener,
    stopSocketListener,
    activeJobProgress,
    activeJobStatus,
    activeJobMessage,
    resetProgress,
    isLoading: isApiLoading,
    error: apiError
  } = useAssignmentStore();

  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup socket connection when component unmounts
    return () => {
      stopSocketListener();
      resetProgress();
    };
  }, [stopSocketListener, resetProgress]);

  const handleFormSubmit = async (formData: {
    title: string;
    dueDate: string;
    instructions?: string;
    questionTypes: Array<{ type: string; count: number; marks: number }>;
  }) => {
    try {
      setLocalError(null);
      console.log("[Create Assignment] Submitting form data:", formData);
      const assignment = await createAssignment(formData);
      
      const newId = assignment._id;
      setActiveAssignmentId(newId);

      // Connect WebSockets for live progress tracking!
      startSocketListener(newId, (pdfUrl) => {
        console.log(`[Create Assignment] Generation finished! Redirecting...`);
        navigate({
          to: "/generated-paper",
          search: { id: newId }
        });
      });
    } catch (err: any) {
      console.error("[Create Assignment] Submission failed:", err);
      setLocalError(err.message || "Failed to initiate assignment creation.");
    }
  };

  // Helper to determine checklist item state
  const getStepState = (stepKey: string, stepIndex: number) => {
    if (!activeJobStatus) return "upcoming";

    // Completed state
    if (activeJobStatus === "completed") return "done";
    
    // Fail states
    if (activeJobStatus === "failed") return "failed";

    // Determine current index in the sequence
    const currentIndex = PROGRESS_STEPS.findIndex((s) => s.key === activeJobStatus);
    
    if (stepIndex < currentIndex) return "done";
    if (stepIndex === currentIndex) return "active";
    return "upcoming";
  };

  return (
    <AppShell
      title="Assignment"
      activeKey="assignments"
      showBack
      onBack={() => navigate({ to: "/" })}
      onCreate={() => navigate({ to: "/create-assignment" })}
    >
      {(localError || apiError) && (
        <div className="mx-6 mt-4 rounded-lg bg-rose-50 border border-rose-100 p-4 text-[12px] text-rose-600 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Generation Error</p>
            <p className="mt-0.5">{localError || apiError}</p>
            <button
              onClick={() => {
                setLocalError(null);
                setActiveAssignmentId(null);
                resetProgress();
              }}
              className="mt-2 text-rose-700 underline font-medium hover:text-rose-900 cursor-pointer"
            >
              Back to Form
            </button>
          </div>
        </div>
      )}

      {/* Real-time WebSockets Progress Overlay */}
      {activeAssignmentId && !localError && !apiError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Glossy ambient glow background */}
            <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-100/40 blur-2xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-blue-100/40 blur-2xl pointer-events-none" />

            <header className="flex items-center gap-2 mb-4 relative z-10">
              <span className="h-7 w-7 rounded-full bg-foreground text-background grid place-items-center animate-pulse">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <div>
                <h3 className="text-[14px] font-bold text-foreground">AI Generation Pipeline</h3>
                <p className="text-[11px] text-muted-foreground">Asynchronous background worker active</p>
              </div>
            </header>

            {/* Glowing progress bar */}
            <div className="mb-5 relative z-10">
              <div className="flex justify-between text-[11px] font-semibold text-foreground mb-1.5">
                <span>Overall Progress</span>
                <span className="tabular-nums">{activeJobProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-foreground transition-all duration-500 ease-out shadow-[0_0_8px_rgba(0,0,0,0.2)]"
                  style={{ width: `${activeJobProgress}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] italic text-muted-foreground text-center truncate px-2">
                &ldquo;{activeJobMessage || "Bootstrapping worker task..."}&rdquo;
              </p>
            </div>

            {/* Generation Checklist */}
            <div className="space-y-2.5 border-t border-[#f0f0f0] pt-4 relative z-10">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Checklist Steps</h4>
              {PROGRESS_STEPS.map((step, idx) => {
                const state = getStepState(step.key, idx);
                return (
                  <div
                    key={step.key}
                    className={`flex items-center gap-3 transition-colors duration-300 ${
                      state === "done"
                        ? "text-foreground"
                        : state === "active"
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground opacity-55"
                    }`}
                  >
                    {state === "done" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" strokeWidth={2.5} />
                    ) : state === "active" ? (
                      <Loader2 className="h-4 w-4 text-foreground animate-spin shrink-0" strokeWidth={2.5} />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-[#d5d5d5] shrink-0" />
                    )}
                    <span className="text-[11.5px]">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Render form only when not actively loading progress */}
      {!activeAssignmentId && (
        <CreateAssignmentForm onSubmit={handleFormSubmit} />
      )}
    </AppShell>
  );
}

