// components/student/StudentGames.js - UPDATED: Added Multiplication Grid and Precision Timer
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { getGameLogo, DEFAULT_LOGO as DEFAULT_GAME_LOGO } from '../../utils/gameLogos';
import { normalizeImageSource, serializeFallbacks, createImageErrorHandler } from '../../utils/imageFallback';

const GameLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-64">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      <p className="text-purple-600 font-semibold">Loading game...</p>
    </div>
  </div>
);

// Dynamically imported game components (loaded only when a game is selected)
const BoggleGame = dynamic(() => import('../games/BoggleGame'), { loading: GameLoadingSpinner, ssr: false });
const WordSearchGame = dynamic(() => import('../games/WordSearchGame'), { loading: GameLoadingSpinner, ssr: false });
const TicTacToeGame = dynamic(() => import('../games/TicTacToeGame'), { loading: GameLoadingSpinner, ssr: false });
const BattleshipsGame = dynamic(() => import('../games/BattleshipsGame'), { loading: GameLoadingSpinner, ssr: false });
const SweetEmpireGame = dynamic(() => import('../games/SweetEmpireGame'), { loading: GameLoadingSpinner, ssr: false });
const ChampionsMenagerieGame = dynamic(() => import('../games/ChampionsMenagerieGame'), { loading: GameLoadingSpinner, ssr: false });
const MathSpaceInvadersGame = dynamic(() => import('../games/MathSpaceInvadersGame'), { loading: GameLoadingSpinner, ssr: false });
const MultiplayerAgarGame = dynamic(() => import('../games/MultiplayerAgarGame'), { loading: GameLoadingSpinner, ssr: false });
const StudentBingo = dynamic(() => import('../student/StudentBingo'), { loading: GameLoadingSpinner, ssr: false });
const MazeGame = dynamic(() => import('../games/MazeGame'), { loading: GameLoadingSpinner, ssr: false });
const DailyWordleChallenge = dynamic(() => import('../games/DailyWordleChallenge'), { loading: GameLoadingSpinner, ssr: false });
const MultiplicationGridGame = dynamic(() => import('../games/MultiplicationGridGame'), { loading: GameLoadingSpinner, ssr: false });
const CoordinateQuestGame = dynamic(() => import('../games/CoordinateQuestGame'), { loading: GameLoadingSpinner, ssr: false });
const PrecisionTimerGame = dynamic(() => import('../games/PrecisionTimerGame'), { loading: GameLoadingSpinner, ssr: false });
const DodgeballGame = dynamic(() => import('../games/DodgeballGame'), { loading: GameLoadingSpinner, ssr: false });
const ZTypeGame = dynamic(() => import('../games/ZTypeGame'), { loading: GameLoadingSpinner, ssr: false });
const WhackAMoleGame = dynamic(() => import('../games/WhackAMoleGame'), { loading: GameLoadingSpinner, ssr: false });
const UNOGame = dynamic(() => import('../games/UNOGame'), { loading: GameLoadingSpinner, ssr: false });
const ChessGame = dynamic(() => import('../games/ChessGame'), { loading: GameLoadingSpinner, ssr: false });
const WerewolfGame = dynamic(() => import('../games/WerewolfGame'), { loading: GameLoadingSpinner, ssr: false });
const WordImposterGame = dynamic(() => import('../games/WordImposterGame'), { loading: GameLoadingSpinner, ssr: false });
const Game2048 = dynamic(() => import('../games/Game2048'), { loading: GameLoadingSpinner, ssr: false });
const WildwoodHomesteadGame = dynamic(() => import('../games/WildwoodHomesteadGame'), { loading: GameLoadingSpinner, ssr: false });
const NeonTetrisGame = dynamic(() => import('../games/NeonTetrisGame'), { loading: GameLoadingSpinner, ssr: false });
const CritterSortGame = dynamic(() => import('../games/CritterSortGame'), { loading: GameLoadingSpinner, ssr: false });
const FruitFrenzyGame = dynamic(() => import('../games/FruitFrenzyGame'), { loading: GameLoadingSpinner, ssr: false });
const BrainBlitzGame = dynamic(() => import('../games/BrainBlitzGame'), { loading: GameLoadingSpinner, ssr: false });
const NumberCrunchGame = dynamic(() => import('../games/NumberCrunchGame'), { loading: GameLoadingSpinner, ssr: false });
const PlaceValuePopGame = dynamic(() => import('../games/PlaceValuePopGame'), { loading: GameLoadingSpinner, ssr: false });
const BlockBlasterGame = dynamic(() => import('../games/BlockBlasterGame'), { loading: GameLoadingSpinner, ssr: false });
const FoodChainFrenzyGame = dynamic(() => import('../games/FoodChainFrenzyGame'), { loading: GameLoadingSpinner, ssr: false });
const NeonSerpentGame = dynamic(() => import('../games/NeonSerpentGame'), { loading: GameLoadingSpinner, ssr: false });
const SkyHopperGame = dynamic(() => import('../games/SkyHopperGame'), { loading: GameLoadingSpinner, ssr: false });
const GrammarGoalieGame = dynamic(() => import('../games/GrammarGoalieGame'), { loading: GameLoadingSpinner, ssr: false });
const SketchGuessGame = dynamic(() => import('../games/SketchGuessGame'), { loading: GameLoadingSpinner, ssr: false });
const BluffBattleGame = dynamic(() => import('../games/BluffBattleGame'), { loading: GameLoadingSpinner, ssr: false });
const TowerStackGame = dynamic(() => import('../games/TowerStackGame'), { loading: GameLoadingSpinner, ssr: false });
const AstroBlasterGame = dynamic(() => import('../games/AstroBlasterGame'), { loading: GameLoadingSpinner, ssr: false });
const SpellCasterGame = dynamic(() => import('../games/SpellCasterGame'), { loading: GameLoadingSpinner, ssr: false });
const MathGrandPrixGame = dynamic(() => import('../games/MathGrandPrixGame'), { loading: GameLoadingSpinner, ssr: false });
const StorySleuthGame = dynamic(() => import('../games/StorySleuthGame'), { loading: GameLoadingSpinner, ssr: false });

const logoErrorHandler = createImageErrorHandler(DEFAULT_GAME_LOGO);

const resolveLogoSource = (logo) => normalizeImageSource(logo, DEFAULT_GAME_LOGO);

const StudentGames = ({ studentData, showToast, updateStudentData, classData }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Get classmates for leaderboards
  const classmates = classData?.students || [];

  // Game sections the teacher has locked (set in the teacher Games tab)
  const lockedCategories = classData?.gameSettings?.lockedCategories || {};
  const isCategoryLocked = (categoryId) => !!lockedCategories[categoryId];

  const availableGames = [
    {
      id: 'daily-word-challenge',
      name: 'Daily Word Challenge',
      icon: '🗓️',
      description: 'Take on the daily Wordle-style puzzle! Solve it once a day and compare with friends tomorrow.',
      component: DailyWordleChallenge,
      color: 'from-purple-500 to-indigo-600',
      difficulty: 'All Levels',
      time: '5 minutes',
      category: 'daily',
      featured: true,
      daily: true,
      subject: 'english',
      storageKeySuffix: 'student',
      logo: getGameLogo('daily-word-challenge')
    },
    {
      id: 'type-defender',
      name: 'Type Defender',
      icon: '🚀',
      description: 'Destroy enemy ships by typing their words! A fast-paced space shooter where your keyboard is your weapon.',
      component: ZTypeGame,
      color: 'from-cyan-500 to-indigo-600',
      difficulty: 'Easy - Expert',
      time: '5-15 minutes',
      category: 'educational',
      featured: true,
      new: true,
      educational: true,
      subject: 'english',
      logo: getGameLogo('type-defender')
    },
    {
      id: 'spell-caster',
      name: 'Spell Caster',
      icon: '🧙‍♂️',
      description: 'Monsters are marching toward your wizard — stop them with SPELLING! Hear each word read aloud, type it correctly to cast lightning, and battle boss rounds. Uses your class spelling words when assigned!',
      component: SpellCasterGame,
      color: 'from-amber-500 to-purple-600',
      difficulty: 'All Levels',
      time: '5-15 minutes',
      featured: true,
      new: true,
      category: 'educational',
      educational: true,
      subject: 'english',
      logo: getGameLogo('spell-caster')
    },
    {
      id: 'math-grand-prix',
      name: 'Math Grand Prix',
      icon: '🏎️',
      description: 'Your kart runs on brain power! Answer mental-math questions to race past rival karts — or host a room and race up to 8 classmates live! 3 in a row fires a turbo boost. Uses your assigned Math Mentals level!',
      component: MathGrandPrixGame,
      color: 'from-emerald-500 to-teal-600',
      difficulty: 'All Levels',
      time: '3-10 minutes',
      featured: true,
      new: true,
      multiplayer: true,
      category: 'educational',
      educational: true,
      subject: 'math',
      logo: getGameLogo('math-grand-prix')
    },
    {
      id: 'story-sleuth',
      name: 'Story Sleuth',
      icon: '🕵️',
      description: 'Become a reading detective! Hunt the hidden spelling words in a real story, then rebuild the story when they vanish. Uses the fluency passages matched to your spelling list!',
      component: StorySleuthGame,
      color: 'from-indigo-500 to-amber-500',
      difficulty: 'All Levels',
      time: '5-10 minutes',
      featured: true,
      new: true,
      category: 'educational',
      educational: true,
      subject: 'english',
      logo: getGameLogo('story-sleuth')
    },
    {
      id: 'multiplication-grid',
      name: 'Math Facts Grid',
      icon: '🔢',
      description: 'Complete multiplication, addition, or subtraction grids as fast as you can! Compete with your classmates for the best times.',
      component: MultiplicationGridGame,
      color: 'from-blue-500 to-cyan-600',
      difficulty: 'Easy - Hard',
      time: '2-10 minutes',
      featured: true,
      new: true,
      category: 'featured',
      educational: true,
      subject: 'math',
      logo: getGameLogo('math-grid')
    },
    {
      id: 'coordinate-quest',
      name: 'Coordinate Quest',
      icon: '🌌',
      description: 'Explore the galaxy! Use your coordinate skills to find hidden targets in space.',
      component: CoordinateQuestGame,
      color: 'from-cyan-500 to-blue-600',
      difficulty: 'Easy - Hard',
      time: '2-10 minutes',
      featured: true,
      new: true,
      category: 'featured',
      educational: true,
      subject: 'math',
      logo: getGameLogo('coordinate-quest')
    },
    {
      id: 'math-space-invaders',
      name: 'Math Space Invaders',
      icon: '🚀',
      description: 'Fly through space solving math problems and unlock new ships!',
      component: MathSpaceInvadersGame,
      color: 'from-cyan-500 to-purple-600',
      difficulty: 'Easy - Expert',
      time: '5-30 minutes',
      featured: true,
      category: 'featured',
      subject: 'math',
      logo: getGameLogo('math-space-invaders')
    },
    {
      id: 'bingo',
      name: 'Educational BINGO',
      icon: '🎲',
      description: 'Play BINGO with your class! Choose the same category as your teacher and mark off squares to win.',
      component: StudentBingo,
      color: 'from-pink-500 to-purple-600',
      difficulty: 'Easy',
      time: '15-30 minutes',
      multiplayer: true,
      featured: true,
      category: 'featured',
      educational: true,
      subject: 'general',
      requiresTeacher: true,
      logo: getGameLogo('educational-bingo')
    },

    // Fun / Adventure Games
    {
      id: 'astro-blaster',
      name: 'Astro Blaster',
      icon: '🚀',
      description: 'Pilot a neon starfighter through an asteroid field! Blast rocks that split into faster chunks, chain combos, grab shield / triple-shot / rapid-fire power-ups, and take down the sneaky UFO.',
      component: AstroBlasterGame,
      color: 'from-indigo-500 to-fuchsia-600',
      difficulty: 'All Levels',
      time: '3-15 minutes',
      featured: true,
      new: true,
      category: 'fun',
      logo: getGameLogo('astro-blaster')
    },
    {
      id: 'fruit-frenzy',
      name: 'Fruit Frenzy',
      icon: '🍉',
      description: 'Swipe to slice flying fruit ninja-style! Chain combos, grab golden stars and slow-mo power-ups — but whatever you do, don\'t slice the bombs!',
      component: FruitFrenzyGame,
      color: 'from-pink-500 to-orange-500',
      difficulty: 'All Levels',
      time: '2-10 minutes',
      featured: true,
      new: true,
      category: 'fun',
      logo: getGameLogo('fruit-frenzy')
    },
    {
      id: 'precision-timer',
      name: 'Precision Timer Challenge',
      icon: '⏱️',
      description: 'Test your timing skills! Stop the timer as close to the target time as possible. Compete for the most accurate times.',
      component: PrecisionTimerGame,
      color: 'from-red-500 to-orange-600',
      difficulty: 'All Levels',
      time: '2-5 minutes',
      category: 'fun',
      logo: getGameLogo('precision-timer')
    },
    {
      id: 'dodgeball-frenzy',
      name: 'Dodgeball Frenzy',
      icon: '🥎',
      description: 'Pilot your avatar through an arena of bouncing balls, collect power-ups, and see how long you can survive!',
      component: DodgeballGame,
      color: 'from-orange-500 to-red-500',
      difficulty: 'All Levels',
      time: '2-8 minutes',
      category: 'fun',
      logo: getGameLogo('dodgeball-frenzy'),
      storageKeySuffix: 'student-dodgeball'
    },
    {
      id: 'whack-a-mole',
      name: 'Whack-a-Mole',
      icon: '🔨',
      description: 'Hit the moles before they hide! Build crazy combos, dodge sneaky bombs, and beat your high score in 60 seconds!',
      component: WhackAMoleGame,
      color: 'from-purple-500 to-violet-700',
      difficulty: 'All Levels',
      time: '1-5 minutes',
      featured: true,
      new: true,
      category: 'fun',
      logo: getGameLogo('whack-a-mole')
    },
    {
      id: '2048-puzzle',
      name: '2048 Puzzle',
      icon: '🎮',
      description: 'Merge tiles strategically to reach 2048! Train your logic and see how high you can score.',
      component: Game2048,
      color: 'from-yellow-500 to-purple-600',
      difficulty: 'Easy - Medium',
      time: '5-15 minutes',
      featured: true,
      new: true,
      category: 'fun',
      logo: getGameLogo('2048-puzzle')
    },
    {
      id: 'sky-hopper',
      name: 'Sky Hopper',
      icon: '🐸',
      description: 'Bounce your frog from platform to platform and climb into the stars! Spring pads launch you sky-high, crumbly platforms break away, and coins and stars boost your score.',
      component: SkyHopperGame,
      color: 'from-sky-500 to-indigo-600',
      difficulty: 'All Levels',
      time: '2-10 minutes',
      featured: true,
      new: true,
      category: 'fun',
      logo: getGameLogo('sky-hopper')
    },
    {
      id: 'tower-stack',
      name: 'Tower Stack',
      icon: '🏗️',
      description: 'Tap to drop each sliding block and stack your tower as high as you can! Nail a perfect line-up to keep your width and build a glowing combo. One miss and it all comes down.',
      component: TowerStackGame,
      color: 'from-cyan-500 to-purple-600',
      difficulty: 'All Levels',
      time: '1-5 minutes',
      featured: true,
      new: true,
      category: 'fun',
      logo: getGameLogo('tower-stack')
    },
    {
      id: 'neon-serpent',
      name: 'Neon Serpent',
      icon: '🐍',
      description: 'The classic snake game with a glowing neon twist! Chain quick eats for combos, grab ghost berries and slow-mo clocks, and try Portal mode where you wrap through the walls.',
      component: NeonSerpentGame,
      color: 'from-emerald-500 to-cyan-600',
      difficulty: 'All Levels',
      time: '2-10 minutes',
      featured: true,
      new: true,
      category: 'fun',
      logo: getGameLogo('neon-serpent')
    },
    {
      id: 'block-blaster',
      name: 'Block Blaster',
      icon: '🧱',
      description: 'Neon breakout action! Bounce the ball, smash brick patterns, and catch falling power-ups — multiball, lasers, wide paddle, and more. Endless levels, endless fun!',
      component: BlockBlasterGame,
      color: 'from-cyan-500 to-blue-600',
      difficulty: 'All Levels',
      time: '5-15 minutes',
      featured: true,
      new: true,
      category: 'fun',
      logo: getGameLogo('block-blaster')
    },
    {
      id: 'neon-tetris',
      name: 'Neon Tetris',
      icon: '🧩',
      description: 'Classic Tetris with a premium neon arcade feel! Clear lines, level up, and chase your high score in this stunning puzzle game.',
      component: NeonTetrisGame,
      color: 'from-cyan-500 to-purple-600',
      difficulty: 'Easy - Expert',
      time: '5-20 minutes',
      featured: true,
      new: true,
      category: 'fun',
      logo: getGameLogo('neon-tetris')
    },
    {
      id: 'maze',
      name: 'Maze Runner',
      icon: '🧩',
      description: 'Race through randomly generated mazes! Get a seed from your teacher to compete with friends on the same maze.',
      component: MazeGame,
      color: 'from-indigo-500 to-purple-600',
      difficulty: 'Easy - Hard',
      time: '2-10 minutes',
      category: 'fun',
      logo: getGameLogo('maze-runner')
    },
    {
      id: 'sweet-empire',
      name: "Champion's Forge",
      icon: '⚔️',
      description: 'Strike an evolving legendary weapon, recruit an army of champions, slay raiding dragons, and unlock ultra-rare profile themes, titles and effects that show on your class card!',
      component: SweetEmpireGame,
      color: 'from-slate-700 to-indigo-800',
      difficulty: 'Easy',
      time: '10+ minutes',
      new: true,
      category: 'fun',
      logo: getGameLogo('sweet-empire')
    },
    {
      id: 'champions-menagerie',
      name: "Champion's Menagerie",
      icon: '🐣',
      description: 'Hatch eggs powered by YOUR classroom XP, raise magical creatures through five life stages, hunt ultra-rare shinies, complete the Zoodex, and show off your companion on your class card!',
      component: ChampionsMenagerieGame,
      color: 'from-emerald-600 to-teal-700',
      difficulty: 'Easy',
      time: '5+ minutes',
      new: true,
      category: 'fun',
      logo: getGameLogo('champions-menagerie')
    },
    {
      id: 'battleships',
      name: 'Battleships',
      icon: '🚢',
      description: 'Sink your opponent\'s fleet in this classic naval battle!',
      component: BattleshipsGame,
      color: 'from-blue-600 to-cyan-600',
      difficulty: 'Medium',
      time: '10-20 minutes',
      multiplayer: true,
      category: 'multiplayer',
      logo: getGameLogo('battleships')
    },
    {
      id: 'chess',
      name: 'Chess',
      icon: '♟',
      description: 'Classic 2-player chess with full rules — castling, en passant, promotion, check & checkmate. Host plays White, guest plays Black.',
      component: ChessGame,
      color: 'from-amber-600 to-amber-900',
      difficulty: 'Medium - Hard',
      time: '10-60 minutes',
      multiplayer: true,
      new: true,
      category: 'multiplayer',
      logo: getGameLogo('chess')
    },
    {
      id: 'uno',
      name: 'UNO',
      icon: '🃏',
      description: 'The classic card game! Match colours and numbers, play action cards, and be the first to empty your hand. Up to 4 players.',
      component: UNOGame,
      color: 'from-red-500 to-yellow-500',
      difficulty: 'Easy',
      time: '10-20 minutes',
      multiplayer: true,
      new: true,
      category: 'multiplayer',
      logo: getGameLogo('uno')
    },
    {
      id: 'sketch-guess',
      name: 'Sketch & Guess',
      icon: '🎨',
      description: 'The classic drawing & guessing party game! Take turns sketching a secret word while everyone races to guess it in the chat. Letter hints appear as time runs out — fastest guess wins the most points!',
      component: SketchGuessGame,
      color: 'from-fuchsia-500 to-purple-600',
      difficulty: 'Easy',
      time: '10-20 minutes',
      multiplayer: true,
      featured: true,
      new: true,
      category: 'multiplayer',
      logo: getGameLogo('sketch-guess')
    },
    {
      id: 'bluff-battle',
      name: 'Bluff Battle',
      icon: '🎭',
      description: "Invent a believable lie to fill in the blank of a wild true fact, then vote to spot the real truth hidden among everyone's bluffs. Fool your friends to rack up points!",
      component: BluffBattleGame,
      color: 'from-indigo-500 to-pink-600',
      difficulty: 'Easy',
      time: '10-20 minutes',
      multiplayer: true,
      featured: true,
      new: true,
      category: 'multiplayer',
      logo: getGameLogo('bluff-battle')
    },
    {
      id: 'werewolf',
      name: 'One Night Werewolf',
      icon: '🐺',
      description: 'A social deduction game! Get secret roles, take night actions, then vote to eliminate the werewolf before they escape.',
      component: WerewolfGame,
      color: 'from-purple-900 to-red-900',
      difficulty: 'Medium',
      time: '10-20 minutes',
      multiplayer: true,
      new: true,
      category: 'multiplayer',
      logo: getGameLogo('werewolf')
    },
    {
      id: 'word-imposter',
      name: 'Word Imposter',
      icon: '🕵️',
      description: 'Everyone gets the same secret word — except one imposter whose card just says IMPOSTER. Give one-word clues, spot the bluffer, and vote them out before they escape.',
      component: WordImposterGame,
      color: 'from-purple-700 to-pink-700',
      difficulty: 'Easy - Medium',
      time: '5-15 minutes',
      multiplayer: true,
      new: true,
      category: 'multiplayer',
      logo: getGameLogo('word-imposter')
    },
    {
      id: 'tic-tac-toe',
      name: 'Tic Tac Toe',
      icon: '🎯',
      description: 'Challenge a friend to this classic strategy game!',
      component: TicTacToeGame,
      color: 'from-purple-500 to-pink-600',
      difficulty: 'Easy',
      time: '2-5 minutes',
      multiplayer: true,
      category: 'multiplayer',
      logo: getGameLogo('tic-tac-toe')
    },
    {
      id: 'cell-arena',
      name: 'Cell Battle Arena',
      icon: '🦠',
      description: 'Battle your classmates online! Eat food to grow and absorb smaller cells to win.',
      component: MultiplayerAgarGame,
      color: 'from-emerald-500 to-teal-600',
      difficulty: 'Medium',
      time: '5-15 minutes',
      multiplayer: true,
      requiresClassCode: true,
      category: 'multiplayer',
      inDevelopment: true,
      logo: getGameLogo('cell-arena')
    },

    // Educational Utils
    {
      id: 'grammar-goalie',
      name: 'Grammar Goalie',
      icon: '🧤',
      description: 'Defend your goal with grammar! Every shot is a sentence with a missing word — pick the right one to make the save. Homophones, contractions, tenses, plurals and more, with a tip after every shot.',
      component: GrammarGoalieGame,
      color: 'from-emerald-500 to-sky-600',
      difficulty: 'All Levels',
      time: '3-8 minutes',
      featured: true,
      new: true,
      category: 'educational',
      educational: true,
      subject: 'english',
      logo: getGameLogo('grammar-goalie')
    },
    {
      id: 'brain-blitz',
      name: 'Brain Blitz',
      icon: '🧠',
      description: 'A fast-paced trivia quiz show! Race the clock across Science, Geography, Math, Words and more. Build a streak multiplier and use your 50/50, Freeze, and Skip lifelines to top the leaderboard.',
      component: BrainBlitzGame,
      color: 'from-purple-500 to-fuchsia-600',
      difficulty: 'All Levels',
      time: '3-10 minutes',
      featured: true,
      new: true,
      category: 'educational',
      educational: true,
      subject: 'general',
      logo: getGameLogo('brain-blitz')
    },
    {
      id: 'number-crunch',
      name: 'Number Crunch',
      icon: '🎯',
      description: 'Combine number tiles with + − × ÷ to hit the target! Every puzzle has an exact solution — find it before the clock runs out and build bullseye streaks for bonus points.',
      component: NumberCrunchGame,
      color: 'from-cyan-500 to-blue-600',
      difficulty: 'Easy - Hard',
      time: '5-10 minutes',
      featured: true,
      new: true,
      category: 'educational',
      educational: true,
      subject: 'math',
      logo: getGameLogo('number-crunch')
    },
    {
      id: 'place-value-pop',
      name: 'Place Value Pop',
      icon: '🫧',
      description: 'Read the number, then pop the bubble with the right answer — the value of a digit, its place, or the expanded form. Beat the timer and build combos across three levels!',
      component: PlaceValuePopGame,
      color: 'from-cyan-500 to-purple-600',
      difficulty: 'Easy - Hard',
      time: '2-10 minutes',
      featured: true,
      new: true,
      category: 'educational',
      educational: true,
      subject: 'math',
      logo: getGameLogo('place-value-pop')
    },
    {
      id: 'boggle',
      name: 'Word Scramble',
      icon: '🔤',
      description: 'Find as many words as you can in this fast-paced word game!',
      component: BoggleGame,
      color: 'from-blue-500 to-purple-600',
      difficulty: 'Medium',
      time: '3-10 minutes',
      category: 'educational',
      educational: true,
      subject: 'english',
      logo: getGameLogo('word-scramble')
    },
    {
      id: 'word-search',
      name: 'Word Hunt',
      icon: '🔍',
      description: 'Find hidden words in the puzzle grid! Multiple themes and difficulties.',
      component: WordSearchGame,
      color: 'from-green-500 to-teal-600',
      difficulty: 'Easy - Hard',
      time: '5-15 minutes',
      category: 'educational',
      educational: true,
      subject: 'english',
      logo: getGameLogo('word-hunt')
    },
    {
      id: 'wildwood-homestead',
      name: 'Wildwood Homestead',
      icon: '🏕️',
      description: 'Survive the magical wilds! Chop, mine, fish and forage, send hunting and scavenging expeditions, cook 40+ recipes over wood fires, collect 50 critters and rare curios — and craft bigger packs, chests and gear to master your inventory. Your Forge weapon and Menagerie companion help out!',
      component: WildwoodHomesteadGame,
      color: 'from-green-700 to-emerald-800',
      difficulty: 'Easy - Medium',
      time: '10+ minutes',
      featured: true,
      new: true,
      category: 'fun',
      logo: getGameLogo('wildwood-homestead')
    },
    {
      id: 'food-chain-frenzy',
      name: 'Food Chain Frenzy',
      icon: '🌿',
      description: 'Build the food chain! Put organisms in order so energy flows from producer to top predator across real ecosystems — and spot the sneaky decoy that doesn\'t belong. Learn a fun fact every round!',
      component: FoodChainFrenzyGame,
      color: 'from-lime-500 to-emerald-600',
      difficulty: 'Easy - Medium',
      time: '3-8 minutes',
      featured: true,
      new: true,
      category: 'educational',
      educational: true,
      subject: 'science',
      logo: getGameLogo('food-chain-frenzy')
    },
    {
      id: 'critter-sort',
      name: 'Critter Sort',
      icon: '🦁',
      description: 'Sort creatures into animal classes — mammal, bird, reptile, amphibian, fish, or insect — before time runs out!',
      component: CritterSortGame,
      color: 'from-emerald-500 to-teal-600',
      difficulty: 'Easy - Hard',
      time: '3-8 minutes',
      featured: true,
      new: true,
      category: 'educational',
      educational: true,
      subject: 'science',
      logo: getGameLogo('critter-sort')
    }
  ];

  const categorizeGame = (game) => {
    // Determine category based on game object properties
    if (game.category === 'multiplayer') return 'multiplayer';
    if (game.category === 'fun') return 'fun';
    if (game.educational || game.category === 'educational' || game.category === 'featured' || game.category === 'daily') {
      return 'educational';
    }

    return 'fun';
  };

  const categorizedGames = availableGames.map((game) => ({
    ...game,
    displayCategory: categorizeGame(game)
  }));

  const categories = [
    {
      id: 'educational',
      name: 'Educational',
      icon: '📚',
      description: 'Skill-builders, brain training, and practice quests'
    },
    {
      id: 'fun',
      name: 'Fun',
      icon: '🎉',
      description: 'Quick challenges, adventures, and solo arcade fun'
    },
    {
      id: 'multiplayer',
      name: 'Multiplayer',
      icon: '👥',
      description: 'Play live with classmates and co-op partners'
    }
  ];

  // Subject areas within the Educational category
  const subjects = [
    {
      id: 'english',
      name: 'English',
      icon: '📖',
      description: 'Vocabulary, spelling, typing, and word skills'
    },
    {
      id: 'math',
      name: 'Math',
      icon: '🔢',
      description: 'Number facts, coordinates, and problem solving'
    },
    {
      id: 'science',
      name: 'Science',
      icon: '🔬',
      description: 'Explore living things and the world around us'
    },
    {
      id: 'general',
      name: 'General & Logic',
      icon: '🧠',
      description: 'Brain games and topics that span every subject'
    }
  ];

  const getGamesInCategory = (categoryId, subjectId = null) => {
    let games = categorizedGames.filter(game => game.displayCategory === categoryId);
    if (categoryId === 'educational' && subjectId) {
      games = games.filter(game => game.subject === subjectId);
    }
    return games;
  };

  const getGamesInSubject = (subjectId) => getGamesInCategory('educational', subjectId);

  const handleSelectCategory = (categoryId) => {
    if (isCategoryLocked(categoryId)) {
      showToast('🔒 Your teacher has locked this game section for now.', 'info');
      return;
    }
    setSelectedSubject(null);
    setSelectedCategory(categoryId);
  };

  const handleBack = () => {
    if (selectedCategory === 'educational' && selectedSubject) {
      setSelectedSubject(null);
    } else {
      setSelectedCategory(null);
      setSelectedSubject(null);
    }
  };

  // Teacher locked this section while a game/category was open — block access
  if ((selectedGame && isCategoryLocked(categorizeGame(selectedGame))) ||
      (!selectedGame && selectedCategory && isCategoryLocked(selectedCategory))) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-10 text-center max-w-xl mx-auto mt-6">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">This game section is locked</h2>
        <p className="text-gray-600 mb-6">Your teacher has locked this section for now. Check back later!</p>
        <button
          onClick={() => { setSelectedGame(null); setSelectedCategory(null); setSelectedSubject(null); }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          ← Back to Game Center
        </button>
      </div>
    );
  }

  if (selectedGame) {
    const GameComponent = selectedGame.component;
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 md:p-6">
        {/* Game Header */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedGame(null)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl hover:shadow-lg transition-all"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-3xl">{selectedGame.icon}</span>
                  {selectedGame.name}
                </h1>
                <p className="text-gray-600 text-sm md:text-base">{selectedGame.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Game Content */}
        <div className="max-w-7xl mx-auto">
          <GameComponent
            studentData={studentData}
            updateStudentData={updateStudentData}
            showToast={showToast}
            classData={classData}
            classmates={classmates}
            storageKeySuffix={selectedGame.storageKeySuffix}
          />
        </div>
      </div>
    );
  }

  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold">🎮 Game Center</h2>
            <p className="text-white/90 text-sm md:text-base">Pick a category to jump into learning quests or quick brain breaks.</p>
            {classData?.classCode && (
              <div className="inline-flex items-center px-3 py-1 bg-white/15 border border-white/25 text-white rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-emerald-300 rounded-full mr-2"></span>
                Multiplayer ready: {classData.classCode}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category) => {
            const locked = isCategoryLocked(category.id);
            return (
              <button
                key={category.id}
                onClick={() => handleSelectCategory(category.id)}
                className={`group rounded-2xl shadow-lg border p-6 text-left transition-all duration-300 relative overflow-hidden ${
                  locked
                    ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                    : 'bg-white border-gray-100 hover:shadow-xl'
                }`}
              >
                {!locked && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 transition-opacity"></div>
                )}
                {locked && (
                  <div className="absolute top-3 right-3 bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow z-20">
                    🔒 Locked
                  </div>
                )}
                <div className={`relative z-10 space-y-3 ${locked ? 'opacity-50 grayscale' : ''}`}>
                  <div className="text-4xl">{category.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900">{category.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{category.description}</p>
                  <div className={`flex items-center gap-2 text-sm font-semibold ${locked ? 'text-gray-500' : 'text-purple-600'}`}>
                    <span>
                      {locked
                        ? 'Locked by your teacher'
                        : category.id === 'educational'
                          ? `${subjects.length} subjects · ${getGamesInCategory(category.id).length} games`
                          : `${getGamesInCategory(category.id).length} games`}
                    </span>
                    {!locked && <span>→</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Educational category: show subject areas before listing games
  if (selectedCategory === 'educational' && !selectedSubject) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-center md:text-left space-y-1">
              <h2 className="text-2xl md:text-3xl font-bold">📚 Educational Games</h2>
              <p className="text-white/90 text-sm md:text-base">Pick a subject to find skill-building games and challenges.</p>
            </div>
            <button
              onClick={handleBack}
              className="bg-white/15 border border-white/30 text-white px-4 py-2 rounded-xl hover:bg-white/25 transition-all self-center md:self-auto"
            >
              ← All Categories
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subjects.map((subject) => {
            const subjectGames = getGamesInSubject(subject.id);
            return (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                disabled={subjectGames.length === 0}
                className={`group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-left transition-all duration-300 relative overflow-hidden ${subjectGames.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}`}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 transition-opacity"></div>
                <div className="relative z-10 space-y-3">
                  <div className="text-4xl">{subject.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900">{subject.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{subject.description}</p>
                  <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
                    <span>{subjectGames.length} {subjectGames.length === 1 ? 'game' : 'games'}</span>
                    <span>→</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 md:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-1">
              {selectedCategory === 'educational'
                ? `${subjects.find((sub) => sub.id === selectedSubject)?.icon || '📚'} ${subjects.find((sub) => sub.id === selectedSubject)?.name || 'Educational'} Games`
                : `🎮 ${categories.find((cat) => cat.id === selectedCategory)?.name} Games`}
            </h2>
            <p className="text-white/90 text-sm md:text-base">Choose a game to play now. Multiplayer titles use your class code.</p>
          </div>
          <button
            onClick={handleBack}
            className="bg-white/15 border border-white/30 text-white px-4 py-2 rounded-xl hover:bg-white/25 transition-all"
          >
            {selectedCategory === 'educational' ? '← Subjects' : '← All Categories'}
          </button>
        </div>
      </div>

      {selectedCategory === 'multiplayer' && !classData?.classCode && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-orange-800 mb-2">Multiplayer Games Unavailable</h3>
          <p className="text-orange-700 text-sm">
            Ask your teacher to set up a class code to unlock multiplayer games!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {getGamesInCategory(selectedCategory, selectedSubject)
          .filter(game => selectedCategory !== 'multiplayer' || classData?.classCode || !game.requiresClassCode)
          .map((game) => {
            const buttonLabel = game.requiresTeacher
              ? '🎓 Join Class Game'
              : game.multiplayer && game.requiresClassCode
                ? '🧬 Enter Code to Play'
                : game.multiplayer
                  ? '🎮 Play with Friends'
                  : '🚀 Start Game';

            const categoryLabel = game.displayCategory === 'educational'
              ? 'Educational'
              : game.displayCategory === 'multiplayer'
                ? 'Multiplayer'
                : 'Fun';

            return (
              <div
                key={game.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedGame(game)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedGame(game);
                  }
                }}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative md:w-56 h-44 md:h-auto overflow-hidden bg-white flex items-center justify-center">
                    {(() => {
                      const logoSource = resolveLogoSource(game.logo);
                      return (
                        <img
                          src={logoSource.src}
                          alt={`${game.name} logo`}
                          className="max-w-full max-h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                          data-fallbacks={serializeFallbacks(logoSource.fallbacks)}
                          data-fallback-index="0"
                          onError={logoErrorHandler}
                        />
                      );
                    })()}
                    <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold flex items-center gap-2 text-gray-800">
                      <span className="text-lg">{game.icon}</span>
                      <span>{categoryLabel}</span>
                    </div>
                    {game.inDevelopment ? (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-slate-500 to-slate-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                        🔧 In Development
                      </div>
                    ) : game.new ? (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow animate-bounce">
                        NEW
                      </div>
                    ) : game.featured ? (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                        ⭐ Featured
                      </div>
                    ) : null}
                  </div>
                  <div className="flex-1 p-4 md:p-6 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 flex-1 min-w-0">
                        <span className="truncate block group-hover:text-purple-600 transition-colors">{game.name}</span>
                      </h3>
                      {game.daily && (
                        <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full">Daily</span>
                      )}
                      {game.requiresTeacher && (
                        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">Teacher</span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                      {game.description}
                    </p>

                    <div className="flex flex-wrap gap-2 text-xs md:text-sm text-gray-600">
                      {game.multiplayer && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Multiplayer</span>}
                      {game.educational && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">Educational</span>}
                    </div>

                    <div className="flex justify-between text-xs md:text-sm text-gray-500">
                      <span>⚡ Difficulty: <strong className="text-gray-700">{game.difficulty}</strong></span>
                      <span>⏱️ Time: <strong className="text-gray-700">{game.time}</strong></span>
                    </div>

                    <div className="pt-2 md:pt-4">
                      <div className={`inline-flex items-center px-4 py-2 md:px-5 md:py-3 rounded-full bg-gradient-to-r ${game.color} text-white font-semibold text-sm md:text-base shadow-sm group-hover:shadow-lg transition-all`}>
                        {buttonLabel}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 md:p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
          <span className="mr-2">💡</span>
          Gaming Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-pink-700 mb-1">🍉 Fruit Frenzy</div>
            <div className="text-gray-600">Slice 3 or more fruit in a single swipe to score combo bonuses! Score 200+ to earn coins once a day.</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-blue-700 mb-1">🔢 Math Facts Grid</div>
            <div className="text-gray-600">Race against the clock to complete multiplication, addition, or subtraction grids! Compete with classmates for the fastest times.</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-red-700 mb-1">⏱️ Precision Timer</div>
            <div className="text-gray-600">Test your timing! Stop the timer as close to the target as possible. Who has the steadiest hand?</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-indigo-700 mb-1">🧩 Maze Runner</div>
            <div className="text-gray-600">Enter a seed from your teacher to race them on the same maze! Or generate your own and challenge friends.</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-pink-700 mb-1">🎲 Educational BINGO</div>
            <div className="text-gray-600">Select the same category as your teacher to get your BINGO card! Listen carefully and mark your squares to win.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentGames;

