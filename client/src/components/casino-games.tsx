import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dice1, Heart, Diamond, Club, Spade, Coins } from "lucide-react";
import { playSlots, playCoinflip, playBlackjack, playRoulette } from "@/lib/game-logic";

interface CasinoGamesProps {
  betAmount: number;
  userBalance: number;
  onPlay: (gameData: any) => void;
  isPlaying: boolean;
}

export default function CasinoGames({ betAmount, userBalance, onPlay, isPlaying }: CasinoGamesProps) {
  const [lastGameResult, setLastGameResult] = useState<any>(null);

  const handleGamePlay = (gameType: string, gameLogic: () => any) => {
    if (isPlaying || userBalance < betAmount) return;

    const result = gameLogic();
    setLastGameResult({ type: gameType, ...result });
    
    onPlay({
      gameType,
      bet: betAmount,
      result: result.result,
      payout: result.payout,
      gameData: result.gameData || {},
    });
  };

  const canPlay = !isPlaying && userBalance >= betAmount;

  return (
    <div className="space-y-6">
      {/* Game Results Display */}
      {lastGameResult && (
        <Card className={`border-2 ${
          lastGameResult.result === "win" ? "border-green-500 bg-green-50" :
          lastGameResult.result === "tie" ? "border-yellow-500 bg-yellow-50" :
          "border-red-500 bg-red-50"
        }`}>
          <CardContent className="pt-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold capitalize">
                {lastGameResult.type} Result
              </h3>
              <div className="text-2xl font-bold">
                {lastGameResult.result === "win" ? "🎉 You Won!" :
                 lastGameResult.result === "tie" ? "🤝 It's a Tie!" :
                 "😢 You Lost"}
              </div>
              {lastGameResult.gameData.description && (
                <p className="text-sm text-muted-foreground">
                  {lastGameResult.gameData.description}
                </p>
              )}
              <div className="flex items-center justify-center gap-1">
                <Coins className="h-5 w-5" />
                <span className="font-semibold">
                  {lastGameResult.result === "win" ? `+${lastGameResult.payout - betAmount}` :
                   lastGameResult.result === "tie" ? "0" :
                   `-${betAmount}`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Slots */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dice1 className="h-5 w-5" />
              Slot Machine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Match 3 symbols to win! Cherry = 2x, Bell = 3x, Seven = 5x, Diamond = 10x
            </p>
            <Button 
              onClick={() => handleGamePlay("slots", () => playSlots(betAmount))}
              disabled={!canPlay}
              className="w-full"
            >
              {isPlaying ? "Spinning..." : `Spin (${betAmount} PC)`}
            </Button>
          </CardContent>
        </Card>

        {/* Coinflip */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Coinflip
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              50/50 chance to double your money!
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => handleGamePlay("coinflip", () => playCoinflip(betAmount, "heads"))}
                disabled={!canPlay}
                variant="outline"
              >
                Heads
              </Button>
              <Button 
                onClick={() => handleGamePlay("coinflip", () => playCoinflip(betAmount, "tails"))}
                disabled={!canPlay}
                variant="outline"
              >
                Tails
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Blackjack */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Blackjack
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Get closer to 21 than the dealer without going over!
            </p>
            <Button 
              onClick={() => handleGamePlay("blackjack", () => playBlackjack(betAmount))}
              disabled={!canPlay}
              className="w-full"
            >
              {isPlaying ? "Dealing..." : `Deal (${betAmount} PC)`}
            </Button>
          </CardContent>
        </Card>

        {/* Roulette */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dice1 className="h-5 w-5" />
              Roulette
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Bet on red/black (2x), odd/even (2x), or specific numbers (35x)!
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => handleGamePlay("roulette", () => playRoulette(betAmount, "red"))}
                disabled={!canPlay}
                variant="destructive"
                size="sm"
              >
                Red (2x)
              </Button>
              <Button 
                onClick={() => handleGamePlay("roulette", () => playRoulette(betAmount, "black"))}
                disabled={!canPlay}
                variant="secondary"
                size="sm"
              >
                Black (2x)
              </Button>
              <Button 
                onClick={() => handleGamePlay("roulette", () => playRoulette(betAmount, "odd"))}
                disabled={!canPlay}
                variant="outline"
                size="sm"
              >
                Odd (2x)
              </Button>
              <Button 
                onClick={() => handleGamePlay("roulette", () => playRoulette(betAmount, "even"))}
                disabled={!canPlay}
                variant="outline"
                size="sm"
              >
                Even (2x)
              </Button>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              Or try your luck on a specific number for 35x payout!
            </div>
          </CardContent>
        </Card>
      </div>

      {!canPlay && userBalance < betAmount && (
        <div className="text-center text-sm text-red-600 font-medium">
          Insufficient Pokecoins to place this bet
        </div>
      )}
    </div>
  );
}
