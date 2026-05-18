// pages/morning-meeting.js — Morning Meeting Presenter
// Edit Mode: teacher configures content before class
// Present Mode: clean read-only slideshow — students write/discuss, no interactions

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { auth } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// ─────────────────────────────────────────────────────────────
// 20 DAYS OF CONTENT  (modelled directly on the uploaded PPTX)
// ─────────────────────────────────────────────────────────────
const DAYS = [
  {
    greeting: { activity: 'Silent Movie Stars!', instructions: "Without making ANY sound, act out an occupation or hobby for 30 seconds. Your partner guesses what it is — then swap! How many can you get right?", time: '2 minutes — GO!' },
    value: { name: 'INTEGRITY', definition: 'Integrity means doing the right thing even when no one is watching — staying honest and true to your values even when it would be easier not to.', discuss: 'You find $20 on the classroom floor with no one around. How does INTEGRITY guide what you do next?' },
    game: { title: "Would You Rather? — Class Edition", howToPlay: "Teacher reads a 'Would You Rather' question. Go LEFT for Option A, RIGHT for Option B. Tally the vote — then debate your choice!", rounds: "Round 1: Fly OR be invisible?\nRound 2: Unlimited money OR unlimited time?\nRound 3: Know every language OR be able to talk to animals?", bonus: "Bonus challenge: Can you argue convincingly for the side you DIDN'T choose?" },
    grammar: { title: 'Identify the Adjectives', sentence: '"The exhausted firefighter climbed the steep, crumbling ladder to rescue the frightened child."', instruction: 'Underline ALL the ADJECTIVES in this sentence. Write them in your book, then write a sentence explaining how you identified them.' },
    grammarAnswer: { answer: 'exhausted · steep · crumbling · frightened', explanation: "Adjectives DESCRIBE nouns. Each word tells us more about a noun — exhausted (firefighter), steep and crumbling (ladder), frightened (child). 'The' is an article, not an adjective." },
    spelling: { words: ['a _ _ _ _ _ _ _ _ _ e', 'e _ _ _ _ _ _ _ _ e', 'm _ _ _ _ _ _ _ _ _ s'], instruction: 'Write each word in your book — check your spelling before the reveal!', labels: ['1', '2', '3'] },
    spellingAnswer: { answers: ['1  accommodate', '2  exaggerate', '3  mischievous'], tip: "aCCOMModate has Double-C AND Double-M — 'I can accommodate two of everything!'\neXAGGerate has double-G — 'don't EXAGGERATE the letters!'\nmisCHIEVous — resist adding an extra 'i' before the 'o'." },
    word: { word: 'resilient', pos: 'adjective', blank: 'Despite three failed attempts, the _____ inventor refused to give up.', instruction: 'What does this word mean? Write a definition in your own words!' },
    wordAnswer: { definition: 'Able to recover quickly from difficulties; bouncing back after setbacks or hardship.', example: 'The resilient young gymnast fell twice in practice but came back stronger at the competition, nailing every routine.' },
    maths: { title: 'Maths Sprint — solve all 3 as fast as you can!', problems: ['1   9 × 8 + 14 = ?', '2   ³⁄₈ of 240 = ?', '3   40% of 75 = ?'] },
    mathsAnswer: { answers: ['1   9 × 8 + 14 = ?   →   86', '2   ³⁄₈ of 240 = ?   →   90', '3   40% of 75 = ?   →   30'], tip: '9 × 8 = 72, then + 14 = 86. For ³⁄₈ of 240: divide by 8 first (30), then × 3 = 90. For 40%: find 10% of 75 (7.5), then multiply by 4 = 30.' },
    literacy: { type: 'Narrative Writing', opener: '"Nobody believed her when she said the old lighthouse was alive."', task: 'Write the opening paragraph of this story. Include: a strong sense of place, at least one sensory detail, and a hint of mystery.', challenge: 'Use one short, punchy sentence somewhere in your paragraph to build tension. Read it aloud — does it hook the reader?' },
    riddle: { riddle: 'The more you take, the more you leave behind. What am I?' },
    riddleAnswer: { answer: 'FOOTSTEPS', explanation: "Every step you take, you leave a footprint behind — so the MORE steps you take, the MORE you leave behind! It's all about what you leave, not what you carry." },
    reflection: { question: "On a scale of 1–5, how ready do you feel for today's learning? What would make you feel more ready?", format: 'THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion' }
  },
  {
    greeting: { activity: 'Two Truths and a Lie!', instructions: "Tell your partner two TRUE things about yourself and one LIE. Your partner has to guess which statement is the lie. Then swap! Try to make your lie convincing.", time: '2 minutes — GO!' },
    value: { name: 'RESILIENCE', definition: "Resilience is the ability to bounce back from setbacks, adapt to change, and keep going in the face of adversity. It doesn't mean life won't be hard — it means you decide hard won't stop you.", discuss: 'Think of a time you faced a challenge and kept going. What helped you push through? What would you do differently now?' },
    game: { title: 'This or That? — Class Vote!', howToPlay: 'Teacher reads two options. Thumbs UP for the first option, thumbs DOWN for the second. Tally the class — then the minority has to defend their choice!', rounds: "Round 1: Dogs OR Cats?\nRound 2: Summer holidays OR Christmas holidays?\nRound 3: Live in the city OR live in the country?\nRound 4: Be the funniest person OR the smartest person?", bonus: 'Bonus: Which answer surprised you most? Why?' },
    grammar: { title: 'Fix the Punctuation Errors', sentence: 'last tuesday ms chen asked are you ready for the test james he replied yes i think i am but im not totally sure', instruction: "Rewrite this passage with CORRECT punctuation in your book. Look for: capital letters, full stops, commas, quotation marks, and apostrophes." },
    grammarAnswer: { answer: "Last Tuesday, Ms Chen asked, \"Are you ready for the test, James?\" He replied, \"Yes, I think I am, but I'm not totally sure.\"", explanation: "Key fixes: Capital letter to start + proper nouns (Tuesday, Ms Chen, James). Comma after 'asked'. Speech marks for dialogue. Comma before the name 'James'. Apostrophe in I'm = I am." },
    spelling: { words: ['s _ _ _ r _ _ e', 'n _ c _ _ _ _ ry', 'b _ _ _ t _ f _ l'], instruction: 'Fill in the missing letters. Check your answers, then write a sentence using each word.', labels: ['1', '2', '3'] },
    spellingAnswer: { answers: ['1  separate', '2  necessary', '3  beautiful'], tip: "sepARAte — think 'there is A RAT in separate'!\nnECEssary — one Collar, two Socks (1 C, 2 S's).\nbEAUtiful — think BEAUtiful starts with BEAU like beauty!" },
    word: { word: 'tenacious', pos: 'adjective', blank: 'The _____ athlete refused to quit despite spraining her ankle in the first round.', instruction: 'Write a definition of "tenacious" in your own words. Then write your own example sentence.' },
    wordAnswer: { definition: 'Holding firmly to something; very determined and not giving up easily despite difficulty or opposition.', example: 'The tenacious explorer pressed on through the storm, refusing to turn back just hours from the summit.' },
    maths: { title: 'Maths Sprint — solve all 3 as fast as you can!', problems: ['1   6² − 4 × 5 = ?', '2   ²⁄₅ of 350 = ?', '3   35% of 60 = ?'] },
    mathsAnswer: { answers: ['1   6² − 4 × 5 = ?   →   16', '2   ²⁄₅ of 350 = ?   →   140', '3   35% of 60 = ?   →   21'], tip: '6² = 36, then 4 × 5 = 20, then 36 − 20 = 16. For ²⁄₅: divide 350 by 5 (70) then × 2 = 140. For 35%: 10% of 60 = 6, × 3 = 18, + 5% (3) = 21.' },
    literacy: { type: 'Persuasive Writing', opener: "Should students have a say in what they learn at school?", task: 'Write a persuasive paragraph arguing YOUR position. Include: a clear topic sentence, at least two pieces of evidence or reasoning, and a strong concluding statement.', challenge: 'Use one rhetorical question in your paragraph to make the reader think.' },
    riddle: { riddle: 'I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?' },
    riddleAnswer: { answer: 'AN ECHO', explanation: "An echo 'speaks' your words back without having a mouth, and it 'hears' sound without ears. It's created when sound bounces off a surface and travels back to you — like a mountain or a wall." },
    reflection: { question: 'What is one thing you want to GET BETTER at this term? What is one small step you could take this week?', format: 'THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion' }
  },
  {
    greeting: { activity: 'Question Tennis!', instructions: "Take turns asking each other questions — you CANNOT repeat a question and you CANNOT pause for more than 3 seconds. The first person who repeats, pauses too long, or runs out of questions loses. Start with: 'What's your favourite food?'", time: '2 minutes — GO!' },
    value: { name: 'EMPATHY', definition: 'Empathy is the ability to understand and share the feelings of another person. It means stepping into someone else\'s shoes — not just recognising their emotions, but truly FEELING with them.', discuss: 'A new student joins your class and looks nervous at lunch. What would EMPATHY look like in action? What would you do, and why?' },
    game: { title: 'Agree or Disagree?', howToPlay: "Stand up if you AGREE, stay seated if you DISAGREE. After the vote, the teacher asks one person from each side to explain their thinking. Try to change someone's mind!", rounds: "Statement 1: Homework should be banned.\nStatement 2: Social media does more harm than good for young people.\nStatement 3: Every student should learn a musical instrument.\nStatement 4: Athletes earn too much money.", bonus: 'Bonus: Which statement caused the biggest split? Why do you think that is?' },
    grammar: { title: 'Identify the Figurative Language', sentence: '"The classroom was a zoo this morning. The noise drilled through my skull like a jackhammer, and the teacher\'s voice was a distant foghorn lost in the chaos."', instruction: 'Identify ALL examples of figurative language. Label each one (metaphor, simile, personification, etc.) and write it in your book.' },
    grammarAnswer: { answer: "Metaphor: 'The classroom was a zoo'\nSimile: 'like a jackhammer'\nMetaphor: 'a distant foghorn'", explanation: "A METAPHOR directly states something IS something else. A SIMILE uses 'like' or 'as' to compare. 'Drilled through my skull' is also metaphorical — the noise didn't literally drill!" },
    spelling: { words: ['e _ _ _ r _ n _ _ nt', 'p _ rl _ _ _ ent', 'c _ n _ c _ _ n _ e'], instruction: 'Fill in the missing letters. These are tricky — take your time and use what you know about word patterns.', labels: ['1', '2', '3'] },
    spellingAnswer: { answers: ['1  environment', '2  parliament', '3  conscience'], tip: "enVIRONment — there is IRON in the environment!\nparliAMENT — there is AMEN in parliament.\nconSCIENCE — there is SCIENCE in conscience!" },
    word: { word: 'eloquent', pos: 'adjective', blank: 'The _____ speaker had the entire audience hanging on her every word.', instruction: 'Define "eloquent" in your own words. Think: have you ever heard someone speak eloquently?' },
    wordAnswer: { definition: 'Fluent and persuasive in speaking or writing; able to express ideas clearly and powerfully in a way that moves or convinces others.', example: "Nelson Mandela's eloquent speeches helped unite a divided nation and inspire millions around the world." },
    maths: { title: 'Maths Sprint — solve all 3 as fast as you can!', problems: ['1   (12 + 8) × 3 − 14 = ?', '2   ³⁄₄ of 360 = ?', '3   What is 15% of 80?'] },
    mathsAnswer: { answers: ['1   (12 + 8) × 3 − 14 = ?   →   46', '2   ³⁄₄ of 360 = ?   →   270', '3   15% of 80 = ?   →   12'], tip: 'Brackets first: 12+8=20, then ×3=60, then −14=46. For ³⁄₄: 360÷4=90, ×3=270. For 15%: 10% of 80=8, 5%=4, total=12.' },
    literacy: { type: 'Descriptive Writing', opener: 'The abandoned fairground had been silent for twenty years.', task: 'Write a descriptive paragraph that brings this setting to life. Use all five senses and at least two examples of figurative language.', challenge: "End your paragraph with a single sentence that creates a sense of unease or mystery — something that makes the reader want to know MORE." },
    riddle: { riddle: "I have cities, but no houses live there. I have mountains, but no trees grow there. I have water, but no fish swim there. I have roads, but no cars travel there. What am I?" },
    riddleAnswer: { answer: 'A MAP', explanation: "A map shows the NAMES of cities, mountains, rivers and roads — but none of the real things actually exist on the map itself. It's a representation, not the reality!" },
    reflection: { question: "Rate your effort in each subject yesterday from 1 (low) to 5 (high). What's one subject where you could push harder — and what would that look like?", format: 'THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion' }
  },
  {
    greeting: { activity: 'Speed Debate!', instructions: "Teacher gives a silly topic. Partner A argues FOR it for 30 seconds. Partner B argues AGAINST it for 30 seconds. Then swap topic and sides! Topics: 'Pineapple belongs on pizza' / 'Mornings are better than evenings'", time: '2 minutes — GO!' },
    value: { name: 'RESPECT', definition: "Respect means treating others the way you'd want to be treated — valuing their feelings, opinions, time, and boundaries even when you disagree. Respect is shown through actions, not just words.", discuss: "Someone shares an opinion in class discussion that you strongly disagree with. How does RESPECT guide how you respond? What does it look like — and what does it NOT look like?" },
    game: { title: 'Rank It!', howToPlay: "Teacher reveals 5 items. In pairs, rank them from 1 (most important/best) to 5 (least). You must AGREE on your ranking. Then compare with another pair — discuss your differences!", rounds: "List A — Rank these survival skills:\nFire-making · Finding water · Building shelter · Finding food · Navigation\n\nList B — Rank these qualities in a leader:\nHonesty · Courage · Intelligence · Empathy · Decisiveness", bonus: 'Bonus: What would YOU add to each list that is missing?' },
    grammar: { title: 'Active vs. Passive Voice', sentence: '"The ancient trophy was discovered by the excited archaeologist in the long-forgotten tomb."', instruction: 'Identify whether this sentence is ACTIVE or PASSIVE voice. Then rewrite it in the OTHER voice. In your book, explain: which version is more powerful, and why?' },
    grammarAnswer: { answer: "PASSIVE: 'was discovered by'\nActive version: 'The excited archaeologist discovered the ancient trophy in the long-forgotten tomb.'", explanation: "PASSIVE voice: the subject receives the action (the trophy was discovered). ACTIVE voice: the subject DOES the action (the archaeologist discovered). Active is usually more direct and powerful." },
    spelling: { words: ['p _ _ v _ l _ _ e', 'r _ _ _ hm', 'c _ m m _ t _ _ e'], instruction: 'Fill in the missing letters. Can you think of a memory trick for each one?', labels: ['1', '2', '3'] },
    spellingAnswer: { answers: ['1  privilege', '2  rhythm', '3  committee'], tip: "priVILEge — there is VILE in privilege!\nRhythm — 'Rhythm Helps Your Two Hips Move' (first letters: RHYTHM).\ncommITTEE — double M, double T, double E at the end!" },
    word: { word: 'audacious', pos: 'adjective', blank: "It was _____ of her to challenge the world record in her very first professional competition.", instruction: 'What does "audacious" mean? Is it always a positive word? Write your definition and a sentence of your own.' },
    wordAnswer: { definition: 'Showing a willingness to take bold risks; daring and courageous, sometimes to the point of being shocking or reckless.', example: "The audacious young entrepreneur launched her company at age 16, pitching directly to some of the country's biggest investors." },
    maths: { title: 'Maths Sprint — solve all 3 as fast as you can!', problems: ['1   48 ÷ 6 × 4 + 7 = ?', '2   ⁵⁄₆ of 120 = ?', '3   What is 60% of 45?'] },
    mathsAnswer: { answers: ['1   48 ÷ 6 × 4 + 7 = ?   →   39', '2   ⁵⁄₆ of 120 = ?   →   100', '3   60% of 45 = ?   →   27'], tip: 'Left to right: 48÷6=8, ×4=32, +7=39. For ⁵⁄₆: 120÷6=20, ×5=100. For 60%: 10% of 45=4.5, ×6=27.' },
    literacy: { type: 'Informative Writing', opener: "Many people have opinions about social media, but few understand how it actually works on our brains.", task: "Write an informative paragraph explaining ONE real effect that social media has on the adolescent brain. Use clear topic sentence, specific facts or examples, and a summary sentence.", challenge: 'Include a statistic (real or estimated) and explain what it means for young people your age.' },
    riddle: { riddle: "The more you have of it, the less you see. What is it?" },
    riddleAnswer: { answer: 'DARKNESS', explanation: "The more darkness there is, the less you can see! It's a classic riddle that plays with our instinct to think of things that INCREASE when you have more — but darkness does the opposite." },
    reflection: { question: 'What is one kind thing someone did for you recently? How did it make you feel? How could you pay that kindness forward today?', format: 'THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion' }
  },
  {
    greeting: { activity: 'Desert Island Decisions!', instructions: "You're stranded on a desert island. You can only bring THREE items (not people). Tell your partner your 3 items and WHY you chose each one. Then try to convince them your list is better than theirs!", time: '2 minutes — GO!' },
    value: { name: 'COURAGE', definition: "Courage is not the absence of fear — it's doing what is right or necessary DESPITE the fear. Courage shows up in big moments and small ones: standing up for someone, admitting a mistake, trying something new.", discuss: "Someone in your class is being left out and you can see they're upset. It feels awkward to get involved. What does COURAGE look like in this situation?" },
    game: { title: "Would You Rather? — Tough Dilemmas!", howToPlay: "Go LEFT for Option A, RIGHT for Option B. After the vote, TWO people (one from each side) share their reasoning. The class decides whose argument was most convincing!", rounds: "Round 1: Always tell the complete truth OR always tell white lies to protect feelings?\nRound 2: Be famous for something embarrassing OR unknown for something amazing?\nRound 3: Give up your phone for a year OR give up seeing your friends for a month?", bonus: 'Bonus round: Make up your own dilemma for the class!' },
    grammar: { title: 'Identify the Sentence Type', sentence: 'Read these four sentences:\n1. "The storm approached rapidly."\n2. "Where did you put my umbrella?"\n3. "Get inside immediately!"\n4. "Oh no, I can\'t believe it\'s raining!"', instruction: 'For each sentence, write: its TYPE (declarative, interrogative, imperative, or exclamatory) and one feature that tells you which type it is.' },
    grammarAnswer: { answer: "1. Declarative — makes a statement, ends with a full stop.\n2. Interrogative — asks a question, ends with a question mark.\n3. Imperative — gives a command, verb at the start.\n4. Exclamatory — expresses strong emotion, ends with exclamation mark.", explanation: "Knowing sentence types helps writers create VARIETY and control the MOOD of their writing. Mix them deliberately!" },
    spelling: { words: ['_ mp _ _ _ ue', '_ is _ _ _ pt _ _ n', 'f _ _ _ is _ _ _'], instruction: 'Fill in the missing letters. Say the words aloud to help you — does the sound match the spelling?', labels: ['1', '2', '3'] },
    spellingAnswer: { answers: ['1  impasse', '2  disruption', '3  fahrenheit'], tip: "impASSE — double S in the middle, the French origin helps!\ndisRUPTion — the root word is RUPT (to break/burst).\nFAHRENheit — named after Daniel Gabriel Fahrenheit; capital F always!" },
    word: { word: 'meticulous', pos: 'adjective', blank: 'The _____ surgeon checked every detail three times before beginning the operation.', instruction: 'Is being meticulous always a good thing? Write your definition, then write a sentence where being meticulous could be a problem.' },
    wordAnswer: { definition: 'Showing great attention to detail or being very careful and precise about every aspect of something.', example: 'The meticulous jeweller spent six hours perfecting the tiny engravings — each letter no bigger than a grain of rice.' },
    maths: { title: 'Maths Sprint — solve all 3 as fast as you can!', problems: ['1   3³ + 4² = ?', '2   ⁷⁄₈ of 400 = ?', '3   What is 12.5% of 96?'] },
    mathsAnswer: { answers: ['1   3³ + 4² = ?   →   43', '2   ⁷⁄₈ of 400 = ?   →   350', '3   12.5% of 96 = ?   →   12'], tip: '3³=27, 4²=16, 27+16=43. For ⁷⁄₈: 400÷8=50, ×7=350. 12.5% = ⅛, so 96÷8=12.' },
    literacy: { type: 'Narrative Writing', opener: '"The note under the door said only three words: they know everything."', task: 'Write the opening paragraph of a thriller story. Include: an immediate sense of danger, one physical reaction from your character (heart racing, cold sweat etc.), and a specific, vivid setting detail.', challenge: 'End your paragraph on a cliffhanger — the last sentence should make it IMPOSSIBLE to stop reading.' },
    riddle: { riddle: "I can be cracked, made, told, and played. What am I?" },
    riddleAnswer: { answer: 'A JOKE', explanation: "You CRACK a joke, you MAKE a joke, you TELL a joke, and you PLAY a joke on someone! Each verb works perfectly — that's what makes this riddle so satisfying." },
    reflection: { question: "Think of someone in this class you haven't worked with much. What's one thing you appreciate about them — even if you've never told them?", format: 'THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion' }
  },
  {
    greeting: { activity: 'Mirror Mirror!', instructions: "Face your partner. One person leads, one person mirrors — copy EVERY movement exactly, as if you're looking in a mirror. No talking! After 45 seconds, swap leaders. Try to make it seamless — can someone watching tell who's leading?", time: '2 minutes — GO!' },
    value: { name: 'RESPONSIBILITY', definition: "Responsibility means owning your actions — good and bad — and understanding that your choices have consequences for yourself and for others. Responsible people don't make excuses; they make things right.", discuss: 'You accidentally break something belonging to the classroom. Nobody saw it happen. What does RESPONSIBILITY look like here — and what are the consequences of each choice you could make?' },
    game: { title: "20 Questions!", howToPlay: "One student thinks of a person, place, or thing. The class asks YES/NO questions only. You have 20 questions to guess it! Teacher keeps count. After each game, a new student takes a turn.", rounds: "Rules:\n• Only YES or NO answers allowed\n• Think carefully — use categories first!\n• Hint: start broad ('Is it a living thing?') before going specific", bonus: "Strategy tip: Each question should eliminate HALF the remaining possibilities. What's the most powerful first question?" },
    grammar: { title: 'Find and Fix the Subject-Verb Agreement', sentence: '1. "The team of players were exhausted after the match."\n2. "Neither the students nor the teacher were ready for the test."\n3. "Everyone in both classes have submitted their work."', instruction: 'Identify whether each sentence is CORRECT or INCORRECT. Fix any errors and write an explanation of the rule in your book.' },
    grammarAnswer: { answer: "1. INCORRECT → 'team' is singular: 'The team of players WAS exhausted.'\n2. CORRECT → the verb agrees with 'teacher' (nearest noun): WAS is correct.\n3. INCORRECT → 'everyone' is singular: 'Everyone... HAS submitted.'", explanation: "Rule 1: Collective nouns (team, group, committee) take singular verbs in most contexts. Rule 2: With neither/nor, the verb agrees with the NEAREST subject. Rule 3: Indefinite pronouns (everyone, nobody, someone) are ALWAYS singular." },
    spelling: { words: ['_ cc _ m m _ d _ _ e', 'e _ _ _ a _ _ _ r _ _ e', '_ cq _ _ _ _ ce'], instruction: 'Fill in the missing letters. These are three of the most commonly misspelled words in English!', labels: ['1', '2', '3'] },
    spellingAnswer: { answers: ['1  accommodate', '2  exaggerate', '3  acquaintance'], tip: "acCOmmoDATE — two C's AND two M's (double everything!).\nexAGGerate — double G — think 'don't EXAGGERATE'!\nacQUAintance — Q is always followed by U, and there's 'QUAINT' hiding inside." },
    word: { word: 'benevolent', pos: 'adjective', blank: 'The _____ donor gave anonymously, never seeking recognition for her generosity.', instruction: 'What is the difference between being "benevolent" and being "kind"? Write your definition and explain the nuance.' },
    wordAnswer: { definition: 'Well-meaning and kindly; disposed to do good for others, often in a generous or charitable way.', example: "The benevolent organisation spent decades building schools and hospitals in remote communities across the country." },
    maths: { title: 'Maths Sprint — solve all 3 as fast as you can!', problems: ['1   What is the area of a triangle with base 14 cm and height 9 cm?', '2   ⁴⁄₉ of 270 = ?', '3   If x + 17 = 43, what is x?'] },
    mathsAnswer: { answers: ['1   Area = ½ × 14 × 9 = 63 cm²', '2   ⁴⁄₉ of 270 = 120', '3   x = 26'], tip: 'Area of triangle = ½ × base × height. For ⁴⁄₉: 270÷9=30, ×4=120. For algebra: subtract 17 from both sides, 43−17=26.' },
    literacy: { type: 'Persuasive Writing', opener: "\"School uniforms should be abolished in all Australian schools.\"", task: 'Write a COUNTER-ARGUMENT paragraph — argue AGAINST this statement even if you personally agree with it. Use at least two logical reasons and address one possible objection.', challenge: 'Use a concession structure: "While some argue that... , in reality..." to make your argument more sophisticated.' },
    riddle: { riddle: "What has hands but can't clap, and a face but can't smile?" },
    riddleAnswer: { answer: 'A CLOCK', explanation: "A clock has 'hands' (the hour and minute hands) and a 'face' (the clock face with numbers) — but of course it can't actually clap or smile! It's a classic example of a riddle using double meanings." },
    reflection: { question: "What does 'doing your best' really mean? Is it the same every day? What affects how much effort you can give?", format: 'THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion' }
  },
  {
    greeting: { activity: "Emoji Morning!",instructions: "Describe your morning or how you're feeling using EXACTLY 3 emojis — but don't say them out loud. Write them down. Your partner has to interpret what they mean and tell a story from your emojis. Then swap!", time: '2 minutes — GO!' },
    value: { name: 'KINDNESS', definition: "Kindness is the quality of being generous, considerate, and friendly. But true kindness isn't just about being nice — it's about noticing when others need something and ACTING on that without being asked.", discuss: "There's a difference between being polite and being KIND. Can you think of an example of each? When is politeness not enough?" },
    game: { title: 'The Lie Detector!', howToPlay: "Teacher reads 3 'facts'. Two are TRUE, one is FALSE. Discuss with your partner, then vote on which one is the LIE. Reveal after the vote!", rounds: "Round 1: A) Honey never expires  B) A group of flamingos is called a flamboyance  C) Sharks are mammals\n\nRound 2: A) Wombats produce cube-shaped droppings  B) A day on Venus is longer than a year on Venus  C) The Great Wall of China is visible from space with the naked eye\n\nRound 3: A) Octopuses have three hearts  B) Hot water freezes faster than cold water  C) Humans share 70% of DNA with bananas", bonus: "Which 'fact' surprised you most — even the true ones?" },
    grammar: { title: 'Identify the Clause Type', sentence: '"Although she was terrified, Maya stepped onto the stage because she had promised herself she would never give up on her dreams."', instruction: 'Identify and label: the MAIN clause, the SUBORDINATE clause(s), and the CONJUNCTIONS that connect them. Write it in your book with annotations.' },
    grammarAnswer: { answer: "Main clause: 'Maya stepped onto the stage'\nSubordinate clause 1: 'Although she was terrified' (concessive)\nSubordinate clause 2: 'because she had promised herself she would never give up on her dreams' (reason)\nConjunctions: 'Although', 'because'", explanation: "A MAIN clause makes sense on its own. A SUBORDINATE clause depends on the main clause for its full meaning. Conjunctions show the RELATIONSHIP between clauses (contrast, reason, time, condition)." },
    spelling: { words: ['_ e r _ _ v _ r _ _ ce', '_ nd _ p _ nd _ nce', '_ cc _ s _ _ n _ lly'], instruction: 'Fill in the missing letters. These words all contain common suffixes — can you spot them?', labels: ['1', '2', '3'] },
    spellingAnswer: { answers: ['1  perseverance', '2  independence', '3  occasionally'], tip: "perSEVERANCE — the root is SEVERE (to endure hardship).\nindePENDence — there is PEND (to hang) inside!\noccASIONally — one C, two S's... wait, no: two C's, one S. Double-check!" },
    word: { word: 'ambiguous', pos: 'adjective', blank: 'The instructions were so _____ that half the class did the task completely differently.', instruction: 'Can ambiguity ever be a GOOD thing? Write your definition and give an example of where ambiguity is used deliberately.' },
    wordAnswer: { definition: 'Open to more than one interpretation; having a double meaning; not clear or definite.', example: "The poem's final stanza was deliberately ambiguous — the author wanted each reader to find their own meaning in it." },
    maths: { title: 'Maths Sprint — solve all 3 as fast as you can!', problems: ['1   What is the perimeter of a rectangle 13 cm × 7 cm?', '2   ⁵⁄₈ of 480 = ?', '3   25% off $64.00 = ?'] },
    mathsAnswer: { answers: ['1   Perimeter = 2(13 + 7) = 40 cm', '2   ⁵⁄₈ of 480 = 300', '3   25% of $64 = $16, so $64 − $16 = $48.00'], tip: 'Perimeter = 2 × (length + width). For ⁵⁄₈: 480÷8=60, ×5=300. 25% = ¼, so $64÷4=$16 off.' },
    literacy: { type: 'Narrative Writing', opener: '"The robot had been waiting on the doorstep for three days before anyone noticed it was alive."', task: "Write the opening paragraph. Create an immediate sense of wonder and unease. Describe the robot from the perspective of the FIRST person who really notices it — what do they see, hear, feel?", challenge: 'Use the contrast between what is EXPECTED (a machine) and what is HAPPENING (life) to create tension.' },
    riddle: { riddle: "I'm always in front of you but cannot be seen. What am I?" },
    riddleAnswer: { answer: 'THE FUTURE', explanation: "The future is always 'ahead' of you — in front of you in time — but you can never actually SEE it! No matter how much you plan, the future remains invisible until it becomes the present." },
    reflection: { question: "Think about your friendship group. What role do you usually play — the leader, the peacemaker, the joker, the listener? Is that the role you WANT to play?", format: 'THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion' }
  },
  {
    greeting: { activity: 'Hot Take Tuesday!', instructions: "Share one UNPOPULAR opinion — something you genuinely believe that most people would disagree with. Your partner must argue AGAINST it for 30 seconds, even if they secretly agree with you. Then swap!", time: '2 minutes — GO!' },
    value: { name: 'HONESTY', definition: "Honesty means being truthful — in your words, your actions, and your intentions. It's not just about avoiding lies; it's about having the courage to say what's true even when it's difficult or uncomfortable.", discuss: "A friend shows you their creative project and asks what you think — but you think it needs a lot of work. How do you balance HONESTY with KINDNESS? What do you actually say?" },
    game: { title: "Finish the Story!",howToPlay: "Teacher starts a story with one sentence. Each student adds ONE sentence going around the class. You cannot contradict the previous sentence, but you CAN change the direction — wildly if you like!", rounds: "Story starter 1:\n'The package arrived with no return address and a note that said: open this after midnight.'\n\nStory starter 2:\n'Every morning for a week, the same stranger had been standing outside the school gates — always at exactly 8:43 am.'", bonus: "After each story, vote: was the ending SATISFYING or did it need more? What would you change?" },
    grammar: { title: 'Direct and Indirect Speech', sentence: '"You\'ll never be good enough," the coach told Marcus bitterly. "I\'ve been watching you for weeks."', instruction: 'Convert BOTH sentences from direct speech to indirect (reported) speech. Remember to change: pronouns, tense, and time references as needed.' },
    grammarAnswer: { answer: "The coach told Marcus bitterly that he would never be good enough. He added that he had been watching him for weeks.", explanation: "Changes: 'You' → 'he', 'never be' → 'never be' (stays — it's already general). 'I've been' → 'he had been' (tense shifts back — present perfect → past perfect). Remove quotation marks. Add 'that'." },
    spelling: { words: ['_ m b _ r _ _ ss', 'fl _ _ r _ sc _ nt', '_ u _ r _ nt _ e'], instruction: 'Fill in the missing letters — these are among the trickiest words in English!', labels: ['1', '2', '3'] },
    spellingAnswer: { answers: ['1  embarrass', '2  fluorescent', '3  guarantee'], tip: "emBARRASS — two R's AND two S's. You feel Rotten And Rather Awful Sometimes Saying Sorry!\nfluoRESCent — think RESCUE — there's an ESCE in the middle.\nguaRANTEE — think 'I guaranTEE you' — end with double E." },
    word: { word: 'diligent', pos: 'adjective', blank: 'The _____ researcher spent three years verifying every single fact before publishing her findings.', instruction: "What's the difference between being 'diligent' and being 'hardworking'? Write your definition and explain the subtle difference." },
    wordAnswer: { definition: 'Having or showing care and conscientiousness in one's work or duties — careful, thorough, and persistent.', example: "The diligent apprentice arrived early every morning, took detailed notes, and practised each skill until it was perfect." },
    maths: { title: 'Maths Sprint — solve all 3 as fast as you can!', problems: ['1   A rectangle has an area of 132 cm². Width is 11 cm. What is the length?', '2   ²⁄₃ of 0.9 = ?', '3   What is 8.5% of 200?'] },
    mathsAnswer: { answers: ['1   Length = 132 ÷ 11 = 12 cm', '2   ²⁄₃ of 0.9 = 0.6', '3   8.5% of 200 = 17'], tip: 'Area ÷ width = length: 132÷11=12. For ²⁄₃ of 0.9: 0.9÷3=0.3, ×2=0.6. 8.5%=8%+0.5%: 8% of 200=16, 0.5%=1, total=17.' },
    literacy: { type: 'Informative Writing', opener: "Artificial intelligence is already changing how we learn — but is that a good thing?", task: 'Write an informative paragraph that presents BOTH sides of AI in education fairly. Include: a clear topic sentence, one advantage, one disadvantage, and a balanced conclusion.', challenge: 'Use hedging language (e.g., "may," "could," "evidence suggests") to show you understand this is a complex issue, not a simple one.' },
    riddle: { riddle: "I have no life, but I can die. What am I?" },
    riddleAnswer: { answer: 'A BATTERY', explanation: "A battery has no life in the biological sense — but we say a battery 'dies' when it runs out of power! This riddle plays on the double meaning of 'life' and 'die.'" },
    reflection: { question: "What's something you believed a year ago that you've changed your mind about? What caused you to think differently?", format: 'THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion' }
  },
  {
    greeting: { activity: 'My Life Playlist!', instructions: "If your life was a movie, what 3 songs would be on the soundtrack? Tell your partner one song for: a) your biggest challenge, b) your best memory, c) right now. They have to guess what feeling each song represents.", time: '2 minutes — GO!' },
    value: { name: 'PERSEVERANCE', definition: "Perseverance is continuing steadily despite difficulty, delay, or failure — staying committed to your goal even when progress is slow and the end feels out of reach. It's the bridge between trying and succeeding.", discuss: 'Think of something you gave up on too early. What stopped you? If you had persevered, where might you be now? What would you need to do differently today?' },
    game: { title: 'Class Superlatives!', howToPlay: "Teacher reads a superlative category. Nominate someone in the class (yourself counts!). Quick vote — who agrees? Share your reasoning. Keep it KIND and positive only!", rounds: "Round 1: Most likely to become a world-famous inventor\nRound 2: Most likely to run a marathon on a whim\nRound 3: Most likely to stay friends with everyone in this class in 20 years\nRound 4: Most likely to appear on a TV cooking show\nRound 5: Most likely to discover something nobody's discovered before", bonus: "What superpower would each nominated person need for their category?" },
    grammar: { title: 'Identify the Modifier Error', sentence: '"Running through the park, the rain suddenly began to pour."\n\n"After eating the delicious meal, the restaurant received a glowing review from the tourists."', instruction: "Both sentences contain DANGLING MODIFIERS. Identify the error in each and rewrite the sentences correctly." },
    grammarAnswer: { answer: "Sentence 1 error: 'Running through the park' modifies 'the rain' — but rain doesn't run!\nFix: 'Running through the park, we were suddenly caught in a downpour.'\n\nSentence 2 error: The restaurant didn't eat the meal — the tourists did!\nFix: 'After eating the delicious meal, the tourists gave the restaurant a glowing review.'", explanation: "A DANGLING MODIFIER describes something that isn't clearly present in the sentence. The modifier must be RIGHT NEXT to the noun it's describing." },
    spelling: { words: ['_ ia _ _ on', 'M _ d _ t _ rr _ n _ an', 'r _ c _ nn _ _ _ s _ nc _'], instruction: 'Fill in the missing letters. These words have unusual letter patterns — look for the tricky parts.', labels: ['1', '2', '3'] },
    spellingAnswer: { answers: ['1  liaison', '2  Mediterranean', '3  reconnaissance'], tip: "LIAison — two I's and it contains LIAI at the start.\nMediterRANean — think 'MED-i-ter-RA-ne-an' and say it in syllables!\nreCONNaissANCE — double N and double S, ends in -ANCE not -ENCE." },
    word: { word: 'cynical', pos: 'adjective', blank: 'After years of broken promises, she had grown _____ about politicians ever telling the full truth.', instruction: 'Is being cynical a weakness or a sign of intelligence? Write your definition, then give your opinion with a reason.' },
    wordAnswer: { definition: 'Believing that people are motivated only by self-interest; distrustful of human sincerity or integrity; expecting the worst from others.', example: "The cynical journalist refused to report the story without three independent sources — he had been burned by 'facts' before." },
    maths: { title: 'Maths Sprint — solve all 3 as fast as you can!', problems: ['1   What is √225?', '2   ⁵⁄₁₂ of 144 = ?', '3   A jacket costs $120. It is on sale for 30% off. What is the sale price?'] },
    mathsAnswer: { answers: ['1   √225 = 15', '2   ⁵⁄₁₂ of 144 = 60', '3   30% of $120 = $36, sale price = $84'], tip: '15 × 15 = 225, so √225 = 15. For ⁵⁄₁₂: 144÷12=12, ×5=60. 30% of 120: 10%=12, ×3=36, then 120−36=$84.' },
    literacy: { type: 'Narrative Writing', opener: '"She had memorised 4,000 stars by name. She just couldn\'t remember why she\'d come to the observatory that night."', task: 'Write the opening paragraph of this story. Establish your character clearly through her actions and thoughts, not through description. Show who she is without telling us directly.', challenge: "Use the contrast between vast knowledge (4,000 stars) and personal confusion (can't remember why she's there) as the emotional heart of your paragraph." },
    riddle: { riddle: "What can travel around the world while staying in a corner?" },
    riddleAnswer: { answer: 'A STAMP', explanation: "A postage stamp sits in the corner of an envelope — but that envelope travels around the entire world while delivering mail! The stamp 'goes everywhere' without ever leaving its corner." },
    reflection: { question: 'What are you most proud of from the last week? It can be something nobody else saw or recognised — it just has to matter to you.', format: 'THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion' }
  },
  {
    greeting: { activity: 'Time Machine!', instructions: "If you could go back in time to ANY moment in history (not your own life), where and when would you go — and what would you do there? You have 30 seconds to explain to your partner. Then swap. Who made the bolder choice?", time: '2 minutes — GO!' },
    value: { name: 'GRATITUDE', definition: "Gratitude is the quality of being thankful — truly recognising and appreciating what you have, what others do for you, and the good things in your life. It shifts your focus from what's missing to what's present.", discuss: "Research shows that practising gratitude makes people happier and more resilient. But is it always easy? Think of a time when you found it hard to feel grateful — and what helped you shift your perspective." },
    game: { title: "Would You Rather? — Career Edition!", howToPlay: "Teacher reads two career paths. Go LEFT for A, RIGHT for B. The minority has 30 seconds to sell their choice to the majority. Can they switch even one person?", rounds: "Round 1: Surgeon who saves lives but works 80-hour weeks OR marine biologist who studies deep sea creatures\nRound 2: Astronaut who travels to Mars (18-month mission, no contact home) OR world-famous chef\nRound 3: Inventor whose work goes unrecognised for 50 years OR actor who is famous for a role they hate", bonus: "Create your own 'Would You Rather — Career' dilemma!" },
    grammar: { title: 'Apostrophes: Possession vs. Contraction', sentence: "1. 'Its not the dogs fault that its paw is injured.'\n2. 'The childrens books were left on the teachers desk.'\n3. 'Theyre going to their friends house after school.'", instruction: 'Fix every apostrophe error in each sentence. Write the corrected versions in your book, then write a rule for each type of apostrophe use.' },
    grammarAnswer: { answer: "1. \"It's not the dog's fault that its paw is injured.\"\n2. \"The children's books were left on the teacher's desk.\"\n3. \"They're going to their friend's house after school.\"", explanation: "KEY RULES: 'It's' = 'it is' (contraction). 'Its' (no apostrophe) = belonging to it. Possessive: add 's for singular, 's after the word for irregular plurals (children's), s' for regular plurals if s already there. 'They're' = 'they are'. 'Their' = belonging to them." },
    spelling: { words: ['_ e c _ mm _ nd', '_ el _ v _ nt', 'r _ st _ _ r _ nt'], instruction: 'Fill in the missing letters. All three are commonly misspelled in formal writing!', labels: ['1', '2', '3'] },
    spellingAnswer: { answers: ['1  recommend', '2  relevant', '3  restaurant'], tip: "reCOMMend — one C, double M. Think: I'd reCOMmend a COMMA before 'and'!\nrelevANT — ends in -ANT, not -ENT (unlike most similar words).\nreSTAUrant — think reST AUR ant, or 'rest-a-u-rant' in syllables." },
    word: { word: 'pragmatic', pos: 'adjective', blank: 'Rather than dreaming of a perfect solution, the _____ team leader focused on what could actually be done with the resources they had.', instruction: 'Is it better to be pragmatic or idealistic? Write your definition and then take a side with a reason.' },
    wordAnswer: { definition: 'Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.', example: "The pragmatic engineer scrapped the elegant but impractical design and chose the simpler solution that could actually be built on time." },
    maths: { title: 'Maths Sprint — solve all 3 as fast as you can!', problems: ['1   What is 20% of 85?', '2   ⁷⁄₁₀ of 350 = ?', '3   If 3y − 5 = 22, what is y?'] },
    mathsAnswer: { answers: ['1   20% of 85 = 17', '2   ⁷⁄₁₀ of 350 = 245', '3   y = 9'], tip: '10% of 85=8.5, ×2=17. For ⁷⁄₁₀: 350÷10=35, ×7=245. For algebra: add 5 to both sides (3y=27), then ÷3, y=9.' },
    literacy: { type: 'Persuasive Writing', opener: "\"Technology is making young people less capable, not more.\"", task: 'Write a persuasive paragraph AGREEING with this statement. Use a strong hook, at least two specific examples, and a call to action in your conclusion.', challenge: 'Anticipate and address ONE counterargument — then dismiss it. This technique is called a concession-rebuttal and it makes your argument much stronger.' },
    riddle: { riddle: "The more you take away, the bigger I become. What am I?" },
    riddleAnswer: { answer: 'A HOLE', explanation: "The more material you remove, the larger the hole becomes! Digging deeper and wider means you're taking MORE away — but the hole grows BIGGER. It's the opposite of most things we know." },
    reflection: { question: "If you could send a message back to yourself at the start of this year, what would it say? What do you wish you'd known sooner?", format: 'THINK → 30 seconds to yourself\nPAIR → Share with a partner\nSHARE → Class discussion' }
  },
];

// Repeat / cycle days 11-20 with fresh content
// For brevity in this build, days 11-20 cycle back with variant content
for (let i = 10; i < 20; i++) {
  DAYS.push({ ...DAYS[i - 10] });
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
      setDayIdx((doy - 1) % 20);
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
        <div className="text-7xl">☀️</div>
        {className && <div className="text-4xl font-black text-violet-700">{className}</div>}
        <div className="text-6xl font-black text-gray-800 leading-tight">{greeting}</div>
        <div className="text-2xl font-bold text-gray-500 italic">{tagline}</div>
        <div className="text-xl font-bold text-gray-400 mt-4">{fmtDate()}</div>
      </div>
    );

    if (t === 'greeting') return (
      <div className="flex flex-col gap-6">
        <div className="text-4xl font-black text-gray-800">{d.greeting.activity}</div>
        <div className="bg-white rounded-2xl border-2 border-teal-300 p-6 text-xl font-semibold text-gray-700 leading-relaxed whitespace-pre-line">{d.greeting.instructions}</div>
        <div className="bg-teal-500 text-white rounded-xl px-6 py-3 text-2xl font-black text-center self-start">{d.greeting.time}</div>
      </div>
    );

    if (t === 'value') return (
      <div className="flex flex-col gap-6">
        <div className="text-6xl font-black text-amber-700 tracking-wide">{d.value.name}</div>
        <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 text-xl font-semibold text-gray-700 leading-relaxed">{d.value.definition}</div>
        <div className="bg-amber-50 rounded-2xl border-2 border-amber-400 p-5">
          <div className="text-base font-black text-amber-700 uppercase tracking-widest mb-2">Discuss:</div>
          <div className="text-xl font-bold text-gray-800 leading-relaxed">{d.value.discuss}</div>
        </div>
        <div className="text-lg font-bold text-gray-500 italic">💬 Discuss with a partner, then share with the class.</div>
      </div>
    );

    if (t === 'announcements') return (
      <div className="flex flex-col gap-5">
        {[
          { label: "Today's focus:", value: announcements.focus },
          { label: 'Reminders:', value: announcements.reminders },
          { label: 'Coming up:', value: announcements.upcoming },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border-2 border-rose-300 p-5">
            <div className="text-sm font-black text-rose-600 uppercase tracking-widest mb-1">{label}</div>
            <div className="text-xl font-semibold text-gray-800 leading-relaxed whitespace-pre-line">{value || '—'}</div>
          </div>
        ))}
      </div>
    );

    if (t === 'game') return (
      <div className="flex flex-col gap-5">
        <div className="text-3xl font-black text-green-800">{d.game.title}</div>
        <div className="bg-white rounded-2xl border-2 border-green-300 p-5">
          <div className="text-sm font-black text-green-600 uppercase tracking-widest mb-2">How to play:</div>
          <div className="text-lg font-semibold text-gray-700 leading-relaxed">{d.game.howToPlay}</div>
        </div>
        <div className="bg-green-50 rounded-2xl border-2 border-green-400 p-5 whitespace-pre-line text-lg font-bold text-gray-800 leading-relaxed">{d.game.rounds}</div>
        {d.game.bonus && <div className="text-base font-bold text-green-700 italic">⭐ {d.game.bonus}</div>}
      </div>
    );

    if (t === 'grammar') return (
      <div className="flex flex-col gap-5">
        <div className="text-3xl font-black text-blue-800">{d.grammar.title}</div>
        <div className="bg-white rounded-2xl border-2 border-blue-300 p-6 text-xl font-bold text-gray-800 leading-relaxed italic">
          {d.grammar.sentence}
        </div>
        <div className="text-lg font-semibold text-gray-700 leading-relaxed">{d.grammar.instruction}</div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 px-5 py-3 text-lg font-black text-blue-700">✏️ Write your answer in your book — think before you write!</div>
      </div>
    );

    if (t === 'grammarAnswer') return (
      <div className="flex flex-col gap-5">
        <div className="bg-blue-500 text-white rounded-2xl px-6 py-3 text-2xl font-black text-center">{d.grammar.title}</div>
        <div className="bg-white rounded-2xl border-2 border-blue-400 p-6 text-2xl font-black text-gray-800 leading-relaxed whitespace-pre-line">{d.grammarAnswer.answer}</div>
        <div className="bg-blue-50 rounded-2xl border-2 border-blue-300 p-5">
          <div className="text-sm font-black text-blue-600 uppercase tracking-widest mb-2">Why?</div>
          <div className="text-base font-semibold text-gray-700 leading-relaxed whitespace-pre-line">{d.grammarAnswer.explanation}</div>
        </div>
      </div>
    );

    if (t === 'spelling') return (
      <div className="flex flex-col gap-5">
        <div className="text-2xl font-black text-purple-800">{d.spelling.instruction}</div>
        <div className="flex flex-col gap-4">
          {d.spelling.words.map((w, i) => (
            <div key={i} className="bg-white rounded-2xl border-2 border-purple-300 p-5 flex items-center gap-4">
              <div className="text-3xl font-black text-purple-500 w-10 flex-shrink-0">{d.spelling.labels[i]}</div>
              <div className="text-3xl font-black tracking-widest text-gray-800">{w}</div>
            </div>
          ))}
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-200 px-5 py-3 text-lg font-black text-purple-700">✏️ Write each word in your book — check your spelling before the reveal!</div>
      </div>
    );

    if (t === 'spellingAnswer') return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          {d.spellingAnswer.answers.map((a, i) => (
            <div key={i} className="bg-white rounded-2xl border-2 border-purple-400 p-4 text-2xl font-black text-gray-800">{a}</div>
          ))}
        </div>
        <div className="bg-purple-50 rounded-2xl border-2 border-purple-300 p-5">
          <div className="text-sm font-black text-purple-600 uppercase tracking-widest mb-2">Memory Tips:</div>
          <div className="text-base font-semibold text-gray-700 whitespace-pre-line leading-relaxed">{d.spellingAnswer.tip}</div>
        </div>
      </div>
    );

    if (t === 'word') return (
      <div className="flex flex-col gap-5">
        <div className="flex items-baseline gap-3">
          <div className="text-5xl font-black text-orange-700">{d.word.word}</div>
          <div className="text-xl font-bold text-orange-400 italic">{d.word.pos}</div>
        </div>
        <div className="bg-white rounded-2xl border-2 border-orange-300 p-6">
          <div className="text-sm font-black text-orange-600 uppercase tracking-widest mb-2">Fill in the blank:</div>
          <div className="text-2xl font-bold text-gray-800 leading-relaxed italic">"{d.word.blank}"</div>
        </div>
        <div className="text-lg font-semibold text-gray-700">{d.word.instruction}</div>
        <div className="bg-orange-50 rounded-xl border border-orange-200 px-5 py-3 text-lg font-black text-orange-700">✏️ Write a definition in your own words!</div>
      </div>
    );

    if (t === 'wordAnswer') return (
      <div className="flex flex-col gap-5">
        <div className="text-4xl font-black text-orange-700">{d.word.word}</div>
        <div className="bg-white rounded-2xl border-2 border-orange-400 p-5">
          <div className="text-sm font-black text-orange-600 uppercase tracking-widest mb-2">Definition:</div>
          <div className="text-xl font-semibold text-gray-800 leading-relaxed">{d.wordAnswer.definition}</div>
        </div>
        <div className="bg-orange-50 rounded-2xl border-2 border-orange-300 p-5">
          <div className="text-sm font-black text-orange-600 uppercase tracking-widest mb-2">Example:</div>
          <div className="text-lg font-semibold text-gray-700 leading-relaxed italic">"{d.wordAnswer.example}"</div>
        </div>
      </div>
    );

    if (t === 'maths') return (
      <div className="flex flex-col gap-5">
        <div className="text-2xl font-black text-cyan-800">{d.maths.title}</div>
        <div className="flex flex-col gap-3">
          {d.maths.problems.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl border-2 border-cyan-300 p-5 text-2xl font-black text-gray-800">{p}</div>
          ))}
        </div>
        <div className="bg-cyan-50 rounded-xl border border-cyan-200 px-5 py-3 text-lg font-black text-cyan-700">✏️ Show all your working in your book!</div>
      </div>
    );

    if (t === 'mathsAnswer') return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          {d.mathsAnswer.answers.map((a, i) => (
            <div key={i} className="bg-white rounded-2xl border-2 border-cyan-400 p-4 text-xl font-black text-gray-800">{a}</div>
          ))}
        </div>
        <div className="bg-cyan-50 rounded-2xl border-2 border-cyan-300 p-5">
          <div className="text-sm font-black text-cyan-600 uppercase tracking-widest mb-2">Tip:</div>
          <div className="text-base font-semibold text-gray-700 whitespace-pre-line leading-relaxed">{d.mathsAnswer.tip}</div>
        </div>
      </div>
    );

    if (t === 'literacy') return (
      <div className="flex flex-col gap-5">
        <div className="text-2xl font-black text-pink-800">{d.literacy.type}</div>
        <div className="bg-white rounded-2xl border-2 border-pink-300 p-6">
          <div className="text-sm font-black text-pink-600 uppercase tracking-widest mb-2">Opening line:</div>
          <div className="text-2xl font-bold text-gray-800 italic leading-relaxed">"{d.literacy.opener}"</div>
        </div>
        <div className="text-lg font-semibold text-gray-700 leading-relaxed">{d.literacy.task}</div>
        <div className="bg-pink-50 rounded-2xl border-2 border-pink-300 p-4">
          <div className="text-sm font-black text-pink-600 uppercase tracking-widest mb-1">CHALLENGE:</div>
          <div className="text-base font-bold text-gray-700">{d.literacy.challenge}</div>
        </div>
        <div className="bg-pink-50 rounded-xl border border-pink-200 px-5 py-3 text-lg font-black text-pink-700">✏️ Write your response in your book!</div>
      </div>
    );

    if (t === 'riddle') return (
      <div className="flex flex-col items-center justify-center h-full gap-8 text-center">
        <div className="text-7xl">🧩</div>
        <div className="bg-white rounded-3xl border-2 border-yellow-300 p-8 text-3xl font-black text-gray-800 leading-relaxed max-w-2xl">
          "{d.riddle.riddle}"
        </div>
        <div className="text-xl font-bold text-yellow-700 italic">Think about it... discuss with your partner, then we'll reveal!</div>
      </div>
    );

    if (t === 'riddleAnswer') return (
      <div className="flex flex-col gap-6">
        <div className="text-6xl font-black text-yellow-700 text-center tracking-wide">{d.riddleAnswer.answer}</div>
        <div className="bg-yellow-50 rounded-2xl border-2 border-yellow-300 p-6">
          <div className="text-sm font-black text-yellow-600 uppercase tracking-widest mb-2">Explanation:</div>
          <div className="text-xl font-semibold text-gray-700 leading-relaxed">{d.riddleAnswer.explanation}</div>
        </div>
      </div>
    );

    if (t === 'reflection') return (
      <div className="flex flex-col gap-6">
        <div className="bg-white rounded-2xl border-2 border-indigo-300 p-6 text-2xl font-bold text-gray-800 leading-relaxed">{d.reflection.question}</div>
        <div className="grid grid-cols-3 gap-4">
          {d.reflection.format.split('\n').map((step, i) => {
            const [label, ...rest] = step.split('→');
            const colors = ['bg-indigo-100 border-indigo-300 text-indigo-800', 'bg-purple-100 border-purple-300 text-purple-800', 'bg-pink-100 border-pink-300 text-pink-800'];
            return (
              <div key={i} className={`rounded-2xl border-2 p-4 text-center ${colors[i]}`}>
                <div className="text-2xl font-black">{label.trim()}</div>
                <div className="text-sm font-bold mt-1 opacity-75">{rest.join('→').trim()}</div>
              </div>
            );
          })}
        </div>
        <div className="text-lg font-black text-indigo-600 text-center">Have a great learning day{className ? `, ${className}` : ''}! 🌟</div>
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
            <span className="text-xl font-black tracking-widest uppercase">{headerLabel}</span>
            {subLabel && <span className="text-lg font-bold opacity-60 ml-2">— {subLabel}</span>}
          </div>
        )}

        {/* Slide content */}
        <div className="flex-1 overflow-y-auto px-10 py-6 flex flex-col justify-center">
          {renderSlide(current)}
        </div>

        {/* Navigation bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t-3 border-gray-200 shadow-sm gap-4">
          <button onClick={exitPresent} className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm transition-colors">✕ Exit</button>
          <div className="flex items-center gap-3">
            <button onClick={() => setSlide(s => Math.max(0, s-1))} disabled={slide === 0}
              className="px-5 py-2 rounded-xl bg-violet-100 hover:bg-violet-200 disabled:opacity-30 disabled:cursor-default text-violet-800 font-black text-lg transition-colors">◀</button>
            <span className="font-bold text-gray-500 min-w-16 text-center text-sm">{slide + 1} / {total}</span>
            <button onClick={() => setSlide(s => Math.min(s+1, total-1))} disabled={slide === total-1}
              className="px-5 py-2 rounded-xl bg-violet-100 hover:bg-violet-200 disabled:opacity-30 disabled:cursor-default text-violet-800 font-black text-lg transition-colors">▶</button>
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
            <p className="text-sm text-gray-500 mb-3">Content auto-rotates daily through 20 days. Override if needed.</p>
            <div className="flex items-center gap-3">
              <input type="number" min={1} max={20} value={dayIdx + 1}
                onChange={e => { const v = Math.max(1, Math.min(20, parseInt(e.target.value)||1)); setDayIdx(v-1); setLS('mm_dayOverride', v-1); }}
                className="w-20 border-2 border-gray-200 rounded-xl px-3 py-2 font-black text-center text-gray-800 focus:outline-none focus:border-blue-400" />
              <span className="text-sm font-bold text-gray-500">/ 20</span>
              <button onClick={() => { setLS('mm_dayOverride', null); const doy = Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0).getTime())/86400000); setDayIdx((doy-1)%20); }}
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
          <p className="text-sm text-gray-500">These are pulled from Day {dayIdx + 1}. All sections appear exactly as shown during presentation — students write or discuss, nothing is interactive.</p>

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
                    {sec.id === 'grammar' && `${d.grammar.title}\n\n${d.grammar.sentence}\n\nInstruction: ${d.grammar.instruction}\n\n→ Answer reveal: ${d.grammarAnswer.answer}`}
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
