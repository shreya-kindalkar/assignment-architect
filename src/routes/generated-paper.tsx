import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { GeneratedPaper } from "@/components/assignments/GeneratedPaper";
import { useAssignmentStore } from "@/hooks/useAssignmentStore";
import { Loader2, CheckCircle2, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import type { QuestionPaperSection } from "@/types/assignment";

export const Route = createFileRoute("/generated-paper")({
  head: () => ({
    meta: [
      { title: "Generated Paper — PaperFlow" },
      { name: "description", content: "AI-generated question paper, ready to print." },
    ],
  }),
  component: GeneratedPaperPage,
});

// Resilient Visual Mock Fallbacks for the default "Sample Paper" link
const MOCK_SECTIONS: QuestionPaperSection[] = [
  {
    title: "Section A",
    instruction: "Attempt all questions. Each question carries 2 marks",
    questions: [
      { number: 1, difficulty: "Easy", text: "Define electroplating. Explain its purpose in industrial engineering.", marks: 2 },
      { number: 2, difficulty: "Moderate", text: "What is the role of a conductor in the process of electrolysis?", marks: 2 },
      { number: 3, difficulty: "Easy", text: "Why does a solution of copper sulfate conduct electricity?", marks: 2 },
      { number: 4, difficulty: "Moderate", text: "Describe one example of the chemical effect of electric current in daily life.", marks: 2 },
      { number: 5, difficulty: "Moderate", text: "Explain why electric current is said to have chemical effects.", marks: 2 },
      { number: 6, difficulty: "Challenging", text: "How is sodium hydroxide prepared during the electrolysis of brine? Write the chemical reaction involved.", marks: 2 }
    ],
  },
];

const MOCK_ANSWER_KEY = [
  { number: 1, text: "Electroplating is the process of depositing a thin layer of metal on the surface of another metal using electric current. Its purpose is to prevent corrosion or improve appearance." },
  { number: 2, text: "A conductor allows the flow of electric current, causing ions in the electrolyte to move and enabling chemical changes." },
  { number: 3, text: "Copper sulfate solution contains free copper and sulfate ions which carry electric charge, thus conducting electricity." }
];

const PROGRESS_STEPS = [
  { key: "job_started", label: "Initialize Queue & Async Job" },
  { key: "validating", label: "Validate Guidelines & Rubric" },
  { key: "generating_sections", label: "Structure Paper Sections" },
  { key: "generating_questions", label: "Draft Tailored Exam Questions" },
  { key: "generating_answers", label: "Author Complete Answer Key" },
  { key: "formatting_output", label: "Align JSON Schema Constraints" },
  { key: "generating_pdf", label: "Compile Professional Typography PDF" }
];

function GeneratedPaperPage() {
  const navigate = useNavigate();
  
  const {
    currentAssignment,
    currentPaper,
    fetchAssignmentById,
    fetchGeneratedPaper,
    regeneratePaper,
    clearCurrentPaper,
    startSocketListener,
    stopSocketListener,
    activeJobProgress,
    activeJobStatus,
    activeJobMessage,
    resetProgress,
    isLoading
  } = useAssignmentStore();

  const [paperId, setPaperId] = useState<string | null>(null);

  // Parse ID from search queries robustly
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    setPaperId(id);
  }, []);

  // Fetch paper details when paperId changes
  useEffect(() => {
    if (paperId) {
      console.log(`[Generated Paper Page] Loading Details for ID: ${paperId}`);
      fetchAssignmentById(paperId);
      fetchGeneratedPaper(paperId);
    }
  }, [paperId, fetchAssignmentById, fetchGeneratedPaper]);

  // If paper is still pending or processing in the database, automatically open socket stream
  useEffect(() => {
    if (paperId && currentAssignment && (currentAssignment.status === "pending" || currentAssignment.status === "processing")) {
      console.log(`[Generated Paper Page] Paper is still compiling. Connecting live progress.`);
      startSocketListener(paperId, (pdfUrl) => {
        // Refresh details on complete
        fetchAssignmentById(paperId);
        fetchGeneratedPaper(paperId);
      });
    }

    return () => {
      stopSocketListener();
    };
  }, [paperId, currentAssignment?.status, startSocketListener, stopSocketListener, fetchAssignmentById, fetchGeneratedPaper]);

  const handleDownload = () => {
    if (currentPaper?.pdfUrl) {
      console.log(`[Download] Opening static PDF link: http://localhost:5000${currentPaper.pdfUrl}`);
      window.open(`http://localhost:5000${currentPaper.pdfUrl}`, "_blank");
    } else {
      window.print();
    }
  };

  const handleRegenerate = async () => {
    if (!paperId) return;

    // Reset progress and clear current paper so the progress overlay shows immediately
    resetProgress();
    clearCurrentPaper();

    // Call the regenerate API, then connect socket for live updates
    await regeneratePaper(paperId);
    startSocketListener(paperId, () => {
      fetchAssignmentById(paperId);
      fetchGeneratedPaper(paperId);
    });
  };

  // Helper to determine checklist item state
  const getStepState = (stepKey: string, stepIndex: number) => {
    if (!activeJobStatus) return "upcoming";
    if (activeJobStatus === "completed") return "done";
    if (activeJobStatus === "failed") return "failed";

    const currentIndex = PROGRESS_STEPS.findIndex((s) => s.key === activeJobStatus);
    if (stepIndex < currentIndex) return "done";
    if (stepIndex === currentIndex) return "active";
    return "upcoming";
  };

  const isPaperProcessing = currentAssignment && (currentAssignment.status === "pending" || currentAssignment.status === "processing");

  return (
    <AppShell
      title="Generated Paper"
      activeKey="assignments"
      showBack
      onBack={() => navigate({ to: "/" })}
      onCreate={() => navigate({ to: "/create-assignment" })}
    >
      {isLoading && !currentPaper && !isPaperProcessing ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Retrieving question paper details...</span>
        </div>
      ) : isPaperProcessing ? (
        /* Real-time WebSockets Progress Overlay (Inline card when visiting details page) */
        <div className="mx-6 my-6 rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-sm relative overflow-hidden animate-in fade-in duration-200">
          <header className="flex items-center gap-2 mb-4">
            <span className="h-7 w-7 rounded-full bg-foreground text-background grid place-items-center animate-pulse">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <div>
              <h3 className="text-[14px] font-bold text-foreground">AI Generation in Progress</h3>
              <p className="text-[11px] text-muted-foreground">Your paper is compiling on our background queues</p>
            </div>
          </header>

          <div className="mb-5">
            <div className="flex justify-between text-[11px] font-semibold text-foreground mb-1.5">
              <span>Progress Checkpoint</span>
              <span className="tabular-nums">{activeJobProgress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-foreground transition-all duration-500 ease-out"
                style={{ width: `${activeJobProgress}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] italic text-muted-foreground text-center truncate">
              &ldquo;{activeJobMessage || "Processing queue tasks..."}&rdquo;
            </p>
          </div>

          <div className="space-y-2 border-t border-[#f5f5f5] pt-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Checklist Checklist</h4>
            {PROGRESS_STEPS.map((step, idx) => {
              const state = getStepState(step.key, idx);
              return (
                <div
                  key={step.key}
                  className={`flex items-center gap-3 ${
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
      ) : paperId && currentPaper ? (
        /* Real Generated Paper View */
        <div>
          {/* Action Row */}
          <div className="px-4 pt-3 flex items-center gap-3">
            <button
              onClick={handleRegenerate}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-foreground px-3.5 py-1.5 text-[11px] font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" /> Regenerate Paper
            </button>
          </div>

          <GeneratedPaper
            school="Veda AI Academy"
            subject={currentAssignment?.title || "CBSE Evaluation Paper"}
            classLabel="CBSE Grade 8 Standard"
            timeAllowed="90 Minutes"
            maxMarks={currentPaper.marks}
            sections={currentPaper.sections}
            answerKey={currentPaper.answerKey}
            aiNote={`Successfully generated question paper for "${currentAssignment?.title}" under Mongoose models & Redis BullMQ worker architectures.`}
            onDownload={handleDownload}
          />
        </div>
      ) : (
        /* Sample Mock Paper Fallback */
        <GeneratedPaper
          school="Delhi Public School, Sector-4, Bokaro"
          subject="Science Evaluation"
          classLabel="Grade 8"
          timeAllowed="45 minutes"
          maxMarks={20}
          sections={MOCK_SECTIONS}
          answerKey={MOCK_ANSWER_KEY}
          aiNote="Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade 8 Science classes on the NCERT chapters:"
          onDownload={handleDownload}
        />
      )}
    </AppShell>
  );
}

