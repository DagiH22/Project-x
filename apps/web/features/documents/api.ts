import { apiClient } from '@/lib/api/client';

/**
 * Document as returned by the API.
 * storageKey is intentionally absent — it is an internal S3 path
 * and must not be exposed to or used by the frontend.
 */
export interface Document {
  id: string;
  userId: string;
  filename: string;
  mimeType: string;
  size: number;
  status: 'uploaded' | 'processing' | 'ready' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export const getDocuments = (): Promise<Document[]> => {
  return apiClient.get<Document[]>('/documents');
};

export const uploadDocument = (file: File): Promise<Document> => {
  const formData = new FormData();
  formData.append('file', file);

  // Do NOT manually set Content-Type for multipart/form-data.
  // The browser must set it automatically so the correct boundary is included.
  return apiClient.post<Document>('/documents', formData);
};

export const deleteDocument = (id: string): Promise<void> => {
  return apiClient.delete<void>(`/documents/${id}`);
};
