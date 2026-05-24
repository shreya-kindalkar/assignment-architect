import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface PDFDataParams {
  title: string;
  dueDate: string;
  totalMarks: number;
  totalQuestions: number;
  instructions?: string;
  sections: Array<{
    title: string;
    instruction?: string;
    questions: Array<{
      number: number;
      text: string;
      difficulty: string;
      marks: number;
    }>;
  }>;
  answerKey: Array<{
    number: number;
    text: string;
  }>;
}

export class PDFService {
  /**
   * Generates a premium exam paper PDF and returns the local file path and static URL path.
   */
  static async generateExamPaperPDF(
    paperId: string,
    params: PDFDataParams
  ): Promise<{ filePath: string; relativeUrl: string }> {
    return new Promise((resolve, reject) => {
      try {
        // Setup static folders
        const outputDir = path.join(__dirname, "../../../public/pdfs");
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        const fileName = `exam_paper_${paperId}.pdf`;
        const filePath = path.join(outputDir, fileName);
        const relativeUrl = `/pdfs/${fileName}`;

        // Initialize PDF Document
        const doc = new PDFDocument({
          size: "A4",
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
          bufferPages: true
        });

        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // --- SECTION: EXAM HEADER ---
        doc.font("Helvetica-Bold").fontSize(15).fillColor("#111111").text("VEDA AI ACADEMY", { align: "center" });
        doc.moveDown(0.2);
        doc.font("Helvetica").fontSize(10).fillColor("#444444").text(`Topic / Assignment: ${params.title}`, { align: "center" });
        doc.font("Helvetica").fontSize(10).text("Level: CBSE Grade 8 Standard Evaluation", { align: "center" });
        doc.moveDown(0.5);

        // Divider
        doc.strokeColor("#cccccc");
        doc.lineWidth(1);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.4);

        // Metadata grid row
        const currentY = doc.y;
        doc.font("Helvetica-Bold").fontSize(9).fillColor("#222222");
        doc.text(`Time Allowed: 90 Minutes`, 50, currentY);
        doc.text(`Maximum Marks: ${params.totalMarks} Marks`, 220, currentY, { width: 150, align: "center" });
        doc.text(`Due Date: ${params.dueDate}`, 400, currentY, { align: "right" });
        
        doc.moveDown(0.6);
        doc.strokeColor("#cccccc");
        doc.lineWidth(1);
        doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.8);

        // General Instructions
        doc.font("Helvetica-Oblique").fontSize(8.5).fillColor("#666666");
        doc.text("General Instructions: All questions are compulsory. Carefully fill out your details in the registration box below before beginning.");
        if (params.instructions) {
          doc.text(`Special Guidelines: ${params.instructions}`);
        }
        doc.moveDown(1);

        // --- SECTION: CANDIDATE INFO BOX ---
        const boxY = doc.y;
        doc.strokeColor("#e5e5e5");
        doc.lineWidth(1);
        doc.rect(50, boxY, 495, 55).stroke();
        doc.fillColor("#111111");
        doc.font("Helvetica-Bold").fontSize(9).text("Candidate Name:", 65, boxY + 12);
        doc.font("Helvetica").text("___________________________", 150, boxY + 12);
        
        doc.font("Helvetica-Bold").text("Roll Number:", 340, boxY + 12);
        doc.font("Helvetica").text("_______________", 410, boxY + 12);

        doc.font("Helvetica-Bold").text("Class & Section:", 65, boxY + 34);
        doc.font("Helvetica").text("Grade 8 - Section _____ ", 150, boxY + 34);
        doc.font("Helvetica-Bold").text("Date of Exam:", 340, boxY + 34);
        doc.font("Helvetica").text("____/____/______", 410, boxY + 34);

        doc.moveDown(2.5);

        // --- SECTION: EXAM SECTIONS & QUESTIONS ---
        params.sections.forEach((sec) => {
          doc.moveDown(1);
          const secTitleY = doc.y;
          // Section header background banner
          doc.fillColor("#f3f4f6");
          doc.rect(50, secTitleY - 4, 495, 18).fill();
          doc.font("Helvetica-Bold").fontSize(10).fillColor("#111111").text(sec.title.toUpperCase(), 55, secTitleY, { characterSpacing: 1 });
          doc.moveDown(0.6);

          if (sec.instruction) {
            doc.font("Helvetica-Oblique").fontSize(8.5).fillColor("#555555").text(sec.instruction);
            doc.moveDown(0.6);
          }

          sec.questions.forEach((q) => {
            // Keep question elements together to avoid mid-question page-break orphan text
            const qHeightEstimate = doc.heightOfString(q.text, { width: 440 }) + 10;
            if (doc.y + qHeightEstimate > 740) {
              doc.addPage();
            }

            const startY = doc.y;
            doc.font("Helvetica-Bold").fontSize(9.5).fillColor("#111111").text(`${q.number}.`, 50, startY);
            doc.font("Helvetica").fontSize(9.5).text(q.text, 70, startY, { width: 400 });

            const metaText = `[${q.marks} ${q.marks === 1 ? 'Mark' : 'Marks'}] (${q.difficulty})`;
            doc.font("Helvetica-Oblique").fontSize(8.5).fillColor("#555555").text(metaText, 475, startY, { align: "right" });
            
            doc.moveDown(0.8);
          });
        });

        // End signature line
        doc.moveDown(2);
        doc.font("Helvetica-Bold").fontSize(9.5).fillColor("#111111").text("— End of Question Paper —", { align: "center" });

        // --- SECTION: ANSWER KEY (STANDALONE PAGE) ---
        if (params.answerKey && params.answerKey.length > 0) {
          doc.addPage();
          
          doc.font("Helvetica-Bold").fontSize(14).fillColor("#111111").text("OFFICIAL ANSWER KEY & EVALUATION GUIDE", { align: "center" });
          doc.moveDown(0.2);
          doc.font("Helvetica").fontSize(9.5).fillColor("#444444").text(`Subject Evaluation Guideline for: "${params.title}"`, { align: "center" });
          doc.moveDown(0.5);
          doc.strokeColor("#333333");
          doc.lineWidth(1.5);
          doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
          doc.moveDown(1);

          params.answerKey.forEach((ans) => {
            const ansHeight = doc.heightOfString(ans.text, { width: 440 }) + 10;
            if (doc.y + ansHeight > 740) {
              doc.addPage();
            }

            const startY = doc.y;
            doc.font("Helvetica-Bold").fontSize(9.5).fillColor("#111111").text(`Ans ${ans.number}.`, 50, startY);
            doc.font("Helvetica").fontSize(9.5).text(ans.text, 90, startY, { width: 430 });
            doc.moveDown(1);
          });
        }

        // Finalize writing
        doc.end();

        writeStream.on("finish", () => {
          console.log(`[PDF Service] Successfully exported paper PDF: ${filePath}`);
          resolve({ filePath, relativeUrl });
        });

        writeStream.on("error", (err) => {
          reject(err);
        });

      } catch (err) {
        reject(err);
      }
    });
  }
}
