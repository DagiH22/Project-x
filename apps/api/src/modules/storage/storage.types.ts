export interface StorageUploadOptions {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
}

export interface StorageObjectInfo {
  key: string;
  size?: number;
  contentType?: string;
  lastModified?: Date;
}
