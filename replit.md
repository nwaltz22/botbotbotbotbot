# Overview

This is EWagerBot, a Discord bot for Pokemon rolling and gambling tracking. The bot features universal roll command detection, responding to roll commands from any bot while providing its own comprehensive command set. Built with Python and discord.py, it uses JSON file storage and integrates with PokeAPI for authentic Pokemon data.

# User Preferences

Preferred communication style: Simple, everyday language.
Project focus: Discord bot only, no web application components needed.

# System Architecture

## Discord Bot Architecture
The bot is built using Python and discord.py with a modular command structure:
- **Command System**: Supports multiple prefixes (`!` and `e!`) with universal roll detection
- **Event Handling**: Comprehensive message processing for roll command detection
- **Data Management**: JSON file-based persistence with automatic saving
- **API Integration**: Real-time Pokemon data fetching from PokeAPI
- **Error Handling**: Robust error handling and user feedback

## Data Storage
The bot uses simple JSON file storage:
- **Storage File**: `ewager_data.json` for all persistent data
- **Data Structure**: Organized by users, tournaments, and gambling logs
- **Backup Strategy**: Automatic saving after each operation
- **Portability**: Easy to backup and transfer between environments

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

## Key Features
- **Universal Roll Detection**: Responds to roll commands from any bot using regex patterns
- **Command Flexibility**: Multiple prefixes and command variations supported
- **Rich Embeds**: Beautiful Discord embeds for all responses
- **Tournament System**: Full tournament lifecycle management
- **User Tracking**: Comprehensive statistics and roll history

# External Dependencies

## Third-Party APIs
- **PokeAPI**: Fetches authentic Pokemon data including stats, sprites, types, and metadata
- **Discord API**: Full Discord bot functionality via discord.py

## Python Libraries
- **discord.py**: Main Discord bot framework (v2.3.0+)
- **aiohttp**: Async HTTP client for PokeAPI requests
- **json**: Built-in JSON handling for data persistence
- **datetime**: Time and date management
- **random**: Random number generation
- **re**: Regular expressions for command detection