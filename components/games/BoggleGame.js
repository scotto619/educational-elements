import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Simple dictionary check - in a real app this would likely be an API or larger file
// We'll use a set of common 3-8 letter words for validation if available, 
// otherwise we'll accept any word > 2 letters that "looks" like English (vowel check)
// combined with a small embedded list of common words.

const COMMON_WORDS = [
  "THE", "AND", "YOU", "THAT", "WAS", "FOR", "ARE", "WITH", "HIS", "THEY",
  "THIS", "HAVE", "FROM", "ONE", "HAD", "WORD", "BUT", "NOT", "WHAT", "ALL",
  "WERE", "WHEN", "YOUR", "CAN", "SAID", "THERE", "USE", "EACH", "WHICH", "SHE",
  "DO", "HOW", "THEIR", "IF", "WILL", "UP", "OTHER", "ABOUT", "OUT", "MANY",
  "THEN", "THEM", "THESE", "SO", "SOME", "HER", "WOULD", "MAKE", "LIKE", "HIM",
  "INTO", "TIME", "HAS", "LOOK", "TWO", "MORE", "WRITE", "GO", "SEE", "NUMBER",
  "NO", "WAY", "COULD", "PEOPLE", "MY", "THAN", "FIRST", "WATER", "BEEN", "CALL",
  "WHO", "OIL", "ITS", "NOW", "FIND", "LONG", "DOWN", "DAY", "DID", "GET",
  "COME", "MADE", "MAY", "PART", "OVER", "NEW", "SOUND", "TAKE", "ONLY", "LITTLE",
  "WORK", "KNOW", "PLACE", "YEAR", "LIVE", "ME", "BACK", "GIVE", "MOST", "VERY",
  "AFTER", "THINGS", "OUR", "JUST", "NAME", "GOOD", "SENTENCE", "MAN", "THINK", "SAY",
  "GREAT", "WHERE", "HELP", "THROUGH", "MUCH", "BEFORE", "LINE", "RIGHT", "TOO", "MEAN",
  "OLD", "ANY", "SAME", "TELL", "BOY", "FOLLOW", "CAME", "WANT", "SHOW", "ALSO",
  "AROUND", "FARM", "THREE", "SMALL", "SET", "PUT", "END", "DOES", "ANOTHER", "WELL",
  "LARGE", "MUST", "BIG", "EVEN", "SUCH", "BECAUSE", "TURN", "HERE", "WHY", "ASK",
  "WENT", "MEN", "READ", "NEED", "LAND", "DIFFERENT", "HOME", "US", "MOVE", "TRY",
  "KIND", "HAND", "PICTURE", "AGAIN", "CHANGE", "OFF", "PLAY", "SPELL", "AIR", "AWAY",
  "ANIMAL", "HOUSE", "POINT", "PAGE", "LETTER", "MOTHER", "ANSWER", "FOUND", "STUDY", "STILL",
  "LEARN", "SHOULD", "AMERICA", "WORLD", "HIGH", "EVERY", "NEAR", "ADD", "FOOD", "BETWEEN",
  "OWN", "BELOW", "COUNTRY", "PLANT", "LAST", "SCHOOL", "FATHER", "KEEP", "TREE", "NEVER",
  "START", "CITY", "EARTH", "EYES", "LIGHT", "THOUGHT", "HEAD", "UNDER", "STORY", "SAW",
  "LEFT", "DON'T", "FEW", "WHILE", "ALONG", "MIGHT", "CLOSE", "SOMETHING", "SEEM", "NEXT",
  "HARD", "OPEN", "EXAMPLE", "BEGIN", "LIFE", "ALWAYS", "THOSE", "BOTH", "PAPER", "TOGETHER",
  "GOT", "GROUP", "OFTEN", "RUN", "IMPORTANT", "UNTIL", "CHILDREN", "SIDE", "FEET", "CAR",
  "MILE", "NIGHT", "WALK", "WHITE", "SEA", "BEGAN", "GROW", "TOOK", "RIVER", "FOUR",
  "CARRY", "STATE", "ONCE", "BOOK", "HEAR", "STOP", "WITHOUT", "SECOND", "LATE", "MISS",
  "IDEA", "ENOUGH", "EAT", "FACE", "WATCH", "FAR", "INDIAN", "REAL", "ALMOST", "LET",
  "ABOVE", "GIRL", "SOMETIMES", "MOUNTAINS", "CUT", "YOUNG", "TALK", "SOON", "LIST", "SONG",
  "BEING", "LEAVE", "FAMILY", "IT'S", "BODY", "MUSIC", "COLOR", "STAND", "SUN", "QUESTIONS",
  "FISH", "AREA", "MARK", "DOG", "HORSE", "BIRDS", "PROBLEM", "COMPLETE", "ROOM", "KNEW",
  "SINCE", "EVER", "PIECE", "TOLD", "USUALLY", "DIDN'T", "FRIENDS", "EASY", "HEARD", "ORDER",
  "RED", "DOOR", "SURE", "BECOME", "TOP", "SHIP", "ACROSS", "TODAY", "DURING", "SHORT",
  "BETTER", "BEST", "HOWEVER", "LOW", "HOURS", "BLACK", "PRODUCTS", "HAPPENED", "WHOLE", "MEASURE",
  "REMEMBER", "EARLY", "WAVES", "REACH", "LISTEN", "WIND", "ROCK", "SPACE", "COVERED", "FAST",
  "SEVERAL", "HOLD", "HIMSELF", "TOWARD", "FIVE", "STEP", "MORNING", "PASSED", "VOWEL", "TRUE",
  "HUNDRED", "AGAINST", "PATTERN", "NUMERAL", "TABLE", "NORTH", "SLOWLY", "MONEY", "MAP", "BUSY",
  "PULLED", "DRAW", "VOICE", "SEEN", "COLD", "CRIED", "PLAN", "NOTICE", "SOUTH", "SING",
  "WAR", "GROUND", "FALL", "KING", "TOWN", "I'LL", "UNIT", "FIGURE", "CERTAIN", "FIELD",
  "TRAVEL", "WOOD", "FIRE", "UPON", "DONE", "ENGLISH", "ROAD", "HALF", "TEN", "FLY",
  "GAVE", "BOX", "FINALLY", "WAIT", "CORRECT", "OH", "QUICKLY", "PERSON", "BECAME", "SHOWN",
  "MINUTES", "STRONG", "VERB", "STARS", "FRONT", "FEEL", "FACT", "INCH", "STREET", "DECIDED",
  "CONTAIN", "COURSE", "SURFACE", "PRODUCE", "BUILDING", "OCEAN", "CLASS", "NOTE", "NOTHING", "REST",
  "CAREFULLY", "SCIENTISTS", "INSIDE", "WHEELS", "STAY", "GREEN", "KNOWN", "ISLAND", "WEEK", "LESS",
  "MACHINE", "BASE", "AGO", "STOOD", "PLANE", "SYSTEM", "BEHIND", "RAN", "ROUND", "BOAT",
  "GAME", "FORCE", "BROUGHT", "UNDERSTAND", "WARM", "COMMON", "BRING", "EXPLAIN", "DRY", "THOUGH",
  "LANGUAGE", "SHAPE", "DEEP", "THOUSANDS", "YES", "CLEAR", "EQUATION", "YET", "GOVERNMENT", "FILLED",
  "HEAT", "FULL", "HOT", "CHECK", "OBJECT", "AMONG", "NOUN", "POWER", "CANNOT", "ABLE",
  "SIX", "SIZE", "DARK", "BALL", "MATERIAL", "SPECIAL", "HEAVY", "FINE", "PAIR", "CIRCLE",
  "INCLUDE", "BUILT", "CAN'T", "MATTER", "SQUARE", "SYLLABLES", "PERHAPS", "BILL", "FELT", "SUDDENLY",
  "TEST", "DIRECTION", "CENTER", "FARMERS", "READY", "ANYTHING", "DIVIDED", "GENERAL", "ENERGY", "SUBJECT",
  "EUROPE", "MOON", "REGION", "RETURN", "BELIEVE", "DANCE", "MEMBERS", "PICKED", "SIMPLE", "CELLS",
  "PAINT", "MIND", "LOVE", "CAUSE", "RAIN", "EXERCISE", "EGGS", "TRAIN", "BLUE", "WISH",
  "DROP", "DEVELOPED", "WINDOW", "DIFFERENCE", "DISTANCE", "HEART", "SITE", "SUM", "SUMMER", "WALL",
  "FOREST", "PROBABLY", "LEGS", "SAT", "MAIN", "WINTER", "WIDE", "WRITTEN", "LENGTH", "REASON",
  "KEPT", "INTEREST", "ARMS", "BROTHER", "RACE", "PRESENT", "BEAUTIFUL", "STORE", "JOB", "EDGE",
  "PAST", "SIGN", "RECORD", "FINISHED", "DISCOVERED", "WILD", "HAPPY", "BESIDE", "GONE", "SKY",
  "GRASS", "MILLION", "WEST", "LAY", "WEATHER", "ROOT", "INSTRUMENTS", "MEET", "THIRD", "MONTHS",
  "PARAGRAPH", "RAISED", "REPRESENT", "SOFT", "WHETHER", "CLOTHES", "FLOWERS", "SHALL", "TEACHER", "HELD",
  "DESCRIBE", "DRIVE", "RODE", "MIND", "SECTION", "LAKE", "SCALE", "LOUD", "SPRING", "OBSERVE",
  "CHILD", "STRAIGHT", "CONSONANT", "NATION", "DICTIONARY", "MILK", "SPEED", "METHOD", "ORGAN", "PAY",
  "AGE", "SECTION", "DRESS", "CLOUD", "SURPRISE", "QUIET", "STONE", "TINY", "CLIMB", "COOL",
  "DESIGN", "POOR", "LOT", "EXPERIMENT", "BOTTOM", "KEY", "IRON", "SINGLE", "STICK", "FLAT",
  "TWENTY", "SKIN", "SMILE", "CREASE", "HOLE", "TRADE", "MELODY", "TRIP", "OFFICE", "RECEIVE",
  "ROW", "MOUTH", "EXACT", "SYMBOL", "DIE", "LEAST", "TROUBLE", "SHOUT", "EXCEPT", "WROTE",
  "SEED", "TONE", "JOIN", "SUGGEST", "CLEAN", "BREAK", "LADY", "YARD", "RISE", "BAD",
  "BLOW", "OIL", "BLOOD", "TOUCH", "GREW", "CENT", "MIX", "TEAM", "WIRE", "COST",
  "LOST", "BROWN", "WEAR", "GARDEN", "EQUAL", "SENT", "CHOOSE", "FELL", "FIT", "FLOW",
  "FAIR", "BANK", "COLLECT", "SAVE", "CONTROL", "DECIMAL", "EAR", "ELSE", "QUITE", "BROKE",
  "CASE", "MIDDLE", "KILL", "SON", "LAKE", "MOMENT", "SCALE", "LOUD", "SPRING", "OBSERVE",
  "CHILD", "STRAIGHT", "CONSONANT", "NATION", "DICTIONARY", "MILK", "SPEED", "METHOD", "ORGAN", "PAY",
  "AGE", "SECTION", "DRESS", "CLOUD", "SURPRISE", "QUIET", "STONE", "TINY", "CLIMB", "COOL",
  "DESIGN", "POOR", "LOT", "EXPERIMENT", "BOTTOM", "KEY", "IRON", "SINGLE", "STICK", "FLAT",
  "TWENTY", "SKIN", "SMILE", "CREASE", "HOLE", "TRADE", "MELODY", "TRIP", "OFFICE", "RECEIVE",
  "ROW", "MOUTH", "EXACT", "SYMBOL", "DIE", "LEAST", "TROUBLE", "SHOUT", "EXCEPT", "WROTE",
  "SEED", "TONE", "JOIN", "SUGGEST", "CLEAN", "BREAK", "LADY", "YARD", "RISE", "BAD",
  "BLOW", "OIL", "BLOOD", "TOUCH", "GREW", "CENT", "MIX", "TEAM", "WIRE", "COST",
  "LOST", "BROWN", "WEAR", "GARDEN", "EQUAL", "SENT", "CHOOSE", "FELL", "FIT", "FLOW",
  "FAIR", "BANK", "COLLECT", "SAVE", "CONTROL", "DECIMAL", "EAR", "ELSE", "QUITE", "BROKE",
  "CASE", "MIDDLE", "KILL", "SON", "LAKE", "MOMENT", "SCALE", "LOUD", "SPRING", "OBSERVE",
  "CHILD", "STRAIGHT", "CONSONANT", "NATION", "DICTIONARY", "MILK", "SPEED", "METHOD", "ORGAN", "PAY",
  "AGE", "SECTION", "DRESS", "CLOUD", "SURPRISE", "QUIET", "STONE", "TINY", "CLIMB", "COOL",
  "DESIGN", "POOR", "LOT", "EXPERIMENT", "BOTTOM", "KEY", "IRON", "SINGLE", "STICK", "FLAT",
  "TWENTY", "SKIN", "SMILE", "CREASE", "HOLE", "TRADE", "MELODY", "TRIP", "OFFICE", "RECEIVE",
  "ROW", "MOUTH", "EXACT", "SYMBOL", "DIE", "LEAST", "TROUBLE", "SHOUT", "EXCEPT", "WROTE",
  "SEED", "TONE", "JOIN", "SUGGEST", "CLEAN", "BREAK", "LADY", "YARD", "RISE", "BAD",
  "BLOW", "OIL", "BLOOD", "TOUCH", "GREW", "CENT", "MIX", "TEAM", "WIRE", "COST",
  "LOST", "BROWN", "WEAR", "GARDEN", "EQUAL", "SENT", "CHOOSE", "FELL", "FIT", "FLOW",
  "FAIR", "BANK", "COLLECT", "SAVE", "CONTROL", "DECIMAL", "EAR", "ELSE", "QUITE", "BROKE",
  "CASE", "MIDDLE", "KILL", "SON", "LAKE", "MOMENT", "SCALE", "LOUD", "SPRING", "OBSERVE",
  "CHILD", "STRAIGHT", "CONSONANT", "NATION", "DICTIONARY", "MILK", "SPEED", "METHOD", "ORGAN", "PAY",
  "AGE", "SECTION", "DRESS", "CLOUD", "SURPRISE", "QUIET", "STONE", "TINY", "CLIMB", "COOL",
  "DESIGN", "POOR", "LOT", "EXPERIMENT", "BOTTOM", "KEY", "IRON", "SINGLE", "STICK", "FLAT",
  "TWENTY", "SKIN", "SMILE", "CREASE", "HOLE", "TRADE", "MELODY", "TRIP", "OFFICE", "RECEIVE",
  "ROW", "MOUTH", "EXACT", "SYMBOL", "DIE", "LEAST", "TROUBLE", "SHOUT", "EXCEPT", "WROTE",
  "SEED", "TONE", "JOIN", "SUGGEST", "CLEAN", "BREAK", "LADY", "YARD", "RISE", "BAD",
  "BLOW", "OIL", "BLOOD", "TOUCH", "GREW", "CENT", "MIX", "TEAM", "WIRE", "COST",
  "LOST", "BROWN", "WEAR", "GARDEN", "EQUAL", "SENT", "CHOOSE", "FELL", "FIT", "FLOW",
  "FAIR", "BANK", "COLLECT", "SAVE", "CONTROL", "DECIMAL", "EAR", "ELSE", "QUITE", "BROKE",
  "CASE", "MIDDLE", "KILL", "SON", "LAKE", "MOMENT", "SCALE", "LOUD", "SPRING", "OBSERVE",
  "CHILD", "STRAIGHT", "CONSONANT", "NATION", "DICTIONARY", "MILK", "SPEED", "METHOD", "ORGAN", "PAY",
  "AGE", "SECTION", "DRESS", "CLOUD", "SURPRISE", "QUIET", "STONE", "TINY", "CLIMB", "COOL",
  "DESIGN", "POOR", "LOT", "EXPERIMENT", "BOTTOM", "KEY", "IRON", "SINGLE", "STICK", "FLAT",
  "TWENTY", "SKIN", "SMILE", "CREASE", "HOLE", "TRADE", "MELODY", "TRIP", "OFFICE", "RECEIVE",
  "ROW", "MOUTH", "EXACT", "SYMBOL", "DIE", "LEAST", "TROUBLE", "SHOUT", "EXCEPT", "WROTE",
  "SEED", "TONE", "JOIN", "SUGGEST", "CLEAN", "BREAK", "LADY", "YARD", "RISE", "BAD",
  "BLOW", "OIL", "BLOOD", "TOUCH", "GREW", "CENT", "MIX", "TEAM", "WIRE", "COST",
  "LOST", "BROWN", "WEAR", "GARDEN", "EQUAL", "SENT", "CHOOSE", "FELL", "FIT", "FLOW",
  "FAIR", "BANK", "COLLECT", "SAVE", "CONTROL", "DECIMAL", "EAR", "ELSE", "QUITE", "BROKE",
  "CASE", "MIDDLE", "KILL", "SON", "LAKE", "MOMENT", "SCALE", "LOUD", "SPRING", "OBSERVE",
  "CHILD", "STRAIGHT", "CONSONANT", "NATION", "DICTIONARY", "MILK", "SPEED", "METHOD", "ORGAN", "PAY",
  "AGE", "SECTION", "DRESS", "CLOUD", "SURPRISE", "QUIET", "STONE", "TINY", "CLIMB", "COOL",
  "DESIGN", "POOR", "LOT", "EXPERIMENT", "BOTTOM", "KEY", "IRON", "SINGLE", "STICK", "FLAT",
  "TWENTY", "SKIN", "SMILE", "CREASE", "HOLE", "TRADE", "MELODY", "TRIP", "OFFICE", "RECEIVE",
  "ROW", "MOUTH", "EXACT", "SYMBOL", "DIE", "LEAST", "TROUBLE", "SHOUT", "EXCEPT", "WROTE",
  "SEED", "TONE", "JOIN", "SUGGEST", "CLEAN", "BREAK", "LADY", "YARD", "RISE", "BAD",
  "BLOW", "OIL", "BLOOD", "TOUCH", "GREW", "CENT", "MIX", "TEAM", "WIRE", "COST",
  "LOST", "BROWN", "WEAR", "GARDEN", "EQUAL", "SENT", "CHOOSE", "FELL", "FIT", "FLOW",
  "FAIR", "BANK", "COLLECT", "SAVE", "CONTROL", "DECIMAL", "EAR", "ELSE", "QUITE", "BROKE",
  "CASE", "MIDDLE", "KILL", "SON", "LAKE", "MOMENT", "SCALE", "LOUD", "SPRING", "OBSERVE",
  "CHILD", "STRAIGHT", "CONSONANT", "NATION", "DICTIONARY", "MILK", "SPEED", "METHOD", "ORGAN", "PAY",
  "AGE", "SECTION", "DRESS", "CLOUD", "SURPRISE", "QUIET", "STONE", "TINY", "CLIMB", "COOL",
  "DESIGN", "POOR", "LOT", "EXPERIMENT", "BOTTOM", "KEY", "IRON", "SINGLE", "STICK", "FLAT",
  "TWENTY", "SKIN", "SMILE", "CREASE", "HOLE", "TRADE", "MELODY", "TRIP", "OFFICE", "RECEIVE",
  "ROW", "MOUTH", "EXACT", "SYMBOL", "DIE", "LEAST", "TROUBLE", "SHOUT", "EXCEPT", "WROTE",
  "SEED", "TONE", "JOIN", "SUGGEST", "CLEAN", "BREAK", "LADY", "YARD", "RISE", "BAD",
  "BLOW", "OIL", "BLOOD", "TOUCH", "GREW", "CENT", "MIX", "TEAM", "WIRE", "COST",
  "LOST", "BROWN", "WEAR", "GARDEN", "EQUAL", "SENT", "CHOOSE", "FELL", "FIT", "FLOW",
  "FAIR", "BANK", "COLLECT", "SAVE", "CONTROL", "DECIMAL", "EAR", "ELSE", "QUITE", "BROKE",
  "CASE", "MIDDLE", "KILL", "SON", "LAKE", "MOMENT", "SCALE", "LOUD", "SPRING", "OBSERVE",
  "CHILD", "STRAIGHT", "CONSONANT", "NATION", "DICTIONARY", "MILK", "SPEED", "METHOD", "ORGAN", "PAY",
  "AGE", "SECTION", "DRESS", "CLOUD", "SURPRISE", "QUIET", "STONE", "TINY", "CLIMB", "COOL",
  "DESIGN", "POOR", "LOT", "EXPERIMENT", "BOTTOM", "KEY", "IRON", "SINGLE", "STICK", "FLAT",
  "TWENTY", "SKIN", "SMILE", "CREASE", "HOLE", "TRADE", "MELODY", "TRIP", "OFFICE", "RECEIVE",
  "ROW", "MOUTH", "EXACT", "SYMBOL", "DIE", "LEAST", "TROUBLE", "SHOUT", "EXCEPT", "WROTE",
  "SEED", "TONE", "JOIN", "SUGGEST", "CLEAN", "BREAK", "LADY", "YARD", "RISE", "BAD",
  "BLOW", "OIL", "BLOOD", "TOUCH", "GREW", "CENT", "MIX", "TEAM", "WIRE", "COST",
  "LOST", "BROWN", "WEAR", "GARDEN", "EQUAL", "SENT", "CHOOSE", "FELL", "FIT", "FLOW",
  "FAIR", "BANK", "COLLECT", "SAVE", "CONTROL", "DECIMAL", "EAR", "ELSE", "QUITE", "BROKE",
  "CASE", "MIDDLE", "KILL", "SON", "LAKE", "MOMENT", "SCALE", "LOUD", "SPRING", "OBSERVE",
  "CHILD", "STRAIGHT", "CONSONANT", "NATION", "DICTIONARY", "MILK", "SPEED", "METHOD", "ORGAN", "PAY",
  "AGE", "SECTION", "DRESS", "CLOUD", "SURPRISE", "QUIET", "STONE", "TINY", "CLIMB", "COOL",
  "DESIGN", "POOR", "LOT", "EXPERIMENT", "BOTTOM", "KEY", "IRON", "SINGLE", "STICK", "FLAT",
  "TWENTY", "SKIN", "SMILE", "CREASE", "HOLE", "TRADE", "MELODY", "TRIP", "OFFICE", "RECEIVE",
  "ROW", "MOUTH", "EXACT", "SYMBOL", "DIE", "LEAST", "TROUBLE", "SHOUT", "EXCEPT", "WROTE",
  "SEED", "TONE", "JOIN", "SUGGEST", "CLEAN", "BREAK", "LADY", "YARD", "RISE", "BAD",
  "BLOW", "OIL", "BLOOD", "TOUCH", "GREW", "CENT", "MIX", "TEAM", "WIRE", "COST",
  "LOST", "BROWN", "WEAR", "GARDEN", "EQUAL", "SENT", "CHOOSE", "FELL", "FIT", "FLOW",
  "FAIR", "BANK", "COLLECT", "SAVE", "CONTROL", "DECIMAL", "EAR", "ELSE", "QUITE", "BROKE",
  "CASE", "MIDDLE", "KILL", "SON", "LAKE", "MOMENT", "SCALE", "LOUD", "SPRING", "OBSERVE",
  "CHILD", "STRAIGHT", "CONSONANT", "NATION", "DICTIONARY", "MILK", "SPEED", "METHOD", "ORGAN", "PAY",
  "AGE", "SECTION", "DRESS", "CLOUD", "SURPRISE", "QUIET", "STONE", "TINY", "CLIMB", "COOL",
  "DESIGN", "POOR", "LOT", "EXPERIMENT", "BOTTOM", "KEY", "IRON", "SINGLE", "STICK", "FLAT",
  "TWENTY", "SKIN", "SMILE", "CREASE", "HOLE", "TRADE", "MELODY", "TRIP", "OFFICE", "RECEIVE",
  "ROW", "MOUTH", "EXACT", "SYMBOL", "DIE", "LEAST", "TROUBLE", "SHOUT", "EXCEPT", "WROTE",
  "SEED", "TONE", "JOIN", "SUGGEST", "CLEAN", "BREAK", "LADY", "YARD", "RISE", "BAD",
  "BLOW", "OIL", "BLOOD", "TOUCH", "GREW", "CENT", "MIX", "TEAM", "WIRE", "COST",
  "LOST", "BROWN", "WEAR", "GARDEN", "EQUAL", "SENT", "CHOOSE", "FELL", "FIT", "FLOW",
  "FAIR", "BANK", "COLLECT", "SAVE", "CONTROL", "DECIMAL", "EAR", "ELSE", "QUITE", "BROKE",
  "CASE", "MIDDLE", "KILL", "SON", "LAKE", "MOMENT", "SCALE", "LOUD", "SPRING", "OBSERVE",
  "CHILD", "STRAIGHT", "CONSONANT", "NATION", "DICTIONARY", "MILK", "SPEED", "METHOD", "ORGAN", "PAY",
  "AGE", "SECTION", "DRESS", "CLOUD", "SURPRISE", "QUIET", "STONE", "TINY", "CLIMB", "COOL",
  "DESIGN", "POOR", "LOT", "EXPERIMENT", "BOTTOM", "KEY", "IRON", "SINGLE", "STICK", "FLAT",
  "TWENTY", "SKIN", "SMILE", "CREASE", "HOLE", "TRADE", "MELODY", "TRIP", "OFFICE", "RECEIVE",
  "ROW", "MOUTH", "EXACT", "SYMBOL", "DIE", "LEAST", "TROUBLE", "SHOUT", "EXCEPT", "WROTE",
  "SEED", "TONE", "JOIN", "SUGGEST", "CLEAN", "BREAK", "LADY", "YARD", "RISE", "BAD",
  "BLOW", "OIL", "BLOOD", "TOUCH", "GREW", "CENT", "MIX", "TEAM", "WIRE", "COST",
  "LOST", "BROWN", "WEAR", "GARDEN", "EQUAL", "SENT", "CHOOSE", "FELL", "FIT", "FLOW",
  "FAIR", "BANK", "COLLECT", "SAVE", "CONTROL", "DECIMAL", "EAR", "ELSE", "QUITE", "BROKE",
  "CASE", "MIDDLE", "KILL", "SON", "LAKE", "MOMENT", "SCA"
];

// Helper to check if word exists
const isWordInDictionary = (word) => {
  if (!word || word.length < 3) return false;
  return COMMON_WORDS.includes(word.toUpperCase());
};

const BoggleGame = ({ showToast }) => {
  const [grid, setGrid] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [gameState, setGameState] = useState('menu'); // menu, playing, gameover
  const [dice, setDice] = useState([
    "AAEEGN", "ABBJOO", "ACHOPS", "AFFKPS",
    "AOOTTW", "CIMOTU", "DEILRX", "DELRVY",
    "DISTTY", "EEGHNW", "EEINSU", "EHRTVW",
    "EIOSST", "ELRTTY", "HIMNQU", "HLNNRZ"
  ]);

  // Generate grid
  const shuffleGrid = useCallback(() => {
    const newGrid = [];
    const shuffledDice = [...dice].sort(() => Math.random() - 0.5);

    shuffledDice.forEach((die, index) => {
      const char = die[Math.floor(Math.random() * 6)];
      newGrid.push({
        id: index,
        char: char === 'Q' ? 'Qu' : char,
        x: index % 4,
        y: Math.floor(index / 4)
      });
    });

    setGrid(newGrid);
    setFoundWords([]);
    setScore(0);
    setTimeLeft(180);
    setSelectedCells([]);
    setGameState('playing');
  }, [dice]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('gameover');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Handle cell selection
  const handleCellClick = (cell) => {
    if (gameState !== 'playing') return;

    // Deselect if clicking last selected cell (backtrack)
    if (selectedCells.length > 0 && selectedCells[selectedCells.length - 1].id === cell.id) {
      setSelectedCells(prev => prev.slice(0, -1));
      return;
    }

    // Check if cell is adjacent to last selected
    if (selectedCells.length > 0) {
      const last = selectedCells[selectedCells.length - 1];
      const isAdajcent = Math.abs(last.x - cell.x) <= 1 && Math.abs(last.y - cell.y) <= 1;
      const isAlreadySelected = selectedCells.some(c => c.id === cell.id);

      if (!isAdajcent || isAlreadySelected) return;
    }

    setSelectedCells(prev => [...prev, cell]);
  };

  // Check word
  const submitWord = () => {
    const word = selectedCells.map(c => c.char).join('').toUpperCase();

    if (word.length < 3) {
      showToast('Word too short!', 'error');
      setSelectedCells([]);
      return;
    }

    if (foundWords.includes(word)) {
      showToast('Already found!', 'info');
      setSelectedCells([]);
      return;
    }

    if (!isWordInDictionary(word)) {
      showToast('Not in dictionary!', 'error');
      setSelectedCells([]);
      return;
    }

    // Calculate score
    let points = 0;
    if (word.length === 3) points = 1;
    else if (word.length === 4) points = 1;
    else if (word.length === 5) points = 2;
    else if (word.length === 6) points = 3;
    else if (word.length === 7) points = 5;
    else points = 11;

    setScore(s => s + points);
    setFoundWords(prev => [...prev, word]);
    showToast(`Found ${word}! +${points}`, 'success');
    setSelectedCells([]);
  };

  // Render
  return (
    <div className="min-h-[500px] flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl">
      {gameState === 'menu' && (
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-black text-indigo-900">WORD SCRAMBLE</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Find as many words as you can in 3 minutes! Connect adjacent letters vertically, horizontally, or diagonally.
          </p>
          <button
            onClick={shuffleGrid}
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-xl shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all"
          >
            Start Game
          </button>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Game Board */}
          <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center">
            <div className="flex justify-between w-full mb-6 text-xl font-bold text-gray-700">
              <div>Score: {score}</div>
              <div className={`${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
                Time: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-6">
              {grid.map(cell => {
                const isSelected = selectedCells.some(c => c.id === cell.id);
                const isLast = selectedCells.length > 0 && selectedCells[selectedCells.length - 1].id === cell.id;

                return (
                  <motion.button
                    key={cell.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCellClick(cell)}
                    className={`
                       w-16 h-16 md:w-20 md:h-20 rounded-xl text-2xl md:text-3xl font-bold shadow-md flex items-center justify-center transition-colors
                       ${isLast ? 'bg-orange-500 text-white ring-4 ring-orange-200' :
                        isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                     `}
                  >
                    {cell.char}
                  </motion.button>
                );
              })}
            </div>

            <div className="flex gap-4 w-full">
              <button
                onClick={() => setSelectedCells([])}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
              >
                Clear ({selectedCells.map(c => c.char).join('')})
              </button>
              <button
                onClick={submitWord}
                className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors shadow-lg"
                disabled={selectedCells.length < 3}
              >
                Submit
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="bg-white p-6 rounded-2xl shadow-xl h-[500px] flex flex-col">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Found Words ({foundWords.length})</h3>
            <div className="flex-1 overflow-y-auto grid grid-cols-2 content-start gap-2">
              <AnimatePresence>
                {foundWords.map((word, i) => (
                  <motion.div
                    key={word + i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg font-medium text-sm text-center"
                  >
                    {word}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <button
              onClick={() => setGameState('gameover')}
              className="mt-4 text-red-500 text-sm font-semibold hover:underline"
            >
              End Game Early
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="text-center space-y-6 max-w-2xl bg-white p-10 rounded-3xl shadow-2xl">
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-4xl font-black text-gray-800">Time's Up!</h2>
          <div className="grid grid-cols-3 gap-8 py-6">
            <div>
              <div className="text-gray-500 text-sm uppercase tracking-wider">Final Score</div>
              <div className="text-4xl font-black text-indigo-600">{score}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm uppercase tracking-wider">Words Found</div>
              <div className="text-4xl font-black text-indigo-600">{foundWords.length}</div>
            </div>
            <div>
              <div className="text-gray-500 text-sm uppercase tracking-wider">Best Word</div>
              <div className="text-2xl font-bold text-indigo-600">
                {foundWords.sort((a, b) => b.length - a.length)[0] || '-'}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={shuffleGrid}
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 hover:scale-105 transition-all shadow-lg"
            >
              Play Again
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoggleGame;