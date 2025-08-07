import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coins, Zap, Gift, TrendingUp } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import PokecoinDisplay from "@/components/pokecoin-display";
import PokemonCard from "@/components/pokemon-card";
import { rollPokemon } from "@/lib/pokemon-api";
import type { User, PokemonRoll } from "@shared/schema";

const CURRENT_USER_ID = "test-user-1"; // In a real app, this would come from auth

export default function Home() {
  const [isRolling, setIsRolling] = useState(false);
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/users", CURRENT_USER_ID],
  });

  const { data: recentRolls } = useQuery<PokemonRoll[]>({
    queryKey: ["/api/pokemon/rolls", CURRENT_USER_ID],
  });

  const dailyBonusMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/users/${CURRENT_USER_ID}/daily-bonus`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", CURRENT_USER_ID] });
      toast({
        title: "Daily Bonus Claimed!",
        description: "You received 100 Pokecoins!",
      });
    },
    onError: () => {
      toast({
        title: "Daily Bonus Not Available",
        description: "You can claim your daily bonus once every 24 hours.",
        variant: "destructive",
      });
    },
  });

  const rollMutation = useMutation({
    mutationFn: async (rollData: any) => {
      const response = await apiRequest("POST", "/api/pokemon/roll", rollData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", CURRENT_USER_ID] });
      queryClient.invalidateQueries({ queryKey: ["/api/pokemon/rolls", CURRENT_USER_ID] });
      setIsRolling(false);
    },
    onError: () => {
      toast({
        title: "Roll Failed",
        description: "Insufficient Pokecoins or an error occurred.",
        variant: "destructive",
      });
      setIsRolling(false);
    },
  });

  const handlePokemonRoll = async (cost: number) => {
    if (isRolling || !user || user.pokecoinBalance < cost) return;
    
    setIsRolling(true);
    const pokemonData = await rollPokemon();
    
    if (pokemonData) {
      rollMutation.mutate({
        userId: CURRENT_USER_ID,
        pokemonId: pokemonData.id,
        pokemonName: pokemonData.name,
        pokemonData,
        cost,
      });
    } else {
      setIsRolling(false);
      toast({
        title: "Roll Failed",
        description: "Failed to fetch Pokemon data.",
        variant: "destructive",
      });
    }
  };

  const canClaimDaily = user?.lastDailyBonus 
    ? new Date().getTime() - new Date(user.lastDailyBonus).getTime() >= 24 * 60 * 60 * 1000
    : true;

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Pokemon Gambling Bot
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          ⚠️ Virtual currency only - No real money value - For entertainment purposes only
        </p>
        {user && <PokecoinDisplay balance={user.pokecoinBalance} />}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Daily Bonus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Daily Bonus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Claim your daily 100 Pokecoin bonus!
            </p>
            <Button 
              onClick={() => dailyBonusMutation.mutate()}
              disabled={!canClaimDaily || dailyBonusMutation.isPending}
              className="w-full"
            >
              {dailyBonusMutation.isPending ? "Claiming..." : canClaimDaily ? "Claim Bonus" : "Already Claimed"}
            </Button>
          </CardContent>
        </Card>

        {/* Pokemon Rolling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Pokemon Rolling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => handlePokemonRoll(50)}
              disabled={isRolling || !user || user.pokecoinBalance < 50}
              className="w-full"
              variant="outline"
            >
              Roll Pokemon (50 <Coins className="h-4 w-4 inline" />)
            </Button>
            <Button 
              onClick={() => handlePokemonRoll(100)}
              disabled={isRolling || !user || user.pokecoinBalance < 100}
              className="w-full"
            >
              Premium Roll (100 <Coins className="h-4 w-4 inline" />)
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {user && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Earned:</span>
                  <Badge variant="outline">{user.totalEarned} PC</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Spent:</span>
                  <Badge variant="outline">{user.totalSpent} PC</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Rolls Made:</span>
                  <Badge variant="outline">{recentRolls?.length || 0}</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Rolls */}
      {recentRolls && recentRolls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Pokemon Rolls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentRolls.slice(0, 6).map((roll) => (
                <PokemonCard 
                  key={roll.id} 
                  pokemon={roll.pokemonData as any}
                  cost={roll.cost}
                  timestamp={roll.timestamp}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
