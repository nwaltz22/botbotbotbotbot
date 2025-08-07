import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Coins, Zap, Dice1 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import PokemonCard from "@/components/pokemon-card";
import { rollPokemon } from "@/lib/pokemon-api";
import type { PokemonRoll } from "@shared/schema";

const CURRENT_USER_ID = "test-user-1"; // In a real app, this would come from auth

export default function Home() {
  const [isRolling, setIsRolling] = useState(false);
  const [rollResult, setRollResult] = useState<number | null>(null);
  const { toast } = useToast();



  const { data: recentRolls } = useQuery<PokemonRoll[]>({
    queryKey: ["/api/pokemon/rolls", CURRENT_USER_ID],
  });



  const rollMutation = useMutation({
    mutationFn: async (rollData: any) => {
      const response = await apiRequest("POST", "/api/pokemon/roll", rollData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pokemon/rolls", CURRENT_USER_ID] });
      setIsRolling(false);
    },
    onError: () => {
      toast({
        title: "Roll Failed",
        description: "An error occurred while rolling.",
        variant: "destructive",
      });
      setIsRolling(false);
    },
  });

  const handlePokemonRoll = async () => {
    if (isRolling) return;
    
    setIsRolling(true);
    const pokemonData = await rollPokemon();
    
    if (pokemonData) {
      rollMutation.mutate({
        userId: CURRENT_USER_ID,
        pokemonId: pokemonData.id,
        pokemonName: pokemonData.name,
        pokemonData,
        cost: 0,
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

  const handleNumberRoll = () => {
    const result = Math.floor(Math.random() * 100) + 1;
    setRollResult(result);
  };





  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          EWagerBot
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Roll Pokemon and track gambling results
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pokemon Rolling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Pokemon Rolling (1025)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Roll a random Pokemon from 1-1025
            </p>
            <Button 
              onClick={handlePokemonRoll}
              disabled={isRolling}
              className="w-full"
            >
              {isRolling ? "Rolling..." : "Roll Pokemon"}
            </Button>
          </CardContent>
        </Card>

        {/* Number Roll */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dice1 className="h-5 w-5" />
              Number Roll (1-100)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Roll a random number between 1 and 100
            </p>
            <Button 
              onClick={handleNumberRoll}
              className="w-full"
              variant="outline"
            >
              Roll Number
            </Button>
            {rollResult && (
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {rollResult}
                </div>
                <div className="text-sm text-muted-foreground">
                  Your roll result
                </div>
              </div>
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
