interface GameResult {
  result: "win" | "loss" | "tie";
  payout: number;
  gameData: any;
}

export function playSlots(bet: number): GameResult {
  const symbols = ["🍒", "🔔", "7️⃣", "💎"];
  const multipliers = { "🍒": 2, "🔔": 3, "7️⃣": 5, "💎": 10 };
  
  const reels = [
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];
  
  let payout = 0;
  let result: "win" | "loss" | "tie" = "loss";
  
  // Check for three of a kind
  if (reels[0] === reels[1] && reels[1] === reels[2]) {
    const symbol = reels[0] as keyof typeof multipliers;
    payout = bet * multipliers[symbol];
    result = "win";
  }
  // Check for two of a kind (smaller payout)
  else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
    payout = bet; // Return bet amount
    result = "tie";
  }
  
  return {
    result,
    payout,
    gameData: {
      reels,
      description: `${reels.join(" | ")} - ${result === "win" ? "Jackpot!" : result === "tie" ? "Close!" : "Better luck next time!"}`
    }
  };
}

export function playCoinflip(bet: number, choice: "heads" | "tails"): GameResult {
  const outcome = Math.random() < 0.5 ? "heads" : "tails";
  const isWin = choice === outcome;
  
  return {
    result: isWin ? "win" : "loss",
    payout: isWin ? bet * 2 : 0,
    gameData: {
      choice,
      outcome,
      description: `Coin landed on ${outcome}. You chose ${choice}.`
    }
  };
}

export function playBlackjack(bet: number): GameResult {
  const drawCard = () => Math.min(Math.floor(Math.random() * 13) + 1, 10);
  const calculateValue = (cards: number[]) => {
    let value = cards.reduce((sum, card) => sum + card, 0);
    let aces = cards.filter(card => card === 1).length;
    
    // Handle aces (1 or 11)
    while (aces > 0 && value + 10 <= 21) {
      value += 10;
      aces--;
    }
    
    return value;
  };
  
  // Deal initial cards
  const playerCards = [drawCard(), drawCard()];
  const dealerCards = [drawCard(), drawCard()];
  
  let playerValue = calculateValue(playerCards);
  let dealerValue = calculateValue(dealerCards);
  
  // Dealer hits until 17 or higher
  while (dealerValue < 17) {
    dealerCards.push(drawCard());
    dealerValue = calculateValue(dealerCards);
  }
  
  let result: "win" | "loss" | "tie";
  let payout = 0;
  
  if (playerValue > 21) {
    result = "loss"; // Player bust
  } else if (dealerValue > 21) {
    result = "win"; // Dealer bust
    payout = bet * 2;
  } else if (playerValue > dealerValue) {
    result = "win";
    payout = bet * 2;
  } else if (playerValue === dealerValue) {
    result = "tie";
    payout = bet; // Return bet
  } else {
    result = "loss";
  }
  
  return {
    result,
    payout,
    gameData: {
      playerCards,
      dealerCards,
      playerValue,
      dealerValue,
      description: `Player: ${playerValue}, Dealer: ${dealerValue}`
    }
  };
}

export function playRoulette(bet: number, choice: string): GameResult {
  const number = Math.floor(Math.random() * 37); // 0-36
  const isRed = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(number);
  const isBlack = number !== 0 && !isRed;
  const isOdd = number % 2 === 1 && number !== 0;
  const isEven = number % 2 === 0 && number !== 0;
  
  let result: "win" | "loss" | "tie" = "loss";
  let payout = 0;
  
  if (choice === "red" && isRed) {
    result = "win";
    payout = bet * 2;
  } else if (choice === "black" && isBlack) {
    result = "win";
    payout = bet * 2;
  } else if (choice === "odd" && isOdd) {
    result = "win";
    payout = bet * 2;
  } else if (choice === "even" && isEven) {
    result = "win";
    payout = bet * 2;
  } else if (choice === number.toString()) {
    result = "win";
    payout = bet * 35; // Number bet
  }
  
  const color = number === 0 ? "green" : isRed ? "red" : "black";
  
  return {
    result,
    payout,
    gameData: {
      number,
      color,
      choice,
      description: `Ball landed on ${number} (${color}). You bet on ${choice}.`
    }
  };
}
