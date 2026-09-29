import fs from "fs";
import path from "path";
import { createRequire } from "module";
import mammoth from "mammoth";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export const extractFileText = async (filePath, originalName) => {
  const buffer = await fs.promises.readFile(filePath);
  const extension = path.extname(originalName).toLowerCase();

  if (extension === ".pdf") {
    const result = await pdfParse(buffer);
    return result.text.trim();
  }

  if (extension === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  return buffer.toString("utf8").trim();
};

export const getDocumentText = async (document) => {
  if (document.extractedText?.trim()) return document.extractedText;
  if (!document.filePath || !fs.existsSync(document.filePath)) return "";

  const text = await extractFileText(document.filePath, document.originalName);
  if (text) {
    document.extractedText = text;
    document.status = "ready";
    await document.save();
  }
  return text;
};
