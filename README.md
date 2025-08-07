# EWagerBot

A Discord bot for Pokemon rolling and gambling tracking with universal roll command detection.

## 🚀 Features

- **Universal Roll Detection**: Responds to roll commands from any bot (`!roll 1025`, `?w 1025`, `>roll pokemon`, etc.)
- **Native Commands**: Use `!roll`, `e!w`, or `e!` prefix for all commands
- **Pokemon Rolling**: Real Pokemon data from PokeAPI (1-1025)
- **Tournament System**: Create and manage tournaments
- **Gambling Logs**: Track gambling results between users
- **User Statistics**: View personal stats and roll history

## 📋 Commands

### Rolling Commands
- `!roll` or `e!w` - Roll a random Pokemon (1-1025)
- `!number` - Roll a random number (1-100)
- `!recent [limit]` - Show your recent Pokemon rolls

**Universal Roll Detection:**
The bot automatically responds to most Pokemon roll commands:
- `!roll 1025`, `?w 1025`, `>roll pokemon`, `p!w`, `m!roll 1025`, etc.

### Tournament Commands
- `!tournament` - Show tournament help
- `!tournament create <size>` - Create a new tournament (4-50 players)
- `!tournament join <id>` - Join a tournament
- `!tournament list` - List active tournaments
- `!tournament start <id>` - Start a tournament (creator only)

### Gambling Commands
- `!gamble log @winner @loser` - Log a gambling result between two users
- `!logs [limit]` - Show recent gambling logs

### Info Commands
- `!stats [@user]` - Show user statistics
- `!help` - Show this help message

## 🛠️ Setup

### Prerequisites
- Python 3.8+
- Discord bot token

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/EWagerBot.git
   cd EWagerBot/discord_bot
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   echo "DISCORD_BOT_TOKEN=your_bot_token_here" > .env
   ```

4. **Run the bot**
   ```bash
   python bot.py
   ```

## 🔧 Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section and create a bot
4. Copy the bot token
5. Enable "Message Content Intent" in bot settings
6. Invite bot to your server with required permissions

### Required Permissions
- Send Messages
- Embed Links
- Read Message History
- Use External Emojis
- Add Reactions

## 💾 Data Storage

The bot uses JSON file storage (`ewager_data.json`) containing:
- User Pokemon roll history
- Tournament data and participants
- Gambling logs and results

## 🚀 Deployment

Deploy to any cloud service that supports Python:
- **Heroku**: Add Procfile with `python discord_bot/bot.py`
- **Railway**: Configure start command in settings
- **Replit**: Upload files and set run command
- **VPS**: Use screen/tmux to run in background

## 📁 Project Structure

```
├── discord_bot/
│   ├── bot.py              # Main bot file
│   ├── requirements.txt    # Python dependencies
│   ├── README.md          # Setup instructions
│   ├── .env.example       # Environment template
│   └── .gitignore         # Git exclusions
├── LICENSE                # MIT license
└── README.md             # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available under the MIT License.