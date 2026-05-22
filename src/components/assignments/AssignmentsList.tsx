import { ListFilter, Plus } from "lucide-react";
import { useState } from "react";
import { SearchInput } from "@/components/common/SearchInput";
import { PillButton } from "@/components/common/PillButton";
import { AssignmentCard } from "./AssignmentCard";
import type { Assignment } from "@/types/assignment";

export interface AssignmentsListProps {
  assignments: Assignment[];
  onCreate?: () => void;
}

export function AssignmentsList({ assignments, onCreate }: AssignmentsListProps) {
  const [q, setQ] = useState("");
  const filtered = assignments.filter((a) => a.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="px-4 sm:px-8 py-6 max-w-[1200px] mx-auto w-full">
      <div className="flex items-start gap-2 mb-6">
        <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Assignments</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and create assignments for your classes.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-5">
        <button className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ListFilter className="h-4 w-4" /> Filter By
        </button>
        <SearchInput placeholder="Search Assignment" className="sm:w-80" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((a) => (
          <AssignmentCard key={a.id} assignment={a} />
        ))}
      </div>

      <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-20">
        <PillButton onClick={onCreate} leadingIcon={<Plus className="h-4 w-4" />} className="shadow-xl">
          Create Assignment
        </PillButton>
      </div>
    </div>
  );
}
