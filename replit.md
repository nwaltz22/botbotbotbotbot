# Overview

This is a Pokemon-themed gaming platform that combines Pokemon collection mechanics with casino-style gambling games and tournaments. Users can roll for random Pokemon using PokeAPI data, participate in various gambling games (slots, blackjack, coinflip, roulette), enter tournaments, and compete on leaderboards. The application manages a virtual currency system called "Pokecoins" and provides daily bonuses to keep users engaged.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built as a React SPA using TypeScript and modern React patterns:
- **React Router**: Uses Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Build Tool**: Vite for development and production builds
- **Component Structure**: Modular component architecture with reusable UI components

## Backend Architecture
The backend follows a RESTful API design using Express.js:
- **Web Framework**: Express.js with TypeScript
- **API Structure**: RESTful endpoints organized by resource types (users, pokemon, gambling, tournaments)
- **Data Validation**: Zod schemas for request/response validation
- **Storage Layer**: Abstract storage interface allowing for different implementations
- **Error Handling**: Centralized error handling middleware

## Data Storage
The application uses PostgreSQL with Drizzle ORM:
- **Database**: PostgreSQL for persistent data storage
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Centralized schema definitions in TypeScript
- **Migrations**: Drizzle Kit for database schema management
- **Database Provider**: Configured for Neon serverless PostgreSQL

## Core Data Models
- **Users**: Profile data, pokecoin balance, transaction history
- **Pokemon Rolls**: Captured Pokemon with full stats and metadata
- **Gambling Games**: Game history, results, and payouts
- **Tournaments**: Tournament management, participants, and winners
- **Trades**: User-to-user trading system (planned feature)
- **Daily Bonuses**: Time-gated reward system

## Game Logic
- **Pokemon Rolling**: Integration with PokeAPI for authentic Pokemon data
- **Casino Games**: Client-side game logic with server-side validation
- **Tournament System**: Round-robin or elimination-style tournaments
- **Economy System**: Balanced virtual currency with earning and spending mechanisms

# External Dependencies

## Third-Party APIs
- **PokeAPI**: Fetches authentic Pokemon data including stats, sprites, types, and metadata
- **Neon Database**: Serverless PostgreSQL hosting for production deployments

## UI Libraries
- **Radix UI**: Headless component library for accessibility and behavior
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework for styling

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundling for production builds
- **Drizzle Kit**: Database schema management and migrations

## Runtime Dependencies
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight React routing
- **Date-fns**: Date manipulation utilities
- **Class Variance Authority**: Component variant management
- **CLSX**: Conditional CSS class utilities