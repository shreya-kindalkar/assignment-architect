import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { CreateAssignmentForm } from "@/components/assignments/CreateAssignmentForm";

export const Route = createFileRoute("/create-assignment")({
  head: () => ({
    meta: [
      { title: "Create Assignment — PaperFlow" },
      { name: "description", content: "Set up a new assignment for your students." },
    ],
  }),
  component: CreateAssignmentPage,
});

function CreateAssignmentPage() {
  const navigate = useNavigate();
  return (
    <AppShell
      title="Assignment"
      activeKey="assignments"
      showBack
      onBack={() => navigate({ to: "/" })}
      onCreate={() => navigate({ to: "/create-assignment" })}
    >
      <CreateAssignmentForm onSubmit={() => navigate({ to: "/generated-paper" })} />
    </AppShell>
  );
}
