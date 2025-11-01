const DEFAULT_LOGO = '/Logo/placeholder-game.svg';

const GAME_LOGO_MAP = {
  'daily-word-challenge': '/logos/game-logos/daily-word-challenge.svg',
  'typing-legends': '/logos/game-logos/typing-legends.svg',
  'maze-runner': '/logos/game-logos/maze-runner.svg',
  'educational-bingo': '/logos/game-logos/educational-bingo.svg',
  'memory-challenge': '/logos/game-logos/memory-challenge.svg',
  'battle-royale': '/logos/game-logos/battle-royale.svg',
  'math-space-invaders': '/logos/game-logos/math-space-invaders.svg',
  'cell-battle': '/logos/game-logos/cell-battle.svg',
  battleships: '/logos/game-logos/battleships.svg',
  'tic-tac-toe': '/logos/game-logos/tic-tac-toe.svg',
  'match3-adventure': '/logos/game-logos/match3-adventure.svg',
  'hero-forge': '/logos/game-logos/hero-forge.svg',
  'classroom-bingo': '/logos/game-logos/classroom-bingo.svg',
  'math-race': '/logos/game-logos/math-race.svg',
  crossword: '/logos/game-logos/crossword.svg',
  'word-search': '/logos/game-logos/word-search.svg',
  boggle: '/logos/game-logos/boggle.svg',
  noggle: '/logos/game-logos/noggle.svg'
};

const GAME_LOGO_ALIASES = {
  bingo: 'educational-bingo',
  'bingo-edu': 'classroom-bingo',
  'maze-brain': 'maze-runner',
  maze: 'maze-runner',
  'memory-match': 'memory-challenge',
  'memory-masters': 'memory-challenge',
  'math-race-challenge': 'math-race',
  match3battle: 'match3-adventure',
  clicker: 'hero-forge'
};

export const getGameLogo = (identifier) => {
  if (!identifier) return DEFAULT_LOGO;
  const normalized = String(identifier).toLowerCase();
  const resolvedKey = GAME_LOGO_MAP[normalized]
    ? normalized
    : GAME_LOGO_ALIASES[normalized] || normalized;
  return GAME_LOGO_MAP[resolvedKey] || DEFAULT_LOGO;
};

export const listAvailableGameLogos = () => ({ ...GAME_LOGO_MAP });

export default GAME_LOGO_MAP;
