const POKEMON_API_BASE = "https://pokeapi.co/api/v2/pokemon/";
const MAX_POKEMON_ID = 1025;

interface PokemonData {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    sp_attack: number;
    sp_defense: number;
  };
  sprite: string;
}

const STAT_MAPPING = {
  'hp': 'hp',
  'attack': 'attack', 
  'defense': 'defense',
  'speed': 'speed',
  'special-attack': 'sp_attack',
  'special-defense': 'sp_defense'
};

export async function rollPokemon(): Promise<PokemonData | null> {
  try {
    const pokemonId = Math.floor(Math.random() * MAX_POKEMON_ID) + 1;
    const url = `${POKEMON_API_BASE}${pokemonId}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    // Extract and map stats
    const stats: any = {};
    for (const stat of data.stats) {
      const statName = stat.stat.name;
      if (statName in STAT_MAPPING) {
        stats[STAT_MAPPING[statName as keyof typeof STAT_MAPPING]] = stat.base_stat;
      }
    }
    
    return {
      id: data.id,
      name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
      height: data.height,
      weight: data.weight,
      types: data.types.map((t: any) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)),
      stats,
      sprite: data.sprites.front_default,
    };
    
  } catch (error) {
    console.error("Error fetching Pokemon data:", error);
    return null;
  }
}

export async function getPokemonById(id: number): Promise<PokemonData | null> {
  try {
    const url = `${POKEMON_API_BASE}${id}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    // Extract and map stats
    const stats: any = {};
    for (const stat of data.stats) {
      const statName = stat.stat.name;
      if (statName in STAT_MAPPING) {
        stats[STAT_MAPPING[statName as keyof typeof STAT_MAPPING]] = stat.base_stat;
      }
    }
    
    return {
      id: data.id,
      name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
      height: data.height,
      weight: data.weight,
      types: data.types.map((t: any) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)),
      stats,
      sprite: data.sprites.front_default,
    };
    
  } catch (error) {
    console.error("Error fetching Pokemon data:", error);
    return null;
  }
}
