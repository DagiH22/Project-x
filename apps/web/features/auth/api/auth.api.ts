import { apiClient } from '@/lib/api/client';
import { ApiResponse, ApiSuccess } from '@/types/api';
import { User } from '@/types/user';
import { LoginFormData, RegisterFormData } from '../validation/auth.schema';

export const authApi = {
  login: async (credentials: LoginFormData): Promise<User> => {
    return apiClient.post<User>('/auth/login', credentials);
  },

  register: async (credentials: Omit<RegisterFormData, 'confirmPassword'>): Promise<User> => {
    return apiClient.post<User>('/auth/register', credentials);
  },

  logout: async (): Promise<ApiResponse> => {
    return apiClient.post<ApiResponse>('/auth/logout');
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const user = await apiClient.get<User>('/auth/me');
      return user ?? null;
    } catch (error: any) {
      if (error?.statusCode === 401) {
        return null;
      }
      throw error;
    }
  },
};
