# EWagerBot Project

This repository contains both a Discord bot and a web application for Pokemon rolling and gambling tracking.

## 🤖 Discord Bot

A Discord bot that provides Pokemon rolling, tournament management, and gambling tracking features.

**Location**: `discord_bot/`

### Features
- Pokemon rolling with real PokeAPI data
- Tournament creation and management
- Gambling result logging
- User statistics tracking

### Quick Start
```bash
cd discord_bot
pip install -r requirements.txt
export DISCORD_BOT_TOKEN="your_token_here"
python bot.py
```

See `discord_bot/README.md` for detailed setup instructions.

## 🌐 Web Application

A React-based web application with the same core features as the Discord bot.

**Location**: Web app files in the root directory

### Features
- Pokemon rolling interface
- Tournament management UI
- Gambling logs tracking
- Real-time updates

### Quick Start
```bash
npm install
npm run dev
```

## 🚀 Deployment

### Discord Bot
- Can be deployed to any cloud service (Heroku, Railway, etc.)
- Requires a Discord bot token
- Uses JSON file for data persistence

### Web Application
- Ready for deployment on Replit
- Includes both frontend and backend
- Uses PostgreSQL for data storage

## 📁 Project Structure

```
├── discord_bot/           # Discord bot implementation
│   ├── bot.py            # Main bot file
│   ├── requirements.txt  # Python dependencies
│   └── README.md         # Bot-specific documentation
├── client/               # React frontend
├── server/               # Express backend
├── shared/               # Shared TypeScript types
└── README.md            # This file
```

## 🛠️ Development

Both applications share the same core features but are implemented for different platforms:

- **Discord Bot**: Python-based with discord.py
- **Web App**: TypeScript/React with Express backend

## 📝 License

MIT License - see LICENSE file for details.