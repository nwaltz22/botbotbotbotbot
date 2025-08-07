import { 
  type User, 
  type InsertUser, 
  type PokemonRoll, 
  type InsertPokemonRoll,
  type GamblingLog,
  type InsertGamblingLog,
  type Tournament,
  type InsertTournament
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Pokemon Rolls
  createPokemonRoll(roll: InsertPokemonRoll): Promise<PokemonRoll>;
  getUserPokemonRolls(userId: string, limit?: number): Promise<PokemonRoll[]>;
  
  // Gambling Logs
  createGamblingLog(log: InsertGamblingLog): Promise<GamblingLog>;
  getGamblingLogs(limit?: number): Promise<GamblingLog[]>;
  
  // Tournaments
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  getTournaments(status?: string): Promise<Tournament[]>;
  getTournament(id: string): Promise<Tournament | undefined>;
  joinTournament(tournamentId: string, userId: string): Promise<Tournament | undefined>;
  startTournament(id: string, winnerId?: string): Promise<Tournament | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private pokemonRolls: Map<string, PokemonRoll>;
  private gamblingLogs: Map<string, GamblingLog>;
  private tournaments: Map<string, Tournament>;

  constructor() {
    this.users = new Map();
    this.pokemonRolls = new Map();
    this.gamblingLogs = new Map();
    this.tournaments = new Map();
    
    // Create a default user for testing
    const defaultUser: User = {
      id: "test-user-1",
      username: "TestTrainer",
      pokecoinBalance: 0,
      createdAt: new Date()
    };
    this.users.set(defaultUser.id, defaultUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }



  async createPokemonRoll(insertRoll: InsertPokemonRoll): Promise<PokemonRoll> {
    const id = randomUUID();
    const roll: PokemonRoll = {
      ...insertRoll,
      id,
      timestamp: new Date()
    };
    this.pokemonRolls.set(id, roll);
    return roll;
  }

  async getUserPokemonRolls(userId: string, limit = 50): Promise<PokemonRoll[]> {
    return Array.from(this.pokemonRolls.values())
      .filter(roll => roll.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createGamblingLog(insertLog: InsertGamblingLog): Promise<GamblingLog> {
    const id = randomUUID();
    const log: GamblingLog = {
      ...insertLog,
      id,
      timestamp: new Date()
    };
    this.gamblingLogs.set(id, log);
    return log;
  }

  async getGamblingLogs(limit = 50): Promise<GamblingLog[]> {
    return Array.from(this.gamblingLogs.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const id = randomUUID();
    const tournament: Tournament = {
      ...insertTournament,
      id,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      winnerId: null
    };
    this.tournaments.set(id, tournament);
    return tournament;
  }

  async getTournaments(status?: string): Promise<Tournament[]> {
    return Array.from(this.tournaments.values())
      .filter(tournament => !status || tournament.status === status)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    return this.tournaments.get(id);
  }

  async joinTournament(tournamentId: string, userId: string): Promise<Tournament | undefined> {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament || tournament.status !== 'registration') return undefined;
    
    const participants = Array.isArray(tournament.participants) ? tournament.participants : [];
    if (participants.includes(userId) || participants.length >= tournament.size) {
      return undefined;
    }
    
    const updatedTournament = {
      ...tournament,
      participants: [...participants, userId]
    };
    
    this.tournaments.set(tournamentId, updatedTournament);
    return updatedTournament;
  }

  async startTournament(id: string, winnerId?: string): Promise<Tournament | undefined> {
    const tournament = this.tournaments.get(id);
    if (!tournament) return undefined;
    
    const now = new Date();
    const updatedTournament = {
      ...tournament,
      status: winnerId ? 'completed' : 'active',
      startedAt: tournament.startedAt || now,
      completedAt: winnerId ? now : null,
      winnerId: winnerId || null
    };
    
    this.tournaments.set(id, updatedTournament);
    return updatedTournament;
  }


}

export const storage = new MemStorage();
