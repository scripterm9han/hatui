import mammoth from "mammoth";

/**
 * Extracts plain text from PDF, DOCX, or text file buffers
 */
export async function parseFileToText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    try {
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      return data.text || "";
    } catch (err: any) {
      throw new Error(`Failed to parse PDF document: ${err.message || err}`);
    }
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    } catch (err: any) {
      throw new Error(`Failed to parse Word document: ${err.message || err}`);
    }
  }

  if (mimeType.startsWith("text/")) {
    return buffer.toString("utf-8");
  }

  throw new Error(`Unsupported file type: ${mimeType}. Please upload PDF, DOCX, or TXT.`);
}
