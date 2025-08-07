# Overview

This project contains both a Discord bot (EWagerBot) and a simplified web application for Pokemon rolling and gambling tracking. The core features include Pokemon rolling with real PokeAPI data, tournament management, and gambling result logging. The project has been simplified to remove complex economy features and focus on basic functionality that matches the original Discord bot requirements.

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
- **Users**: Basic profile data for tracking
- **Pokemon Rolls**: Captured Pokemon with full stats and metadata from PokeAPI
- **Gambling Logs**: Simple win/loss tracking between users
- **Tournaments**: Tournament management with customizable sizes and participants

## Game Logic
- **Pokemon Rolling**: Integration with PokeAPI for authentic Pokemon data (1-1025)
- **Number Rolling**: Simple random number generation (1-100)
- **Tournament System**: Basic tournament creation and participation
- **Gambling Tracking**: Log gambling results between users

## Discord Bot Features
- **Commands**: Prefix-based commands (!) for all functionality
- **Data Storage**: JSON file-based persistence
- **Real-time**: Instant responses and updates
- **User Friendly**: Rich embeds and error handling

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