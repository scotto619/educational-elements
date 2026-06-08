// components/curriculum/literacy/ReadersTheatre.js
// READERS THEATRE — Script-first, colour-coded roles, direct student assignment
import React, { useState, useEffect } from 'react';

// ─── Character colour palette (up to 8 non-narrator roles) ───────────────────
const PALETTE = [
  { bg: '#f5f3ff', border: '#7c3aed', text: '#4c1d95', chip: '#7c3aed', chipText: '#fff' }, // violet
  { bg: '#eff6ff', border: '#1d4ed8', text: '#1e3a8a', chip: '#1d4ed8', chipText: '#fff' }, // blue
  { bg: '#ecfdf5', border: '#059669', text: '#064e3b', chip: '#059669', chipText: '#fff' }, // emerald
  { bg: '#fff7ed', border: '#c2410c', text: '#7c2d12', chip: '#c2410c', chipText: '#fff' }, // orange
  { bg: '#fdf2f8', border: '#be185d', text: '#831843', chip: '#be185d', chipText: '#fff' }, // pink
  { bg: '#fefce8', border: '#a16207', text: '#713f12', chip: '#a16207', chipText: '#fff' }, // amber
  { bg: '#ecfeff', border: '#0e7490', text: '#164e63', chip: '#0e7490', chipText: '#fff' }, // cyan
  { bg: '#fff1f2', border: '#b91c1c', text: '#7f1d1d', chip: '#b91c1c', chipText: '#fff' }, // red
];
const NARRATOR_CLR = { bg: '#f9fafb', border: '#9ca3af', text: '#374151', chip: '#6b7280', chipText: '#fff' };
const ALL_CLR      = { bg: '#fdf4ff', border: '#7e22ce', text: '#3b0764', chip: '#7e22ce', chipText: '#fff' };

const buildColorMap = (characters) => {
  const map = {};
  let idx = 0;
  characters.forEach(char => {
    const up = char.toUpperCase();
    if (up === 'NARRATOR')                  map[char] = NARRATOR_CLR;
    else if (up === 'ALL')                  map[char] = ALL_CLR;
    else { map[char] = PALETTE[idx % PALETTE.length]; idx++; }
    map[char.toUpperCase()] = map[char]; // alias for script parsing
  });
  return map;
};

// Parse **CHARACTER:** (optional stage dir) dialogue  →  array of line objects
const parseScript = (text) =>
  text.split('\n')
    .map(raw => {
      const line = raw.trim();
      if (!line) return null;
      const m = line.match(/^\*\*(.+?):\*\*\s*(.*)/);
      if (m) {
        const [, character, rest] = m;
        const sd = rest.match(/^\(([^)]+)\)\s*(.*)/);
        return { character, stageDir: sd ? sd[1] : null, dialogue: sd ? sd[2] : rest };
      }
      return { character: null, stageDir: null, dialogue: line };
    })
    .filter(Boolean);

// ─── Print helper ────────────────────────────────────────────────────────────
const printScript = (script, students, assignments, colorMap) => {
  const lines = parseScript(script.script);

  const castRows = script.characters.map(char => {
    const color = colorMap[char] || NARRATOR_CLR;
    const sid = assignments[char];
    const s = students.find(st => st.id === sid);
    const name = s ? `${s.firstName} ${s.lastName}` : '— unassigned —';
    return `<div style="display:flex;align-items:center;gap:10px;margin-bottom:7px;padding:8px 12px;
        background:${color.bg};border-left:4px solid ${color.border};border-radius:6px;">
      <span style="background:${color.chip};color:${color.chipText};font-weight:700;
          padding:2px 10px;border-radius:20px;font-size:11px;white-space:nowrap;">${char}</span>
      <span style="font-size:14px;color:${color.text};">${name}</span>
    </div>`;
  }).join('');

  const scriptRows = lines.map(line => {
    if (!line.character) {
      return `<p style="font-style:italic;color:#9ca3af;text-align:center;
          margin:10px 0;font-size:13px;">${line.dialogue}</p>`;
    }
    const color = colorMap[line.character.toUpperCase()] || colorMap[line.character] || NARRATOR_CLR;
    const matchedChar = script.characters.find(c => c.toUpperCase() === line.character.toUpperCase()) || '';
    const sid = assignments[line.character] || assignments[matchedChar];
    const s = students.find(st => st.id === sid);
    const first = s ? s.firstName : '';
    const isAll = line.character.toUpperCase() === 'ALL';
    return `<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 14px;
        background:${color.bg};border-left:5px solid ${color.border};border-radius:8px;margin-bottom:6px;">
      <div style="flex-shrink:0;min-width:90px;text-align:center;">
        <div style="background:${color.chip};color:${color.chipText};font-weight:700;
            padding:3px 8px;border-radius:20px;font-size:11px;">${line.character}</div>
        ${first ? `<div style="font-size:10px;color:${color.border};font-weight:600;margin-top:3px;">${first}</div>` : ''}
      </div>
      <div style="flex:1;font-size:14px;line-height:1.7;color:${color.text};">
        ${line.stageDir ? `<em style="color:${color.border};opacity:0.75;">(${line.stageDir})</em> ` : ''}
        <span style="${isAll ? 'font-weight:700;' : ''}">${line.dialogue}</span>
      </div>
    </div>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${script.title} — Readers Theatre</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 32px; background: #fff; color: #111; }
    h1   { font-size: 26px; color: #4c1d95; margin-bottom: 4px; }
    .meta { color: #6b7280; font-size: 13px; margin-bottom: 28px; }
    h2   { font-size: 15px; font-weight: 700; color: #374151; text-transform: uppercase;
           letter-spacing: .06em; border-bottom: 2px solid #e5e7eb;
           padding-bottom: 6px; margin: 28px 0 12px; }
    @media print {
      body { margin: 15px; }
      h1   { font-size: 22px; }
    }
  </style>
</head>
<body>
  <h1>${script.emoji} ${script.title}</h1>
  <p class="meta">${script.theme} &nbsp;·&nbsp; ${script.estimatedTime} &nbsp;·&nbsp; ${script.characters.length} roles</p>
  <h2>Cast</h2>
  ${castRows}
  <h2>Script</h2>
  ${scriptRows}
</body>
</html>`;

  const win = window.open('', '_blank', 'width=820,height=960');
  if (!win) return; // blocked by popup blocker
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 350);
};

// ─── Scripts ──────────────────────────────────────────────────────────────────
const THEATRE_SCRIPTS = [

  // ── ORIGINAL SCRIPTS (lightly kept) ────────────────────────────────────────

  {
    id: 'gaming-championship',
    title: 'The Gaming Championship',
    emoji: '🎮',
    description: 'A competition between friends turns into a lesson about sportsmanship.',
    characters: ['Narrator', 'Alex', 'Jordan', 'Casey', 'Morgan'],
    estimatedTime: '8–10 min',
    difficulty: 'Easy',
    theme: 'Friendship & Competition',
    script: `**NARRATOR:** It was the final day of the school gaming tournament. Five friends had made it to the championship round.

**ALEX:** (excitedly) I can't believe we all made it this far! This is going to be epic!

**JORDAN:** (confidently) Well, I've been practicing for months. I think I've got this in the bag.

**CASEY:** (nervously) I'm just happy to be here. I never thought I'd make it past the first round.

**MORGAN:** (supportively) Casey, you're better than you think! Remember how you beat that level everyone said was impossible?

**NARRATOR:** The tournament began. Each player chose their character and prepared for battle.

**ALEX:** Good luck everyone! May the best gamer win!

**JORDAN:** (smugly) Oh, I will. Don't worry about that.

**NARRATOR:** As the game progressed, Jordan took an early lead. But Casey surprised everyone by climbing to second place.

**CASEY:** (surprised) Wait... I'm actually doing really well!

**MORGAN:** Go Casey! You've got this!

**NARRATOR:** Jordan started getting frustrated as Casey caught up.

**JORDAN:** (angrily) This is ridiculous! Casey's just getting lucky!

**ALEX:** Jordan, chill out. We're all doing our best.

**NARRATOR:** In the final moments, Casey made an incredible comeback and won the tournament!

**CASEY:** (shocked) I... I actually won? I can't believe it!

**MORGAN:** Casey! That was amazing! You totally deserved that win!

**ALEX:** (clapping) That was the best gaming I've ever seen! Congratulations!

**JORDAN:** (reluctantly) I guess... congratulations, Casey. You played well.

**CASEY:** Thanks, Jordan. You pushed me to play better. We all did great!

**NARRATOR:** And so the friends learned that the real victory was supporting each other, win or lose.

**ALL:** (together) Friends first, competitors second!`
  },

  {
    id: 'science-fair-disaster',
    title: 'The Science Fair Disaster',
    emoji: '🔬',
    description: 'When experiments go wrong, teamwork saves the day.',
    characters: ['Narrator', 'Dr. Kim', 'Maya', 'Ben', 'Sofia', 'Judge Peterson'],
    estimatedTime: '8–10 min',
    difficulty: 'Easy',
    theme: 'Science & Teamwork',
    script: `**NARRATOR:** It was the day of the annual science fair at Lincoln Elementary. Students had worked for weeks preparing their experiments.

**DR. KIM:** (encouragingly) Remember everyone, science is about learning from both successes AND failures!

**MAYA:** (confidently) My volcano is going to be perfect! I've practised this eruption fifty times!

**BEN:** (nervously) I hope my robot works. I stayed up until midnight programming it.

**SOFIA:** (worriedly) What if my plant growth experiment doesn't show any results?

**NARRATOR:** The judging began. Everything was going smoothly until...

**MAYA:** (panicking) Oh no! My volcano is erupting everywhere! It's not supposed to do that!

**BEN:** (frantically) And my robot is going crazy! It's knocking over other projects!

**SOFIA:** (upset) This is a disaster! The whole science fair is ruined!

**JUDGE PETERSON:** (calmly) Let's not panic, everyone. These things happen in real science too.

**NARRATOR:** Instead of giving up, the three friends decided to work together.

**MAYA:** Wait! Ben, can you program your robot to help clean up my volcano mess?

**BEN:** (brightening) That's brilliant! And Sofia, your plants could show how things grow even in unexpected conditions!

**SOFIA:** (excited) We could create a presentation about how real scientists handle unexpected problems!

**DR. KIM:** (proudly) Now you're thinking like true scientists! Problems become opportunities!

**NARRATOR:** Working together, they turned their disasters into a demonstration about scientific problem-solving.

**MAYA:** (presenting) Our volcano taught us about chemical reactions and safety procedures!

**BEN:** My robot showed us how to adapt technology when things don't go as planned!

**SOFIA:** And my plants proved that growth can happen even in chaos!

**JUDGE PETERSON:** (impressed) This is the most creative problem-solving I've seen all day! First place!

**NARRATOR:** In the end, they won first place — not for perfect experiments, but for perfect teamwork.

**DR. KIM:** Science isn't about everything going perfectly. It's about curiosity, collaboration, and learning from mistakes.

**ALL:** (together) Science is better when we work together!`
  },

  {
    id: 'cafeteria-chronicles',
    title: 'The Cafeteria Chronicles',
    emoji: '🍕',
    description: 'A humorous look at the daily drama of school lunch time.',
    characters: ['Narrator', 'Lunch Lady Linda', 'Pizza Lover Pete', 'Healthy Hannah', 'Picky Parker', 'New Kid Nadia'],
    estimatedTime: '6–8 min',
    difficulty: 'Easy',
    theme: 'School Life & Friendship',
    script: `**NARRATOR:** Welcome to Jefferson Middle School's cafeteria, where drama unfolds daily over mac and cheese!

**LUNCH LADY LINDA:** (cheerfully) Good morning, students! Today we have pizza, salad, and... mystery meat!

**PIZZA LOVER PETE:** (excitedly) Pizza day! This is the best day of my entire life!

**HEALTHY HANNAH:** (critically) Pete, you say that every pizza day. Don't you want some vegetables too?

**PIZZA LOVER PETE:** (horrified) Vegetables? On pizza day? Hannah, you're speaking madness!

**NARRATOR:** Meanwhile, Parker approaches the line with his usual cautious demeanour.

**PICKY PARKER:** (suspiciously) Lunch Lady Linda, what exactly IS mystery meat?

**LUNCH LADY LINDA:** (mysteriously) Well Parker, if I told you, it wouldn't be a mystery, would it?

**PICKY PARKER:** (worried) That doesn't make me feel better about eating it.

**NARRATOR:** Just then, Nadia, the new student, joins the lunch line looking confused.

**NEW KID NADIA:** (nervously) Um, excuse me, how does this whole lunch thing work here?

**HEALTHY HANNAH:** (helpfully) Oh, you just grab a tray and choose what you want! I'm Hannah, and I always recommend the salad!

**PIZZA LOVER PETE:** (interrupting) Don't listen to her! Pizza is the only logical choice!

**PICKY PARKER:** (cautioning) Actually, I'd suggest bringing lunch from home. It's much safer.

**NEW KID NADIA:** (overwhelmed) Wow, you all have very strong opinions about food!

**LUNCH LADY LINDA:** (wisely) Honey, in thirty years of cafeteria work, I've learned everyone has different tastes. Try a little of everything!

**NARRATOR:** Nadia decides to be adventurous and gets pizza, salad, AND mystery meat.

**NEW KID NADIA:** (bravely) You know what? I'm going to try it all! When in Rome...

**PIZZA LOVER PETE:** (impressed) Wow, you're braver than I am!

**HEALTHY HANNAH:** (admiringly) That's a very balanced approach!

**PICKY PARKER:** (amazed) You're actually going to eat the mystery meat? You're my hero!

**NARRATOR:** As they sit down together, Nadia takes her first bite of the mystery meat.

**NEW KID NADIA:** (surprised) Hey, this mystery meat actually tastes like... chicken!

**LUNCH LADY LINDA:** (calling from behind the counter) That's because it IS chicken! The mystery was just the seasoning!

**PICKY PARKER:** (relieved) Oh! Well, why didn't you just say that?

**LUNCH LADY LINDA:** (laughing) Where's the fun in that?

**NARRATOR:** And so, over shared laughs and lunch trays, a new friendship was born.

**ALL:** (together) Cafeteria friends are the best friends!`
  },

  // ── NEW HUMOROUS SCRIPTS ────────────────────────────────────────────────────

  {
    id: 'substitute-from-space',
    title: 'The Substitute Teacher from Space',
    emoji: '🛸',
    description: 'A very unusual substitute teacher arrives — and things get weird fast.',
    characters: ['Narrator', 'Ms. Zorp', 'Sam', 'Riley', 'Jordan', 'Principal'],
    estimatedTime: '12–14 min',
    difficulty: 'Medium',
    theme: 'Humour & School Life',
    script: `**NARRATOR:** It was a perfectly ordinary Monday at Greenfield Elementary. Until it wasn't.

**MS. ZORP:** (bursting through the door) Greetings, small humans! I am Ms. Zorp! I will be your substitute educator today!

**SAM:** (whispering to Riley) Did she just describe us as "small humans"?

**RILEY:** (whispering back) And are her eyes... glowing?

**MS. ZORP:** I have downloaded the entire contents of your human internet to prepare for this lesson. Shall we begin with "maaaths"?

**JORDAN:** (to Sam, confused) Why did she stretch the word like that?

**MS. ZORP:** Today's mathematics question! If a spaceship travels at the speed of sound, how many Earth moons will it pass before Thursday?

**SAM:** (raising hand slowly) That... depends on the moons of which planet?

**MS. ZORP:** (delighted, eyes flashing) Excellent! You pass! Humanity has tremendous potential after all!

**NARRATOR:** Things got stranger when Ms. Zorp pulled out a metal box labelled "Homework Disintegrator 3000."

**RILEY:** (alarmed) What does that do, exactly?

**MS. ZORP:** On my planet, homework is recycled into rocket fuel. I assumed this was standard educational practice on Earth.

**JORDAN:** Please do not disintegrate our homework. Our actual teacher will not be happy about it.

**MS. ZORP:** Noted. I will shelve the disintegrator for now. Instead — geography! (projecting a map onto the board) Name this continent!

**SAM:** (squinting) That's... not any continent I've seen. There's a second sun.

**MS. ZORP:** (flustered) Ah. Wrong planet file. My apologies. I have forty-seven planets in this folder.

**NARRATOR:** By lunchtime, Ms. Zorp had introduced three alien languages, confused the Roman Empire with a galaxy she once visited, and accidentally called the principal by the wrong name seven times.

**PRINCIPAL:** (arriving at the door, sternly) Ms. Zorp, this is Principal Davies. Not Commander Blorgh.

**MS. ZORP:** (snapping to attention) Commander Blorgh is actually a compliment on my home world, Principal Davies! It means "wise elder of the third moon."

**PRINCIPAL:** (long pause) ...I see. Carry on.

**RILEY:** (to Jordan, whispering) I think she might actually be from space.

**JORDAN:** (whispering) Either that or she is the most committed substitute teacher in history.

**SAM:** (whispering) Can we vote to keep her?

**NARRATOR:** At the end of the day, the class had learned remarkably little about the intended curriculum, but quite a lot about intergalactic table manners and the seventeen moons of Zorbius Prime.

**MS. ZORP:** (preparing to leave, addressing the class) Farewell, small humans. You have performed adequately. I will submit a positive report to the Galactic School Board.

**SAM:** Will you come back?

**MS. ZORP:** (pausing dramatically at the door) Only if Mrs. Anderson is absent again. Which, based on my calculations, will occur in precisely... eleven days.

**RILEY:** (looking at Jordan) Should we be worried or excited?

**JORDAN:** (grinning) I genuinely cannot tell.

**NARRATOR:** And so Room 14B returned to normal. But every time the lights flickered, the students whispered that Ms. Zorp was checking in from orbit.

**ALL:** (together) Best. Substitute. EVER.`
  },

  {
    id: 'talent-show-nobody-asked-for',
    title: 'The Talent Show Nobody Asked For',
    emoji: '🎤',
    description: 'The annual school talent show goes spectacularly, hilariously wrong.',
    characters: ['Narrator', 'Frankie', 'Ruby', 'Oscar', 'Devon', 'Judge Henderson'],
    estimatedTime: '13–15 min',
    difficulty: 'Medium',
    theme: 'Humour & Performing Arts',
    script: `**NARRATOR:** Every year, Jefferson Middle School hosts its Annual Talent Show. Every year, the students of Room 7B make extremely questionable decisions.

**FRANKIE:** (into microphone, very professionally) Welcome, welcome, WELCOME to the Jefferson Middle School Annual Talent Show! I am your host, Frankie Martinez, and tonight you will witness talent! (pause) Or something like it.

**NARRATOR:** First up was Ruby, with what was described on the programme as "a dramatic original poem."

**FRANKIE:** Ruby will be performing a poem about... (squinting at card) ...sandwiches?

**RUBY:** (stepping forward with immense seriousness) It's called "Ode to a BLT." (clears throat dramatically) Oh, BLT — you crunchy dream! With lettuce bright and bacon's gleam!

**OSCAR:** (whispering to Devon) She has been practising that poem since Tuesday.

**DEVON:** (whispering back) She was practising it during PE. While running the cross-country circuit.

**RUBY:** (continuing, building intensity) Your mayonnaise — a gentle tide! With tomatoes sitting side by side! Oh, BLT, I'll never quit thee — no sandwich has ever meant so much to me!

**JUDGE HENDERSON:** (making careful notes) Unusual subject matter. Powerful delivery. The mayonnaise metaphor is... bold.

**FRANKIE:** Stunning. Truly. Next up — Oscar, who will be performing a magic trick!

**OSCAR:** (nervously) Right. So. Um. (to audience) Pick a card. Any card.

**DEVON:** (picking a card, confused) Oscar, this is a debit card. A real one.

**OSCAR:** (panicking) That's my mum's! HOW did that get in — give that back right now!

**NARRATOR:** It turned out Oscar had accidentally picked up his mother's wallet instead of his card deck.

**OSCAR:** (to audience, recovering) Okay! New trick! I will now make this scarf... completely disappear!

**FRANKIE:** (after a very long pause) Oscar. We can all see your elbow. You're holding it behind your back.

**OSCAR:** (not moving, very still) No I'm not.

**DEVON:** We can literally see your elbow.

**OSCAR:** (determined) That. Is part. Of the trick.

**JUDGE HENDERSON:** (writing) Avant garde. Conceptual. Very brave.

**NARRATOR:** Devon's performance was next, and it was, by any measure, the most ambitious act of the evening.

**DEVON:** (announcing grandly) I will now perform the calls of seventeen different animals. In alphabetical order. (pause) Starting with aardvark.

**RUBY:** (impressed, to Frankie) He's been working on this for months.

**FRANKIE:** I know. He made me listen to the aardvark sound thirty-four times last week.

**DEVON:** (beginning) AAAAHNK. (pause, looking at audience) That was the aardvark.

**JUDGE HENDERSON:** (alarmed) Is that student unwell?

**FRANKIE:** He's fine! That was the aardvark! Carry on, Devon!

**NARRATOR:** Devon made it through bear, cat, dolphin, elephant, and an unusually convincing frog... before the fire alarm went off. Several audience members initially assumed it was the beginning of the gnu.

**DEVON:** (offended) That was NOT me! That was a real alarm! I haven't even gotten to gnu yet!

**RUBY:** Are you absolutely sure? Because gnu is quite high-pitched.

**FRANKIE:** (into microphone, calmly) Please exit the building in an orderly fashion. The talent show will resume once the fire brigade confirms that Devon has not accidentally summoned something.

**JUDGE HENDERSON:** (still writing notes as she exits) Points for authenticity. Minus points for causing an evacuation.

**NARRATOR:** The show continued after a twenty-minute break, ending with a standing ovation that may have been more about relief than appreciation.

**OSCAR:** (to Ruby and Devon backstage) Do you think we did well?

**RUBY:** I think we were unforgettable.

**DEVON:** (proudly) The gnu would have brought the house down. In a good way.

**FRANKIE:** (joining them) Judge Henderson gave us all seven out of ten. I think she was being generous.

**NARRATOR:** And so concluded the Annual Talent Show — chaotic, confusing, and absolutely impossible to forget.

**ALL:** (together) The show must go on! (pause) Eventually!`
  },

  {
    id: 'monster-under-the-bed',
    title: 'The Monster Under the Bed',
    emoji: '👾',
    description: 'Gerald the monster is terrible at being scary — but surprisingly good at other things.',
    characters: ['Narrator', 'Gerald', 'Max', 'Sofia', 'Dad'],
    estimatedTime: '12–14 min',
    difficulty: 'Easy',
    theme: 'Humour & Identity',
    script: `**NARRATOR:** Every house has its nighttime noises. Fourteen Maple Street had Gerald.

**GERALD:** (loudly whispering from under the bed) BOOOOOOOO.

**MAX:** (sleepily) ...What?

**GERALD:** I said BOO. I am the monster under your bed. You are supposed to scream.

**MAX:** (yawning) It's two in the morning, Gerald.

**GERALD:** (huffily) Monsters work the night shift. I don't make the rules. I just follow them.

**SOFIA:** (calling loudly from the next room) Max, is that Gerald again?

**MAX:** (calling back) Yep.

**SOFIA:** (appearing in the doorway, unimpressed) Gerald, we have school tomorrow. Could you possibly be terrifying on a weekend?

**GERALD:** (offended) I scheduled this fright session for Tuesday. It is Tuesday.

**MAX:** It's Wednesday. You've missed by a full day.

**GERALD:** (long pause) I really need to invest in a better calendar.

**NARRATOR:** Gerald had been under Max's bed for three years. In that time, he had successfully frightened Max a grand total of zero times. Gerald was, by his own admission, not particularly talented at his job.

**MAX:** Gerald, remember when you tried to scare us by leaping out of the wardrobe?

**GERALD:** (pained) We do not talk about that.

**SOFIA:** You knocked over Dad's golf clubs and they fell directly onto your own foot.

**GERALD:** (with great dignity) The wardrobe was extremely cluttered. It was an ambush waiting to happen.

**DAD:** (appearing in the doorway, yawning) Is Gerald having another session?

**MAX:** He thought it was Tuesday.

**DAD:** (sighing kindly) Gerald, I've said this before — you're welcome to try to scare the children, but these midnight visits are disrupting everyone's sleep. And mine.

**GERALD:** (quietly) I just... I want to be good at something. All the other monsters are getting five-star fright reviews and I can't even make Max flinch.

**SOFIA:** (softening) Oh. Gerald.

**MAX:** Okay but — you ARE good at things. Remember last month when Mum lost her keys for three days?

**GERALD:** (brightening slightly) I found them behind the washing machine in eleven seconds.

**MAX:** Eleven seconds! That's incredible!

**SOFIA:** And you fixed that weird rattling noise in the heater. Nobody else could figure out what it was.

**GERALD:** (with professional pride) Loose vent cover. Classic issue. I've seen it a hundred times in a hundred houses.

**DAD:** And you reorganised my toolbox. I can actually find things now.

**NARRATOR:** Gerald sniffled. In monster terms, this sounds exactly like a trombone being played through a very thick pillow.

**SOFIA:** Maybe being under a bed isn't about being scary. Maybe it's about being... there. Being helpful.

**GERALD:** (considering this carefully) The Monster Guild will absolutely not endorse this rebranding.

**MAX:** What if instead of scaring us, you scared away our bad dreams?

**GERALD:** (struck silent for a moment) Bad dreams. I could terrify bad dreams. I've had it wrong this whole time. I've been frightening the wrong audience entirely!

**DAD:** (nodding) We're all very proud of you, Gerald. Now — can we please go back to sleep?

**GERALD:** (whisper-dramatically) Yes. But tonight... I am going to frighten a bad dream SO thoroughly that it moves to a different postcode.

**NARRATOR:** And from that night on, fourteen Maple Street slept soundly — safe in the knowledge that Gerald was on duty beneath the bed, doing exactly the job he was always meant to do.

**ALL:** (together) Even monsters find their purpose eventually!`
  },

  {
    id: 'worlds-worst-field-trip',
    title: "The World's Most Eventful Field Trip",
    emoji: '🏛️',
    description: 'A school trip to the museum goes spectacularly off-script — in the best possible way.',
    characters: ['Narrator', 'Mr. Chen', 'Olivia', 'Jack', 'Priya', 'Museum Guide'],
    estimatedTime: '13–15 min',
    difficulty: 'Medium',
    theme: 'Humour & History',
    script: `**NARRATOR:** Class 6B had been looking forward to the City History Museum field trip for three weeks. Mr. Chen had been dreading it for approximately the same amount of time.

**MR. CHEN:** (on the bus, addressing the class) Right! Ground rules. Stay together. Don't touch anything. And under absolutely no circumstances does anyone push any buttons they're not supposed to push.

**JACK:** (innocently) What buttons?

**MR. CHEN:** ANY buttons. All buttons. Consider all buttons off-limits.

**OLIVIA:** (to Priya, whispering) He said that last time too.

**PRIYA:** (whispering back) And then Jack pushed the emergency exit button on the bus.

**JACK:** (whispering) That was a different kind of button situation.

**NARRATOR:** The class arrived at the museum and were met by their guide.

**MUSEUM GUIDE:** (cheerfully) Welcome, everyone! I'm your guide today. You are in for a wonderful journey through three thousand years of human history!

**OLIVIA:** (genuinely excited) Three thousand years! What's the oldest thing here?

**MUSEUM GUIDE:** Our oldest exhibit is a four-thousand-year-old Egyptian vase. Completely irreplaceable. One of a kind.

**MR. CHEN:** (quietly, to himself) Please let this go smoothly. Please.

**NARRATOR:** The tour began beautifully. The students were engaged, asking great questions — until the Egyptian room.

**JACK:** (reading a plaque) "Do not touch the exhibits." (pause) But what if I just very lightly—

**MR. CHEN:** JACK.

**JACK:** I was going to say "look at it closely"! I was going to say LOOK.

**MUSEUM GUIDE:** (smoothly) Shall we move to the medieval section?

**NARRATOR:** The medieval section was, if anything, more dramatic.

**PRIYA:** (reading) "Knight's armour, circa 1340. Originally worn in the Battle of Crécy." (to Olivia) Do you think someone actually wore that?

**OLIVIA:** Obviously, it's armour, it wasn't just decorative—

**JACK:** (having somehow put on a gauntlet) Does this fit my hand? I feel like this fits my hand.

**MR. CHEN:** How did you even—? Jack. Take the gauntlet off. RIGHT NOW.

**MUSEUM GUIDE:** (arriving at a run) Oh! Oh no. Sir, he's not supposed to — those are — please—

**JACK:** (trying to remove it) It won't come off. The gauntlet has claimed me.

**NARRATOR:** It took seven minutes, a bottle of hand lotion from the gift shop, and two museum staff members to remove the gauntlet. Jack's hand emerged completely unharmed. The gauntlet also survived, which Mr. Chen described as "a genuine miracle."

**MR. CHEN:** (pinching the bridge of his nose) How. How does this keep happening.

**OLIVIA:** (consolingly) The good news is, that's probably the most memorable moment those museum staff have had all year.

**PRIYA:** They were definitely going to talk about this at dinner tonight.

**NARRATOR:** Despite everything, the tour finished on a remarkable high note. In the final gallery — an exhibit on ancient astronomy — Priya asked a question that stopped the entire room.

**PRIYA:** (thoughtfully) If ancient people mapped the stars without any technology, and they were right about most of it... does that mean they were smarter than we think?

**MUSEUM GUIDE:** (genuinely moved) That is one of the best questions I have ever been asked on a tour.

**OLIVIA:** (proudly) That's Priya. She does that.

**MR. CHEN:** (surprised, pleased) I have to admit — that is an excellent question.

**JACK:** (still rubbing his hand) I also asked a good question earlier.

**MR. CHEN:** You asked if the knight's ghost "came with the armour."

**JACK:** (nodding) Historical curiosity. Completely valid.

**NARRATOR:** On the bus home, tired and slightly lotion-scented, the class agreed it had been the best field trip they'd ever been on.

**MR. CHEN:** (exhausted but smiling) Next year, I'm taking you to a very padded, button-free room.

**OLIVIA:** You say that every year.

**PRIYA:** And every year we still go somewhere amazing.

**JACK:** (happily) Can we come back? I feel like the gauntlet and I weren't finished.

**MR. CHEN:** Absolutely not.

**NARRATOR:** But secretly, even Mr. Chen was already looking forward to next year.

**ALL:** (together) History is made by the curious — and the occasionally chaotic!`
  },

];

// ─── Difficulty badge colours ─────────────────────────────────────────────────
const diffBadge = {
  Easy:   'bg-emerald-100 text-emerald-800',
  Medium: 'bg-amber-100   text-amber-800',
  Hard:   'bg-red-100     text-red-800',
};

// ─── Student display name helper ──────────────────────────────────────────────
const studentName = (s) => s ? `${s.firstName} ${s.lastName}` : 'Unassigned';

// ─────────────────────────────────────────────────────────────────────────────
// SUB-VIEWS
// ─────────────────────────────────────────────────────────────────────────────

// ── Script Picker ─────────────────────────────────────────────────────────────
const PickerView = ({ onSelect }) => (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-4xl">🎭</span>
        <div>
          <h2 className="text-2xl font-bold">Readers Theatre</h2>
          <p className="text-fuchsia-200 text-sm mt-0.5">
            Choose a script, assign your students to roles, then perform!
          </p>
        </div>
      </div>
    </div>

    <div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
        Choose a Script — {THEATRE_SCRIPTS.length} available
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {THEATRE_SCRIPTS.map(script => (
          <button
            key={script.id}
            onClick={() => onSelect(script.id)}
            className="text-left p-5 bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-4xl">{script.emoji}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${diffBadge[script.difficulty] || 'bg-gray-100 text-gray-700'}`}>
                {script.difficulty}
              </span>
            </div>
            <h4 className="font-bold text-gray-800 text-base mb-1 group-hover:text-purple-700 transition-colors">
              {script.title}
            </h4>
            <p className="text-sm text-gray-500 mb-3 leading-snug">{script.description}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
              <span>🎭 {script.characters.length} roles</span>
              <span>⏱ {script.estimatedTime}</span>
              <span>🏷 {script.theme}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  </div>
);

// ── Setup / Assignment View ────────────────────────────────────────────────────
const SetupView = ({ script, students, assignments, colorMap, onAssign, onSave, hasUnsaved, onBack, onPerform, onPrint }) => {
  const assignedStudentIds = Object.values(assignments).filter(Boolean);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white rounded-2xl p-5 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{script.emoji}</span>
            <div>
              <h2 className="text-xl font-bold">{script.title}</h2>
              <p className="text-fuchsia-200 text-sm">{script.theme} · {script.estimatedTime} · {script.characters.length} roles</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
            <button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition">
              ← Scripts
            </button>
            {hasUnsaved && (
              <button onClick={onSave} className="bg-emerald-400 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition animate-pulse">
                💾 Save
              </button>
            )}
            <button
              onClick={onPrint}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition"
            >
              🖨️ Print
            </button>
            <button
              onClick={onPerform}
              className="bg-white text-purple-700 hover:bg-fuchsia-50 px-4 py-1.5 rounded-lg text-sm font-bold transition shadow"
            >
              🎬 Perform
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Character assignment panel */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
            <h3 className="font-bold text-gray-800">Assign Students to Roles</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {assignedStudentIds.length}/{script.characters.length} roles filled
              {students.length === 0 && ' — add students to your class to assign them'}
            </p>
          </div>
          <div className="p-4 space-y-3">
            {script.characters.map(char => {
              const color = colorMap[char] || NARRATOR_CLR;
              const assignedId = assignments[char] || '';
              return (
                <div
                  key={char}
                  className="flex items-center gap-3 p-2 rounded-xl"
                  style={{ backgroundColor: color.bg, borderLeft: `4px solid ${color.border}` }}
                >
                  {/* Character badge */}
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 min-w-max"
                    style={{ backgroundColor: color.chip, color: color.chipText }}
                  >
                    {char}
                  </span>
                  {/* Student dropdown */}
                  <select
                    value={assignedId}
                    onChange={e => onAssign(char, e.target.value)}
                    className="flex-1 text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="">— unassigned —</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {studentName(s)}
                        {assignedStudentIds.includes(s.id) && assignments[char] !== s.id ? ' ✓ (used)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          {students.length === 0 && (
            <div className="px-5 pb-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                No students in your class yet. You can still run the script — just perform roles by character name.
              </div>
            </div>
          )}
        </div>

        {/* Colour key + script preview */}
        <div className="space-y-4">
          {/* Colour key */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-4">
            <h3 className="font-bold text-gray-800 mb-3">Colour Key</h3>
            <div className="flex flex-wrap gap-2">
              {script.characters.map(char => {
                const color = colorMap[char] || NARRATOR_CLR;
                const studentId = assignments[char];
                const student = students.find(s => s.id === studentId);
                return (
                  <div
                    key={char}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: color.bg, border: `2px solid ${color.border}`, color: color.text }}
                  >
                    <span style={{ backgroundColor: color.chip, borderRadius: '50%', width: 8, height: 8, display: 'inline-block', flexShrink: 0 }} />
                    {char}
                    {student && <span className="opacity-70">→ {student.firstName}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Script preview */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
              <h3 className="font-bold text-gray-800">Script Preview</h3>
              <p className="text-xs text-gray-500 mt-0.5">First few lines — click Perform for the full colour view</p>
            </div>
            <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
              {parseScript(script.script).slice(0, 10).map((line, i) => {
                if (!line.character) return (
                  <p key={i} className="text-xs text-gray-400 italic">{line.dialogue}</p>
                );
                const color = colorMap[line.character.toUpperCase()] || colorMap[line.character] || NARRATOR_CLR;
                return (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: color.chip, color: color.chipText }}>
                      {line.character}
                    </span>
                    <span className="text-xs text-gray-700">
                      {line.stageDir && <em className="text-gray-400">({line.stageDir}) </em>}
                      {line.dialogue}
                    </span>
                  </div>
                );
              })}
              <p className="text-xs text-gray-400 text-center pt-2">...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Perform / Present View ────────────────────────────────────────────────────
const PerformView = ({ script, students, assignments, colorMap, onBack, onPrint }) => {
  const lines = parseScript(script.script);

  const getStudentLabel = (character) => {
    const id = assignments[character];
    if (!id) return null;
    const s = students.find(st => st.id === id);
    return s ? s.firstName : null;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white rounded-2xl px-5 py-4 shadow-lg flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{script.emoji}</span>
          <div>
            <h2 className="text-xl font-bold leading-tight">{script.title}</h2>
            <p className="text-fuchsia-200 text-sm">{script.estimatedTime} · {script.characters.length} roles</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onPrint}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-bold transition"
          >
            🖨️ Print Script
          </button>
          <button
            onClick={onBack}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-bold transition"
          >
            ← Back to Setup
          </button>
        </div>
      </div>

      {/* Colour key bar */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Colour Key</p>
        <div className="flex flex-wrap gap-2">
          {script.characters.map(char => {
            const color = colorMap[char] || NARRATOR_CLR;
            const studentFirst = getStudentLabel(char);
            return (
              <div
                key={char}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold"
                style={{ backgroundColor: color.bg, border: `2px solid ${color.border}`, color: color.text }}
              >
                {char}
                {studentFirst && <span className="font-normal opacity-80 text-xs">({studentFirst})</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Script body */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 space-y-2">
          {lines.map((line, i) => {
            if (!line.character) {
              // Stage direction / plain line
              return (
                <p key={i} className="text-sm text-gray-400 italic text-center py-1">
                  {line.dialogue}
                </p>
              );
            }

            const color = colorMap[line.character.toUpperCase()] || colorMap[line.character] || NARRATOR_CLR;
            const studentFirst = getStudentLabel(line.character) || getStudentLabel(
              // try matching case-insensitively
              script.characters.find(c => c.toUpperCase() === line.character.toUpperCase()) || ''
            );

            const isNarrator = line.character.toUpperCase() === 'NARRATOR';
            const isAll = line.character.toUpperCase() === 'ALL';

            return (
              <div
                key={i}
                className="rounded-xl px-4 py-3 flex items-start gap-3"
                style={{ backgroundColor: color.bg, borderLeft: `5px solid ${color.border}` }}
              >
                {/* Character pill */}
                <div className="flex flex-col items-center flex-shrink-0 gap-0.5 min-w-[80px]">
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full text-center w-full"
                    style={{ backgroundColor: color.chip, color: color.chipText }}
                  >
                    {line.character}
                  </span>
                  {studentFirst && (
                    <span className="text-xs font-semibold" style={{ color: color.border }}>
                      {studentFirst}
                    </span>
                  )}
                </div>

                {/* Dialogue */}
                <div className="flex-1">
                  {line.stageDir && (
                    <span className="text-sm italic mr-1" style={{ color: color.border, opacity: 0.7 }}>
                      ({line.stageDir})
                    </span>
                  )}
                  <span
                    className={`text-base leading-relaxed ${isNarrator ? 'italic' : ''} ${isAll ? 'font-bold' : 'font-medium'}`}
                    style={{ color: color.text }}
                  >
                    {line.dialogue}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const ReadersTheatre = ({
  showToast   = () => {},
  students    = [],
  saveData    = () => {},
  loadedData  = {},
}) => {
  const savedSession = loadedData?.theatreSession || null;

  const [view,             setView]             = useState(savedSession?.scriptId ? 'setup' : 'picker');
  const [selectedScriptId, setSelectedScriptId] = useState(savedSession?.scriptId || null);
  const [assignments,      setAssignments]      = useState(savedSession?.characterAssignments || {});
  const [hasUnsaved,       setHasUnsaved]       = useState(false);

  // Sync if loadedData arrives later (e.g. Firebase load)
  useEffect(() => {
    if (loadedData?.theatreSession?.scriptId) {
      setSelectedScriptId(loadedData.theatreSession.scriptId);
      setAssignments(loadedData.theatreSession.characterAssignments || {});
      setView('setup');
      setHasUnsaved(false);
    }
  }, [loadedData?.theatreSession?.scriptId]);

  const selectedScript = THEATRE_SCRIPTS.find(s => s.id === selectedScriptId) || null;
  const colorMap       = selectedScript ? buildColorMap(selectedScript.characters) : {};

  const handleSelectScript = (scriptId) => {
    setSelectedScriptId(scriptId);
    setAssignments({});
    setView('setup');
    setHasUnsaved(true);
  };

  const handleAssign = (character, studentId) => {
    setAssignments(prev => {
      const next = { ...prev };
      // One student → one role only
      if (studentId) {
        Object.keys(next).forEach(c => { if (next[c] === studentId) delete next[c]; });
        next[character] = studentId;
      } else {
        delete next[character];
      }
      return next;
    });
    setHasUnsaved(true);
  };

  const handleSave = () => {
    saveData({
      toolkitData: {
        ...loadedData,
        theatreSession: {
          scriptId:             selectedScriptId,
          characterAssignments: assignments,
          savedAt:              new Date().toISOString(),
        },
      },
    });
    setHasUnsaved(false);
    showToast('Theatre session saved!', 'success');
  };

  if (view === 'picker') {
    return <PickerView onSelect={handleSelectScript} />;
  }

  if (view === 'setup' && selectedScript) {
    return (
      <SetupView
        script={selectedScript}
        students={students}
        assignments={assignments}
        colorMap={colorMap}
        onAssign={handleAssign}
        onSave={handleSave}
        hasUnsaved={hasUnsaved}
        onBack={() => setView('picker')}
        onPerform={() => setView('perform')}
        onPrint={() => printScript(selectedScript, students, assignments, colorMap)}
      />
    );
  }

  if (view === 'perform' && selectedScript) {
    return (
      <PerformView
        script={selectedScript}
        students={students}
        assignments={assignments}
        colorMap={colorMap}
        onBack={() => setView('setup')}
        onPrint={() => printScript(selectedScript, students, assignments, colorMap)}
      />
    );
  }

  // Fallback — shouldn't normally reach here
  return <PickerView onSelect={handleSelectScript} />;
};

export default ReadersTheatre;
