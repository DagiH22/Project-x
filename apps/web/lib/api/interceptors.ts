import { axiosInstance } from './axios';
import { parseApiError } from '../errors/error-parser';

export function setupInterceptors() {
  axiosInstance.interceptors.request.use(
    (config) => {
      // Add any request transformations here
      return config;
    },
    (error) => {
      return Promise.reject(parseApiError(error));
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      // In a unified response model, we might want to return response.data directly
      // if every endpoint wraps response in ApiResponse<T>
      return response;
    },
    (error) => {
      return Promise.reject(parseApiError(error));
    }
  );
}

// Call this immediately to attach interceptors
setupInterceptors();
