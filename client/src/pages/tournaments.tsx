import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Users, Coins, Calendar, Play } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Tournament } from "@shared/schema";

const CURRENT_USER_ID = "test-user-1";

export default function Tournaments() {
  const [newTournamentSize, setNewTournamentSize] = useState(20);
  const { toast } = useToast();



  const { data: tournaments } = useQuery<Tournament[]>({
    queryKey: ["/api/tournaments"],
  });

  const createTournamentMutation = useMutation({
    mutationFn: async (tournamentData: any) => {
      const response = await apiRequest("POST", "/api/tournaments", tournamentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      toast({
        title: "Tournament Created!",
        description: "Tournament is now open for registration.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Create Tournament",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const joinTournamentMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      const response = await apiRequest("POST", `/api/tournaments/${tournamentId}/join`, {
        userId: CURRENT_USER_ID,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      toast({
        title: "Joined Tournament!",
        description: "Good luck in the tournament!",
      });
    },
    onError: () => {
      toast({
        title: "Failed to Join Tournament",
        description: "Tournament is full or already started.",
        variant: "destructive",
      });
    },
  });

  const startTournamentMutation = useMutation({
    mutationFn: async (tournamentId: string) => {
      const response = await apiRequest("POST", `/api/tournaments/${tournamentId}/start`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tournaments"] });
      toast({
        title: "Tournament Started!",
        description: "The tournament is now active!",
      });
    },
  });

  const handleCreateTournament = () => {
    createTournamentMutation.mutate({
      size: newTournamentSize,
      participants: [],
    });
  };

  const activeTournaments = tournaments?.filter(t => t.status === 'registration') || [];
  const runningTournaments = tournaments?.filter(t => t.status === 'active') || [];
  const completedTournaments = tournaments?.filter(t => t.status === 'completed') || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
          Tournaments
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Join tournaments and compete with other users!
        </p>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Active Tournaments</h2>
        
        {/* Create Tournament Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Trophy className="h-4 w-4 mr-2" />
              Create Tournament
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tournament</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tournament Size</label>
                <Input
                  type="number"
                  value={newTournamentSize}
                  onChange={(e) => setNewTournamentSize(parseInt(e.target.value) || 20)}
                  min="4"
                  max="50"
                />
              </div>
              <Button 
                onClick={handleCreateTournament}
                disabled={createTournamentMutation.isPending}
                className="w-full"
              >
                {createTournamentMutation.isPending ? "Creating..." : "Create Tournament"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tournament Sections */}
      <div className="space-y-8">
        {/* Registration Open */}
        {activeTournaments.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Registration Open
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeTournaments.map((tournament) => {
                const participants = Array.isArray(tournament.participants) ? tournament.participants : [];
                const isJoined = participants.includes(CURRENT_USER_ID);
                
                return (
                  <Card key={tournament.id} className="relative">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Tournament #{tournament.id.slice(-4)}</span>
                        <Badge variant="outline">
                          {participants.length}/{tournament.size}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Size:</span>
                          <span>{tournament.size} players</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant="secondary">{tournament.status}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Created:</span>
                          <span>{new Date(tournament.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {!isJoined ? (
                          <Button 
                            onClick={() => joinTournamentMutation.mutate(tournament.id)}
                            disabled={
                              joinTournamentMutation.isPending || 
                              participants.length >= tournament.size
                            }
                            className="flex-1"
                          >
                            Join Tournament
                          </Button>
                        ) : (
                          <Button variant="secondary" disabled className="flex-1">
                            Joined ✓
                          </Button>
                        )}
                        
                        {participants.length >= 2 && (
                          <Button 
                            variant="outline"
                            onClick={() => startTournamentMutation.mutate(tournament.id)}
                            disabled={startTournamentMutation.isPending}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Running Tournaments */}
        {runningTournaments.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Play className="h-5 w-5" />
              Currently Running
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {runningTournaments.map((tournament) => (
                <Card key={tournament.id} className="border-orange-200 bg-orange-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Tournament #{tournament.id.slice(-4)}</span>
                      <Badge variant="secondary">Active</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Participants:</span>
                        <span>{Array.isArray(tournament.participants) ? tournament.participants.length : 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span>{tournament.size} players</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Started:</span>
                        <span>{tournament.startedAt ? new Date(tournament.startedAt).toLocaleDateString() : "N/A"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Tournaments */}
        {completedTournaments.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Recent Results
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedTournaments.slice(0, 6).map((tournament) => (
                <Card key={tournament.id} className="border-green-200 bg-green-50/50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Tournament #{tournament.id.slice(-4)}</span>
                      <Badge variant="default">Completed</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Winner:</span>
                        <span className="font-semibold">
                          {tournament.winnerId ? `User ${tournament.winnerId.slice(0, 8)}...` : "TBD"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span>{tournament.size} players</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Completed:</span>
                        <span>{tournament.completedAt ? new Date(tournament.completedAt).toLocaleDateString() : "N/A"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tournaments && tournaments.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tournaments Yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to create a tournament!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
