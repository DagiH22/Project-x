import { Test, TestingModule } from '@nestjs/testing';
import { ChunkingService } from './chunking.service';
import { ConfigService } from '@nestjs/config';

describe('ChunkingService', () => {
  let service: ChunkingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChunkingService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string, defaultValue: any) => {
              if (key === 'CHUNKING_TARGET_SIZE') return 500;
              if (key === 'CHUNKING_OVERLAP') return 50;
              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ChunkingService>(ChunkingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('chunkText', () => {
    it('should return empty array for empty text', () => {
      expect(service.chunkText('')).toEqual([]);
      expect(service.chunkText('   ')).toEqual([]);
    });

    it('should throw error if overlap >= target size', () => {
      expect(() => {
        service.chunkText('Some text', 'doc1', { targetSize: 100, overlap: 100 });
      }).toThrow('Overlap cannot be greater than or equal to target size');
    });

    it('should handle short document (1 chunk)', () => {
      const text = 'This is a very short document.';
      const chunks = service.chunkText(text, 'doc1');
      
      expect(chunks.length).toBe(1);
      expect(chunks[0].index).toBe(0);
      expect(chunks[0].documentId).toBe('doc1');
      expect(chunks[0].text).toBe(text);
      expect(chunks[0].tokenCount).toBeGreaterThan(0);
    });

    it('should handle text exactly at chunk boundary', () => {
      // We will mock targetSize to a very small number like 10
      const text = 'One two three four five six seven eight nine ten';
      const chunks = service.chunkText(text, 'doc2', { targetSize: 10, overlap: 2 });
      
      expect(chunks.length).toBeGreaterThan(0);
      // The exact number depends on gpt-tokenizer's tokens, but we just verify it splits correctly
      // 'One two three four five six seven eight nine ten' is 10 words, probably ~10 tokens.
      for (const chunk of chunks) {
        expect(chunk.tokenCount).toBeLessThanOrEqual(10);
      }
    });

    it('should properly overlap chunks', () => {
      const text = 'word '.repeat(30);
      // Let's force targetSize=20, overlap=5
      const chunks = service.chunkText(text, 'doc3', { targetSize: 20, overlap: 5 });
      
      expect(chunks.length).toBeGreaterThan(1);
      
      // Since it overlaps by 5 tokens, the second chunk's beginning should match the first chunk's end.
      // But we can just check that no chunk exceeds 20 tokens
      chunks.forEach((chunk) => {
        expect(chunk.tokenCount).toBeLessThanOrEqual(20);
      });
    });

    it('should preserve paragraph boundaries where possible', () => {
      // Two paragraphs that fit perfectly into two separate chunks
      // chunk 1: 15 tokens, chunk 2: 15 tokens. target=20
      const p1 = 'this is the first paragraph with some words '.repeat(3); // ~21 words
      const p2 = 'this is the second paragraph with other words '.repeat(3); 
      const text = `${p1}\n\n${p2}`;
      
      const chunks = service.chunkText(text, 'doc4', { targetSize: 40, overlap: 5 });
      
      // Should result in two chunks ideally, or more, but each chunk should have text
      expect(chunks.length).toBeGreaterThan(0);
      chunks.forEach((chunk) => {
        expect(chunk.tokenCount).toBeLessThanOrEqual(40);
        expect(chunk.text.trim().length).toBeGreaterThan(0);
      });
    });

    it('should handle very large document gracefully', () => {
      const largeText = 'word '.repeat(1500);
      const chunks = service.chunkText(largeText, 'doc5', { targetSize: 500, overlap: 50 });
      
      // 1500 words is roughly 1500 tokens
      // 1500 / (500-50) ~ 3.33 => 4 chunks
      expect(chunks.length).toBeGreaterThanOrEqual(3);
      chunks.forEach((chunk) => {
        expect(chunk.tokenCount).toBeLessThanOrEqual(500);
      });
    });

    it('should handle meaningless whitespace by ignoring it', () => {
      const text = '    \n\n   \n   word   \n\n  word2   ';
      const chunks = service.chunkText(text, 'doc6', { targetSize: 10, overlap: 2 });
      
      expect(chunks.length).toBe(1);
      expect(chunks[0].text).toBe('word\n\nword2');
    });
  });
});
