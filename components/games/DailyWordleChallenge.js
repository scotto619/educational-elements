import React, { useCallback, useEffect, useMemo, useState } from 'react';

const WORD_LIST = [
  'APPLE',
  'BRAVE',
  'CHAIR',
  'DELTA',
  'EAGLE',
  'FABLE',
  'GLASS',
  'HONEY',
  'ISLET',
  'JOKER',
  'KNOCK',
  'LIGHT',
  'MAGIC',
  'NOBLE',
  'OCEAN',
  'PILOT',
  'QUILT',
  'RIVER',
  'SOLAR',
  'TIGER',
  'UNION',
  'VIVID',
  'WATER',
  'XENON',
  'YEARN',
  'ZEBRA',
  'ANGLE',
  'BLAZE',
  'CROWN',
  'DRIFT',
  'EMBER',
  'FLUTE',
  'GRAPE',
  'HEART',
  'IONIC',
  'JELLY',
  'KHAKI',
  'LUNAR',
  'MIRTH',
  'NINJA',
  'ORBIT',
  'PRISM',
  'QUIRK',
  'ROAST',
  'SHEEP',
  'TRAIL',
  'URBAN',
  'VALOR',
  'WHISK',
  'YOUNG',
  'ZESTY'
];

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
];

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const STORAGE_KEY_BASE = 'dailyWordleChallenge';

const hashDate = (dateKey) => {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const getDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const evaluateGuess = (guess, solution) => {
  const result = Array(WORD_LENGTH).fill('absent');
  const solutionLetters = solution.split('');
  const guessLetters = guess.split('');
  const used = Array(WORD_LENGTH).fill(false);

  // First pass for correct placements
  guessLetters.forEach((letter, index) => {
    if (solutionLetters[index] === letter) {
      result[index] = 'correct';
      used[index] = true;
      solutionLetters[index] = null;
    }
  });

  // Second pass for present letters
  guessLetters.forEach((letter, index) => {
    if (result[index] === 'correct') {
      return;
    }
    const foundIndex = solutionLetters.findIndex((solutionLetter, i) => solutionLetter === letter && !used[i]);
    if (foundIndex !== -1) {
      result[index] = 'present';
      used[foundIndex] = true;
      solutionLetters[foundIndex] = null;
    }
  });

  return result;
};

const mergeKeyboardStatuses = (current, guess, evaluations) => {
  const priority = { correct: 3, present: 2, absent: 1 };
  const updated = { ...current };

  guess.split('').forEach((letter, idx) => {
    const status = evaluations[idx];
    const existing = updated[letter];
    if (!existing || priority[status] > priority[existing]) {
      updated[letter] = status;
    }
  });

  return updated;
};

const DailyWordleChallenge = ({ showToast, storageKeySuffix = '', studentData, updateStudentData }) => {
  const dateKey = useMemo(() => getDateKey(), []);

  const storageKey = useMemo(() => {
    if (!storageKeySuffix) return STORAGE_KEY_BASE;
    return `${STORAGE_KEY_BASE}:${storageKeySuffix}`;
  }, [storageKeySuffix]);

  const solution = useMemo(() => {
    const dailyIndex = hashDate(dateKey) % WORD_LIST.length;
    return WORD_LIST[dailyIndex];
  }, [dateKey]);

  const [guesses, setGuesses] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [keyboardStatuses, setKeyboardStatuses] = useState({});
  const [currentGuess, setCurrentGuess] = useState('');
  const [status, setStatus] = useState('playing');
  const [loaded, setLoaded] = useState(false);

  const persistState = useCallback(
    (next) => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            date: dateKey,
            ...next
          })
        );
      } catch (error) {
        console.error('Failed to persist daily Wordle state', error);
      }
    },
    [dateKey, storageKey]
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === dateKey) {
          setGuesses(parsed.guesses || []);
          setEvaluations(parsed.evaluations || []);
          setKeyboardStatuses(parsed.keyboardStatuses || {});
          setStatus(parsed.status || 'playing');
          setLoaded(true);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to load daily Wordle state', error);
    }
    setLoaded(true);
  }, [dateKey, storageKey]);

  useEffect(() => {
    if (!loaded) return;
    persistState({ guesses, evaluations, keyboardStatuses, status });
  }, [guesses, evaluations, keyboardStatuses, status, loaded, persistState]);

  const isComplete = status === 'won' || status === 'lost';

  const handleSubmitGuess = useCallback(() => {
    if (isComplete) {
      showToast?.('You\'ve already finished today\'s challenge. Come back tomorrow!');
      return;
    }

    if (currentGuess.length !== WORD_LENGTH) {
      showToast?.('Enter a 5-letter word to submit.');
      return;
    }

    const evaluation = evaluateGuess(currentGuess, solution);
    const nextGuesses = [...guesses, currentGuess];
    const nextEvaluations = [...evaluations, evaluation];
    const nextKeyboard = mergeKeyboardStatuses(keyboardStatuses, currentGuess, evaluation);

    setGuesses(nextGuesses);
    setEvaluations(nextEvaluations);
    setKeyboardStatuses(nextKeyboard);
    setCurrentGuess('');

    if (currentGuess === solution) {
      setStatus('won');
      showToast?.('You solved today\'s Daily Challenge! 🎉');
    } else if (nextGuesses.length >= MAX_GUESSES) {
      setStatus('lost');
      showToast?.(`Good effort! The word was ${solution}.`);
    }
  }, [currentGuess, evaluations, guesses, isComplete, keyboardStatuses, showToast, solution]);

  // Handle Win Rewards
  useEffect(() => {
    if (status === 'won' && studentData && updateStudentData) {
      const today = new Date().toDateString();
      const lastRewardDate = studentData?.gameProgress?.wordle?.lastRewardDate;

      if (lastRewardDate !== today) {
        // Award 5 coins
        const newCurrency = (studentData.currency || 0) + 5;

        updateStudentData({
          ...studentData,
          currency: newCurrency,
          gameProgress: {
            ...studentData.gameProgress,
            wordle: {
              ...studentData.gameProgress?.wordle,
              lastRewardDate: today
            }
          }
        }).then(() => {
          showToast('🏆 Daily Challenge Complete! +5 Coins', 'success');
        }).catch(err => console.error('Error awarding coins:', err));
      }
    }
  }, [status, studentData, updateStudentData, showToast]);


  const handleDelete = useCallback(() => {
    if (isComplete) return;
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [isComplete]);

  const handleAddLetter = useCallback(
    (letter) => {
      if (isComplete) {
        showToast?.('Today\'s challenge is complete. Come back tomorrow!');
        return;
      }
      setCurrentGuess((prev) => {
        if (prev.length >= WORD_LENGTH) return prev;
        return `${prev}${letter}`;
      });
    },
    [isComplete, showToast]
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key.toUpperCase();
      if (key === 'ENTER') {
        event.preventDefault();
        handleSubmitGuess();
      } else if (key === 'BACKSPACE') {
        event.preventDefault();
        handleDelete();
      } else if (/^[A-Z]$/.test(key)) {
        event.preventDefault();
        handleAddLetter(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAddLetter, handleDelete, handleSubmitGuess]);

  const renderTile = (rowIndex, colIndex) => {
    const guess = guesses[rowIndex] || '';
    const letter = guess[colIndex] || '';
    const evaluation = evaluations[rowIndex]?.[colIndex];
    let tileClass = 'border-gray-300';
    if (evaluation === 'correct') tileClass = 'bg-green-500 text-white border-green-500';
    else if (evaluation === 'present') tileClass = 'bg-yellow-500 text-white border-yellow-500';
    else if (evaluation === 'absent' && letter) tileClass = 'bg-gray-500 text-white border-gray-500';

    if (!letter && rowIndex === guesses.length && currentGuess[colIndex]) {
      return (
        <div
          key={`${rowIndex}-${colIndex}`}
          className="w-12 h-12 md:w-14 md:h-14 border-2 border-gray-400 flex items-center justify-center text-xl font-bold rounded-lg bg-white"
        >
          {currentGuess[colIndex]}
        </div>
      );
    }

    const displayLetter = letter || (rowIndex === guesses.length ? currentGuess[colIndex] || '' : '');

    return (
      <div
        key={`${rowIndex}-${colIndex}`}
        className={`w-12 h-12 md:w-14 md:h-14 border-2 ${tileClass} flex items-center justify-center text-xl font-bold rounded-lg transition-colors duration-200`}
      >
        {displayLetter}
      </div>
    );
  };

  const renderKeyboardKey = (key) => {
    const statusClass =
      keyboardStatuses[key] === 'correct'
        ? 'bg-green-600 text-white'
        : keyboardStatuses[key] === 'present'
          ? 'bg-yellow-500 text-white'
          : keyboardStatuses[key] === 'absent'
            ? 'bg-gray-500 text-white'
            : 'bg-gray-200 text-gray-800';

    if (key === 'ENTER') {
      return (
        <button
          key={key}
          onClick={handleSubmitGuess}
          className={`px-3 py-2 rounded-lg font-semibold text-sm md:text-base ${statusClass} flex-1`}
        >
          Enter
        </button>
      );
    }

    if (key === 'DEL') {
      return (
        <button
          key={key}
          onClick={handleDelete}
          className={`px-3 py-2 rounded-lg font-semibold text-sm md:text-base ${statusClass} flex-1`}
        >
          Del
        </button>
      );
    }

    return (
      <button
        key={key}
        onClick={() => handleAddLetter(key)}
        className={`w-8 h-10 md:w-10 md:h-12 rounded-lg font-semibold text-sm md:text-base ${statusClass}`}
      >
        {key}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h3 className="text-2xl font-bold text-purple-700">Daily Word Challenge</h3>
        <p className="text-gray-600">Guess the {WORD_LENGTH}-letter word in {MAX_GUESSES} tries. You can only play once today!</p>
        {isComplete && (
          <p className="text-green-700 font-semibold">
            {status === 'won' ? 'Great job! Come back tomorrow for a new word.' : `Nice try! The word was ${solution}.`}
          </p>
        )}
      </div>

      <div className="flex justify-center">
        <div className="space-y-2">
          {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex space-x-2 justify-center">
              {Array.from({ length: WORD_LENGTH }).map((__, colIndex) => renderTile(rowIndex, colIndex))}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {KEYBOARD_ROWS.map((row, idx) => (
          <div key={idx} className="flex justify-center gap-2">
            {row.map((key) => renderKeyboardKey(key))}
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>Progress is saved automatically. Your next challenge unlocks tomorrow ({dateKey}).</p>
      </div>
    </div>
  );
};

export default DailyWordleChallenge;
