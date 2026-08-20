import { apiClient } from '@/lib/api/client';


export interface Document {
  id: string;
  userId: string;
  filename: string;
  storageKey: string;
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
  
  return apiClient.post<Document>('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteDocument = (id: string): Promise<void> => {
  return apiClient.delete<void>(`/documents/${id}`);
};
