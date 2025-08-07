import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Calendar } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { GamblingLog } from "@shared/schema";

const CURRENT_USER_ID = "test-user-1";

export default function GamblingLogs() {
  const [winnerId, setWinnerId] = useState("");
  const [loserId, setLoserId] = useState("");
  const { toast } = useToast();

  const { data: gamblingLogs } = useQuery<GamblingLog[]>({
    queryKey: ["/api/gambling/logs"],
  });

  const createLogMutation = useMutation({
    mutationFn: async (logData: any) => {
      const response = await apiRequest("POST", "/api/gambling/log", logData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gambling/logs"] });
      toast({
        title: "Gambling Result Logged",
        description: "The gambling result has been recorded.",
      });
      setWinnerId("");
      setLoserId("");
    },
    onError: () => {
      toast({
        title: "Failed to Log Result",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogResult = () => {
    if (!winnerId || !loserId || winnerId === loserId) {
      toast({
        title: "Invalid Input",
        description: "Please select different users for winner and loser.",
        variant: "destructive",
      });
      return;
    }

    createLogMutation.mutate({
      winnerId,
      loserId,
      loggedBy: CURRENT_USER_ID,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Gambling Logs
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Track gambling results between users
        </p>
      </div>

      {/* Log New Result */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Log Gambling Result
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Winner</label>
              <Input
                value={winnerId}
                onChange={(e) => setWinnerId(e.target.value)}
                placeholder="Enter winner's user ID..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Loser</label>
              <Input
                value={loserId}
                onChange={(e) => setLoserId(e.target.value)}
                placeholder="Enter loser's user ID..."
              />
            </div>
          </div>
          <Button 
            onClick={handleLogResult}
            disabled={createLogMutation.isPending || !winnerId || !loserId}
            className="w-full"
          >
            {createLogMutation.isPending ? "Logging..." : "Log Result"}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Users className="h-6 w-6" />
          Recent Gambling Results
        </h2>

        {gamblingLogs && gamblingLogs.length > 0 ? (
          <div className="space-y-3">
            {gamblingLogs.map((log) => (
              <Card key={log.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="font-semibold text-green-600">
                          Winner: {log.winnerId.slice(0, 8)}...
                        </span>
                        <span className="text-muted-foreground mx-2">vs</span>
                        <span className="font-semibold text-red-600">
                          Loser: {log.loserId.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>Logged by: {log.loggedBy.slice(0, 8)}...</div>
                      <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Gambling Results Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start logging gambling results to track wins and losses!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}