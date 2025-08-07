import { 
  type User, 
  type InsertUser, 
  type PokemonRoll, 
  type InsertPokemonRoll,
  type GamblingGame,
  type InsertGamblingGame,
  type Tournament,
  type InsertTournament,
  type Trade,
  type InsertTrade,
  type DailyBonus,
  type InsertDailyBonus
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(id: string, amount: number): Promise<User | undefined>;
  claimDailyBonus(id: string): Promise<User | undefined>;
  
  // Pokemon Rolls
  createPokemonRoll(roll: InsertPokemonRoll): Promise<PokemonRoll>;
  getUserPokemonRolls(userId: string, limit?: number): Promise<PokemonRoll[]>;
  
  // Gambling Games
  createGamblingGame(game: InsertGamblingGame): Promise<GamblingGame>;
  getUserGamblingHistory(userId: string, limit?: number): Promise<GamblingGame[]>;
  
  // Tournaments
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  getTournaments(status?: string): Promise<Tournament[]>;
  getTournament(id: string): Promise<Tournament | undefined>;
  joinTournament(tournamentId: string, userId: string): Promise<Tournament | undefined>;
  startTournament(id: string, winnerId?: string): Promise<Tournament | undefined>;
  
  // Trades
  createTrade(trade: InsertTrade): Promise<Trade>;
  getUserTrades(userId: string): Promise<Trade[]>;
  completeTrade(id: string): Promise<Trade | undefined>;
  
  // Daily Bonuses
  createDailyBonus(bonus: InsertDailyBonus): Promise<DailyBonus>;
  getUserBonuses(userId: string): Promise<DailyBonus[]>;
  
  // Leaderboards
  getWealthLeaderboard(limit?: number): Promise<User[]>;
  getGamblingLeaderboard(limit?: number): Promise<Array<User & { totalWinnings: number }>>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private pokemonRolls: Map<string, PokemonRoll>;
  private gamblingGames: Map<string, GamblingGame>;
  private tournaments: Map<string, Tournament>;
  private trades: Map<string, Trade>;
  private dailyBonuses: Map<string, DailyBonus>;

  constructor() {
    this.users = new Map();
    this.pokemonRolls = new Map();
    this.gamblingGames = new Map();
    this.tournaments = new Map();
    this.trades = new Map();
    this.dailyBonuses = new Map();
    
    // Create a default user for testing
    const defaultUser: User = {
      id: "test-user-1",
      username: "TestTrainer",
      pokecoinBalance: 2500,
      lastDailyBonus: null,
      totalEarned: 0,
      totalSpent: 0,
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
      createdAt: new Date(),
      lastDailyBonus: null,
      totalEarned: 0,
      totalSpent: 0
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(id: string, amount: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      pokecoinBalance: user.pokecoinBalance + amount,
      totalEarned: amount > 0 ? user.totalEarned + amount : user.totalEarned,
      totalSpent: amount < 0 ? user.totalSpent + Math.abs(amount) : user.totalSpent
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async claimDailyBonus(id: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const now = new Date();
    const lastBonus = user.lastDailyBonus;
    
    // Check if 24 hours have passed
    if (lastBonus && (now.getTime() - lastBonus.getTime()) < 24 * 60 * 60 * 1000) {
      return undefined;
    }
    
    const bonusAmount = 100;
    const updatedUser = {
      ...user,
      pokecoinBalance: user.pokecoinBalance + bonusAmount,
      lastDailyBonus: now,
      totalEarned: user.totalEarned + bonusAmount
    };
    
    this.users.set(id, updatedUser);
    
    // Create bonus record
    const bonus: DailyBonus = {
      id: randomUUID(),
      userId: id,
      amount: bonusAmount,
      bonusType: 'daily',
      timestamp: now
    };
    this.dailyBonuses.set(bonus.id, bonus);
    
    return updatedUser;
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

  async createGamblingGame(insertGame: InsertGamblingGame): Promise<GamblingGame> {
    const id = randomUUID();
    const game: GamblingGame = {
      ...insertGame,
      id,
      timestamp: new Date()
    };
    this.gamblingGames.set(id, game);
    return game;
  }

  async getUserGamblingHistory(userId: string, limit = 50): Promise<GamblingGame[]> {
    return Array.from(this.gamblingGames.values())
      .filter(game => game.userId === userId)
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
    if (participants.includes(userId) || participants.length >= tournament.maxParticipants) {
      return undefined;
    }
    
    const updatedTournament = {
      ...tournament,
      participants: [...participants, userId],
      prizePool: tournament.prizePool + tournament.entryFee
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

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const id = randomUUID();
    const trade: Trade = {
      ...insertTrade,
      id,
      timestamp: new Date()
    };
    this.trades.set(id, trade);
    return trade;
  }

  async getUserTrades(userId: string): Promise<Trade[]> {
    return Array.from(this.trades.values())
      .filter(trade => trade.fromUserId === userId || trade.toUserId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async completeTrade(id: string): Promise<Trade | undefined> {
    const trade = this.trades.get(id);
    if (!trade || trade.status !== 'pending') return undefined;
    
    const updatedTrade = {
      ...trade,
      status: 'completed' as const
    };
    
    this.trades.set(id, updatedTrade);
    return updatedTrade;
  }

  async createDailyBonus(insertBonus: InsertDailyBonus): Promise<DailyBonus> {
    const id = randomUUID();
    const bonus: DailyBonus = {
      ...insertBonus,
      id,
      timestamp: new Date()
    };
    this.dailyBonuses.set(id, bonus);
    return bonus;
  }

  async getUserBonuses(userId: string): Promise<DailyBonus[]> {
    return Array.from(this.dailyBonuses.values())
      .filter(bonus => bonus.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getWealthLeaderboard(limit = 10): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => b.pokecoinBalance - a.pokecoinBalance)
      .slice(0, limit);
  }

  async getGamblingLeaderboard(limit = 10): Promise<Array<User & { totalWinnings: number }>> {
    const userWinnings = new Map<string, number>();
    
    Array.from(this.gamblingGames.values()).forEach(game => {
      const currentWinnings = userWinnings.get(game.userId) || 0;
      userWinnings.set(game.userId, currentWinnings + game.payout - game.bet);
    });
    
    return Array.from(this.users.values())
      .map(user => ({
        ...user,
        totalWinnings: userWinnings.get(user.id) || 0
      }))
      .sort((a, b) => b.totalWinnings - a.totalWinnings)
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
