import 'multer';
import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { StorageService } from '../storage/storage.service';
import { documents, Document } from '@agentdesk/db';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { DocumentResponse } from './types/document.types';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly storageService: StorageService,
  ) {}

  async uploadDocument(
    userId: string,
    file: Express.Multer.File,
  ): Promise<DocumentResponse> {
    const uuid = randomUUID();
    // E.g., documents/user-uuid/doc-uuid.pdf
    const storageKey = `documents/${userId}/${uuid}-${file.originalname}`;

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

      return newDoc as DocumentResponse;
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
      
      return docs as DocumentResponse[];
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
