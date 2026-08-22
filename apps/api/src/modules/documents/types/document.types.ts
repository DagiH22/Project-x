export interface DocumentResponse {
  id: string;
  userId: string;
  filename: string;
  mimeType: string;
  size: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
