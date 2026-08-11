import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { QUERY_KEYS } from '@/lib/react-query/query-keys';
import { LoginFormData, RegisterFormData } from '../validation/auth.schema';

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: QUERY_KEYS.AUTH.ME,
    queryFn: authApi.getCurrentUser,
    retry: false, // Do not retry on 401
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginFormData) => authApi.login(credentials),
    onSuccess: (user) => {
      queryClient.setQueryData(QUERY_KEYS.AUTH.ME, user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (credentials: Omit<RegisterFormData, 'confirmPassword'>) => authApi.register(credentials),
    // After register, you might redirect to login, or log them in automatically.
    // The exact flow depends on whether backend sets cookie on register.
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(QUERY_KEYS.AUTH.ME, null);
      window.location.href = '/login';
    },
  });

  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading: isUserLoading || loginMutation.isPending || logoutMutation.isPending,
    isUserLoading,
    
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
  };
}
