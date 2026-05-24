import { ListFilter, Plus, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { SearchInput } from "@/components/common/SearchInput";
import { PillButton } from "@/components/common/PillButton";
import { AssignmentCard } from "./AssignmentCard";
import type { Assignment } from "@/types/assignment";

type SortOption = "newest" | "oldest" | "az" | "za";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  az: "Title A → Z",
  za: "Title Z → A",
};

function sortAssignments(list: Assignment[], sort: SortOption): Assignment[] {
  return [...list].sort((a, b) => {
    switch (sort) {
      case "newest":
        return b.assignedOn.localeCompare(a.assignedOn);
      case "oldest":
        return a.assignedOn.localeCompare(b.assignedOn);
      case "az":
        return a.title.localeCompare(b.title);
      case "za":
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });
}

export interface AssignmentsListProps {
  assignments: Assignment[];
  onCreate?: () => void;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function AssignmentsList({ assignments, onCreate, onView, onDelete }: AssignmentsListProps) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    if (!filterOpen) return;
    const handle = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [filterOpen]);

  // Filter by search query, then sort
  const filtered = sortAssignments(
    assignments.filter((a) =>
      a.title.toLowerCase().includes(q.trim().toLowerCase())
    ),
    sort
  );

  return (
    <div className="px-3 py-3 pb-12 lg:pb-8">
      {/* Header */}
      <div className="flex items-start gap-2 mb-3">
        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
        <div>
          <h2 className="text-[14px] font-semibold leading-tight">Assignments</h2>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Manage and create assignments for your classes.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center sm:justify-between mb-3">
        {/* Filter By dropdown */}
        <div ref={filterRef} className="relative">
          <button
            type="button"
            onClick={() => setFilterOpen((o) => !o)}
            className={`inline-flex items-center gap-1.5 text-[11px] transition-colors ${
              filterOpen ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ListFilter className="h-3.5 w-3.5" strokeWidth={2} />
            Filter By
            {sort !== "newest" && (
              <span className="ml-1 rounded-full bg-foreground text-background text-[9px] px-1.5 py-0.5 font-medium">
                {SORT_LABELS[sort]}
              </span>
            )}
          </button>

          {filterOpen && (
            <div className="absolute left-0 top-7 z-20 w-44 rounded-xl border border-[#e5e5e5] bg-white shadow-lg overflow-hidden">
              <p className="px-3.5 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Sort by
              </p>
              {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSort(key);
                    setFilterOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2 text-[11px] hover:bg-gray-50 transition-colors text-left"
                >
                  <span>{SORT_LABELS[key]}</span>
                  {sort === key && <Check className="h-3 w-3 text-foreground" strokeWidth={2.5} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <SearchInput
          placeholder="Search assignments..."
          wrapperClassName="sm:w-64"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-[12px] text-muted-foreground">
            {q
              ? `No assignments match "${q}"`
              : "No assignments found."}
          </p>
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="mt-2 text-[11px] text-foreground underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              onView={onView}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Create button */}
      <div className="sticky bottom-2 z-10 flex justify-center pt-4">
        <PillButton
          onClick={onCreate}
          leadingIcon={<Plus className="h-3.5 w-3.5" strokeWidth={2.5} />}
        >
          Create Assignment
        </PillButton>
      </div>
    </div>
  );
}
