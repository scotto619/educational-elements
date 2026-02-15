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

const GAME_LOGO_MAP = {
  'daily-word-challenge': createLogoCandidates('daily-word-challenge', ['Daily Word Challenge']),
  'typing-legends': createLogoCandidates('typing-legends', ['Typing Legends Academy', 'Typing Legends']),
  'maze-runner': createLogoCandidates('maze-runner', ['Maze Runner', 'Maze']),
  'educational-bingo': createLogoCandidates('educational-bingo', ['Educational Bingo', 'Bingo']),
  'memory-challenge': createLogoCandidates('memory-challenge', ['Memory Challenge', 'Memory Masters', 'Memory']),
  'battle-royale': createLogoCandidates('battle-royale', ['Battle Royale Learning', 'Battle Royale']),
  'math-space-invaders': createLogoCandidates('math-space-invaders', ['Math Space Invaders', 'Space Maths']),
  'dodgeball-frenzy': createLogoCandidates('dodgeball-frenzy', ['Dodgeball Frenzy', 'Dodgeball']),
  'cell-battle': createLogoCandidates('cell-battle', ['Cell Battle Arena', 'Cell Battle']),
  battleships: createLogoCandidates('battleships', ['Battleships Tournament', 'Battleships']),
  'tic-tac-toe': createLogoCandidates('tic-tac-toe', ['Tic Tac Toe Tournament', 'TicTacToe', 'tictactoe']),
  'precision-timer': createLogoCandidates('precision-timer', ['Precision Timer Challenge', 'Timer Challenge', 'Precision Timer']),
  'match3-adventure': createLogoCandidates('match3-adventure', ['Match3 Battle', 'Match 3 Battle', 'Match3 Adventure']),
  'hero-forge': createLogoCandidates('hero-forge', ['Hero Forge', 'Clicker']),
  'classroom-bingo': createLogoCandidates('classroom-bingo', ['Classroom Bingo', 'Classroom BINGO']),
  'math-race': createLogoCandidates('math-race', ['Math Race Challenge', 'Math Race']),
  crossword: createLogoCandidates('crossword', ['Crossword']),
  'word-search': createLogoCandidates('word-search', ['Word Search']),
  boggle: createLogoCandidates('boggle', ['Boggle']),
  'coordinate-quest': createLogoCandidates('coordinate-quest', ['Coordinate Quest', 'Space Coordinates']),
  noggle: createLogoCandidates('noggle', ['Noggle'])
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
  clicker: 'hero-forge',
  'precision-timer-challenge': 'precision-timer',
  'timer-challenge': 'precision-timer'
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
