import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, isError } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: Infinity,
  });

  return {
    user,
    isLoading: isLoading && !isError,
    isAuthenticated: !!user,
  };
}
