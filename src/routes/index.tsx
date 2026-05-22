import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/assignments/EmptyState";
import { AssignmentsList } from "@/components/assignments/AssignmentsList";
import type { Assignment } from "@/types/assignment";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Assignments — PaperFlow" },
      { name: "description", content: "Manage and create assignments for your classes." },
    ],
  }),
  component: AssignmentsPage,
});

const MOCK: Assignment[] = Array.from({ length: 6 }).map((_, i) => ({
  id: String(i + 1),
  title: "Quiz on Electricity",
  assignedOn: "20-06-2025",
  due: "21-06-2025",
}));

function AssignmentsPage() {
  const navigate = useNavigate();
  const [populated, setPopulated] = useState(true);

  return (
    <AppShell
      title="Assignment"
      activeKey="assignments"
      onCreate={() => navigate({ to: "/create-assignment" })}
    >
      <div className="px-4 sm:px-8 pt-4 flex items-center gap-2 max-w-[1200px] mx-auto w-full">
        <div className="inline-flex rounded-full border border-border bg-surface p-1 text-xs">
          <button
            onClick={() => setPopulated(false)}
            className={`px-3 py-1.5 rounded-full ${!populated ? "bg-foreground text-background" : "text-muted-foreground"}`}
          >
            Empty state
          </button>
          <button
            onClick={() => setPopulated(true)}
            className={`px-3 py-1.5 rounded-full ${populated ? "bg-foreground text-background" : "text-muted-foreground"}`}
          >
            Filled state
          </button>
        </div>
        <Link to="/generated-paper" className="ml-auto text-xs text-muted-foreground hover:text-foreground underline">
          View sample paper →
        </Link>
      </div>

      {populated ? (
        <AssignmentsList assignments={MOCK} onCreate={() => navigate({ to: "/create-assignment" })} />
      ) : (
        <EmptyState onCreate={() => navigate({ to: "/create-assignment" })} />
      )}
    </AppShell>
  );
}
