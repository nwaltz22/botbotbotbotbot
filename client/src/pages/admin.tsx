import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, UserPlus, Coins, Plus, Minus, Users, TrendingUp } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

export default function Admin() {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [balanceAmount, setBalanceAmount] = useState(100);
  const [newUsername, setNewUsername] = useState("");
  const { toast } = useToast();

  const { data: wealthLeaderboard } = useQuery<User[]>({
    queryKey: ["/api/leaderboard/wealth"],
  });

  const updateBalanceMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      const response = await apiRequest("POST", `/api/admin/users/${userId}/balance`, { amount });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard/wealth"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", variables.userId] });
      toast({
        title: "Balance Updated",
        description: `Successfully ${variables.amount > 0 ? 'added' : 'removed'} ${Math.abs(variables.amount)} Pokecoins.`,
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update user balance.",
        variant: "destructive",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard/wealth"] });
      toast({
        title: "User Created",
        description: "New user created successfully.",
      });
      setNewUsername("");
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create user. Username might already exist.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateBalance = (amount: number) => {
    if (!selectedUserId) {
      toast({
        title: "No User Selected",
        description: "Please select a user first.",
        variant: "destructive",
      });
      return;
    }

    updateBalanceMutation.mutate({ userId: selectedUserId, amount });
  };

  const handleCreateUser = () => {
    if (!newUsername.trim()) {
      toast({
        title: "Invalid Username",
        description: "Please enter a valid username.",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate({
      username: newUsername,
      pokecoinBalance: 1000,
    });
  };

  const totalPokecoins = wealthLeaderboard?.reduce((sum, user) => sum + user.pokecoinBalance, 0) || 0;
  const totalUsers = wealthLeaderboard?.length || 0;
  const averageBalance = totalUsers > 0 ? Math.round(totalPokecoins / totalUsers) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          ⚠️ Admin-only access - Manage users and economy settings
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Total Pokecoins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPokecoins.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Average Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageBalance.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Economy Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={totalPokecoins > 0 ? "default" : "destructive"}>
              {totalPokecoins > 0 ? "Healthy" : "Needs Attention"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Create User */}
            <div className="space-y-4">
              <h3 className="font-semibold">Create New User</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleCreateUser}
                  disabled={createUserMutation.isPending || !newUsername.trim()}
                >
                  {createUserMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Balance Management */}
            <div className="space-y-4">
              <h3 className="font-semibold">Balance Management</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Select User</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="">Select a user...</option>
                    {wealthLeaderboard?.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.pokecoinBalance} PC)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Amount</label>
                  <Input
                    type="number"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(parseInt(e.target.value) || 0)}
                    placeholder="Amount to add/remove"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleUpdateBalance(balanceAmount)}
                    disabled={updateBalanceMutation.isPending || !selectedUserId}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                  <Button 
                    onClick={() => handleUpdateBalance(-balanceAmount)}
                    disabled={updateBalanceMutation.isPending || !selectedUserId}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Minus className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {wealthLeaderboard?.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded border cursor-pointer hover:bg-gray-50 ${
                    selectedUserId === user.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <div>
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-muted-foreground">
                      ID: {user.id.slice(0, 8)}...
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold flex items-center gap-1">
                      {user.pokecoinBalance.toLocaleString()} <Coins className="h-4 w-4" />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Earned: {user.totalEarned.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              {(!wealthLeaderboard || wealthLeaderboard.length === 0) && (
                <div className="text-center text-muted-foreground py-8">
                  No users found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning Notice */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-yellow-800">Admin Notice</h3>
              <p className="text-sm text-yellow-700">
                This dashboard provides administrative controls for the Pokemon gambling bot economy. 
                All Pokecoins are virtual currency with no real-world value. Use these tools responsibly 
                to maintain a balanced and fair gaming environment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
