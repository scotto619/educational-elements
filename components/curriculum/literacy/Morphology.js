// components/curriculum/literacy/Morphology.js
import React, { useCallback, useEffect, useRef, useState } from 'react';
import MorphologyLevel1 from './morphology/MorphologyLevel1';
import MorphologyLevel2 from './morphology/MorphologyLevel2';

// Printable templates
const printableTemplates = {
  'compound-word-cards': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Compound Word Cards</title>
<style>
body{font-family:Arial,sans-serif;margin:20px}
.card-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin:30px 0}
.card{border:4px solid #333;border-radius:15px;padding:30px;text-align:center;min-height:200px}
.part1{background:linear-gradient(135deg,#a8edea 0%,#fed6e3 100%)}
.part2{background:linear-gradient(135deg,#ffecd2 0%,#fcb69f 100%)}
.compound{background:linear-gradient(135deg,#c3cfe2 0%,#c3cfe2 100%);border-width:5px}
.emoji{font-size:70px}
.word{font-size:32px;font-weight:bold;margin:10px 0}
h2{color:#4a148c;margin-top:40px}
</style></head><body>
<h1 style="text-align:center">🔤 Compound Word Picture Match Cards</h1>
<h2>Set 1: Rainbow 🌈</h2>
<div class="card-grid">
<div class="card part1"><div class="emoji">☔</div><div class="word">RAIN</div></div>
<div class="card part2"><div class="emoji">🎀</div><div class="word">BOW</div></div>
<div class="card compound"><div class="emoji">🌈</div><div class="word">RAINBOW</div></div>
</div>
<h2>Set 2: Sunshine ☀️</h2>
<div class="card-grid">
<div class="card part1"><div class="emoji">☀️</div><div class="word">SUN</div></div>
<div class="card part2"><div class="emoji">✨</div><div class="word">SHINE</div></div>
<div class="card compound"><div class="emoji">🌞</div><div class="word">SUNSHINE</div></div>
</div>
<h2>Set 3: Football ⚽</h2>
<div class="card-grid">
<div class="card part1"><div class="emoji">👣</div><div class="word">FOOT</div></div>
<div class="card part2"><div class="emoji">⚽</div><div class="word">BALL</div></div>
<div class="card compound"><div class="emoji">🏈</div><div class="word">FOOTBALL</div></div>
</div>
<h2>Set 4: Butterfly 🦋</h2>
<div class="card-grid">
<div class="card part1"><div class="emoji">🧈</div><div class="word">BUTTER</div></div>
<div class="card part2"><div class="emoji">🪰</div><div class="word">FLY</div></div>
<div class="card compound"><div class="emoji">🦋</div><div class="word">BUTTERFLY</div></div>
</div>
<h2>Set 5: Cupcake 🧁</h2>
<div class="card-grid">
<div class="card part1"><div class="emoji">☕</div><div class="word">CUP</div></div>
<div class="card part2"><div class="emoji">🎂</div><div class="word">CAKE</div></div>
<div class="card compound"><div class="emoji">🧁</div><div class="word">CUPCAKE</div></div>
</div>
<h2>Set 6: Bedroom 🛏️</h2>
<div class="card-grid">
<div class="card part1"><div class="emoji">🛏️</div><div class="word">BED</div></div>
<div class="card part2"><div class="emoji">🚪</div><div class="word">ROOM</div></div>
<div class="card compound"><div class="emoji">🏠</div><div class="word">BEDROOM</div></div>
</div>
</body></html>`;
  },
  
  'build-a-word-cards': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Build-A-Word Cards</title>
<style>
body{font-family:Arial,sans-serif;margin:20px}
.card-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin:20px 0}
.card{border:4px dashed #333;border-radius:12px;padding:25px 15px;text-align:center;background:linear-gradient(135deg,#ffeaa7 0%,#fdcb6e 100%);min-height:100px;display:flex;align-items:center;justify-content:center}
.word{font-size:28px;font-weight:bold}
h2{color:#0984e3;margin-top:30px}
</style></head><body>
<h1 style="text-align:center">🏗️ Build-A-Word Station Cards</h1>
<h2>Word Cards - Set 1</h2>
<div class="card-grid">
<div class="card"><div class="word">SUN</div></div>
<div class="card"><div class="word">MOON</div></div>
<div class="card"><div class="word">STAR</div></div>
<div class="card"><div class="word">RAIN</div></div>
<div class="card"><div class="word">FISH</div></div>
<div class="card"><div class="word">BALL</div></div>
<div class="card"><div class="word">BOW</div></div>
<div class="card"><div class="word">LIGHT</div></div>
</div>
<h2>Word Cards - Set 2</h2>
<div class="card-grid">
<div class="card"><div class="word">FOOT</div></div>
<div class="card"><div class="word">BASKET</div></div>
<div class="card"><div class="word">CUP</div></div>
<div class="card"><div class="word">TOOTH</div></div>
<div class="card"><div class="word">CAKE</div></div>
<div class="card"><div class="word">BRUSH</div></div>
<div class="card"><div class="word">POP</div></div>
<div class="card"><div class="word">CORN</div></div>
</div>
<h2>Word Cards - Set 3</h2>
<div class="card-grid">
<div class="card"><div class="word">BED</div></div>
<div class="card"><div class="word">BATH</div></div>
<div class="card"><div class="word">CLASS</div></div>
<div class="card"><div class="word">PLAY</div></div>
<div class="card"><div class="word">ROOM</div></div>
<div class="card"><div class="word">GROUND</div></div>
<div class="card"><div class="word">MATE</div></div>
<div class="card"><div class="word">TIME</div></div>
</div>
<h2>Word Cards - Set 4</h2>
<div class="card-grid">
<div class="card"><div class="word">FIRE</div></div>
<div class="card"><div class="word">SNOW</div></div>
<div class="card"><div class="word">AIR</div></div>
<div class="card"><div class="word">WATER</div></div>
<div class="card"><div class="word">FLY</div></div>
<div class="card"><div class="word">MAN</div></div>
<div class="card"><div class="word">PLANE</div></div>
<div class="card"><div class="word">FALL</div></div>
</div>
</body></html>`;
  },
  
  'base-affix-cards': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Base & Affix Cards</title>
<style>
body{font-family:Arial,sans-serif;margin:20px}
.card-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin:20px 0}
.base-card{border:5px solid #e74c3c;border-radius:12px;padding:30px 20px;text-align:center;background:linear-gradient(135deg,#ffeaa7 0%,#fdcb6e 100%);min-height:120px}
.affix-card{border:5px solid #3498db;border-radius:12px;padding:30px 20px;text-align:center;background:linear-gradient(135deg,#a8edea 0%,#fed6e3 100%);min-height:120px}
.word{font-size:32px;font-weight:bold}
.emoji{font-size:35px}
h2{color:#e74c3c;margin-top:30px}
</style></head><body>
<h1 style="text-align:center">🎯 Base Words & Affixes Cards</h1>
<h2>❤️ Base Word Cards (RED borders)</h2>
<div class="card-grid">
<div class="base-card"><div class="emoji">🎮</div><div class="word">PLAY</div></div>
<div class="base-card"><div class="emoji">🦘</div><div class="word">JUMP</div></div>
<div class="base-card"><div class="emoji">🚶</div><div class="word">WALK</div></div>
<div class="base-card"><div class="emoji">🏃</div><div class="word">RUN</div></div>
<div class="base-card"><div class="emoji">🤝</div><div class="word">HELP</div></div>
<div class="base-card"><div class="emoji">👩‍🏫</div><div class="word">TEACH</div></div>
<div class="base-card"><div class="emoji">🎨</div><div class="word">PAINT</div></div>
<div class="base-card"><div class="emoji">🎤</div><div class="word">SING</div></div>
<div class="base-card"><div class="emoji">📖</div><div class="word">READ</div></div>
<div class="base-card"><div class="emoji">✏️</div><div class="word">WRITE</div></div>
<div class="base-card"><div class="emoji">😊</div><div class="word">SMILE</div></div>
<div class="base-card"><div class="emoji">🗣️</div><div class="word">TALK</div></div>
</div>
<h2 style="color:#3498db">💙 Affix Cards (BLUE borders)</h2>
<div class="card-grid">
<div class="affix-card"><div class="word">-ING</div><small>happening now</small></div>
<div class="affix-card"><div class="word">-ED</div><small>already happened</small></div>
<div class="affix-card"><div class="word">-ER</div><small>person who does</small></div>
<div class="affix-card"><div class="word">-S</div><small>more than one</small></div>
</div>
</body></html>`;
  },
  
  'word-train-cards': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Word Part Train</title>
<style>
body{font-family:Arial,sans-serif;margin:20px}
.card-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:15px;margin:20px 0}
.prefix-card{background:linear-gradient(135deg,#ff6b6b 0%,#ee5a6f 100%);border:5px solid #c92a2a;border-radius:12px;padding:25px 15px;text-align:center;min-height:100px}
.base-card{background:linear-gradient(135deg,#ffd93d 0%,#f6c23e 100%);border:5px solid #f59f00;border-radius:12px;padding:25px 15px;text-align:center;min-height:100px}
.suffix-card{background:linear-gradient(135deg,#6c5ce7 0%,#a29bfe 100%);border:5px solid #5f3dc4;border-radius:12px;padding:25px 15px;text-align:center;min-height:100px}
.word{font-size:28px;font-weight:bold;color:white}
h2{margin-top:30px}
</style></head><body>
<h1 style="text-align:center">🚂 Word Part Train Cards</h1>
<h2>🔴 PREFIX Cards (RED)</h2>
<div class="card-grid">
<div class="prefix-card"><div class="word">UN-</div></div>
<div class="prefix-card"><div class="word">RE-</div></div>
<div class="prefix-card"><div class="word">UN-</div></div>
<div class="prefix-card"><div class="word">RE-</div></div>
<div class="prefix-card"><div class="word">UN-</div></div>
</div>
<h2>🟡 BASE WORD Cards (YELLOW)</h2>
<div class="card-grid">
<div class="base-card"><div class="word">HAPPY</div></div>
<div class="base-card"><div class="word">LOCK</div></div>
<div class="base-card"><div class="word">TIE</div></div>
<div class="base-card"><div class="word">PLAY</div></div>
<div class="base-card"><div class="word">DO</div></div>
<div class="base-card"><div class="word">READ</div></div>
<div class="base-card"><div class="word">KIND</div></div>
<div class="base-card"><div class="word">CARE</div></div>
<div class="base-card"><div class="word">HELP</div></div>
<div class="base-card"><div class="word">COLOR</div></div>
</div>
<h2>🟣 SUFFIX Cards (PURPLE)</h2>
<div class="card-grid">
<div class="suffix-card"><div class="word">-ING</div></div>
<div class="suffix-card"><div class="word">-ED</div></div>
<div class="suffix-card"><div class="word">-ER</div></div>
<div class="suffix-card"><div class="word">-FUL</div></div>
<div class="suffix-card"><div class="word">-LESS</div></div>
<div class="suffix-card"><div class="word">-ING</div></div>
<div class="suffix-card"><div class="word">-ED</div></div>
<div class="suffix-card"><div class="word">-FUL</div></div>
<div class="suffix-card"><div class="word">-LESS</div></div>
<div class="suffix-card"><div class="word">-S</div></div>
</div>
</body></html>`;
  },
  
  'color-the-parts': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Color the Word Parts</title>
<style>
body{font-family:Arial,sans-serif;margin:20px;max-width:800px;margin:0 auto;padding:30px}
.word-box{border:3px solid #333;border-radius:10px;padding:20px;margin:20px 0;background:white}
.word-display{font-size:48px;font-weight:bold;text-align:center;letter-spacing:8px;padding:20px;background:#f8f9fa;border-radius:8px;margin:10px 0}
.instructions{background:#fff3cd;border:3px solid #ffc107;border-radius:10px;padding:15px;margin:20px 0}
h1{text-align:center}
</style></head><body>
<h1>🎨 Color the Word Parts</h1>
<div class="instructions">
<strong>Instructions:</strong> Color each part of the word:
<ul>
<li>Color the PREFIX <strong style="color:#ff6b6b">RED</strong></li>
<li>Color the BASE <strong style="color:#ffd93d">YELLOW</strong></li>
<li>Color the SUFFIX <strong style="color:#a29bfe">PURPLE</strong></li>
</ul>
</div>
<div class="word-box"><strong>1.</strong><div class="word-display">UNHAPPY</div></div>
<div class="word-box"><strong>2.</strong><div class="word-display">PLAYING</div></div>
<div class="word-box"><strong>3.</strong><div class="word-display">JUMPED</div></div>
<div class="word-box"><strong>4.</strong><div class="word-display">REPLAY</div></div>
<div class="word-box"><strong>5.</strong><div class="word-display">CAREFUL</div></div>
<div class="word-box"><strong>6.</strong><div class="word-display">HELPLESS</div></div>
<div class="word-box"><strong>7.</strong><div class="word-display">UNKIND</div></div>
<div class="word-box"><strong>8.</strong><div class="word-display">TEACHER</div></div>
</body></html>`;
  },

  'meaningful-parts-cards': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Meaningful Parts Cards</title>
<style>
body{font-family:Arial,sans-serif;margin:20px}
.card-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin:30px 0}
.card{border:4px solid #333;border-radius:15px;padding:30px;text-align:center;min-height:180px;display:flex;flex-direction:column;justify-content:center}
.word-card{background:linear-gradient(135deg,#a8edea 0%,#fed6e3 100%)}
.parts-card{background:linear-gradient(135deg,#ffecd2 0%,#fcb69f 100%)}
.word{font-size:36px;font-weight:bold;margin:15px 0}
.parts{font-size:18px;color:#333;margin:10px 0}
.base{color:#e74c3c;font-weight:bold}
.suffix{color:#3498db;font-weight:bold}
h2{color:#4a148c;margin-top:40px}
</style></head><body>
<h1 style="text-align:center">🧩 Meaningful Parts Cards</h1>
<h2>Word Cards with Parts Identified</h2>
<div class="card-grid">
<div class="card word-card"><div class="word">CATS</div><div class="parts"><span class="base">CAT</span> + <span class="suffix">S</span></div><small>one cat + more than one</small></div>
<div class="card word-card"><div class="word">DOGS</div><div class="parts"><span class="base">DOG</span> + <span class="suffix">S</span></div><small>one dog + more than one</small></div>
<div class="card word-card"><div class="word">HATS</div><div class="parts"><span class="base">HAT</span> + <span class="suffix">S</span></div><small>one hat + more than one</small></div>
<div class="card word-card"><div class="word">CUPS</div><div class="parts"><span class="base">CUP</span> + <span class="suffix">S</span></div><small>one cup + more than one</small></div>
<div class="card word-card"><div class="word">PIGS</div><div class="parts"><span class="base">PIG</span> + <span class="suffix">S</span></div><small>one pig + more than one</small></div>
<div class="card word-card"><div class="word">BEDS</div><div class="parts"><span class="base">BED</span> + <span class="suffix">S</span></div><small>one bed + more than one</small></div>
<div class="card word-card"><div class="word">BUGS</div><div class="parts"><span class="base">BUG</span> + <span class="suffix">S</span></div><small>one bug + more than one</small></div>
<div class="card word-card"><div class="word">TOYS</div><div class="parts"><span class="base">TOY</span> + <span class="suffix">S</span></div><small>one toy + more than one</small></div>
<div class="card word-card"><div class="word">PENS</div><div class="parts"><span class="base">PEN</span> + <span class="suffix">S</span></div><small>one pen + more than one</small></div>
</div>
<h2>Base Word Cards</h2>
<div class="card-grid">
<div class="card parts-card"><div class="word base">CAT</div><small>BASE: one animal</small></div>
<div class="card parts-card"><div class="word base">DOG</div><small>BASE: one animal</small></div>
<div class="card parts-card"><div class="word base">HAT</div><small>BASE: one thing</small></div>
<div class="card parts-card"><div class="word base">CUP</div><small>BASE: one thing</small></div>
<div class="card parts-card"><div class="word base">PIG</div><small>BASE: one animal</small></div>
<div class="card parts-card"><div class="word base">BED</div><small>BASE: one thing</small></div>
</div>
<h2>Suffix Cards</h2>
<div class="card-grid">
<div class="card parts-card"><div class="word suffix">-S</div><small>SUFFIX: more than one</small></div>
<div class="card parts-card"><div class="word suffix">-S</div><small>SUFFIX: more than one</small></div>
<div class="card parts-card"><div class="word suffix">-S</div><small>SUFFIX: more than one</small></div>
<div class="card parts-card"><div class="word suffix">-S</div><small>SUFFIX: more than one</small></div>
<div class="card parts-card"><div class="word suffix">-S</div><small>SUFFIX: more than one</small></div>
<div class="card parts-card"><div class="word suffix">-S</div><small>SUFFIX: more than one</small></div>
</div>
</body></html>`;
  },

  'singular-plural-match': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Singular & Plural Match</title>
<style>
body{font-family:Arial,sans-serif;margin:20px}
.match-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:30px;margin:30px 0}
.card{border:4px solid #333;border-radius:15px;padding:25px;text-align:center;min-height:150px}
.singular{background:linear-gradient(135deg,#ffeaa7 0%,#fdcb6e 100%);border-color:#e17055}
.plural{background:linear-gradient(135deg,#a8edea 0%,#fed6e3 100%);border-color:#6c5ce7}
.emoji{font-size:60px;margin:15px 0}
.word{font-size:32px;font-weight:bold;margin:10px 0}
.label{font-size:14px;font-weight:bold;padding:5px 10px;border-radius:10px;display:inline-block;margin-top:10px}
.singular-label{background:#e17055;color:white}
.plural-label{background:#6c5ce7;color:white}
h2{color:#4a148c;margin-top:40px}
</style></head><body>
<h1 style="text-align:center">🎴 Singular & Plural Picture Match</h1>
<p style="text-align:center"><strong>Match the singular (one) with the plural (many)!</strong></p>
<h2>Set 1</h2>
<div class="match-grid">
<div class="card singular"><div class="emoji">🐕</div><div class="word">DOG</div><div class="label singular-label">ONE</div></div>
<div class="card plural"><div class="emoji">🐕🐕🐕</div><div class="word">DOGS</div><div class="label plural-label">MANY</div></div>
</div>
<h2>Set 2</h2>
<div class="match-grid">
<div class="card singular"><div class="emoji">🐱</div><div class="word">CAT</div><div class="label singular-label">ONE</div></div>
<div class="card plural"><div class="emoji">🐱🐱🐱</div><div class="word">CATS</div><div class="label plural-label">MANY</div></div>
</div>
<h2>Set 3</h2>
<div class="match-grid">
<div class="card singular"><div class="emoji">🎩</div><div class="word">HAT</div><div class="label singular-label">ONE</div></div>
<div class="card plural"><div class="emoji">🎩🎩🎩</div><div class="word">HATS</div><div class="label plural-label">MANY</div></div>
</div>
<h2>Set 4</h2>
<div class="match-grid">
<div class="card singular"><div class="emoji">⚽</div><div class="word">BALL</div><div class="label singular-label">ONE</div></div>
<div class="card plural"><div class="emoji">⚽⚽⚽</div><div class="word">BALLS</div><div class="label plural-label">MANY</div></div>
</div>
<h2>Set 5</h2>
<div class="match-grid">
<div class="card singular"><div class="emoji">🐷</div><div class="word">PIG</div><div class="label singular-label">ONE</div></div>
<div class="card plural"><div class="emoji">🐷🐷🐷</div><div class="word">PIGS</div><div class="label plural-label">MANY</div></div>
</div>
<h2>Set 6</h2>
<div class="match-grid">
<div class="card singular"><div class="emoji">☕</div><div class="word">CUP</div><div class="label singular-label">ONE</div></div>
<div class="card plural"><div class="emoji">☕☕☕</div><div class="word">CUPS</div><div class="label plural-label">MANY</div></div>
</div>
</body></html>`;
  },

  'add-s-practice': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Add -S Practice</title>
<style>
body{font-family:Arial,sans-serif;margin:20px;max-width:900px;margin:0 auto;padding:30px}
.practice-box{border:3px solid #333;border-radius:10px;padding:25px;margin:20px 0;background:#f8f9fa}
.word-row{display:flex;align-items:center;justify-content:center;gap:20px;margin:20px 0;font-size:32px;font-weight:bold}
.base{color:#e74c3c;padding:10px 20px;background:white;border:3px solid #e74c3c;border-radius:10px}
.plus{color:#333;font-size:40px}
.suffix{color:#3498db;padding:10px 20px;background:white;border:3px solid #3498db;border-radius:10px}
.equals{color:#333;font-size:40px}
.result{padding:10px 20px;background:white;border:3px dashed #333;border-radius:10px;min-width:150px;text-align:center}
h1{text-align:center;color:#4a148c}
.instructions{background:#d4edda;border:3px solid #28a745;border-radius:10px;padding:15px;margin:20px 0}
</style></head><body>
<h1>➕ Add -S Practice</h1>
<div class="instructions">
<strong>Instructions:</strong> Practice adding -S to make plurals. The base word stays the same - just add -S!
</div>
<div class="practice-box">
<div class="word-row">
<div class="base">CAT</div>
<div class="plus">+</div>
<div class="suffix">S</div>
<div class="equals">=</div>
<div class="result">CATS</div>
</div>
</div>
<div class="practice-box">
<div class="word-row">
<div class="base">DOG</div>
<div class="plus">+</div>
<div class="suffix">S</div>
<div class="equals">=</div>
<div class="result">DOGS</div>
</div>
</div>
<div class="practice-box">
<div class="word-row">
<div class="base">HAT</div>
<div class="plus">+</div>
<div class="suffix">S</div>
<div class="equals">=</div>
<div class="result">HATS</div>
</div>
</div>
<div class="practice-box">
<div class="word-row">
<div class="base">BED</div>
<div class="plus">+</div>
<div class="suffix">S</div>
<div class="equals">=</div>
<div class="result">BEDS</div>
</div>
</div>
<div class="practice-box">
<div class="word-row">
<div class="base">CUP</div>
<div class="plus">+</div>
<div class="suffix">S</div>
<div class="equals">=</div>
<div class="result">CUPS</div>
</div>
</div>
<div class="practice-box">
<div class="word-row">
<div class="base">PIG</div>
<div class="plus">+</div>
<div class="suffix">S</div>
<div class="equals">=</div>
<div class="result">PIGS</div>
</div>
</div>
<div class="practice-box">
<div class="word-row">
<div class="base">BUG</div>
<div class="plus">+</div>
<div class="suffix">S</div>
<div class="equals">=</div>
<div class="result">BUGS</div>
</div>
</div>
<div class="practice-box">
<div class="word-row">
<div class="base">PEN</div>
<div class="plus">+</div>
<div class="suffix">S</div>
<div class="equals">=</div>
<div class="result">PENS</div>
</div>
</div>
<h2 style="text-align:center;color:#28a745;margin-top:50px">Now You Try! (Blank Practice)</h2>
<div class="practice-box">
<div class="word-row">
<div class="base">BAT</div>
<div class="plus">+</div>
<div class="suffix">S</div>
<div class="equals">=</div>
<div class="result">_______</div>
</div>
</div>
<div class="practice-box">
<div class="word-row">
<div class="base">RAT</div>
<div class="plus">+</div>
<div class="suffix">S</div>
<div class="equals">=</div>
<div class="result">_______</div>
</div>
</div>
<div class="practice-box">
<div class="word-row">
<div class="base">NET</div>
<div class="plus">+</div>
<div class="suffix">S</div>
<div class="equals">=</div>
<div class="result">_______</div>
</div>
</div>
<div class="practice-box">
<div class="word-row">
<div class="base">BIN</div>
<div class="plus">+</div>
<div class="suffix">S</div>
<div class="equals">=</div>
<div class="result">_______</div>
</div>
</div>
</body></html>`;
  },

  'ing-action-posters': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>-ING Action Posters</title>
<style>
body{font-family:'Poppins',Arial,sans-serif;margin:0;padding:40px;background:linear-gradient(135deg,#fdfbfb 0%,#ebedee 100%)}
.poster-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:30px}
.poster{border-radius:25px;padding:35px;color:white;min-height:260px;box-shadow:0 20px 40px rgba(0,0,0,0.12);display:flex;flex-direction:column;justify-content:space-between}
.title{font-size:26px;font-weight:700;letter-spacing:2px;text-transform:uppercase}
.word{font-size:58px;font-weight:800;margin:10px 0}
.base{font-size:22px;opacity:0.85}
.emoji{font-size:64px}
h1{text-align:center;font-size:46px;color:#5f27cd;margin-bottom:40px;text-shadow:0 6px 12px rgba(95,39,205,0.25)}
</style></head><body>
<h1>⚡ Happening Now! -ING Action Posters ⚡</h1>
<div class="poster-grid">
<div class="poster" style="background:linear-gradient(135deg,#ff9a9e,#fad0c4)"><div class="title">Base + -ING</div><div class="emoji">🏃‍♂️</div><div class="word">JUMPING</div><div class="base">jump + ing → happening now</div></div>
<div class="poster" style="background:linear-gradient(135deg,#a1c4fd,#c2e9fb)"><div class="title">Base + -ING</div><div class="emoji">🎤</div><div class="word">SINGING</div><div class="base">sing + ing → happening now</div></div>
<div class="poster" style="background:linear-gradient(135deg,#fbc2eb,#a6c1ee)"><div class="title">Base + -ING</div><div class="emoji">🎣</div><div class="word">FISHING</div><div class="base">fish + ing → happening now</div></div>
<div class="poster" style="background:linear-gradient(135deg,#84fab0,#8fd3f4)"><div class="title">Base + -ING</div><div class="emoji">🎭</div><div class="word">ACTING</div><div class="base">act + ing → happening now</div></div>
<div class="poster" style="background:linear-gradient(135deg,#ffe259,#ffa751)"><div class="title">Base + -ING</div><div class="emoji">🤝</div><div class="word">HELPING</div><div class="base">help + ing → happening now</div></div>
<div class="poster" style="background:linear-gradient(135deg,#f6d365,#fda085)"><div class="title">Base + -ING</div><div class="emoji">🎨</div><div class="word">PAINTING</div><div class="base">paint + ing → happening now</div></div>
</div>
</body></html>`;
  },

  'ing-word-builders': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>-ING Word Builders</title>
<style>
body{font-family:Arial,sans-serif;margin:0;padding:40px;background:#f0f4ff}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.card{background:white;border-radius:18px;padding:25px;box-shadow:0 10px 25px rgba(79,114,255,0.2);text-align:center}
.header{font-size:18px;font-weight:bold;color:#4f72ff;margin-bottom:12px;letter-spacing:1px}
.row{display:flex;justify-content:center;align-items:center;gap:12px;font-size:32px;font-weight:700;color:#2c3e50}
.base{padding:10px 18px;border:3px solid #ff6b6b;border-radius:12px}
.suffix{padding:10px 18px;border:3px solid #6c5ce7;border-radius:12px;color:#6c5ce7}
.equals{font-size:28px;color:#95a5a6}
.result{padding:10px 18px;border-radius:12px;background:linear-gradient(135deg,#a1c4fd,#c2e9fb);color:#1b1f3b}
h1{text-align:center;color:#2c3e50;margin-bottom:30px}
</style></head><body>
<h1>🧲 Build the -ING Word 🧲</h1>
<div class="grid">
<div class="card"><div class="header">Keep the Base</div><div class="row"><div class="base">JUMP</div><div class="suffix">+ ING</div><div class="equals">=</div><div class="result">JUMPING</div></div></div>
<div class="card"><div class="header">Keep the Base</div><div class="row"><div class="base">SING</div><div class="suffix">+ ING</div><div class="equals">=</div><div class="result">SINGING</div></div></div>
<div class="card"><div class="header">Keep the Base</div><div class="row"><div class="base">HELP</div><div class="suffix">+ ING</div><div class="equals">=</div><div class="result">HELPING</div></div></div>
<div class="card"><div class="header">Keep the Base</div><div class="row"><div class="base">PLAY</div><div class="suffix">+ ING</div><div class="equals">=</div><div class="result">PLAYING</div></div></div>
<div class="card"><div class="header">Keep the Base</div><div class="row"><div class="base">FISH</div><div class="suffix">+ ING</div><div class="equals">=</div><div class="result">FISHING</div></div></div>
<div class="card"><div class="header">Keep the Base</div><div class="row"><div class="base">ACT</div><div class="suffix">+ ING</div><div class="equals">=</div><div class="result">ACTING</div></div></div>
</div>
</body></html>`;
  },

  'ing-sentence-strips': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>-ING Sentence Strips</title>
<style>
body{font-family:'Quicksand',Arial,sans-serif;margin:0;padding:40px;background:#fff7e6}
.strip{display:flex;align-items:center;justify-content:space-between;padding:20px 25px;margin:15px 0;background:white;border-radius:16px;box-shadow:0 12px 24px rgba(255,159,67,0.25)}
.sentence{font-size:26px;font-weight:600;color:#d35400}
.picture{font-size:52px}
h1{text-align:center;color:#e67e22;margin-bottom:30px}
.note{background:#fdebd0;padding:15px;border-radius:12px;text-align:center;font-weight:600;color:#a04000;margin-bottom:20px}
</style></head><body>
<h1>🎬 Happening Now Sentences</h1>
<div class="note">Read the sentence, highlight the -ING word, then act it out!</div>
<div class="strip"><div class="sentence">The frog is jumping.</div><div class="picture">🐸</div></div>
<div class="strip"><div class="sentence">Mia is singing.</div><div class="picture">🎤</div></div>
<div class="strip"><div class="sentence">We are helping.</div><div class="picture">🤝</div></div>
<div class="strip"><div class="sentence">Grandpa is fishing.</div><div class="picture">🎣</div></div>
<div class="strip"><div class="sentence">The artists are painting.</div><div class="picture">🎨</div></div>
</body></html>`;
  },

  'un-prefix-flipcards': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>UN- Prefix Flip Cards</title>
<style>
body{font-family:'Poppins',Arial,sans-serif;margin:0;padding:40px;background:#f5f6fa}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.card{background:linear-gradient(135deg,#74ebd5,#acb6e5);border-radius:20px;color:#2d3436;padding:25px;box-shadow:0 16px 30px rgba(116,235,213,0.35);text-align:center}
.word{font-size:42px;font-weight:800;margin:10px 0}
.meaning{font-size:18px;font-weight:600}
.base{font-size:16px;text-transform:uppercase;letter-spacing:2px;color:#636e72}
h1{text-align:center;color:#0984e3;margin-bottom:30px}
</style></head><body>
<h1>🦸 Prefix Power: UN- Flip Cards</h1>
<div class="grid">
<div class="card"><div class="base">LOCK</div><div class="word">UNLOCK</div><div class="meaning">not locked • open it up</div></div>
<div class="card"><div class="base">ZIP</div><div class="word">UNZIP</div><div class="meaning">not zipped • open the zip</div></div>
<div class="card"><div class="base">PACK</div><div class="word">UNPACK</div><div class="meaning">not packed • take things out</div></div>
<div class="card"><div class="base">TIE</div><div class="word">UNTIE</div><div class="meaning">not tied • make it loose</div></div>
<div class="card"><div class="base">DO</div><div class="word">UNDO</div><div class="meaning">not done • go back</div></div>
<div class="card"><div class="base">WRAP</div><div class="word">UNWRAP</div><div class="meaning">not wrapped • open the gift</div></div>
</div>
</body></html>`;
  },

  'un-word-sort': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>UN- Sorting Mats</title>
<style>
body{font-family:Arial,sans-serif;margin:0;padding:40px;background:#fdf2ff}
.mats{display:grid;grid-template-columns:repeat(2,1fr);gap:30px}
.mat{background:white;border-radius:20px;padding:25px;min-height:400px;box-shadow:0 18px 35px rgba(186,104,200,0.25)}
.title{font-size:30px;font-weight:800;margin-bottom:10px}
.title span{display:block;font-size:16px;color:#6c5ce7;text-transform:uppercase;letter-spacing:2px}
.list{margin-top:20px;font-size:24px;line-height:1.6;color:#2c3e50}
.card{background:#ffeaa7;padding:10px 15px;border-radius:12px;margin:8px 0;display:inline-block;font-weight:600}
h1{text-align:center;color:#8e44ad;margin-bottom:25px}
.instructions{background:#fce4ec;padding:15px;border-radius:12px;text-align:center;font-weight:600;color:#ad1457;margin-bottom:20px}
</style></head><body>
<h1>🔄 Base vs. UN- Sort</h1>
<div class="instructions">Place each picture or word card in the correct mat. Does it show the base meaning or the UN- opposite?</div>
<div class="mats">
<div class="mat"><div class="title">Base Word<span>original meaning</span></div><div class="list"><div class="card">lock</div><div class="card">zip</div><div class="card">pack</div><div class="card">tie</div><div class="card">wrap</div></div></div>
<div class="mat"><div class="title">UN- Word<span>opposite meaning</span></div><div class="list"><div class="card">unlock</div><div class="card">unzip</div><div class="card">unpack</div><div class="card">untie</div><div class="card">unwrap</div></div></div>
</div>
</body></html>`;
  },

  'un-change-mats': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>UN- Meaning Match</title>
<style>
body{font-family:'Nunito',Arial,sans-serif;margin:0;padding:40px;background:#ecf9ff}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.card{background:white;border-radius:18px;padding:22px;box-shadow:0 14px 28px rgba(52,152,219,0.25);display:flex;flex-direction:column;gap:10px}
.label{font-size:16px;font-weight:700;color:#2980b9;text-transform:uppercase;letter-spacing:2px}
.sentence{font-size:24px;font-weight:700;color:#2c3e50}
.meaning{font-size:18px;color:#34495e}
h1{text-align:center;color:#1f78d1;margin-bottom:30px}
</style></head><body>
<h1>🧠 UN- Sentence Switch Cards</h1>
<div class="grid">
<div class="card"><div class="label">Base</div><div class="sentence">I pack my bag.</div><div class="meaning">everything goes in</div></div>
<div class="card"><div class="label">UN-</div><div class="sentence">I unpack my bag.</div><div class="meaning">take everything out</div></div>
<div class="card"><div class="label">Base</div><div class="sentence">She ties the bow.</div><div class="meaning">the ribbon is snug</div></div>
<div class="card"><div class="label">UN-</div><div class="sentence">She unties the bow.</div><div class="meaning">the ribbon comes loose</div></div>
<div class="card"><div class="label">Base</div><div class="sentence">He locks the gate.</div><div class="meaning">the gate is closed</div></div>
<div class="card"><div class="label">UN-</div><div class="sentence">He unlocks the gate.</div><div class="meaning">the gate is open</div></div>
</div>
</body></html>`;
  },

  'compound-explorer-cards': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Compound Explorer Cards</title>
<style>
body{font-family:'Baloo 2',cursive;margin:0;padding:40px;background:#f3ffe3}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:25px}
.card{background:white;border-radius:24px;padding:25px;box-shadow:0 18px 32px rgba(76,175,80,0.25);display:flex;flex-direction:column;gap:12px;align-items:center}
.emoji{font-size:60px}
.parts{display:flex;gap:12px;font-size:26px;font-weight:700;color:#2e7d32}
.join{font-size:48px;color:#66bb6a;font-weight:800}
.word{font-size:34px;font-weight:800;color:#1b5e20}
h1{text-align:center;color:#388e3c;margin-bottom:30px}
</style></head><body>
<h1>🌿 Explore Compound Words</h1>
<div class="grid">
<div class="card"><div class="emoji">🐠</div><div class="parts">GOLD + FISH</div><div class="join">=</div><div class="word">GOLDFISH</div></div>
<div class="card"><div class="emoji">🌅</div><div class="parts">SUN + SET</div><div class="join">=</div><div class="word">SUNSET</div></div>
<div class="card"><div class="emoji">☔</div><div class="parts">RAIN + COAT</div><div class="join">=</div><div class="word">RAINCOAT</div></div>
<div class="card"><div class="emoji">🌙</div><div class="parts">MOON + LIGHT</div><div class="join">=</div><div class="word">MOONLIGHT</div></div>
<div class="card"><div class="emoji">🦋</div><div class="parts">BUTTER + FLY</div><div class="join">=</div><div class="word">BUTTERFLY</div></div>
<div class="card"><div class="emoji">🎒</div><div class="parts">BACK + PACK</div><div class="join">=</div><div class="word">BACKPACK</div></div>
</div>
</body></html>`;
  },

  'compound-blend-mats': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Compound Pocket Mats</title>
<style>
body{font-family:'Poppins',Arial,sans-serif;margin:0;padding:40px;background:#eef9ff}
.container{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.column{background:white;border-radius:20px;padding:20px;min-height:420px;box-shadow:0 16px 30px rgba(33,150,243,0.25)}
.title{font-size:26px;font-weight:800;color:#1976d2;margin-bottom:10px}
.card{background:#bbdefb;color:#0d47a1;font-size:24px;font-weight:700;border-radius:12px;padding:12px 18px;margin:8px 0;text-align:center}
.real{background:#c8e6c9;color:#1b5e20}
.not-real{background:#ffcdd2;color:#c62828}
h1{text-align:center;color:#1565c0;margin-bottom:30px}
.instructions{background:#e3f2fd;padding:15px;border-radius:12px;margin-bottom:25px;font-weight:600;color:#0d47a1}
</style></head><body>
<h1>📊 Pocket Chart Compound Mats</h1>
<div class="instructions">Slide one card from column A and one card from column B. Read it aloud. Place it in the Real Word or Silly Word column.</div>
<div class="container">
<div class="column"><div class="title">Column A</div><div class="card">SUN</div><div class="card">RAIN</div><div class="card">GOLD</div><div class="card">STAR</div><div class="card">MOON</div><div class="card">FOOT</div></div>
<div class="column"><div class="title">Column B</div><div class="card">SET</div><div class="card">COAT</div><div class="card">FISH</div><div class="card">LIGHT</div><div class="card">BALL</div><div class="card">ROOM</div></div>
<div class="column"><div class="title">Word Winners</div><div class="card real">SUNSET</div><div class="card real">RAINCOAT</div><div class="card real">GOLDFISH</div><div class="card real">STARFISH</div><div class="card real">MOONLIGHT</div><div class="card real">FOOTBALL</div><div class="card not-real">SUNROOM</div><div class="card not-real">MOONCOAT</div></div>
</div>
</body></html>`;
  },

  'compound-scene-posters': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Compound Scene Posters</title>
<style>
body{font-family:'Baloo 2',cursive;margin:0;padding:40px;background:#fffbea}
.poster{background:white;border-radius:28px;padding:30px;margin-bottom:25px;box-shadow:0 18px 36px rgba(255,193,7,0.3)}
.heading{font-size:32px;font-weight:800;color:#ff6f00;margin-bottom:10px}
.parts{font-size:22px;color:#5d4037}
.drawing{height:220px;border:4px dashed #ffb300;border-radius:18px;margin-top:20px}
.prompt{font-size:18px;color:#6d4c41;margin-top:10px}
h1{text-align:center;color:#ff8f00;margin-bottom:30px}
</style></head><body>
<h1>🎨 Create a Compound Word Scene</h1>
<div class="poster"><div class="heading">goldfish</div><div class="parts">gold + fish</div><div class="drawing"></div><div class="prompt">Draw your goldfish. Label the two base words and the new word.</div></div>
<div class="poster"><div class="heading">sunset</div><div class="parts">sun + set</div><div class="drawing"></div><div class="prompt">Show how the sun is setting. What do both parts mean?</div></div>
<div class="poster"><div class="heading">raincoat</div><div class="parts">rain + coat</div><div class="drawing"></div><div class="prompt">Draw someone wearing a raincoat. Colour the rain!</div></div>
<div class="poster"><div class="heading">moonlight</div><div class="parts">moon + light</div><div class="drawing"></div><div class="prompt">Show how the moon makes light at night.</div></div>
<div class="poster"><div class="heading">starfish</div><div class="parts">star + fish</div><div class="drawing"></div><div class="prompt">Draw the sea creature. Label the two base words.</div></div>
</body></html>`;
  },

  'write-plurals-worksheet': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Write Plurals Worksheet</title>
<style>
body{font-family:Arial,sans-serif;margin:20px;max-width:800px;margin:0 auto;padding:30px}
.worksheet-box{border:3px solid #333;border-radius:10px;padding:20px;margin:20px 0;background:white}
.picture-row{display:flex;align-items:center;gap:30px;margin:20px 0}
.picture{flex:1;text-align:center;font-size:60px;padding:20px;background:#f8f9fa;border-radius:10px}
.write-box{flex:2}
.label{font-weight:bold;margin-bottom:10px;color:#4a148c}
.write-line{border-bottom:3px solid #333;min-height:50px;margin:10px 0;font-size:28px}
h1{text-align:center;color:#4a148c}
.instructions{background:#fff3cd;border:3px solid #ffc107;border-radius:10px;padding:15px;margin:20px 0}
</style></head><body>
<h1>✏️ Write Plurals Worksheet</h1>
<div class="instructions">
<strong>Instructions:</strong> Look at the picture. Write the base word. Then add -S to write the plural!
</div>
<div class="worksheet-box">
<div class="picture-row">
<div class="picture">🐱</div>
<div class="write-box">
<div class="label">ONE:</div>
<div class="write-line">CAT</div>
<div class="label">MANY (add -S):</div>
<div class="write-line">_____________</div>
</div>
</div>
</div>
<div class="worksheet-box">
<div class="picture-row">
<div class="picture">🐕</div>
<div class="write-box">
<div class="label">ONE:</div>
<div class="write-line">DOG</div>
<div class="label">MANY (add -S):</div>
<div class="write-line">_____________</div>
</div>
</div>
</div>
<div class="worksheet-box">
<div class="picture-row">
<div class="picture">🎩</div>
<div class="write-box">
<div class="label">ONE:</div>
<div class="write-line">HAT</div>
<div class="label">MANY (add -S):</div>
<div class="write-line">_____________</div>
</div>
</div>
</div>
<div class="worksheet-box">
<div class="picture-row">
<div class="picture">🛏️</div>
<div class="write-box">
<div class="label">ONE:</div>
<div class="write-line">BED</div>
<div class="label">MANY (add -S):</div>
<div class="write-line">_____________</div>
</div>
</div>
</div>
<div class="worksheet-box">
<div class="picture-row">
<div class="picture">☕</div>
<div class="write-box">
<div class="label">ONE:</div>
<div class="write-line">CUP</div>
<div class="label">MANY (add -S):</div>
<div class="write-line">_____________</div>
</div>
</div>
</div>
<div class="worksheet-box">
<div class="picture-row">
<div class="picture">🐷</div>
<div class="write-box">
<div class="label">ONE:</div>
<div class="write-line">_____________</div>
<div class="label">MANY (add -S):</div>
<div class="write-line">_____________</div>
</div>
</div>
</div>
</body></html>`;
  },

  'morphology-team-mat': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Morphology Team Sorting Mat</title>
<style>
body{font-family:'Poppins',Arial,sans-serif;margin:0;padding:40px;background:#f1f5ff;color:#1e1e2f}
.mat{max-width:1100px;margin:0 auto;background:white;border-radius:30px;box-shadow:0 25px 60px rgba(79,70,229,0.25);padding:40px 50px}
h1{text-align:center;font-size:42px;margin-bottom:10px;color:#4338ca}
.subtitle{text-align:center;font-size:18px;color:#6366f1;margin-bottom:35px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:30px}
.column{border:5px solid transparent;border-radius:24px;padding:25px 20px;min-height:420px;position:relative;overflow:hidden}
.column::after{content:'';position:absolute;inset:0;opacity:0.25;z-index:-1}
.column.prefix{border-color:#f97316}
.column.prefix::after{background:linear-gradient(135deg,#f97316,#fb923c)}
.column.base{border-color:#10b981}
.column.base::after{background:linear-gradient(135deg,#10b981,#34d399)}
.column.suffix{border-color:#6366f1}
.column.suffix::after{background:linear-gradient(135deg,#6366f1,#8b5cf6)}
.column h2{font-size:26px;color:white;text-align:center;margin-bottom:10px;text-transform:uppercase;letter-spacing:2px}
.chips{display:flex;flex-direction:column;gap:12px;margin-top:20px}
.chip{background:rgba(255,255,255,0.92);border-radius:18px;padding:12px 16px;font-size:20px;font-weight:600;color:#1e1e2f;box-shadow:0 8px 18px rgba(0,0,0,0.1)}
.definition{font-size:16px;color:#312e81;margin-top:14px;text-align:center;font-weight:600}
.footer{margin-top:40px;background:#eef2ff;border-radius:20px;padding:18px 24px;text-align:center;font-size:18px;font-weight:600;color:#4338ca}
</style></head><body>
<div class="mat">
  <h1>🧠 Morphology Team Sorting Mat</h1>
  <p class="subtitle">Sort each card into the correct job pocket. Then build a super word using one card from each column!</p>
  <div class="grid">
    <div class="column prefix">
      <h2>Prefix</h2>
      <div class="chips">
        <div class="chip">un-</div>
        <div class="chip">re-</div>
        <div class="chip">pre-</div>
        <div class="chip">mis-</div>
        <div class="chip">dis-</div>
      </div>
      <div class="definition">Prefixes come at the <strong>front</strong> and change the meaning.</div>
    </div>
    <div class="column base">
      <h2>Base</h2>
      <div class="chips">
        <div class="chip">play</div>
        <div class="chip">kind</div>
        <div class="chip">lock</div>
        <div class="chip">pack</div>
        <div class="chip">read</div>
      </div>
      <div class="definition">The base carries the <strong>main idea</strong> of the word.</div>
    </div>
    <div class="column suffix">
      <h2>Suffix</h2>
      <div class="chips">
        <div class="chip">-s</div>
        <div class="chip">-ing</div>
        <div class="chip">-ed</div>
        <div class="chip">-er</div>
        <div class="chip">-ful</div>
      </div>
      <div class="definition">Suffixes sit at the <strong>end</strong> and add detail.</div>
    </div>
  </div>
  <div class="footer">Chant it: "Prefix, Base, Suffix – word parts make meaning!"</div>
</div>
</body></html>`;
  },

  'word-machine-board': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Word Machine Builders</title>
<style>
body{font-family:'Nunito',sans-serif;margin:0;padding:40px;background:#fef3c7;color:#1f2937}
.board{max-width:1080px;margin:0 auto;background:white;border-radius:32px;padding:50px;box-shadow:0 22px 48px rgba(245,158,11,0.3)}
h1{text-align:center;font-size:44px;margin-bottom:12px;color:#d97706}
.subtitle{text-align:center;font-size:18px;color:#92400e;margin-bottom:35px}
.machine{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-bottom:40px}
.slot{border:5px dashed #f97316;border-radius:24px;padding:30px;min-height:220px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:linear-gradient(135deg,rgba(249,115,22,0.12),rgba(251,191,36,0.12))}
.slot h2{font-size:26px;text-transform:uppercase;color:#b45309;letter-spacing:2px}
.slot .hint{font-size:16px;color:#92400e;text-align:center}
.word-boxes{display:grid;grid-template-columns:repeat(3,1fr);gap:25px}
.word-box{background:#fef08a;border-radius:22px;padding:20px;box-shadow:0 12px 26px rgba(234,179,8,0.35)}
.word-box h3{font-size:22px;color:#854d0e;margin-bottom:12px;text-transform:uppercase}
.words{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.chip{background:white;border-radius:16px;padding:12px 14px;text-align:center;font-weight:700;font-size:20px;color:#78350f;border:3px solid rgba(251,191,36,0.8)}
.footer{margin-top:35px;background:#fde68a;padding:18px 22px;border-radius:18px;text-align:center;font-weight:600;color:#92400e}
</style></head><body>
<div class="board">
  <h1>⚙️ Word Machine Builder Board</h1>
  <p class="subtitle">Slide in a prefix, base, and suffix. Read the new word and sketch its meaning!</p>
  <div class="machine">
    <div class="slot"><h2>Prefix</h2><div class="hint">Goes at the front</div></div>
    <div class="slot"><h2>Base</h2><div class="hint">Main idea</div></div>
    <div class="slot"><h2>Suffix</h2><div class="hint">Finishes the word</div></div>
  </div>
  <div class="word-boxes">
    <div class="word-box">
      <h3>Prefixes</h3>
      <div class="words">
        <div class="chip">un-</div>
        <div class="chip">re-</div>
        <div class="chip">pre-</div>
        <div class="chip">mis-</div>
      </div>
    </div>
    <div class="word-box">
      <h3>Bases</h3>
      <div class="words">
        <div class="chip">play</div>
        <div class="chip">help</div>
        <div class="chip">read</div>
        <div class="chip">paint</div>
        <div class="chip">pack</div>
        <div class="chip">lock</div>
      </div>
    </div>
    <div class="word-box">
      <h3>Suffixes</h3>
      <div class="words">
        <div class="chip">-s</div>
        <div class="chip">-ing</div>
        <div class="chip">-ed</div>
        <div class="chip">-er</div>
        <div class="chip">-ful</div>
      </div>
    </div>
  </div>
  <div class="footer">Idea spark: What happens if you leave a slot empty? Try it!</div>
</div>
</body></html>`;
  },

  'morpheme-chant-cards': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Morpheme Chant Cards</title>
<style>
body{font-family:'Fredoka',sans-serif;margin:0;padding:40px;background:#fff1f2;color:#2d0a31}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px;max-width:960px;margin:0 auto}
.card{background:white;border-radius:28px;padding:30px;box-shadow:0 20px 40px rgba(236,72,153,0.25);position:relative;overflow:hidden}
.card::after{content:'';position:absolute;width:140px;height:140px;border-radius:50%;background:rgba(236,72,153,0.12);bottom:-30px;right:-30px}
.title{font-size:46px;font-weight:800;color:#ec4899;margin-bottom:10px}
.chant{font-size:22px;font-weight:600;color:#6b21a8;margin-bottom:12px}
.actions{font-size:18px;color:#5b1b6b}
h1{text-align:center;font-size:42px;color:#be123c;margin-bottom:30px}
</style></head><body>
<h1>🎵 Morpheme Chant Cards</h1>
<div class="grid">
  <div class="card"><div class="title">PREFIX</div><div class="chant">"Prefixes start, right at the heart!"</div><div class="actions">Action: Step forward and make superhero arms.</div></div>
  <div class="card"><div class="title">BASE</div><div class="chant">"Bases strong, carry meaning all day long!"</div><div class="actions">Action: Stand tall with hands on hips.</div></div>
  <div class="card"><div class="title">SUFFIX</div><div class="chant">"Suffixes cheer, ending words with flair!"</div><div class="actions">Action: Sprinkle jazz hands at the end.</div></div>
  <div class="card"><div class="title">MORPHEME</div><div class="chant">"Morpheme = meaning piece!"</div><div class="actions">Action: Hold thumb and finger close together.</div></div>
</div>
</body></html>`;
  },

  'homophone-hero-capes': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Homophone Hero Capes</title>
<style>
body{font-family:'Baloo 2',cursive;margin:0;padding:40px;background:#ecfeff;color:#0f172a}
.wrapper{max-width:1080px;margin:0 auto}
h1{text-align:center;font-size:46px;color:#0369a1;margin-bottom:10px}
.subtitle{text-align:center;font-size:18px;color:#0c4a6e;margin-bottom:30px}
.cape-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:30px}
.cape{position:relative;background:white;border-radius:32px;padding:30px;box-shadow:0 20px 40px rgba(14,116,144,0.25);overflow:hidden}
.cape::before{content:'';position:absolute;top:-60px;right:-60px;width:180px;height:180px;border-radius:50%;background:rgba(56,189,248,0.18)}
.cape-title{font-size:34px;font-weight:800;color:#0284c7;margin-bottom:12px}
.cape-pair{font-size:24px;color:#0369a1;margin-bottom:16px}
.meaning{display:flex;justify-content:space-between;gap:12px}
.meaning div{flex:1;background:#e0f2fe;border-radius:16px;padding:16px;font-weight:600;text-align:center}
.sentence{margin-top:18px;background:#cffafe;border-radius:16px;padding:16px;font-size:18px;color:#0c4a6e;font-weight:600}
</style></head><body>
<div class="wrapper">
  <h1>🦸‍♂️ Homophone Hero Capes</h1>
  <p class="subtitle">Colour each cape and add your picture clue and sentence.</p>
  <div class="cape-grid">
    <div class="cape">
      <div class="cape-title">Tricky Trio</div>
      <div class="cape-pair">to • too • two</div>
      <div class="meaning"><div>to ➜ going</div><div>too ➜ also/very</div><div>two ➜ number 2</div></div>
      <div class="sentence">Sentence: __________________________________</div>
    </div>
    <div class="cape">
      <div class="cape-title">Snack or Greeting</div>
      <div class="cape-pair">meet • meat</div>
      <div class="meaning"><div>meet ➜ see a friend</div><div>meat ➜ food from animals</div></div>
      <div class="sentence">Sentence: __________________________________</div>
    </div>
    <div class="cape">
      <div class="cape-title">See the Sea</div>
      <div class="cape-pair">sea • see</div>
      <div class="meaning"><div>sea ➜ big ocean</div><div>see ➜ use your eyes</div></div>
      <div class="sentence">Sentence: __________________________________</div>
    </div>
    <div class="cape">
      <div class="cape-title">What to Wear?</div>
      <div class="cape-pair">wear • where</div>
      <div class="meaning"><div>wear ➜ clothing</div><div>where ➜ which place</div></div>
      <div class="sentence">Sentence: __________________________________</div>
    </div>
  </div>
</div>
</body></html>`;
  },

  'homophone-spinner-board': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Homophone Spinner Board</title>
<style>
body{font-family:'Nunito',sans-serif;margin:0;padding:40px;background:#f0f9ff;color:#0f172a}
.board{max-width:900px;margin:0 auto;background:white;border-radius:40px;padding:40px;box-shadow:0 25px 55px rgba(59,130,246,0.28)}
h1{text-align:center;font-size:44px;color:#1d4ed8;margin-bottom:12px}
.subtitle{text-align:center;font-size:18px;color:#1e3a8a;margin-bottom:30px}
.spinner{width:320px;height:320px;margin:0 auto 30px;border-radius:50%;background:conic-gradient(#1d4ed8 0 90deg,#2563eb 90deg 180deg,#38bdf8 180deg 270deg,#60a5fa 270deg 360deg);position:relative;display:flex;align-items:center;justify-content:center;color:white;font-size:26px;font-weight:700;text-align:center;padding:20px}
.pointer{position:absolute;top:-35px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:25px solid transparent;border-right:25px solid transparent;border-bottom:35px solid #ef4444}
.sections{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-top:20px}
.section{background:#eff6ff;border-radius:20px;padding:18px}
.section h2{font-size:22px;color:#1d4ed8;margin-bottom:10px}
.section ul{list-style:none;padding:0;margin:0}
.section li{margin-bottom:8px;font-weight:600;color:#0f172a}
</style></head><body>
<div class="board">
  <h1>🌀 Spin & Choose Homophones</h1>
  <p class="subtitle">Spin the arrow, read the sentence clue, and choose the matching homophone card.</p>
  <div class="spinner">
    <div class="pointer"></div>
    Spin Me!
  </div>
  <div class="sections">
    <div class="section">
      <h2>Sentence Starters</h2>
      <ul>
        <li>We will ____ at the zoo.</li>
        <li>Please take ____ apples.</li>
        <li>I can ____ the blue sea.</li>
        <li>Will you ____ the red hat?</li>
      </ul>
    </div>
    <div class="section">
      <h2>Homophone Choices</h2>
      <ul>
        <li>meet / meat</li>
        <li>to / two / too</li>
        <li>sea / see</li>
        <li>wear / where</li>
      </ul>
    </div>
  </div>
</div>
</body></html>`;
  },

  'homophone-sentence-strips': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Homophone Sentence Strips</title>
<style>
body{font-family:'Poppins',sans-serif;margin:0;padding:40px;background:#fff7ed;color:#431407}
.wrapper{max-width:880px;margin:0 auto}
h1{text-align:center;font-size:42px;color:#c2410c;margin-bottom:12px}
.subtitle{text-align:center;font-size:18px;color:#7c2d12;margin-bottom:30px}
.strip{background:white;border-left:12px solid #fb923c;border-radius:18px;padding:18px 24px;margin-bottom:16px;box-shadow:0 16px 32px rgba(251,146,60,0.25);font-size:22px;font-weight:600}
.strip span{color:#ea580c;font-weight:700}
</style></head><body>
<div class="wrapper">
  <h1>📝 Homophone Sentence Strips</h1>
  <p class="subtitle">Cut, sort, and match each sentence under the correct homophone heading.</p>
  <div class="strip">We will <span>meet</span> our new classmate after lunch.</div>
  <div class="strip">Dad bought fresh <span>meat</span> from the market.</div>
  <div class="strip">Can you <span>see</span> the rainbow?</div>
  <div class="strip">The <span>sea</span> was calm and blue.</div>
  <div class="strip">She asked, “<span>Where</span> is my backpack?”</div>
  <div class="strip">Please <span>wear</span> your hat in the sun.</div>
  <div class="strip">I ate <span>two</span> juicy peaches.</div>
  <div class="strip">We will walk <span>to</span> the library after lunch.</div>
  <div class="strip">This bag is <span>too</span> heavy for me to carry.</div>
</div>
</body></html>`;
  },

  'word-family-house-template': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Word Family House</title>
<style>
body{font-family:'Baloo 2',cursive;margin:0;padding:40px;background:#f0fdf4;color:#14532d}
.house{max-width:960px;margin:0 auto;background:white;border-radius:32px;box-shadow:0 25px 60px rgba(34,197,94,0.25);padding:40px}
h1{text-align:center;font-size:46px;color:#047857;margin-bottom:18px}
.subtitle{text-align:center;font-size:18px;color:#047857;margin-bottom:30px}
.diagram{position:relative;width:100%;height:520px;background:linear-gradient(#bbf7d0,#dcfce7);border-radius:30px;padding:30px}
.roof{position:absolute;top:-120px;left:50%;transform:translateX(-50%);width:420px;height:200px;background:linear-gradient(135deg,#22c55e,#4ade80);clip-path:polygon(50% 0,100% 70%,0 70%);display:flex;align-items:center;justify-content:center;color:white;font-size:44px;font-weight:800;text-transform:uppercase}
.rooms{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-top:120px}
.room{background:white;border-radius:24px;padding:20px;text-align:center;border:6px dashed rgba(34,197,94,0.5);min-height:160px;font-size:26px;font-weight:700;color:#15803d}
.notes{margin-top:30px;background:#dcfce7;border-radius:24px;padding:24px;font-size:20px;color:#14532d;font-weight:600}
</style></head><body>
<div class="house">
  <h1>🏠 Word Family House</h1>
  <p class="subtitle">Write your base word on the roof. Add family members in each room!</p>
  <div class="diagram">
    <div class="roof">BASE WORD</div>
    <div class="rooms">
      <div class="room">__________</div>
      <div class="room">__________</div>
      <div class="room">__________</div>
      <div class="room">__________</div>
    </div>
  </div>
  <div class="notes">Add pictures or sentences to show what each family member means.</div>
</div>
</body></html>`;
  },

  'word-family-flow-sheet': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Word Family Flow Sheet</title>
<style>
body{font-family:'Nunito',sans-serif;margin:0;padding:40px;background:#f5f3ff;color:#312e81}
.sheet{max-width:900px;margin:0 auto;background:white;border-radius:32px;padding:36px;box-shadow:0 25px 55px rgba(99,102,241,0.25)}
h1{text-align:center;font-size:42px;color:#4c1d95;margin-bottom:12px}
.subtitle{text-align:center;font-size:18px;color:#5b21b6;margin-bottom:30px}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.panel{border:5px solid rgba(99,102,241,0.4);border-radius:24px;padding:24px;min-height:180px;position:relative;background:linear-gradient(135deg,rgba(129,140,248,0.12),rgba(196,181,253,0.12))}
.panel h2{font-size:24px;color:#3730a3;margin-bottom:10px;text-transform:uppercase}
.panel ul{list-style:none;margin:0;padding:0;font-size:20px;font-weight:600;color:#1e1b4b}
.record{margin-top:28px;background:#ede9fe;border-radius:24px;padding:20px;font-size:18px;font-weight:600;color:#3730a3}
</style></head><body>
<div class="sheet">
  <h1>🎡 Spin a Word Family</h1>
  <p class="subtitle">Spin for a base word and suffix. Record the real words you create.</p>
  <div class="grid">
    <div class="panel">
      <h2>Base Spinner</h2>
      <ul>
        <li>play</li>
        <li>jump</li>
        <li>help</li>
        <li>paint</li>
      </ul>
    </div>
    <div class="panel">
      <h2>Suffix Spinner</h2>
      <ul>
        <li>-s</li>
        <li>-ing</li>
        <li>-ed</li>
        <li>-er</li>
      </ul>
    </div>
  </div>
  <div class="record">
    Real words I made: ______________________________________________
  </div>
</div>
</body></html>`;
  },

  'word-family-relay-cards': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Word Family Relay Cards</title>
<style>
body{font-family:'Poppins',sans-serif;margin:0;padding:40px;background:#fdf4ff;color:#701a75}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:960px;margin:0 auto}
.card{background:white;border-radius:24px;padding:20px;text-align:center;box-shadow:0 20px 40px rgba(168,85,247,0.25);font-size:26px;font-weight:700}
.base{border:4px solid #a855f7;color:#7c3aed}
.suffix{border:4px solid #ec4899;color:#db2777}
.instructions{max-width:960px;margin:30px auto 0;background:#f5d0fe;border-radius:24px;padding:22px;font-size:18px;font-weight:600;text-align:center}
h1{text-align:center;font-size:44px;color:#7c3aed;margin-bottom:20px}
</style></head><body>
<h1>🏃‍♀️ Word Family Relay Cards</h1>
<div class="grid">
  <div class="card base">play</div>
  <div class="card base">jump</div>
  <div class="card base">help</div>
  <div class="card suffix">-s</div>
  <div class="card suffix">-ing</div>
  <div class="card suffix">-ed</div>
  <div class="card suffix">-er</div>
</div>
<div class="instructions">Run to grab a base card, then race back and add suffix cards to build the whole family!</div>
</body></html>`;
  },

  'plural-sorting-trail': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Plural Sorting Trail</title>
<style>
body{font-family:'Fredoka',sans-serif;margin:0;padding:40px;background:#eff6ff;color:#0f172a}
.trail{max-width:1100px;margin:0 auto;background:white;border-radius:36px;padding:40px;box-shadow:0 30px 60px rgba(59,130,246,0.25)}
h1{text-align:center;font-size:46px;color:#1d4ed8;margin-bottom:12px}
.subtitle{text-align:center;font-size:18px;color:#1e3a8a;margin-bottom:28px}
.path{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:30px}
.step{background:linear-gradient(135deg,#3b82f6,#38bdf8);color:white;border-radius:20px;padding:18px;text-align:center;font-size:20px;font-weight:700;min-height:90px}
.baskets{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.basket{border:5px dashed rgba(59,130,246,0.35);border-radius:28px;padding:28px;background:linear-gradient(135deg,rgba(191,219,254,0.6),rgba(219,234,254,0.6))}
.basket h2{text-align:center;font-size:26px;color:#1d4ed8;margin-bottom:16px}
.basket ul{list-style:none;padding:0;margin:0;font-size:22px;font-weight:600;color:#0f172a}
.footer{margin-top:30px;background:#dbeafe;border-radius:24px;padding:20px;font-size:18px;font-weight:600;text-align:center;color:#1e3a8a}
</style></head><body>
<div class="trail">
  <h1>🐾 Plural Sorting Trail</h1>
  <p class="subtitle">Pick a noun card, say the plural, and hop to the right ending square.</p>
  <div class="path">
    <div class="step">Start</div>
    <div class="step">Add -s</div>
    <div class="step">Add -es</div>
    <div class="step">Add -s</div>
    <div class="step">Cheer!</div>
  </div>
  <div class="baskets">
    <div class="basket">
      <h2>-S Words</h2>
      <ul>
        <li>cats</li>
        <li>dogs</li>
        <li>trains</li>
      </ul>
    </div>
    <div class="basket">
      <h2>-ES Words</h2>
      <ul>
        <li>foxes</li>
        <li>buses</li>
        <li>dishes</li>
      </ul>
    </div>
  </div>
  <div class="footer">Chant: "S for smooth, ES for extra syllable!"</div>
</div>
</body></html>`;
  },

  'plural-flip-book': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Plural Flip Book</title>
<style>
body{font-family:'Baloo 2',cursive;margin:0;padding:40px;background:#fff1f2;color:#831843}
.book{max-width:940px;margin:0 auto;background:white;border-radius:32px;padding:36px;box-shadow:0 28px 60px rgba(236,72,153,0.25)}
h1{text-align:center;font-size:44px;color:#be123c;margin-bottom:12px}
.subtitle{text-align:center;font-size:18px;color:#9d174d;margin-bottom:28px}
.pages{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.page{border:4px dashed rgba(244,114,182,0.7);border-radius:24px;padding:24px;min-height:200px;display:flex;flex-direction:column;gap:16px}
.word{font-size:28px;font-weight:800;color:#be123c;text-transform:uppercase}
.draw{flex:1;border:3px solid rgba(244,114,182,0.6);border-radius:18px}
.label{font-size:18px;font-weight:700;color:#831843}
</style></head><body>
<div class="book">
  <h1>📘 Plural Flip Book</h1>
  <p class="subtitle">Draw the singular on the front and the plural inside.</p>
  <div class="pages">
    <div class="page"><div class="word">bus ➜ buses</div><div class="draw"></div><div class="label">Add -ES</div></div>
    <div class="page"><div class="word">dish ➜ dishes</div><div class="draw"></div><div class="label">Add -ES</div></div>
    <div class="page"><div class="word">cat ➜ cats</div><div class="draw"></div><div class="label">Add -S</div></div>
    <div class="page"><div class="word">tree ➜ trees</div><div class="draw"></div><div class="label">Add -S</div></div>
  </div>
</div>
</body></html>`;
  },

  'plural-sentence-spinner': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Plural Sentence Spinner</title>
<style>
body{font-family:'Nunito',sans-serif;margin:0;padding:40px;background:#eef2ff;color:#1e1b4b}
.board{max-width:900px;margin:0 auto;background:white;border-radius:36px;padding:40px;box-shadow:0 25px 55px rgba(129,140,248,0.28)}
h1{text-align:center;font-size:44px;color:#4c1d95;margin-bottom:12px}
.subtitle{text-align:center;font-size:18px;color:#312e81;margin-bottom:28px}
.spinner{width:300px;height:300px;margin:0 auto 24px;border-radius:50%;background:conic-gradient(#a855f7 0 120deg,#6366f1 120deg 240deg,#60a5fa 240deg 360deg);position:relative;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:26px;text-align:center;padding:30px}
.pointer{position:absolute;top:-30px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:20px solid transparent;border-right:20px solid transparent;border-bottom:30px solid #ef4444}
.columns{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.column{background:#ede9fe;border-radius:22px;padding:20px}
.column h2{font-size:22px;color:#4c1d95;margin-bottom:12px;text-transform:uppercase}
.column ul{list-style:none;margin:0;padding:0;font-size:20px;font-weight:600;color:#1e1b4b}
</style></head><body>
<div class="board">
  <h1>🎯 Plural Sentence Spinner</h1>
  <p class="subtitle">Spin for a noun, add -s or -es, then finish the sentence.</p>
  <div class="spinner">
    <div class="pointer"></div>
    Spin Me!
  </div>
  <div class="columns">
    <div class="column">
      <h2>Nouns</h2>
      <ul>
        <li>fox</li>
        <li>bus</li>
        <li>cat</li>
        <li>tree</li>
      </ul>
    </div>
    <div class="column">
      <h2>Sentence Starters</h2>
      <ul>
        <li>The ____ are chasing each other.</li>
        <li>Two ____ arrived at school.</li>
        <li>My ____ climb the tall fence.</li>
        <li>The ____ sway in the wind.</li>
      </ul>
    </div>
  </div>
</div>
</body></html>`;
  },

  'subject-verb-snap-cards': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Subject-Verb Snap Cards</title>
<style>
body{font-family:'Fredoka',sans-serif;margin:0;padding:40px;background:#ecfdf5;color:#064e3b}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;max-width:960px;margin:0 auto}
.card{background:white;border-radius:22px;padding:18px;text-align:center;box-shadow:0 18px 40px rgba(16,185,129,0.25);font-size:24px;font-weight:700}
.subject{border:4px solid #14b8a6;color:#0f766e}
.verb{border:4px solid #f97316;color:#c2410c}
.instructions{max-width:960px;margin:28px auto 0;background:#d1fae5;border-radius:22px;padding:20px;text-align:center;font-size:18px;font-weight:600;color:#065f46}
h1{text-align:center;font-size:44px;color:#0f766e;margin-bottom:18px}
</style></head><body>
<h1>🎴 Subject-Verb Snap</h1>
<div class="grid">
  <div class="card subject">He</div>
  <div class="card subject">She</div>
  <div class="card subject">It</div>
  <div class="card subject">The cat</div>
  <div class="card verb">hop</div>
  <div class="card verb">wash</div>
  <div class="card verb">push</div>
  <div class="card verb">sing</div>
</div>
<div class="instructions">Flip one subject and one verb. Say the sentence with the correct ending: -s or -es!</div>
</body></html>`;
  },

  'third-person-builder-board': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Third-Person Builder Board</title>
<style>
body{font-family:'Poppins',sans-serif;margin:0;padding:40px;background:#f0f9ff;color:#0f172a}
.board{max-width:980px;margin:0 auto;background:white;border-radius:32px;padding:40px;box-shadow:0 28px 60px rgba(37,99,235,0.28)}
h1{text-align:center;font-size:44px;color:#1d4ed8;margin-bottom:12px}
.subtitle{text-align:center;font-size:18px;color:#1e3a8a;margin-bottom:30px}
.zones{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.zone{border:5px dashed rgba(37,99,235,0.35);border-radius:24px;padding:24px;min-height:180px;text-align:center;font-size:22px;font-weight:700;color:#1d4ed8;background:linear-gradient(135deg,rgba(191,219,254,0.6),rgba(219,234,254,0.6))}
.tiles{margin-top:28px;display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.tile{background:#e0f2fe;border-radius:18px;padding:16px;text-align:center;font-weight:700;font-size:20px;color:#1e3a8a;box-shadow:0 12px 24px rgba(37,99,235,0.18)}
.footer{margin-top:30px;background:#dbeafe;border-radius:22px;padding:20px;font-size:18px;font-weight:600;text-align:center;color:#1d4ed8}
</style></head><body>
<div class="board">
  <h1>🧱 Third-Person Sentence Builder</h1>
  <p class="subtitle">Place a subject, verb, and the correct ending tile. Write and illustrate your sentence.</p>
  <div class="zones">
    <div class="zone">Subject</div>
    <div class="zone">Verb</div>
    <div class="zone">Ending (-s / -es)</div>
  </div>
  <div class="tiles">
    <div class="tile">He</div>
    <div class="tile">She</div>
    <div class="tile">It</div>
    <div class="tile">The dog</div>
    <div class="tile">hop</div>
    <div class="tile">mix</div>
    <div class="tile">wash</div>
    <div class="tile">play</div>
    <div class="tile">-s</div>
    <div class="tile">-es</div>
  </div>
  <div class="footer">Remember: Verbs ending with sh, ch, x, s, or z need -es!</div>
</div>
</body></html>`;
  },

  'verb-superstar-certificates': () => {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Verb Superstar Certificate</title>
<style>
body{font-family:'Fredoka',sans-serif;margin:0;padding:40px;background:#fdf4ff;color:#581c87}
.certificate{max-width:900px;margin:0 auto;background:white;border-radius:40px;padding:40px;border:12px solid #a855f7;box-shadow:0 30px 60px rgba(168,85,247,0.25);text-align:center}
h1{font-size:48px;margin-bottom:10px;color:#7c3aed}
.badge{font-size:60px;margin-bottom:12px}
.line{margin:20px auto;width:80%;border-bottom:4px dotted #a855f7;height:40px}
.instructions{font-size:20px;color:#6b21a8;margin-bottom:24px;font-weight:600}
.sentences{display:grid;grid-template-columns:1fr;gap:18px;margin:0 auto;width:80%}
.sentences div{border:3px dashed rgba(168,85,247,0.6);border-radius:20px;padding:18px;font-size:22px;font-weight:600;color:#6b21a8}
.signature{margin-top:28px;font-size:20px;color:#6b21a8}
</style></head><body>
<div class="certificate">
  <div class="badge">🏆</div>
  <h1>Verb Superstar</h1>
  <p class="instructions">Write two shining sentences using he/she/it verbs with -s or -es endings.</p>
  <div class="sentences">
    <div>Sentence 1: ______________________________________</div>
    <div>Sentence 2: ______________________________________</div>
  </div>
  <div class="signature">Awarded to: ____________________________</div>
  <div class="line"></div>
  <p class="instructions">Teacher Signature: _____________________</p>
</div>
</body></html>`;
  }
};

const Morphology = ({ saveData, loadedData = {}, showToast }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [showActivities, setShowActivities] = useState(false);
  const [viewMode, setViewMode] = useState('teacher');
  const [displaySlideIndex, setDisplaySlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sharedLesson, setSharedLesson] = useState(() => loadedData?.morphology?.currentLesson || null);
  const [isSavingLesson, setIsSavingLesson] = useState(false);
  const displayContainerRef = useRef(null);

  useEffect(() => {
    if (loadedData?.morphology?.currentLesson) {
      setSharedLesson(loadedData.morphology.currentLesson);
    } else {
      setSharedLesson(null);
    }
  }, [loadedData]);
  const goToNextSlide = useCallback(() => {
    setDisplaySlideIndex((prev) => {
      if (!selectedLesson?.displaySections?.length) {
        return 0;
      }

      const maxIndex = selectedLesson.displaySections.length - 1;
      return Math.min(prev + 1, maxIndex);
    });
  }, [selectedLesson]);

  const goToPreviousSlide = useCallback(() => {
    setDisplaySlideIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const exitFullscreenIfNeeded = () => {
    if (typeof document === 'undefined') return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const toggleFullscreen = async () => {
    if (typeof document === 'undefined') return;

    try {
      if (!document.fullscreenElement && displayContainerRef.current) {
        await displayContainerRef.current.requestFullscreen();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('Unable to toggle fullscreen mode', error);
      }
    }
  };

  const handleShareLesson = async (lessonOverride = null, levelOverride = null) => {
    if (typeof saveData !== 'function') {
      if (showToast) {
        showToast('Saving is not available right now.', 'error');
      }
      return;
    }

    const targetLevel = levelOverride || selectedLevel;
    const targetLesson = lessonOverride || selectedLesson;

    if (!targetLesson || !targetLevel?.data) {
      return;
    }

    const newCurrentLesson = {
      level: targetLevel.level,
      levelTitle: targetLevel.data.levelInfo.title,
      levelColor: targetLevel.data.levelInfo.color,
      lessonId: targetLesson.id,
      lessonTitle: targetLesson.title,
      lessonIcon: targetLesson.icon,
      sharedAt: new Date().toISOString()
    };

    const existingToolkitData = loadedData || {};
    const updatedToolkitData = {
      ...existingToolkitData,
      morphology: {
        ...(existingToolkitData.morphology || {}),
        currentLesson: newCurrentLesson
      }
    };

    try {
      setIsSavingLesson(true);
      await saveData({ toolkitData: updatedToolkitData });
      setSharedLesson(newCurrentLesson);
      if (showToast) {
        showToast('Morphology lesson shared to the student portal!', 'success');
      }
    } catch (error) {
      console.error('Unable to share morphology lesson', error);
      if (showToast) {
        showToast('Error sharing lesson. Please try again.', 'error');
      }
    } finally {
      setIsSavingLesson(false);
    }
  };

  const handleClearSharedLesson = async () => {
    if (typeof saveData !== 'function') {
      if (showToast) {
        showToast('Saving is not available right now.', 'error');
      }
      return;
    }

    const existingToolkitData = loadedData || {};
    const morphologyData = { ...(existingToolkitData.morphology || {}) };
    delete morphologyData.currentLesson;

    const updatedToolkitData = { ...existingToolkitData };

    if (Object.keys(morphologyData).length > 0) {
      updatedToolkitData.morphology = morphologyData;
    } else {
      delete updatedToolkitData.morphology;
    }

    try {
      setIsSavingLesson(true);
      await saveData({ toolkitData: updatedToolkitData });
      setSharedLesson(null);
      if (showToast) {
        showToast('Morphology lesson removed from the student portal.', 'info');
      }
    } catch (error) {
      console.error('Unable to clear shared morphology lesson', error);
      if (showToast) {
        showToast('Error clearing shared lesson. Please try again.', 'error');
      }
    } finally {
      setIsSavingLesson(false);
    }
  };

  const lessonIsShared = (lesson, levelNumber) =>
    Boolean(sharedLesson && sharedLesson.level === levelNumber && sharedLesson.lessonId === lesson?.id);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (viewMode !== 'display') {
      exitFullscreenIfNeeded();
    }
  }, [viewMode]);

  useEffect(() => {
    if (showActivities) {
      exitFullscreenIfNeeded();
    }
  }, [showActivities]);

  useEffect(() => {
    if (selectedLesson) {
      exitFullscreenIfNeeded();
      setCurrentSection(0);
      setShowActivities(false);
      setViewMode('teacher');
      setDisplaySlideIndex(0);
      setIsFullscreen(false);
    }
  }, [selectedLesson]);

  useEffect(() => {
    if (viewMode !== 'display') {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault();
        goToNextSlide();
      }

      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        event.preventDefault();
        goToPreviousSlide();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewMode, goToNextSlide, goToPreviousSlide]);

  // Download printable function
  const downloadPrintable = (printableId, activityTitle) => {
    if (!printableTemplates[printableId]) return;

    const htmlContent = printableTemplates[printableId]();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${printableId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const escapeHtml = (unsafe = '') =>
    unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const createWordListPosterHTML = (lists, lessonTitle) => {
    if (!lists || lists.length === 0) {
      return '';
    }

    const gradients = [
      'linear-gradient(135deg,#ff9a9e 0%,#fecfef 100%)',
      'linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)',
      'linear-gradient(135deg,#fbc2eb 0%,#a6c1ee 100%)',
      'linear-gradient(135deg,#f6d365 0%,#fda085 100%)'
    ];

    const safeLessonTitle = escapeHtml(lessonTitle || 'Word Practice Corner');

    const pages = lists
      .map((list, index) => {
        const gradient = gradients[index % gradients.length];
        const safeTitle = escapeHtml(list.title || 'Word Set');
        const safeDescription = list.description ? escapeHtml(list.description) : '';
        const wordsMarkup = (list.words || [])
          .map((word) => `<div class="word-card">${escapeHtml(word)}</div>`)
          .join('');

        return `
          <section class="page">
            <div class="poster" style="background:${gradient}">
              <div class="poster-content">
                <div class="poster-header">
                  <div class="lesson-chip">${safeLessonTitle}</div>
                  <div class="icon-burst">${list.icon || '✨'}</div>
                </div>
                <h1>${safeTitle}</h1>
                ${
                  safeDescription
                    ? `<p class="description">${safeDescription}</p>`
                    : ''
                }
                <div class="word-grid">${wordsMarkup}</div>
                <div class="footer-note">✨ Clap, chant, and celebrate every word together!</div>
              </div>
            </div>
          </section>
        `;
      })
      .join('');

    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${safeLessonTitle} Posters</title>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600&display=swap" rel="stylesheet">
    <style>
      :root { color-scheme: light; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: 'Fredoka', 'Nunito', 'Comic Sans MS', sans-serif;
        background: #fdf2ff;
      }
      .page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 48px;
        page-break-after: always;
      }
      .page:last-child {
        page-break-after: auto;
      }
      .poster {
        width: 100%;
        max-width: 1200px;
        border-radius: 56px;
        padding: 72px 64px;
        color: #ffffff;
        box-shadow: 0 35px 70px rgba(70, 0, 120, 0.25);
        position: relative;
        overflow: hidden;
      }
      .poster::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at top right, rgba(255,255,255,0.35), transparent 55%);
        opacity: 0.85;
        pointer-events: none;
      }
      .poster-content {
        position: relative;
        z-index: 2;
      }
      .poster-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }
      .lesson-chip {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: rgba(255,255,255,0.25);
        color: rgba(255,255,255,0.95);
        padding: 14px 28px;
        border-radius: 999px;
        font-size: 18px;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      .lesson-chip::before {
        content: '📚';
        font-size: 22px;
      }
      .icon-burst {
        font-size: 84px;
        filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.25));
      }
      h1 {
        font-size: 68px;
        line-height: 1.05;
        margin: 28px 0 16px;
        text-shadow: 0 6px 22px rgba(0, 0, 0, 0.35);
      }
      .description {
        font-size: 26px;
        margin-bottom: 40px;
        color: rgba(255,255,255,0.95);
        font-weight: 500;
        max-width: 900px;
      }
      .word-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 28px;
      }
      .word-card {
        background: rgba(255,255,255,0.9);
        color: #3b0764;
        border-radius: 32px;
        padding: 32px 20px;
        font-size: 38px;
        font-weight: 700;
        text-align: center;
        text-transform: uppercase;
        border: 4px solid rgba(255,255,255,0.5);
        box-shadow: 0 18px 36px rgba(59,7,100,0.18);
      }
      .footer-note {
        margin-top: 48px;
        font-size: 22px;
        background: rgba(255,255,255,0.22);
        padding: 16px 28px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        gap: 12px;
        color: #ffffff;
        font-weight: 600;
      }
      .footer-note::before {
        content: '🎶';
        font-size: 28px;
      }
      @page {
        size: A3 landscape;
        margin: 12mm;
      }
      @media print {
        body {
          background: #ffffff;
          -webkit-print-color-adjust: exact;
        }
        .poster {
          box-shadow: none;
        }
      }
    </style>
  </head>
  <body>
    ${pages}
  </body>
</html>`;
  };

  const handlePrintWordListPosters = (lists, lessonTitle) => {
    if (typeof window === 'undefined') return;
    if (!lists || lists.length === 0) return;

    const html = createWordListPosterHTML(lists, lessonTitle);
    if (!html) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      try {
        printWindow.print();
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.error('Unable to open print dialog', error);
        }
      }
    }, 300);
  };

  // Available levels
  const levels = [
    {
      level: 1,
      data: MorphologyLevel1,
      locked: false
    },
    {
      level: 2,
      data: MorphologyLevel2,
      locked: false
    },
    {
      level: 3,
      title: 'Advanced Patterns',
      description: 'Multiple affixes and word families',
      ageRange: '7-8 years',
      locked: true
    }
  ];

  const handleBack = () => {
    exitFullscreenIfNeeded();
    setIsFullscreen(false);

    if (selectedLesson) {
      setSelectedLesson(null);
      setCurrentSection(0);
      setShowActivities(false);
      setViewMode('teacher');
      setDisplaySlideIndex(0);
    } else if (selectedLevel) {
      setSelectedLevel(null);
    }
  };

  // Render level selection
  if (!selectedLevel) {
    const sharedLessonGradient = sharedLesson?.levelColor
      ? `bg-gradient-to-r ${sharedLesson.levelColor}`
      : 'bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500';
    const sharedLessonTimestamp = sharedLesson?.sharedAt
      ? new Date(sharedLesson.sharedAt).toLocaleString()
      : null;
    const sharedLessonLevelData = sharedLesson
      ? levels.find((lvl) => lvl.level === sharedLesson.level && !lvl.locked && lvl.data)
      : null;
    const sharedLessonLessonData = sharedLessonLevelData
      ? sharedLessonLevelData.data.lessons.find((lesson) => lesson.id === sharedLesson.lessonId)
      : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            <div className="relative z-10">
              <h1 className="text-6xl font-bold mb-4 flex items-center justify-center">
                <span className="text-5xl mr-4">🔤</span>
                Morphology Master
                <span className="text-5xl ml-4">✨</span>
              </h1>
              <p className="text-2xl opacity-90 mb-2">Learn How Words Work!</p>
              <p className="text-lg opacity-75">Understanding prefixes, suffixes, and base words</p>
            </div>
          </div>
        </div>

        {sharedLesson && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className={`relative overflow-hidden rounded-3xl shadow-2xl text-white ${sharedLessonGradient}`}>
              <div className="absolute inset-0 bg-black/15"></div>
              <div className="relative z-10 p-6 sm:p-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="uppercase tracking-widest text-xs sm:text-sm font-semibold text-white/80 mb-2">
                    Currently Shared with Students
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                    <span>{sharedLesson.lessonIcon || '📣'}</span>
                    Lesson {sharedLesson.lessonId}: {sharedLesson.lessonTitle || 'Morphology Focus'}
                  </h3>
                  <p className="text-sm sm:text-base text-white/85 mt-1">
                    Level {sharedLesson.level}: {sharedLesson.levelTitle || 'Morphology Masters'}
                  </p>
                  {sharedLessonTimestamp && (
                    <p className="text-xs sm:text-sm text-white/75 mt-2">Shared {sharedLessonTimestamp}</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      if (!sharedLessonLessonData || !sharedLessonLevelData) return;
                      handleShareLesson(sharedLessonLessonData, sharedLessonLevelData);
                    }}
                    disabled={
                      isSavingLesson ||
                      typeof saveData !== 'function' ||
                      !sharedLessonLessonData ||
                      !sharedLessonLevelData
                    }
                    className={`px-5 py-3 rounded-xl font-semibold text-sm sm:text-base shadow-lg transition ${
                      isSavingLesson ||
                      typeof saveData !== 'function' ||
                      !sharedLessonLessonData ||
                      !sharedLessonLevelData
                        ? 'bg-white/30 text-white/70 cursor-not-allowed'
                        : 'bg-white text-purple-700 hover:bg-white/90'
                    }`}
                  >
                    {isSavingLesson ? 'Updating…' : 'Refresh Share'}
                  </button>
                  <button
                    onClick={handleClearSharedLesson}
                    disabled={isSavingLesson || typeof saveData !== 'function'}
                    className={`px-5 py-3 rounded-xl font-semibold text-sm sm:text-base transition ${
                      isSavingLesson || typeof saveData !== 'function'
                        ? 'bg-black/20 text-white/60 cursor-not-allowed'
                        : 'bg-black/30 hover:bg-black/40'
                    }`}
                  >
                    Stop Sharing
                  </button>
                  <button
                    onClick={() => {
                      if (!sharedLessonLevelData || !sharedLessonLessonData) return;
                      setSelectedLevel(sharedLessonLevelData);
                      setSelectedLesson(sharedLessonLessonData);
                      setCurrentSection(0);
                      setShowActivities(false);
                      setViewMode('teacher');
                      setDisplaySlideIndex(0);
                    }}
                    className="px-5 py-3 rounded-xl font-semibold text-sm sm:text-base bg-white/20 hover:bg-white/30 transition"
                  >
                    View Lesson
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Level Cards */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-purple-900 mb-6">Choose Your Level</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {levels.map((level) => {
              const isSharedLevel = Boolean(sharedLesson && sharedLesson.level === level.level);
              return (
                <button
                  key={level.level}
                  onClick={() => !level.locked && setSelectedLevel(level)}
                disabled={level.locked}
                className={`relative p-8 rounded-2xl border-4 transition-all duration-300 transform hover:scale-105 ${
                  level.locked
                    ? 'bg-gray-100 border-gray-300 cursor-not-allowed opacity-60'
                    : isSharedLevel
                    ? 'bg-white border-emerald-400 hover:border-emerald-500 hover:shadow-2xl cursor-pointer'
                    : 'bg-white border-purple-400 hover:border-purple-600 hover:shadow-2xl cursor-pointer'
                }`}
              >
                {/* Level Badge */}
                <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-2 rounded-full font-bold text-white text-lg ${
                  level.locked ? 'bg-gray-400' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  Level {level.level}
                </div>

                {isSharedLevel && !level.locked && (
                  <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 font-semibold text-xs px-3 py-1 rounded-full shadow-sm">
                    📣 Shared with class
                  </div>
                )}

                <div className="mt-6 text-center">
                  {/* Icon/Emoji */}
                  <div className="text-6xl mb-4">
                    {level.locked ? '🔒' : level.data ? '🌟' : '⭐'}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-2 text-purple-900">
                    {level.data ? level.data.levelInfo.title : level.title}
                  </h3>

                  {/* Age Range */}
                  <div className="text-sm text-purple-600 mb-3 font-semibold">
                    Ages {level.data ? level.data.levelInfo.ageRange : level.ageRange}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4">
                    {level.data ? level.data.levelInfo.description : level.description}
                  </p>

                  {/* Lesson Count */}
                  {level.data && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                      <div className="text-purple-800 font-bold">
                        📚 {level.data.lessons.length} Engaging Lessons
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  {level.locked ? (
                    <div className="text-gray-500 text-sm mt-4">🔒 Coming Soon</div>
                  ) : (
                    <div className="text-purple-600 font-bold mt-4 text-lg">
                      Start Learning →
                    </div>
                  )}
                </div>
              </button>
            );
            })}
          </div>
        </div>

        {/* Info Box */}
        <div className="max-w-4xl mx-auto mt-8 bg-white border-2 border-purple-300 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-900 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            What is Morphology?
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Morphology is the study of how words are built! It teaches students about <strong>base words</strong>,
            <strong> prefixes</strong> (parts added to the beginning), and <strong>suffixes</strong> (parts added to the end).
            Understanding morphology helps students decode unfamiliar words, spell better, and build their vocabulary naturally!
          </p>
        </div>
      </div>
    );
  }

  // Render lesson selection
  if (selectedLevel && !selectedLesson) {
    const levelData = selectedLevel.data;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-4 px-6 py-3 bg-white border-2 border-purple-400 rounded-xl font-bold text-purple-700 hover:bg-purple-50 transition-all flex items-center gap-2"
        >
          ← Back to Levels
        </button>

        {/* Level Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-75 mb-1">Level {selectedLevel.level}</div>
              <h2 className="text-4xl font-bold mb-2">{levelData.levelInfo.title}</h2>
              <p className="text-lg opacity-90">{levelData.levelInfo.description}</p>
              <p className="text-sm opacity-75 mt-2">Ages {levelData.levelInfo.ageRange}</p>
            </div>
            <div className="text-6xl">📖</div>
          </div>
        </div>

        {/* Lesson Cards */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-purple-900 mb-4">Select a Lesson</h3>
          <div className="grid grid-cols-1 gap-6">
            {levelData.lessons.map((lesson, index) => {
              const isShared = lessonIsShared(lesson, selectedLevel.level);
              return (
                <button
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className={`relative bg-white border-4 rounded-2xl p-6 hover:shadow-xl transition-all text-left group ${
                    isShared ? 'border-emerald-400 hover:border-emerald-500' : 'border-purple-300 hover:border-purple-500'
                  }`}
                >
                  <div className="flex items-start gap-6">
                    {/* Lesson Number Circle */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-2xl font-bold">
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      {/* Title */}
                      <h4 className="text-2xl font-bold text-purple-900 mb-2 flex items-center gap-2">
                        <span>{lesson.icon}</span>
                        {lesson.title}
                      </h4>

                      {isShared && (
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold">
                          <span>📣 Shared with students</span>
                        </div>
                      )}

                      {/* Duration */}
                      <div className="text-purple-600 text-sm font-semibold mb-3">
                        ⏱️ {lesson.duration}
                      </div>

                    {/* Objectives */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-3">
                      <div className="text-sm font-bold text-purple-800 mb-2">Learning Objectives:</div>
                      <ul className="text-sm text-purple-700 space-y-1">
                        {lesson.objectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-pink-500">✓</span>
                            <span>{obj}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                      {/* Activities Count */}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full font-semibold">
                          🎯 {lesson.activities.length} Activities
                        </span>
                        <span className="text-purple-600 font-bold group-hover:text-purple-800">
                          Start Lesson →
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Render lesson content
  if (selectedLesson) {
    const lesson = selectedLesson;
    const totalSections = lesson.teacherScript.length;
    const totalDisplaySections = lesson.displaySections ? lesson.displaySections.length : 0;
    const isLastSection = currentSection >= totalSections - 1;
    const currentSlide = lesson.displaySections ? lesson.displaySections[displaySlideIndex] : null;
    const slideProgress = totalDisplaySections > 0 ? ((displaySlideIndex + 1) / totalDisplaySections) * 100 : 0;
    const teacherProgress = ((currentSection + 1) / totalSections) * 100;
    const progressValue = viewMode === 'teacher' ? teacherProgress : slideProgress;
    const slideSubtitleClass = isFullscreen
      ? 'uppercase tracking-[0.35em] text-base sm:text-xl font-semibold text-white/85'
      : 'uppercase tracking-[0.3em] text-xs sm:text-sm font-semibold text-white/80';
    const slideTitleClass = isFullscreen
      ? 'mt-2 text-5xl sm:text-6xl lg:text-7xl font-extrabold drop-shadow-[0_15px_45px_rgba(0,0,0,0.35)]'
      : 'mt-2 text-4xl sm:text-5xl font-extrabold drop-shadow-lg';
    const slidePromptClass = isFullscreen
      ? 'text-2xl sm:text-3xl leading-tight text-white/95'
      : 'text-lg sm:text-xl leading-snug text-white';
    const focusWordClass = isFullscreen
      ? 'rounded-3xl border border-white/30 bg-white/25 px-6 py-5 text-center text-3xl sm:text-4xl font-bold text-white shadow-xl backdrop-blur'
      : 'rounded-3xl border border-white/30 bg-white/25 px-5 py-4 text-center text-2xl font-bold text-white shadow-lg backdrop-blur';
    const actionsListClass = isFullscreen
      ? 'space-y-3 text-xl sm:text-2xl leading-snug text-white/95'
      : 'space-y-2 text-base sm:text-lg text-white';
    const slideIconWrapperClass = isFullscreen
      ? 'flex h-32 w-32 items-center justify-center rounded-full border-4 border-white/50 bg-black/35 text-6xl drop-shadow-2xl'
      : 'flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/40 bg-black/25 text-4xl drop-shadow-lg';
    const currentLessonShared = lessonIsShared(lesson, selectedLevel.level);
    const canSaveLesson = typeof saveData === 'function';
    const currentLessonSharedTimestamp = currentLessonShared && sharedLesson?.sharedAt
      ? new Date(sharedLesson.sharedAt).toLocaleString()
      : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-4 px-6 py-3 bg-white border-2 border-purple-400 rounded-xl font-bold text-purple-700 hover:bg-purple-50 transition-all flex items-center gap-2"
        >
          ← Back to Lesson Selection
        </button>

        {!showActivities ? (
          <>
            {/* Lesson Header */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-2xl p-6 mb-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{lesson.icon}</div>
                  <div>
                    <div className="text-sm opacity-75">Lesson {lesson.id}</div>
                    <h2 className="text-3xl font-bold">{lesson.title}</h2>
                    <div className="text-sm opacity-90 mt-1">⏱️ {lesson.duration}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-75 mb-1">
                    {viewMode === 'teacher' ? 'Teacher Section Progress' : 'Class Display Slides'}
                  </div>
                  <div className="text-2xl font-bold">
                    {viewMode === 'teacher'
                      ? `${currentSection + 1} / ${totalSections}`
                      : totalDisplaySections > 0
                      ? `${displaySlideIndex + 1} / ${totalDisplaySections}`
                      : 'Ready'}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                <div
                  className="bg-white h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progressValue}%` }}
                ></div>
              </div>
            </div>

            {/* Quick Info Panel */}
            <div className="bg-white border-2 border-purple-300 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Materials Needed */}
                <div>
                  <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <span>📦</span> Materials Needed
                  </h4>
                  <ul className="space-y-2">
                    {lesson.materials.map((material, i) => (
                      <li key={i} className="text-gray-700 flex items-start gap-2">
                        <span className="text-pink-500">•</span>
                        <span>{material}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Learning Objectives */}
                <div>
                  <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <span>🎯</span> Learning Objectives
                  </h4>
                  <ul className="space-y-2">
                    {lesson.objectives.map((obj, i) => (
                      <li key={i} className="text-gray-700 flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Share to Student Portal */}
            <div
              className={`rounded-2xl border-2 p-6 mb-6 ${
                currentLessonShared ? 'bg-emerald-50 border-emerald-300' : 'bg-blue-50 border-blue-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3
                    className={`text-xl font-bold ${
                      currentLessonShared ? 'text-emerald-900' : 'text-blue-900'
                    }`}
                  >
                    {currentLessonShared ? 'Shared with your class' : 'Share this lesson with your class'}
                  </h3>
                  <p
                    className={`${
                      currentLessonShared ? 'text-emerald-700' : 'text-blue-700'
                    } text-sm md:text-base mt-1`}
                  >
                    {currentLessonShared
                      ? 'Students can see the colourful summary and interactive practice in their portal right now.'
                      : 'Send a colourful overview and mini practice games straight to the student portal for your learners.'}
                  </p>
                  {currentLessonSharedTimestamp && (
                    <p className="text-xs md:text-sm text-gray-600 mt-2">Last shared {currentLessonSharedTimestamp}</p>
                  )}
                  {!canSaveLesson && (
                    <p className="text-xs text-gray-500 mt-2">Saving is unavailable in this view.</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {currentLessonShared ? (
                    <>
                      <button
                        onClick={() => handleShareLesson(lesson, selectedLevel)}
                        disabled={!canSaveLesson || isSavingLesson}
                        className={`px-5 py-3 rounded-xl font-semibold text-sm sm:text-base transition shadow-md ${
                          !canSaveLesson || isSavingLesson
                            ? 'bg-emerald-200 text-emerald-700/60 cursor-not-allowed'
                            : 'bg-emerald-500 text-white hover:bg-emerald-600'
                        }`}
                      >
                        {isSavingLesson ? 'Updating…' : 'Refresh Student View'}
                      </button>
                      <button
                        onClick={handleClearSharedLesson}
                        disabled={!canSaveLesson || isSavingLesson}
                        className={`px-5 py-3 rounded-xl font-semibold text-sm sm:text-base transition ${
                          !canSaveLesson || isSavingLesson
                            ? 'bg-white/60 text-gray-500 cursor-not-allowed'
                            : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        Stop Sharing
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleShareLesson(lesson, selectedLevel)}
                      disabled={!canSaveLesson || isSavingLesson}
                      className={`px-5 py-3 rounded-xl font-semibold text-sm sm:text-base transition shadow-md ${
                        !canSaveLesson || isSavingLesson
                          ? 'bg-blue-200 text-blue-700/60 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {isSavingLesson ? 'Sharing…' : 'Share to Student Portal'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex bg-white/70 border-2 border-purple-300 rounded-full p-1 shadow-inner">
                <button
                  onClick={() => setViewMode('teacher')}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                    viewMode === 'teacher'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-purple-600 hover:text-purple-800'
                  }`}
                >
                  👩‍🏫 Teacher View
                </button>
                <button
                  onClick={() => setViewMode('display')}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                    viewMode === 'display'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                      : 'text-purple-600 hover:text-purple-800'
                  }`}
                >
                  🖥️ Class Display
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            {viewMode === 'teacher' ? (
              <div className="bg-white border-4 border-purple-400 rounded-2xl p-8 mb-6 shadow-xl">
                {/* Section Header */}
                <div className="mb-6 pb-4 border-b-2 border-purple-200">
                  <h3 className="text-3xl font-bold text-purple-900 mb-2">
                    {lesson.teacherScript[currentSection].section}
                  </h3>
                  <div className="text-purple-600 text-sm font-semibold">
                    Section {currentSection + 1} of {totalSections}
                  </div>
                </div>

                {/* Teacher Script */}
                <div className="prose max-w-none">
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
                    <div className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                      {lesson.teacherScript[currentSection].content}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                {currentSlide ? (
                  <div
                    ref={displayContainerRef}
                    className={`relative flex overflow-hidden text-white transition-all duration-500 bg-gradient-to-br ${
                      currentSlide?.background || 'from-purple-500 via-pink-500 to-blue-500'
                    } ${
                      isFullscreen
                        ? 'h-screen w-screen flex-col items-center justify-center rounded-none border-0 shadow-none'
                        : 'min-h-[520px] flex-col justify-center rounded-3xl border-4 border-white shadow-2xl'
                    }`}
                    style={{
                      minHeight: isFullscreen ? '100vh' : undefined,
                      width: isFullscreen ? '100vw' : '100%'
                    }}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-white/10 blur-3xl opacity-50"></div>
                    <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2">
                      <button
                        onClick={toggleFullscreen}
                        className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-black/35 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-black/55"
                        title={isFullscreen ? 'Exit full screen (Esc)' : 'Enter full screen'}
                      >
                        <span>{isFullscreen ? '🗗' : '⛶'}</span>
                        {isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
                      </button>
                      {isFullscreen && (
                        <span className="rounded-full border border-white/40 bg-black/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/90">
                          Press Esc to exit
                        </span>
                      )}
                    </div>

                    {totalDisplaySections > 1 && (
                      <>
                        <button
                          onClick={goToPreviousSlide}
                          className={`group absolute left-4 top-1/2 z-30 -translate-y-1/2 rounded-full border-2 border-white/50 bg-black/30 p-4 text-3xl font-bold text-white transition hover:bg-black/50 focus:outline-none focus:ring-4 focus:ring-white/50 ${
                            displaySlideIndex === 0 ? 'cursor-not-allowed opacity-40 hover:bg-black/30' : ''
                          }`}
                          disabled={displaySlideIndex === 0}
                          aria-label="Previous slide"
                        >
                          ←
                        </button>
                        <button
                          onClick={goToNextSlide}
                          className={`group absolute right-4 top-1/2 z-30 -translate-y-1/2 rounded-full border-2 border-white/50 bg-black/30 p-4 text-3xl font-bold text-white transition hover:bg-black/50 focus:outline-none focus:ring-4 focus:ring-white/50 ${
                            displaySlideIndex >= totalDisplaySections - 1
                              ? 'cursor-not-allowed opacity-40 hover:bg-black/30'
                              : ''
                          }`}
                          disabled={totalDisplaySections === 0 || displaySlideIndex >= totalDisplaySections - 1}
                          aria-label="Next slide"
                        >
                          →
                        </button>
                      </>
                    )}

                    <div
                      className={`relative z-20 ${
                        isFullscreen
                          ? 'mx-auto w-full max-w-6xl px-6 py-16 sm:px-16 lg:px-24'
                          : 'mx-auto max-w-5xl px-6 py-12 sm:px-12'
                      }`}
                    >
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className={slideSubtitleClass}>{currentSlide.subtitle}</div>
                          <h3 className={slideTitleClass}>{currentSlide.title}</h3>
                        </div>
                        {currentSlide.icon && <div className={slideIconWrapperClass}>{currentSlide.icon}</div>}
                      </div>

                      {currentSlide.prompt && (
                        <div className={`mt-6 rounded-3xl border border-white/35 bg-white/20 px-6 py-4 shadow-xl backdrop-blur ${slidePromptClass}`}>
                          {currentSlide.prompt}
                        </div>
                      )}

                      {currentSlide.focusWords && currentSlide.focusWords.length > 0 && (
                        <div
                          className={`mt-8 grid gap-5 ${
                            isFullscreen ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'
                          }`}
                        >
                          {currentSlide.focusWords.map((word, index) => (
                            <div key={index} className={focusWordClass}>
                              {word}
                            </div>
                          ))}
                        </div>
                      )}
                      {currentSlide.actions && currentSlide.actions.length > 0 && (
                        <div className="mt-8 rounded-3xl border border-white/25 bg-black/25 p-6 backdrop-blur">
                          <div className={`mb-3 flex items-center gap-2 font-bold ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>
                            <span>⭐</span>
                            Try This Together
                          </div>
                          <ul className={actionsListClass}>
                            {currentSlide.actions.map((action, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <span className="font-bold text-white/85">{index + 1}.</span>
                                <span className="leading-snug">{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {totalDisplaySections > 0 && (
                      <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/40 bg-black/35 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white/90 backdrop-blur">
                        <span>
                          Slide {displaySlideIndex + 1} of {totalDisplaySections}
                        </span>
                        <div className="h-1 w-24 rounded-full bg-white/30">
                          <div className="h-1 rounded-full bg-white" style={{ width: `${slideProgress}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-3xl bg-white/80 p-8 text-center text-xl font-semibold text-purple-900 shadow-lg">
                    Class display slides coming soon. Switch to Teacher View for notes.
                  </div>
                )}
              </div>
            )}

            {/* Practice Word Lists */}
            {lesson.practiceWordLists && lesson.practiceWordLists.length > 0 && (
              <div className="mb-6">
                <div className="bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 border-4 border-pink-300 rounded-3xl p-6 shadow-xl">
                  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-2xl font-extrabold text-purple-900 flex items-center gap-2">
                        <span>📝</span>
                        Word Practice Corner
                      </h3>
                      <p className="text-purple-800 font-semibold text-sm md:text-base">
                        Display or print these word sets for quick whole-class practice.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handlePrintWordListPosters(lesson.practiceWordLists, lesson.title)}
                        className="inline-flex items-center gap-2 rounded-full border-2 border-white/70 bg-purple-600/80 px-5 py-2 text-sm font-bold text-white shadow-md transition hover:bg-purple-600"
                        title="Print every practice word poster"
                      >
                        <span>🖨️</span>
                        Print All Posters
                      </button>
                      <div className="text-4xl sm:text-5xl drop-shadow">✨</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {lesson.practiceWordLists.map((list, index) => (
                      <div
                        key={index}
                        className="bg-white/90 rounded-2xl p-5 border-2 border-purple-200 shadow-inner transition-all hover:-translate-y-1 hover:shadow-xl"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-3xl">{list.icon}</div>
                          <div>
                            <h4 className="text-lg font-bold text-purple-900 leading-tight">{list.title}</h4>
                            {list.description && (
                              <p className="text-sm text-purple-600 leading-snug">{list.description}</p>
                            )}
                          </div>
                        </div>
                        <ul className="space-y-2 text-purple-800">
                          {list.words.map((word, wordIndex) => (
                            <li
                              key={wordIndex}
                              className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-2 text-base font-semibold text-center"
                            >
                              {word}
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={() => handlePrintWordListPosters([list], lesson.title)}
                          className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 text-sm font-bold text-white shadow-md transition hover:shadow-lg"
                          title={`Print the ${list.title} poster`}
                        >
                          <span>🖨️</span>
                          Print This Set
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            {viewMode === 'teacher' ? (
              <div className="flex justify-between items-center gap-4">
                <button
                  onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                  disabled={currentSection === 0}
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                    currentSection === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-500 text-white hover:bg-purple-600 shadow-lg'
                  }`}
                >
                  ← Previous Section
                </button>

                {!isLastSection ? (
                  <button
                    onClick={() => setCurrentSection(currentSection + 1)}
                    className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all"
                  >
                    Next Section →
                  </button>
                ) : (
                  <button
                    onClick={() => setShowActivities(true)}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all animate-pulse"
                  >
                    View Activities 🎯
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex gap-3 justify-between md:justify-start">
                  <button
                    onClick={goToPreviousSlide}
                    disabled={displaySlideIndex === 0}
                    className={`px-6 py-3 rounded-xl font-bold text-base transition-all ${
                      displaySlideIndex === 0
                        ? 'bg-white/40 text-white/70 cursor-not-allowed'
                        : 'bg-white/80 text-purple-700 hover:bg-white'
                    }`}
                  >
                    ← Previous Slide
                  </button>
                  <button
                    onClick={goToNextSlide}
                    disabled={totalDisplaySections === 0 || displaySlideIndex >= totalDisplaySections - 1}
                    className={`px-6 py-3 rounded-xl font-bold text-base transition-all ${
                      totalDisplaySections === 0 || displaySlideIndex >= totalDisplaySections - 1
                        ? 'bg-white/40 text-white/70 cursor-not-allowed'
                        : 'bg-white/80 text-purple-700 hover:bg-white'
                    }`}
                  >
                    Next Slide →
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setViewMode('teacher')}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold text-base hover:bg-purple-700 transition-all"
                  >
                    Back to Teacher Notes
                  </button>
                  <button
                    onClick={() => setShowActivities(true)}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-bold text-base hover:shadow-xl transition-all"
                  >
                    Go to Activities 🎯
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Activities View */}
            <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white rounded-2xl p-6 mb-6 shadow-lg">
              <h2 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <span>🎯</span>
                Activity Time!
              </h2>
              <p className="text-lg opacity-90">Hands-on practice activities for {lesson.title}</p>
            </div>

            {/* Activities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {lesson.activities.map((activity, index) => (
                <div key={index} className="bg-white border-4 border-green-300 rounded-2xl p-6 hover:border-green-500 transition-all shadow-lg">
                  {/* Activity Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-5xl">{activity.icon}</div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-green-900 mb-2">{activity.title}</h4>
                      <div className="text-green-600 text-sm font-semibold mb-2">
                        ⏱️ {activity.duration}
                      </div>
                      <p className="text-gray-700">{activity.description}</p>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="font-bold text-green-800 mb-2">📋 Instructions:</div>
                    <ol className="space-y-2">
                      {activity.instructions.map((instruction, i) => (
                        <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                          <span className="font-bold text-green-500 min-w-[20px]">{i + 1}.</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Materials */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="font-bold text-blue-800 text-sm mb-2">📦 Materials:</div>
                    <div className="text-sm text-blue-700">
                      {activity.materials.join(', ')}
                    </div>
                  </div>

                  {/* Printable Download Button */}
                  {activity.printable && (
                    <button
                      onClick={() => downloadPrintable(activity.printable, activity.title)}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <span>📄</span>
                      Download Printable Materials
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Assessment Section */}
            {lesson.assessment && (
              <div className="bg-white border-4 border-yellow-300 rounded-2xl p-6 mb-6 shadow-lg">
                <h3 className="text-2xl font-bold text-yellow-900 mb-4 flex items-center gap-2">
                  <span>📊</span>
                  Assessment & Checking Understanding
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Formative Assessment */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-bold text-yellow-800 mb-3">🔍 What to Look For:</h4>
                    <ul className="space-y-2">
                      {lesson.assessment.formative.map((item, i) => (
                        <li key={i} className="text-sm text-yellow-700 flex items-start gap-2">
                          <span className="text-yellow-500">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Questions to Ask */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-bold text-yellow-800 mb-3">💬 Questions to Ask Students:</h4>
                    <ul className="space-y-2">
                      {lesson.assessment.questions.map((question, i) => (
                        <li key={i} className="text-sm text-yellow-700 flex items-start gap-2">
                          <span className="text-yellow-500">•</span>
                          <span>{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Exit Ticket if exists */}
                {lesson.assessment.exitTicket && (
                  <div className="mt-4 bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                    <h4 className="font-bold text-purple-800 mb-2">🎫 Exit Ticket:</h4>
                    <p className="text-purple-700">{lesson.assessment.exitTicket}</p>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowActivities(false)}
                className="px-8 py-4 bg-purple-500 text-white rounded-xl font-bold text-lg hover:bg-purple-600 shadow-lg transition-all"
              >
                ← Back to Lesson
              </button>

              <button
                onClick={handleBack}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all"
              >
                Complete Lesson ✓
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
};

export default Morphology;