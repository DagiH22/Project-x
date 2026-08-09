import axios from 'axios';
import { ApiError } from './api-error';
import { ApiResponse } from '@/types/api';

export function parseApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    // Timeout error
    if (error.code === 'ECONNABORTED') {
      return new ApiError('The request took too long. Please try again.', 408, 'TIMEOUT_ERROR');
    }

    // Network error
    if (!error.response) {
      return new ApiError('Unable to connect to the server.', 0, 'NETWORK_ERROR');
    }

    // Backend formatted error
    const responseData = error.response.data as ApiResponse | undefined;
    
    if (responseData) {
      // Handle the custom SaaS API Error format
      if (responseData.error && typeof responseData.error === 'object') {
        const errPayload = responseData.error as any;
        return new ApiError(
          errPayload.message || 'An unexpected error occurred.',
          responseData.statusCode || error.response.status,
          errPayload.code || 'API_ERROR',
          errPayload.details
        );
      }
      
      // Handle standard NestJS validation error format: { message: string[], error: string, statusCode: 400 }
      if (Array.isArray(responseData.message)) {
        // Map string[] messages to a details object (general or field specific)
        // Usually NestJS returns messages like "email must be an email"
        const details: Record<string, string[]> = {};
        responseData.message.forEach((msg: string) => {
          const field = msg.split(' ')[0]; // rough guess at field name
          if (!details[field]) details[field] = [];
          details[field].push(msg);
        });
        
        return new ApiError(
          'Validation failed',
          responseData.statusCode || error.response.status,
          'VALIDATION_ERROR',
          details
        );
      }
      
      // Handle standard string error message
      if (typeof responseData.message === 'string') {
        return new ApiError(
          responseData.message,
          responseData.statusCode || error.response.status,
          typeof responseData.error === 'string' ? responseData.error : 'API_ERROR'
        );
      }
    }

    // Unformatted server errors
    if (error.response.status >= 500) {
      return new ApiError('Something went wrong. Please try again.', error.response.status, 'SERVER_ERROR');
    }

    return new ApiError(
      error.message || 'An unexpected error occurred.',
      error.response.status,
      'UNKNOWN_ERROR'
    );
  }

  // Fallback for non-axios errors
  return new ApiError(
    error instanceof Error ? error.message : 'An unexpected error occurred.',
    500,
    'UNKNOWN_ERROR'
  );
}
