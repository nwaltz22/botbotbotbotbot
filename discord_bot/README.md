# EWagerBot

A simple Discord bot for Pokemon rolling and gambling tracking.

## Features

- **Pokemon Rolling**: Roll random Pokemon (1-1025) with real data from PokeAPI
- **Number Rolling**: Roll random numbers (1-100)
- **Tournaments**: Create and manage tournaments with customizable sizes
- **Gambling Logs**: Track gambling results between users
- **User Statistics**: View personal stats including rolls and gambling records

## Commands

### Rolling Commands
- `e!roll` or `e!w` - Roll a random Pokemon (1-1025)
- `!number` - Roll a random number (1-100)
- `!recent [limit]` - Show your recent Pokemon rolls

**Universal Detection**: Only responds to Pokemon roll commands (1025), not regular rolls

### Tournament Commands
- `!tournament` - Show tournament help
- `!tournament create <size>` - Create a new tournament
- `!tournament join <id>` - Join a tournament
- `!tournament list` - List active tournaments
- `!tournament start <id>` - Start a tournament (creator only)

### Gambling Commands
- `!gamble log @winner @loser` - Log a gambling result between two users
- `!logs [limit]` - Show recent gambling logs

### Info Commands
- `!stats [@user]` - Show user statistics
- `!help` - Show help message

## Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd discord_bot
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   Create a `.env` file or set the environment variable:
   ```bash
   export DISCORD_BOT_TOKEN="your_bot_token_here"
   ```

4. **Run the bot**
   ```bash
   python bot.py
   ```

## Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to the "Bot" section
4. Create a bot and copy the token
5. Enable "Message Content Intent" in the bot settings
6. Invite the bot to your server with appropriate permissions

### Required Permissions
- Send Messages
- Use Slash Commands
- Embed Links
- Read Message History
- Use External Emojis

## Data Storage

The bot stores data in a local JSON file (`ewager_data.json`) containing:
- User profiles and Pokemon roll history
- Tournament data
- Gambling logs

## Development

The bot is structured with:
- `EWagerBot` class for data management
- Command handlers for different features
- JSON-based persistent storage
- Error handling and validation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.