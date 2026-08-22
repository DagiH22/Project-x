import { Test, TestingModule } from '@nestjs/testing';
import { ExtractionService } from './extraction.service';
import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

jest.mock('pdf-parse', () => {
  return {
    PDFParse: jest.fn().mockImplementation(() => {
      return {
        getText: jest.fn()
      };
    })
  };
});

describe('ExtractionService', () => {
  let service: ExtractionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExtractionService],
    }).compile();

    service = module.get<ExtractionService>(ExtractionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractText', () => {
    it('should throw BadRequestException if buffer is empty', async () => {
      await expect(service.extractText(Buffer.from(''), 'text/plain')).rejects.toThrow(BadRequestException);
    });

    it('should throw UnprocessableEntityException if buffer exceeds limit', async () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
      await expect(service.extractText(largeBuffer, 'text/plain')).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException if PDF magic bytes are invalid', async () => {
      const invalidPdf = Buffer.from('Not a PDF');
      await expect(service.extractText(invalidPdf, 'application/pdf')).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException if PDF extraction fails', async () => {
      const validPdfHeader = Buffer.from('%PDF-something');
      (PDFParse as unknown as jest.Mock).mockImplementationOnce(() => ({
        getText: jest.fn().mockRejectedValue(new Error('Parse error'))
      }));

      await expect(service.extractText(validPdfHeader, 'application/pdf')).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException if PDF has no extractable text', async () => {
      const validPdfHeader = Buffer.from('%PDF-something');
      (PDFParse as unknown as jest.Mock).mockImplementationOnce(() => ({
        getText: jest.fn().mockResolvedValue({ text: '   \n   ' })
      }));

      await expect(service.extractText(validPdfHeader, 'application/pdf')).rejects.toThrow(UnprocessableEntityException);
    });

    it('should extract text from a valid PDF', async () => {
      const validPdfHeader = Buffer.from('%PDF-something');
      (PDFParse as unknown as jest.Mock).mockImplementationOnce(() => ({
        getText: jest.fn().mockResolvedValue({ text: 'Hello PDF' })
      }));

      const result = await service.extractText(validPdfHeader, 'application/pdf');
      expect(result.text).toBe('Hello PDF');
    });

    it('should throw UnprocessableEntityException if text file has null bytes (binary)', async () => {
      const binaryData = Buffer.from([0x48, 0x00, 0x6c, 0x6c, 0x6f]); // H\0llo
      await expect(service.extractText(binaryData, 'text/plain')).rejects.toThrow(UnprocessableEntityException);
    });

    it('should throw BadRequestException for unsupported mime types', async () => {
      const data = Buffer.from('Some image data');
      await expect(service.extractText(data, 'image/jpeg')).rejects.toThrow(BadRequestException);
    });

    it('should extract text from a valid TXT file', async () => {
      const textData = Buffer.from('Hello TXT');
      const result = await service.extractText(textData, 'text/plain');
      expect(result.text).toBe('Hello TXT');
    });

    it('should normalize whitespace and line endings', async () => {
      const textData = Buffer.from('Hello \r\n\r\n\r\n World  with   spaces');
      const result = await service.extractText(textData, 'text/plain');
      expect(result.text).toBe('Hello\n\nWorld with spaces');
    });
  });
});
