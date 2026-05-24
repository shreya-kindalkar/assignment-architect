import type { GenerationParams, GeneratedPaperOutput, QuestionItem, AnswerKeyItem } from "../types.js";

/**
 * Topic-aware fallback generator.
 *
 * Used ONLY when all Gemini API calls fail.
 * Generates questions that are contextually tied to the actual subject/title/instructions.
 * NO hardcoded science or electricity questions.
 */
export function generateFallbackPaper(params: GenerationParams): GeneratedPaperOutput {
  const { title, instructions, questionTypes } = params;

  // Build a rich topic context string from title + instructions
  const topicContext = [title, instructions].filter(Boolean).join(". ");

  const sections: GeneratedPaperOutput["sections"] = [];
  const answerKey: AnswerKeyItem[] = [];
  let questionNumber = 1;

  questionTypes.forEach((qt, sectionIndex) => {
    const sectionLetter = String.fromCharCode(65 + sectionIndex);
    const difficulty = getDifficulty(qt.marks, qt.type);
    const sectionQuestions: QuestionItem[] = [];

    for (let i = 0; i < qt.count; i++) {
      const question = buildQuestion(qt.type, difficulty, topicContext, title, i, questionNumber);
      const answer = buildAnswer(qt.type, difficulty, topicContext, title, i, qt.marks);

      sectionQuestions.push({
        number: questionNumber,
        text: question,
        difficulty,
        marks: qt.marks,
      });

      answerKey.push({
        number: questionNumber,
        text: answer,
      });

      questionNumber++;
    }

    sections.push({
      title: `Section ${sectionLetter}`,
      instruction: `Answer all questions. Each question carries ${qt.marks} mark${qt.marks !== 1 ? "s" : ""}.`,
      questions: sectionQuestions,
    });
  });

  return { sections, answerKey };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDifficulty(
  marks: number,
  type: string
): "Easy" | "Moderate" | "Challenging" {
  const t = type.toLowerCase();
  if (marks === 1 || t.includes("mcq") || t.includes("multiple choice") || t.includes("objective")) {
    return "Easy";
  }
  if (marks >= 5 || t.includes("long") || t.includes("essay") || t.includes("detailed") || t.includes("analytical")) {
    return "Challenging";
  }
  return "Moderate";
}

// Question templates keyed by difficulty and question type pattern
function buildQuestion(
  type: string,
  difficulty: "Easy" | "Moderate" | "Challenging",
  topicContext: string,
  title: string,
  index: number,
  number: number
): string {
  const t = type.toLowerCase();

  if (t.includes("mcq") || t.includes("multiple choice") || t.includes("objective")) {
    const mcqTemplates = [
      `Which of the following best describes a key concept in "${title}"?`,
      `What is the primary significance of "${title}" in its field of study?`,
      `Which factor most directly influenced the development of "${title}"?`,
      `In the context of "${topicContext}", which statement is most accurate?`,
      `What is the correct definition associated with "${title}"?`,
    ];
    return mcqTemplates[index % mcqTemplates.length];
  }

  if (difficulty === "Easy") {
    const easyTemplates = [
      `Define the term "${title}" in your own words.`,
      `State two key facts about "${topicContext}".`,
      `What is the main purpose or significance of "${title}"?`,
      `Name the key figures or elements associated with "${title}".`,
      `When and where did the events related to "${title}" take place?`,
    ];
    return easyTemplates[index % easyTemplates.length];
  }

  if (difficulty === "Moderate") {
    const moderateTemplates = [
      `Explain the causes and effects related to "${topicContext}".`,
      `Compare and contrast two major aspects of "${title}".`,
      `How did "${title}" impact the broader context of its time or field?`,
      `Describe the key events or processes involved in "${topicContext}".`,
      `What were the major challenges faced in the context of "${title}"? Explain with examples.`,
    ];
    return moderateTemplates[index % moderateTemplates.length];
  }

  // Challenging
  const challengingTemplates = [
    `Critically analyse the long-term significance of "${topicContext}". Support your answer with evidence.`,
    `Evaluate the impact of "${title}" from multiple perspectives. What were the intended and unintended consequences?`,
    `"${title}" represents a turning point in its domain. Discuss this statement with reference to key events and outcomes.`,
    `Construct a detailed argument for or against the following: "${title}" fundamentally changed the course of history/science/society.`,
    `Synthesise the key themes of "${topicContext}" and explain how they interconnect to produce the outcomes observed.`,
  ];
  return challengingTemplates[index % challengingTemplates.length];
}

function buildAnswer(
  type: string,
  difficulty: "Easy" | "Moderate" | "Challenging",
  topicContext: string,
  title: string,
  index: number,
  marks: number
): string {
  const t = type.toLowerCase();

  if (t.includes("mcq") || t.includes("multiple choice") || t.includes("objective")) {
    return `The correct answer relates to the core definition and significance of "${title}". Students should identify the option that accurately reflects the key concept. Award ${marks} mark for the correct choice.`;
  }

  if (difficulty === "Easy") {
    return `A complete answer should include: (1) a clear definition or statement about "${title}", (2) at least one supporting fact or example from "${topicContext}". Award ${marks} mark${marks !== 1 ? "s" : ""} for a concise, accurate response.`;
  }

  if (difficulty === "Moderate") {
    return `A complete answer should include: (1) identification of key causes/factors related to "${topicContext}", (2) explanation of effects or comparisons with relevant examples, (3) a concluding statement. Award ${marks} marks — allocate marks proportionally across each component.`;
  }

  return `A full-mark answer should demonstrate: (1) deep understanding of "${topicContext}" with specific evidence, (2) critical analysis from at least two perspectives, (3) well-structured argument with introduction, body, and conclusion, (4) use of relevant terminology. Award ${marks} marks based on depth of analysis, accuracy, and quality of argument.`;
}
