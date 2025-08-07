import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertPokemonRollSchema, 
  insertGamblingLogSchema,
  insertTournamentSchema
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



  // Pokemon roll routes
  app.post("/api/pokemon/roll", async (req, res) => {
    try {
      const rollData = insertPokemonRollSchema.parse(req.body);
      
      // Create roll (no cost checking since it's free)
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

  // Gambling log routes
  app.post("/api/gambling/log", async (req, res) => {
    try {
      const logData = insertGamblingLogSchema.parse(req.body);
      const log = await storage.createGamblingLog(logData);
      res.status(201).json(log);
    } catch (error) {
      res.status(400).json({ message: "Invalid log data" });
    }
  });

  app.get("/api/gambling/logs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await storage.getGamblingLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get gambling logs" });
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
      
      // Join tournament (no entry fee)
      const updatedTournament = await storage.joinTournament(req.params.id, userId);
      if (!updatedTournament) {
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



  const httpServer = createServer(app);
  return httpServer;
}
