import { apiClient } from '@/lib/api/client';
import { ApiResponse, ApiSuccess } from '@/types/api';
import { User } from '@/types/user';
import { LoginFormData, RegisterFormData } from '../validation/auth.schema';

export const authApi = {
  login: async (credentials: LoginFormData): Promise<ApiSuccess<User>> => {
    return apiClient.post<ApiSuccess<User>>('/auth/login', credentials);
  },

  register: async (credentials: Omit<RegisterFormData, 'confirmPassword'>): Promise<ApiSuccess<User>> => {
    return apiClient.post<ApiSuccess<User>>('/auth/register', credentials);
  },

  logout: async (): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/auth/logout');
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get<ApiSuccess<User>>('/auth/me');
      return response.data;
    } catch (error: any) {
      if (error?.statusCode === 401) {
        try {
          await apiClient.post('/auth/logout');
        } catch (_) {}
        return null;
      }
      throw error;
    }
  },
};
