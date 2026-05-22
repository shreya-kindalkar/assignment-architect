import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { GeneratedPaper } from "@/components/assignments/GeneratedPaper";
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

const SECTIONS: QuestionPaperSection[] = [
  {
    title: "Section A",
    instruction: "Attempt all questions. Each question carries 2 marks",
    questions: [
      { number: 1, difficulty: "Easy", text: "Define electroplating. Explain its purpose.", marks: 2 },
      { number: 2, difficulty: "Moderate", text: "What is the role of a conductor in the process of electrolysis?", marks: 2 },
      { number: 3, difficulty: "Easy", text: "Why does a solution of copper sulfate conduct electricity?", marks: 2 },
      { number: 4, difficulty: "Moderate", text: "Describe one example of the chemical effect of electric current in daily life.", marks: 2 },
      { number: 5, difficulty: "Moderate", text: "Explain why electric current is said to have chemical effects.", marks: 2 },
      { number: 6, difficulty: "Challenging", text: "How is sodium hydroxide prepared during the electrolysis of brine? Write the chemical reaction involved.", marks: 2 },
      { number: 7, difficulty: "Challenging", text: "What happens at the cathode and anode during the electrolysis of water? Name the gases evolved.", marks: 2 },
      { number: 8, difficulty: "Easy", text: "Mention the type of current used in electroplating and justify why it is used.", marks: 2 },
      { number: 9, difficulty: "Moderate", text: "What is the importance of electric current in the field of metallurgy?", marks: 2 },
      { number: 10, difficulty: "Challenging", text: "Explain with a chemical equation how copper is deposited during the electroplating of an object.", marks: 2 },
    ],
  },
];

const ANSWER_KEY = [
  { number: 1, text: "Electroplating is the process of depositing a thin layer of metal on the surface of another metal using electric current. Its purpose is to prevent corrosion, improve appearance, or increase thickness." },
  { number: 2, text: "A conductor allows the flow of electric current, causing ions in the electrolyte to move and enabling chemical changes at electrodes." },
  { number: 3, text: "Copper sulfate solution contains free copper and sulfate ions which carry electric charge, thus conducting electricity." },
  { number: 4, text: "An example is the electroplating of silver on jewelry to prevent tarnishing." },
  { number: 5, text: "Electric current causes the movement of ions leading to chemical changes at the electrodes, hence it shows chemical effects." },
];

function GeneratedPaperPage() {
  const navigate = useNavigate();
  return (
    <AppShell
      title="Create New"
      activeKey="assignments"
      showBack
      onBack={() => navigate({ to: "/create-assignment" })}
      onCreate={() => navigate({ to: "/create-assignment" })}
    >
      <GeneratedPaper
        school="Delhi Public School, Sector-4, Bokaro"
        subject="English"
        classLabel="5th"
        timeAllowed="45 minutes"
        maxMarks={20}
        sections={SECTIONS}
        answerKey={ANSWER_KEY}
        aiNote="Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade 8 Science classes on the NCERT chapters:"
        onDownload={() => window.print()}
      />
    </AppShell>
  );
}
