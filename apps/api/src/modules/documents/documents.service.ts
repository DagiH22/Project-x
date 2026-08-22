import 'multer';
import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { StorageService } from '../storage/storage.service';
import { documents } from '@agentdesk/db';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { DocumentResponse } from './types/document.types';
import { ExtractionService } from '../extraction/extraction.service';
@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly storageService: StorageService,
    private readonly extractionService: ExtractionService,
  ) {}

  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
  ): Promise<DocumentResponse> {
    // 1. Verify content before uploading (throws if invalid or empty)
    await this.extractionService.extractText(file.buffer, file.mimetype);

    const uuid = randomUUID();
    // Use only UUID + sanitized extension — never embed the original filename in the storage key
    // to prevent path traversal and to avoid exposing user-supplied filenames in storage.
    const safeExt = extname(file.originalname).replace(/[^a-zA-Z0-9.]/g, '').slice(0, 10);
    const storageKey = `documents/${userId}/${uuid}${safeExt}`;

    try {
      await this.storageService.upload({
        key: storageKey,
        body: file.buffer,
        contentType: file.mimetype,
      });
    } catch (error: any) {
      this.logger.error(`Failed to upload document to storage: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to upload document to storage');
    }

    try {
      const [newDoc] = await this.databaseService.db
        .insert(documents)
        .values({
          userId,
          filename: file.originalname,
          storageKey,
          mimeType: file.mimetype,
          size: file.size,
          status: 'uploaded',
        })
        .returning();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { storageKey: _storageKey, ...safeDoc } = newDoc;
      return safeDoc as DocumentResponse;
    } catch (error: any) {
      this.logger.error(`Failed to save document metadata in DB. Rolling back storage.`, error.stack);
      
      // Cleanup storage since DB failed
      try {
        await this.storageService.delete(storageKey);
      } catch (cleanupError: any) {
        this.logger.error(`Failed to clean up storage after DB failure for key ${storageKey}`, cleanupError.stack);
      }
      
      throw new InternalServerErrorException('Failed to save document metadata');
    }
  }

  async getDocumentsForUser(userId: string): Promise<DocumentResponse[]> {
    try {
      const docs = await this.databaseService.db
        .select()
        .from(documents)
        .where(eq(documents.userId, userId));
      
      // Strip internal storageKey from client response
      return docs.map(({ storageKey: _k, ...rest }) => rest) as DocumentResponse[];
    } catch (error: any) {
      this.logger.error(`Failed to retrieve documents for user ${userId}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve documents');
    }
  }

  async deleteDocument(userId: string, documentId: string): Promise<void> {
    const [doc] = await this.databaseService.db
      .select()
      .from(documents)
      .where(and(eq(documents.id, documentId), eq(documents.userId, userId)))
      .limit(1);

    if (!doc) {
      throw new NotFoundException('Document not found or you do not have permission to delete it');
    }

    // 1. Delete from object storage
    try {
      await this.storageService.delete(doc.storageKey);
    } catch (error: any) {
      this.logger.error(`Failed to delete document from storage (key: ${doc.storageKey})`, error.stack);
      throw new InternalServerErrorException('Failed to delete document from storage');
    }

    // 2. Delete metadata from PostgreSQL
    try {
      await this.databaseService.db
        .delete(documents)
        .where(eq(documents.id, documentId));
    } catch (error: any) {
      this.logger.error(`Failed to delete document metadata from DB (id: ${documentId})`, error.stack);
      throw new InternalServerErrorException('Failed to delete document metadata');
    }
  }
}
