import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertPokemonRollSchema, 
  insertGamblingGameSchema,
  insertTournamentSchema,
  insertTradeSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/users/:id/daily-bonus", async (req, res) => {
    try {
      const user = await storage.claimDailyBonus(req.params.id);
      if (!user) {
        return res.status(400).json({ message: "Daily bonus not available" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to claim daily bonus" });
    }
  });

  // Pokemon roll routes
  app.post("/api/pokemon/roll", async (req, res) => {
    try {
      const rollData = insertPokemonRollSchema.parse(req.body);
      
      // Check user balance
      const user = await storage.getUser(rollData.userId);
      if (!user || user.pokecoinBalance < rollData.cost) {
        return res.status(400).json({ message: "Insufficient Pokecoins" });
      }
      
      // Deduct cost
      await storage.updateUserBalance(rollData.userId, -rollData.cost);
      
      // Create roll
      const roll = await storage.createPokemonRoll(rollData);
      res.status(201).json(roll);
    } catch (error) {
      res.status(400).json({ message: "Invalid roll data" });
    }
  });

  app.get("/api/pokemon/rolls/:userId", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const rolls = await storage.getUserPokemonRolls(req.params.userId, limit);
      res.json(rolls);
    } catch (error) {
      res.status(500).json({ message: "Failed to get rolls" });
    }
  });

  // Gambling game routes
  app.post("/api/gambling/play", async (req, res) => {
    try {
      const gameData = insertGamblingGameSchema.parse(req.body);
      
      // Check user balance
      const user = await storage.getUser(gameData.userId);
      if (!user || user.pokecoinBalance < gameData.bet) {
        return res.status(400).json({ message: "Insufficient Pokecoins" });
      }
      
      // Deduct bet
      await storage.updateUserBalance(gameData.userId, -gameData.bet);
      
      // Add winnings if any
      if (gameData.payout > 0) {
        await storage.updateUserBalance(gameData.userId, gameData.payout);
      }
      
      // Create game record
      const game = await storage.createGamblingGame(gameData);
      res.status(201).json(game);
    } catch (error) {
      res.status(400).json({ message: "Invalid game data" });
    }
  });

  app.get("/api/gambling/history/:userId", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const history = await storage.getUserGamblingHistory(req.params.userId, limit);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to get gambling history" });
    }
  });

  // Tournament routes
  app.post("/api/tournaments", async (req, res) => {
    try {
      const tournamentData = insertTournamentSchema.parse(req.body);
      const tournament = await storage.createTournament(tournamentData);
      res.status(201).json(tournament);
    } catch (error) {
      res.status(400).json({ message: "Invalid tournament data" });
    }
  });

  app.get("/api/tournaments", async (req, res) => {
    try {
      const status = req.query.status as string;
      const tournaments = await storage.getTournaments(status);
      res.json(tournaments);
    } catch (error) {
      res.status(500).json({ message: "Failed to get tournaments" });
    }
  });

  app.post("/api/tournaments/:id/join", async (req, res) => {
    try {
      const { userId } = req.body;
      const tournament = await storage.getTournament(req.params.id);
      
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      
      // Check user balance
      const user = await storage.getUser(userId);
      if (!user || user.pokecoinBalance < tournament.entryFee) {
        return res.status(400).json({ message: "Insufficient Pokecoins for entry fee" });
      }
      
      // Deduct entry fee
      await storage.updateUserBalance(userId, -tournament.entryFee);
      
      // Join tournament
      const updatedTournament = await storage.joinTournament(req.params.id, userId);
      if (!updatedTournament) {
        // Refund if couldn't join
        await storage.updateUserBalance(userId, tournament.entryFee);
        return res.status(400).json({ message: "Cannot join tournament" });
      }
      
      res.json(updatedTournament);
    } catch (error) {
      res.status(400).json({ message: "Failed to join tournament" });
    }
  });

  app.post("/api/tournaments/:id/start", async (req, res) => {
    try {
      const tournament = await storage.startTournament(req.params.id);
      if (!tournament) {
        return res.status(404).json({ message: "Tournament not found" });
      }
      res.json(tournament);
    } catch (error) {
      res.status(500).json({ message: "Failed to start tournament" });
    }
  });

  // Leaderboard routes
  app.get("/api/leaderboard/wealth", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await storage.getWealthLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to get wealth leaderboard" });
    }
  });

  app.get("/api/leaderboard/gambling", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await storage.getGamblingLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to get gambling leaderboard" });
    }
  });

  // Admin routes
  app.post("/api/admin/users/:id/balance", async (req, res) => {
    try {
      const { amount } = req.body;
      const user = await storage.updateUserBalance(req.params.id, amount);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update balance" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
