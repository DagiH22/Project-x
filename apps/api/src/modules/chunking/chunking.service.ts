import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { encode, decode } from 'gpt-tokenizer';

export interface DocumentChunk {
  index: number;
  documentId?: string;
  text: string;
  tokenCount: number;
}

export interface ChunkingOptions {
  targetSize?: number;
  overlap?: number;
}

@Injectable()
export class ChunkingService {
  private readonly logger = new Logger(ChunkingService.name);
  private readonly defaultTargetSize: number;
  private readonly defaultOverlap: number;

  constructor(private readonly configService: ConfigService) {
    this.defaultTargetSize = this.configService.get<number>('CHUNKING_TARGET_SIZE', 500);
    this.defaultOverlap = this.configService.get<number>('CHUNKING_OVERLAP', 50);
  }

  chunkText(
    text: string,
    documentId?: string,
    options?: ChunkingOptions,
  ): DocumentChunk[] {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const targetSize = options?.targetSize ?? this.defaultTargetSize;
    const overlap = options?.overlap ?? this.defaultOverlap;

    if (overlap >= targetSize) {
      throw new Error('Overlap cannot be greater than or equal to target size');
    }

    // Split text into paragraphs to try to preserve semantic boundaries
    const paragraphs = text.split(/\n{2,}/);
    const chunks: DocumentChunk[] = [];
    let currentChunkTokens: number[] = [];
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
      const paragraphText = paragraph.trim();
      if (!paragraphText) continue;
      
      const paragraphTokens = encode(paragraphText);
      
      // If adding this paragraph exceeds target size and we have tokens to flush
      if (currentChunkTokens.length > 0) {
        const newlineTokens = encode('\n\n');
        if (currentChunkTokens.length + newlineTokens.length + paragraphTokens.length > targetSize) {
          
          const chunkText = decode(currentChunkTokens).trim();
          if (chunkText.length > 0) {
            chunks.push({
              index: chunkIndex++,
              documentId,
              text: chunkText,
              tokenCount: currentChunkTokens.length,
            });
          }

          // Start new chunk with overlap
          currentChunkTokens = [...currentChunkTokens.slice(-overlap)];
        }
      }

      // Re-evaluate if we need a newline separator after flushing
      const newlineTokens = currentChunkTokens.length > 0 ? encode('\n\n') : [];
      
      // If this paragraph still exceeds capacity, we split it forcefully
      if (currentChunkTokens.length + newlineTokens.length + paragraphTokens.length > targetSize) {
        if (newlineTokens.length > 0) {
          currentChunkTokens.push(...newlineTokens);
        }

        let i = 0;
        while (i < paragraphTokens.length) {
          const remainingCapacity = targetSize - currentChunkTokens.length;
          
          if (remainingCapacity <= 0) {
             const chunkText = decode(currentChunkTokens).trim();
             if (chunkText.length > 0) {
               chunks.push({
                 index: chunkIndex++,
                 documentId,
                 text: chunkText,
                 tokenCount: currentChunkTokens.length,
               });
             }
             currentChunkTokens = [...currentChunkTokens.slice(-overlap)];
             continue; 
          }

          const slice = paragraphTokens.slice(i, i + remainingCapacity);
          currentChunkTokens.push(...slice);
          i += slice.length;

          if (currentChunkTokens.length >= targetSize) {
            const chunkText = decode(currentChunkTokens).trim();
            if (chunkText.length > 0) {
              chunks.push({
                index: chunkIndex++,
                documentId,
                text: chunkText,
                tokenCount: currentChunkTokens.length,
              });
            }
            currentChunkTokens = [...currentChunkTokens.slice(-overlap)];
          }
        }
      } else {
        if (newlineTokens.length > 0) {
           currentChunkTokens.push(...newlineTokens);
        }
        currentChunkTokens.push(...paragraphTokens);
      }
    }

    // Push the remaining tokens if any
    if (currentChunkTokens.length > 0) {
      const finalString = decode(currentChunkTokens).trim();
      if (finalString.length > 0) {
        chunks.push({
          index: chunkIndex++,
          documentId,
          text: finalString,
          tokenCount: currentChunkTokens.length,
        });
      }
    }

    return chunks;
  }
}
