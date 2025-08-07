import discord
from discord.ext import commands
import json
import random
import asyncio
import requests
from datetime import datetime
from typing import Optional, Dict, Any, List

# Bot setup
intents = discord.Intents.default()
intents.message_content = True
intents.guilds = True
intents.members = True

bot = commands.Bot(command_prefix='e!', intents=intents)

# Data storage
tournaments = {}
trades_log = {}

# Constants
POKEMON_API_BASE = "https://pokeapi.co/api/v2/pokemon/"
MAX_POKEMON_ID = 1025  # All standard Pokemon (1-1025) excluding special forms and events
TOURNAMENT_SIZE_RANGE = (20, 50)

# Stat mapping for cleaner code
STAT_MAPPING = {
    'hp': 'hp',
    'attack': 'attack', 
    'defense': 'defense',
    'speed': 'speed',
    'special-attack': 'sp_attack',
    'special-defense': 'sp_defense'
}

class PokemonAPI:
    """Handle Pokemon API interactions"""
    
    @staticmethod
    async def get_pokemon_data(pokemon_id: int) -> Optional[Dict[str, Any]]:
        """Fetch Pokemon data from PokeAPI"""
        try:
            url = f"{POKEMON_API_BASE}{pokemon_id}"
            response = requests.get(url)
            
            if response.status_code != 200:
                return None
                
            data = response.json()
            
            # Extract and map stats
            stats = {}
            for stat in data['stats']:
                stat_name = stat['stat']['name']
                if stat_name in STAT_MAPPING:
                    stats[STAT_MAPPING[stat_name]] = stat['base_stat']
            
            return {
                'name': data['name'].title(),
                'id': data['id'],
                'height': data['height'],
                'weight': data['weight'],
                'types': [t['type']['name'].title() for t in data['types']],
                'stats': stats,
                'sprite': data['sprites']['front_default']
            }
            
        except Exception as e:
            print(f"Error fetching Pokemon data: {e}")
            return None

class EmbedBuilder:
    """Build Discord embeds for different purposes"""
    
    @staticmethod
    def create_pokemon_embed(pokemon_data: Dict[str, Any], roll: int, author_name: str) -> discord.Embed:
        """Create embed for Pokemon roll results"""
        level = random.randint(1, 100)
        iv_total = sum(pokemon_data['stats'].values())
        types_str = " / ".join(pokemon_data['types'])

        embed = discord.Embed(
            description=f"#{roll} {pokemon_data['name']}",
            color=0xC3BCF4
        )
        
        # Basic info
        embed.add_field(name="Type", value=types_str, inline=True)
        embed.add_field(name="Level", value=level, inline=True)
        embed.add_field(name="Height", value=f"{pokemon_data['height']/10}m", inline=True)
        embed.add_field(name="Weight", value=f"{pokemon_data['weight']/10}kg", inline=True)
        
        # Stats
        embed.add_field(name="HP", value=pokemon_data['stats']['hp'], inline=True)
        embed.add_field(name="Attack", value=pokemon_data['stats']['attack'], inline=True)
        embed.add_field(name="Defense", value=pokemon_data['stats']['defense'], inline=True)
        embed.add_field(name="Sp. Attack", value=pokemon_data['stats']['sp_attack'], inline=True)
        embed.add_field(name="Sp. Defense", value=pokemon_data['stats']['sp_defense'], inline=True)
        embed.add_field(name="Speed", value=pokemon_data['stats']['speed'], inline=True)
        embed.add_field(name="Base Stat Total", value=iv_total, inline=True)
        
        if pokemon_data['sprite']:
            embed.set_thumbnail(url=pokemon_data['sprite'])
        
        embed.set_footer(text=f"Rolled by {author_name}")
        return embed
    
    @staticmethod
    def create_roll_embed(roll: int, author_name: str) -> discord.Embed:
        """Create embed for simple roll results"""
        embed = discord.Embed(
            title="🎲 Roll Result",
            description=f"**{roll}/100**",
            color=0x3498db
        )
        embed.set_footer(text=f"Rolled by {author_name}")
        return embed
    
    @staticmethod
    def create_manual_log_embed(winner_mention: str, loser_mention: str, 
                               logger_mention: str, log_count: int) -> discord.Embed:
        """Create embed for manual gambling logs"""
        embed = discord.Embed(
            title="📋 Manual Gambling Log",
            description=f"**Winner:** {winner_mention} 🏆\n**Loser:** {loser_mention} ❌",
            color=0xffd700
        )
        embed.add_field(name="Logged by", value=logger_mention, inline=True)
        embed.add_field(name="Log ID", value=f"ML-{log_count}", inline=True)
        embed.set_footer(text=f"Logged at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        return embed

class UserMentionParser:
    """Parse and validate user mentions"""
    
    @staticmethod
    def parse_user_id(mention: str) -> Optional[int]:
        """Extract user ID from mention string"""
        try:
            return int(mention.strip('<@!>'))
        except ValueError:
            return None
    
    @staticmethod
    def validate_mentions(users: str) -> tuple[Optional[int], Optional[int]]:
        """Validate and parse two user mentions"""
        user_mentions = users.split()
        
        if len(user_mentions) != 2:
            return None, None
            
        winner_id = UserMentionParser.parse_user_id(user_mentions[0])
        loser_id = UserMentionParser.parse_user_id(user_mentions[1])
        
        if winner_id is None or loser_id is None:
            return None, None
            
        return winner_id, loser_id

class TradeLogger:
    """Handle trade and gambling log operations"""
    
    @staticmethod
    def log_manual_gambling(winner_id: int, loser_id: int, logger_id: int, channel_id: int):
        """Log manual gambling result"""
        gambling_result = {
            'type': 'manual_log',
            'winner_id': winner_id,
            'loser_id': loser_id,
            'logged_by': logger_id,
            'channel': channel_id,
            'timestamp': datetime.now().isoformat()
        }
        
        if 'manual_logs' not in trades_log:
            trades_log['manual_logs'] = []
        trades_log['manual_logs'].append(gambling_result)
        
        return len(trades_log['manual_logs'])
    
    @staticmethod
    def log_trade_message(user_id: int, channel_id: int, content: str):
        """Log trade message"""
        trade_data = {
            'user': user_id,
            'channel': channel_id,
            'content': content,
            'timestamp': datetime.now().isoformat()
        }
        
        if channel_id not in trades_log:
            trades_log[channel_id] = []
        trades_log[channel_id].append(trade_data)

class RollDetector:
    """Detect roll commands in messages"""
    
    ROLL_1025_PATTERNS = ['roll 1025']
    W_1025_PATTERNS = ['w 1025']
    ROLL_PREFIXES = ['!', '?', '>', '<', '~', '.']
    W_PREFIXES = ['e!', 'e.', 'e?', 'e>', 'e<', 'e~']
    
    @staticmethod
    def is_roll_1025_command(content: str) -> bool:
        """Check if message contains roll 1025 command"""
        content_lower = content.lower().strip()
        
        # Check for regular roll 1025 commands
        for prefix in RollDetector.ROLL_PREFIXES:
            for pattern in RollDetector.ROLL_1025_PATTERNS:
                if f"{prefix}{pattern}" in content_lower:
                    return True
        
        # Check for e!w 1025 commands
        for prefix in RollDetector.W_PREFIXES:
            for pattern in RollDetector.W_1025_PATTERNS:
                if f"{prefix}{pattern}" in content_lower:
                    return True
        
        return False
    
    @staticmethod
    def is_regular_roll_command(content: str) -> bool:
        """Check if message contains regular roll command (not 1025)"""
        content_lower = content.lower().strip()
        
        for prefix in RollDetector.ROLL_PREFIXES:
            if f"{prefix}roll" in content_lower and "1025" not in content_lower:
                return True
        
        return False

# Event handlers
@bot.event
async def on_ready():
    """Bot startup event"""
    print(f'{bot.user} has landed!')
    try:
        synced = await bot.tree.sync()
        print(f"Synced {len(synced)} command(s)")
    except Exception as e:
        print(f"Failed to sync commands: {e}")

@bot.event
async def on_reaction_add(reaction, user):
    """Handle tournament registration and control reactions"""
    if user.bot:
        return
    
    message = reaction.message
    embed = message.embeds[0] if message.embeds else None
    
    if not embed or "Tournament #" not in embed.title:
        return
    
    # Extract tournament ID from embed title
    try:
        tournament_id = int(embed.title.split("#")[1].split(" ")[0])
    except (IndexError, ValueError):
        return
    
    if tournament_id not in tournaments:
        return
    
    tournament = tournaments[tournament_id]
    
    # Handle different reactions
    if str(reaction.emoji) == '🎯':  # Join tournament
        await handle_tournament_join(user, tournament, tournament_id, message)
    elif str(reaction.emoji) == '❌':  # Leave tournament
        await handle_tournament_leave(user, tournament, tournament_id, message)
    elif str(reaction.emoji) == '▶️':  # Start tournament (mods/admins only)
        await handle_tournament_start(user, tournament, tournament_id, message)

@bot.event
async def on_reaction_remove(reaction, user):
    """Handle when users remove their reactions"""
    if user.bot:
        return
    
    message = reaction.message
    embed = message.embeds[0] if message.embeds else None
    
    if not embed or "Tournament #" not in embed.title:
        return
    
    # Extract tournament ID from embed title
    try:
        tournament_id = int(embed.title.split("#")[1].split(" ")[0])
    except (IndexError, ValueError):
        return
    
    if tournament_id not in tournaments:
        return
    
    tournament = tournaments[tournament_id]
    
    # Handle leaving tournament when removing join reaction
    if str(reaction.emoji) == '🎯':
        await handle_tournament_leave(user, tournament, tournament_id, message)

@bot.event
async def on_message(message):
    """Handle message events for roll detection and trade logging"""
    if message.author.bot:
        return
    
    content = message.content.lower().strip()
    
    # Handle roll 1025 commands
    if RollDetector.is_roll_1025_command(content):
        await handle_pokemon_roll(message)
        return
    
    # Handle regular roll commands
    elif RollDetector.is_regular_roll_command(content):
        await handle_regular_roll(message)
        return
    
    # Log trades in trade/gamble channels
    if is_trade_channel(message.channel):
        TradeLogger.log_trade_message(
            message.author.id, 
            message.channel.id, 
            message.content
        )
    
    await bot.process_commands(message)

# Helper functions
def is_trade_channel(channel) -> bool:
    """Check if channel is a trade or gambling channel"""
    channel_name = channel.name.lower()
    return 'trade' in channel_name or 'gamble' in channel_name

def has_tournament_permissions(user, guild) -> bool:
    """Check if user has permissions to start tournaments"""
    member = guild.get_member(user.id)
    if not member:
        return False
    
    return (member.guild_permissions.manage_messages or 
            member.guild_permissions.administrator or
            any(role.name.lower() in ['mod', 'moderator', 'admin', 'administrator'] 
                for role in member.roles))

async def update_tournament_embed(tournament_id: int, tournament: dict, message):
    """Update tournament embed with current participant count"""
    participant_count = len(tournament['participants'])
    status = tournament['status'].title()
    
    embed = discord.Embed(
        title=f"🏆 Tournament #{tournament_id}",
        description=f"**Size:** {tournament['size']} members\n**Status:** {status}\n**Participants:** {participant_count}/{tournament['size']}",
        color=0xffd700 if status == 'Registration' else 0x00ff00
    )
    
    if tournament['status'] == 'registration':
        embed.add_field(name="How to Join", value="🎯 - Join tournament\n❌ - Leave tournament", inline=False)
        if participant_count >= 2:  # Minimum participants to start
            embed.add_field(name="For Mods/Admins", value="▶️ - Start tournament", inline=False)
    elif tournament['status'] == 'active':
        embed.add_field(name="Tournament Status", value="Tournament is now active!", inline=False)
    
    # Show participant list if not too long
    if participant_count > 0 and participant_count <= 10:
        participant_names = []
        for participant_id in tournament['participants']:
            user = message.guild.get_member(participant_id)
            participant_names.append(user.display_name if user else f"User {participant_id}")
        embed.add_field(name="Participants", value="\n".join(participant_names), inline=False)
    
    embed.set_footer(text=f"Created: {tournament['created_at'].strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        await message.edit(embed=embed)
    except discord.NotFound:
        pass  # Message was deleted

async def handle_tournament_join(user, tournament: dict, tournament_id: int, message):
    """Handle user joining tournament"""
    if tournament['status'] != 'registration':
        return
    
    if user.id in tournament['participants']:
        return  # Already joined
    
    if len(tournament['participants']) >= tournament['size']:
        return  # Tournament is full
    
    tournament['participants'].append(user.id)
    await update_tournament_embed(tournament_id, tournament, message)

async def handle_tournament_leave(user, tournament: dict, tournament_id: int, message):
    """Handle user leaving tournament"""
    if tournament['status'] != 'registration':
        return
    
    if user.id not in tournament['participants']:
        return  # Not in tournament
    
    tournament['participants'].remove(user.id)
    await update_tournament_embed(tournament_id, tournament, message)

async def handle_tournament_start(user, tournament: dict, tournament_id: int, message):
    """Handle tournament start (mods/admins only)"""
    if tournament['status'] != 'registration':
        return
    
    if not has_tournament_permissions(user, message.guild):
        return  # No permissions
    
    participant_count = len(tournament['participants'])
    if participant_count < 2:
        return  # Not enough participants
    
    tournament['status'] = 'active'
    tournament['started_by'] = user.id
    tournament['started_at'] = datetime.now()
    
    await update_tournament_embed(tournament_id, tournament, message)
    
    # Send start notification
    start_embed = discord.Embed(
        title=f"🚀 Tournament #{tournament_id} Started!",
        description=f"Tournament has begun with **{participant_count}** participants!",
        color=0x00ff00
    )
    start_embed.add_field(name="Started by", value=user.mention, inline=True)
    start_embed.add_field(name="Participants", value=str(participant_count), inline=True)
    
    await message.channel.send(embed=start_embed)

async def handle_pokemon_roll(message):
    """Handle Pokemon roll (1025) from message"""
    roll = random.randint(1, MAX_POKEMON_ID)
    pokemon_data = await PokemonAPI.get_pokemon_data(roll)
    
    if pokemon_data:
        embed = EmbedBuilder.create_pokemon_embed(pokemon_data, roll, message.author.display_name)
        await message.channel.send(embed=embed)

async def handle_regular_roll(message):
    """Handle regular roll (100) from message"""
    roll = random.randint(1, 100)
    embed = EmbedBuilder.create_roll_embed(roll, message.author.display_name)
    await message.channel.send(embed=embed)

# Commands
@bot.command(name='w')
async def roll_pokemon(ctx, *, users: str = None):
    """Roll Pokemon or log manual gambling results"""
    if users:
        # Manual logging mode
        winner_id, loser_id = UserMentionParser.validate_mentions(users)
        
        if winner_id is None or loser_id is None:
            await ctx.send("Please mention exactly 2 users for manual logging: `e!w @winner @loser`")
            return
        
        # Log the result
        log_count = TradeLogger.log_manual_gambling(
            winner_id, loser_id, ctx.author.id, ctx.channel.id
        )
        
        # Create and send embed
        user_mentions = users.split()
        embed = EmbedBuilder.create_manual_log_embed(
            user_mentions[0], user_mentions[1], ctx.author.mention, log_count
        )
        await ctx.send(embed=embed)
    
    else:
        # Pokemon roll mode
        roll = random.randint(1, MAX_POKEMON_ID)
        pokemon_data = await PokemonAPI.get_pokemon_data(roll)
        
        if not pokemon_data:
            await ctx.send("❌ Failed to fetch Pokemon data. Please try again!")
            return
        
        embed = EmbedBuilder.create_pokemon_embed(pokemon_data, roll, ctx.author.display_name)
        await ctx.send(embed=embed)

@bot.command(name='roll')
async def roll_command(ctx):
    """Roll out of 100"""
    roll = random.randint(1, 100)
    embed = EmbedBuilder.create_roll_embed(roll, ctx.author.display_name)
    await ctx.send(embed=embed)

@bot.command(name='1025')
async def roll_1025(ctx):
    """Roll out of 1025 and display Pokemon stats"""
    roll = random.randint(1, MAX_POKEMON_ID)
    pokemon_data = await PokemonAPI.get_pokemon_data(roll)
    
    if not pokemon_data:
        await ctx.send("❌ Failed to fetch Pokemon data. Please try again!")
        return
    
    embed = EmbedBuilder.create_pokemon_embed(pokemon_data, roll, ctx.author.display_name)
    await ctx.send(embed=embed)

@bot.command(name='tournament')
@commands.has_permissions(manage_messages=True)
async def start_tournament(ctx, size: int = 50):
    """Start a tournament (20-50 members)"""
    if size not in range(*TOURNAMENT_SIZE_RANGE):
        await ctx.send(f"Tournament size must be between {TOURNAMENT_SIZE_RANGE[0]}-{TOURNAMENT_SIZE_RANGE[1]} members!")
        return
    
    tournament_id = len(tournaments) + 1
    tournaments[tournament_id] = {
        'host': ctx.author.id,
        'participants': [],
        'size': size,
        'status': 'registration',
        'created_at': datetime.now()
    }
    
    embed = discord.Embed(
        title=f"🏆 Tournament #{tournament_id}",
        description=f"**Size:** {size} members\n**Status:** Registration\n**Participants:** 0/{size}",
        color=0xffd700
    )
    embed.add_field(name="How to Join", value="🎯 - Join tournament\n❌ - Leave tournament", inline=False)
    embed.set_footer(text=f"Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    message = await ctx.send(embed=embed)
    await message.add_reaction('🎯')  # Join
    await message.add_reaction('❌')  # Leave

# Run the bot
if __name__ == "__main__":
    bot.run('YOUR_BOT_TOKEN')