import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dice1, Coins, Heart, Diamond, Club, Spade } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import PokecoinDisplay from "@/components/pokecoin-display";
import CasinoGames from "@/components/casino-games";
import type { User, GamblingGame } from "@shared/schema";

const CURRENT_USER_ID = "test-user-1";

export default function Casino() {
  const [betAmount, setBetAmount] = useState(10);
  const { toast } = useToast();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/users", CURRENT_USER_ID],
  });

  const { data: gamblingHistory } = useQuery<GamblingGame[]>({
    queryKey: ["/api/gambling/history", CURRENT_USER_ID],
  });

  const playGameMutation = useMutation({
    mutationFn: async (gameData: any) => {
      const response = await apiRequest("POST", "/api/gambling/play", gameData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", CURRENT_USER_ID] });
      queryClient.invalidateQueries({ queryKey: ["/api/gambling/history", CURRENT_USER_ID] });
      
      const { result, payout, bet } = data;
      if (result === "win") {
        toast({
          title: "You Won!",
          description: `You won ${payout - bet} Pokecoins!`,
        });
      } else if (result === "tie") {
        toast({
          title: "It's a Tie!",
          description: "Your bet has been returned.",
        });
      } else {
        toast({
          title: "You Lost",
          description: `Better luck next time!`,
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Game Error",
        description: "Insufficient Pokecoins or game error occurred.",
        variant: "destructive",
      });
    },
  });

  const totalWinnings = gamblingHistory?.reduce((sum, game) => 
    sum + (game.payout - game.bet), 0) || 0;

  const gamesPlayed = gamblingHistory?.length || 0;
  const winRate = gamesPlayed > 0 
    ? Math.round((gamblingHistory?.filter(g => g.result === "win").length! / gamesPlayed) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          Pokemon Casino
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          ⚠️ Virtual currency only - No real money gambling - For entertainment purposes only
        </p>
        {user && <PokecoinDisplay balance={user.pokecoinBalance} />}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Games Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dice1 className="h-5 w-5" />
                Casino Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Bet Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bet Amount</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max={user?.pokecoinBalance || 1000}
                      className="flex-1"
                    />
                    <div className="flex gap-1">
                      {[10, 50, 100, 500].map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setBetAmount(amount)}
                          disabled={!user || user.pokecoinBalance < amount}
                        >
                          {amount}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Casino Games Component */}
                <CasinoGames
                  betAmount={betAmount}
                  userBalance={user?.pokecoinBalance || 0}
                  onPlay={(gameData) => playGameMutation.mutate({
                    userId: CURRENT_USER_ID,
                    ...gameData
                  })}
                  isPlaying={playGameMutation.isPending}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Gambling Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Your Casino Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {totalWinnings >= 0 ? "+" : ""}{totalWinnings}
                  </div>
                  <div className="text-xs text-muted-foreground">Net Winnings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{winRate}%</div>
                  <div className="text-xs text-muted-foreground">Win Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{gamesPlayed}</div>
                  <div className="text-xs text-muted-foreground">Games Played</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {gamblingHistory?.filter(g => g.result === "win").length || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Games Won</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Games */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Games</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {gamblingHistory?.slice(0, 10).map((game) => (
                  <div key={game.id} className="flex items-center justify-between p-2 rounded border">
                    <div className="space-y-1">
                      <div className="text-sm font-medium capitalize">{game.gameType}</div>
                      <div className="text-xs text-muted-foreground">
                        Bet: {game.bet} <Coins className="h-3 w-3 inline" />
                      </div>
                    </div>
                    <Badge 
                      variant={
                        game.result === "win" ? "default" : 
                        game.result === "tie" ? "secondary" : "destructive"
                      }
                    >
                      {game.result === "win" ? `+${game.payout - game.bet}` :
                       game.result === "tie" ? "0" : 
                       `-${game.bet}`}
                    </Badge>
                  </div>
                ))}
                {(!gamblingHistory || gamblingHistory.length === 0) && (
                  <div className="text-center text-muted-foreground py-4">
                    No games played yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
