import { AIService } from "./src/services/ai.service.js";
import { PDFService } from "./src/services/pdf.service.js";
import fs from "fs";
import path from "path";

async function runVerification() {
  console.log("====================================================");
  console.log("   VedaAI Backend Integration Testing Engine        ");
  console.log("====================================================");

  try {
    const testParams = {
      title: "Electroplating & Electrolysis Assessment",
      dueDate: "30-06-2026",
      instructions: "Generate a comprehensive science evaluation paper focusing on CBSE NCERT chapter standards.",
      questionTypes: [
        { type: "Multiple Choice Questions", count: 3, marks: 1 },
        { type: "Short Questions", count: 2, marks: 3 },
        { type: "Numerical Problems", count: 1, marks: 5 }
      ],
      totalQuestions: 6,
      totalMarks: 14
    };

    // 1. Test AI Question Paper Generation (Mocks or Gemini REST fetch)
    console.log("\n[TEST 1] AI Structured Prompt Builder & Generation...");
    const aiOutput = await AIService.generatePaper(testParams);
    
    console.log(">> Generated Sections:");
    aiOutput.sections.forEach((sec) => {
      console.log(`   - ${sec.title} (${sec.questions.length} questions): ${sec.instruction || ""}`);
      sec.questions.forEach((q) => {
        console.log(`     [Q ${q.number}] [${q.marks}M] (${q.difficulty}) ${q.text.substring(0, 50)}...`);
      });
    });

    console.log(">> Generated Answer Key:");
    aiOutput.answerKey.forEach((ans) => {
      console.log(`   - Ans ${ans.number}: ${ans.text.substring(0, 60)}...`);
    });

    if (aiOutput.sections.length === 0 || aiOutput.answerKey.length === 0) {
      throw new Error("AI Generation returned empty results!");
    }
    console.log("✔ AI Structured Generation Verified Successfully!");

    // 2. Test PDFKit Generation
    console.log("\n[TEST 2] Server-Side PDFKit Exporter...");
    const testPaperId = "test_verification_uuid";
    const pdfResult = await PDFService.generateExamPaperPDF(testPaperId, {
      title: testParams.title,
      dueDate: testParams.dueDate,
      totalMarks: testParams.totalMarks,
      totalQuestions: testParams.totalQuestions,
      instructions: testParams.instructions,
      sections: aiOutput.sections,
      answerKey: aiOutput.answerKey
    });

    console.log(`>> Local PDF File Path: ${pdfResult.filePath}`);
    console.log(`>> Static PDF Download Link: ${pdfResult.relativeUrl}`);

    if (!fs.existsSync(pdfResult.filePath)) {
      throw new Error("PDF File was not saved to static directory!");
    }

    const stats = fs.statSync(pdfResult.filePath);
    console.log(`>> Compiled PDF File Size: ${stats.size} Bytes`);

    console.log("✔ Typographic PDF Exporter Verified Successfully!");
    
    console.log("\n====================================================");
    console.log("  ✔ ALL BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY! ");
    console.log("====================================================");
    process.exit(0);

  } catch (err: any) {
    console.error("\n❌ VERIFICATION TEST FAILED:");
    console.error(err.stack || err.message);
    process.exit(1);
  }
}

runVerification();
