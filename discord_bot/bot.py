import discord
from discord.ext import commands
import asyncio
import random
import json
import os
from datetime import datetime, timedelta
import aiohttp
from typing import Dict, List, Optional
import re

# Bot configuration
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix=['!', 'e!'], intents=intents)

# Data storage
DATA_FILE = 'ewager_data.json'

class EWagerBot:
    def __init__(self):
        self.data = self.load_data()
    
    def load_data(self) -> Dict:
        """Load bot data from file"""
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        return {
            'users': {},
            'tournaments': {},
            'gambling_logs': []
        }
    
    def save_data(self):
        """Save bot data to file"""
        with open(DATA_FILE, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def get_user(self, user_id: str) -> Dict:
        """Get or create user data"""
        if user_id not in self.data['users']:
            self.data['users'][user_id] = {
                'id': user_id,
                'pokemon_rolls': [],
                'created_at': datetime.now().isoformat()
            }
            self.save_data()
        return self.data['users'][user_id]
    
    async def fetch_pokemon(self, pokemon_id: int) -> Optional[Dict]:
        """Fetch Pokemon data from PokeAPI"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f'https://pokeapi.co/api/v2/pokemon/{pokemon_id}') as response:
                    if response.status == 200:
                        return await response.json()
        except Exception:
            pass
        return None

# Initialize bot instance
ewager = EWagerBot()

@bot.event
async def on_ready():
    print(f'{bot.user} has logged in as EWagerBot!')
    print(f'Bot is ready and serving in {len(bot.guilds)} guilds')

@bot.event
async def on_message(message):
    """Handle all message events including universal roll detection"""
    if message.author.bot:
        return
    
    content = message.content.lower().strip()
    
    # Universal roll command detection
    if detect_universal_roll(content):
        await handle_pokemon_roll(message)
        return
    
    # e!w command detection (shorthand for Pokemon rolls)
    if content.startswith('e!w') or content == 'e!roll':
        await handle_pokemon_roll(message)
        return
    
    # Process normal commands
    await bot.process_commands(message)

def detect_universal_roll(content: str) -> bool:
    """Detect Pokemon roll command patterns (1025 only, not regular 100 rolls)"""
    # Common roll prefixes
    prefixes = ['!', '?', '>', '<', '~', '.', 'p!', 'm!', 'k!', 'c!']
    
    # Only detect Pokemon-specific roll patterns (1025)
    patterns = [
        r'roll\s+1025',
        r'roll\s+pokemon',
        r'roll\s+poke',
        r'w\s+1025',
        r'wish\s+1025'
    ]
    
    for prefix in prefixes:
        for pattern in patterns:
            if re.search(f'{re.escape(prefix)}{pattern}', content):
                return True
    
    # Make sure it's NOT a regular roll (like !roll, !roll 100, etc.)
    # Only respond to Pokemon-specific commands
    return False

async def handle_pokemon_roll(message):
    """Handle Pokemon roll for any detected command"""
    user_id = str(message.author.id)
    user_data = ewager.get_user(user_id)
    
    # Roll random Pokemon ID
    pokemon_id = random.randint(1, 1025)
    
    # Fetch Pokemon data
    pokemon_data = await ewager.fetch_pokemon(pokemon_id)
    
    if pokemon_data:
        name = pokemon_data['name'].title()
        height = pokemon_data['height'] / 10  # Convert to meters
        weight = pokemon_data['weight'] / 10  # Convert to kg
        types = [t['type']['name'].title() for t in pokemon_data['types']]
        sprite_url = pokemon_data['sprites']['front_default']
        
        # Save roll to user data
        roll_data = {
            'id': pokemon_id,
            'name': name,
            'types': types,
            'height': height,
            'weight': weight,
            'timestamp': datetime.now().isoformat()
        }
        user_data['pokemon_rolls'].append(roll_data)
        ewager.save_data()
        
        # Create embed
        embed = discord.Embed(
            title=f"🎲 Pokemon Roll Result",
            description=f"**{name}** (#{pokemon_id})",
            color=0x3498db
        )
        embed.add_field(name="Type(s)", value=" / ".join(types), inline=True)
        embed.add_field(name="Height", value=f"{height}m", inline=True)
        embed.add_field(name="Weight", value=f"{weight}kg", inline=True)
        
        if sprite_url:
            embed.set_thumbnail(url=sprite_url)
        
        embed.set_footer(text=f"Rolled by {message.author.display_name}")
        
        await message.channel.send(embed=embed)
    else:
        await message.channel.send("❌ Failed to fetch Pokemon data. Please try again!")

@bot.command(name='roll')
async def roll_pokemon_command(ctx, *args):
    """Roll a random Pokemon (1-1025) via command - only responds to Pokemon rolls"""
    # Only respond if it's specifically for Pokemon (1025) or no args
    if not args or '1025' in ' '.join(args).lower() or 'pokemon' in ' '.join(args).lower():
        await handle_pokemon_roll(ctx.message)

@bot.command(name='w')
async def w_command(ctx):
    """e!w shorthand for Pokemon rolling"""
    await handle_pokemon_roll(ctx.message)

@bot.command(name='number')
async def roll_number(ctx):
    """Roll a random number (1-100)"""
    number = random.randint(1, 100)
    
    embed = discord.Embed(
        title="🎲 Number Roll Result",
        description=f"**{number}**",
        color=0xe74c3c
    )
    embed.set_footer(text=f"Rolled by {ctx.author.display_name}")
    
    await ctx.send(embed=embed)

@bot.command(name='recent')
async def recent_rolls(ctx, limit: int = 5):
    """Show recent Pokemon rolls"""
    user_id = str(ctx.author.id)
    user_data = ewager.get_user(user_id)
    
    rolls = user_data['pokemon_rolls'][-limit:]
    
    if not rolls:
        await ctx.send("❌ You haven't rolled any Pokemon yet! Use `!roll` to get started.")
        return
    
    embed = discord.Embed(
        title=f"🗂️ Recent Pokemon Rolls",
        description=f"Your last {len(rolls)} Pokemon rolls:",
        color=0x9b59b6
    )
    
    for i, roll in enumerate(reversed(rolls), 1):
        types_str = " / ".join(roll['types'])
        embed.add_field(
            name=f"{i}. {roll['name']} (#{roll['id']})",
            value=f"Type: {types_str}",
            inline=False
        )
    
    embed.set_footer(text=f"Total rolls: {len(user_data['pokemon_rolls'])}")
    
    await ctx.send(embed=embed)

@bot.command(name='tournament')
async def tournament_command(ctx, action: str = None, *, args: str = None):
    """Tournament management commands"""
    if action is None:
        embed = discord.Embed(
            title="🏆 Tournament Commands",
            description="Available tournament commands:",
            color=0xf39c12
        )
        embed.add_field(
            name="!tournament create <size>",
            value="Create a new tournament",
            inline=False
        )
        embed.add_field(
            name="!tournament join <tournament_id>",
            value="Join a tournament",
            inline=False
        )
        embed.add_field(
            name="!tournament list",
            value="List active tournaments",
            inline=False
        )
        embed.add_field(
            name="!tournament start <tournament_id>",
            value="Start a tournament (creator only)",
            inline=False
        )
        await ctx.send(embed=embed)
        return
    
    if action == "create":
        try:
            size = int(args) if args else 8
            if size < 4 or size > 50:
                await ctx.send("❌ Tournament size must be between 4 and 50 players.")
                return
        except ValueError:
            await ctx.send("❌ Please provide a valid number for tournament size.")
            return
        
        tournament_id = f"tournament_{len(ewager.data['tournaments']) + 1}"
        tournament = {
            'id': tournament_id,
            'creator': str(ctx.author.id),
            'size': size,
            'participants': [],
            'status': 'registration',
            'created_at': datetime.now().isoformat(),
            'winner': None
        }
        
        ewager.data['tournaments'][tournament_id] = tournament
        ewager.save_data()
        
        embed = discord.Embed(
            title="🏆 Tournament Created!",
            description=f"Tournament **{tournament_id}** has been created",
            color=0x2ecc71
        )
        embed.add_field(name="Size", value=f"{size} players", inline=True)
        embed.add_field(name="Status", value="Registration Open", inline=True)
        embed.add_field(name="Participants", value="0", inline=True)
        embed.set_footer(text=f"Use !tournament join {tournament_id} to participate")
        
        await ctx.send(embed=embed)
    
    elif action == "join":
        if not args:
            await ctx.send("❌ Please specify a tournament ID.")
            return
        
        tournament_id = args.strip()
        if tournament_id not in ewager.data['tournaments']:
            await ctx.send("❌ Tournament not found.")
            return
        
        tournament = ewager.data['tournaments'][tournament_id]
        user_id = str(ctx.author.id)
        
        if tournament['status'] != 'registration':
            await ctx.send("❌ This tournament is not accepting new participants.")
            return
        
        if user_id in tournament['participants']:
            await ctx.send("❌ You're already registered for this tournament.")
            return
        
        if len(tournament['participants']) >= tournament['size']:
            await ctx.send("❌ This tournament is full.")
            return
        
        tournament['participants'].append(user_id)
        ewager.save_data()
        
        embed = discord.Embed(
            title="🎯 Joined Tournament!",
            description=f"You've joined **{tournament_id}**",
            color=0x3498db
        )
        embed.add_field(
            name="Participants", 
            value=f"{len(tournament['participants'])}/{tournament['size']}", 
            inline=True
        )
        
        await ctx.send(embed=embed)
    
    elif action == "list":
        tournaments = ewager.data['tournaments']
        active_tournaments = {k: v for k, v in tournaments.items() if v['status'] != 'completed'}
        
        if not active_tournaments:
            await ctx.send("❌ No active tournaments found.")
            return
        
        embed = discord.Embed(
            title="🏆 Active Tournaments",
            color=0xf39c12
        )
        
        for tournament_id, tournament in active_tournaments.items():
            status = "🟢 Registration" if tournament['status'] == 'registration' else "🔴 In Progress"
            embed.add_field(
                name=f"{tournament_id}",
                value=f"{status}\nParticipants: {len(tournament['participants'])}/{tournament['size']}",
                inline=True
            )
        
        await ctx.send(embed=embed)
    
    elif action == "start":
        if not args:
            await ctx.send("❌ Please specify a tournament ID.")
            return
        
        tournament_id = args.strip()
        if tournament_id not in ewager.data['tournaments']:
            await ctx.send("❌ Tournament not found.")
            return
        
        tournament = ewager.data['tournaments'][tournament_id]
        
        if tournament['creator'] != str(ctx.author.id):
            await ctx.send("❌ Only the tournament creator can start it.")
            return
        
        if tournament['status'] != 'registration':
            await ctx.send("❌ This tournament has already started or ended.")
            return
        
        if len(tournament['participants']) < 4:
            await ctx.send("❌ Need at least 4 participants to start the tournament.")
            return
        
        # Randomly select a winner for now (in a real bot, you'd implement proper tournament logic)
        winner_id = random.choice(tournament['participants'])
        tournament['status'] = 'completed'
        tournament['winner'] = winner_id
        tournament['completed_at'] = datetime.now().isoformat()
        ewager.save_data()
        
        winner_user = bot.get_user(int(winner_id))
        winner_name = winner_user.display_name if winner_user else f"User {winner_id}"
        
        embed = discord.Embed(
            title="🏆 Tournament Complete!",
            description=f"**{tournament_id}** has ended",
            color=0xf1c40f
        )
        embed.add_field(name="Winner", value=winner_name, inline=True)
        embed.add_field(name="Participants", value=len(tournament['participants']), inline=True)
        
        await ctx.send(embed=embed)

@bot.command(name='gamble')
async def gamble_command(ctx, action: str = None, winner: discord.Member = None, loser: discord.Member = None):
    """Log gambling results between users"""
    if action is None or action != "log":
        embed = discord.Embed(
            title="🎰 Gambling Commands",
            description="Available gambling commands:",
            color=0xe67e22
        )
        embed.add_field(
            name="!gamble log @winner @loser",
            value="Log a gambling result between two users",
            inline=False
        )
        await ctx.send(embed=embed)
        return
    
    if action == "log":
        if not winner or not loser:
            await ctx.send("❌ Please mention both winner and loser. Usage: `!gamble log @winner @loser`")
            return
        
        if winner.id == loser.id:
            await ctx.send("❌ Winner and loser cannot be the same person.")
            return
        
        log_entry = {
            'winner_id': str(winner.id),
            'loser_id': str(loser.id),
            'logged_by': str(ctx.author.id),
            'timestamp': datetime.now().isoformat()
        }
        
        ewager.data['gambling_logs'].append(log_entry)
        ewager.save_data()
        
        embed = discord.Embed(
            title="🎰 Gambling Result Logged",
            description="Result has been recorded",
            color=0x2ecc71
        )
        embed.add_field(name="Winner", value=winner.mention, inline=True)
        embed.add_field(name="Loser", value=loser.mention, inline=True)
        embed.add_field(name="Logged by", value=ctx.author.mention, inline=True)
        
        await ctx.send(embed=embed)

@bot.command(name='logs')
async def gambling_logs(ctx, limit: int = 10):
    """Show recent gambling logs"""
    logs = ewager.data['gambling_logs'][-limit:]
    
    if not logs:
        await ctx.send("❌ No gambling logs found.")
        return
    
    embed = discord.Embed(
        title="🎰 Recent Gambling Results",
        description=f"Last {len(logs)} gambling results:",
        color=0xe67e22
    )
    
    for i, log in enumerate(reversed(logs), 1):
        winner_user = bot.get_user(int(log['winner_id']))
        loser_user = bot.get_user(int(log['loser_id']))
        
        winner_name = winner_user.display_name if winner_user else f"User {log['winner_id'][:8]}..."
        loser_name = loser_user.display_name if loser_user else f"User {log['loser_id'][:8]}..."
        
        timestamp = datetime.fromisoformat(log['timestamp'])
        
        embed.add_field(
            name=f"{i}. {winner_name} vs {loser_name}",
            value=f"Winner: {winner_name}\nDate: {timestamp.strftime('%Y-%m-%d %H:%M')}",
            inline=False
        )
    
    await ctx.send(embed=embed)

@bot.command(name='stats')
async def user_stats(ctx, user: discord.Member = None):
    """Show user statistics"""
    target_user = user or ctx.author
    user_id = str(target_user.id)
    user_data = ewager.get_user(user_id)
    
    # Calculate gambling stats
    gambling_logs = ewager.data['gambling_logs']
    wins = len([log for log in gambling_logs if log['winner_id'] == user_id])
    losses = len([log for log in gambling_logs if log['loser_id'] == user_id])
    
    embed = discord.Embed(
        title=f"📊 Stats for {target_user.display_name}",
        color=0x9b59b6
    )
    embed.add_field(name="Pokemon Rolls", value=len(user_data['pokemon_rolls']), inline=True)
    embed.add_field(name="Gambling Wins", value=wins, inline=True)
    embed.add_field(name="Gambling Losses", value=losses, inline=True)
    
    if user_data['pokemon_rolls']:
        last_roll = user_data['pokemon_rolls'][-1]
        embed.add_field(
            name="Last Pokemon",
            value=f"{last_roll['name']} (#{last_roll['id']})",
            inline=False
        )
    
    embed.set_thumbnail(url=target_user.avatar.url if target_user.avatar else None)
    
    await ctx.send(embed=embed)

@bot.command(name='help')
async def help_command(ctx):
    """Show help information"""
    embed = discord.Embed(
        title="🤖 EWagerBot Commands",
        description="A Discord bot for Pokemon rolling and gambling tracking",
        color=0x3498db
    )
    
    embed.add_field(
        name="🎲 Rolling Commands",
        value="`e!roll` or `e!w` - Roll a random Pokemon (1-1025)\n`!number` - Roll a random number (1-100)\n`!recent` - Show your recent Pokemon rolls\n\n**Universal Pokemon Roll Detection:**\nResponds to Pokemon roll commands (1025 only):\n`!roll 1025`, `?w 1025`, `>roll pokemon`, etc.\n*Does NOT respond to regular number rolls*",
        inline=False
    )
    
    embed.add_field(
        name="🏆 Tournament Commands",
        value="`!tournament` - Show tournament help\n`!tournament create <size>` - Create tournament\n`!tournament join <id>` - Join tournament\n`!tournament list` - List active tournaments",
        inline=False
    )
    
    embed.add_field(
        name="🎰 Gambling Commands",
        value="`!gamble log @winner @loser` - Log gambling result\n`!logs` - Show recent gambling logs",
        inline=False
    )
    
    embed.add_field(
        name="📊 Info Commands",
        value="`!stats [@user]` - Show user statistics\n`!help` - Show this help message",
        inline=False
    )
    
    await ctx.send(embed=embed)

if __name__ == "__main__":
    # Get bot token from environment variable
    token = os.getenv('DISCORD_BOT_TOKEN')
    if not token:
        print("ERROR: Please set the DISCORD_BOT_TOKEN environment variable")
        exit(1)
    
    bot.run(token)