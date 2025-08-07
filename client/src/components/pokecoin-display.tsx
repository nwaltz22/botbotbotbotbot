import { Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PokecoinDisplayProps {
  balance: number;
  size?: "sm" | "md" | "lg";
}

export default function PokecoinDisplay({ balance, size = "md" }: PokecoinDisplayProps) {
  const sizeClasses = {
    sm: "text-sm px-2 py-1",
    md: "text-lg px-3 py-2",
    lg: "text-xl px-4 py-3",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className="flex items-center justify-center">
      <Badge 
        variant="outline" 
        className={`${sizeClasses[size]} bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 text-yellow-800 font-bold`}
      >
        <Coins className={`${iconSizes[size]} mr-2 text-yellow-600`} />
        {balance.toLocaleString()} Pokecoins
      </Badge>
    </div>
  );
}
