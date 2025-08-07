import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  pokecoinBalance: integer("pokecoin_balance").notNull().default(0),
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

export const gamblingLogs = pgTable("gambling_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  winnerId: varchar("winner_id").notNull().references(() => users.id),
  loserId: varchar("loser_id").notNull().references(() => users.id),
  loggedBy: varchar("logged_by").notNull().references(() => users.id),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  size: integer("size").notNull(),
  status: text("status").notNull().default('registration'), // 'registration', 'active', 'completed'
  participants: jsonb("participants").notNull().default('[]'),
  winnerId: varchar("winner_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
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

export const insertGamblingLogSchema = createInsertSchema(gamblingLogs).omit({
  id: true,
  timestamp: true,
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  completedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type PokemonRoll = typeof pokemonRolls.$inferSelect;
export type InsertPokemonRoll = z.infer<typeof insertPokemonRollSchema>;
export type GamblingLog = typeof gamblingLogs.$inferSelect;
export type InsertGamblingLog = z.infer<typeof insertGamblingLogSchema>;
export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
