export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  data?: T;
  error?: ApiFailure | ValidationError;
  timestamp?: string;
  path?: string;
}

export interface ApiSuccess<T> {
  success: true;
  statusCode: number;
  data: T;
  timestamp?: string;
  path?: string;
}

export interface ApiFailure {
  code: string;
  message: string;
}

export interface ValidationError extends ApiFailure {
  details: Record<string, string[]>;
}
