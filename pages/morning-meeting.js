// pages/morning-meeting.js — Morning Meeting Presenter
// Edit Mode: teacher configures content before class
// Present Mode: clean read-only slideshow — students write/discuss, no interactions

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { auth } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const DAYS = [
  {
    "greeting": {
      "activity": "Stand Up, Sit Down!",
      "instructions": "Teacher calls out a category. If it applies to you, STAND UP! Try: 'Stand up if you have a pet' / 'Stand up if you woke up before 7am' / 'Stand up if you can speak another language'. Greet someone near you!",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "KINDNESS",
      "definition": "Kindness means doing something nice for someone without being asked and without expecting anything back. It can be small (a smile) or big (helping someone who is struggling).",
      "discuss": "What is one small act of kindness you could do for someone in this class TODAY? What might stop you?"
    },
    "game": {
      "title": "Would You Rather?",
      "howToPlay": "Teacher reads two options. Point LEFT for A, RIGHT for B. Quick vote — then one person from each side explains!",
      "rounds": "Round 1: Fly OR be invisible?\nRound 2: Only eat your favourite food forever OR never eat it again?\nRound 3: Live in the jungle OR live underwater?",
      "bonus": "Make up your own 'Would You Rather' for the class!"
    },
    "grammar": {
      "title": "Fix the Capital Letters",
      "sentence": "\"my friend jake lives in sydney. he loves playing cricket at the park.\"",
      "instruction": "Rewrite both sentences with ALL correct capital letters. How many did you need?"
    },
    "grammarTip": "ANSWER: My friend Jake lives in Sydney. He loves playing cricket at the park. — Capitals: start of sentence, person's name (Jake), place name (Sydney).",
    "grammarAnswer": {
      "answer": "My friend Jake lives in Sydney. He loves playing cricket at the park.",
      "explanation": "Capital letters go at the START of a sentence, for the NAME of a person (Jake), and the NAME of a place (Sydney)."
    },
    "spelling": {
      "words": [
        "fr _ _ nd",
        "bec _ _ se",
        "pe _ ple"
      ],
      "instruction": "Write each word in full. Check the tricky part!",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: friend, because, people — friEND (a friend to the END) · bEcAUsE (Big Elephants Can Always Understand Small Elephants) · PEOple (say PEO-ple in 2 syllables).",
    "spellingAnswer": {
      "answers": [
        "1  friend",
        "2  because",
        "3  people"
      ],
      "tip": "friEND — a friend to the END!\nbecAUSE — Big Elephants Can Always Understand Small Elephants\nPEOple — say it in syllables: PEO-ple"
    },
    "word": {
      "word": "curious",
      "pos": "adjective",
      "blank": "The _____ cat kept peeping through the window, trying to see inside.",
      "instruction": "What does CURIOUS mean? Write your own definition, then write a sentence using this word."
    },
    "wordTip": "DEFINITION: Wanting to know or find out about something. Noun: curiosity. Ask: 'Can you think of something that made you feel curious this week?'",
    "wordAnswer": {
      "definition": "Wanting to find out about something; eager to learn or know more.",
      "example": "The curious explorer shone her torch into the dark cave, wondering what might be hiding inside."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "6 × 7 = ?",
        "Half of 48 = ?",
        "53 + 29 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 42, 24, 82 — 6×7: use 6×6=36 then +6=42. Half of 48: half of 40=20 + half of 8=4 = 24. 53+29: add 30 then subtract 1 = 82.",
    "mathsAnswer": {
      "answers": [
        "1   6 × 7 = 42",
        "2   Half of 48 = 24",
        "3   53 + 29 = 82"
      ],
      "tip": "6×7: try 6×6=36, then +6=42.\nHalf of 48: half 40=20, half 8=4 → 24.\n53+29: add 30 first (83), subtract 1 = 82."
    },
    "literacy": {
      "type": "Creative Writing",
      "opener": "\"I opened the old box and found something I never expected...\"",
      "task": "Write 4-5 sentences. What was in the box? How did you feel? What happened next?",
      "challenge": "Use at least ONE describing word (adjective) in every sentence."
    },
    "riddle": {
      "riddle": "The more you take, the more you leave behind. What am I?"
    },
    "riddleAnswer": {
      "answer": "FOOTSTEPS",
      "explanation": "Every step you take LEAVES a footprint behind — so the more steps you take, the more you leave! It is about what you leave, not what you carry."
    },
    "reflection": {
      "question": "On a scale of 1 to 5, how are you feeling today? What would make today a GREAT day for you?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Two Truths and a Lie!",
      "instructions": "Tell your partner TWO true things about yourself and ONE lie. Your partner guesses the lie — then swap! Try to make your lie believable.",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "RESPECT",
      "definition": "Respect means treating others the way YOU would like to be treated — listening when they speak, valuing their feelings, and being polite even when you disagree.",
      "discuss": "Think of a time someone showed you respect. How did it make you feel? What did they do?"
    },
    "game": {
      "title": "Agree or Disagree?",
      "howToPlay": "Teacher reads a statement. STAND UP if you agree, STAY SEATED if you disagree. One person from each side explains their thinking.",
      "rounds": "Statement 1: School should start at 10am.\nStatement 2: It is better to have lots of friends than one best friend.\nStatement 3: Homework should be banned.\nStatement 4: Pets make the best companions.",
      "bonus": "Which statement caused the biggest split? Why?"
    },
    "grammar": {
      "title": "Add the Missing Punctuation",
      "sentence": "\"where did you put my bag asked emma i left it near the door said liam\"",
      "instruction": "Rewrite correctly. You need: capitals, speech marks, a question mark, a full stop, and commas."
    },
    "grammarTip": "ANSWER: \"Where did you put my bag?\" asked Emma. \"I left it near the door,\" said Liam. — Speech marks wrap spoken words. Punctuation goes INSIDE speech marks.",
    "grammarAnswer": {
      "answer": "\"Where did you put my bag?\" asked Emma. \"I left it near the door,\" said Liam.",
      "explanation": "Speech marks go AROUND the words spoken. Punctuation (? . ,) goes INSIDE the speech marks."
    },
    "spelling": {
      "words": [
        "dif _ _ rent",
        "us _ _ lly",
        "_ lways"
      ],
      "instruction": "Write each word in full. Look for the tricky part before you write!",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: different, usually, always — difFErent (tricky middle letters) · usually = usual + ly · always = ALL + WAYS. Tap syllables: dif-fer-ent, u-su-al-ly, al-ways.",
    "spellingAnswer": {
      "answers": [
        "1  different",
        "2  usually",
        "3  always"
      ],
      "tip": "difFErent — tricky middle letters.\nusually = usual + ly\nalways = ALL + WAYS"
    },
    "word": {
      "word": "generous",
      "pos": "adjective",
      "blank": "The _____ boy gave half of his lunch to his friend who had forgotten theirs.",
      "instruction": "What does GENEROUS mean? Write a definition and your own sentence."
    },
    "wordTip": "DEFINITION: Happy to give more than needed; unselfish and kind. Noun: generosity. Ask: 'What is something a generous person might do that a kind person might not?'",
    "wordAnswer": {
      "definition": "Happy to give more than needed; willing to share freely without expecting anything back.",
      "example": "The generous teacher stayed after school every Tuesday to help students who were struggling."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "8 × 9 = ?",
        "Quarter of 60 = ?",
        "100 − 37 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 72, 15, 63 — 8×9: 8×10=80 then -8=72. Quarter of 60: half=30, half again=15. 100-37: 100-40=60 then +3=63.",
    "mathsAnswer": {
      "answers": [
        "1   8 × 9 = 72",
        "2   Quarter of 60 = 15",
        "3   100 − 37 = 63"
      ],
      "tip": "8×9: 8×10=80, subtract 8 = 72.\nQuarter of 60: half=30, half again = 15.\n100−37: 100−40=60, add back 3 = 63."
    },
    "literacy": {
      "type": "Descriptive Writing",
      "opener": "",
      "task": "Describe your best friend (or someone you admire) in 4-5 sentences. Include what they look like AND what makes them a great person.",
      "challenge": "Do NOT use the word 'nice'. Find a better word!"
    },
    "riddle": {
      "riddle": "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?"
    },
    "riddleAnswer": {
      "answer": "AN ECHO",
      "explanation": "An echo 'speaks' your words back to you without having a mouth. It 'comes alive' when sound bounces off a wall or mountain and travels back!"
    },
    "reflection": {
      "question": "What is ONE goal you have for this week? What will you do to make it happen?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Question Tennis!",
      "instructions": "Take turns asking each other questions — you CANNOT repeat a question and you CANNOT pause more than 3 seconds! First person to pause, repeat or give up loses. Start with: 'What's your favourite food?'",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "HONESTY",
      "definition": "Honesty means telling the truth even when it is difficult. It is not just about avoiding lies — it is also about being genuine and fair in everything you do.",
      "discuss": "A friend asks what you think of their drawing, but you do not think it is very good. How can you be honest AND kind at the same time?"
    },
    "game": {
      "title": "Finish the Story!",
      "howToPlay": "Teacher starts with one sentence. Each student adds ONE sentence going around the room. You cannot contradict the sentence before yours — but you CAN change the direction!",
      "rounds": "Starter 1: 'The package arrived with no label and it was ticking.'\n\nStarter 2: 'Every morning for a week, a dog had been sitting on the school roof.'",
      "bonus": "Which story took the wildest turn?"
    },
    "grammar": {
      "title": "Choose the Right Word: their / there / they're",
      "sentence": "\"The students left _____ bags over _____. _____ going to need them at lunch.\"",
      "instruction": "Write the correct word in each blank. Explain WHY each one is correct."
    },
    "grammarTip": "ANSWER: their / there / they're — their = belonging to them · there = a place · they're = they are. Test: if 'they are' fits, use they're with apostrophe.",
    "grammarAnswer": {
      "answer": "The students left THEIR bags over THERE. THEY'RE going to need them at lunch.",
      "explanation": "THEIR = belonging to them.\nTHERE = a place (THERE has HERE in it).\nTHEY'RE = they are."
    },
    "spelling": {
      "words": [
        "th _ _ ght",
        "br _ _ ght",
        "c _ _ ght"
      ],
      "instruction": "These three words share a tricky pattern. Write them — can you spot what they have in common?",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: thought, brought, caught — all have silent 'gh'. Pattern: -OUGHT or -AUGHT. Family: thought/bought/brought/caught/taught. Say them aloud and notice the silent letters.",
    "spellingAnswer": {
      "answers": [
        "1  thought",
        "2  brought",
        "3  caught"
      ],
      "tip": "All have SILENT 'gh'!\nthOUGHt · brOUGHt · cAUGHt\nOther -ough words: though, rough."
    },
    "word": {
      "word": "brilliant",
      "pos": "adjective",
      "blank": "She had a _____ idea that solved the whole problem in just two minutes.",
      "instruction": "What does BRILLIANT mean? Write a definition. Can this word mean more than one thing?"
    },
    "wordTip": "DEFINITION: Very clever or impressive; also means very bright (light). Two meanings: 1) Very intelligent. 2) Very bright (a brilliant sun). Ask: 'If someone calls your work brilliant, is that different to calling YOU brilliant?'",
    "wordAnswer": {
      "definition": "Extremely clever, impressive, or talented; also means very bright or dazzling.",
      "example": "The young scientist had a brilliant mind — she solved problems that had puzzled experts for years."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "7 × 6 = ?",
        "10% of 90 = ?",
        "23 + 48 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 42, 9, 71 — 7×6=42. 10%: divide by 10 = 9. 23+48: add 50 then subtract 2 = 71.",
    "mathsAnswer": {
      "answers": [
        "1   7 × 6 = 42",
        "2   10% of 90 = 9",
        "3   23 + 48 = 71"
      ],
      "tip": "7×6 = 6×7 = 42.\n10% = divide by 10: 90 ÷ 10 = 9.\n23+48: add 50 (73), subtract 2 = 71."
    },
    "literacy": {
      "type": "Descriptive Writing",
      "opener": "",
      "task": "Write 4-5 sentences describing your favourite place. It could be real or imaginary. Include what you can SEE, HEAR, and FEEL there.",
      "challenge": "Start one sentence with a sound or smell to really bring it to life."
    },
    "riddle": {
      "riddle": "I have cities, but no houses live there. I have mountains, but no trees grow there. I have water, but no fish swim there. What am I?"
    },
    "riddleAnswer": {
      "answer": "A MAP",
      "explanation": "A map SHOWS the names of cities, mountains and rivers — but none of the real things actually exist on the map! It is a picture of the world, not the world itself."
    },
    "reflection": {
      "question": "Name ONE thing you are grateful for today. It can be something big or something tiny.",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Desert Island Decisions!",
      "instructions": "You are stranded on a desert island and can only bring THREE items (not people!). Tell your partner your three items and WHY. Then try to convince them your list is smarter!",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "COURAGE",
      "definition": "Courage means doing what is right or necessary even when you feel afraid. It shows up in big moments and small ones: standing up for someone, admitting a mistake, trying something new.",
      "discuss": "Think of a small moment this week when you needed courage. What happened? Did you act or hold back?"
    },
    "game": {
      "title": "Class Superlatives!",
      "howToPlay": "Teacher reads a category. Nominate someone in the class (yourself counts!). Quick vote — who agrees? Keep it KIND and positive only.",
      "rounds": "Round 1: Most likely to become a famous inventor\nRound 2: Most likely to climb Mount Everest\nRound 3: Most likely to still be friends with everyone in 20 years\nRound 4: Most likely to have their own TV show",
      "bonus": "What superpower would each person need for their category?"
    },
    "grammar": {
      "title": "Add the Apostrophes",
      "sentence": "\"Dont forget to pack Sams bag. Its going to be a long trip and hell need it.\"",
      "instruction": "Rewrite with all the missing apostrophes. How many did you need?"
    },
    "grammarTip": "ANSWER: Don't forget to pack Sam's bag. It's going to be a long trip and he'll need it. — don't=do not · Sam's=belonging to Sam · It's=it is · he'll=he will. It's vs its is the most common confusion!",
    "grammarAnswer": {
      "answer": "Don't forget to pack Sam's bag. It's going to be a long trip and he'll need it.",
      "explanation": "Apostrophes replace missing letters: don't=do not · it's=it is · he'll=he will.\nApostrophes also show possession: Sam's bag = the bag belonging to Sam."
    },
    "spelling": {
      "words": [
        "d _ es",
        "g _ es",
        "s _ ys"
      ],
      "instruction": "These words look like they should end in -oes — but they don't! Write them correctly.",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: does, goes, says — Common error: students write 'dose', 'gose', 'sais'. Say them slowly: d-UH-z, g-OH-z, s-EH-z. The spelling does not match the sound!",
    "spellingAnswer": {
      "answers": [
        "1  does",
        "2  goes",
        "3  says"
      ],
      "tip": "Tricky! They look wrong but they're right.\ndoes · goes · says\nSay them out loud — the spelling doesn't match the sound!"
    },
    "word": {
      "word": "ancient",
      "pos": "adjective",
      "blank": "Scientists discovered an _____ city buried beneath the sand that was over 3,000 years old.",
      "instruction": "What does ANCIENT mean? Write a definition. What is the difference between old and ancient?"
    },
    "wordTip": "DEFINITION: Very old; belonging to the very distant past. Usually means thousands of years old. Ask: 'What is something ancient near where you live?' Compare: old vs ancient vs brand new.",
    "wordAnswer": {
      "definition": "Belonging to the very distant past; extremely old — usually thousands of years old.",
      "example": "The ancient Egyptians built the pyramids more than 4,000 years ago — and they are still standing today."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "9 × 4 = ?",
        "Double 67 = ?",
        "124 − 56 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 36, 134, 68 — 9×4: 10×4=40 then -4=36. Double 67: double 60=120, double 7=14, total 134. 124-56: 124-60=64 then +4=68.",
    "mathsAnswer": {
      "answers": [
        "1   9 × 4 = 36",
        "2   Double 67 = 134",
        "3   124 − 56 = 68"
      ],
      "tip": "9×4: 10×4=40, subtract 4 = 36.\nDouble 67: double 60=120, double 7=14 → 134.\n124−56: 124−60=64, add back 4 = 68."
    },
    "literacy": {
      "type": "Creative Writing",
      "opener": "\"Suddenly, the lights went out...\"",
      "task": "Write 4-5 sentences about what happened next. Where were you? Who else was there? What sound did you hear first?",
      "challenge": "Try to show how you felt through what you DID, not just what you thought."
    },
    "riddle": {
      "riddle": "What has hands but cannot clap, and a face but cannot smile?"
    },
    "riddleAnswer": {
      "answer": "A CLOCK",
      "explanation": "A clock has 'hands' (the hour and minute hands) and a 'face' (the front of the clock with numbers) — but it cannot actually clap or smile!"
    },
    "reflection": {
      "question": "Name one person (in school or outside school) who helps you feel brave. What do they do?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Emoji Morning!",
      "instructions": "Describe how you're feeling today using exactly 3 emojis — write them down but don't say them out loud. Your partner guesses what each emoji means. Then swap!",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "RESPONSIBILITY",
      "definition": "Responsibility means owning your actions — good and bad. When things go wrong, responsible people do not make excuses — they ask: what can I do to fix this?",
      "discuss": "You accidentally knock over someone else's project and it breaks. Nobody saw you. What does responsibility look like here?"
    },
    "game": {
      "title": "This or That? — Class Vote!",
      "howToPlay": "Teacher reads two options. THUMBS UP for the first, THUMBS DOWN for the second. Tally the class — then someone from the minority side explains!",
      "rounds": "Round 1: Dogs OR cats?\nRound 2: Summer holidays OR Christmas holidays?\nRound 3: Be the funniest person OR the smartest?\nRound 4: Always be too hot OR always be too cold?",
      "bonus": "Which answer surprised you most? Why?"
    },
    "grammar": {
      "title": "Choose the Right Word: to / too / two",
      "sentence": "\"I want ___ go ___ the shops and buy ___ things.\"",
      "instruction": "Write the correct word in each blank. Then explain why each one is correct."
    },
    "grammarTip": "ANSWER: to / to / two — to = direction or purpose · two = the number 2 · too = also or too much. Test: if you mean 'also', use too. If it's the number, use two. Otherwise use to.",
    "grammarAnswer": {
      "answer": "I want TO go TO the shops and buy TWO things.",
      "explanation": "TO = direction or purpose ('want to go', 'go to the shops').\nTWO = the number 2.\nTOO = also, or too much (not needed here)."
    },
    "spelling": {
      "words": [
        "Wed _ _ sday",
        "Feb _ _ ary",
        "t _ m _ rrow"
      ],
      "instruction": "Three tricky words we use all the time. Write them correctly — say them in syllables to help!",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: Wednesday, February, tomorrow — Wed-nes-day (say all 3 syllables!) · Feb-ru-ary (4 syllables, not Feb-you-ary) · to-mor-row (double r). Common errors: 'Wendsday', 'Febuary', 'tommorow'.",
    "spellingAnswer": {
      "answers": [
        "1  Wednesday",
        "2  February",
        "3  tomorrow"
      ],
      "tip": "Wed-NES-day — say all three syllables!\nFeb-RU-ary — four syllables, not three.\nto-MOR-row — double r in the middle."
    },
    "word": {
      "word": "cautious",
      "pos": "adjective",
      "blank": "She was _____ crossing the busy road, looking both ways three times before stepping off the kerb.",
      "instruction": "What does CAUTIOUS mean? Write a definition. Is being cautious always a good thing?"
    },
    "wordTip": "DEFINITION: Being careful to avoid danger or problems. Noun: caution. Antonym: reckless, careless. Ask: 'Can someone be TOO cautious? What might happen if you were never cautious at all?'",
    "wordAnswer": {
      "definition": "Being careful to avoid risk or danger; not rushing into things without thinking.",
      "example": "The cautious hiker checked his map three times before heading down the unmarked trail alone."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "9 × 7 = ?",
        "50% of 66 = ?",
        "47 + 38 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 63, 33, 85 — 9×7: 10×7=70 minus 7=63. 50%=half: 66÷2=33. 47+38: 47+40=87 minus 2=85.",
    "mathsAnswer": {
      "answers": [
        "1   9 × 7 = 63",
        "2   50% of 66 = 33",
        "3   47 + 38 = 85"
      ],
      "tip": "9×7: 10×7=70, subtract 7 = 63.\n50% = divide by 2: 66 ÷ 2 = 33.\n47+38: add 40 (87), subtract 2 = 85."
    },
    "literacy": {
      "type": "Persuasive Writing",
      "opener": "",
      "task": "Write 4-5 sentences arguing your opinion: Should we have a longer lunch break at school? Give TWO reasons for your view.",
      "challenge": "Start your writing with a question to hook the reader."
    },
    "riddle": {
      "riddle": "The more you feed me, the more I grow. But give me water and I will die. What am I?"
    },
    "riddleAnswer": {
      "answer": "FIRE",
      "explanation": "A fire grows bigger when you feed it with wood or fuel. But water puts a fire OUT — so water makes it 'die'. Fire behaves the opposite way to most living things!"
    },
    "reflection": {
      "question": "What is one thing you could do DIFFERENTLY today to make it a better day than yesterday?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Compliment Circle!",
      "instructions": "Give the person next to you a genuine compliment about their CHARACTER or a SKILL, not just how they look. ('You are really good at explaining things.') Then swap!",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "COURAGE",
      "definition": "Courage means doing something even when it feels scary or hard. You do not have to be fearless to be brave — you just have to try anyway.",
      "discuss": "Name one thing that felt scary but you did it anyway. How did you feel afterwards?"
    },
    "game": {
      "title": "Yes or No?",
      "howToPlay": "One person thinks of a famous person, animal or object. The class asks YES or NO questions to figure out what it is. Only 20 questions allowed!",
      "rounds": "Round 1: Teacher thinks of something — class asks the questions.\nRound 2: Volunteer thinks of something — class asks again.\nTip: Start broad! (Is it alive? Is it real? Is it bigger than a car?)",
      "bonus": "Who guessed it the fastest? What was their best question?"
    },
    "grammar": {
      "title": "Fix the Capital Letters",
      "sentence": "\"on monday, i visited the sydney opera house with my aunt sarah.\"",
      "instruction": "Rewrite this sentence with ALL the correct capital letters. How many changes did you make?"
    },
    "grammarTip": "ANSWER: On Monday, I visited the Sydney Opera House with my Aunt Sarah. — Capitals: On (start), Monday (day), I (always), Sydney Opera House (proper name), Aunt Sarah (title+name).",
    "grammarAnswer": {
      "answer": "On Monday, I visited the Sydney Opera House with my Aunt Sarah.",
      "explanation": "Capital letters: start of sentence · I (always capital) · Days of the week · Names of people and places."
    },
    "spelling": {
      "words": [
        "n _ ight",
        "l _ ight",
        "fr _ ight"
      ],
      "instruction": "These three words all hide a silent letter pair. Write them in full — what letters are hiding?",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: night, light, fright — all have silent 'gh'. Rhyming family: night/light/fright/right/sight/tight/bright. Have students list more words in this family.",
    "spellingAnswer": {
      "answers": [
        "1  night",
        "2  light",
        "3  fright"
      ],
      "tip": "All have SILENT 'gh'!\nn-igh-t · l-igh-t · fr-igh-t\nOther -ight words: right, sight, bright, tight, might."
    },
    "word": {
      "word": "enormous",
      "pos": "adjective",
      "blank": "The _____ elephant walked slowly through the village, causing everyone to stop and stare.",
      "instruction": "What does ENORMOUS mean? Write a definition, then think of something that is enormous in real life."
    },
    "wordTip": "DEFINITION: Extremely large in size or amount. Synonyms: huge, gigantic, massive, vast. Ask: 'What is the difference between big, large, enormous, and gigantic?'",
    "wordAnswer": {
      "definition": "Extremely large in size; much bigger than normal.",
      "example": "The enormous wave rose twenty metres above the beach before crashing down with a thunderous roar."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "6 × 8 = ?",
        "Quarter of 120 = ?",
        "93 − 47 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 48, 30, 46 — 6×8: 6×10=60 minus 12=48. Quarter of 120: half=60, half again=30. 93-47: 93-50=43 then +3=46.",
    "mathsAnswer": {
      "answers": [
        "1   6 × 8 = 48",
        "2   Quarter of 120 = 30",
        "3   93 − 47 = 46"
      ],
      "tip": "6×8: 6×10=60, subtract 12 = 48.\nQuarter of 120: half=60, half again = 30.\n93−47: 93−50=43, add back 3 = 46."
    },
    "literacy": {
      "type": "Creative Writing",
      "opener": "\"The door had been locked for fifty years — until today.\"",
      "task": "Write 4-5 sentences about what was behind the door. Who opened it? What did they find? How did they feel?",
      "challenge": "Use at least one adjective in EVERY sentence."
    },
    "riddle": {
      "riddle": "I go up when the rain comes down. What am I?"
    },
    "riddleAnswer": {
      "answer": "AN UMBRELLA",
      "explanation": "When it rains, you put your umbrella UP. So the umbrella literally 'goes up' when rain 'comes down'! A riddle about opposites working together."
    },
    "reflection": {
      "question": "What is one kind thing someone did for you this week? Have you thanked them yet?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Mirror Mirror!",
      "instructions": "Stand facing your partner. One person leads slow movements — the other copies them exactly like a mirror image. Try to move so smoothly that a watcher cannot tell who is leading. After 45 seconds, swap!",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "TEAMWORK",
      "definition": "Teamwork means working together towards a shared goal. Good teams listen to each other, share the work fairly, and celebrate together.",
      "discuss": "Think of a time when working with others made something BETTER than you could have done alone. What made the team work well?"
    },
    "game": {
      "title": "Count to 20!",
      "howToPlay": "The whole class tries to count from 1 to 20 together — but with NO planning, NO pointing, and NO order. Anyone can say a number, but if two people speak at once, go back to 1!",
      "rounds": "Attempt 1: First try — how far do you get?\nAttempt 2: Try again — can you beat your score?\nAttempt 3: Final attempt — can you reach 20?",
      "bonus": "What strategies helped? What made it harder?"
    },
    "grammar": {
      "title": "Identify the Verb",
      "sentence": "\"The excited children sprinted across the playground and leaped over the puddles.\"",
      "instruction": "Write down all the VERBS (action words) in this sentence. How many did you find?"
    },
    "grammarTip": "ANSWER: sprinted, leaped — both are past tense verbs. 'Excited' is an adjective describing 'children'. Check: can you add 'they' in front? If it makes sense, it's likely a verb.",
    "grammarAnswer": {
      "answer": "Verbs: sprinted · leaped",
      "explanation": "A VERB is a doing/action word. 'Sprinted' and 'leaped' tell us what the children DID. 'Excited' describes the children (adjective), not an action."
    },
    "spelling": {
      "words": [
        "kn _ _ w",
        "kn _ ck",
        "kn _ fe"
      ],
      "instruction": "All three words start with a silent letter. Write them in full — what letter is hiding at the start?",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: know, knock, knife — all start with silent 'k'. The 'k' is silent when followed by 'n'. Other kn- words: knee, knight, knot, kneel. Have students brainstorm more.",
    "spellingAnswer": {
      "answers": [
        "1  know",
        "2  knock",
        "3  knife"
      ],
      "tip": "All start with SILENT 'k'!\nkn- words: know, knock, knife, knee, knight, knot.\nThe 'k' is always silent before 'n'."
    },
    "word": {
      "word": "magnificent",
      "pos": "adjective",
      "blank": "The view from the top of the mountain was so _____ that nobody spoke for a whole minute.",
      "instruction": "What does MAGNIFICENT mean? Write a definition, then describe something you have seen that was truly magnificent."
    },
    "wordTip": "DEFINITION: Impressively beautiful or wonderful; truly splendid. Similar to: spectacular, breathtaking, stunning. Ask: 'What is the difference between good, great, amazing and magnificent?'",
    "wordAnswer": {
      "definition": "Extremely beautiful or impressive; truly splendid and wonderful.",
      "example": "The fireworks display over the harbour was so magnificent that the whole crowd gasped at once."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "7 × 8 = ?",
        "10% of 130 = ?",
        "65 + 77 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 56, 13, 142 — 7×8: 7×10=70 minus 14=56. 10%: divide by 10=13. 65+77: 65+80=145 minus 3=142.",
    "mathsAnswer": {
      "answers": [
        "1   7 × 8 = 56",
        "2   10% of 130 = 13",
        "3   65 + 77 = 142"
      ],
      "tip": "7×8: 7×10=70, subtract 14 = 56.\n10% = divide by 10: 130 ÷ 10 = 13.\n65+77: add 80 (145), subtract 3 = 142."
    },
    "literacy": {
      "type": "Descriptive Writing",
      "opener": "",
      "task": "Describe the BEST meal you have ever eaten (real or imaginary) in 4-5 sentences. What did it look like? Smell like? Taste like?",
      "challenge": "Use a simile somewhere (e.g. 'as warm as...' or 'like a...')."
    },
    "riddle": {
      "riddle": "I have a head, a tail, but no body. What am I?"
    },
    "riddleAnswer": {
      "answer": "A COIN",
      "explanation": "A coin has a HEAD (the side with the face) and a TAIL (the other side) — but no actual body! A classic riddle using the phrases 'heads' and 'tails'."
    },
    "reflection": {
      "question": "What is one thing you learned yesterday that you actually found interesting? Why did it interest you?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Find Someone Who!",
      "instructions": "Walk around the room. Find someone who: has been on a plane · can say hello in another language · has read more than 5 books this year · was born in a different month to you. Write their name next to each. GO!",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "HONESTY",
      "definition": "Honesty means telling the truth even when it would be easier not to. An honest person is trustworthy — people know they can count on them.",
      "discuss": "Is there a difference between telling a lie and just not saying the full truth? When might staying quiet be the same as lying?"
    },
    "game": {
      "title": "Story in a Word!",
      "howToPlay": "Teacher says a random word. In pairs, create a mini story that STARTS with that word in 60 seconds. Each pair shares their first sentence. Vote for the most creative!",
      "rounds": "Word 1: PURPLE\nWord 2: SUDDENLY\nWord 3: UNDERGROUND\nWord 4: BACKWARDS",
      "bonus": "Which opening sentence made you want to hear more?"
    },
    "grammar": {
      "title": "Add the Missing Commas",
      "sentence": "\"In the bag I found a pencil a ruler two erasers a broken crayon and a very old sandwich.\"",
      "instruction": "Rewrite with commas in the right places. How many commas did you add?"
    },
    "grammarTip": "ANSWER: In the bag, I found a pencil, a ruler, two erasers, a broken crayon, and a very old sandwich. — Comma after introductory phrase + commas between list items.",
    "grammarAnswer": {
      "answer": "In the bag, I found a pencil, a ruler, two erasers, a broken crayon, and a very old sandwich.",
      "explanation": "Comma after 'In the bag' (introductory phrase).\nCommas between items in a list.\nYou can include a comma before 'and' — this is called the Oxford comma."
    },
    "spelling": {
      "words": [
        "s _ rp _ _ se",
        "p _ rh _ ps",
        "ex _ _ _ ment"
      ],
      "instruction": "Three words that trip everyone up. Write them — say them in syllables first!",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: surprise, perhaps, experiment — surPRISE (not surprize!) · perHAPS (per-haps, 2 syllables) · exPERiment (ex-per-i-ment, 4 syllables). Common errors: 'suprise', 'prehaps', 'expiriment'.",
    "spellingAnswer": {
      "answers": [
        "1  surprise",
        "2  perhaps",
        "3  experiment"
      ],
      "tip": "surPRISE — not 'suprise'! Say it: sur-prise.\nperHAPS — two syllables: per-haps.\nexPERiment — four syllables: ex-per-i-ment."
    },
    "word": {
      "word": "furious",
      "pos": "adjective",
      "blank": "She was _____ when she found out someone had eaten her lunch without asking.",
      "instruction": "What does FURIOUS mean? Is it stronger or weaker than angry? Write a definition and a sentence."
    },
    "wordTip": "DEFINITION: Extremely angry; much stronger than just 'angry'. Scale: annoyed → angry → furious → livid. Ask students to arrange: cross, upset, angry, furious, irritated from weakest to strongest.",
    "wordAnswer": {
      "definition": "Extremely angry; much more intense than just being upset or annoyed.",
      "example": "The coach was furious when the team turned up twenty minutes late for the most important game of the season."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "12 × 6 = ?",
        "Half of 94 = ?",
        "200 − 63 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 72, 47, 137 — 12×6: 10×6=60 plus 2×6=12=72. Half 94: half 90=45 half 4=2=47. 200-63: 200-60=140 then -3=137.",
    "mathsAnswer": {
      "answers": [
        "1   12 × 6 = 72",
        "2   Half of 94 = 47",
        "3   200 − 63 = 137"
      ],
      "tip": "12×6: 10×6=60, add 2×6=12 → 72.\nHalf of 94: half 90=45, half 4=2 → 47.\n200−63: 200−60=140, then −3 = 137."
    },
    "literacy": {
      "type": "Creative Writing",
      "opener": "\"There was a giant footprint in the school garden — and it had not been there yesterday.\"",
      "task": "Write 4-5 sentences about what had made it. What happened next? Did anyone believe you?",
      "challenge": "Try to write your story in FIRST PERSON (using I, me, my)."
    },
    "riddle": {
      "riddle": "I have no legs but I can travel, no wings but I can fly, no teeth but I can bite. What am I?"
    },
    "riddleAnswer": {
      "answer": "THE WIND",
      "explanation": "Wind travels across the earth without legs. It can 'fly' things through the air. On a cold day, the wind can bite — we even call it 'biting cold'!"
    },
    "reflection": {
      "question": "Name one person at school (teacher or student) who you could show more appreciation to. What could you do?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Human Knot!",
      "instructions": "Stand in a circle. Reach across and grab the hands of TWO different people (not the person next to you). Now, without letting go, untangle yourselves into a circle again! Work together!",
      "time": "3 minutes — GO!"
    },
    "value": {
      "name": "FAIRNESS",
      "definition": "Fairness means giving everyone what they need — not always giving everyone the same thing. Sometimes being fair means treating people DIFFERENTLY because they have different needs.",
      "discuss": "Is it fair that some students get extra time on tests? Why or why not? What does fairness really mean?"
    },
    "game": {
      "title": "One Word at a Time!",
      "howToPlay": "The class builds a sentence ONE word at a time, going around the room. Each person adds exactly one word. The sentence must make grammatical sense! Try to reach 20 words.",
      "rounds": "Attempt 1: Start with 'Yesterday...'\nAttempt 2: Start with 'Underneath...'\nAttempt 3: Start with 'The most...'",
      "bonus": "Which sentence was the most creative?"
    },
    "grammar": {
      "title": "Choose the Right Word: its / it's",
      "sentence": "\"The dog wagged ___ tail. ___ been a very good dog today.\"",
      "instruction": "Write the correct word in each blank. Then explain the difference between the two."
    },
    "grammarTip": "ANSWER: its / It's — its = belonging to it (no apostrophe) · it's = it is (apostrophe replaces missing letter). Test: replace with 'it is' — if it works, use the apostrophe!",
    "grammarAnswer": {
      "answer": "The dog wagged ITS tail. IT'S been a very good dog today.",
      "explanation": "ITS = belonging to it (possessive, no apostrophe — like his/her).\nIT'S = it is (apostrophe replaces the 'i').\nTest: if 'it is' fits, use the apostrophe!"
    },
    "spelling": {
      "words": [
        "busi _ _ ss",
        "addr _ _ s",
        "sched _ _ e"
      ],
      "instruction": "Three words that trip everyone up. Write them carefully — look for the hidden tricky part.",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: business, address, schedule — buSINEss (busy + ness) · ADDress (double d) · SCHedule (sch sound, not sh). Common errors: 'bussiness', 'adress', 'shedule'.",
    "spellingAnswer": {
      "answers": [
        "1  business",
        "2  address",
        "3  schedule"
      ],
      "tip": "BUSiness — busy + ness (y changes to i).\nADDress — double d at the start.\nSCHedule — starts with sch not sh."
    },
    "word": {
      "word": "incredible",
      "pos": "adjective",
      "blank": "The magician performed an _____ trick that left the whole audience speechless.",
      "instruction": "What does INCREDIBLE mean? Write a definition. Is it similar to unbelievable? How?"
    },
    "wordTip": "DEFINITION: So extraordinary that it is hard to believe; amazingly good or impressive. Compare: incredible (hard to believe) vs amazing (causes amazement) vs fantastic (from fantasy).",
    "wordAnswer": {
      "definition": "So extraordinary that it is hard to believe; amazingly good or impressive.",
      "example": "She ran the 400 metres in an incredible time — faster than anyone at the school had ever managed."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "8 × 7 = ?",
        "25% of 80 = ?",
        "36 + 57 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 56, 20, 93 — 8×7=56. 25%=quarter: 80÷4=20. 36+57: 36+60=96 minus 3=93.",
    "mathsAnswer": {
      "answers": [
        "1   8 × 7 = 56",
        "2   25% of 80 = 20",
        "3   36 + 57 = 93"
      ],
      "tip": "8×7 = 7×8 = 56.\n25% = one quarter: 80 ÷ 4 = 20.\n36+57: add 60 (96), subtract 3 = 93."
    },
    "literacy": {
      "type": "Narrative Writing",
      "opener": "\"The robot had been sitting in the corner of the classroom for a week — and nobody knew it was listening.\"",
      "task": "Write 4-5 sentences. What had the robot been hearing? What did it decide to do one day?",
      "challenge": "Try to write the story from the robot's point of view."
    },
    "riddle": {
      "riddle": "The person who makes it never uses it. The person who buys it never wants it. The person who uses it never knows it. What is it?"
    },
    "riddleAnswer": {
      "answer": "A COFFIN",
      "explanation": "A carpenter builds a coffin but doesn't need one. A family buys one but would rather not need it. The person placed in it never knows they're there. A classic riddle with a surprising answer!"
    },
    "reflection": {
      "question": "What does FAIRNESS mean to you? Can you think of a time something felt unfair — and what would have made it fair?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Back to Back!",
      "instructions": "Sit back-to-back with a partner. One person describes a simple shape or drawing — no gestures! The other person draws what they hear. Then swap. Compare your drawings at the end!",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "RESPONSIBILITY",
      "definition": "Responsibility means owning your choices. When things go wrong, responsible people do not make excuses — they ask: what can I do to fix this?",
      "discuss": "You forgot to complete a homework task. What does taking responsibility look like — and what does making excuses look like?"
    },
    "game": {
      "title": "Category Blitz!",
      "howToPlay": "Teacher names a category. In pairs, write as many items in that category as you can in 60 seconds. The pair with the most correct answers wins the round!",
      "rounds": "Round 1: Things you find in a kitchen\nRound 2: Animals that live in Australia\nRound 3: Words that rhyme with 'light'\nRound 4: Things that are round",
      "bonus": "Which category was hardest? Why?"
    },
    "grammar": {
      "title": "Identify the Noun and the Verb",
      "sentence": "\"The old cat stretched slowly across the warm windowsill.\"",
      "instruction": "Write the NOUNS and the VERBS from this sentence in separate lists."
    },
    "grammarTip": "ANSWER: Nouns: cat, windowsill. Verb: stretched. 'Old' and 'warm' are adjectives. 'Slowly' is an adverb. Nouns are naming words, verbs are action/doing words.",
    "grammarAnswer": {
      "answer": "Nouns: cat, windowsill\nVerb: stretched",
      "explanation": "NOUNS = naming words: the CAT and WINDOWSILL are the things in this sentence.\nVERB = action word: STRETCHED tells us what the cat DID.\n'Old' and 'warm' are adjectives."
    },
    "spelling": {
      "words": [
        "neigh _ _ _ r",
        "st _ _ ight",
        "w _ _ ght"
      ],
      "instruction": "Each word has a tricky vowel combination. Write them in full and circle the tricky part.",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: neighbour, straight, weight — NEIGHbour (eigh=ay sound) · strAIGHt (silent gh) · wEIGHt (eigh=ay sound). Pattern: -eigh- can make an 'ay' sound. Other examples: eight, eighteen, sleigh.",
    "spellingAnswer": {
      "answers": [
        "1  neighbour",
        "2  straight",
        "3  weight"
      ],
      "tip": "All have tricky vowel patterns!\nneighBOUR — ei+gh makes an 'ay' sound.\nstraIGHT — silent gh!\nwEIGHT — eigh = 'ay' sound."
    },
    "word": {
      "word": "mysterious",
      "pos": "adjective",
      "blank": "The _____ old house at the end of the road always had its curtains closed, even on sunny days.",
      "instruction": "What does MYSTERIOUS mean? Write a definition. What makes something mysterious?"
    },
    "wordTip": "DEFINITION: Difficult to understand or explain; strange and secretive. Noun: mystery. Ask: 'What is something that seems mysterious to you? Could there be a simple explanation you just don't know yet?'",
    "wordAnswer": {
      "definition": "Strange, secretive, and difficult to explain or understand.",
      "example": "A mysterious light appeared in the night sky, moved in three sharp zigzags, then vanished completely."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "11 × 9 = ?",
        "Double 48 = ?",
        "150 − 67 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 99, 96, 83 — 11×9: 10×9=90 plus 9=99. Double 48: double 40=80 double 8=16=96. 150-67: 150-70=80 then +3=83.",
    "mathsAnswer": {
      "answers": [
        "1   11 × 9 = 99",
        "2   Double 48 = 96",
        "3   150 − 67 = 83"
      ],
      "tip": "11×9: 10×9=90, add 9 = 99.\nDouble 48: double 40=80, double 8=16 → 96.\n150−67: 150−70=80, add back 3 = 83."
    },
    "literacy": {
      "type": "Descriptive Writing",
      "opener": "",
      "task": "Describe a thunderstorm using all five senses in 4-5 sentences. What do you SEE, HEAR, SMELL, FEEL, and TASTE?",
      "challenge": "Use personification — describe the storm as if it were a living creature."
    },
    "riddle": {
      "riddle": "I can be short or tall. I can be brown, yellow, or red. I grow in the ground and you peel me to eat me. What am I?"
    },
    "riddleAnswer": {
      "answer": "A CARROT",
      "explanation": "Carrots grow in the ground, come in different sizes and colours, and you peel them to eat. Great riddles sometimes have more than one correct answer — as long as you can justify it!"
    },
    "reflection": {
      "question": "What is one habit you have that helps you learn better? What is one habit you could improve?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "The Name Game!",
      "instructions": "Go around the room. Say your name and a FOOD that starts with the same letter. Each person must ALSO repeat all the names before theirs. How far can the class get without forgetting?",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "EMPATHY",
      "definition": "Empathy is the ability to understand how another person is feeling. It means trying to see the world through their eyes — not just recognising their emotions, but FEELING with them.",
      "discuss": "Think of a time when someone showed you empathy. What did they say or do? How did it make you feel?"
    },
    "game": {
      "title": "What's the Question?",
      "howToPlay": "Teacher shows an ANSWER. Your job is to come up with the best QUESTION that would lead to that answer. Compare with a partner — whose question is most creative?",
      "rounds": "Answer 1: 42\nAnswer 2: A banana peel\nAnswer 3: Because nobody told me\nAnswer 4: Three Thursdays ago",
      "bonus": "Make up your own Answer for the class!"
    },
    "grammar": {
      "title": "Rewrite Using Better Verbs",
      "sentence": "\"The boy went across the road and went into the shop and got a drink.\"",
      "instruction": "Rewrite this sentence replacing each 'went' or 'got' with a stronger, more specific verb."
    },
    "grammarTip": "EXAMPLE: 'The boy dashed across the road, rushed into the shop, and grabbed a cold drink.' — Strong verbs: sprinted, burst, snatched, bought, seized. Weak verbs like 'went' and 'got' are vague — replace them!",
    "grammarAnswer": {
      "answer": "Example: 'The boy sprinted across the road, burst into the shop, and grabbed a cold drink.'",
      "explanation": "Replacing weak verbs (went, got) with strong, specific verbs (sprinted, burst, grabbed) makes writing more vivid and exciting. Any answer is correct if it improves the sentence!"
    },
    "spelling": {
      "words": [
        "gr _ _ tful",
        "b _ _ utiful",
        "pl _ _ sant"
      ],
      "instruction": "Write each word in full. Find the tricky vowel part in each one!",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: grateful, beautiful, pleasant — grATEful (grate + ful, not greatful!) · beAUtiful (beau + tiful) · plEAsant (plea + sant). Common errors: 'greatful', 'beatiful', 'plesant'.",
    "spellingAnswer": {
      "answers": [
        "1  grateful",
        "2  beautiful",
        "3  pleasant"
      ],
      "tip": "grATEful — from 'grate', not 'great'!\nbeAUtiful — starts with BEAU (beauty).\nplEAsant — 'plea' is hiding in pleasant."
    },
    "word": {
      "word": "delightful",
      "pos": "adjective",
      "blank": "We had a _____ afternoon at the beach — the sun was warm, the waves were calm, and the ice cream was perfect.",
      "instruction": "What does DELIGHTFUL mean? Write a definition. Is it stronger than pleasant?"
    },
    "wordTip": "DEFINITION: Causing great pleasure or happiness; charming and enjoyable. Scale: nice → pleasant → delightful → wonderful. Ask: 'What is something you find truly delightful?'",
    "wordAnswer": {
      "definition": "Causing great pleasure or happiness; charming and enjoyable.",
      "example": "The little girl gave a delightful laugh when the puppy licked her nose — a sound that made everyone in the room smile."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "6 × 12 = ?",
        "Quarter of 96 = ?",
        "78 + 45 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 72, 24, 123 — 6×12: 6×10=60 plus 12=72. Quarter 96: half=48 half again=24. 78+45: 78+50=128 minus 5=123.",
    "mathsAnswer": {
      "answers": [
        "1   6 × 12 = 72",
        "2   Quarter of 96 = 24",
        "3   78 + 45 = 123"
      ],
      "tip": "6×12: 6×10=60, add 12 → 72.\nQuarter of 96: half=48, half again = 24.\n78+45: add 50 (128), subtract 5 = 123."
    },
    "literacy": {
      "type": "Creative Writing",
      "opener": "\"For one day only, you could understand exactly what animals were saying.\"",
      "task": "Write 4-5 sentences. Which animal did you talk to first? What did they say? What surprising thing did you find out?",
      "challenge": "Include what you said BACK to the animal."
    },
    "riddle": {
      "riddle": "I have many teeth but I cannot bite. I make things neat but not with my might. What am I?"
    },
    "riddleAnswer": {
      "answer": "A COMB",
      "explanation": "A comb has many 'teeth' (the little spikes) but it cannot bite! You use a comb to neaten your hair. This riddle uses the word 'teeth' in an unexpected way!"
    },
    "reflection": {
      "question": "If you could change ONE rule at school, what would it be and why? What problem would it solve?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Rock, Paper, Scissors Tournament!",
      "instructions": "Play rock paper scissors against your partner. Winner moves on — loser cheers them on from the sidelines. Keep playing until there is ONE class champion!",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "SELF-BELIEF",
      "definition": "Self-belief means trusting in your own ability to succeed — even when you have not succeeded yet. It is the quiet voice inside that says: I can do this if I try.",
      "discuss": "Think of something you want to get better at. What is one small step you could take THIS WEEK to get closer to it?"
    },
    "game": {
      "title": "That Reminds Me!",
      "howToPlay": "One person says any random word. The next person says a word that REMINDS them of that word — and explains why. Keep the chain going around the room.",
      "rounds": "Start with: OCEAN\nThen keep the chain going around the class.\nChallenge: after 10 people, can anyone connect the last word back to OCEAN?",
      "bonus": "Which connection surprised you the most?"
    },
    "grammar": {
      "title": "Simile or Metaphor?",
      "sentence": "\"Her voice was music to my ears. He ran like a cheetah across the finish line. The classroom was a disaster zone.\"",
      "instruction": "Label each as SIMILE or METAPHOR. Explain the difference between the two."
    },
    "grammarTip": "ANSWERS: music to my ears = METAPHOR · like a cheetah = SIMILE · a disaster zone = METAPHOR — Simile uses 'like' or 'as' to compare. Metaphor directly says something IS something else.",
    "grammarAnswer": {
      "answer": "Music to my ears → METAPHOR\nLike a cheetah → SIMILE\nA disaster zone → METAPHOR",
      "explanation": "SIMILE uses 'like' or 'as' to compare: 'ran LIKE a cheetah'.\nMETAPHOR directly says something IS something else: 'her voice WAS music'.\nBoth are figurative language — they say things that are not literally true."
    },
    "spelling": {
      "words": [
        "lau _ _ ter",
        "daug _ _ er",
        "sl _ _ _ ter"
      ],
      "instruction": "These three words share a tricky letter pattern. Write them all out — can you spot what they have in common?",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: laughter, daughter, slaughter — all have silent 'gh' and the -aughter pattern. lAUGHter · dAUGHter · slAUGHter. Have students say 'laugh' then 'laughter' slowly to see how the spelling connects.",
    "spellingAnswer": {
      "answers": [
        "1  laughter",
        "2  daughter",
        "3  slaughter"
      ],
      "tip": "All follow the -AUGHTER pattern with silent GH!\nlAUGHter · dAUGHter · slAUGHter\nThe 'gh' is completely silent in all three."
    },
    "word": {
      "word": "nervous",
      "pos": "adjective",
      "blank": "Before the big performance, even the most experienced actors felt _____ backstage.",
      "instruction": "What does NERVOUS mean? Write a definition. Is nervous always a bad feeling?"
    },
    "wordTip": "DEFINITION: Anxious or worried about something that might happen. Discuss: Can nervousness sometimes be helpful? (It makes us prepare and focus.) Science link: adrenaline causes the physical feelings of nervousness.",
    "wordAnswer": {
      "definition": "Feeling anxious or worried about something, often before an important event.",
      "example": "He was so nervous before the spelling competition that his hands were shaking and his mind went blank."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "9 × 6 = ?",
        "75% of 40 = ?",
        "102 − 38 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 54, 30, 64 — 9×6: 10×6=60 minus 6=54. 75%=3 quarters: 40÷4=10 ×3=30. 102-38: 102-40=62 then +2=64.",
    "mathsAnswer": {
      "answers": [
        "1   9 × 6 = 54",
        "2   75% of 40 = 30",
        "3   102 − 38 = 64"
      ],
      "tip": "9×6: 10×6=60, subtract 6 = 54.\n75% = ¾: 40÷4=10, ×3 = 30.\n102−38: 102−40=62, add back 2 = 64."
    },
    "literacy": {
      "type": "Persuasive Writing",
      "opener": "",
      "task": "Write 4-5 sentences arguing FOR or AGAINST: 'Screen time should be limited to one hour per day for children.' Give at least two reasons.",
      "challenge": "Use the word 'because' at least twice in your writing."
    },
    "riddle": {
      "riddle": "I am always in front of you but can never be seen. What am I?"
    },
    "riddleAnswer": {
      "answer": "THE FUTURE",
      "explanation": "The future is always ahead of you (in front) but you can never actually see it — no matter how hard you look! This riddle plays on what 'in front' really means."
    },
    "reflection": {
      "question": "What do you feel most confident about right now? What is something you are still working on?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Telephone!",
      "instructions": "Sit in a line or circle. The teacher whispers a sentence to the first person — it gets whispered down the chain. The last person says it out loud. How different is it from the original? Why does this happen?",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "CREATIVITY",
      "definition": "Creativity means coming up with new ideas or making something original. You do not have to be an artist to be creative — creativity shows up in how you solve problems and how you see the world.",
      "discuss": "What is the most creative thing you have ever made or thought of? What inspired you?"
    },
    "game": {
      "title": "Connections!",
      "howToPlay": "Teacher shows four words. They all have something in common — your job is to find the connection! Compare your answer with a partner before the reveal.",
      "rounds": "Group A: Rain · Rainbow · Umbrella · Puddle\nGroup B: Piano · Guitar · Drum · Violin\nGroup C: January · April · June · September",
      "bonus": "Make up your own Connections group for the class!"
    },
    "grammar": {
      "title": "Identify the Adverb",
      "sentence": "\"The puppy quietly crept under the table and nervously chewed the corner of the mat.\"",
      "instruction": "Write down all the ADVERBS in this sentence. What do they tell us?"
    },
    "grammarTip": "ANSWER: quietly, nervously — adverbs often end in -ly and describe HOW something was done. They modify verbs: crept quietly, chewed nervously. Ask: 'What does each adverb tell us about how the action was done?'",
    "grammarAnswer": {
      "answer": "Adverbs: quietly · nervously",
      "explanation": "An ADVERB describes HOW a verb is done. 'Quietly crept' tells us HOW the puppy crept. 'Nervously chewed' tells us HOW it chewed. Many adverbs end in -ly (but not all!)."
    },
    "spelling": {
      "words": [
        "_ ough",
        "en _ _ gh",
        "thr _ _ gh"
      ],
      "instruction": "All three words are spelled differently but share a vowel pattern. Write them out carefully!",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: cough, enough, through — all have 'ough' but make DIFFERENT sounds! cough (off) · enough (uff) · through (oo). The -ough family: though (oh), thought (aw), rough (uff), cough (off).",
    "spellingAnswer": {
      "answers": [
        "1  cough",
        "2  enough",
        "3  through"
      ],
      "tip": "All use -OUGH but make different sounds!\ncOUGH = 'off' sound\nenOUGH = 'uff' sound\nthrOUGH = 'oo' sound\nOther -ough words: though, thought, rough."
    },
    "word": {
      "word": "hilarious",
      "pos": "adjective",
      "blank": "The comedian was so _____ that people in the audience were crying with laughter.",
      "instruction": "What does HILARIOUS mean? Is it stronger than funny? Write a definition and a sentence."
    },
    "wordTip": "DEFINITION: Extremely funny; causing great laughter. Scale: amusing → funny → hilarious. Ask: 'Think of something you find hilarious. Would everyone agree? Why might people find different things funny?'",
    "wordAnswer": {
      "definition": "Extremely funny; causing a lot of laughter.",
      "example": "The video of the cat falling off the chair was absolutely hilarious — we watched it six times and laughed harder each time."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "7 × 11 = ?",
        "Double 76 = ?",
        "300 − 148 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 77, 152, 152 — 7×11: 7×10=70 plus 7=77. Double 76: double 70=140 double 6=12=152. 300-148: 300-150=150 then +2=152.",
    "mathsAnswer": {
      "answers": [
        "1   7 × 11 = 77",
        "2   Double 76 = 152",
        "3   300 − 148 = 152"
      ],
      "tip": "7×11: 7×10=70, add 7 = 77.\nDouble 76: double 70=140, double 6=12 → 152.\n300−148: 300−150=150, add back 2 = 152."
    },
    "literacy": {
      "type": "Narrative Writing",
      "opener": "\"Nobody thought a ten-year-old could fix it — but I knew I had to try.\"",
      "task": "Write 4-5 sentences about what needed fixing and what you did. Was it a machine, a friendship, a problem at school?",
      "challenge": "Show how you felt through your ACTIONS, not just by saying 'I was nervous'."
    },
    "riddle": {
      "riddle": "I start with E, I end with E, and I have only one letter inside me. What am I?"
    },
    "riddleAnswer": {
      "answer": "AN ENVELOPE",
      "explanation": "An envelope starts with the letter E, ends with the letter E — and contains one letter (the letter inside the envelope)! This riddle is a great example of how words can have double meanings."
    },
    "reflection": {
      "question": "What is the most creative way you have solved a problem recently? What made you think of it?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Speed Friend!",
      "instructions": "You have 90 seconds to find THREE things you have in common with your partner — things that are NOT about school. ('We both hate broccoli / we were both born in winter / we both have more than one sibling.') GO!",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "GRATITUDE",
      "definition": "Gratitude means noticing and appreciating the good things in your life. Research shows that people who practise gratitude regularly are happier and have stronger relationships.",
      "discuss": "What is something in your life that you often take for granted? What would life be like without it?"
    },
    "game": {
      "title": "Who Am I?",
      "howToPlay": "A sticky note (real or imaginary) is on your forehead with a famous person or character. Ask YES or NO questions to figure out who you are! Walk around and ask one question per person.",
      "rounds": "Questions to try:\nAre you real or fictional?\nAre you alive today?\nAre you from Australia?\nAre you famous for sport?",
      "bonus": "Who figured it out first? What was their best question?"
    },
    "grammar": {
      "title": "Active or Passive Voice?",
      "sentence": "\"The ball was kicked by the goalkeeper into the back of the net.\"",
      "instruction": "Is this ACTIVE or PASSIVE? Rewrite it in the other voice. Which sounds better?"
    },
    "grammarTip": "ANSWER: PASSIVE (the ball receives the action). Active version: 'The goalkeeper kicked the ball into the back of the net.' Active is usually more direct and punchy. Passive is useful when we don't know who did it.",
    "grammarAnswer": {
      "answer": "PASSIVE → Active: 'The goalkeeper kicked the ball into the back of the net.'",
      "explanation": "PASSIVE: the thing receiving the action comes first ('the ball was kicked').\nACTIVE: the person doing the action comes first ('the goalkeeper kicked').\nActive voice is usually clearer and more exciting in storytelling."
    },
    "spelling": {
      "words": [
        "wh _ _ ther",
        "w _ _ ther",
        "wh _ ther"
      ],
      "instruction": "These three words sound similar but mean very different things. Write them correctly and think about what each one means.",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: whether, weather, wether — whether (if/choice) · weather (climate) · wether (a castrated sheep). Most students only need whether and weather. Memory: wEATher has EAT in it — eat outside in nice weather!",
    "spellingAnswer": {
      "answers": [
        "1  whether",
        "2  weather",
        "3  wether"
      ],
      "tip": "WHEther = if/choice ('I don't know whether to go')\nwEATher = climate (has EAT inside!)\nwether = a specific type of sheep (rarely used!)"
    },
    "word": {
      "word": "courageous",
      "pos": "adjective",
      "blank": "The _____ firefighter ran into the burning building without hesitating to save the trapped family.",
      "instruction": "What does COURAGEOUS mean? How is it different from fearless?"
    },
    "wordTip": "DEFINITION: Having or showing courage; brave in the face of danger. Key distinction: fearless = no fear. Courageous = feeling fear but acting anyway. Ask: 'Can someone be scared and courageous at the same time? Yes!'",
    "wordAnswer": {
      "definition": "Showing bravery and courage, especially in the face of danger or difficulty.",
      "example": "It was courageous of her to stand up and speak the truth in front of the whole school, even though her voice was shaking."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "8 × 12 = ?",
        "10% of 350 = ?",
        "88 − 55 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 96, 35, 33 — 8×12: 8×10=80 plus 16=96. 10%: divide by 10=35. 88-55: 80-50=30 plus 8-5=3=33.",
    "mathsAnswer": {
      "answers": [
        "1   8 × 12 = 96",
        "2   10% of 350 = 35",
        "3   88 − 55 = 33"
      ],
      "tip": "8×12: 8×10=80, add 8×2=16 → 96.\n10% = divide by 10: 350 ÷ 10 = 35.\n88−55: 80−50=30, 8−5=3, total = 33."
    },
    "literacy": {
      "type": "Descriptive Writing",
      "opener": "",
      "task": "Describe a character who is KIND without using the words kind, nice, or good. Show their kindness through actions and details in 4-5 sentences.",
      "challenge": "Include at least one piece of dialogue — something the character says out loud."
    },
    "riddle": {
      "riddle": "I run but have no legs. I have a mouth but never talk. I have a bed but never sleep. What am I?"
    },
    "riddleAnswer": {
      "answer": "A RIVER",
      "explanation": "A river 'runs' (flows). It has a 'mouth' — where it meets the sea. And it has a 'bed' — the bottom of the river. This riddle uses three different double meanings at once!"
    },
    "reflection": {
      "question": "What are THREE good things that happened this week, big or small? Share one with the class.",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Rapid Fire!",
      "instructions": "Partner A asks a question. Partner B answers with the FIRST word that comes to mind — no thinking! Keep going for 45 seconds, then swap. Questions: Favourite animal? Best holiday? Favourite sound? Scariest thing?",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "PATIENCE",
      "definition": "Patience means staying calm when things take longer than expected or when others need more time. It is a form of kindness — to others AND to yourself.",
      "discuss": "What is something that tests your patience? What helps you stay calm when you feel impatient?"
    },
    "game": {
      "title": "Picture in My Head!",
      "howToPlay": "Teacher describes a scene using only words — no pictures shown. Students draw what they imagine. Compare drawings at the end — were they similar or totally different?",
      "rounds": "Scene: 'A small red house on a hill, with a yellow door and a large tree on the left side. There is a cloud above the house and a dog sitting outside the door.'",
      "bonus": "Why are all the drawings different even though everyone heard the same words?"
    },
    "grammar": {
      "title": "Rewrite in Past Tense",
      "sentence": "\"Every morning, Jake runs to the park, climbs the big tree, and sits at the top until it is time for school.\"",
      "instruction": "Rewrite this sentence in the PAST TENSE. You need to change three verbs."
    },
    "grammarTip": "ANSWER: Every morning, Jake ran to the park, climbed the big tree, and sat at the top until it was time for school. — ran/climbed/sat/was are all past tense. Note 'sat' not 'sitted' — irregular verb!",
    "grammarAnswer": {
      "answer": "Every morning, Jake ran to the park, climbed the big tree, and sat at the top until it was time for school.",
      "explanation": "VERB CHANGES: runs → ran · climbs → climbed · sits → sat · is → was.\n'Sat' is the past tense of 'sit' — it's irregular (not 'sitted')."
    },
    "spelling": {
      "words": [
        "s _ rp _ _ se",
        "p _ rh _ ps",
        "ex _ _ _ ment"
      ],
      "instruction": "Three commonly misspelled words. Write them carefully — say them in syllables first!",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: surprise, perhaps, experiment — surPRISE · perHAPS · exPERiment. Already used on day 8! If repeated, swap for: language, necessary, February.",
    "spellingAnswer": {
      "answers": [
        "1  surprise",
        "2  perhaps",
        "3  experiment"
      ],
      "tip": "surPRISE · perHAPS · exPERiment\nSay each in syllables before writing."
    },
    "word": {
      "word": "optimistic",
      "pos": "adjective",
      "blank": "Even after losing the first two games of the season, the team stayed _____ and believed they could still make the finals.",
      "instruction": "What does OPTIMISTIC mean? What is the opposite? Write a definition."
    },
    "wordTip": "DEFINITION: Hopeful and confident about the future; tending to expect good things. Opposite: pessimistic. Ask: 'Is it more helpful to be optimistic or realistic? Can you be both?'",
    "wordAnswer": {
      "definition": "Having a positive outlook; expecting good things to happen and believing the future will be good.",
      "example": "He was so optimistic that even when the campsite flooded, he suggested they try kayaking to the car park instead."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "7 × 12 = ?",
        "10% of 450 = ?",
        "174 − 96 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 84, 45, 78 — 7×12: 7×10=70 plus 14=84. 10%: 450÷10=45. 174-96: 174-100=74 then +4=78.",
    "mathsAnswer": {
      "answers": [
        "1   7 × 12 = 84",
        "2   10% of 450 = 45",
        "3   174 − 96 = 78"
      ],
      "tip": "7×12: 7×10=70, add 7×2=14 → 84.\n10% = divide by 10: 450 ÷ 10 = 45.\n174−96: 174−100=74, add back 4 = 78."
    },
    "literacy": {
      "type": "Creative Writing",
      "opener": "\"I found an old photograph in a library book. The people in it were clearly looking at a camera that had not been invented yet.\"",
      "task": "Write 4-5 sentences. Who are the people? What does the picture show? What does it mean?",
      "challenge": "End your story with a sentence that gives the reader chills."
    },
    "riddle": {
      "riddle": "I have no beginning, middle, or end. What am I?"
    },
    "riddleAnswer": {
      "answer": "A CIRCLE (or a RING)",
      "explanation": "A circle or ring has no beginning, middle, or end — it just keeps going round and round forever with no clear starting point. This riddle is about shapes and the nature of infinity!"
    },
    "reflection": {
      "question": "Who in your life shows a lot of patience? What can you learn from them?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Guess the Emotion!",
      "instructions": "Act out an emotion using ONLY your face — no body movements, no sounds! Your partner guesses the emotion. Keep going for 60 seconds, swapping after each correct guess. How many can you get?",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "INTEGRITY",
      "definition": "Integrity means doing the right thing even when nobody is watching. It means your actions match your words — you are the same person whether or not someone is judging you.",
      "discuss": "Think of a time you did something right even though nobody would have known if you had not. How did it feel?"
    },
    "game": {
      "title": "First Letters!",
      "howToPlay": "Teacher chooses a letter. In 60 seconds, write as many words as you can that start with that letter in a given category. Unique answers get double points!",
      "rounds": "Round 1: Letter S — Animals\nRound 2: Letter B — Foods\nRound 3: Letter P — Places in Australia\nRound 4: Letter M — Things in a school",
      "bonus": "Who had the most surprising answers?"
    },
    "grammar": {
      "title": "Choose the Right Word: there / their / they're",
      "sentence": "\"___ going to put ___ bags over ___ by the window.\"",
      "instruction": "Write the correct word in each blank. Then write your own sentence that uses all three correctly."
    },
    "grammarTip": "ANSWER: They're / their / there — they're = they are · their = belonging to them · there = a place. Memory: THERE has HERE in it (a place). THEIR has heir — like someone who inherits something.",
    "grammarAnswer": {
      "answer": "THEY'RE going to put THEIR bags over THERE by the window.",
      "explanation": "THEY'RE = they are\nTHEIR = belonging to them\nTHERE = a place (THERE has HERE in it!)"
    },
    "spelling": {
      "words": [
        "rec _ _ ve",
        "bel _ _ ve",
        "ach _ _ ve"
      ],
      "instruction": "Fill in the missing letters — these three words all use the same pattern. Hint: think about the 'i before e' rule.",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: receive, believe, achieve — Rule: i before e except after c (reCEIve has c before, so ei. beLIEve and aCHIEve have no c, so ie). Have students highlight the pattern.",
    "spellingAnswer": {
      "answers": [
        "1  receive",
        "2  believe",
        "3  achieve"
      ],
      "tip": "reCEIve — after C, use EI\nbeLIEve — no C before, use IE\naCHIEve — no C before, use IE\nRule: i before e EXCEPT after c!"
    },
    "word": {
      "word": "persistent",
      "pos": "adjective",
      "blank": "Despite failing three times, the _____ student kept practising until she finally got it right.",
      "instruction": "What does PERSISTENT mean? How is it similar to perseverance? Write a definition."
    },
    "wordTip": "DEFINITION: Continuing to try despite difficulty or opposition; not giving up. Compare: persistent (keeps trying) vs stubborn (refuses to change). Ask: 'Is persistence always a good thing, or can it become stubbornness?'",
    "wordAnswer": {
      "definition": "Continuing to try despite setbacks; determined and not easily giving up.",
      "example": "The persistent young scientist ran the experiment forty-three times before finally discovering the result she was looking for."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "9 × 11 = ?",
        "Half of 170 = ?",
        "57 + 68 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 99, 85, 125 — 9×11: 9×10=90 plus 9=99. Half 170: half 100=50 half 70=35=85. 57+68: 57+70=127 minus 2=125.",
    "mathsAnswer": {
      "answers": [
        "1   9 × 11 = 99",
        "2   Half of 170 = 85",
        "3   57 + 68 = 125"
      ],
      "tip": "9×11: 9×10=90, add 9 = 99.\nHalf of 170: half 100=50, half 70=35 → 85.\n57+68: add 70 (127), subtract 2 = 125."
    },
    "literacy": {
      "type": "Creative Writing",
      "opener": "\"The note on the fridge said: Back in five minutes. That was three days ago.\"",
      "task": "Write 4-5 sentences about who left the note and what happened. Is it funny, mysterious, or worrying?",
      "challenge": "Tell the story from the perspective of someone who found the note."
    },
    "riddle": {
      "riddle": "What gets wetter the more it dries?"
    },
    "riddleAnswer": {
      "answer": "A TOWEL",
      "explanation": "The more a towel dries things, the wetter it gets itself! This riddle seems contradictory at first — but once you picture it, it makes perfect sense."
    },
    "reflection": {
      "question": "What is one thing you wish people at school understood better about you?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Line Up!",
      "instructions": "Without talking, organise yourselves into a line in order of your BIRTHDAY — from earliest in the year to latest. You can only use hand signals and pointing. Ready, set, GO!",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "KINDNESS",
      "definition": "Kindness means choosing to be thoughtful and caring, especially when it is not the easy option. Small acts of kindness can change someone's entire day.",
      "discuss": "What is the most unexpected act of kindness someone has ever shown you? How did it make you feel?"
    },
    "game": {
      "title": "Fortunately, Unfortunately!",
      "howToPlay": "Build a story together — one person says something FORTUNATE, the next says something UNFORTUNATE. Alternate around the room! Try to keep it going as long as possible.",
      "rounds": "Start: 'One morning, a boy found a magic key on his doorstep.'\nNext: 'Fortunately, it opened a door to a wonderful world.'\nNext: 'Unfortunately...' ...keep going!",
      "bonus": "Did the story have a happy or sad ending? Could you change it?"
    },
    "grammar": {
      "title": "Identify the Adjectives",
      "sentence": "\"Three tiny, golden fish swam in the murky, old tank beside the dirty window.\"",
      "instruction": "Write down ALL the adjectives. How many are there? What noun does each one describe?"
    },
    "grammarTip": "ANSWER: three, tiny, golden (fish) · murky, old (tank) · dirty (window) — 6 adjectives total. Note: numbers (three) can act as adjectives when they describe a noun.",
    "grammarAnswer": {
      "answer": "tiny · golden · murky · old · dirty (+ three as a number adjective)",
      "explanation": "Adjectives describe nouns. Each one here tells us something about a noun: tiny/golden fish, murky/old tank, dirty window. Even numbers like 'three' describe the noun (how many fish?)."
    },
    "spelling": {
      "words": [
        "oct _ pus",
        "kn _ wledge",
        "s _ lvage"
      ],
      "instruction": "Three unexpected spelling challenges. Write them in full — look for the hidden tricky part.",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: octopus, knowledge, salvage — ocTOpus (o-c-t-o-p-u-s) · kNOWledge (know + ledge, silent k) · sALvage (sal-vage). Common errors: 'octapus', 'knowlege', 'selvage'.",
    "spellingAnswer": {
      "answers": [
        "1  octopus",
        "2  knowledge",
        "3  salvage"
      ],
      "tip": "ocTOpus — careful with vowels.\nKNOwledge — silent K + 'know' inside.\nsALvage — sal-vage, not sel-vage."
    },
    "word": {
      "word": "gracious",
      "pos": "adjective",
      "blank": "Even after losing the competition, she was _____ and congratulated the winner warmly.",
      "instruction": "What does GRACIOUS mean? Write a definition. How is it different from just being polite?"
    },
    "wordTip": "DEFINITION: Courteous, kind, and pleasant — especially in difficult situations. It implies genuine warmth, not just politeness. Ask: 'Can someone be polite but NOT gracious? What would that look like?'",
    "wordAnswer": {
      "definition": "Behaving in a kind, pleasant, and generous way, especially in a difficult situation.",
      "example": "The gracious host made sure every guest felt welcome and comfortable, even when the party ran much longer than planned."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "7 × 9 = ?",
        "25% of 200 = ?",
        "145 − 78 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 63, 50, 67 — 7×9: 7×10=70 minus 7=63. 25%=quarter: 200÷4=50. 145-78: 145-80=65 then +2=67.",
    "mathsAnswer": {
      "answers": [
        "1   7 × 9 = 63",
        "2   25% of 200 = 50",
        "3   145 − 78 = 67"
      ],
      "tip": "7×9: 7×10=70, subtract 7 = 63.\n25% = divide by 4: 200 ÷ 4 = 50.\n145−78: 145−80=65, add back 2 = 67."
    },
    "literacy": {
      "type": "Descriptive Writing",
      "opener": "",
      "task": "Describe your ideal weekend in 4-5 sentences. Include what you would do, where you would be, who you would be with, and one thing you would eat.",
      "challenge": "Include at least one sentence about how you would FEEL, not just what you would do."
    },
    "riddle": {
      "riddle": "I have four legs in the morning, two legs at noon, and three legs in the evening. What am I?"
    },
    "riddleAnswer": {
      "answer": "A HUMAN BEING",
      "explanation": "This is the famous Riddle of the Sphinx! A baby crawls on all fours (four legs), a grown adult walks on two legs, and an elderly person uses a walking stick (three legs). The 'day' represents a human life!"
    },
    "reflection": {
      "question": "What would you do with your life if you knew you could not fail? Does that tell you anything important?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Today I'm Feeling Like a... WEATHER!",
      "instructions": "Describe how you're feeling today as a weather pattern. ('I'm feeling like a thunderstorm — lots of energy but a bit stormy inside.' / 'I'm a gentle breeze — calm and relaxed.') Share with your partner!",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "RESILIENCE",
      "definition": "Resilience means bouncing back after something goes wrong. Everyone faces setbacks — what matters is not how many times you fall, but how you choose to get back up.",
      "discuss": "What do you do when you are having a really hard day? What actually helps you recover?"
    },
    "game": {
      "title": "Explain It Like I'm Five!",
      "howToPlay": "Teacher gives a complex topic. In pairs, take turns explaining it in the SIMPLEST words possible — as if you're talking to a five-year-old. No jargon allowed!",
      "rounds": "Topic 1: What is gravity?\nTopic 2: How does a rainbow form?\nTopic 3: What is a law?\nTopic 4: What does 'digital' mean?",
      "bonus": "Which explanation was the clearest? What made it work?"
    },
    "grammar": {
      "title": "Compound Sentences",
      "sentence": "\"I wanted to go outside. It was raining.\"",
      "instruction": "Join these two sentences into ONE compound sentence using a CONJUNCTION (and / but / so / because / or). Write THREE different versions."
    },
    "grammarTip": "EXAMPLES: 'I wanted to go outside but it was raining.' / 'It was raining so I couldn't go outside.' / 'I wanted to go outside because I love the rain.' — Each conjunction changes the meaning slightly!",
    "grammarAnswer": {
      "answer": "Option A: 'I wanted to go outside but it was raining.'\nOption B: 'It was raining so I stayed inside.'\nOption C: 'I wanted to go outside, although it was raining.'",
      "explanation": "CONJUNCTIONS join two ideas. Different conjunctions show different relationships: BUT = contrast, SO = result, BECAUSE = reason, ALTHOUGH = exception."
    },
    "spelling": {
      "words": [
        "m _ _ sure",
        "pl _ _ sure",
        "tr _ _ sure"
      ],
      "instruction": "These three words share the same ending pattern. Write them in full — what does the ending sound like?",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: measure, pleasure, treasure — all end in -SURE but the 's' makes a 'zh' sound (like in vision). meaSURE · pleaSURE · treaSURE. Have students say them aloud and notice the soft 'zh' sound.",
    "spellingAnswer": {
      "answers": [
        "1  measure",
        "2  pleasure",
        "3  treasure"
      ],
      "tip": "All end in -SURE with a soft 'zh' sound!\nmeaSURE · pleaSURE · treaSURE\nOther -sure words: leisure, enclosure."
    },
    "word": {
      "word": "vivid",
      "pos": "adjective",
      "blank": "She had such a _____ memory of the day that she could still smell the pine trees and feel the cold breeze.",
      "instruction": "What does VIVID mean? Write a definition. Can it describe things other than memories?"
    },
    "wordTip": "DEFINITION: Very clear, bright, and detailed; producing strong mental images or feelings. Can describe colours (vivid red), dreams, memories, descriptions. Ask: 'What is the most vivid memory you have?'",
    "wordAnswer": {
      "definition": "Very clear, bright, and detailed; producing strong mental images or feelings.",
      "example": "The painting used such vivid colours that it almost looked like a window into another world rather than a canvas."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "9 × 12 = ?",
        "Half of 250 = ?",
        "83 + 69 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 108, 125, 152 — 9×12: 10×12=120 minus 12=108. Half 250: half 200=100 half 50=25=125. 83+69: 83+70=153 minus 1=152.",
    "mathsAnswer": {
      "answers": [
        "1   9 × 12 = 108",
        "2   Half of 250 = 125",
        "3   83 + 69 = 152"
      ],
      "tip": "9×12: 10×12=120, subtract 12 = 108.\nHalf of 250: half 200=100, half 50=25 → 125.\n83+69: add 70 (153), subtract 1 = 152."
    },
    "literacy": {
      "type": "Narrative Writing",
      "opener": "\"The school bus had been driving for two hours. Nobody knew where it was going.\"",
      "task": "Write 4-5 sentences. Where did the bus end up? What did the students do when they arrived?",
      "challenge": "Include DIALOGUE — at least one line that someone says out loud."
    },
    "riddle": {
      "riddle": "What has one eye but cannot see?"
    },
    "riddleAnswer": {
      "answer": "A NEEDLE",
      "explanation": "A sewing needle has one 'eye' — the hole at the top that you thread the cotton through. Of course it cannot actually see! A classic riddle using the word 'eye' in an unexpected way."
    },
    "reflection": {
      "question": "What is one thing that has been hard this week? What did you do (or could you do) to get through it?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "True or False: Teacher Edition!",
      "instructions": "The teacher shares three 'facts' about themselves — two are true, one is totally made up. The class votes on which is the lie. Then the teacher reveals the answer!",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "RESPECT",
      "definition": "Respect is shown in how we listen, how we speak, and how we treat others' belongings and ideas. Respect does not mean agreeing with everyone — it means treating everyone with dignity.",
      "discuss": "What does DISRESPECT look like in a classroom? What is one specific thing we could all do better?"
    },
    "game": {
      "title": "20 Questions!",
      "howToPlay": "One student (or the teacher) thinks of a famous animal, person, or object. The class has exactly 20 yes/no questions to figure out what it is. Keep a tally on the board!",
      "rounds": "Round 1: Teacher thinks of something.\nRound 2: Volunteer thinks of something.\nTip: Start with categories (Is it alive? Is it real? Is it a person?) before getting specific.",
      "bonus": "Did the class guess it? Which question was the most useful?"
    },
    "grammar": {
      "title": "Expand the Sentence",
      "sentence": "\"The dog ran.\"",
      "instruction": "This is a correct but boring sentence. Rewrite it by adding adjectives, adverbs, and other details. Try to make it at least 15 words long!"
    },
    "grammarTip": "EXAMPLE: 'The enormous, muddy dog ran wildly across the freshly mown lawn, barking at a startled pigeon.' — Teach students to ask: WHAT kind? HOW? WHERE? WHEN? WHY? Each question adds detail.",
    "grammarAnswer": {
      "answer": "Example: 'The enormous, muddy dog ran wildly across the freshly mown lawn, knocking over the garden chairs.'",
      "explanation": "Add adjectives (WHAT KIND of dog?), adverbs (HOW did it run?), and a prepositional phrase (WHERE did it run?). Any answer is correct if it expands the sentence meaningfully."
    },
    "spelling": {
      "words": [
        "rel _ _ ant",
        "import _ _ t",
        "differ _ _ t"
      ],
      "instruction": "Write each word in full. The endings are tricky — -ant or -ent?",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: relevant, important, different — relEVANT (-ant ending) · impORTant (-ant ending) · diffERENT (-ent ending). No simple rule for -ant vs -ent — these must be memorised.",
    "spellingAnswer": {
      "answers": [
        "1  relevant",
        "2  important",
        "3  different"
      ],
      "tip": "relEVANT — ends in -ant\nimpORTant — ends in -ant\ndiffERENT — ends in -ent\nThese endings must be learned by memory!"
    },
    "word": {
      "word": "observant",
      "pos": "adjective",
      "blank": "The _____ detective noticed the small smudge on the window that everyone else had completely missed.",
      "instruction": "What does OBSERVANT mean? Write a definition. How could being observant help you in real life?"
    },
    "wordTip": "DEFINITION: Quick to notice and pay attention to details. Noun: observation. Ask: 'What is something observant people notice that others miss? Can you train yourself to be more observant?'",
    "wordAnswer": {
      "definition": "Good at noticing details that others might miss; paying close attention to what is around you.",
      "example": "An observant student noticed the pattern in the numbers before anyone else in the class had even started working."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "9 × 8 = ?",
        "50% of 130 = ?",
        "163 − 85 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 72, 65, 78 — 9×8: 10×8=80 minus 8=72. 50%=half: 130÷2=65. 163-85: 163-90=73 then +5=78.",
    "mathsAnswer": {
      "answers": [
        "1   9 × 8 = 72",
        "2   50% of 130 = 65",
        "3   163 − 85 = 78"
      ],
      "tip": "9×8: 10×8=80, subtract 8 = 72.\n50% = half: 130 ÷ 2 = 65.\n163−85: 163−90=73, add back 5 = 78."
    },
    "literacy": {
      "type": "Persuasive Writing",
      "opener": "",
      "task": "Write 4-5 sentences arguing your view: Should all students be required to learn a musical instrument? Give at least two reasons.",
      "challenge": "Use an example or a statistic to support one of your reasons."
    },
    "riddle": {
      "riddle": "What can you catch but never throw?"
    },
    "riddleAnswer": {
      "answer": "A COLD",
      "explanation": "You can 'catch' a cold (a common illness) — but you certainly cannot throw a cold at someone! This riddle uses the word 'catch' in two very different ways, which is what makes it clever."
    },
    "reflection": {
      "question": "How do you show respect to people you disagree with? What does that actually look like?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Four Corners!",
      "instructions": "Teacher labels four corners: STRONGLY AGREE · AGREE · DISAGREE · STRONGLY DISAGREE. Teacher reads a statement — move to the corner that matches your view. Be ready to explain in ONE sentence!",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "LEADERSHIP",
      "definition": "Leadership is not about being the loudest or the boss. Real leadership means taking initiative, supporting others, and making decisions that help the whole group — not just yourself.",
      "discuss": "Think of a leader you admire. What do they DO that makes them a good leader? Could you develop any of those qualities?"
    },
    "game": {
      "title": "Backwards Alphabet!",
      "howToPlay": "Can the class say the alphabet backwards in under 60 seconds? Practise in pairs first, then the whole class tries together. Bonus: try saying the months of the year backwards!",
      "rounds": "Round 1: Alphabet backwards — Z, Y, X, W...\nRound 2: Months backwards — December, November...\nRound 3: Days of the week backwards — Sunday, Saturday...",
      "bonus": "Which one was hardest? Why do you think that is?"
    },
    "grammar": {
      "title": "Fix the Verb Tense",
      "sentence": "\"Yesterday, the class was go to the library and they choose three books each.\"",
      "instruction": "Rewrite this sentence with the correct verb tenses. Clue: what does 'yesterday' tell you?"
    },
    "grammarTip": "ANSWER: Yesterday, the class went to the library and they chose three books each. — 'Yesterday' signals PAST TENSE. 'Was go' is incorrect — past tense of 'go' is 'went'. 'Choose' past tense is 'chose'.",
    "grammarAnswer": {
      "answer": "Yesterday, the class went to the library and they chose three books each.",
      "explanation": "'Yesterday' tells us this is PAST TENSE.\ngo → went (irregular past tense)\nchoose → chose (irregular past tense)\nIrregular verbs don't follow the normal -ed pattern!"
    },
    "spelling": {
      "words": [
        "cov _ _ ing",
        "wr _ pping",
        "tr _ velling"
      ],
      "instruction": "These words have been turned into -ing words. Write them out correctly — watch out for doubled letters!",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: covering, wrapping, travelling — covERING (no double) · wrAPPING (double p — short vowel) · travELLING (double l in Australian English). Rule: double the consonant before -ing if the vowel is short.",
    "spellingAnswer": {
      "answers": [
        "1  covering",
        "2  wrapping",
        "3  travelling"
      ],
      "tip": "covERING — no doubling needed (long vowel)\nwrAPPING — double p (short vowel 'a')\ntravELLING — double l in Australian English"
    },
    "word": {
      "word": "compassionate",
      "pos": "adjective",
      "blank": "The _____ nurse spent extra time with patients who had no visitors, making sure they never felt alone.",
      "instruction": "What does COMPASSIONATE mean? How is it similar to empathy? Write a definition."
    },
    "wordTip": "DEFINITION: Feeling concern and care for people who are suffering; genuinely caring about people in pain and wanting to help. Compare: empathy (feeling with) vs compassion (feeling for + wanting to help).",
    "wordAnswer": {
      "definition": "Feeling concern and care for people who are suffering, and wanting to help them.",
      "example": "The compassionate teacher noticed that one student had been quiet all week and quietly stayed back to check everything was okay."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "12 × 8 = ?",
        "Quarter of 180 = ?",
        "96 + 47 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 96, 45, 143 — 12×8: 10×8=80 plus 16=96. Quarter 180: half=90 half again=45. 96+47: 96+50=146 minus 3=143.",
    "mathsAnswer": {
      "answers": [
        "1   12 × 8 = 96",
        "2   Quarter of 180 = 45",
        "3   96 + 47 = 143"
      ],
      "tip": "12×8: 10×8=80, add 2×8=16 → 96.\nQuarter of 180: half=90, half again = 45.\n96+47: add 50 (146), subtract 3 = 143."
    },
    "literacy": {
      "type": "Creative Writing",
      "opener": "\"The last page of the book said: This is where you come in.\"",
      "task": "Write 4-5 sentences about what happened when you stepped into the story. Where did you land? What did you do first?",
      "challenge": "Include a character from a real book, film, or story you know."
    },
    "riddle": {
      "riddle": "The more you take away from me, the bigger I become. What am I?"
    },
    "riddleAnswer": {
      "answer": "A HOLE",
      "explanation": "The more material you dig out or take away from a hole, the bigger and deeper the hole becomes! It's the opposite of most things — usually taking away makes something smaller."
    },
    "reflection": {
      "question": "What makes a good leader? Do you show any of those qualities? Be honest!",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "The Numbers Game!",
      "instructions": "Teacher calls out a number (e.g. 4). Students must quickly form groups of EXACTLY that size. Anyone left over comes to the middle and does a quick challenge. Repeat with different numbers!",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "CURIOSITY",
      "definition": "Curiosity means wanting to know more — asking questions, exploring ideas, and not being satisfied with 'I don't know.' Curious people never stop learning.",
      "discuss": "What is something you are genuinely curious about — something you wonder about that does not have an easy answer?"
    },
    "game": {
      "title": "Beat the Teacher!",
      "howToPlay": "Teacher shares three 'facts' about any topic. Students have 90 seconds to write down which one they think is false. If the majority of the class is right, the class wins!",
      "rounds": "Set A: 1) A snail can sleep for 3 years. 2) Bananas are berries. 3) The sun is cold.\nSet B: 1) Octopuses have three hearts. 2) Honey expires after 100 years. 3) A group of crows is called a murder.",
      "bonus": "Which fact surprised you most? Can you add one to the next set?"
    },
    "grammar": {
      "title": "Identify Figurative Language",
      "sentence": "\"The moon was a silver coin dropped in a velvet sky. Stars blinked like distant lighthouses warning the lost ships of the deep.\"",
      "instruction": "Find ONE simile and ONE metaphor. Write them out and label them."
    },
    "grammarTip": "ANSWERS: Metaphor: 'The moon was a silver coin' · Simile: 'like distant lighthouses'. Ask students to explain what each comparison means — what does it make us picture?",
    "grammarAnswer": {
      "answer": "Metaphor: 'The moon was a silver coin dropped in a velvet sky'\nSimile: 'like distant lighthouses warning the lost ships'",
      "explanation": "METAPHOR: the moon IS a silver coin (direct comparison, no like/as).\nSIMILE: stars blinked LIKE lighthouses (uses 'like' to compare).\nBoth create vivid pictures in the reader's mind."
    },
    "spelling": {
      "words": [
        "priv _ _ ege",
        "aut _ _ rity",
        "comm _ _ ity"
      ],
      "instruction": "These three long words are often misspelled. Take your time — write them out carefully.",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: privilege, authority, community — priVILege (not privi-LEDGE) · auTHORity (author + ity) · comMUnity (com + mun + ity). Common errors: 'privelege', 'athority', 'comunity'.",
    "spellingAnswer": {
      "answers": [
        "1  privilege",
        "2  authority",
        "3  community"
      ],
      "tip": "priVILege — not 'privelege'!\nauTHORity — AUTHOR is hiding inside!\ncomMUnity — com-mu-ni-ty, four syllables."
    },
    "word": {
      "word": "extraordinary",
      "pos": "adjective",
      "blank": "For an ordinary Tuesday, it turned out to be quite an _____ day — by lunch there were three goats in the car park.",
      "instruction": "What does EXTRAORDINARY mean? Break the word into parts — can you see the meaning?"
    },
    "wordTip": "DEFINITION: Very unusual and remarkable; beyond what is ordinary. Break it: extra (beyond) + ordinary = beyond ordinary. Ask: 'What would make today extraordinary for you?'",
    "wordAnswer": {
      "definition": "Very unusual and surprising; going far beyond what is normal or ordinary.",
      "example": "Finding a hand-written letter from 1943 buried in the garden wall was extraordinary — it changed everything the family thought they knew."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "8 × 11 = ?",
        "75% of 60 = ?",
        "127 + 56 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 88, 45, 183 — 8×11: 8×10=80 plus 8=88. 75%=¾: 60÷4=15 ×3=45. 127+56: 127+60=187 minus 4=183.",
    "mathsAnswer": {
      "answers": [
        "1   8 × 11 = 88",
        "2   75% of 60 = 45",
        "3   127 + 56 = 183"
      ],
      "tip": "8×11: 8×10=80, add 8 = 88.\n75% = ¾: 60÷4=15, ×3 = 45.\n127+56: add 60 (187), subtract 4 = 183."
    },
    "literacy": {
      "type": "Descriptive Writing",
      "opener": "",
      "task": "Describe the most interesting person you have ever met (real or made up) in 4-5 sentences. What made them stand out?",
      "challenge": "Describe them through their ACTIONS and WORDS — not just their appearance."
    },
    "riddle": {
      "riddle": "I am not alive, but I can grow. I have no mouth, but water kills me. What am I?"
    },
    "riddleAnswer": {
      "answer": "FIRE",
      "explanation": "Fire 'grows' and spreads — but it is not alive. It cannot drink water — and water puts it out instantly."
    },
    "reflection": {
      "question": "What is the most interesting question you have thought of recently? Does it have an answer, or is it still open?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "That's a Record!",
      "instructions": "Try to beat these challenges in 60 seconds: Who can write the most words starting with 'S'? Who can name the most countries? Who can think of the most words that rhyme with 'cat'? GO!",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "GROWTH MINDSET",
      "definition": "A growth mindset means believing your brain can get smarter with effort and practice. When you struggle with something, instead of 'I can't do this', try: 'I can't do this YET.'",
      "discuss": "Think of something you couldn't do a year ago that you can do now. What changed? What does that tell you about what you can learn next?"
    },
    "game": {
      "title": "If I Were a...!",
      "howToPlay": "Teacher says a category. Each person completes the sentence 'If I were a ___, I would be ___ because ___.' Share with your partner, then one person shares with the class.",
      "rounds": "Round 1: If I were a COLOUR, I would be...\nRound 2: If I were a TYPE OF WEATHER, I would be...\nRound 3: If I were a PIECE OF FURNITURE, I would be...\nRound 4: If I were a SCHOOL SUBJECT, I would be...",
      "bonus": "Which answer surprised you? Which one perfectly matched the person?"
    },
    "grammar": {
      "title": "Join with a Conjunction",
      "sentence": "\"I wanted to go outside. It was raining.\"",
      "instruction": "Join these into ONE compound sentence using EACH of these conjunctions: but / so / because. Write three different versions."
    },
    "grammarTip": "EXAMPLES: 'I wanted to go outside but it was raining.' / 'It was raining so I stayed inside.' / 'I wanted to go outside because I love being in the rain.' — Each conjunction changes the relationship between the ideas.",
    "grammarAnswer": {
      "answer": "With BUT: 'I wanted to go outside but it was raining.'\nWith SO: 'It was raining so I stayed inside.'\nWith BECAUSE: 'I wanted to go outside because I needed fresh air.'",
      "explanation": "BUT = contrast · SO = result · BECAUSE = reason. Different conjunctions show different relationships between ideas."
    },
    "spelling": {
      "words": [
        "m _ _ sure",
        "pl _ _ sure",
        "tr _ _ sure"
      ],
      "instruction": "These three words share the same ending pattern. Write them correctly!",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: measure, pleasure, treasure — already used day 18! If repeated, use: language, necessary, February.",
    "spellingAnswer": {
      "answers": [
        "1  measure",
        "2  pleasure",
        "3  treasure"
      ],
      "tip": "meaSURE · pleaSURE · treaSURE\nAll end in -SURE with a soft 'zh' sound."
    },
    "word": {
      "word": "vivid",
      "pos": "adjective",
      "blank": "The artist used _____ colours in her painting — every shade seemed to glow from the canvas.",
      "instruction": "What does VIVID mean? Write a definition and your own sentence. Already used on day 18 — can you remember the meaning?"
    },
    "wordTip": "DEFINITION: Very clear, bright, and detailed; producing strong mental images. Repeated word — use as a review. Ask: 'Can you use vivid in a sentence about a sound or a smell, not just a colour?'",
    "wordAnswer": {
      "definition": "Very clear, bright, and detailed; producing strong mental images or feelings.",
      "example": "His vivid description of the street market made everyone in the class feel as if they were there."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "9 × 9 = ?",
        "Half of 86 = ?",
        "204 + 97 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 81, 43, 301 — 9×9: 9×10=90 minus 9=81. Half 86: half 80=40 half 6=3=43. 204+97: 204+100=304 minus 3=301.",
    "mathsAnswer": {
      "answers": [
        "1   9 × 9 = 81",
        "2   Half of 86 = 43",
        "3   204 + 97 = 301"
      ],
      "tip": "9×9: 9×10=90, subtract 9 = 81.\nHalf of 86: half 80=40, half 6=3 → 43.\n204+97: add 100 (304), subtract 3 = 301."
    },
    "literacy": {
      "type": "Narrative Writing",
      "opener": "\"The school bus had been driving for two hours. Nobody knew where it was going.\"",
      "task": "Write 4-5 sentences. Where did the bus end up? What did the students do when they arrived?",
      "challenge": "Include DIALOGUE — at least one line that someone says out loud."
    },
    "riddle": {
      "riddle": "What has keys but no locks, space but no room, and you can enter but not go inside?"
    },
    "riddleAnswer": {
      "answer": "A KEYBOARD",
      "explanation": "A keyboard has keys (but no locks), has a space bar (but no room), and you can press Enter (but you cannot physically go inside!). Technology vocabulary with double meanings."
    },
    "reflection": {
      "question": "What is one skill you want to develop this year? What is your plan to get better at it?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Rapid Fire Questions!",
      "instructions": "Partner A asks a question. Partner B answers with the FIRST word that comes to mind — no thinking! Keep going for 45 seconds, then swap. Questions: Favourite animal? Best holiday? Favourite sound? Scariest thing?",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "PATIENCE",
      "definition": "Patience means staying calm when things take longer than you want or when you have to wait. It is a form of respect — for other people's time and pace.",
      "discuss": "What is something that tests your patience most? What is one thing that actually helps you stay calm?"
    },
    "game": {
      "title": "Picture Drawing!",
      "howToPlay": "Teacher describes a scene. Students draw what they imagine. Compare drawings — were they similar or very different?",
      "rounds": "Scene: 'A wide river with a wooden bridge. Two people are standing on the bridge looking at a boat below. There are mountains in the background and a bird flying overhead.'",
      "bonus": "Why do all the drawings look different even though everyone heard the same description?"
    },
    "grammar": {
      "title": "Rewrite in Past Tense",
      "sentence": "\"Every morning, she runs to school, buys a snack, and reads for ten minutes before class starts.\"",
      "instruction": "Rewrite this sentence in the PAST TENSE. How many verbs did you change?"
    },
    "grammarTip": "ANSWER: Every morning, she ran to school, bought a snack, and read for ten minutes before class started. — ran/bought/read/started are all past tense. Note: 'read' past tense is also spelled 'read' (different pronunciation)!",
    "grammarAnswer": {
      "answer": "Every morning, she ran to school, bought a snack, and read for ten minutes before class started.",
      "explanation": "VERB CHANGES: runs → ran · buys → bought · reads → read · starts → started.\nNote: 'read' past tense looks the same but is pronounced 'red'!"
    },
    "spelling": {
      "words": [
        "fam _ _ iar",
        "pecu _ _ ar",
        "reg _ _ ar"
      ],
      "instruction": "These three words all end in the same letters. Write them correctly!",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: familiar, peculiar, regular — famILIar · pecULIar · regULar — all end in -lar or -liar. Common errors: 'familier', 'peculier', 'reguler'.",
    "spellingAnswer": {
      "answers": [
        "1  familiar",
        "2  peculiar",
        "3  regular"
      ],
      "tip": "famILIAR — ends in -iar\npecULIAR — ends in -iar\nregULAR — ends in -ar\nAll have -ul- or -il- in the middle."
    },
    "word": {
      "word": "sincere",
      "pos": "adjective",
      "blank": "When she said thank you, everyone could tell she was being truly _____ — it came straight from the heart.",
      "instruction": "What does SINCERE mean? Write a definition. What is the opposite of sincere?"
    },
    "wordTip": "DEFINITION: Genuine; meaning what you say; not pretending or putting on an act. Opposite: insincere, fake. Ask: 'Can you tell when someone is being sincere? What gives it away?'",
    "wordAnswer": {
      "definition": "Genuine and honest; truly meaning what you say or feel, without pretending.",
      "example": "His sincere apology made all the difference — everyone could tell he truly regretted what had happened."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "11 × 11 = ?",
        "25% of 160 = ?",
        "248 − 119 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 121, 40, 129 — 11×11: 11×10=110 plus 11=121. 25%=quarter: 160÷4=40. 248-119: 248-120=128 then +1=129.",
    "mathsAnswer": {
      "answers": [
        "1   11 × 11 = 121",
        "2   25% of 160 = 40",
        "3   248 − 119 = 129"
      ],
      "tip": "11×11: 11×10=110, add 11 = 121.\n25% = divide by 4: 160 ÷ 4 = 40.\n248−119: 248−120=128, add back 1 = 129."
    },
    "literacy": {
      "type": "Descriptive Writing",
      "opener": "",
      "task": "Describe your favourite season in 4-5 sentences. Use at least three different senses and include ONE piece of figurative language.",
      "challenge": "Write one sentence that captures the FEELING of the season — not just what it looks like."
    },
    "riddle": {
      "riddle": "I have keys but no locks. I have space but no room. You can enter but you cannot go inside. What am I?"
    },
    "riddleAnswer": {
      "answer": "A KEYBOARD",
      "explanation": "A keyboard has keys (but no locks), has a space bar (but no room), and you can press Enter (but you cannot physically go inside!)"
    },
    "reflection": {
      "question": "What is something you said you would do but have not done yet? What is stopping you?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Positive Post-it!",
      "instructions": "Think of one genuinely nice thing about the person to your left. Write it down (or say it out loud). Make it specific — not just 'you are nice' but WHY you think so. Share!",
      "time": "2 minutes — GO!"
    },
    "value": {
      "name": "HONESTY",
      "definition": "Honesty is not just about avoiding lies. It is also about having the courage to share your real opinion, admit when you are wrong, and say things clearly — even when it is uncomfortable.",
      "discuss": "Is it ever right to tell a white lie to protect someone's feelings? What are the risks of doing that?"
    },
    "game": {
      "title": "Category Elimination!",
      "howToPlay": "Name one item in the category — but you cannot repeat what someone else said! If you pause more than 5 seconds or repeat, you are out. Last person standing wins!",
      "rounds": "Category 1: FRUITS\nCategory 2: Things you find at the BEACH\nCategory 3: Words that mean HAPPY\nCategory 4: JOBS that help people",
      "bonus": "Which category ran out fastest? Why?"
    },
    "grammar": {
      "title": "Question or Statement?",
      "sentence": "\"Can you believe the librarian has read every book in the library. The new student had visited seventeen countries. Is that even possible.\"",
      "instruction": "Add the correct end punctuation to each sentence. Then explain how you decided."
    },
    "grammarTip": "ANSWERS: '...the library?' (question) · '...seventeen countries.' (statement) · 'Is that even possible?' (question). Questions ask something, statements tell something.",
    "grammarAnswer": {
      "answer": "'Can you believe the librarian has read every book in the library?'\n'The new student had visited seventeen countries.'\n'Is that even possible?'",
      "explanation": "Questions end with ? — they ask something.\nStatements end with . — they tell us something.\nClue: does the sentence ask or tell?"
    },
    "spelling": {
      "words": [
        "gu _ _ antee",
        "m _ _ acle",
        "phen _ _ enon"
      ],
      "instruction": "Three very tricky words. Take your time — write each one carefully.",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: guarantee, miracle, phenomenon — guarANTee (3 syllables: guar-an-tee) · mirACle (mir-a-cle) · phenOMenon (4 syllables: phe-nom-e-non). Common errors: 'guarentee', 'miracal', 'phenominon'.",
    "spellingAnswer": {
      "answers": [
        "1  guarantee",
        "2  miracle",
        "3  phenomenon"
      ],
      "tip": "guarANTee — guar-an-tee (3 syllables)\nmirACle — mir-a-cle\nphenOMenon — phe-nom-e-non (4 syllables!)"
    },
    "word": {
      "word": "tranquil",
      "pos": "adjective",
      "blank": "After the storm, the lake became completely _____ — a perfect mirror reflecting the pale morning sky.",
      "instruction": "What does TRANQUIL mean? Write a definition. What is a tranquil place you know?"
    },
    "wordTip": "DEFINITION: Free from disturbance; calm and peaceful. Similar to: serene, still, quiet, peaceful. Ask: 'What is the opposite of tranquil? Can a person be tranquil as well as a place?'",
    "wordAnswer": {
      "definition": "Calm, quiet, and free from disturbance; completely peaceful.",
      "example": "The tranquil garden at the back of the school was where she always went to think when everything else felt too loud."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "6 × 9 = ?",
        "Half of 86 = ?",
        "204 + 97 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 54, 43, 301 — 6×9: 6×10=60 minus 6=54. Half 86: half 80=40 half 6=3=43. 204+97: 204+100=304 minus 3=301.",
    "mathsAnswer": {
      "answers": [
        "1   6 × 9 = 54",
        "2   Half of 86 = 43",
        "3   204 + 97 = 301"
      ],
      "tip": "6×9: 6×10=60, subtract 6 = 54.\nHalf of 86: half 80=40, half 6=3 → 43.\n204+97: add 100 (304), subtract 3 = 301."
    },
    "literacy": {
      "type": "Persuasive Writing",
      "opener": "",
      "task": "Write 4-5 sentences arguing your view: Should mobile phones be banned completely from schools? Give two clear reasons.",
      "challenge": "Acknowledge the OTHER side in one sentence, then explain why your view is still stronger."
    },
    "riddle": {
      "riddle": "What goes up when water comes down?"
    },
    "riddleAnswer": {
      "answer": "AN UMBRELLA",
      "explanation": "When rain (water) comes down, you put your umbrella UP. So the umbrella literally goes up when water comes down!"
    },
    "reflection": {
      "question": "Is there something you have not been fully honest about recently — with yourself or someone else? What would happen if you were?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Shrinking Island!",
      "instructions": "Place a large piece of paper on the floor — everyone stands on it. Fold it in half. Can everyone still fit? Fold again! Keep folding until you literally cannot all fit. Work together!",
      "time": "3 minutes — GO!"
    },
    "value": {
      "name": "COMPASSION",
      "definition": "Compassion means not just understanding that someone is hurting — but actually DOING something to help. It is empathy put into action.",
      "discuss": "Think of a time when you saw someone upset or struggling. What did you do? What could you have done? What stopped you?"
    },
    "game": {
      "title": "Alliteration Name Challenge!",
      "howToPlay": "Introduce yourself with your name and an alliterative adjective + noun: 'I'm Marvellous Matt, the master of maths.' Everyone must remember ALL the names in order!",
      "rounds": "Round 1: Go around the room — each person adds their name to the growing list.\nRound 2: Try to recall everyone's full alliterative introduction!",
      "bonus": "Who had the most creative introduction? Whose was the hardest to remember?"
    },
    "grammar": {
      "title": "Rewrite Without Double Negatives",
      "sentence": "\"I don't want no help from nobody.\"",
      "instruction": "Rewrite this sentence correctly. How many negatives are there? What is wrong with having more than one?"
    },
    "grammarTip": "ANSWER: 'I don't want any help from anybody.' OR 'I want no help from anybody.' — In English, two negatives cancel each other out. 'Don't want no' technically means 'do want'!",
    "grammarAnswer": {
      "answer": "Correct version: 'I don't want any help from anybody.' or 'I want no help from anybody.'",
      "explanation": "A double negative means two 'no' words in one sentence. In standard English, this creates a positive: 'don't want no help' = 'do want help'!\nFix by removing one negative."
    },
    "spelling": {
      "words": [
        "enth _ _ siasm",
        "app _ _ ciate",
        "ach _ _ vement"
      ],
      "instruction": "Three powerful words worth knowing how to spell. Write them all out carefully.",
      "labels": [
        "1",
        "2",
        "3"
      ]
    },
    "spellingTip": "WORDS: enthusiasm, appreciate, achievement — enthUSiasm (4 syllables) · apprECIate (ap-pre-ci-ate) · achIEVEment (achieve + ment). Common errors: 'enthusaism', 'appriciate', 'acheivment'.",
    "spellingAnswer": {
      "answers": [
        "1  enthusiasm",
        "2  appreciate",
        "3  achievement"
      ],
      "tip": "enthUSiasm — en-thu-si-asm (4 syllables!)\napprECIate — ap-pre-ci-ate\nachIEVEment — achieve + ment"
    },
    "word": {
      "word": "humble",
      "pos": "adjective",
      "blank": "Even though she had won five awards, she remained _____ and always thanked her team before herself.",
      "instruction": "What does HUMBLE mean? Is being humble the same as having no confidence?"
    },
    "wordTip": "DEFINITION: Having a modest view of your own importance; not boasting. Discuss: humble (accurate modesty) vs low self-esteem (undervaluing yourself). Can you be confident AND humble? Yes!",
    "wordAnswer": {
      "definition": "Having a realistic, modest view of yourself; not boasting or thinking you are better than others.",
      "example": "The humble champion told the reporter that the whole team deserved the trophy, not just him."
    },
    "maths": {
      "title": "Mental Maths — solve all three!",
      "problems": [
        "12 × 9 = ?",
        "Quarter of 240 = ?",
        "117 + 84 = ?"
      ]
    },
    "mathsTip": "ANSWERS: 108, 60, 201 — 12×9: 10×9=90 plus 18=108. Quarter 240: half=120 half again=60. 117+84: 117+85=202 minus 1=201.",
    "mathsAnswer": {
      "answers": [
        "1   12 × 9 = 108",
        "2   Quarter of 240 = 60",
        "3   117 + 84 = 201"
      ],
      "tip": "12×9: 10×9=90, add 2×9=18 → 108.\nQuarter of 240: half=120, half again = 60.\n117+84: add 85 (202), subtract 1 = 201."
    },
    "literacy": {
      "type": "Creative Writing",
      "opener": "\"I discovered I had a superpower — but it was the most useless one imaginable.\"",
      "task": "Write 4-5 sentences about what your power was. When did you discover it? Did it ever turn out to be useful?",
      "challenge": "Include a moment where your useless power accidentally saves the day."
    },
    "riddle": {
      "riddle": "The more you share me, the more you have. What am I?"
    },
    "riddleAnswer": {
      "answer": "KNOWLEDGE (or LOVE)",
      "explanation": "When you share knowledge with others, you don't lose it — you still have everything you knew. Knowledge grows through sharing. Love works the same way!"
    },
    "reflection": {
      "question": "What is one thing you could do to make someone else's day better this week — without being asked?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Name Tag Mix-Up",
      "instructions": "Write your name on a sticky note and swap with someone else. Try to find your own name!",
      "time": "5 min"
    },
    "value": {
      "name": "Respect",
      "definition": "Treating others the way you would like to be treated.",
      "discuss": "How can you show respect to someone you disagree with?"
    },
    "game": {
      "title": "Would You Rather?",
      "howToPlay": "One partner asks Would You Rather questions. The other guesses what the class will pick.",
      "rounds": "3 rounds",
      "bonus": "Write your own Would You Rather question!"
    },
    "grammar": {
      "title": "Fix the Capitals",
      "sentence": "fix the capitals in this sentence:",
      "instruction": "my dog rex loves swimming at bondi beach every summer."
    },
    "grammarTip": "Proper nouns need capitals: pet names, place names. First word of sentence needs a capital too.",
    "grammarAnswer": {
      "answer": "My dog Rex loves swimming at Bondi Beach every summer.",
      "explanation": "Rex = pet name (proper noun). Bondi Beach = place name. My = starts sentence. All need capitals."
    },
    "spelling": {
      "words": [
        "please",
        "people",
        "different",
        "beautiful",
        "important"
      ],
      "instruction": "Write each word without looking -- common but tricky!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "please not 'pleese'. beautiful not 'beatiful'. important not 'importent'.",
    "spellingAnswer": {
      "answers": [
        "1  please",
        "2  people",
        "3  different",
        "4  beautiful",
        "5  important"
      ],
      "tip": "b-e-a-u-tiful -- say BE A U tiful to remember the tricky middle. One of the most misspelled words!"
    },
    "word": {
      "word": "patient",
      "pos": "adjective",
      "blank": "The doctor was very ___ while she waited for the test results.",
      "instruction": "What does patient mean here? How is it different from 'patient' as a sick person in hospital?"
    },
    "wordTip": "Here patient is an ADJECTIVE. As a noun it means a sick person. Same spelling, different meaning = homograph.",
    "wordAnswer": {
      "definition": "Calm and able to wait without getting upset.",
      "example": "She was patient while waiting in the long queue."
    },
    "maths": {
      "title": "Times Tables Sprint -- 60 seconds!",
      "problems": [
        "8 x 7 = ?",
        "6 x 9 = ?",
        "9 x 8 = ?",
        "7 x 7 = ?",
        "12 x 6 = ?"
      ]
    },
    "mathsTip": "8x7=56. 6x9=54. 9x8=72. 7x7=49. 12x6=72.",
    "mathsAnswer": {
      "answers": [
        "1   56",
        "2   54",
        "3   72",
        "4   49",
        "5   72"
      ],
      "tip": "9x trick: 9x8 -- hold up 8 fingers, fold the 8th down, read 7 and 2 = 72! Great visual strategy."
    },
    "literacy": {
      "type": "Acrostic Poem",
      "opener": "Write an acrostic poem using a season name (SUMMER, WINTER, AUTUMN or SPRING).",
      "task": "Each letter starts a new line about that season.",
      "challenge": "Try to make it rhyme!"
    },
    "riddle": {
      "riddle": "I have hands but can't clap. What am I?"
    },
    "riddleAnswer": {
      "answer": "A clock.",
      "explanation": "Clock hands point to numbers but can't actually clap -- they just go in circles!"
    },
    "reflection": {
      "question": "What is one thing you are looking forward to today?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Two Truths One Lie",
      "instructions": "Share 3 facts about your weekend -- 2 true, 1 false. Class votes on the lie.",
      "time": "5 min"
    },
    "value": {
      "name": "Creativity",
      "definition": "Using your imagination to make or come up with new ideas.",
      "discuss": "When was the last time you came up with a really creative idea?"
    },
    "game": {
      "title": "Story Spine",
      "howToPlay": "Start with 'Once upon a time...' Each student adds one sentence to continue the story.",
      "rounds": "1 round through the class",
      "bonus": "Add a plot twist!"
    },
    "grammar": {
      "title": "Fix the Punctuation",
      "sentence": "This sentence needs punctuation:",
      "instruction": "The cat sat on the mat it was very comfortable"
    },
    "grammarTip": "This is a run-on sentence -- two complete ideas joined without punctuation. Fix with a full stop or comma + conjunction.",
    "grammarAnswer": {
      "answer": "The cat sat on the mat. It was very comfortable.",
      "explanation": "Two separate sentences need a full stop between them. Could also: '...mat, and it was very comfortable.'"
    },
    "spelling": {
      "words": [
        "address",
        "answer",
        "believe",
        "build",
        "caught"
      ],
      "instruction": "Spell each word -- these often trip people up!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Address = double d. Answer = silent w. Believe = i before e. Caught = -aught pattern.",
    "spellingAnswer": {
      "answers": [
        "1  address",
        "2  answer",
        "3  believe",
        "4  build",
        "5  caught"
      ],
      "tip": "Never beLIEve a LIE -- the word LIE is hidden inside BELIEVE! Great trick to remember."
    },
    "word": {
      "word": "curious",
      "pos": "adjective",
      "blank": "The ___ puppy sniffed everything in the garden.",
      "instruction": "What does curious mean? How does it describe the puppy? Can you think of a synonym?"
    },
    "wordTip": "Curious = eager to know or learn. ADJECTIVE describing puppy. Synonyms: inquisitive, nosy, interested.",
    "wordAnswer": {
      "definition": "Wanting to know or learn about something.",
      "example": "The curious student asked lots of questions about how planes fly."
    },
    "maths": {
      "title": "Number Patterns -- what comes next?",
      "problems": [
        "5, 10, 15, 20, ___",
        "3, 6, 12, 24, ___",
        "100, 90, 80, ___",
        "2, 4, 8, 16, ___",
        "1, 4, 9, 16, ___"
      ]
    },
    "mathsTip": "Pattern 1: +5. Pattern 2: x2 (doubling). Pattern 3: -10. Pattern 4: x2. Pattern 5: square numbers.",
    "mathsAnswer": {
      "answers": [
        "1   25",
        "2   48",
        "3   70",
        "4   32",
        "5   25 (square numbers!)"
      ],
      "tip": "Pattern 5 = square numbers: 1,4,9,16,25. What comes after 25? (36 = 6x6). Great extension!"
    },
    "literacy": {
      "type": "Setting Description",
      "opener": "Describe a place using all five senses.",
      "task": "Write at least 3 sentences about what you see, hear, smell, touch and taste.",
      "challenge": "Use a simile somewhere."
    },
    "riddle": {
      "riddle": "The more you take, the more you leave behind. What am I?"
    },
    "riddleAnswer": {
      "answer": "Footsteps.",
      "explanation": "Every step creates a footprint left behind -- but you take the step away with you."
    },
    "reflection": {
      "question": "What is something kind you could do for someone today?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Compliment Chain",
      "instructions": "Each student gives the next person a genuine compliment. Try to make it specific!",
      "time": "5 min"
    },
    "value": {
      "name": "Kindness",
      "definition": "Doing something nice for others without expecting anything back.",
      "discuss": "How does it feel when someone is kind to you?"
    },
    "game": {
      "title": "Alphabet Challenge",
      "howToPlay": "Name something from a category for every letter A to Z. Work as a class!",
      "rounds": "Animals",
      "bonus": "Try food or countries next!"
    },
    "grammar": {
      "title": "Choose the Correct Homophone",
      "sentence": "Choose the right word for each gap:",
      "instruction": "(Their / There / They're) going to (their / there / they're) house over (their / there / they're)."
    },
    "grammarTip": "They're = they are. Their = belonging to them. There = a place. Test: substitute 'they are' -- if it fits, use they're.",
    "grammarAnswer": {
      "answer": "They're going to their house over there.",
      "explanation": "They're = they are (verb). Their = possessive (whose house?). There = location (where the house is)."
    },
    "spelling": {
      "words": [
        "probably",
        "really",
        "school",
        "special",
        "straight"
      ],
      "instruction": "Watch the tricky letters in each word!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Probably not 'probly'. Really = double l. School = ch sounds like k. Straight = -ight pattern.",
    "spellingAnswer": {
      "answers": [
        "1  probably",
        "2  really",
        "3  school",
        "4  special",
        "5  straight"
      ],
      "tip": "School: ch makes a k sound -- unusual! Other words: chord, character, chaos. Great phonics discussion."
    },
    "word": {
      "word": "brave",
      "pos": "adjective",
      "blank": "The ___ firefighter ran into the burning building to save the family.",
      "instruction": "Brave describes the firefighter. What does it mean? What makes someone brave?"
    },
    "wordTip": "Brave is an ADJECTIVE modifying firefighter. Synonyms: courageous, bold, fearless, daring.",
    "wordAnswer": {
      "definition": "Ready to face danger without being scared away.",
      "example": "It was brave of her to speak up in front of the whole school."
    },
    "maths": {
      "title": "Reading Analogue Clocks",
      "problems": [
        "Hour hand on 3, minute on 12 = ?",
        "Hour hand between 7-8, minute on 6 = ?",
        "Hour hand between 4-5, minute on 9 = ?",
        "Hour hand between 11-12, minute on 3 = ?",
        "25 minutes after 2:40 = ?"
      ]
    },
    "mathsTip": "3:00 = three o'clock. 7:30 = half past seven. 4:45 = quarter to five. 11:15 = quarter past eleven. 2:40+25=3:05.",
    "mathsAnswer": {
      "answers": [
        "1   3:00",
        "2   7:30",
        "3   4:45",
        "4   11:15",
        "5   3:05"
      ],
      "tip": "Quarter past/to: 11:15 = quarter past 11. 4:45 = quarter to 5. Use an analogue clock visual to practise."
    },
    "literacy": {
      "type": "Persuasive Opening",
      "opener": "Write an opening sentence for a persuasive text about school uniforms.",
      "task": "Grab the reader's attention straight away.",
      "challenge": "Use a rhetorical question."
    },
    "riddle": {
      "riddle": "What building has the most stories?"
    },
    "riddleAnswer": {
      "answer": "A library.",
      "explanation": "A library has many STORIES -- floors AND books! A clever double meaning."
    },
    "reflection": {
      "question": "What is one thing that makes you feel proud of yourself?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Thumb-o-Meter",
      "instructions": "Thumbs up = great, sideways = OK, down = not great. Show how you feel -- no judgment!",
      "time": "3 min"
    },
    "value": {
      "name": "Honesty",
      "definition": "Telling the truth even when it is difficult.",
      "discuss": "Why is it sometimes hard to be honest?"
    },
    "game": {
      "title": "20 Questions",
      "howToPlay": "Think of a person, place or thing. Others ask YES or NO questions to guess it.",
      "rounds": "3 rounds",
      "bonus": "Limit to 15 questions!"
    },
    "grammar": {
      "title": "Find the Verb",
      "sentence": "Find the verb (doing/action word) in this sentence:",
      "instruction": "The excited children quickly ran to the playground."
    },
    "grammarTip": "A verb is the action word. Look for what the children DID. Quickly is an adverb, excited is an adjective.",
    "grammarAnswer": {
      "answer": "ran",
      "explanation": "Ran = the verb (what they did). Quickly = ADVERB (how). Excited = ADJECTIVE (describes who)."
    },
    "spelling": {
      "words": [
        "together",
        "usual",
        "weight",
        "whose",
        "women"
      ],
      "instruction": "Tricky words -- take your time with each one!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Together = to-geth-er. Usual = u-su-al. Weight = silent gh. Whose not who's. Women = wom-en.",
    "spellingAnswer": {
      "answers": [
        "1  together",
        "2  usual",
        "3  weight",
        "4  whose",
        "5  women"
      ],
      "tip": "Whose vs Who's: whose = belonging to who. Who's = who is. Test: does 'who is' fit? No = use whose."
    },
    "word": {
      "word": "excellent",
      "pos": "adjective",
      "blank": "Her ___ singing earned a standing ovation from the audience.",
      "instruction": "Excellent describes the singing. Is it stronger or weaker than good?"
    },
    "wordTip": "Excellent = much better than good or great. Synonyms: outstanding, superb, exceptional.",
    "wordAnswer": {
      "definition": "Extremely good; of very high quality.",
      "example": "The team did an excellent job cleaning up the room."
    },
    "maths": {
      "title": "Money Maths",
      "problems": [
        "3 x $4.50 = ?",
        "$20 minus $7.85 = ?",
        "Half of $9.60 = ?",
        "$5.00 + $3.75 + $1.25 = ?",
        "10% of $60 = ?"
      ]
    },
    "mathsTip": "3x4.50=13.50. 20-7.85=12.15. Half 9.60=4.80. 5+3.75+1.25=10.00. 10% of 60=6.00.",
    "mathsAnswer": {
      "answers": [
        "1   $13.50",
        "2   $12.15",
        "3   $4.80",
        "4   $10.00",
        "5   $6.00"
      ],
      "tip": "10% trick: move the decimal one place left. $60.00 becomes $6.00. Great foundation for percentages!"
    },
    "literacy": {
      "type": "Narrative Opener",
      "opener": "Write the first two sentences of a story starting with someone waking up and finding something strange.",
      "task": "Make the reader want to keep reading!",
      "challenge": "Begin with dialogue."
    },
    "riddle": {
      "riddle": "What gets wetter as it dries?"
    },
    "riddleAnswer": {
      "answer": "A towel.",
      "explanation": "A towel absorbs water (gets wetter) while it dries things off -- the opposite of what we expect!"
    },
    "reflection": {
      "question": "What is one goal you have for this week?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Line Up!",
      "instructions": "Line up by birthday (January to December) without speaking -- use gestures only!",
      "time": "5 min"
    },
    "value": {
      "name": "Teamwork",
      "definition": "Working together to reach a shared goal.",
      "discuss": "What makes a good team member?"
    },
    "game": {
      "title": "Rhyme Challenge",
      "howToPlay": "Say a word. The next student says a rhyming word. Keep going until someone gets stuck!",
      "rounds": "3 rounds",
      "bonus": "Try multi-syllable words!"
    },
    "grammar": {
      "title": "Add an Adverb",
      "sentence": "Make this sentence more interesting by adding an adverb:",
      "instruction": "The boy walked to school."
    },
    "grammarTip": "An adverb tells us HOW, WHEN, WHERE or HOW OFTEN. Adding one gives the reader a much clearer picture.",
    "grammarAnswer": {
      "answer": "e.g. The boy walked slowly to school. / The boy quietly walked to school.",
      "explanation": "Adverbs often end in -ly. Slowly tells HOW he walked. They make sentences more vivid and interesting."
    },
    "spelling": {
      "words": [
        "although",
        "certain",
        "enough",
        "minute",
        "occasion"
      ],
      "instruction": "These words have tricky letter patterns!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Although = al-though. Certain = -ain not -en. Enough = -ough sounds like uff. Minute = min-ute. Occasion = double c.",
    "spellingAnswer": {
      "answers": [
        "1  although",
        "2  certain",
        "3  enough",
        "4  minute",
        "5  occasion"
      ],
      "tip": "Occasion: double C, single S -- oc-CA-sion. Very common mistake -- worth a dedicated practice!"
    },
    "word": {
      "word": "fierce",
      "pos": "adjective",
      "blank": "The ___ storm knocked over several large trees in the park.",
      "instruction": "What does fierce tell us about the storm? Name a synonym and an antonym."
    },
    "wordTip": "Fierce = very strong, violent or intense. Synonyms: ferocious, wild, powerful. Antonyms: gentle, mild.",
    "wordAnswer": {
      "definition": "Very strong, violent, or intense.",
      "example": "The fierce lion roared to warn other animals away from its territory."
    },
    "maths": {
      "title": "Division Practice",
      "problems": [
        "48 / 6 = ?",
        "63 / 9 = ?",
        "72 / 8 = ?",
        "45 / 5 = ?",
        "96 / 12 = ?"
      ]
    },
    "mathsTip": "48/6=8 (think 6x8=48). 63/9=7. 72/8=9. 45/5=9. 96/12=8.",
    "mathsAnswer": {
      "answers": [
        "1   8",
        "2   7",
        "3   9",
        "4   9",
        "5   8"
      ],
      "tip": "Division = inverse of multiplication. If they know 6x8=48, they instantly know 48/6=8. Reinforce this!"
    },
    "literacy": {
      "type": "Information Report Intro",
      "opener": "Write an introductory sentence for a report about sharks.",
      "task": "State what sharks are and why they are interesting.",
      "challenge": "Include one fascinating fact."
    },
    "riddle": {
      "riddle": "I speak without a mouth and hear without ears. No body but alive with wind. What am I?"
    },
    "riddleAnswer": {
      "answer": "An echo.",
      "explanation": "An echo is sound bouncing back -- needs air to travel but has no physical body."
    },
    "reflection": {
      "question": "What is something you found challenging recently, and how did you handle it?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Feelings Check-In",
      "instructions": "Share one word to describe how you feel right now.",
      "time": "3 min"
    },
    "value": {
      "name": "Empathy",
      "definition": "Understanding and sharing the feelings of another person.",
      "discuss": "How can you show someone you understand how they feel?"
    },
    "game": {
      "title": "Simon Says",
      "howToPlay": "Simon Says with academic vocabulary! Simon says show me a right angle with your arms.",
      "rounds": "5 min",
      "bonus": "Add maths or literacy actions."
    },
    "grammar": {
      "title": "Fix the Apostrophe",
      "sentence": "Add apostrophes where needed:",
      "instruction": "The dogs bone was buried in the gardens corner."
    },
    "grammarTip": "Apostrophes show possession. Dog's bone = the bone belonging to the dog. Apply the same rule to garden.",
    "grammarAnswer": {
      "answer": "The dog's bone was buried in the garden's corner.",
      "explanation": "dog's = apostrophe before s (singular owner). garden's = same rule. The apostrophe shows ownership."
    },
    "spelling": {
      "words": [
        "accident",
        "calendar",
        "caterpillar",
        "ceiling",
        "committee"
      ],
      "instruction": "These words have double letters -- be careful!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Accident = double c. Calendar = one l. Caterpillar = double l. Ceiling = -ei- after c. Committee = double m, t AND e.",
    "spellingAnswer": {
      "answers": [
        "1  accident",
        "2  calendar",
        "3  caterpillar",
        "4  ceiling",
        "5  committee"
      ],
      "tip": "Committee has THREE sets of doubles: comm-itt-ee. Ceiling: i before e EXCEPT after c -- great rule!"
    },
    "word": {
      "word": "gentle",
      "pos": "adjective",
      "blank": "The ___ lamb followed its mother quietly across the field.",
      "instruction": "What kind of lamb is described? What does gentle tell us about its behaviour?"
    },
    "wordTip": "Gentle = mild and soft, not rough. Synonyms: soft, mild, tender, calm. Antonyms: rough, harsh.",
    "wordAnswer": {
      "definition": "Mild and kind; not rough or violent.",
      "example": "Please be gentle with the baby animals -- they are still very young."
    },
    "maths": {
      "title": "Fractions",
      "problems": [
        "Half of 40 = ?",
        "Quarter of 60 = ?",
        "Three quarters of 80 = ?",
        "One third of 90 = ?",
        "Which is bigger: 2/3 or 3/4?"
      ]
    },
    "mathsTip": "Half 40=20. Quarter 60=15. 3/4 of 80: find 1/4=20, x3=60. 1/3 of 90=30. 2/3=0.67, 3/4=0.75, so 3/4 bigger.",
    "mathsAnswer": {
      "answers": [
        "1   20",
        "2   15",
        "3   60",
        "4   30",
        "5   3/4 is bigger"
      ],
      "tip": "3/4 of a number: find 1/4 first, then multiply by 3. Compare fractions: convert to decimals or same denominator."
    },
    "literacy": {
      "type": "Recount Opening",
      "opener": "Write the opening of a recount about a real or imagined school excursion.",
      "task": "Use first person (I/we) and past tense.",
      "challenge": "Start with when and where."
    },
    "riddle": {
      "riddle": "What has a neck but no head?"
    },
    "riddleAnswer": {
      "answer": "A bottle.",
      "explanation": "A bottle has a neck (the narrow top) but no head! Everyday objects have surprising names."
    },
    "reflection": {
      "question": "What is a place you would love to visit and why?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Question Ball",
      "instructions": "Toss a ball. Whoever catches it answers: What is one thing you learned yesterday?",
      "time": "5 min"
    },
    "value": {
      "name": "Curiosity",
      "definition": "A strong desire to know and learn about the world.",
      "discuss": "What is something you are genuinely curious about?"
    },
    "game": {
      "title": "Fact or Opinion?",
      "howToPlay": "Read statements aloud. Students hold up F or O to show fact or opinion.",
      "rounds": "5 statements",
      "bonus": "Make up your own statements to test the class!"
    },
    "grammar": {
      "title": "Find the Adjectives",
      "sentence": "Find ALL the adjectives in this sentence:",
      "instruction": "The tall, graceful giraffe ate the fresh green leaves."
    },
    "grammarTip": "Adjectives describe nouns. Look for words that tell you WHAT SOMETHING IS LIKE.",
    "grammarAnswer": {
      "answer": "tall, graceful, fresh, green",
      "explanation": "tall + graceful describe the giraffe. fresh + green describe the leaves. All four are adjectives."
    },
    "spelling": {
      "words": [
        "desperate",
        "embarrass",
        "environment",
        "exaggerate",
        "existence"
      ],
      "instruction": "Long tricky words -- break into syllables first!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Desperate = des-per-ate. Embarrass = double r, double s. Environment = en-vi-ron-ment. Exaggerate = ex-ag-ger-ate.",
    "spellingAnswer": {
      "answers": [
        "1  desperate",
        "2  embarrass",
        "3  environment",
        "4  exaggerate",
        "5  existence"
      ],
      "tip": "Embarrass: I go Really Red -- double R, double S! One of the best memory tricks in spelling."
    },
    "word": {
      "word": "swift",
      "pos": "adjective",
      "blank": "The ___ cheetah easily caught the gazelle on the open plain.",
      "instruction": "What does swift tell us? Name a synonym and an antonym."
    },
    "wordTip": "Swift = moving very fast. Synonyms: quick, rapid, speedy. Antonyms: slow, sluggish. A swift is also a bird!",
    "wordAnswer": {
      "definition": "Moving or happening very quickly.",
      "example": "The swift runner crossed the finish line several seconds ahead of everyone else."
    },
    "maths": {
      "title": "Area and Perimeter",
      "problems": [
        "Perimeter of rectangle 6cm x 4cm?",
        "Area of rectangle 6cm x 4cm?",
        "Perimeter of square with side 5cm?",
        "Area of square with side 5cm?",
        "Area of rectangle 8cm x 3cm?"
      ]
    },
    "mathsTip": "Perimeter = add all sides. 6+4+6+4=20. Area = lxw. 6x4=24cm2. Square: P=5x4=20, A=5x5=25cm2. 8x3=24cm2.",
    "mathsAnswer": {
      "answers": [
        "1   P = 20cm",
        "2   A = 24cm2",
        "3   P = 20cm",
        "4   A = 25cm2",
        "5   A = 24cm2"
      ],
      "tip": "Perimeter = distance AROUND (like a fence). Area = space INSIDE (like carpet). Real-world examples help!"
    },
    "literacy": {
      "type": "Explanation Text",
      "opener": "Write 2 sentences explaining why exercise is important for your health.",
      "task": "Use connectives: because, therefore, or as a result.",
      "challenge": "Include a specific example."
    },
    "riddle": {
      "riddle": "What has cities but no houses, mountains but no trees, and water but no fish?"
    },
    "riddleAnswer": {
      "answer": "A map.",
      "explanation": "A map shows symbols for all these -- but they are just drawings, not real objects!"
    },
    "reflection": {
      "question": "If you could change one thing about our classroom, what would it be?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Rose and Thorn",
      "instructions": "Share one highlight (rose) and one challenge (thorn) from yesterday.",
      "time": "4 min"
    },
    "value": {
      "name": "Resilience",
      "definition": "Bouncing back from setbacks and trying again.",
      "discuss": "Can you think of a time when you had to be resilient?"
    },
    "game": {
      "title": "Category Countdown",
      "howToPlay": "Name 5 things in each category: sports, animals, foods, countries. GO!",
      "rounds": "2 min",
      "bonus": "Try: things in a kitchen."
    },
    "grammar": {
      "title": "Find Subject and Predicate",
      "sentence": "Subject = WHO or WHAT. Predicate = WHAT THEY DO. Find both:",
      "instruction": "The little brown dog chased the red ball across the yard."
    },
    "grammarTip": "Subject = everything before the main verb. Predicate = verb + everything after.",
    "grammarAnswer": {
      "answer": "Subject: The little brown dog | Predicate: chased the red ball across the yard",
      "explanation": "Subject = everything before chased. Predicate = chased + the rest. Every sentence needs both!"
    },
    "spelling": {
      "words": [
        "familiar",
        "foreign",
        "forty",
        "forward",
        "frequently"
      ],
      "instruction": "These words often cause confusion!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Familiar = fa-mil-iar. Foreign = for-eign (silent g!). Forty not 'fourty'. Forward = for-ward. Frequently = fre-quent-ly.",
    "spellingAnswer": {
      "answers": [
        "1  familiar",
        "2  foreign",
        "3  forty",
        "4  forward",
        "5  frequently"
      ],
      "tip": "Forty is NOT fourty! One of the most common Year 5-6 spelling errors. Definitely worth a dedicated focus."
    },
    "word": {
      "word": "loyal",
      "pos": "adjective",
      "blank": "A ___ friend will stand by you even in the toughest times.",
      "instruction": "What does loyal tell us? What does loyalty look like in real life?"
    },
    "wordTip": "Loyal = faithful and always supporting someone. Synonyms: faithful, devoted, trustworthy. Related: loyalty.",
    "wordAnswer": {
      "definition": "Always supporting and being faithful to someone.",
      "example": "The loyal dog waited at the door every day for its owner."
    },
    "maths": {
      "title": "Multiplication -- Partition Method",
      "problems": [
        "23 x 4 = ?",
        "35 x 3 = ?",
        "47 x 2 = ?",
        "56 x 5 = ?",
        "62 x 4 = ?"
      ]
    },
    "mathsTip": "23x4: 20x4=80, 3x4=12=92. 35x3: 30x3=90, 5x3=15=105. 47x2=94. 56x5=280. 62x4: 60x4=240, 2x4=8=248.",
    "mathsAnswer": {
      "answers": [
        "1   92",
        "2   105",
        "3   94",
        "4   280",
        "5   248"
      ],
      "tip": "Partition method: split into tens + ones. 23x4 = (20x4)+(3x4) = 80+12 = 92. Great mental maths strategy!"
    },
    "literacy": {
      "type": "Procedure Writing",
      "opener": "Write 3 steps for making a sandwich.",
      "task": "Use numbered steps and command verbs: spread, place, cut.",
      "challenge": "Add a materials list at the top."
    },
    "riddle": {
      "riddle": "What begins with T, ends with T, and has T in it?"
    },
    "riddleAnswer": {
      "answer": "A teapot.",
      "explanation": "T-ea-POT -- starts with T, ends with T, and has tea inside! Wonderful wordplay."
    },
    "reflection": {
      "question": "What is something you could teach a younger student?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Speed Friending",
      "instructions": "Talk to someone you don't usually chat with for 2 minutes. Find 3 things in common.",
      "time": "5 min"
    },
    "value": {
      "name": "Open-Mindedness",
      "definition": "Being willing to consider new ideas and different points of view.",
      "discuss": "When is it important to keep an open mind?"
    },
    "game": {
      "title": "Memory Chain",
      "howToPlay": "First student says one word. Each adds a word and must repeat all previous ones in order.",
      "rounds": "1 round",
      "bonus": "Use a theme like things at the beach."
    },
    "grammar": {
      "title": "Change to Past Tense",
      "sentence": "Change this sentence to past tense:",
      "instruction": "She runs to the park and plays with her friends."
    },
    "grammarTip": "Present = happening now. Past = already happened. Run to ran (irregular). Play to played (regular: add -ed).",
    "grammarAnswer": {
      "answer": "She ran to the park and played with her friends.",
      "explanation": "runs to ran (NOT runned!). plays to played (regular: add -ed). Good to list common irregular verbs."
    },
    "spelling": {
      "words": [
        "government",
        "grammar",
        "grateful",
        "guarantee",
        "guidance"
      ],
      "instruction": "All start with g -- but each has a tricky part!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Government = gov-ern-ment. Grammar = double m, -ar not -er. Grateful = grate-ful. Guarantee = guar-an-tee. Guidance = silent u after g.",
    "spellingAnswer": {
      "answers": [
        "1  government",
        "2  grammar",
        "3  grateful",
        "4  guarantee",
        "5  guidance"
      ],
      "tip": "Grammar = two m's! Students often write grammer. Guarantee has silent u -- like guard and guess."
    },
    "word": {
      "word": "eager",
      "pos": "adjective",
      "blank": "The ___ students raised their hands to answer every single question.",
      "instruction": "What does eager tell us? Is it positive or negative?"
    },
    "wordTip": "Eager = enthusiastic and keen to do something. Synonyms: keen, enthusiastic, willing. Antonyms: reluctant.",
    "wordAnswer": {
      "definition": "Very keen and enthusiastic about doing something.",
      "example": "She was eager to show her parents the painting she had worked on all week."
    },
    "maths": {
      "title": "Place Value",
      "problems": [
        "Value of 7 in 4,731?",
        "Round 3,456 to nearest 100",
        "Round 7,832 to nearest 1,000",
        "3,000 + 400 + 50 + 6 = ?",
        "10 x 2,340 = ?"
      ]
    },
    "mathsTip": "7 in 4,731 = hundreds = 700. 3,456 to nearest 100: tens=5, round up=3,500. 7,832 to 8,000. 10x2340=23,400.",
    "mathsAnswer": {
      "answers": [
        "1   700",
        "2   3,500",
        "3   8,000",
        "4   3,456",
        "5   23,400"
      ],
      "tip": "Rounding: digit 5 or more = round up. Digit 4 or less = round down. A number line really helps!"
    },
    "literacy": {
      "type": "Book Review Opening",
      "opener": "Write the first sentence of a book review for a book you have read.",
      "task": "Include the title and author and give your opinion.",
      "challenge": "Use a hook to grab the reader."
    },
    "riddle": {
      "riddle": "What goes up but never comes down?"
    },
    "riddleAnswer": {
      "answer": "Your age.",
      "explanation": "Your age only ever increases -- it can never go backwards! A riddle about time."
    },
    "reflection": {
      "question": "What is one thing about yourself you would like to improve?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Stretch and Breathe",
      "instructions": "Stand up, stretch wide and take 3 deep breaths together. A physical and mental reset!",
      "time": "2 min"
    },
    "value": {
      "name": "Perseverance",
      "definition": "Continuing to try even when something is hard.",
      "discuss": "What is something hard you kept trying at until you got it?"
    },
    "game": {
      "title": "Guess the Rule",
      "howToPlay": "The teacher sorts students into groups by a secret rule. Students guess the rule.",
      "rounds": "5 min",
      "bonus": "Try odd or even birth months."
    },
    "grammar": {
      "title": "Add Speech Marks",
      "sentence": "Add correct punctuation to this direct speech:",
      "instruction": "Emma said I love reading adventure stories"
    },
    "grammarTip": "Direct speech uses inverted commas around the spoken words. A comma after said introduces the speech.",
    "grammarAnswer": {
      "answer": "Emma said, \"I love reading adventure stories.\"",
      "explanation": "Inverted commas go around the spoken words. Full stop goes INSIDE the closing speech marks."
    },
    "spelling": {
      "words": [
        "immediate",
        "independent",
        "interrupt",
        "irrelevant",
        "island"
      ],
      "instruction": "Watch for silent letters and double consonants!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Immediate = double m. Independent = in-de-pend-ent. Interrupt = double r. Irrelevant = ir-rel-e-vant. Island = silent s!",
    "spellingAnswer": {
      "answers": [
        "1  immediate",
        "2  independent",
        "3  interrupt",
        "4  irrelevant",
        "5  island"
      ],
      "tip": "Island: the s is completely silent -- i-land. A great discussion: why is there a silent s? (Old spelling history!)"
    },
    "word": {
      "word": "elegant",
      "pos": "adjective",
      "blank": "The ___ dancer moved gracefully across the stage without missing a step.",
      "instruction": "What kind of dancer is described? What image does elegant create?"
    },
    "wordTip": "Elegant = graceful and stylish. Synonyms: graceful, refined, poised, stylish. Antonyms: clumsy, awkward.",
    "wordAnswer": {
      "definition": "Graceful and stylish in appearance or movement.",
      "example": "The elegant peacock spread its brilliant tail feathers wide."
    },
    "maths": {
      "title": "Percentages",
      "problems": [
        "10% of 80 = ?",
        "50% of 60 = ?",
        "25% of 40 = ?",
        "75% of 80 = ?",
        "20% of 150 = ?"
      ]
    },
    "mathsTip": "10%=8. 50%=30. 25%=10. 75% of 80: find 25%=20, x3=60. 20% of 150: 10%=15, x2=30.",
    "mathsAnswer": {
      "answers": [
        "1   8",
        "2   30",
        "3   10",
        "4   60",
        "5   30"
      ],
      "tip": "Shortcuts: 10%=divide by 10, 25%=divide by 4, 50%=divide by 2, 75%=divide by 4 then x3."
    },
    "literacy": {
      "type": "Dialogue Writing",
      "opener": "Write a short dialogue of 4 to 6 lines between two characters who disagree.",
      "task": "Use correct speech punctuation throughout.",
      "challenge": "Show each character's personality through how they speak."
    },
    "riddle": {
      "riddle": "The more you have of it, the less you see. What is it?"
    },
    "riddleAnswer": {
      "answer": "Darkness.",
      "explanation": "The more darkness there is, the less you can see. A paradox riddle!"
    },
    "reflection": {
      "question": "What is something you do that makes you feel really confident?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Group Juggle",
      "instructions": "Stand in a circle. Pass a ball in a pattern -- then add more balls!",
      "time": "5 min"
    },
    "value": {
      "name": "Collaboration",
      "definition": "Working together and combining each other's strengths.",
      "discuss": "What is the best group project you have been part of?"
    },
    "game": {
      "title": "Odd One Out",
      "howToPlay": "Show 4 words -- 3 have something in common, 1 is different. Find the odd one out and explain why.",
      "rounds": "3 rounds",
      "bonus": "Can you make your own set of 4?"
    },
    "grammar": {
      "title": "Active and Passive Voice",
      "sentence": "Change this passive sentence to active voice:",
      "instruction": "The delicious cake was eaten by the children."
    },
    "grammarTip": "Passive = the object receives the action. Active = the subject does the action. Active is usually clearer.",
    "grammarAnswer": {
      "answer": "The children ate the delicious cake.",
      "explanation": "Active: The children (subject) + ate (verb) + the cake (object). Subject DOES the action."
    },
    "spelling": {
      "words": [
        "knowledge",
        "language",
        "leisure",
        "length",
        "library"
      ],
      "instruction": "Pay attention to silent letters!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Knowledge = silent k. Language = lan-guage. Leisure = lei-sure. Length = leng-th. Library = li-bra-ry not libary!",
    "spellingAnswer": {
      "answers": [
        "1  knowledge",
        "2  language",
        "3  leisure",
        "4  length",
        "5  library"
      ],
      "tip": "Knowledge: k is silent -- like knee, knot, knife, know. Pattern: kn at the start always has a silent k!"
    },
    "word": {
      "word": "vibrant",
      "pos": "adjective",
      "blank": "The market was filled with ___ colours and the sound of lively music.",
      "instruction": "What does vibrant tell us about the colours? Describe something else as vibrant."
    },
    "wordTip": "Vibrant = bright, striking and full of energy. Synonyms: brilliant, vivid, bold, lively. Antonyms: dull, muted.",
    "wordAnswer": {
      "definition": "Bright and full of energy and life.",
      "example": "The vibrant city centre was always buzzing with activity and colour."
    },
    "maths": {
      "title": "Elapsed Time",
      "problems": [
        "Start 9:15am to End 11:45am = how long?",
        "Start 2:30pm to End 5:00pm = how long?",
        "Start 8:45am to End 12:15pm = how long?",
        "Start 10:20am to End 1:05pm = how long?",
        "Movie starts 3:30pm, runs 1hr 45min. Ends at?"
      ]
    },
    "mathsTip": "9:15 to 11:45=2h30. 2:30 to 5:00=2h30. 8:45 to 12:15=3h30. 10:20 to 1:05=2h45. 3:30+1h45=5:15pm.",
    "mathsAnswer": {
      "answers": [
        "1   2 hrs 30 min",
        "2   2 hrs 30 min",
        "3   3 hrs 30 min",
        "4   2 hrs 45 min",
        "5   5:15pm"
      ],
      "tip": "Elapsed time: count up to next hour, count full hours, add remaining minutes. The jump strategy!"
    },
    "literacy": {
      "type": "Haiku",
      "opener": "Write a haiku about something in nature. 5 syllables / 7 syllables / 5 syllables.",
      "task": "Count syllables carefully for each line.",
      "challenge": "Try to create a vivid image in the middle line."
    },
    "riddle": {
      "riddle": "I have two hands but cannot scratch myself. What am I?"
    },
    "riddleAnswer": {
      "answer": "A clock.",
      "explanation": "Clock hands only go in circles -- they can never scratch anything!"
    },
    "reflection": {
      "question": "What is something new you would like to try?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Weather Reporter",
      "instructions": "One student describes the weather outside using descriptive language.",
      "time": "3 min"
    },
    "value": {
      "name": "Gratitude",
      "definition": "Being thankful for what you have and the people around you.",
      "discuss": "What is one thing about your life you are grateful for today?"
    },
    "game": {
      "title": "Fortunately / Unfortunately",
      "howToPlay": "Start: Fortunately... Next student: Unfortunately... and adds a twist. Keep alternating!",
      "rounds": "1 class round",
      "bonus": "Write the whole story down afterwards!"
    },
    "grammar": {
      "title": "Expand a Sentence",
      "sentence": "Make this sentence much more interesting:",
      "instruction": "The bird flew."
    },
    "grammarTip": "A simple sentence has subject + verb. Expand by adding adjectives (what kind?), adverbs (how/when/where?).",
    "grammarAnswer": {
      "answer": "e.g. The tiny sparrow flew gracefully over the rooftops at dawn.",
      "explanation": "Added: tiny (adjective), gracefully (adverb), over the rooftops at dawn (prepositional phrases)."
    },
    "spelling": {
      "words": [
        "necessary",
        "neighbour",
        "noticeable",
        "nuisance",
        "occasion"
      ],
      "instruction": "Tricky patterns in these common words!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Necessary = 1 c, 2 s. Neighbour = neigh- like a horse. Noticeable = keep the e (notice+able). Occasion = double c.",
    "spellingAnswer": {
      "answers": [
        "1  necessary",
        "2  neighbour",
        "3  noticeable",
        "4  nuisance",
        "5  occasion"
      ],
      "tip": "Necessary: one Collar, two Socks = 1 c, 2 s. A classic mnemonic that really sticks!"
    },
    "word": {
      "word": "timid",
      "pos": "adjective",
      "blank": "The ___ mouse hid behind the bookcase the moment the cat appeared.",
      "instruction": "What does timid tell us about the mouse? Is it positive or negative?"
    },
    "wordTip": "Timid = shy, nervous and easily frightened. Synonyms: shy, meek, hesitant. Antonyms: bold, brave, confident.",
    "wordAnswer": {
      "definition": "Showing a lack of confidence; easily frightened or nervous.",
      "example": "The timid child whispered her answer rather than speaking up in class."
    },
    "maths": {
      "title": "Word Problems",
      "problems": [
        "Jake has 48 stickers shared equally among 4. How many each?",
        "8 books per shelf, 6 shelves. Total books?",
        "Mia saves $15 a week. Total after 8 weeks?",
        "45 lollies shared among 5 children. How many each?",
        "7 teams of 9 students. Total students?"
      ]
    },
    "mathsTip": "48/4=12. 8x6=48. 15x8=120. 45/5=9. 7x9=63.",
    "mathsAnswer": {
      "answers": [
        "1   12 stickers",
        "2   48 books",
        "3   $120",
        "4   9 lollies",
        "5   63 students"
      ],
      "tip": "Teach students: shared equally = division. How many total = multiplication. Identify the operation first!"
    },
    "literacy": {
      "type": "Persuasive Letter",
      "opener": "Begin a letter to the principal asking for more outdoor play time.",
      "task": "Use Dear... and state your first reason clearly.",
      "challenge": "Use formal language throughout."
    },
    "riddle": {
      "riddle": "What has four wheels and flies?"
    },
    "riddleAnswer": {
      "answer": "A rubbish truck.",
      "explanation": "A rubbish truck has four wheels AND flies (insects!) are attracted to rubbish. Double meaning!"
    },
    "reflection": {
      "question": "What is one thing someone has said that has really stuck with you?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Stand If...",
      "instructions": "Stand up if you: love sport / have a pet / can speak another language / have been overseas.",
      "time": "4 min"
    },
    "value": {
      "name": "Fairness",
      "definition": "Making sure everyone is treated equally and given the same opportunities.",
      "discuss": "Can you think of a situation that was unfair? What could have been done differently?"
    },
    "game": {
      "title": "Alphabet Animals",
      "howToPlay": "Name one animal for every letter A to Z. Work as a class!",
      "rounds": "5 min",
      "bonus": "Try plants or countries next!"
    },
    "grammar": {
      "title": "Use a Connective",
      "sentence": "Join these two sentences using a connecting word:",
      "instruction": "The rain was heavy. We went outside anyway."
    },
    "grammarTip": "Connectives show how ideas relate: although, however, because, despite, even though. They join clauses.",
    "grammarAnswer": {
      "answer": "Although the rain was heavy, we went outside anyway.",
      "explanation": "Although shows contrast -- one thing is true but the other happens anyway. However also works."
    },
    "spelling": {
      "words": [
        "peculiar",
        "perceive",
        "permanent",
        "physical",
        "possible"
      ],
      "instruction": "Break each word into syllables before writing!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Peculiar = pe-cul-iar. Perceive = per-ceive. Permanent = per-ma-nent. Physical = ph sounds like f. Possible = pos-si-ble.",
    "spellingAnswer": {
      "answers": [
        "1  peculiar",
        "2  perceive",
        "3  permanent",
        "4  physical",
        "5  possible"
      ],
      "tip": "Physical: ph = f sound. Physics, phone, photo, phrase -- great chance to explore the ph pattern as a class!"
    },
    "word": {
      "word": "bold",
      "pos": "adjective",
      "blank": "The ___ explorer climbed the highest mountain entirely on her own.",
      "instruction": "What kind of explorer is described? Can bold mean anything else?"
    },
    "wordTip": "Bold = brave and confident, willing to take risks. Synonyms: daring, fearless, adventurous. Also: thick dark font!",
    "wordAnswer": {
      "definition": "Confident and willing to take risks.",
      "example": "It was a bold decision to start a new business with only $100 in savings."
    },
    "maths": {
      "title": "Shapes and Geometry",
      "problems": [
        "How many sides does a hexagon have?",
        "How many degrees in a right angle?",
        "What is a quadrilateral?",
        "How many sides does an octagon have?",
        "How many degrees in a straight line?"
      ]
    },
    "mathsTip": "Hexagon=6. Right=90 degrees. Quadrilateral=4-sided. Octagon=8. Straight line=180 degrees.",
    "mathsAnswer": {
      "answers": [
        "1   6",
        "2   90 degrees",
        "3   4-sided shape",
        "4   8",
        "5   180 degrees"
      ],
      "tip": "Greek prefixes: hex=6, oct=8, quad=4, dec=10, tri=3. Learn the prefix and you can work out any polygon name!"
    },
    "literacy": {
      "type": "News Report Opening",
      "opener": "Write the opening sentence of a news report about a fictional school event.",
      "task": "Include who, what, when and where.",
      "challenge": "Use past tense."
    },
    "riddle": {
      "riddle": "I can run but never walk, have a mouth but never talk, have a bed but never sleep. What am I?"
    },
    "riddleAnswer": {
      "answer": "A river.",
      "explanation": "A river runs, has a mouth and a bed -- but none of these are literal!"
    },
    "reflection": {
      "question": "What is something you wish you had more time to do?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Four Corners",
      "instructions": "Corners: Strongly Agree, Agree, Disagree, Strongly Disagree. Students move to their corner for each statement.",
      "time": "5 min"
    },
    "value": {
      "name": "Leadership",
      "definition": "Inspiring and guiding others to achieve a goal together.",
      "discuss": "What qualities make a great leader?"
    },
    "game": {
      "title": "Broken Telephone",
      "howToPlay": "Whisper a sentence around the circle. Last person says it aloud -- compare to the original!",
      "rounds": "3 rounds",
      "bonus": "Use tongue twisters!"
    },
    "grammar": {
      "title": "Fix the Double Negative",
      "sentence": "Fix this sentence:",
      "instruction": "I don't know nothing about that topic."
    },
    "grammarTip": "Two negatives cancel each other out! Don't and nothing are both negative -- standard English uses only ONE per clause.",
    "grammarAnswer": {
      "answer": "I don't know anything about that topic.",
      "explanation": "Keep ONE negative. Don't know anything OR know nothing -- not both. Double negatives are non-standard English."
    },
    "spelling": {
      "words": [
        "privilege",
        "profession",
        "pronunciation",
        "psychology",
        "pursue"
      ],
      "instruction": "Advanced words with silent or unusual letters!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Privilege = priv-i-lege. Profession = pro-fes-sion. Pronunciation = pro-nun-ci-a-tion NOT pronounciation! Psychology = silent p.",
    "spellingAnswer": {
      "answers": [
        "1  privilege",
        "2  profession",
        "3  pronunciation",
        "4  psychology",
        "5  pursue"
      ],
      "tip": "Pronunciation changes from pronounce -- the o drops out! Trips up even adults. Psychology = silent p like pterodactyl!"
    },
    "word": {
      "word": "peculiar",
      "pos": "adjective",
      "blank": "A ___ smell was coming from the old abandoned house at the end of the street.",
      "instruction": "Peculiar describes the smell. What does it tell you?"
    },
    "wordTip": "Peculiar = strange and unusual. Synonyms: strange, odd, bizarre, unusual. Antonyms: normal, ordinary.",
    "wordAnswer": {
      "definition": "Strange or unusual; different from what is normal or expected.",
      "example": "The dog had a peculiar habit of barking at mirrors every morning."
    },
    "maths": {
      "title": "Decimals",
      "problems": [
        "3.4 + 2.7 = ?",
        "8.5 - 3.2 = ?",
        "0.5 x 6 = ?",
        "Which is bigger: 0.7 or 0.69?",
        "Round 4.56 to 1 decimal place"
      ]
    },
    "mathsTip": "3.4+2.7=6.1. 8.5-3.2=5.3. 0.5x6=3.0. 0.7=0.70 which is bigger than 0.69. Round 4.56: 2nd decimal=6 >= 5 = 4.6.",
    "mathsAnswer": {
      "answers": [
        "1   6.1",
        "2   5.3",
        "3   3.0",
        "4   0.7 is bigger",
        "5   4.6"
      ],
      "tip": "0.7 vs 0.69: write as 0.70 vs 0.69 -- now easy to compare! Lining up decimal points is the key skill."
    },
    "literacy": {
      "type": "Character Description",
      "opener": "Write 3 sentences describing a character for a story.",
      "task": "Include BOTH physical appearance AND personality.",
      "challenge": "Show personality through actions, not just labels."
    },
    "riddle": {
      "riddle": "What goes up when rain comes down?"
    },
    "riddleAnswer": {
      "answer": "An umbrella.",
      "explanation": "We put our umbrella UP when rain comes DOWN! Opposites working together."
    },
    "reflection": {
      "question": "What is something you wish you had learned earlier?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Snowball Fight",
      "instructions": "Write a question on paper, scrunch it up, throw it! Pick up someone else's and answer it.",
      "time": "5 min"
    },
    "value": {
      "name": "Integrity",
      "definition": "Doing the right thing even when no one is watching.",
      "discuss": "Describe a time you did the right thing even though no one would have known."
    },
    "game": {
      "title": "Hot Seat",
      "howToPlay": "One student sits as a book character or historical figure. Class asks questions.",
      "rounds": "5 min",
      "bonus": "Can the class guess who the character is?"
    },
    "grammar": {
      "title": "Simile or Metaphor?",
      "sentence": "Identify the technique and explain your reasoning:",
      "instruction": "The classroom was a zoo after lunch."
    },
    "grammarTip": "Simile uses like or as. Metaphor says something IS something else -- no like or as present.",
    "grammarAnswer": {
      "answer": "Metaphor -- the classroom WAS a zoo (not like a zoo).",
      "explanation": "Metaphor = directly says IS. Simile = uses like or as. Test: can you spot like or as? No = metaphor!"
    },
    "spelling": {
      "words": [
        "recognise",
        "recommend",
        "relevant",
        "rhyme",
        "rhythm"
      ],
      "instruction": "Unusual patterns -- practise carefully!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Recognise = rec-og-nise. Recommend = 1 c, double m. Relevant = rel-e-vant. Rhyme = silent h. Rhythm = two h's, no vowel at end!",
    "spellingAnswer": {
      "answers": [
        "1  recognise",
        "2  recommend",
        "3  relevant",
        "4  rhyme",
        "5  rhythm"
      ],
      "tip": "RHYTHM: Rhythm Helps Your Two Hips Move -- first letters spell RHYTHM! Students absolutely love this one."
    },
    "word": {
      "word": "sturdy",
      "pos": "adjective",
      "blank": "The ___ bridge had held up for over 100 years without any repairs.",
      "instruction": "What does sturdy tell us about the bridge? Name a synonym and an antonym."
    },
    "wordTip": "Sturdy = strong and solidly built. Synonyms: strong, solid, robust, durable. Antonyms: fragile, flimsy, weak.",
    "wordAnswer": {
      "definition": "Strongly and solidly built; not easily broken or damaged.",
      "example": "You will need a sturdy pair of boots for hiking in the mountains."
    },
    "maths": {
      "title": "Order of Operations -- BODMAS",
      "problems": [
        "4 + 3 x 2 = ?",
        "(5 + 3) x 4 = ?",
        "20 - 4 x 3 = ?",
        "(10 + 2) / 4 = ?",
        "3 squared + 4 squared = ?"
      ]
    },
    "mathsTip": "Multiply before add. Brackets first. 4+3x2=4+6=10. (5+3)x4=32. 20-4x3=8. 12/4=3. 9+16=25.",
    "mathsAnswer": {
      "answers": [
        "1   10",
        "2   32",
        "3   8",
        "4   3",
        "5   25"
      ],
      "tip": "BODMAS: Brackets, Orders, Division, Multiplication, Addition, Subtraction. 3sq+4sq=25 connects to Pythagoras!"
    },
    "literacy": {
      "type": "Opinion Piece",
      "opener": "Write 2 sentences giving your opinion about whether students should have phones at school.",
      "task": "State your view clearly.",
      "challenge": "Include a reason to support your opinion."
    },
    "riddle": {
      "riddle": "What has keys but no locks, space but no room, and enter but can't go inside?"
    },
    "riddleAnswer": {
      "answer": "A keyboard.",
      "explanation": "A keyboard has keys, a space bar, and an enter key -- but none are literal!"
    },
    "reflection": {
      "question": "What is something you are really good at that others might not know about?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Mindful Minute",
      "instructions": "One full minute of silence -- focus only on what you can hear. Then share what you noticed.",
      "time": "2 min"
    },
    "value": {
      "name": "Self-Awareness",
      "definition": "Understanding your own feelings, strengths and areas for growth.",
      "discuss": "What is one strength you have that you are proud of?"
    },
    "game": {
      "title": "Human Bingo",
      "howToPlay": "Bingo cards with descriptions like has visited another country. Find classmates to match!",
      "rounds": "5 min",
      "bonus": "Make your own bingo cards!"
    },
    "grammar": {
      "title": "Find the Main Clause",
      "sentence": "Which part is the main clause?",
      "instruction": "Although it was raining heavily, the students played outside."
    },
    "grammarTip": "Main clause = makes sense on its own. Subordinate clause = depends on the main clause for meaning.",
    "grammarAnswer": {
      "answer": "the students played outside",
      "explanation": "The students played outside makes sense alone = main clause. Although it was raining depends on it = subordinate."
    },
    "spelling": {
      "words": [
        "secretary",
        "separate",
        "sergeant",
        "shoulder",
        "signature"
      ],
      "instruction": "Silent letters and tricky patterns!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Secretary = sec-re-ta-ry. Separate = sep-a-rate NOT seperate. Sergeant = silent g. Shoulder = shoul-der. Signature = sig-na-ture.",
    "spellingAnswer": {
      "answers": [
        "1  secretary",
        "2  separate",
        "3  sergeant",
        "4  shoulder",
        "5  signature"
      ],
      "tip": "Separate: there is a RAT in sepARATe! One of the most common misspellings ever. The mnemonic works!"
    },
    "word": {
      "word": "dazzling",
      "pos": "adjective",
      "blank": "The ___ fireworks lit up the entire night sky over the harbour.",
      "instruction": "What do we know about the fireworks from dazzling? What feeling does it create?"
    },
    "wordTip": "Dazzling = extremely bright and impressive. Synonyms: brilliant, spectacular, breathtaking, stunning.",
    "wordAnswer": {
      "definition": "Extremely impressive or beautiful; very bright and eye-catching.",
      "example": "The dazzling performance earned a standing ovation from the entire audience."
    },
    "maths": {
      "title": "Reading a Bar Graph -- pets survey (cats=15, dogs=23, fish=8)",
      "problems": [
        "Total pets counted?",
        "Most popular pet?",
        "How many more dogs than fish?",
        "What fraction chose cats?",
        "If 10 more fish added, new total?"
      ]
    },
    "mathsTip": "15+23+8=46. Most=dogs. 23-8=15 more. 15/46. 46+10=56.",
    "mathsAnswer": {
      "answers": [
        "1   46",
        "2   dogs",
        "3   15 more",
        "4   15/46",
        "5   56"
      ],
      "tip": "Reading graphs: always check title, axis labels and scale before answering. Model this process explicitly!"
    },
    "literacy": {
      "type": "Writing About Data",
      "opener": "Write 2 sentences describing what the pet bar graph shows.",
      "task": "Include specific numbers.",
      "challenge": "Use comparative language: more than, most popular, least popular."
    },
    "riddle": {
      "riddle": "What do you call a sleeping dinosaur?"
    },
    "riddleAnswer": {
      "answer": "A dino-snore!",
      "explanation": "Dinosaur + snore = dino-snore! A great example of a pun."
    },
    "reflection": {
      "question": "What is one question you have always wanted to know the answer to?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Partner Share",
      "instructions": "Tell your partner the most interesting thing you know about any topic.",
      "time": "3 min"
    },
    "value": {
      "name": "Communication",
      "definition": "Sharing ideas clearly so others can understand exactly what you mean.",
      "discuss": "What makes someone a great communicator?"
    },
    "game": {
      "title": "Chain Spelling",
      "howToPlay": "Each student spells a word starting with the last letter of the previous word.",
      "rounds": "5 min",
      "bonus": "Use topic vocabulary!"
    },
    "grammar": {
      "title": "Add Brackets",
      "sentence": "Add brackets to include extra information:",
      "instruction": "My teacher Ms Johnson who is very kind gave us free reading time."
    },
    "grammarTip": "Brackets add non-essential extra information. Remove the bracketed part -- the sentence still works perfectly.",
    "grammarAnswer": {
      "answer": "My teacher, Ms Johnson (who is very kind), gave us free reading time.",
      "explanation": "Bracketed phrase adds detail but is not needed. Commas can also work here instead of brackets."
    },
    "spelling": {
      "words": [
        "sufficient",
        "suggest",
        "thorough",
        "tomorrow",
        "tongue"
      ],
      "instruction": "Tricky endings and unusual letter patterns!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Sufficient = suf-fi-cient. Suggest = double g. Thorough = -ough pattern. Tomorrow = double r. Tongue = silent ue.",
    "spellingAnswer": {
      "answers": [
        "1  sufficient",
        "2  suggest",
        "3  thorough",
        "4  tomorrow",
        "5  tongue"
      ],
      "tip": "Thorough, through, tough, cough, though -- all -ough but different sounds! Great phonics investigation."
    },
    "word": {
      "word": "harsh",
      "pos": "adjective",
      "blank": "The ___ winter wind made everyone's cheeks sting and eyes water.",
      "instruction": "What kind of wind is described? Give a synonym and an antonym."
    },
    "wordTip": "Harsh = very unpleasant or severe. Synonyms: severe, brutal, rough, bitter. Antonyms: mild, gentle, soft.",
    "wordAnswer": {
      "definition": "Very unpleasant, severe, or cruel.",
      "example": "The judge gave a harsh punishment to the person who repeatedly broke the rules."
    },
    "maths": {
      "title": "Larger Number Calculations",
      "problems": [
        "1,234 + 2,567 = ?",
        "5,000 - 1,743 = ?",
        "123 x 4 = ?",
        "364 / 4 = ?",
        "25 x 12 = ?"
      ]
    },
    "mathsTip": "1234+2567=3801. 5000-1743=3257. 123x4=492. 364/4=91. 25x12=300.",
    "mathsAnswer": {
      "answers": [
        "1   3,801",
        "2   3,257",
        "3   492",
        "4   91",
        "5   300"
      ],
      "tip": "25x12=300. Try: 25x4=100, then x3=300. Or: 25 cents x12 = $3.00. Multiple strategies = great discussion!"
    },
    "literacy": {
      "type": "Compare and Contrast",
      "opener": "Write 2 sentences comparing summer and winter.",
      "task": "Use: both, however, while, on the other hand.",
      "challenge": "Include both similarities AND differences."
    },
    "riddle": {
      "riddle": "What word is spelled incorrectly in every dictionary?"
    },
    "riddleAnswer": {
      "answer": "Incorrectly -- it is always spelled i-n-c-o-r-r-e-c-t-l-y.",
      "explanation": "Every dictionary spells incorrectly correctly. A brilliant trick question!"
    },
    "reflection": {
      "question": "What is one thing you could do to be more helpful to someone this week?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Future Self",
      "instructions": "Close your eyes and imagine yourself in 10 years. Share one thing about your future self.",
      "time": "3 min"
    },
    "value": {
      "name": "Ambition",
      "definition": "Having goals and big dreams for what you want to achieve.",
      "discuss": "What is one big goal you have for your future?"
    },
    "game": {
      "title": "Vocabulary Bingo",
      "howToPlay": "Make a 3x3 bingo card with vocabulary from a recent topic. Teacher reads definitions -- cross off words!",
      "rounds": "5 min",
      "bonus": "Students make cards to swap!"
    },
    "grammar": {
      "title": "Verb Tenses",
      "sentence": "Write in past, present AND future tense:",
      "instruction": "She (run) in the park."
    },
    "grammarTip": "Regular verbs add -ed for past. Present = base form. Future = will + base. Run is IRREGULAR: past = ran, NOT runned.",
    "grammarAnswer": {
      "answer": "Past: She ran. Present: She runs. Future: She will run.",
      "explanation": "Run = irregular (ran). Regular example: walk = walked. Future always uses will + base form."
    },
    "spelling": {
      "words": [
        "unique",
        "unnecessary",
        "until",
        "usually",
        "variety"
      ],
      "instruction": "Common words often misspelled -- practise each!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Unique = u-nique. Unnecessary = un + necessary (double s!). Until = un-til NOT untill. Usually = u-su-al-ly. Variety = va-ri-e-ty.",
    "spellingAnswer": {
      "answers": [
        "1  unique",
        "2  unnecessary",
        "3  until",
        "4  usually",
        "5  variety"
      ],
      "tip": "Unnecessary = un + necessary. Teach the base word first: necessary (1 c, 2 s). Then add the prefix un-."
    },
    "word": {
      "word": "ancient",
      "pos": "adjective",
      "blank": "The ___ ruins had been standing for over two thousand years.",
      "instruction": "What does ancient tell us? How old is ancient?"
    },
    "wordTip": "Ancient = very, very old -- usually thousands of years. Synonyms: age-old, prehistoric. Antonym: modern.",
    "wordAnswer": {
      "definition": "Very old; from the very distant past -- usually thousands of years ago.",
      "example": "Ancient Egypt is one of the oldest civilisations ever discovered."
    },
    "maths": {
      "title": "Coordinates",
      "problems": [
        "From (1,1): move 2 right and 3 up. New position?",
        "Coordinates of the origin?",
        "Which axis is horizontal: x or y?",
        "y-coordinate of point (6, 3)?",
        "In (4, 5): is 4 the x or y value?"
      ]
    },
    "mathsTip": "(1,1)+2right=3, +3up=4 = (3,4). Origin=(0,0). x = horizontal. y of (6,3)=3. In (4,5): 4 is x.",
    "mathsAnswer": {
      "answers": [
        "1   (3, 4)",
        "2   (0, 0)",
        "3   x-axis",
        "4   3",
        "5   x value (4 across, 5 up)"
      ],
      "tip": "Along the corridor, then up the stairs -- go across first (x), then up (y). This analogy really sticks!"
    },
    "literacy": {
      "type": "Science Report Intro",
      "opener": "Write an introductory sentence for a report about the water cycle.",
      "task": "State simply what the water cycle is.",
      "challenge": "Include one step of the cycle."
    },
    "riddle": {
      "riddle": "You are in a room with no windows or doors. How do you get out?"
    },
    "riddleAnswer": {
      "answer": "Stop imagining it!",
      "explanation": "The room only exists in your imagination -- so just stop thinking about it!"
    },
    "reflection": {
      "question": "If you could have any superpower for one day, what would you choose and why?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Gratitude Shout-Out",
      "instructions": "Write one person's name and one thing you appreciate about them. Share with the class.",
      "time": "4 min"
    },
    "value": {
      "name": "Responsibility",
      "definition": "Doing what you are supposed to do and owning your actions.",
      "discuss": "What responsibilities do you have at home or at school?"
    },
    "game": {
      "title": "Story Starters",
      "howToPlay": "Teacher reads an unusual opening sentence. Each student adds one sentence to continue the story.",
      "rounds": "1 class round",
      "bonus": "Try to end with a cliffhanger!"
    },
    "grammar": {
      "title": "Semicolons",
      "sentence": "Join these related sentences with a semicolon:",
      "instruction": "She loved the beach. The waves always calmed her."
    },
    "grammarTip": "A semicolon joins two closely related complete sentences. Both parts must make sense on their own.",
    "grammarAnswer": {
      "answer": "She loved the beach; the waves always calmed her.",
      "explanation": "Semicolon replaces the full stop and shows the two ideas are closely connected. Both parts are complete sentences."
    },
    "spelling": {
      "words": [
        "vegetable",
        "vehicle",
        "villain",
        "vinegar",
        "visible"
      ],
      "instruction": "Focus carefully on the vowels in each word!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Vegetable = veg-e-ta-ble (4 syllables -- often mispronounced as 3!). Vehicle = ve-hi-cle. Villain = vil-lain.",
    "spellingAnswer": {
      "answers": [
        "1  vegetable",
        "2  vehicle",
        "3  villain",
        "4  vinegar",
        "5  visible"
      ],
      "tip": "Vegetable: FOUR syllables! veg-e-ta-ble. Clap it out slowly. Many people say three -- great discovery!"
    },
    "word": {
      "word": "clumsy",
      "pos": "adjective",
      "blank": "The ___ waiter spilled drinks three times in the same evening.",
      "instruction": "What kind of waiter is described? Is clumsy positive or negative?"
    },
    "wordTip": "Clumsy = lacking coordination, often dropping things. Synonyms: awkward, uncoordinated. Antonyms: graceful, nimble.",
    "wordAnswer": {
      "definition": "Tending to drop or knock things; moving in an awkward way.",
      "example": "The clumsy puppy kept bumping into the furniture as it explored the room."
    },
    "maths": {
      "title": "Capacity",
      "problems": [
        "1 litre = how many millilitres?",
        "2.5 L = how many mL?",
        "750mL bottles to fill 3L: how many bottles?",
        "500mL + 750mL = how many L?",
        "1L minus 400mL = how many mL?"
      ]
    },
    "mathsTip": "1L=1000mL. 2.5L=2500mL. 3000/750=4. 500+750=1250mL=1.25L. 1000-400=600mL.",
    "mathsAnswer": {
      "answers": [
        "1   1,000 mL",
        "2   2,500 mL",
        "3   4 bottles",
        "4   1.25 L",
        "5   600 mL"
      ],
      "tip": "Volume = amount of space taken up. Capacity = maximum a container can hold. Worth distinguishing these!"
    },
    "literacy": {
      "type": "Cause and Effect",
      "opener": "Complete: Because it hadn't rained for weeks, ___",
      "task": "Then write a second cause-and-effect sentence of your own.",
      "challenge": "Use: because, as a result, therefore."
    },
    "riddle": {
      "riddle": "I have a tail and a head but no body. What am I?"
    },
    "riddleAnswer": {
      "answer": "A coin.",
      "explanation": "A coin has a head side and a tail side -- but no body in between!"
    },
    "reflection": {
      "question": "What would you do if you had a free afternoon with nothing planned?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Show and Tell",
      "instructions": "Describe one object that is important to you and explain why it matters.",
      "time": "5 min"
    },
    "value": {
      "name": "Identity",
      "definition": "What makes you who you are -- your experiences, culture, values and personality.",
      "discuss": "What is one thing about your culture or background that you are proud of?"
    },
    "game": {
      "title": "Crazy Counting",
      "howToPlay": "Count backwards from 100 by 7s. Who can go the longest without a mistake?",
      "rounds": "3 min",
      "bonus": "Try counting by 9s from 200!"
    },
    "grammar": {
      "title": "Reported Speech",
      "sentence": "Change this direct speech to reported speech:",
      "instruction": "Tom said, I am going to the library tomorrow."
    },
    "grammarTip": "Reported speech drops speech marks. Tense shifts back: am to was. Tomorrow becomes the next day. I becomes he.",
    "grammarAnswer": {
      "answer": "Tom said that he was going to the library the next day.",
      "explanation": "Changes: no speech marks, add that, I to he, am going to was going, tomorrow to the next day."
    },
    "spelling": {
      "words": [
        "amateur",
        "appreciate",
        "approximately",
        "argument",
        "atmosphere"
      ],
      "instruction": "Long academic words -- break into syllables!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Amateur = am-a-teur. Appreciate = ap-pre-ci-ate. Approximately = ap-prox-i-mate-ly. Argument = drop the e from argue.",
    "spellingAnswer": {
      "answers": [
        "1  amateur",
        "2  appreciate",
        "3  approximately",
        "4  argument",
        "5  atmosphere"
      ],
      "tip": "Argument: argue to argument (drop the e). Exception to the usual rule. Worth noting explicitly!"
    },
    "word": {
      "word": "wary",
      "pos": "adjective",
      "blank": "She was ___ of the unfamiliar dog and stayed very close to her mum.",
      "instruction": "What does wary tell us about how she felt? Describe a situation where you might feel wary."
    },
    "wordTip": "Wary = cautious because of possible danger. Synonyms: cautious, careful, alert. Antonyms: reckless, careless.",
    "wordAnswer": {
      "definition": "Cautious and careful about possible problems or danger.",
      "example": "Be wary of any emails that ask for your personal password."
    },
    "maths": {
      "title": "Length Conversions",
      "problems": [
        "1 km = how many metres?",
        "2.5 km = how many metres?",
        "150 cm = how many metres?",
        "Perimeter of rectangle 5m x 3m = ?",
        "Fence is 2.4 km. How many 100m sections?"
      ]
    },
    "mathsTip": "1km=1000m. 2.5km=2500m. 150cm=1.5m. 5+3+5+3=16m. 2400/100=24.",
    "mathsAnswer": {
      "answers": [
        "1   1,000 m",
        "2   2,500 m",
        "3   1.5 m",
        "4   16 m",
        "5   24 sections"
      ],
      "tip": "Unit conversions: km to m (x1000), m to cm (x100), cm to mm (x10). Learn the pattern once, apply it everywhere!"
    },
    "literacy": {
      "type": "Formal vs Informal",
      "opener": "Write the same message formally AND informally: Can you come to my party?",
      "task": "One version to a friend, one to the school principal.",
      "challenge": "Notice the differences in vocabulary and tone."
    },
    "riddle": {
      "riddle": "What is full of holes but still holds water?"
    },
    "riddleAnswer": {
      "answer": "A sponge.",
      "explanation": "A sponge is full of tiny holes but still absorbs and holds water. A lovely paradox!"
    },
    "reflection": {
      "question": "What is something you are looking forward to in the next month?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Class Handshake",
      "instructions": "Design a unique class handshake with 5 steps. Everyone learns it!",
      "time": "5 min"
    },
    "value": {
      "name": "Belonging",
      "definition": "Feeling like you are part of a group and that you matter.",
      "discuss": "What makes you feel like you belong at school?"
    },
    "game": {
      "title": "Keeper of the Keys",
      "howToPlay": "One student is blindfolded with keys under their chair. Another tries to take them silently.",
      "rounds": "3 min",
      "bonus": "Great for suspense and listening skills!"
    },
    "grammar": {
      "title": "Figurative Language",
      "sentence": "What technique is used? Explain:",
      "instruction": "The wind whispered through the willow trees."
    },
    "grammarTip": "Alliteration = same consonant sounds at the start of nearby words. Personification = giving human qualities to non-human things.",
    "grammarAnswer": {
      "answer": "Alliteration (w, w, w) AND personification (wind whispers like a person).",
      "explanation": "Alliteration: wind/whispered/willow all start with w. Personification: wind whispered -- a human action given to weather."
    },
    "spelling": {
      "words": [
        "behaviour",
        "believe",
        "beneath",
        "benefit",
        "breathe"
      ],
      "instruction": "These start with b -- watch the vowel patterns!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Behaviour = be-hav-iour. Believe = be-lieve. Beneath = be-neath. Benefit = ben-e-fit. Breathe = long ee sound.",
    "spellingAnswer": {
      "answers": [
        "1  behaviour",
        "2  believe",
        "3  beneath",
        "4  benefit",
        "5  breathe"
      ],
      "tip": "Breathe (verb) vs breath (noun): I need to breathe vs Take a deep breath. Same letters, different form!"
    },
    "word": {
      "word": "thorough",
      "pos": "adjective",
      "blank": "The detective did a ___ search of the entire building before giving up.",
      "instruction": "What does thorough tell us about the search? What would a thorough search look like?"
    },
    "wordTip": "Thorough = complete and careful, leaving nothing out. Synonyms: detailed, careful. Antonyms: careless, hasty.",
    "wordAnswer": {
      "definition": "Complete, careful, and leaving nothing out.",
      "example": "Please do a thorough check of your work before handing it in."
    },
    "maths": {
      "title": "Multi-Step Problems",
      "problems": [
        "Sam has $50. Buys 3 books at $8.50 each. How much change?",
        "28 students split into groups of 4. How many groups?",
        "Rectangle 9cm x 6cm. Area?",
        "Train leaves 8:45am, arrives 11:20am. Journey time?",
        "120 marbles: 1/4 are red. How many red?"
      ]
    },
    "mathsTip": "3x8.50=25.50, 50-25.50=24.50. 28/4=7. 9x6=54cm2. 8:45 to 11:20=2h35. 120/4=30.",
    "mathsAnswer": {
      "answers": [
        "1   $24.50",
        "2   7 groups",
        "3   54 cm2",
        "4   2 hrs 35 min",
        "5   30 marbles"
      ],
      "tip": "Multi-step: identify ALL steps before calculating. What do I need to find FIRST? is the key question!"
    },
    "literacy": {
      "type": "Descriptive Weather Writing",
      "opener": "Write 2 sentences describing a storm using personification.",
      "task": "Make the storm sound alive and powerful.",
      "challenge": "Use strong, active verbs."
    },
    "riddle": {
      "riddle": "Why is the letter A like a flower?"
    },
    "riddleAnswer": {
      "answer": "Because a B always comes after it -- like a bee after a flower!",
      "explanation": "B follows A in the alphabet, just as bees follow flowers for nectar!"
    },
    "reflection": {
      "question": "What is one thing about today that you are looking forward to?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Photo Prompt",
      "instructions": "Show a beautiful or unusual photo. What is the story? What questions do you have?",
      "time": "4 min"
    },
    "value": {
      "name": "Wonder",
      "definition": "The feeling of amazement and curiosity about the world around you.",
      "discuss": "What is something in the world that fills you with a sense of wonder?"
    },
    "game": {
      "title": "Categories Speed Round",
      "howToPlay": "Name 10 things in a category as fast as possible. Class counts correct answers.",
      "rounds": "3 min",
      "bonus": "Use curriculum topics!"
    },
    "grammar": {
      "title": "Find the Modal Verb",
      "sentence": "Identify the modal verb in this sentence:",
      "instruction": "You should always wash your hands before eating."
    },
    "grammarTip": "Modal verbs show possibility, ability, permission or obligation. They appear BEFORE the main verb.",
    "grammarAnswer": {
      "answer": "should",
      "explanation": "Should = modal verb showing advice. Others: must = obligation, might = possibility, can = ability."
    },
    "spelling": {
      "words": [
        "conscience",
        "conscious",
        "controversial",
        "convenience",
        "curiosity"
      ],
      "instruction": "Challenging academic words -- use syllables!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Conscience = con-science (silent sc). Conscious = con-scious. Controversial = con-tro-ver-sial. Curiosity = cu-ri-os-i-ty.",
    "spellingAnswer": {
      "answers": [
        "1  conscience",
        "2  conscious",
        "3  controversial",
        "4  convenience",
        "5  curiosity"
      ],
      "tip": "Conscience vs conscious: conscience = your moral sense. Conscious = awake and aware. Both have con-sc!"
    },
    "word": {
      "word": "clever",
      "pos": "adjective",
      "blank": "The ___ fox found a way out of the trap that had held bigger animals for days.",
      "instruction": "What does clever tell us? Is it always positive?"
    },
    "wordTip": "Clever = quick to learn and understand. Synonyms: intelligent, smart, bright, witty. Antonyms: foolish, dim.",
    "wordAnswer": {
      "definition": "Quick at learning and understanding; intelligent and resourceful.",
      "example": "The clever student solved the puzzle in less than a minute."
    },
    "maths": {
      "title": "Statistics -- use this data set: 4, 7, 3, 7, 9, 5, 7",
      "problems": [
        "Mean (average)?",
        "Median (middle value)?",
        "Mode (most common)?",
        "Range?",
        "Total of all numbers?"
      ]
    },
    "mathsTip": "Total=42. Mean=42/7=6. Order: 3,4,5,7,7,7,9 = Median=7. Mode=7. Range=9-3=6.",
    "mathsAnswer": {
      "answers": [
        "1   6",
        "2   7",
        "3   7",
        "4   6",
        "5   42"
      ],
      "tip": "Mean=add all then divide. Median=middle (ORDER FIRST!). Mode=most common. Range=highest-lowest."
    },
    "literacy": {
      "type": "Diary Entry",
      "opener": "Write a diary entry from the perspective of a rainforest tree being cut down.",
      "task": "Use first person and past or present tense.",
      "challenge": "Show feelings AND events."
    },
    "riddle": {
      "riddle": "What question can you never answer Yes to?"
    },
    "riddleAnswer": {
      "answer": "Are you asleep? If you are asleep, you cannot answer!",
      "explanation": "You can only say No -- or give no answer at all. A classic logic riddle!"
    },
    "reflection": {
      "question": "What is one way you have grown or changed this year?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Emoji Check-In",
      "instructions": "Show 3 emojis that describe your mood. Partners interpret each other's emoji story.",
      "time": "3 min"
    },
    "value": {
      "name": "Patience",
      "definition": "Staying calm while waiting or dealing with a difficult situation.",
      "discuss": "Describe a time you had to be patient. How did it feel?"
    },
    "game": {
      "title": "Word Association",
      "howToPlay": "Say a word. The next student says the first word they associate with it. Go fast!",
      "rounds": "2 min",
      "bonus": "Try starting with a curriculum term!"
    },
    "grammar": {
      "title": "Write an Alliterative Sentence",
      "sentence": "Write a sentence where all main words start with the same sound.",
      "instruction": "Use the letter s. Aim for at least 6 words -- try to make it funny or creative!"
    },
    "grammarTip": "Alliteration = nearby words starting with the same consonant sound. Used in poetry, advertising and creative writing.",
    "grammarAnswer": {
      "answer": "e.g. Seven silver snakes slithered silently through the swamp.",
      "explanation": "All key words begin with s. Alliteration creates rhythm and makes text memorable -- used in brand names!"
    },
    "spelling": {
      "words": [
        "necessary",
        "occurred",
        "official",
        "opportunity",
        "ordinary"
      ],
      "instruction": "Common words -- check every letter!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Necessary = 1 c, double s. Occurred = double c AND double r! Official = of-fi-cial. Opportunity = double p.",
    "spellingAnswer": {
      "answers": [
        "1  necessary",
        "2  occurred",
        "3  official",
        "4  opportunity",
        "5  ordinary"
      ],
      "tip": "Occurred: double c AND double r -- oc-CURR-ed. Very common error. Write it 3 times emphasising the doubles."
    },
    "word": {
      "word": "soothing",
      "pos": "adjective",
      "blank": "The ___ music helped the baby fall asleep very quickly.",
      "instruction": "What does soothing tell us about the music? Describe something else as soothing."
    },
    "wordTip": "Soothing = gently calming and relaxing. Synonyms: calming, relaxing, peaceful. Antonyms: irritating, harsh.",
    "wordAnswer": {
      "definition": "Having a gently calming and reassuring effect.",
      "example": "She found the sound of rain on the roof very soothing and peaceful."
    },
    "maths": {
      "title": "Angles -- identify each type",
      "problems": [
        "An angle LESS than 90 degrees is called?",
        "Exactly 90 degrees?",
        "Between 90 and 180 degrees?",
        "Exactly 180 degrees?",
        "Greater than 180 degrees?"
      ]
    },
    "mathsTip": "Acute < 90. Right = exactly 90. Obtuse = 90 to 180. Straight = 180. Reflex > 180. Full rotation = 360.",
    "mathsAnswer": {
      "answers": [
        "1   acute",
        "2   right angle",
        "3   obtuse",
        "4   straight angle",
        "5   reflex"
      ],
      "tip": "An ACUTE angle is a CUTE little angle (small and sharp). OBtuse = OBviously bigger than a right angle."
    },
    "literacy": {
      "type": "Free Write",
      "opener": "Write non-stop for 5 minutes on the topic: If I could invent anything...",
      "task": "Do not stop writing -- do not worry about mistakes!",
      "challenge": "Share your favourite sentence with the class."
    },
    "riddle": {
      "riddle": "I start with e, end with e, but usually contain one letter. What am I?"
    },
    "riddleAnswer": {
      "answer": "An envelope.",
      "explanation": "Starts with E, ends with E, and contains one letter -- the one you put inside it!"
    },
    "reflection": {
      "question": "What is something you have been putting off that you should probably do?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Bucket Filler",
      "instructions": "Write an anonymous kind message for a classmate. Put it in their envelope on the desk.",
      "time": "5 min"
    },
    "value": {
      "name": "Generosity",
      "definition": "Giving freely of your time, kindness or resources to others.",
      "discuss": "What is the most generous thing anyone has ever done for you?"
    },
    "game": {
      "title": "Dictionary Race",
      "howToPlay": "Race to find a word in the dictionary. First to find it reads the definition aloud.",
      "rounds": "3 rounds",
      "bonus": "Use current topic vocabulary!"
    },
    "grammar": {
      "title": "Find the Onomatopoeia",
      "sentence": "Find the onomatopoeia words in this sentence:",
      "instruction": "The bees buzzed noisily while the brook babbled past."
    },
    "grammarTip": "Onomatopoeia = words that sound like what they describe. The word's sound matches the thing's sound!",
    "grammarAnswer": {
      "answer": "buzzed AND babbled",
      "explanation": "Buzzed = the sound bees make. Babbled = the sound of flowing water. Both sound like what they describe!"
    },
    "spelling": {
      "words": [
        "permanent",
        "persuade",
        "physical",
        "pleasant",
        "possess"
      ],
      "instruction": "Practise these useful academic words!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Permanent = per-ma-nent. Persuade = per-suade. Physical = ph makes f sound. Possess = two sets of double s!",
    "spellingAnswer": {
      "answers": [
        "1  permanent",
        "2  persuade",
        "3  physical",
        "4  pleasant",
        "5  possess"
      ],
      "tip": "Possess: pos-SESS. Two double-s pairs! I possess a hissing, messy snake -- easy to remember the pattern."
    },
    "word": {
      "word": "abundant",
      "pos": "adjective",
      "blank": "There was an ___ supply of fresh food at the harvest festival.",
      "instruction": "What does abundant tell us about the food supply? What is a synonym?"
    },
    "wordTip": "Abundant = more than enough; very plentiful. Synonyms: plentiful, ample, overflowing. Antonyms: scarce, limited.",
    "wordAnswer": {
      "definition": "Present in very large quantities; much more than enough.",
      "example": "The garden had abundant flowers after the spring rains."
    },
    "maths": {
      "title": "Probability -- use: impossible, unlikely, even chance, likely, certain",
      "problems": [
        "Rolling a 7 on a standard dice (1-6)",
        "Getting heads on a coin flip",
        "It will get dark tonight",
        "Picking a red card from a standard deck",
        "Rolling a number less than 4 on a dice (1-6)"
      ]
    },
    "mathsTip": "No 7 on dice = impossible. Coin = 1/2 = even. Dark tonight = certain. Red card = 26/52 = 1/2 = even. 1,2,3 = 3/6 = even.",
    "mathsAnswer": {
      "answers": [
        "1   impossible",
        "2   even chance",
        "3   certain",
        "4   even chance",
        "5   even chance"
      ],
      "tip": "Probability scale: impossible, unlikely, even chance, likely, certain. Use a probability number line!"
    },
    "literacy": {
      "type": "Story Hook",
      "opener": "Write the most exciting opening sentence you can imagine.",
      "task": "Use action, suspense or mystery.",
      "challenge": "Try starting with a verb!"
    },
    "riddle": {
      "riddle": "The more you take, the more you leave behind. What am I?"
    },
    "riddleAnswer": {
      "answer": "Footsteps.",
      "explanation": "Every step leaves a footprint behind -- the answer is footsteps!"
    },
    "reflection": {
      "question": "What is the best advice you have ever received?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  },
  {
    "greeting": {
      "activity": "Celebration Circle",
      "instructions": "Share one achievement you are proud of from this term. Celebrate each other!",
      "time": "5 min"
    },
    "value": {
      "name": "Growth",
      "definition": "Becoming better and wiser through effort, learning and experience.",
      "discuss": "What is the biggest way you have grown this year?"
    },
    "game": {
      "title": "Class Superlatives",
      "howToPlay": "Vote on: most likely to be a scientist, best storyteller, most creative. Celebrate everyone!",
      "rounds": "5 min",
      "bonus": "Add your own fun categories!"
    },
    "grammar": {
      "title": "Hyphens in Compound Adjectives",
      "sentence": "Explain why the hyphen is used:",
      "instruction": "A well-known author visited our school today."
    },
    "grammarTip": "Hyphens join words working TOGETHER as one adjective before a noun. Remove the noun -- hyphen is no longer needed.",
    "grammarAnswer": {
      "answer": "Well-known is hyphenated because it is a compound adjective before the noun author. Without a noun: The author is well known -- no hyphen.",
      "explanation": "Compound adjectives before nouns take hyphens: well-known, long-winded, ten-year-old. Remove the noun = drop the hyphen!"
    },
    "spelling": {
      "words": [
        "yacht",
        "yield",
        "exaggerate",
        "exercise",
        "experience"
      ],
      "instruction": "A mix of unusual patterns -- think carefully!",
      "labels": [
        "1",
        "2",
        "3",
        "4",
        "5"
      ]
    },
    "spellingTip": "Yacht = silent ch! Yield = y-ield. Exaggerate = double g. Exercise = no z! Experience = ex-per-i-ence.",
    "spellingAnswer": {
      "answers": [
        "1  yacht",
        "2  yield",
        "3  exaggerate",
        "4  exercise",
        "5  experience"
      ],
      "tip": "Yacht: the ch is completely silent -- Y-acht. Great for discussing how spelling does not always match pronunciation!"
    },
    "word": {
      "word": "remarkable",
      "pos": "adjective",
      "blank": "The young athlete's performance was truly ___ -- nobody could believe their eyes.",
      "instruction": "What does remarkable tell us? What makes something remarkable?"
    },
    "wordTip": "Remarkable = unusual or exceptional, deserving notice. Synonyms: extraordinary, outstanding, exceptional.",
    "wordAnswer": {
      "definition": "Unusual or exceptional in a way that deserves notice or praise.",
      "example": "She gave a remarkable speech that moved the entire audience to tears."
    },
    "maths": {
      "title": "Year Review -- Maths Challenge",
      "problems": [
        "15% of 200 = ?",
        "Area of triangle: base 8cm, height 5cm = ?",
        "Round 4.567 to 2 decimal places",
        "3/5 as a percentage = ?",
        "If a = 4, what is 3a + 7?"
      ]
    },
    "mathsTip": "15% of 200: 10%=20, 5%=10 = 30. Triangle=half x 8 x 5=20cm2. 4.567 to 2dp: 3rd decimal=7 round up=4.57. 3/5=60%. 3x4+7=19.",
    "mathsAnswer": {
      "answers": [
        "1   30",
        "2   20 cm2",
        "3   4.57",
        "4   60%",
        "5   19"
      ],
      "tip": "Triangle area = half x base x height. 3a+7 with a=4: substitute = 3x4+7=19. Great Year 5-6 extension topics!"
    },
    "literacy": {
      "type": "Year Reflection",
      "opener": "Write 3 sentences: one thing you learned, one thing you are proud of, one goal for next year.",
      "task": "Use full sentences and be specific.",
      "challenge": "Share with a partner."
    },
    "riddle": {
      "riddle": "What has a beginning and an end but no middle?"
    },
    "riddleAnswer": {
      "answer": "A doughnut! Or a journey -- it has a start and finish but the middle is just the path.",
      "explanation": "A fun trick question with room for creative answers!"
    },
    "reflection": {
      "question": "What is one thing you will always remember about this class?",
      "format": "THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion"
    }
  }
];

// ─────────────────────────────────────────────────────────────
// TEACHER TIP COMPONENT
// ─────────────────────────────────────────────────────────────
function TeacherTip({ tip }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position:'relative', display:'inline-flex' }}>
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ background:'#7C3AED', color:'white', border:'none', borderRadius:8,
                 padding:'5px 12px', cursor:'pointer', fontSize:13, fontWeight:700,
                 letterSpacing:'0.02em' }}>
        👩‍🏫 Teacher Tip
      </button>
      {show && (
        <div style={{ position:'absolute', bottom:'110%', right:0, background:'#1F2937',
                      color:'white', padding:'14px 18px', borderRadius:12, fontSize:14,
                      maxWidth:340, zIndex:9999, whiteSpace:'pre-line',
                      boxShadow:'0 8px 30px rgba(0,0,0,0.5)', lineHeight:1.55 }}>
          <div style={{ fontSize:11, fontWeight:800, color:'#A78BFA', marginBottom:7,
                        letterSpacing:'0.08em' }}>TEACHER TIP</div>
          {tip}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SECTIONS  (each can be toggled on/off per presentation)
// ─────────────────────────────────────────────────────────────
const ALL_SECTIONS = [
  { id: 'greeting',    label: 'Morning Greeting',    icon: '👋', default: true  },
  { id: 'value',       label: "Today's Value",        icon: '⭐', default: true  },
  { id: 'announcements', label: 'Announcements',      icon: '📢', default: true  },
  { id: 'game',        label: 'Morning Game',         icon: '🎮', default: true  },
  { id: 'grammar',     label: 'Grammar Challenge',    icon: '✏️', default: true  },
  { id: 'spelling',    label: 'Spelling Challenge',   icon: '🔤', default: true  },
  { id: 'word',        label: 'Word of the Day',      icon: '📖', default: true  },
  { id: 'maths',       label: 'Mental Maths',         icon: '🔢', default: true  },
  { id: 'literacy',    label: 'Literacy Prompt',      icon: '✍️', default: true  },
  { id: 'riddle',      label: 'Riddle of the Day',    icon: '🧩', default: true  },
  { id: 'reflection',  label: 'Morning Reflection',   icon: '💭', default: true  },
];

const safeLS = (key, def) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; } };
const setLS  = (key, val)  => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function MorningMeeting() {
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);

  // Core state
  const [mode, setMode]           = useState('edit'); // 'edit' | 'present'
  const [slide, setSlide]         = useState(0);
  const [dayIdx, setDayIdx]       = useState(0);

  // Teacher settings
  const [className, setClassName] = useState('');
  const [greeting, setGreeting]   = useState('Good Morning!');
  const [tagline, setTagline]     = useState("Let's start the day well.");
  const [sections, setSections]   = useState({});
  const [announcements, setAnnouncements] = useState({ focus: '', reminders: '', upcoming: '' });
  const [editOpen, setEditOpen]   = useState(null); // which section is open in editor

  // ── Auth check ──────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) { router.push('/login'); return; }
      setAuthReady(true);
    });
    return () => unsub();
  }, [router]);

  // ── Load saved settings ──────────────────────────────────────
  useEffect(() => {
    if (!authReady) return;
    setClassName(safeLS('mm_className', ''));
    setGreeting(safeLS('mm_greeting', 'Good Morning!'));
    setTagline(safeLS('mm_tagline', "Let's start the day well."));
    setAnnouncements(safeLS('mm_announcements', { focus: '', reminders: '', upcoming: '' }));
    const saved = safeLS('mm_sections', {});
    const defaults = {};
    ALL_SECTIONS.forEach(s => { defaults[s.id] = saved[s.id] !== undefined ? saved[s.id] : s.default; });
    setSections(defaults);

    const override = safeLS('mm_dayOverride', null);
    if (override !== null) { setDayIdx(override); } else {
      const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      setDayIdx((doy - 1) % 50);
    }
  }, [authReady]);

  // ── Save on change ───────────────────────────────────────────
  useEffect(() => { setLS('mm_sections', sections); }, [sections]);
  useEffect(() => { setLS('mm_className', className); }, [className]);
  useEffect(() => { setLS('mm_greeting', greeting); }, [greeting]);
  useEffect(() => { setLS('mm_tagline', tagline); }, [tagline]);
  useEffect(() => { setLS('mm_announcements', announcements); }, [announcements]);

  // ── Keyboard navigation in present mode ─────────────────────
  useEffect(() => {
    if (mode !== 'present') return;
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); setSlide(s => Math.min(s + 1, buildSlides().length - 1)); }
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); setSlide(s => Math.max(s - 1, 0)); }
      if (e.key === 'Escape') exitPresent();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mode, sections, dayIdx]);

  const day = DAYS[dayIdx] || DAYS[0];

  // ── Build slide sequence ─────────────────────────────────────
  const buildSlides = useCallback(() => {
    const list = [{ type: 'welcome' }];
    if (sections.greeting)     list.push({ type: 'greeting' });
    if (sections.value)        list.push({ type: 'value' });
    if (sections.announcements) list.push({ type: 'announcements' });
    if (sections.game)         list.push({ type: 'game' });
    if (sections.grammar)      { list.push({ type: 'grammar' }); list.push({ type: 'grammarAnswer' }); }
    if (sections.spelling)     { list.push({ type: 'spelling' }); list.push({ type: 'spellingAnswer' }); }
    if (sections.word)         { list.push({ type: 'word' });    list.push({ type: 'wordAnswer' }); }
    if (sections.maths)        { list.push({ type: 'maths' });   list.push({ type: 'mathsAnswer' }); }
    if (sections.literacy)     list.push({ type: 'literacy' });
    if (sections.riddle)       { list.push({ type: 'riddle' });  list.push({ type: 'riddleAnswer' }); }
    if (sections.reflection)   list.push({ type: 'reflection' });
    return list;
  }, [sections]);

  const slides = buildSlides();

  const startPresenting = () => { setSlide(0); setMode('present'); };
  const exitPresent = () => setMode('edit');

  const fmtDate = () => {
    const d = new Date();
    return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  // ── Pastel colours per section ───────────────────────────────
  const COLORS = {
    welcome: 'bg-violet-100 border-violet-300',
    greeting: 'bg-teal-100 border-teal-300',
    value: 'bg-amber-100 border-amber-300',
    announcements: 'bg-rose-100 border-rose-300',
    game: 'bg-green-100 border-green-300',
    grammar: 'bg-blue-100 border-blue-300',
    grammarAnswer: 'bg-blue-200 border-blue-400',
    spelling: 'bg-purple-100 border-purple-300',
    spellingAnswer: 'bg-purple-200 border-purple-400',
    word: 'bg-orange-100 border-orange-300',
    wordAnswer: 'bg-orange-200 border-orange-400',
    maths: 'bg-cyan-100 border-cyan-300',
    mathsAnswer: 'bg-cyan-200 border-cyan-400',
    literacy: 'bg-pink-100 border-pink-300',
    riddle: 'bg-yellow-100 border-yellow-300',
    riddleAnswer: 'bg-yellow-200 border-yellow-400',
    reflection: 'bg-indigo-100 border-indigo-300',
  };

  const HEADER_LABELS = {
    welcome:       '',
    greeting:      'MORNING GREETING',
    value:         "TODAY'S VALUE",
    announcements: 'ANNOUNCEMENTS',
    game:          'MORNING GAME',
    grammar:       'DAILY REVIEW – GRAMMAR CHALLENGE',
    grammarAnswer: 'ANSWER REVEALED',
    spelling:      'DAILY REVIEW – SPELLING CHALLENGE',
    spellingAnswer:'ANSWER REVEALED',
    word:          'DAILY REVIEW – WORD OF THE DAY',
    wordAnswer:    'ANSWER REVEALED',
    maths:         'DAILY REVIEW – MENTAL MATHS',
    mathsAnswer:   'ANSWER REVEALED',
    literacy:      'DAILY REVIEW – LITERACY PROMPT',
    riddle:        'RIDDLE OF THE DAY',
    riddleAnswer:  'ANSWER REVEALED',
    reflection:    'MORNING REFLECTION',
  };

  const SUB_LABELS = {
    grammarAnswer: 'Grammar', spellingAnswer: 'Spelling',
    wordAnswer: 'Vocabulary', mathsAnswer: 'Mental Maths', riddleAnswer: 'Riddle',
  };

  // ─────────────────────────────────────────────────────────────
  // SLIDE RENDERER (Present Mode)
  // ─────────────────────────────────────────────────────────────
  const renderSlide = (s) => {
    const t = s.type;
    const d = day;

    if (t === 'welcome') return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
        <div className="text-8xl">☀️</div>
        {className && <div className="text-5xl font-black text-violet-700">{className}</div>}
        <div className="text-7xl font-black text-gray-800 leading-tight">{greeting}</div>
        <div className="text-3xl font-bold text-gray-500 italic">{tagline}</div>
        <div className="text-2xl font-bold text-gray-400 mt-4">{fmtDate()}</div>
      </div>
    );

    if (t === 'greeting') return (
      <div className="flex flex-col gap-7">
        <div className="text-5xl font-black text-gray-800">{d.greeting.activity}</div>
        <div className="bg-white rounded-2xl border-2 border-teal-300 p-7 text-2xl font-semibold text-gray-700 leading-relaxed whitespace-pre-line">{d.greeting.instructions}</div>
        <div className="bg-teal-500 text-white rounded-xl px-7 py-4 text-3xl font-black text-center self-start">{d.greeting.time}</div>
      </div>
    );

    if (t === 'value') return (
      <div className="flex flex-col gap-7">
        <div className="text-7xl font-black text-amber-700 tracking-wide">{d.value.name}</div>
        <div className="bg-white rounded-2xl border-2 border-amber-300 p-7 text-2xl font-semibold text-gray-700 leading-relaxed">{d.value.definition}</div>
        <div className="bg-amber-50 rounded-2xl border-2 border-amber-400 p-6">
          <div className="text-lg font-black text-amber-700 uppercase tracking-widest mb-3">Discuss:</div>
          <div className="text-2xl font-bold text-gray-800 leading-relaxed">{d.value.discuss}</div>
        </div>
        <div className="text-xl font-bold text-gray-500 italic">💬 Discuss with a partner, then share with the class.</div>
      </div>
    );

    if (t === 'announcements') return (
      <div className="flex flex-col gap-6">
        {[
          { label: "Today's focus:", value: announcements.focus },
          { label: 'Reminders:', value: announcements.reminders },
          { label: 'Coming up:', value: announcements.upcoming },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border-2 border-rose-300 p-6">
            <div className="text-base font-black text-rose-600 uppercase tracking-widest mb-2">{label}</div>
            <div className="text-2xl font-semibold text-gray-800 leading-relaxed whitespace-pre-line">{value || '—'}</div>
          </div>
        ))}
      </div>
    );

    if (t === 'game') return (
      <div className="flex flex-col gap-6">
        <div className="text-4xl font-black text-green-800">{d.game.title}</div>
        <div className="bg-white rounded-2xl border-2 border-green-300 p-6">
          <div className="text-base font-black text-green-600 uppercase tracking-widest mb-3">How to play:</div>
          <div className="text-2xl font-semibold text-gray-700 leading-relaxed">{d.game.howToPlay}</div>
        </div>
        <div className="bg-green-50 rounded-2xl border-2 border-green-400 p-6 whitespace-pre-line text-2xl font-bold text-gray-800 leading-relaxed">{d.game.rounds}</div>
        {d.game.bonus && <div className="text-xl font-bold text-green-700 italic">⭐ {d.game.bonus}</div>}
      </div>
    );

    if (t === 'grammar') return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="text-4xl font-black text-blue-800">{d.grammar.title}</div>
          {d.grammarTip && <TeacherTip tip={d.grammarTip} />}
        </div>
        <div className="bg-white rounded-2xl border-2 border-blue-300 p-7 text-3xl font-bold text-gray-800 leading-relaxed italic">
          {d.grammar.sentence}
        </div>
        <div className="text-2xl font-semibold text-gray-700 leading-relaxed">{d.grammar.instruction}</div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 px-6 py-4 text-xl font-black text-blue-700">✏️ Write your answer in your book — think before you write!</div>
      </div>
    );

    if (t === 'grammarAnswer') return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="bg-blue-500 text-white rounded-2xl px-7 py-3 text-3xl font-black">{d.grammar.title}</div>
          {d.grammarTip && <TeacherTip tip={d.grammarTip} />}
        </div>
        <div className="bg-white rounded-2xl border-2 border-blue-400 p-7 text-3xl font-black text-gray-800 leading-relaxed whitespace-pre-line">{d.grammarAnswer.answer}</div>
        <div className="bg-blue-50 rounded-2xl border-2 border-blue-300 p-6">
          <div className="text-base font-black text-blue-600 uppercase tracking-widest mb-3">Why?</div>
          <div className="text-xl font-semibold text-gray-700 leading-relaxed whitespace-pre-line">{d.grammarAnswer.explanation}</div>
        </div>
      </div>
    );

    if (t === 'spelling') return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="text-3xl font-black text-purple-800">{d.spelling.instruction}</div>
          {d.spellingTip && <TeacherTip tip={d.spellingTip} />}
        </div>
        <div className="flex flex-col gap-4">
          {d.spelling.words.map((w, i) => (
            <div key={i} className="bg-white rounded-2xl border-2 border-purple-300 p-5 flex items-center gap-5">
              <div className="text-3xl font-black text-purple-500 w-12 flex-shrink-0">{d.spelling.labels[i]}</div>
              <div className="text-4xl font-black tracking-widest text-gray-800">{w}</div>
            </div>
          ))}
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-200 px-6 py-4 text-xl font-black text-purple-700">✏️ Write each word in your book — check your spelling before the reveal!</div>
      </div>
    );

    if (t === 'spellingAnswer') return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <div className="text-2xl font-black text-purple-800">Spelling Answers</div>
          {d.spellingTip && <TeacherTip tip={d.spellingTip} />}
        </div>
        <div className="flex flex-col gap-3">
          {d.spellingAnswer.answers.map((a, i) => (
            <div key={i} className="bg-white rounded-2xl border-2 border-purple-400 p-4 text-2xl font-black text-gray-800">{a}</div>
          ))}
        </div>
        <div className="bg-purple-50 rounded-2xl border-2 border-purple-300 p-5">
          <div className="text-base font-black text-purple-600 uppercase tracking-widest mb-3">Memory Tips:</div>
          <div className="text-xl font-semibold text-gray-700 whitespace-pre-line leading-relaxed">{d.spellingAnswer.tip}</div>
        </div>
      </div>
    );

    if (t === 'word') return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-baseline gap-4">
            <div className="text-6xl font-black text-orange-700">{d.word.word}</div>
            <div className="text-2xl font-bold text-orange-400 italic">{d.word.pos}</div>
          </div>
          {d.wordTip && <TeacherTip tip={d.wordTip} />}
        </div>
        <div className="bg-white rounded-2xl border-2 border-orange-300 p-7">
          <div className="text-base font-black text-orange-600 uppercase tracking-widest mb-3">Fill in the blank:</div>
          <div className="text-3xl font-bold text-gray-800 leading-relaxed italic">"{d.word.blank}"</div>
        </div>
        <div className="text-2xl font-semibold text-gray-700">{d.word.instruction}</div>
        <div className="bg-orange-50 rounded-xl border border-orange-200 px-6 py-4 text-xl font-black text-orange-700">✏️ Write a definition in your own words!</div>
      </div>
    );

    if (t === 'wordAnswer') return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="text-5xl font-black text-orange-700">{d.word.word}</div>
          {d.wordTip && <TeacherTip tip={d.wordTip} />}
        </div>
        <div className="bg-white rounded-2xl border-2 border-orange-400 p-6">
          <div className="text-base font-black text-orange-600 uppercase tracking-widest mb-3">Definition:</div>
          <div className="text-2xl font-semibold text-gray-800 leading-relaxed">{d.wordAnswer.definition}</div>
        </div>
        <div className="bg-orange-50 rounded-2xl border-2 border-orange-300 p-6">
          <div className="text-base font-black text-orange-600 uppercase tracking-widest mb-3">Example:</div>
          <div className="text-xl font-semibold text-gray-700 leading-relaxed italic">"{d.wordAnswer.example}"</div>
        </div>
      </div>
    );

    if (t === 'maths') return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="text-3xl font-black text-cyan-800">{d.maths.title}</div>
          {d.mathsTip && <TeacherTip tip={d.mathsTip} />}
        </div>
        <div className="flex flex-col gap-4">
          {d.maths.problems.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl border-2 border-cyan-300 p-6 text-3xl font-black text-gray-800">{p}</div>
          ))}
        </div>
        <div className="bg-cyan-50 rounded-xl border border-cyan-200 px-6 py-4 text-xl font-black text-cyan-700">✏️ Show all your working in your book!</div>
      </div>
    );

    if (t === 'mathsAnswer') return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-4">
          <div className="text-2xl font-black text-cyan-800">Maths Answers</div>
          {d.mathsTip && <TeacherTip tip={d.mathsTip} />}
        </div>
        <div className="flex flex-col gap-3">
          {d.mathsAnswer.answers.map((a, i) => (
            <div key={i} className="bg-white rounded-2xl border-2 border-cyan-400 p-4 text-2xl font-black text-gray-800">{a}</div>
          ))}
        </div>
        <div className="bg-cyan-50 rounded-2xl border-2 border-cyan-300 p-5">
          <div className="text-base font-black text-cyan-600 uppercase tracking-widest mb-3">Tip:</div>
          <div className="text-xl font-semibold text-gray-700 whitespace-pre-line leading-relaxed">{d.mathsAnswer.tip}</div>
        </div>
      </div>
    );

    if (t === 'literacy') return (
      <div className="flex flex-col gap-6">
        <div className="text-3xl font-black text-pink-800">{d.literacy.type}</div>
        <div className="bg-white rounded-2xl border-2 border-pink-300 p-7">
          <div className="text-base font-black text-pink-600 uppercase tracking-widest mb-3">Opening line:</div>
          <div className="text-3xl font-bold text-gray-800 italic leading-relaxed">"{d.literacy.opener}"</div>
        </div>
        <div className="text-2xl font-semibold text-gray-700 leading-relaxed">{d.literacy.task}</div>
        <div className="bg-pink-50 rounded-2xl border-2 border-pink-300 p-5">
          <div className="text-base font-black text-pink-600 uppercase tracking-widest mb-2">CHALLENGE:</div>
          <div className="text-xl font-bold text-gray-700">{d.literacy.challenge}</div>
        </div>
        <div className="bg-pink-50 rounded-xl border border-pink-200 px-6 py-4 text-xl font-black text-pink-700">✏️ Write your response in your book!</div>
      </div>
    );

    if (t === 'riddle') return (
      <div className="flex flex-col items-center justify-center h-full gap-8 text-center">
        <div className="text-8xl">🧩</div>
        <div className="bg-white rounded-3xl border-2 border-yellow-300 p-9 text-4xl font-black text-gray-800 leading-relaxed max-w-3xl">
          "{d.riddle.riddle}"
        </div>
        <div className="text-2xl font-bold text-yellow-700 italic">Think about it... discuss with your partner, then we'll reveal!</div>
      </div>
    );

    if (t === 'riddleAnswer') return (
      <div className="flex flex-col gap-7">
        <div className="text-7xl font-black text-yellow-700 text-center tracking-wide">{d.riddleAnswer.answer}</div>
        <div className="bg-yellow-50 rounded-2xl border-2 border-yellow-300 p-7">
          <div className="text-base font-black text-yellow-600 uppercase tracking-widest mb-3">Explanation:</div>
          <div className="text-2xl font-semibold text-gray-700 leading-relaxed">{d.riddleAnswer.explanation}</div>
        </div>
      </div>
    );

    if (t === 'reflection') return (
      <div className="flex flex-col gap-7">
        <div className="bg-white rounded-2xl border-2 border-indigo-300 p-7 text-3xl font-bold text-gray-800 leading-relaxed">{d.reflection.question}</div>
        <div className="grid grid-cols-3 gap-5">
          {d.reflection.format.split('\n').map((step, i) => {
            const [label, ...rest] = step.split('→');
            const colors = ['bg-indigo-100 border-indigo-300 text-indigo-800', 'bg-purple-100 border-purple-300 text-purple-800', 'bg-pink-100 border-pink-300 text-pink-800'];
            return (
              <div key={i} className={`rounded-2xl border-2 p-5 text-center ${colors[i]}`}>
                <div className="text-3xl font-black">{label.trim()}</div>
                <div className="text-base font-bold mt-2 opacity-75">{rest.join('→').trim()}</div>
              </div>
            );
          })}
        </div>
        <div className="text-2xl font-black text-indigo-600 text-center">Have a great learning day{className ? `, ${className}` : ''}! 🌟</div>
      </div>
    );

    return <div className="text-gray-400">Slide: {t}</div>;
  };

  if (!authReady) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // PRESENT MODE
  // ─────────────────────────────────────────────────────────────
  if (mode === 'present') {
    const current = slides[slide];
    const sType = current?.type;
    const colorClass = COLORS[sType] || 'bg-gray-100 border-gray-300';
    const headerLabel = HEADER_LABELS[sType] || '';
    const subLabel = SUB_LABELS[sType] || '';
    const isAnswerReveal = sType?.endsWith('Answer');
    const total = slides.length;

    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#f8f4ff' }}>
        <Head><title>Morning Meeting — Presenting</title></Head>

        {/* Section header bar */}
        {headerLabel && (
          <div className={`flex items-center gap-3 px-8 py-3 border-b-4 border-black ${colorClass}`}>
            {isAnswerReveal && <span className="text-3xl">✅</span>}
            <span className="text-2xl font-black tracking-widest uppercase">{headerLabel}</span>
            {subLabel && <span className="text-xl font-bold opacity-60 ml-2">— {subLabel}</span>}
          </div>
        )}

        {/* Slide content */}
        <div className="flex-1 overflow-y-auto px-12 py-8 flex flex-col justify-center">
          {renderSlide(current)}
        </div>

        {/* Navigation bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t-3 border-gray-200 shadow-sm gap-4">
          <button onClick={exitPresent} className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm transition-colors">✕ Exit</button>
          <div className="flex items-center gap-3">
            <button onClick={() => setSlide(s => Math.max(0, s-1))} disabled={slide === 0}
              className="px-5 py-2 rounded-xl bg-violet-100 hover:bg-violet-200 disabled:opacity-30 disabled:cursor-default text-violet-800 font-black text-xl transition-colors">◀</button>
            <span className="font-bold text-gray-500 min-w-16 text-center text-sm">{slide + 1} / {total}</span>
            <button onClick={() => setSlide(s => Math.min(s+1, total-1))} disabled={slide === total-1}
              className="px-5 py-2 rounded-xl bg-violet-100 hover:bg-violet-200 disabled:opacity-30 disabled:cursor-default text-violet-800 font-black text-xl transition-colors">▶</button>
          </div>
          <button onClick={() => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); }}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm transition-colors">⛶</button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // EDIT MODE
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg,#fdf6ff 0%,#f0f9ff 50%,#fff7ed 100%)' }}>
      <Head><title>Morning Meeting Presenter | Educational Elements</title></Head>

      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-violet-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <button onClick={() => router.push('/curriculum')} className="text-violet-600 font-bold text-sm hover:underline">← Back</button>
          <h1 className="text-xl font-black text-gray-800">🌟 Morning Meeting Presenter</h1>
          <button onClick={startPresenting}
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-xl shadow-md hover:shadow-lg transition-all text-sm">
            ▶ Start Presenting
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Welcome slide config */}
        <div className="bg-white rounded-3xl border-2 border-violet-200 p-6 shadow-sm">
          <h2 className="text-lg font-black text-gray-700 mb-4">🌟 Welcome Slide</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Class Name</label>
              <input value={className} onChange={e => setClassName(e.target.value)} placeholder="e.g. 6C"
                className="mt-1 w-full border-2 border-gray-200 rounded-xl px-4 py-2 font-bold text-gray-800 focus:outline-none focus:border-violet-400" />
            </div>
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Greeting</label>
              <input value={greeting} onChange={e => setGreeting(e.target.value)}
                className="mt-1 w-full border-2 border-gray-200 rounded-xl px-4 py-2 font-bold text-gray-800 focus:outline-none focus:border-violet-400" />
            </div>
            <div>
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Tagline</label>
              <input value={tagline} onChange={e => setTagline(e.target.value)}
                className="mt-1 w-full border-2 border-gray-200 rounded-xl px-4 py-2 font-bold text-gray-800 focus:outline-none focus:border-violet-400" />
            </div>
          </div>
        </div>

        {/* Day + section config */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Day selector */}
          <div className="bg-white rounded-3xl border-2 border-blue-200 p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-700 mb-3">📅 Day Rotation</h2>
            <p className="text-sm text-gray-500 mb-3">Content auto-rotates daily through 50 days. Override if needed.</p>
            <div className="flex items-center gap-3">
              <input type="number" min={1} max={50} value={dayIdx + 1}
                onChange={e => { const v = Math.max(1, Math.min(50, parseInt(e.target.value)||1)); setDayIdx(v-1); setLS('mm_dayOverride', v-1); }}
                className="w-20 border-2 border-gray-200 rounded-xl px-3 py-2 font-black text-center text-gray-800 focus:outline-none focus:border-blue-400" />
              <span className="text-sm font-bold text-gray-500">/ 50</span>
              <button onClick={() => { setLS('mm_dayOverride', null); const doy = Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0).getTime())/86400000); setDayIdx((doy-1)%50); }}
                className="text-sm font-bold text-blue-600 hover:underline ml-2">Auto</button>
            </div>
          </div>

          {/* Section toggles */}
          <div className="bg-white rounded-3xl border-2 border-green-200 p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-700 mb-3">✅ Active Sections</h2>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {ALL_SECTIONS.map(sec => (
                <label key={sec.id} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!sections[sec.id]}
                    onChange={e => setSections(prev => ({ ...prev, [sec.id]: e.target.checked }))}
                    className="w-4 h-4 accent-violet-600" />
                  <span className="text-sm font-bold text-gray-700">{sec.icon} {sec.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Announcements editor */}
        {sections.announcements && (
          <div className="bg-white rounded-3xl border-2 border-rose-200 p-6 shadow-sm">
            <h2 className="text-lg font-black text-gray-700 mb-4">📢 Announcements</h2>
            <div className="grid grid-cols-1 gap-4">
              {[
                { key: 'focus', label: "Today's focus:" },
                { key: 'reminders', label: 'Reminders:' },
                { key: 'upcoming', label: 'Coming up:' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="text-xs font-black text-rose-500 uppercase tracking-widest">{label}</label>
                  <textarea value={announcements[key]}
                    onChange={e => setAnnouncements(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder="(add your note here)"
                    rows={2}
                    className="mt-1 w-full border-2 border-gray-200 rounded-xl px-4 py-2 font-semibold text-gray-800 focus:outline-none focus:border-rose-400 resize-none" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview sections */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-gray-700">📋 Today's Content Preview</h2>
          <p className="text-sm text-gray-500">These are pulled from Day {dayIdx + 1}. All sections appear exactly as shown during presentation.</p>

          {ALL_SECTIONS.filter(sec => sec.id !== 'announcements' && sections[sec.id]).map(sec => {
            const isOpen = editOpen === sec.id;
            const d = day;
            return (
              <div key={sec.id} className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
                <button onClick={() => setEditOpen(isOpen ? null : sec.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{sec.icon}</span>
                    <span className="font-black text-gray-700">{sec.label}</span>
                  </div>
                  <span className="text-gray-400 font-bold">{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-gray-100 bg-gray-50 text-sm font-semibold text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {sec.id === 'greeting' && `Activity: ${d.greeting.activity}\n\n${d.greeting.instructions}\n\n⏱ ${d.greeting.time}`}
                    {sec.id === 'value' && `Value: ${d.value.name}\n\nDefinition: ${d.value.definition}\n\nDiscuss: ${d.value.discuss}`}
                    {sec.id === 'game' && `${d.game.title}\n\n${d.game.howToPlay}\n\n${d.game.rounds}${d.game.bonus ? '\n\n⭐ ' + d.game.bonus : ''}`}
                    {sec.id === 'grammar' && `${d.grammar.title}\n\n${d.grammar.sentence}\n\nInstruction: ${d.grammar.instruction}\n\n→ Answer: ${d.grammarAnswer.answer}`}
                    {sec.id === 'spelling' && `Words:\n${d.spelling.words.join('\n')}\n\nInstruction: ${d.spelling.instruction}\n\n→ Answers: ${d.spellingAnswer.answers.join(' / ')}`}
                    {sec.id === 'word' && `Word: ${d.word.word} (${d.word.pos})\n\nBlank: "${d.word.blank}"\n\n→ Definition: ${d.wordAnswer.definition}`}
                    {sec.id === 'maths' && `${d.maths.title}\n\n${d.maths.problems.join('\n')}\n\n→ Answers: ${d.mathsAnswer.answers.join(' / ')}`}
                    {sec.id === 'literacy' && `Type: ${d.literacy.type}\n\nOpener: "${d.literacy.opener}"\n\n${d.literacy.task}\n\nChallenge: ${d.literacy.challenge}`}
                    {sec.id === 'riddle' && `"${d.riddle.riddle}"\n\n→ Answer: ${d.riddleAnswer.answer}\n${d.riddleAnswer.explanation}`}
                    {sec.id === 'reflection' && `"${d.reflection.question}"\n\nFormat: ${d.reflection.format}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Start button bottom */}
        <div className="flex justify-center pt-4 pb-8">
          <button onClick={startPresenting}
            className="px-10 py-4 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all text-xl">
            ▶ Start Presenting
          </button>
        </div>
      </div>
    </div>
  );
}
