import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  pokecoinBalance: integer("pokecoin_balance").notNull().default(1000),
  lastDailyBonus: timestamp("last_daily_bonus"),
  totalEarned: integer("total_earned").notNull().default(0),
  totalSpent: integer("total_spent").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pokemonRolls = pgTable("pokemon_rolls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  pokemonId: integer("pokemon_id").notNull(),
  pokemonName: text("pokemon_name").notNull(),
  pokemonData: jsonb("pokemon_data").notNull(),
  cost: integer("cost").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const gamblingGames = pgTable("gambling_games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  gameType: text("game_type").notNull(), // 'slots', 'blackjack', 'coinflip', 'roulette'
  bet: integer("bet").notNull(),
  result: text("result").notNull(), // 'win', 'loss', 'tie'
  payout: integer("payout").notNull().default(0),
  gameData: jsonb("game_data").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  entryFee: integer("entry_fee").notNull(),
  maxParticipants: integer("max_participants").notNull(),
  prizePool: integer("prize_pool").notNull().default(0),
  status: text("status").notNull().default('registration'), // 'registration', 'active', 'completed'
  participants: jsonb("participants").notNull().default('[]'),
  winnerId: varchar("winner_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

export const trades = pgTable("trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  toUserId: varchar("to_user_id").notNull().references(() => users.id),
  pokecoinAmount: integer("pokecoin_amount").notNull(),
  tradeData: jsonb("trade_data").notNull(),
  status: text("status").notNull().default('pending'), // 'pending', 'completed', 'cancelled'
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const dailyBonuses = pgTable("daily_bonuses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  bonusType: text("bonus_type").notNull(), // 'daily', 'weekly', 'achievement'
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPokemonRollSchema = createInsertSchema(pokemonRolls).omit({
  id: true,
  timestamp: true,
});

export const insertGamblingGameSchema = createInsertSchema(gamblingGames).omit({
  id: true,
  timestamp: true,
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  completedAt: true,
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  timestamp: true,
});

export const insertDailyBonusSchema = createInsertSchema(dailyBonuses).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type PokemonRoll = typeof pokemonRolls.$inferSelect;
export type InsertPokemonRoll = z.infer<typeof insertPokemonRollSchema>;
export type GamblingGame = typeof gamblingGames.$inferSelect;
export type InsertGamblingGame = z.infer<typeof insertGamblingGameSchema>;
export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Trade = typeof trades.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type DailyBonus = typeof dailyBonuses.$inferSelect;
export type InsertDailyBonus = z.infer<typeof insertDailyBonusSchema>;
