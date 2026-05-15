import { StatusCodes } from "http-status-codes";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";

import { ApiError } from "../utils/api-error.js";

const cleanExtractedText = (text) =>
  text
    .replace(/\r/g, "\n")
    .replace(/\t+/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();

class DocumentTextService {
  async extractTextFromFile(file) {
    if (!file?.buffer?.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Uploaded file is empty");
    }

    try {
      const rawText = await this.getRawText(file);
      const cleanedText = cleanExtractedText(rawText);

      if (!cleanedText) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "No readable text could be extracted from the file");
      }

      return cleanedText;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to extract text from the uploaded file", {
        fileName: file.originalname,
        mimeType: file.mimetype,
        cause: error.message,
      });
    }
  }

  async getRawText(file) {
    switch (file.mimetype) {
      case "application/pdf":
        return this.extractPdfText(file.buffer);
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return this.extractDocxText(file.buffer);
      case "application/msword":
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Legacy DOC files are not supported yet. Please upload a PDF or DOCX file.",
        );
      default:
        throw new ApiError(StatusCodes.BAD_REQUEST, "Unsupported file type");
    }
  }

  async extractPdfText(buffer) {
    try {
      const parsed = await pdfParse(buffer);
      return parsed.text ?? "";
    } catch (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Unable to read PDF. The file may be corrupted.", {
        cause: error.message,
      });
    }
  }

  async extractDocxText(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value ?? "";
    } catch (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Unable to read DOCX. The file may be corrupted.", {
        cause: error.message,
      });
    }
  }
}

export const documentTextService = new DocumentTextService();
