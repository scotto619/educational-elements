import { normalizeImageSource, serializeFallbacks } from './imageFallback';

export const DEFAULT_LOGO = '/Logo/placeholder-game.svg';

const LOGO_DIRECTORIES = ['/Logo/Game Logos', '/logos/game-logos'];
const LOGO_EXTENSIONS = ['.png', '.PNG', '.jpg', '.JPG', '.jpeg', '.JPEG', '.svg', '.SVG'];

const toTitleCase = (value = '') =>
  value.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));

const normalizeCandidatePath = (dir, file) => {
  const baseDir = dir.replace(/\/+$/, '');
  const normalizedFile = String(file || '').replace(/^\/+/, '');
  if (!baseDir) return `/${normalizedFile}`;
  return `${baseDir}/${normalizedFile}`;
};

const pushWithDirectories = (accumulator, file) => {
  if (!file) return;
  if (file.startsWith('/')) {
    accumulator.push(file);
    return;
  }

  const normalized = file.replace(/^\/+/, '');

  if (normalized.includes('/')) {
    accumulator.push(`/${normalized}`);
  }

  LOGO_DIRECTORIES.forEach((dir) => {
    accumulator.push(normalizeCandidatePath(dir, normalized));
  });
};

const createLogoCandidates = (identifier, additionalNames = []) => {
  const slug = String(identifier || '').toLowerCase();
  const spaced = slug.replace(/-/g, ' ');
  const title = toTitleCase(spaced);

  const candidateNames = Array.from(
    new Set([
      slug,
      spaced,
      title,
      ...additionalNames
    ])
  );

  const candidates = [];

  candidateNames.forEach((name) => {
    const raw = String(name || '').trim();
    if (!raw) return;

    // If the provided value already looks like a path, use it directly.
    if (raw.startsWith('/')) {
      candidates.push(raw);
      return;
    }

    const hasExtension = /\.\w+$/.test(raw);

    if (hasExtension) {
      pushWithDirectories(candidates, raw);
      return;
    }

    const slugged = raw.replace(/\s+/g, '-').toLowerCase();
    const lower = raw.toLowerCase();

    const baseNames = Array.from(new Set([raw, slugged, lower]));

    baseNames.forEach((base) => {
      LOGO_EXTENSIONS.forEach((extension) => {
        pushWithDirectories(candidates, `${base}${extension}`);
      });
    });
  });

  return Array.from(new Set(candidates));
};

// Puts a known-to-exist file first so the browser never has to walk the
// error-fallback chain (and never lands on the placeholder).
const exactLogo = (file, identifier, additionalNames = []) => [
  `/logos/game-logos/${file}`,
  ...createLogoCandidates(identifier, additionalNames),
];

const GAME_LOGO_MAP = {
  // ── Every entry's primary path is a real file in /public/logos/game-logos ──
  '2048-puzzle': exactLogo('2048 Puzzle.png', '2048-puzzle', ['2048']),
  'astro-blaster': exactLogo('Astro Blaster.png', 'astro-blaster'),
  'battle-royale': exactLogo('battle-royale.png', 'battle-royale', ['Battle Royale Learning', 'Battle Royale']),
  battleships: exactLogo('battleships.png', 'battleships', ['Battleships Tournament', 'Battleships']),
  'block-blaster': exactLogo('Block Buster.png', 'block-blaster', ['Block Buster']),
  'bluff-battle': exactLogo('Bluff Battle.png', 'bluff-battle'),
  boggle: exactLogo('boggle.svg', 'boggle', ['Boggle']),
  'brain-blitz': exactLogo('Brain Blitz.png', 'brain-blitz'),
  'cell-battle': exactLogo('cell-battle.png', 'cell-battle', ['Cell Battle Arena', 'Cell Battle']),
  chess: exactLogo('Chess.png', 'chess', ['/Logo/Game Logos/chess.svg', 'Chess']),
  'classroom-bingo': exactLogo('classroom-bingo.png', 'classroom-bingo', ['Classroom Bingo', 'Classroom BINGO']),
  'coordinate-quest': exactLogo('coordinate.png', 'coordinate-quest', ['Coordinate Quest', 'Space Coordinates']),
  'cozy-cottage': exactLogo('Cozy Cottage.png', 'cozy-cottage', ['Cozy Cottage']),
  'critter-sort': exactLogo('Critter Sort.png', 'critter-sort', ['Animal Classification']),
  crossword: exactLogo('crossword.svg', 'crossword', ['Crossword']),
  'daily-word-challenge': exactLogo('daily-word-challenge.png', 'daily-word-challenge', ['Daily Word Challenge']),
  'dodgeball-frenzy': exactLogo('dodgeball.png', 'dodgeball-frenzy', ['Dodgeball']),
  'educational-bingo': exactLogo('Educational Bingo.png', 'educational-bingo', ['classroom-bingo.png', 'Bingo']),
  'endless-runner': createLogoCandidates('endless-runner', ['endless-runner.png', 'Endless Runner', 'endless-runner-logo']),
  'food-chain-frenzy': exactLogo('Food Chain Frenzy.png', 'food-chain-frenzy'),
  'fruit-frenzy': exactLogo('Fruit Frenzy.png', 'fruit-frenzy'),
  'grammar-goalie': exactLogo('Grammar Goalie.png', 'grammar-goalie'),
  'kawaii-agar': createLogoCandidates('kawaii-agar', ['kawaii-agar.png', 'Kawaii Agar', 'kawaii agar', 'kawaii-agar-logo']),
  'magical-athletes': exactLogo('magical-athletes.svg', 'magical-athletes', ['Magical Athletes', 'Magic Athletes']),
  'match3-adventure': exactLogo('match3-adventure.svg', 'match3-adventure', ['Match3 Battle', 'Match 3 Battle']),
  'math-grand-prix': exactLogo('Math Grand Prix.png', 'math-grand-prix'),
  'math-grid': exactLogo('mathsfacts.png', 'math-grid', ['Math Facts Grid', 'Math Grid']),
  'math-race': exactLogo('math-race.svg', 'math-race', ['Math Race Challenge', 'Math Race']),
  'math-space-invaders': exactLogo('math-space-invaders.png', 'math-space-invaders', ['Space Maths']),
  'maze-runner': exactLogo('maze-runner.png', 'maze-runner', ['Maze']),
  'memory-challenge': exactLogo('memory-challenge.png', 'memory-challenge', ['Memory Masters', 'Memory']),
  'neon-serpent': exactLogo('Neon Serpent.png', 'neon-serpent'),
  'neon-tetris': exactLogo('Neon Tetris.png', 'neon-tetris'),
  noggle: exactLogo('noggle.svg', 'noggle', ['Noggle']),
  'number-crunch': exactLogo('Number Crunch.png', 'number-crunch'),
  'place-value-pop': exactLogo('Place Value Pop.png', 'place-value-pop'),
  'precision-timer': exactLogo('Timer.png', 'precision-timer', ['precisiontimer.png', 'Timer Challenge']),
  'sin-miner-logo': exactLogo('sin-miner.svg', 'sin-miner', ['Sin Miner']),
  'sketch-guess': exactLogo('Sketch and Guess.png', 'sketch-guess', ['Sketch and Guess']),
  'sky-hopper': exactLogo('Sky Hopper.png', 'sky-hopper'),
  'spell-caster': exactLogo('Spell Caster.png', 'spell-caster'),
  'sprout-bloom': exactLogo('Cozy Cottage.png', 'sprout-bloom', ['Cozy Cottage', 'Sprout & Bloom']),
  'story-sleuth': exactLogo('Story Slueth.png', 'story-sleuth', ['Story Sleuth']),
  'sweet-empire': exactLogo('Champions Forge.png', 'sweet-empire', ["Champion's Forge", 'hero-forge.png']),
  'tic-tac-toe': exactLogo('tic-tac-toe.png', 'tic-tac-toe', ['Tic Tac Toe Tournament', 'TicTacToe']),
  'tower-stack': exactLogo('Tower Stack.png', 'tower-stack'),
  'type-defender': exactLogo('typedefender.png', 'type-defender', ['Type Defender']),
  'typing-legends': exactLogo('typing-legends.svg', 'typing-legends', ['Typing Legends Academy', 'Typing Legends']),
  uno: exactLogo('Uno.png', 'uno', ['/Logo/Game Logos/uno.svg', 'UNO']),
  werewolf: exactLogo('One Night Werewolf.png', 'werewolf', ['werewolf.svg', 'One Night Werewolf']),
  'whack-a-mole': exactLogo('Whack a mole.png', 'whack-a-mole', ['Whack a Mole']),
  'word-hunt': exactLogo('Word Hunt.png', 'word-hunt'),
  'word-imposter': exactLogo('Word Imposter.png', 'word-imposter'),
  'word-scramble': exactLogo('Word Scramble.png', 'word-scramble'),
  'word-search': exactLogo('word-search.svg', 'word-search', ['Word Search']),
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
