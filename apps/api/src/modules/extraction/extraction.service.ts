import { Injectable, Logger, BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

export interface ExtractionResult {
  text: string;
}

@Injectable()
export class ExtractionService {
  private readonly logger = new Logger(ExtractionService.name);

  // Maximum size allowed for extraction: 10MB
  private readonly MAX_EXTRACTION_SIZE = 10 * 1024 * 1024; 

  async extractText(
    buffer: Buffer,
    mimeType: string,
  ): Promise<ExtractionResult> {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException('The document is empty');
    }

    if (buffer.length > this.MAX_EXTRACTION_SIZE) {
      throw new UnprocessableEntityException('The document exceeds the maximum allowed processing size');
    }

    let rawText = '';

    if (mimeType === 'application/pdf') {
      // Validate PDF magic bytes: %PDF- (25 50 44 46 2D)
      if (buffer.length < 5 || buffer.toString('ascii', 0, 5) !== '%PDF-') {
        throw new UnprocessableEntityException('The file content does not match a valid PDF format');
      }

      try {
        const parser = new PDFParse({ data: buffer });
        const data = await parser.getText();
        rawText = data.text;
      } catch (error: any) {
        this.logger.warn(`PDF extraction failed: ${error.message}`);
        throw new UnprocessableEntityException('Failed to parse PDF document. It might be corrupted or malformed.');
      }
    } else if (mimeType === 'text/plain') {
      // Validate that the text file does not contain null bytes (which usually indicates binary data)
      const head = buffer.subarray(0, Math.min(buffer.length, 8192));
      if (head.includes(0x00)) {
         throw new UnprocessableEntityException('The file content does not appear to be valid plain text (binary data detected)');
      }
      
      // Convert to UTF-8
      rawText = buffer.toString('utf8');
    } else {
      throw new BadRequestException(`Unsupported file type: ${mimeType}`);
    }

    const normalizedText = this.normalizeText(rawText);

    if (!normalizedText || normalizedText.trim().length === 0) {
      throw new UnprocessableEntityException('The document contains no extractable text');
    }

    return {
      text: normalizedText,
    };
  }

  private normalizeText(text: string): string {
    if (!text) return '';
    return text
      // Replace carriage returns with standard newlines
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Remove spaces around newlines
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n[ \t]+/g, '\n')
      // Remove excessive newlines (more than 2 consecutive newlines become 2 newlines to preserve paragraphs)
      .replace(/\n{3,}/g, '\n\n')
      // Remove excessive horizontal whitespace (more than 2 consecutive spaces/tabs become 1 space)
      .replace(/[ \t]{2,}/g, ' ')
      // Trim leading/trailing whitespace
      .trim();
  }
}
