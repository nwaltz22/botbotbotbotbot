import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Clock } from "lucide-react";

interface PokemonCardProps {
  pokemon: {
    id: number;
    name: string;
    sprite: string;
    types: string[];
    stats: {
      hp: number;
      attack: number;
      defense: number;
      speed: number;
      sp_attack: number;
      sp_defense: number;
    };
  };
  cost: number;
  timestamp: string | Date;
}

export default function PokemonCard({ pokemon, cost, timestamp }: PokemonCardProps) {
  const totalStats = Object.values(pokemon.stats).reduce((sum, stat) => sum + stat, 0);
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">#{pokemon.id} {pokemon.name}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Coins className="h-4 w-4" />
            {cost}
          </div>
        </div>
        <div className="flex gap-1">
          {pokemon.types.map((type) => (
            <Badge key={type} variant="secondary" className="text-xs">
              {type}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Pokemon Image */}
        {pokemon.sprite && (
          <div className="flex justify-center">
            <img 
              src={pokemon.sprite} 
              alt={pokemon.name}
              className="w-24 h-24 object-contain"
            />
          </div>
        )}
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div>HP: {pokemon.stats.hp}</div>
          <div>Attack: {pokemon.stats.attack}</div>
          <div>Defense: {pokemon.stats.defense}</div>
          <div>Sp. Atk: {pokemon.stats.sp_attack}</div>
          <div>Sp. Def: {pokemon.stats.sp_defense}</div>
          <div>Speed: {pokemon.stats.speed}</div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-sm font-medium">
            BST: {totalStats}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {new Date(timestamp).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
