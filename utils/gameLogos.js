import { normalizeImageSource, serializeFallbacks } from './imageFallback';

export const DEFAULT_LOGO = '/Logo/placeholder-game.svg';

// ─────────────────────────────────────────────────────────────────────────────
// Every game maps to ONE exact file that exists in /public. No name-guessing,
// no extension roulette — at most one request per logo, with the placeholder
// as the only fallback. (The old candidate-generator produced dozens of 404s
// per game while it guessed filenames.)
// ─────────────────────────────────────────────────────────────────────────────
const GL = '/logos/game-logos';

const GAME_LOGO_MAP = {
  '2048-puzzle': [`${GL}/2048 Puzzle.png`],
  'astro-blaster': [`${GL}/Astro Blaster.png`],
  'battle-royale': [`${GL}/battle-royale.png`],
  battleships: [`${GL}/battleships.png`],
  'block-blaster': [`${GL}/Block Buster.png`],
  'bluff-battle': [`${GL}/Bluff Battle.png`],
  boggle: [`${GL}/boggle.svg`],
  'brain-blitz': [`${GL}/Brain Blitz.png`],
  'cell-battle': [`${GL}/cell-battle.png`],
  'champions-menagerie': ['/shop/Egg/Egg.png'],
  'wildwood-homestead': [`${GL}/Cozy Cottage.png`],
  chess: [`${GL}/Chess.png`, '/Logo/Game Logos/chess.svg'],
  'classroom-bingo': [`${GL}/classroom-bingo.png`],
  'coordinate-quest': [`${GL}/coordinate.png`],
  'cozy-cottage': [`${GL}/Cozy Cottage.png`],
  'critter-sort': [`${GL}/Critter Sort.png`],
  crossword: [`${GL}/crossword.svg`],
  'daily-word-challenge': [`${GL}/daily-word-challenge.png`],
  'dodgeball-frenzy': [`${GL}/dodgeball.png`],
  'educational-bingo': [`${GL}/Educational Bingo.png`],
  'endless-runner': [DEFAULT_LOGO],
  'food-chain-frenzy': [`${GL}/Food Chain Frenzy.png`],
  'fruit-frenzy': [`${GL}/Fruit Frenzy.png`],
  'grammar-goalie': [`${GL}/Grammar Goalie.png`],
  'kawaii-agar': [DEFAULT_LOGO],
  'magical-athletes': [`${GL}/magical-athletes.svg`],
  'match3-adventure': [`${GL}/match3-adventure.svg`],
  'math-grand-prix': [`${GL}/Math Grand Prix.png`],
  'math-grid': [`${GL}/mathsfacts.png`],
  'math-race': [`${GL}/math-race.svg`],
  'math-space-invaders': [`${GL}/math-space-invaders.png`],
  'maze-runner': [`${GL}/maze-runner.png`],
  'memory-challenge': [`${GL}/memory-challenge.png`],
  'neon-serpent': [`${GL}/Neon Serpent.png`],
  'neon-tetris': [`${GL}/Neon Tetris.png`],
  noggle: [`${GL}/noggle.svg`],
  'number-crunch': [`${GL}/Number Crunch.png`],
  'place-value-pop': [`${GL}/Place Value Pop.png`],
  'precision-timer': [`${GL}/Timer.png`, `${GL}/precisiontimer.png`],
  'sin-miner-logo': [`${GL}/sin-miner.svg`],
  'sketch-guess': [`${GL}/Sketch and Guess.png`],
  'sky-hopper': [`${GL}/Sky Hopper.png`],
  'spell-caster': [`${GL}/Spell Caster.png`],
  'sprout-bloom': [`${GL}/Cozy Cottage.png`],
  'story-sleuth': [`${GL}/Story Slueth.png`],
  'sweet-empire': [`${GL}/Champions Forge.png`, `${GL}/hero-forge.png`],
  'tic-tac-toe': [`${GL}/tic-tac-toe.png`],
  'town-square': [`${GL}/Town Square.png`, `${GL}/Town Square.svg`],
  'my-hangout': [`${GL}/Hangout.png`, '/game icons/Town Square/003-medieval-house.svg'],
  'tower-stack': [`${GL}/Tower Stack.png`],
  'type-defender': [`${GL}/typedefender.png`],
  'typing-legends': [`${GL}/typing-legends.svg`],
  uno: [`${GL}/Uno.png`, '/Logo/Game Logos/uno.svg'],
  werewolf: [`${GL}/One Night Werewolf.png`, `${GL}/werewolf.svg`],
  'whack-a-mole': [`${GL}/Whack a mole.png`],
  'word-agents': [`${GL}/Codenames.png`, `${GL}/Word Agents.svg`],
  'word-hunt': [`${GL}/Word Hunt.png`],
  'word-imposter': [`${GL}/Word Imposter.png`],
  'word-scramble': [`${GL}/Word Scramble.png`],
  'word-search': [`${GL}/word-search.svg`],
};

const GAME_LOGO_ALIASES = {
  bingo: 'educational-bingo',
  'bingo-edu': 'classroom-bingo',
  'maze-brain': 'maze-runner',
  maze: 'maze-runner',
  'memory-match': 'memory-challenge',
  'memory-masters': 'memory-challenge',
  dodgeball: 'dodgeball-frenzy',
  'math-race-challenge': 'math-race',
  match3battle: 'match3-adventure',
  clicker: 'sweet-empire',
  'sin-miner': 'sin-miner-logo',
  'precision-timer-challenge': 'precision-timer',
  'timer-challenge': 'precision-timer',
  'cell-arena': 'cell-battle',
  'sprout-and-bloom': 'sprout-bloom',
  'farm-sim': 'sprout-bloom',
  'kawaii-agar-game': 'kawaii-agar',
  'kawaiiagar': 'kawaii-agar',
  'endless-runner-game': 'endless-runner',
  'endlessrunner': 'endless-runner'
};

const buildLogoSource = (candidates = []) => {
  const [primary, ...rest] = Array.isArray(candidates) ? candidates : [candidates];
  return normalizeImageSource(
    {
      src: primary,
      fallbacks: rest
    },
    DEFAULT_LOGO
  );
};

export const getGameLogo = (identifier) => {
  if (!identifier) return normalizeImageSource(DEFAULT_LOGO, DEFAULT_LOGO);

  const normalized = String(identifier).toLowerCase();
  const resolvedKey = GAME_LOGO_MAP[normalized]
    ? normalized
    : GAME_LOGO_ALIASES[normalized] || normalized;

  const candidates = GAME_LOGO_MAP[resolvedKey];
  return buildLogoSource(candidates || DEFAULT_LOGO);
};

export const listAvailableGameLogos = () => {
  const entries = {};
  Object.keys(GAME_LOGO_MAP).forEach((key) => {
    entries[key] = buildLogoSource(GAME_LOGO_MAP[key]);
  });
  return entries;
};

export const serializeLogoFallbacks = (logo) => serializeFallbacks(logo?.fallbacks);

export default GAME_LOGO_MAP;
