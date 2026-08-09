import { ValidationError } from '@/types/api';

export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number,
    code: string = 'UNKNOWN_ERROR',
    details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    
    // Set the prototype explicitly when extending a built-in class in TypeScript
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}
