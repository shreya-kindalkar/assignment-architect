import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/assignments/EmptyState";
import { AssignmentsList } from "@/components/assignments/AssignmentsList";
import { useAssignmentStore } from "@/hooks/useAssignmentStore";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Assignments — PaperFlow" },
      { name: "description", content: "Manage and create assignments for your classes." },
    ],
  }),
  component: AssignmentsPage,
});

function AssignmentsPage() {
  const navigate = useNavigate();
  const { assignments, fetchAssignments, deleteAssignment, isLoading } = useAssignmentStore();

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleView = (id: string) => {
    navigate({ to: "/generated-paper", search: { id } });
  };

  const handleDelete = async (id: string) => {
    await deleteAssignment(id);
  };

  return (
    <AppShell
      title="Assignment"
      activeKey="assignments"
      onCreate={() => navigate({ to: "/create-assignment" })}
    >
      {isLoading && assignments.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading assignments...</span>
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState onCreate={() => navigate({ to: "/create-assignment" })} />
      ) : (
        <AssignmentsList
          assignments={assignments}
          onCreate={() => navigate({ to: "/create-assignment" })}
          onView={handleView}
          onDelete={handleDelete}
        />
      )}
    </AppShell>
  );
}
