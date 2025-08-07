import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

const CURRENT_USER_ID = "test-user-1";

export function usePokecoins() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/users", CURRENT_USER_ID],
  });

  const claimDailyBonus = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/users/${CURRENT_USER_ID}/daily-bonus`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", CURRENT_USER_ID] });
    },
  });

  const canClaimDaily = user?.lastDailyBonus 
    ? new Date().getTime() - new Date(user.lastDailyBonus).getTime() >= 24 * 60 * 60 * 1000
    : true;

  return {
    balance: user?.pokecoinBalance || 0,
    totalEarned: user?.totalEarned || 0,
    totalSpent: user?.totalSpent || 0,
    canClaimDaily,
    claimDailyBonus,
    isLoading,
    user,
  };
}
