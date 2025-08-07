import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Coins, TrendingUp, Crown } from "lucide-react";
import type { User } from "@shared/schema";

export default function Leaderboard() {
  const { data: wealthLeaderboard } = useQuery<User[]>({
    queryKey: ["/api/leaderboard/wealth"],
  });

  const { data: gamblingLeaderboard } = useQuery<Array<User & { totalWinnings: number }>>({
    queryKey: ["/api/leaderboard/gambling"],
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Trophy className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="h-5 w-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">1st</Badge>;
      case 2:
        return <Badge className="bg-gray-400 hover:bg-gray-500">2nd</Badge>;
      case 3:
        return <Badge className="bg-amber-600 hover:bg-amber-700">3rd</Badge>;
      default:
        return <Badge variant="outline">#{rank}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Leaderboards
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          See who's dominating the Pokemon gambling scene!
        </p>
      </div>

      <Tabs defaultValue="wealth" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wealth" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Wealth Leaderboard
          </TabsTrigger>
          <TabsTrigger value="gambling" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Gambling Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wealth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Richest Trainers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {wealthLeaderboard && wealthLeaderboard.length > 0 ? (
                <div className="space-y-4">
                  {wealthLeaderboard.map((user, index) => {
                    const rank = index + 1;
                    return (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {getRankIcon(rank)}
                          <div>
                            <div className="font-semibold">{user.username}</div>
                            <div className="text-sm text-muted-foreground">
                              Member since {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-bold text-lg flex items-center gap-1">
                              {user.pokecoinBalance.toLocaleString()} <Coins className="h-4 w-4" />
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Total earned: {user.totalEarned.toLocaleString()}
                            </div>
                          </div>
                          {getRankBadge(rank)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No users found. Be the first to start your Pokemon journey!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gambling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Gamblers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gamblingLeaderboard && gamblingLeaderboard.length > 0 ? (
                <div className="space-y-4">
                  {gamblingLeaderboard.map((user, index) => {
                    const rank = index + 1;
                    const isProfit = user.totalWinnings > 0;
                    return (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          rank <= 3 ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {getRankIcon(rank)}
                          <div>
                            <div className="font-semibold">{user.username}</div>
                            <div className="text-sm text-muted-foreground">
                              Current balance: {user.pokecoinBalance.toLocaleString()} PC
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`font-bold text-lg flex items-center gap-1 ${
                              isProfit ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {isProfit ? '+' : ''}{user.totalWinnings.toLocaleString()} <Coins className="h-4 w-4" />
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Net {isProfit ? 'winnings' : 'losses'}
                            </div>
                          </div>
                          {getRankBadge(rank)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No gambling history found. Try your luck at the casino!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Trainers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wealthLeaderboard?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pokecoins in Circulation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {wealthLeaderboard?.reduce((sum, user) => sum + user.pokecoinBalance, 0).toLocaleString() || 0}
              <Coins className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Gamblers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gamblingLeaderboard?.filter(user => user.totalWinnings !== 0).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
