// components/curriculum/literacy/SpellingProgram.js
// ENHANCED SPELLING PROGRAM WITH ALL LEVELS AND FEATURES
import React, { useState, useEffect, useMemo } from 'react';

// Reading passage collections
import { LEVEL_1_PASSAGES } from './passages/Level1Passages';
import { LEVEL_2_PASSAGES_1 } from './passages/Level2Passages1';
import { LEVEL_2_PASSAGES_2 } from './passages/Level2Passages2';
import { LEVEL_2_PASSAGES_3 } from './passages/Level2Passages3';
import { LEVEL_2_PASSAGES_4 } from './passages/Level2Passages4';
import { LEVEL_2_PASSAGES_5 } from './passages/Level2Passages5';
import { LEVEL_2_PASSAGES_6 } from './passages/Level2Passages6';
import { LEVEL_2_PASSAGES_7 } from './passages/Level2Passages7';
import { LEVEL_2_PASSAGES_8 } from './passages/Level2Passages8';
import { LEVEL_2_PASSAGES_9 } from './passages/Level2Passages9';
import { LEVEL_2_PASSAGES_10 } from './passages/Level2Passages10';
import { LEVEL_3_PASSAGES_1 } from './passages/Level3Passages1';
import { LEVEL_3_PASSAGES_2 } from './passages/Level3Passages2';
import { LEVEL_3_PASSAGES_3 } from './passages/Level3Passages3';
import { LEVEL_3_PASSAGES_4 } from './passages/Level3Passages4';
import { LEVEL_3_PASSAGES_5 } from './passages/Level3Passages5';
import { LEVEL_3_PASSAGES_6 } from './passages/Level3Passages6';
import { LEVEL_3_PASSAGES_7 } from './passages/Level3Passages7';
import { LEVEL_3_PASSAGES_8 } from './passages/Level3Passages8';
import { LEVEL_3_PASSAGES_9 } from './passages/Level3Passages9';
import { LEVEL_3_PASSAGES_10 } from './passages/Level3Passages10';
import { LEVEL_3_PASSAGES_11 } from './passages/Level3Passages11';
import { LEVEL_3_PASSAGES_12 } from './passages/Level3Passages12';
import { LEVEL_3_PASSAGES_13 } from './passages/Level3Passages13';
import { LEVEL_4_PASSAGES_1 } from './passages/Level4Passages1';
import { LEVEL_4_PASSAGES_2 } from './passages/Level4Passages2';
import { LEVEL_4_PASSAGES_3 } from './passages/Level4Passages3';
import { LEVEL_4_PASSAGES_4 } from './passages/Level4Passages4';
import { LEVEL_4_PASSAGES_5 } from './passages/Level4Passages5';
import { LEVEL_4_PASSAGES_6 } from './passages/Level4Passages6';
import { LEVEL_4_PASSAGES_7 } from './passages/Level4Passages7';
import { LEVEL_4_PASSAGES_8 } from './passages/Level4Passages8';
import { LEVEL_4_PASSAGES_9 } from './passages/Level4Passages9';
import { LEVEL_4_PASSAGES_10 } from './passages/Level4Passages10';
import { LEVEL_4_PASSAGES_11 } from './passages/Level4Passages11';
import { LEVEL_4_PASSAGES_12 } from './passages/Level4Passages12';
import { LEVEL_4_PASSAGES_13 } from './passages/Level4Passages13';

// ===============================================
// ALL SPELLING LISTS WITH FEATURES
// ===============================================
const SPELLING_LISTS = [
  // LEVEL 1 LISTS
  { id: "1.1", name: "Level 1.1 - Simple CVC", feature: "Basic consonant-vowel-consonant patterns", words: ["in", "at", "it", "an", "sit", "sat"] },
  { id: "1.2", name: "Level 1.2 - CVC Practice", feature: "CVC patterns with p, t, n", words: ["pat", "tap", "nap", "tin", "pin", "pit"] },
  { id: "1.3", name: "Level 1.3 - CVC Extension", feature: "More CVC patterns", words: ["pan", "nip", "sip", "tan", "tip", "pip"] },
  { id: "1.4", name: "Level 1.4 - Mixed CVC", feature: "CVC with different consonants", words: ["him", "red", "did", "can", "man", "ran"] },
  { id: "1.5", name: "Level 1.5 - CVC with 'a'", feature: "Short 'a' sound patterns", words: ["cat", "am", "hat", "sad", "dad", "had"] },
  { id: "1.6", name: "Level 1.6 - CVC with 'e'", feature: "Short 'e' sound patterns", words: ["set", "men", "met", "pet", "ten", "net"] },
  { id: "1.7", name: "Level 1.7 - CVC Review", feature: "Mixed short vowel sounds", words: ["pen", "hen", "rat", "mat", "pad", "mad"] },
  { id: "1.8", name: "Level 1.8 - CVC with 'i'", feature: "Short 'i' sound patterns", words: ["hip", "cap", "map", "ram", "dip", "hid"] },
  { id: "1.9", name: "Level 1.9 - CVC with 'u'", feature: "Short 'u' sound patterns", words: ["leg", "get", "let", "run", "sun", "fun"] },
  { id: "1.10", name: "Level 1.10 - CVC with 'o'", feature: "Short 'o' sound patterns", words: ["but", "hot", "cut", "got", "not", "lot"] },
  { id: "1.11", name: "Level 1.11 - Mixed Review", feature: "All short vowel sounds", words: ["bad", "bed", "us", "bit", "up", "dog"] },
  { id: "1.12", name: "Level 1.12 - High Frequency", feature: "Common sight words", words: ["mum", "on", "top", "if", "pig", "big"] },
  { id: "1.13", name: "Level 1.13 - Consonant Blends", feature: "Beginning consonant combinations", words: ["gum", "hug", "bag", "fed", "bus", "gap"] },
  { id: "1.14", name: "Level 1.14 - More Blends", feature: "Continuing consonant blends", words: ["cup", "mud", "rod", "fan", "lip", "rub"] },
  { id: "1.15", name: "Level 1.15 - Ending Sounds", feature: "Final consonant sounds", words: ["yes", "wet", "jet", "yet", "vet", "kid"] },
  { id: "1.16", name: "Level 1.16 - New Sounds", feature: "j, v, w, z sounds", words: ["job", "jug", "zip", "van", "win", "web"] },
  { id: "1.17", name: "Level 1.17 - Review Mix", feature: "Mixed CVC review", words: ["but", "sad", "bed", "tub", "dam", "sob", "dip", "nod"] },
  { id: "1.18", name: "Level 1.18 - 'sh' Digraph", feature: "sh sound combinations", words: ["shed", "fish", "ship", "rush", "shop", "dish", "shot", "wish"] },
  { id: "1.19", name: "Level 1.19 - 'ch' Digraph", feature: "ch sound combinations", words: ["chop", "such", "chip", "much", "chin", "rich", "chat", "chest"] },
  { id: "1.20", name: "Level 1.20 - Digraph Mix", feature: "sh and ch sounds together", words: ["lash", "shelf", "shut", "mash", "hush", "chap", "chug", "much"] },
  { id: "1.21", name: "Level 1.21 - 'th' Digraph", feature: "th sound combinations", words: ["that", "them", "this", "then", "with", "moth", "than", "thick"] },
  { id: "1.22", name: "Level 1.22 - Digraph Review", feature: "All digraphs together", words: ["cash", "shin", "shift", "such", "chum", "thin", "then", "thud"] },
  { id: "1.23", name: "Level 1.23 - 'wh' Digraph", feature: "wh sound combinations", words: ["when", "whip", "which", "whiz", "whim", "wheel", "whack", "whacked"] },
  { id: "1.24", name: "Level 1.24 - 'ck' Ending", feature: "ck ending sounds", words: ["duck", "sock", "pick", "sick", "thick", "kick", "back", "neck"] },
  { id: "1.25", name: "Level 1.25 - Consonant Clusters", feature: "Multiple consonants together", words: ["desk", "risk", "thank", "milk", "rock", "shack", "chick", "pack"] },
  { id: "1.26", name: "Level 1.26 - Long 'ee'", feature: "Long e with ee spelling", words: ["week", "see", "been", "need", "keep", "seem", "feet", "teeth"] },
  { id: "1.27", name: "Level 1.27 - More 'ee'", feature: "Continuing long e sounds", words: ["meet", "cheek", "feel", "sheet", "wheel", "weed", "seed", "deep"] },
  { id: "1.28", name: "Level 1.28 - 'oo' Long", feature: "Long oo sound patterns", words: ["food", "soon", "moon", "room", "tooth", "too", "zoo", "noon"] },
  { id: "1.29", name: "Level 1.29 - More 'oo'", feature: "Continuing long oo sounds", words: ["root", "hoop", "roof", "mood", "boot", "booth", "shoot", "loop"] },
  { id: "1.30", name: "Level 1.30 - 'oo' Short", feature: "Short oo sound patterns", words: ["cool", "book", "look", "took", "pool", "shook", "good", "wood"] },
  { id: "1.31", name: "Level 1.31 - 'x' Sound", feature: "x letter combinations", words: ["six", "box", "fox", "wax", "tax", "fix", "mix", "fax"] },
  { id: "1.32", name: "Level 1.32 - 'qu' Sound", feature: "qu letter combinations", words: ["quick", "quiz", "quit", "quits", "quack", "quacks", "quilt", "queen"] },
  { id: "1.33", name: "Level 1.33 - Consonant Blends", feature: "Beginning blends", words: ["twin", "plan", "frog", "step", "from", "stop", "swim", "flag"] },
  { id: "1.34", name: "Level 1.34 - Complex Blends", feature: "Three-letter blends", words: ["black", "smash", "three", "sleep", "flash", "green", "tree", "truck"] },
  { id: "1.35", name: "Level 1.35 - More Blends", feature: "Continuing complex blends", words: ["drum", "block", "flap", "club", "snap", "track", "flip", "flat"] },
  { id: "1.36", name: "Level 1.36 - Final Blends", feature: "Ending consonant blends", words: ["trip", "drag", "plug", "crash", "clip", "drop", "spin", "glad"] },
  { id: "1.37", name: "Level 1.37 - Common Words", feature: "High frequency words", words: ["just", "left", "and", "lunch", "land", "hand", "went", "must"] },
  { id: "1.38", name: "Level 1.38 - Word Endings", feature: "Common word endings", words: ["end", "help", "next", "list", "thank", "think", "pink", "best"] },
  { id: "1.39", name: "Level 1.39 - 'old' Pattern", feature: "old word family", words: ["told", "gold", "old", "cold", "felt", "jump", "hold", "milk"] },
  { id: "1.40", name: "Level 1.40 - Mixed Patterns", feature: "Various spelling patterns", words: ["soft", "lost", "shift", "pond", "wind", "cost", "damp", "bend"] },
  { id: "1.41", name: "Level 1.41 - Complex Words", feature: "Longer words with blends", words: ["broom", "snack", "west", "thump", "fresh", "hunt", "speed", "chunk"] },
  { id: "1.42", name: "Level 1.42 - Advanced Blends", feature: "Complex consonant patterns", words: ["slept", "stand", "blend", "stamp", "plant", "drink", "upon", "until"] },
  { id: "1.43", name: "Level 1.43 - 'ay' Sound", feature: "Long a with ay spelling", words: ["day", "play", "say", "way", "stay", "may", "today", "away"] },
  { id: "1.44", name: "Level 1.44 - 'ai' Sound", feature: "Long a with ai spelling", words: ["paint", "rain", "chain", "train", "paid", "wait", "again", "nail"] },
  { id: "1.45", name: "Level 1.45 - Long 'a' Review", feature: "Mixed long a spellings", words: ["tail", "snail", "afraid", "trail", "tray", "delay", "clay", "sway"] },
  { id: "1.46", name: "Level 1.46 - 'all' Family", feature: "all word family", words: ["call", "fall", "all", "stall", "small", "ball", "wall", "tall"] },
  { id: "1.47", name: "Level 1.47 - 'ing' & 'ong'", feature: "ing and ong endings", words: ["king", "swing", "bring", "sing", "thing", "long", "song", "along"] },
  { id: "1.48", name: "Level 1.48 - 'or' Sound", feature: "or spelling patterns", words: ["north", "short", "torch", "storm", "sport", "form", "for", "horse"] },
  { id: "1.49", name: "Level 1.49 - 'ar' Sound", feature: "ar spelling patterns", words: ["start", "hard", "car", "far", "garden", "card", "park", "dark"] },
  { id: "1.50", name: "Level 1.50 - More 'ar'", feature: "Continuing ar patterns", words: ["shark", "star", "chart", "march", "arch", "farm", "smart", "part"] },
  { id: "1.51", name: "Level 1.51 - 'er' Sound", feature: "er spelling patterns", words: ["ever", "under", "never", "number", "her", "river", "sister", "term"] },
  { id: "1.52", name: "Level 1.52 - Mixed R-controlled", feature: "Various r-controlled vowels", words: ["report", "forget", "thorn", "corn", "scarf", "market", "sharp", "alarm"] },
  { id: "1.53", name: "Level 1.53 - Complex R-controlled", feature: "Longer r-controlled words", words: ["carpet", "spark", "charm", "clever", "winter", "jumper", "porch", "pork"] },
  { id: "1.54", name: "Level 1.54 - 'oy' & 'oi'", feature: "oy and oi diphthongs", words: ["boy", "toy", "enjoy", "royal", "oil", "point", "soil", "joint"] },
  { id: "1.55", name: "Level 1.55 - Mixed Vowel Patterns", feature: "Various long vowel patterns", words: ["faint", "grain", "claim", "slay", "pray", "joy", "moist", "join"] },
  { id: "1.56", name: "Level 1.56 - Sight Words A", feature: "High frequency sight words", words: ["a", "I", "is", "as", "his", "has", "was", "the"] },
  { id: "1.57", name: "Level 1.57 - Sight Words B", feature: "More high frequency words", words: ["of", "for", "me", "be", "he", "we", "she", "are"] },
  { id: "1.58", name: "Level 1.58 - Sight Words C", feature: "Common function words", words: ["to", "do", "who", "into", "you", "one", "two", "said"] },
  { id: "1.59", name: "Level 1.59 - Sight Words D", feature: "Essential sight words", words: ["they", "more", "what", "have", "put", "pull", "so", "no", "go"] },

  // LEVEL 2 LISTS
  { id: "2.1", name: "Level 2.1 - Consonant Digraphs", feature: "Advanced consonant combinations", words: ["drink", "thank", "shrink", "thick", "shack", "chick", "quack", "quick", "queen", "quilt"] },
  { id: "2.2", name: "Level 2.2 - Long A Patterns", feature: "Various long a spellings", words: ["away", "stay", "today", "delay", "again", "drain", "waist", "faith", "strain", "paint"] },
  { id: "2.3", name: "Level 2.3 - Diphthongs", feature: "oi, oy, and complex sounds", words: ["point", "spoil", "joint", "moist", "noise", "royal", "loyal", "enjoy", "destroy", "employ"] },
  { id: "2.4", name: "Level 2.4 - R-controlled Vowels", feature: "Advanced r-controlled patterns", words: ["number", "finger", "anger", "clever", "garden", "starch", "farmer", "horse", "forget", "report"] },
  { id: "2.5", name: "Level 2.5 - Compound Words", feature: "Two words joined together", words: ["finished", "chicken", "o'clock", "Sunday", "holiday", "football", "morning", "dragon", "seven", "second"] },
  { id: "2.6", name: "Level 2.6 - Double Consonants", feature: "ll pattern words", words: ["spell", "hill", "fell", "still", "well", "will", "tell", "doll", "thrill", "smell"] },
  { id: "2.7", name: "Level 2.7 - Double S", feature: "ss pattern words", words: ["dress", "miss", "across", "press", "stress", "bless", "chess", "mess", "loss", "fuss"] },
  { id: "2.8", name: "Level 2.8 - Double Final Letters", feature: "ff, zz, dd, gg patterns", words: ["frizz", "buzz", "fuzzy", "off", "whiff", "cliff", "scruff", "sniff", "add", "egg"] },
  { id: "2.9", name: "Level 2.9 - Long O Patterns", feature: "oa pattern for long o", words: ["boat", "road", "coach", "soap", "float", "throat", "coat", "soak", "coast", "roast"] },
  { id: "2.10", name: "Level 2.10 - OW for Long O", feature: "ow pattern for long o", words: ["yellow", "below", "own", "grow", "show", "follow", "window", "snow", "rainbow", "throw"] },
  { id: "2.11", name: "Level 2.11 - EA for Long E", feature: "ea pattern for long e", words: ["sea", "eat", "team", "beach", "read", "real", "tea", "mean", "each", "season"] },
  { id: "2.12", name: "Level 2.12 - Extended EA", feature: "More ea long e patterns", words: ["really", "teacher", "reach", "leaf", "dream", "between", "weekend", "asleep", "sweet", "squeeze"] },
  { id: "2.13", name: "Level 2.13 - Three Letter Blends", feature: "thr, shr, squ blends", words: ["wrong", "thrash", "throb", "thrill", "shred", "shrub", "shrug", "squeak", "squish", "squat"] },
  { id: "2.14", name: "Level 2.14 - Complex Blends", feature: "scr, spl, spr, str blends", words: ["scrub", "splinter", "spring", "strong", "splash", "stream", "street", "spray", "strip", "split"] },
  { id: "2.15", name: "Level 2.15 - Advanced Blends", feature: "Complex three-letter blends", words: ["shrink", "squint", "branch", "crunch", "squelch", "thrust", "shrimp", "scold", "strict", "sprint"] },
  { id: "2.16", name: "Level 2.16 - IND Pattern", feature: "ind word family", words: ["kind", "find", "child", "mild", "wild", "grind", "blind", "behind", "mind", "wind"] },
  { id: "2.17", name: "Level 2.17 - OU Sound", feature: "ou diphthong patterns", words: ["out", "house", "found", "mouse", "around", "our", "sound", "ground", "round", "about"] },
  { id: "2.18", name: "Level 2.18 - OW Sound", feature: "ow diphthong patterns", words: ["brown", "now", "flower", "how", "down", "town", "power", "shower", "owl", "clown"] },
  { id: "2.19", name: "Level 2.19 - Mixed OU/OW", feature: "ou and ow diphthongs", words: ["without", "playground", "south", "shout", "flour", "tower", "frown", "coward", "powder", "crown"] },
  { id: "2.20", name: "Level 2.20 - IR Pattern", feature: "ir r-controlled vowels", words: ["bird", "girl", "first", "birthday", "swirl", "third", "stir", "skirt", "shirt", "dirt"] },
  { id: "2.21", name: "Level 2.21 - UR Pattern", feature: "ur r-controlled vowels", words: ["hurt", "turn", "Saturday", "church", "curl", "nurse", "burst", "return", "purse", "sunburn"] },
  { id: "2.22", name: "Level 2.22 - ER Pattern", feature: "er r-controlled vowels", words: ["yesterday", "person", "versus", "perfect", "lurk", "burn", "turnip", "twirl", "birth", "squirt"] },
  { id: "2.23", name: "Level 2.23 - AW Pattern", feature: "aw sound patterns", words: ["saw", "draw", "straw", "shawl", "prawn", "hawk", "claw", "raw", "jaw", "dawn"] },
  { id: "2.24", name: "Level 2.24 - OR/AW Mix", feature: "or and aw patterns", words: ["torch", "thorn", "order", "short", "north", "yawn", "crawl", "law", "paw", "fawn"] },
  { id: "2.25", name: "Level 2.25 - EW Sound", feature: "ew sound patterns", words: ["new", "threw", "few", "flew", "stew", "drew", "blue", "true", "due", "glue"] },
  { id: "2.26", name: "Level 2.26 - UE/OO Mix", feature: "ue and oo patterns", words: ["cue", "clue", "grew", "chew", "blew", "smooth", "loose", "scoop", "goose", "balloon"] },
  { id: "2.27", name: "Level 2.27 - Silent E Rule", feature: "Magic e changing sounds", words: ["plan", "plane", "hid", "hide", "hop", "hope", "cub", "cube", "pet", "Pete"] },
  { id: "2.28", name: "Level 2.28 - A-E Pattern", feature: "Long a with silent e", words: ["made", "snake", "late", "cake", "take", "game", "same", "came", "gave", "state"] },
  { id: "2.29", name: "Level 2.29 - E-E Pattern", feature: "Long e with silent e", words: ["these", "theme", "eve", "delete", "extreme", "teeth", "need", "seem", "sheet", "cheek"] },
  { id: "2.30", name: "Level 2.30 - I-E Pattern", feature: "Long i with silent e", words: ["ride", "slide", "life", "while", "time", "like", "fire", "white", "inside", "five"] },
  { id: "2.31", name: "Level 2.31 - O-E Pattern", feature: "Long o with silent e", words: ["rode", "broke", "woke", "home", "close", "drove", "those", "rope", "choke", "nose"] },
  { id: "2.32", name: "Level 2.32 - U-E Pattern", feature: "Long u with silent e", words: ["cute", "use", "tune", "dune", "rude", "flute", "June", "prune", "mute", "tube"] },
  { id: "2.33", name: "Level 2.33 - Mixed Silent E", feature: "Various silent e patterns", words: ["make", "ate", "name", "cave", "side", "mile", "bike", "nine", "line", "clothes"] },
  { id: "2.34", name: "Level 2.34 - Longer Words", feature: "Multi-syllable words", words: ["better", "dinner", "letter", "monster", "paper", "sleepover", "together", "different", "icecream", "outside"] },
  { id: "2.35", name: "Level 2.35 - Y as Vowel", feature: "y making long i sound", words: ["by", "my", "try", "fly", "why", "cry", "dry", "sky", "shy", "sly"] },
  { id: "2.36", name: "Level 2.36 - V-E Pattern", feature: "Words ending in ve", words: ["live", "have", "leave", "give", "weave", "active", "nerve", "serve", "sleeve", "captive"] },
  { id: "2.37", name: "Level 2.37 - Y as Long E", feature: "y making long e sound", words: ["puppy", "happy", "funny", "study", "yummy", "story", "body", "twenty", "party", "quickly"] },
  { id: "2.38", name: "Level 2.38 - More Y Endings", feature: "More y as long e", words: ["buddy", "footy", "sunny", "windy", "rocky", "sticky", "sandy", "bumpy", "forty", "messy"] },
  { id: "2.39", name: "Level 2.39 - Silent Letters", feature: "kn- silent k patterns", words: ["know", "knee", "knock", "knew", "knife", "knead", "kneel", "knoll", "knit", "knot"] },
  { id: "2.40", name: "Level 2.40 - Homophones A", feature: "Words that sound alike", words: ["be", "bee", "see", "sea", "been", "bean", "reed", "read", "meet", "meat"] },
  { id: "2.41", name: "Level 2.41 - Homophones B", feature: "More words that sound alike", words: ["plain", "plane", "sale", "sail", "hear", "here", "some", "sum", "one", "won"] },
  { id: "2.42", name: "Level 2.42 - Homophones C", feature: "Common homophones", words: ["two", "to", "too", "by", "buy", "bye", "knew", "new", "know", "no"] },
  { id: "2.43", name: "Level 2.43 - Days of Week", feature: "Days and time words", words: ["Sunday", "Wednesday", "Friday", "Tuesday", "Saturday", "Thursday", "Monday", "yesterday", "holiday", "weekend"] },
  { id: "2.44", name: "Level 2.44 - Common Words A", feature: "High frequency words", words: ["above", "won", "other", "love", "another", "mother", "month", "Mr", "Mrs", "Miss"] },
  { id: "2.45", name: "Level 2.45 - Common Words B", feature: "More high frequency words", words: ["only", "open", "over", "word", "world", "work", "animal", "buy", "OK", "TV"] },
  { id: "2.46", name: "Level 2.46 - Common Words C", feature: "Essential vocabulary", words: ["after", "ask", "father", "last", "want", "watch", "water", "their", "there", "where"] },
  { id: "2.47", name: "Level 2.47 - Common Words D", feature: "Key sight words", words: ["even", "people", "does", "gone", "come", "some", "something", "sometimes", "here", "were"] },

  // LEVEL 3 LISTS
  { id: "3.1", name: "Level 3.1 - I-E & ICE", feature: "Long i patterns and ice endings", words: ["while", "smile", "knife", "plate", "skate", "whale", "lace", "pace", "trace", "mice", "dice", "rice"] },
  { id: "3.2", name: "Level 3.2 - A-E & AGE", feature: "Long a patterns and age endings", words: ["chase", "blaze", "quake", "brave", "cute", "use", "fuse", "page", "cage", "rage", "stage", "huge"] },
  { id: "3.3", name: "Level 3.3 - EA & EE", feature: "Long e spelling patterns", words: ["squeal", "dream", "stream", "screen", "sweet", "agree", "please", "tease", "cheese", "sneeze", "squeeze", "freeze"] },
  { id: "3.4", name: "Level 3.4 - O-E & ARE", feature: "Long o and are patterns", words: ["strode", "alone", "clone", "scope", "quote", "froze", "care", "dare", "hare", "share", "rare", "mare"] },
  { id: "3.5", name: "Level 3.5 - IGH & IND", feature: "igh and ind patterns", words: ["kind", "wild", "find", "blind", "child", "grind", "high", "light", "night", "slight", "tight", "flight"] },
  { id: "3.6", name: "Level 3.6 - Y & IGH", feature: "y as long i and igh patterns", words: ["sty", "sly", "spy", "shy", "ply", "pry", "might", "fight", "right", "sight", "thigh", "slight"] },
  { id: "3.7", name: "Level 3.7 - AW & OAR", feature: "aw and oar sound patterns", words: ["draw", "crawl", "straw", "dawn", "lawn", "claw", "coarse", "soar", "roar", "boar", "oar", "board"] },
  { id: "3.8", name: "Level 3.8 - OU & EAR", feature: "ou and ear sound patterns", words: ["proud", "amount", "shout", "crowd", "tower", "scowl", "fear", "smear", "clear", "spear", "tear", "beard"] },
  { id: "3.9", name: "Level 3.9 - UE & OO", feature: "ue and oo sound patterns", words: ["hue", "clue", "due", "brew", "screw", "crew", "cocoon", "scooter", "cartoon", "stoop", "boost", "proof"] },
  { id: "3.10", name: "Level 3.10 - IVE & TCH", feature: "ive endings and tch patterns", words: ["captive", "swerve", "forgive", "festive", "weave", "active", "clutch", "batch", "ditch", "patch", "latch", "hutch"] },
  { id: "3.11", name: "Level 3.11 - OA & OST", feature: "oa patterns and ost endings", words: ["throat", "boast", "float", "coast", "groan", "toast", "both", "don't", "most", "host", "post", "gross"] },
  { id: "3.12", name: "Level 3.12 - Silent Letters", feature: "kn and mb silent letters", words: ["know", "knew", "knock", "knead", "knife", "kneel", "comb", "limb", "crumb", "lamb", "thumb", "numb"] },
  { id: "3.13", name: "Level 3.13 - IR/UR/ER", feature: "r-controlled vowel patterns", words: ["squirt", "thirsty", "dirty", "thirteen", "burnt", "return", "burden", "burger", "perfect", "transfer", "understand", "western"] },
  { id: "3.14", name: "Level 3.14 - Double Letters", feature: "Double consonant patterns", words: ["yellow", "follow", "pillow", "shallow", "arrow", "hollow", "nanny", "funny", "annoy", "mammal", "cotton", "paddock"] },
  { id: "3.15", name: "Level 3.15 - ER Endings", feature: "er ending patterns", words: ["paper", "teacher", "longer", "winter", "jumper", "temper", "actor", "razor", "mirror", "error", "sailor", "tremor"] },
  { id: "3.16", name: "Level 3.16 - Y Endings", feature: "y ending patterns", words: ["memory", "empty", "angry", "candy", "plenty", "silly", "honey", "kidney", "abbey", "jockey", "trolley", "barley"] },
  { id: "3.17", name: "Level 3.17 - ACE & ICE", feature: "ace and ice ending patterns", words: ["face", "place", "race", "space", "trace", "brace", "grace", "nice", "mice", "rice", "slice", "spice"] },
  { id: "3.18", name: "Level 3.18 - NCE Endings", feature: "nce ending patterns", words: ["twice", "prince", "dance", "peace", "since", "price", "ice-cream", "disgrace", "replace", "embrace", "necklace", "advice"] },
  { id: "3.19", name: "Level 3.19 - SE Endings", feature: "se ending patterns", words: ["horse", "house", "mouse", "goose", "loose", "nurse", "rinse", "grease", "curse", "please", "cheese", "praise"] },
  { id: "3.20", name: "Level 3.20 - ZE Endings", feature: "ze ending patterns", words: ["sneeze", "squeeze", "freeze", "snooze", "breeze", "noise", "tease", "browse", "raise", "choose", "present", "surprise"] },
  { id: "3.21", name: "Level 3.21 - GE Endings", feature: "ge ending patterns", words: ["large", "change", "page", "orange", "stage", "huge", "hinge", "tinge", "plunge", "cage", "rage", "cringe"] },
  { id: "3.22", name: "Level 3.22 - DGE Endings", feature: "dge ending patterns", words: ["bridge", "edge", "pledge", "hedge", "wedge", "judge", "trudge", "dodge", "lodge", "nudge", "ledge", "porridge"] },
  { id: "3.23", name: "Level 3.23 - More DGE", feature: "More dge ending patterns", words: ["fridge", "grudge", "smudge", "fudge", "ridge", "badge", "badger", "budget", "fidget", "gadget", "ledger", "midget"] },
  { id: "3.24", name: "Level 3.24 - IGHT Words", feature: "ight pattern words", words: ["twilight", "highway", "lightning", "frighten", "mighty", "brightest", "tighter", "slightest", "higher", "alright", "delight", "midnight"] },
  { id: "3.25", name: "Level 3.25 - AIR Patterns", feature: "air sound patterns", words: ["bear", "wear", "tear", "pear", "hair", "air", "pair", "chair", "square", "spare", "glare", "stare"] },
  { id: "3.26", name: "Level 3.26 - Extended AIR", feature: "More air sound patterns", words: ["wearing", "fairy", "airport", "repair", "upstairs", "dairy", "parent", "scared", "scary", "careless", "aware", "compare"] },
  { id: "3.27", name: "Level 3.27 - ORE Patterns", feature: "ore sound patterns", words: ["more", "sore", "score", "shore", "store", "chore", "before", "forecast", "adore", "explore", "restore", "ignore"] },
  { id: "3.28", name: "Level 3.28 - OOR & OUR", feature: "oor and our sound patterns", words: ["soar", "hoarse", "hoard", "coarse", "cupboard", "door", "floor", "poor", "four", "your", "court", "pour"] },
  { id: "3.29", name: "Level 3.29 - TCH Patterns", feature: "tch ending patterns", words: ["match", "witch", "catch", "snatch", "sketch", "stitch", "scratch", "stretch", "switch", "hitch", "fetch", "hatch"] },
  { id: "3.30", name: "Level 3.30 - Extended TCH", feature: "More tch patterns", words: ["bewitch", "itchy", "sketchpad", "rematch", "patching", "satchel", "catchy", "stitching", "splotchy", "kitchen", "hatchet", "butcher"] },
  { id: "3.31", name: "Level 3.31 - EAR Patterns", feature: "ear sound patterns", words: ["hear", "year", "near", "dear", "shear", "clear", "jeer", "steer", "peer", "deer", "cheer", "veer"] },
  { id: "3.32", name: "Level 3.32 - Extended EAR", feature: "More ear sound patterns", words: ["appear", "nearly", "fearful", "endear", "weary", "earwig", "clearly", "peering", "cheery", "career", "pioneer", "engineer"] },
  { id: "3.33", name: "Level 3.33 - OU & UI", feature: "ou and ui sound patterns", words: ["group", "toucan", "soup", "coupon", "wound", "youth", "fruit", "juice", "bruise", "suitcase", "cruise", "recruit"] },
  { id: "3.34", name: "Level 3.34 - Silent Letters B", feature: "Silent b and t patterns", words: ["climbed", "thumb", "lamb", "crumb", "limb", "numb", "comb", "dumb", "plumber", "debt", "doubt", "subtle"] },
  { id: "3.35", name: "Level 3.35 - ALK & OST", feature: "alk and ost patterns", words: ["walk", "talk", "walking", "stalk", "chalk", "balk", "both", "don't", "most", "post", "gross", "host"] },
  { id: "3.36", name: "Level 3.36 - WH & ANY", feature: "wh patterns and any words", words: ["whole", "who", "whose", "whom", "anyhow", "many", "anything", "anyone", "anywhere", "anytime", "anymore", "anybody"] },
  { id: "3.37", name: "Level 3.37 - OULD & OVE", feature: "ould and ove patterns", words: ["could", "should", "would", "couldn't", "move", "lose", "prove", "reprove", "movement", "disprove", "approve", "remove"] },
  { id: "3.38", name: "Level 3.38 - EA Short", feature: "ea making short e sound", words: ["head", "dead", "breakfast", "breath", "already", "leather", "healthy", "heavy", "instead", "feather", "weather", "threaten"] },
  { id: "3.39", name: "Level 3.39 - LE Endings", feature: "le ending patterns", words: ["jungle", "uncle", "grumble", "crumble", "candle", "handle", "eagle", "sparkle", "simple", "beetle", "needle", "twinkle"] },
  { id: "3.40", name: "Level 3.40 - More LE", feature: "More le ending patterns", words: ["angle", "tremble", "crumple", "stifle", "chuckle", "bundle", "purple", "edible", "ample", "tumble", "sample", "tickle"] },
  { id: "3.41", name: "Level 3.41 - Double + LE", feature: "Double letters with le", words: ["apples", "little", "wiggle", "battle", "paddle", "rattle", "gobble", "smuggle", "topple", "fiddle", "drizzle", "ripple"] },
  { id: "3.42", name: "Level 3.42 - More Double LE", feature: "More double letters with le", words: ["pebble", "cattle", "bubble", "puddle", "sniffle", "scribble", "huddle", "bottle", "settle", "puzzle", "snuggle", "struggle"] },
  { id: "3.43", name: "Level 3.43 - Multi-syllable", feature: "Longer multi-syllable words", words: ["happened", "lollies", "rabbit", "soccer", "suddenly", "summer", "butterfly", "letter", "better", "different", "paddock", "sluggish"] },
  { id: "3.44", name: "Level 3.44 - Double Consonants", feature: "Words with double consonants", words: ["ladder", "cubby", "ribbon", "stagger", "nugget", "tunnel", "sunny", "common", "hammer", "support", "puppet", "occur"] },
  { id: "3.45", name: "Level 3.45 - TION Endings", feature: "tion ending patterns", words: ["function", "lotion", "pollution", "fiction", "action", "devotion", "fraction", "mention", "section", "emotion", "option", "solution"] },
  { id: "3.46", name: "Level 3.46 - PH Patterns", feature: "ph making f sound", words: ["elephant", "alphabet", "photo", "orphan", "nephew", "telephone", "dolphin", "phase", "triumph", "typhoon", "sphere", "emphasis"] },
  { id: "3.47", name: "Level 3.47 - Long Vowels", feature: "Various long vowel patterns", words: ["table", "basic", "label", "paper", "apron", "basin", "major", "vacant", "bacon", "native", "danger", "chamber"] },
  { id: "3.48", name: "Level 3.48 - BE- Prefix", feature: "Words beginning with be-", words: ["begin", "began", "before", "below", "being", "became", "behind", "between", "beside", "beyond", "beware", "belong"] },
  { id: "3.49", name: "Level 3.49 - EY Endings", feature: "ey ending patterns", words: ["money", "monkey", "key", "donkey", "joey", "valley", "hockey", "alley", "turkey", "parsley", "pulley", "chimney"] },
  { id: "3.50", name: "Level 3.50 - Y Endings Mixed", feature: "Various y ending patterns", words: ["very", "baby", "family", "carry", "every", "everyone", "everything", "lady", "gravy", "duty", "tidy", "tiny"] },
  { id: "3.51", name: "Level 3.51 - OR Endings", feature: "or ending patterns", words: ["doctor", "motorbike", "equator", "creator", "instructor", "tractor", "editor", "visitor", "spectator", "sponsor", "monitor", "terror"] },
  { id: "3.52", name: "Level 3.52 - AL Patterns", feature: "al sound patterns", words: ["almost", "also", "always", "water", "already", "install", "walnut", "bald", "almighty", "enthral", "appal", "palsy"] },
  { id: "3.53", name: "Level 3.53 - WAR Patterns", feature: "war sound patterns", words: ["dwarf", "swarming", "warmest", "warty", "warmup", "warning", "award", "quarter", "reward", "towards", "wardrobe", "warble"] },
  { id: "3.54", name: "Level 3.54 - Complex Words", feature: "Advanced vocabulary", words: ["Indian", "idea", "children", "quickly", "equal", "require", "request", "liquid", "dessert", "scissors", "dissolve", "possess"] },
  { id: "3.55", name: "Level 3.55 - EY & EI", feature: "ey and ei patterns", words: ["grey", "obey", "survey", "prey", "convey", "great", "break", "steak", "greatest", "straight", "eight", "eighty"] },
  { id: "3.56", name: "Level 3.56 - Mixed Patterns", feature: "Various spelling patterns", words: ["aunty", "laughed", "city", "excited", "princess", "sentence", "earth", "heard", "learn", "because", "caught", "dinosaur"] },
  { id: "3.57", name: "Level 3.57 - Tricky Words", feature: "Irregular spelling patterns", words: ["ghost", "hour", "autumn", "castle", "often", "guys", "answer", "write", "school", "friend", "beautiful", "pizza"] },
  { id: "3.58", name: "Level 3.58 - Complex Patterns", feature: "Advanced irregular patterns", words: ["through", "enough", "young", "country", "cousin", "bought", "brought", "though", "computer", "decided", "example", "important"] },
  { id: "3.59", name: "Level 3.59 - High Frequency", feature: "Common complex words", words: ["giant", "magic", "afternoon", "basketball", "class", "fast", "colour", "favourite", "field", "movie", "brother", "front"] },
  { id: "3.60", name: "Level 3.60 - Advanced Words", feature: "Complex vocabulary", words: ["mountain", "restaurant", "special", "heart", "police", "lion", "trampoline", "picture", "music", "minute", "once", "eye"] },
  { id: "3.61", name: "Level 3.61 - Homophones Mix A", feature: "Words that sound the same", words: ["for", "four", "fore", "knot", "not", "which", "witch", "weak", "week", "saw", "sore", "soar"] },
  { id: "3.62", name: "Level 3.62 - Homophones Mix B", feature: "More homophones", words: ["so", "sew", "road", "rode", "rowed", "there", "their", "they're", "bear", "bare", "hair", "hare"] },
  { id: "3.63", name: "Level 3.63 - Homophones Mix C", feature: "Common homophones", words: ["hour", "our", "flower", "flour", "threw", "through", "blew", "blue", "heard", "herd", "would", "wood"] },
  { id: "3.64", name: "Level 3.64 - Homophones Mix D", feature: "Tricky homophones", words: ["write", "right", "knight", "night", "steak", "stake", "break", "brake", "made", "maid", "read", "red"] },
  { id: "3.65", name: "Level 3.65 - Contractions", feature: "Shortened word forms", words: ["don't", "didn't", "can't", "wasn't", "couldn't", "I'll", "he's", "I've", "let's", "we're", "it's", "there's"] },

  // LEVEL 4 LISTS (from document)
  { id: "4.1", name: "Level 4.1 - Soft C", feature: "c making s sound in city, circle", words: ["once", "sentence", "pounce", "palace", "chance", "silence", "city", "circle", "cement", "circus", "fancy", "cellar"] },
  { id: "4.2", name: "Level 4.2 - Silent Letters", feature: "Silent letters in doubt, write, thumb", words: ["doubt", "debt", "plumber", "climbed", "thumb", "lamb", "write", "wrong", "wrist", "wrap", "wrench", "wrote"] },
  { id: "4.3", name: "Level 4.3 - PH & WA", feature: "ph digraph and wa patterns", words: ["phone", "trophy", "graph", "graphic", "watch", "waft", "squat", "quad", "wash", "swap", "swan", "wand"] },
  { id: "4.4", name: "Level 4.4 - Complex Patterns", feature: "Advanced multi-syllable words", words: ["vegetable", "engine", "energy", "gentle", "fragile", "giraffe", "generate", "urgently", "tragic", "legend", "intelligent", "exaggerate"] },
  { id: "4.5", name: "Level 4.5 - U Patterns", feature: "Various u sound patterns", words: ["brutal", "exclusive", "superman", "elusive", "fluent", "fluid", "superb", "crusade", "futon", "ruby", "frugal", "lunar"] },
  { id: "4.6", name: "Level 4.6 - AUGH & AU", feature: "augh and au sound patterns", words: ["laughter", "laughed", "aunty", "sauce", "cause", "pause", "applause", "author", "August", "saucepan", "automatic", "dinosaur"] },
  { id: "4.7", name: "Level 4.7 - SION Endings", feature: "sion ending patterns", words: ["pension", "oppression", "session", "obsession", "progression", "procession", "regression", "expression", "aggression", "impression", "comprehension", "discussion"] },
  { id: "4.8", name: "Level 4.8 - TURE Endings", feature: "ture ending patterns", words: ["picture", "adventure", "rupture", "moisture", "capture", "departure", "agriculture", "culture", "fracture", "texture", "nurture", "feature"] },
  { id: "4.9", name: "Level 4.9 - EL Endings", feature: "el ending patterns", words: ["scoundrel", "counsel", "parallel", "quarrel", "compel", "sequel", "grovel", "apparel", "cancel", "marvel", "swivel", "propel"] },
  { id: "4.10", name: "Level 4.10 - AU Patterns", feature: "au and aw sound patterns", words: ["because", "Australia", "assault", "cauliflower", "hydraulic", "auction", "caustic", "fault", "default", "sausage", "vault", "somersault"] },
  { id: "4.11", name: "Level 4.11 - WR & Consonant Clusters", feature: "wr beginnings and complex blends", words: ["wring", "wreath", "writhing", "wriggle", "wrapper", "wrestle", "written", "wrinkle", "wreckage", "sword", "answer", "swordfish"] },
  { id: "4.12", name: "Level 4.12 - UN- Prefix", feature: "un- prefix patterns", words: ["unsuitable", "unusual", "unselfish", "unstable", "unfortunate", "undecided", "unoccupied", "undesirable", "unpleasant", "uncertain", "unpopular", "unequal"] },
  { id: "4.13", name: "Level 4.13 - OR Agent Endings", feature: "or suffix for people who do things", words: ["editor", "instigator", "competitor", "instructor", "successor", "predecessor", "collector", "debtor", "processor", "inspector", "supervisor", "exhibitor"] },
  { id: "4.14", name: "Level 4.14 - Homophones Advanced", feature: "Advanced homophones", words: ["become", "outcome", "someday", "welcome", "flood", "blood", "wolf", "woman", "scone", "shone", "bygone", "knowledge"] },
  { id: "4.15", name: "Level 4.15 - More Homophones", feature: "Complex homophones", words: ["boarder", "border", "lessen", "lesson", "prey", "pray", "scene", "seen", "chews", "choose", "hoarse", "horse"] },
  { id: "4.16", name: "Level 4.16 - G Patterns", feature: "Hard and soft g sounds", words: ["large", "strange", "arrange", "garage", "cabbage", "magic", "giant", "gems", "gents", "edgy", "germ", "logic"] },
  { id: "4.17", name: "Level 4.17 - OULD Patterns", feature: "ould letter patterns", words: ["could", "should", "would", "pull", "put", "push", "bush", "full", "sugar", "bull", "pulley", "bulldog"] },
  { id: "4.18", name: "Level 4.18 - LE Endings", feature: "le ending syllables", words: ["single", "ankle", "middle", "stable", "trifle", "baffle", "funnel", "channel", "camel", "parcel", "chapel", "kennel"] },
  { id: "4.19", name: "Level 4.19 - CH Patterns", feature: "ch making different sounds", words: ["school", "stomach", "character", "chemistry", "mechanic", "orchid", "headache", "chemist", "echo", "scholarship", "chorus", "zucchini"] },
  { id: "4.20", name: "Level 4.20 - Y Patterns", feature: "y making different sounds", words: ["mystery", "Egypt", "symbol", "typical", "syllable", "pyramid", "tricycle", "lyrics", "crystal", "physics", "gym", "symmetry"] },
  { id: "4.21", name: "Level 4.21 - AUGHT Patterns", feature: "aught sound combinations", words: ["daughter", "caught", "naughty", "distraught", "onslaught", "haughty", "bought", "brought", "thought", "wrought", "thoughtful", "sought"] },
  { id: "4.22", name: "Level 4.22 - TION Advanced", feature: "Advanced tion patterns", words: ["protection", "destruction", "consideration", "elimination", "separation", "invention", "extension", "suspension", "expansion", "apprehension", "tension", "controversial"] },
  { id: "4.23", name: "Level 4.23 - TURE Advanced", feature: "Advanced ture patterns", words: ["venture", "mixture", "structure", "puncture", "lecture", "future", "creature", "measure", "pleasure", "treasure", "composure", "enclosure"] },
  { id: "4.24", name: "Level 4.24 - IL Endings", feature: "il ending patterns", words: ["civil", "utensil", "pupil", "pencil", "peril", "stencil", "April", "evil", "damsel", "hazel", "vessel", "satchel"] },
  { id: "4.25", name: "Level 4.25 - SC Patterns", feature: "sc letter combinations", words: ["scene", "ascend", "fascinate", "scent", "science", "scenery", "ascent", "descend", "muscle", "scissors", "fluorescent", "crescent"] },
  { id: "4.26", name: "Level 4.26 - COM- Prefix", feature: "com- prefix patterns", words: ["compose", "compare", "compress", "community", "complicate", "compact", "comfort", "combination", "complement", "compile", "comparison", "commend"] },
  { id: "4.27", name: "Level 4.27 - FUL Suffix", feature: "ful suffix patterns", words: ["blissful", "careful", "wilful", "cheerful", "awful", "wonderful", "beautiful", "hopeful", "dreadful", "resentful", "thoughtful", "doubtful"] },
  { id: "4.28", name: "Level 4.28 - Balloon & Complex", feature: "Double letters and complex words", words: ["balloon", "attach", "appeal", "blossom", "appear", "approach", "umbrella", "casserole", "satellite", "suppress", "attractive", "appoint"] },
  { id: "4.29", name: "Level 4.29 - U-E & Gluten", feature: "u-e patterns and complex u sounds", words: ["used", "amuse", "value", "excuse", "rescue", "refuse", "flu", "truth", "scuba", "hula", "super", "gluten"] },
  { id: "4.30", name: "Level 4.30 - Complex Sports", feature: "Sports and activity words", words: ["basketball", "asked", "father", "after", "afternoon", "master", "nasty", "basket", "telecast", "faster", "glasses", "pathway"] },
  { id: "4.31", name: "Level 4.31 - WOR Patterns", feature: "wor sound patterns", words: ["wonderful", "comfort", "lovely", "become", "dozen", "smother", "welcome", "cover", "someone", "above", "mother", "another"] },
  { id: "4.32", name: "Level 4.32 - AGE Endings", feature: "age ending patterns", words: ["bandage", "vintage", "village", "advantage", "shortage", "damage", "image", "manage", "cottage", "garbage", "package", "passage"] },
  { id: "4.33", name: "Level 4.33 - SION Complex", feature: "Complex sion endings", words: ["confusion", "incision", "erosion", "invasion", "adhesion", "occasion", "explosion", "conclusion", "exclusion", "vision", "provision", "precision"] },
  { id: "4.34", name: "Level 4.34 - AIN Patterns", feature: "ain sound patterns", words: ["certain", "captain", "bargain", "fountain", "chaplain", "villain", "mountain", "uncertain", "curtain", "Great Britain", "certainly", "bargains"] },
  { id: "4.35", name: "Level 4.35 - EI Patterns", feature: "ei sound patterns", words: ["eight", "weight", "freight", "sleigh", "eighty", "eighteen", "neighbour", "reign", "beige", "vein", "veil", "reindeer"] },
  { id: "4.36", name: "Level 4.36 - OUGH Patterns", feature: "ough sound variations", words: ["coughing", "trough", "throughout", "though", "although", "doughnut", "rough", "toughest", "enough", "young", "thorough", "thoroughly"] },
  { id: "4.37", name: "Level 4.37 - ALM Patterns", feature: "alm and alf patterns", words: ["calm", "qualm", "balm", "palm", "half", "behalf", "calfskin", "embalm", "almond", "yolk", "folklore", "yolky"] },
  { id: "4.38", name: "Level 4.38 - Twilight & IGH", feature: "igh in longer words", words: ["twilight", "delight", "alright", "mighty", "type", "reply", "deny", "lying", "nylon", "satisfy", "supply", "multiply"] },
  { id: "4.39", name: "Level 4.39 - IE Patterns", feature: "ie sound patterns", words: ["became", "behave", "behold", "bedazzle", "beneath", "begun", "field", "brief", "chief", "shield", "piece", "grief"] },
  { id: "4.40", name: "Level 4.40 - WA Complex", feature: "wa in complex words", words: ["watched", "wanted", "watching", "wattle", "squabble", "quantity", "quality", "waffle", "wallet", "swamped", "wander", "squadron"] },
  { id: "4.41", name: "Level 4.41 - WOR Complex", feature: "wor in complex patterns", words: ["word", "world", "work", "worst", "worse", "worm", "workman", "worship", "worthy", "workshop", "workout", "worsen"] },
  { id: "4.42", name: "Level 4.42 - AGE Complex", feature: "age in complex words", words: ["sabotage", "camouflage", "prestige", "barrage", "rouge", "tinge", "dressage", "mirage", "extinct", "instinct", "distinct", "defunct"] },
  { id: "4.43", name: "Level 4.43 - CIAN Endings", feature: "cian ending patterns", words: ["dietician", "precious", "politician", "musician", "technician", "especially", "electrician", "physician", "ancient", "magician", "beautician", "optician"] },
  { id: "4.44", name: "Level 4.44 - INE Endings", feature: "ine ending patterns", words: ["trampoline", "magazine", "machine", "quarantine", "vaccine", "margarine", "routine", "submarine", "ravine", "marine", "sardine", "tangerine"] },
  { id: "4.45", name: "Level 4.45 - IE & EI", feature: "ie and ei patterns", words: ["movie", "belief", "relief", "retrieve", "believe", "achieve", "receive", "deceive", "perceive", "conceit", "neither", "seize"] },
  { id: "4.46", name: "Level 4.46 - URE Patterns", feature: "ure sound patterns", words: ["pure", "cure", "secure", "ensure", "manure", "impure", "endure", "urine", "curious", "during", "tour", "tourist"] },
  { id: "4.47", name: "Level 4.47 - TLE Patterns", feature: "tle ending patterns", words: ["castle", "listen", "glisten", "nestle", "wrestle", "hasten", "whistle", "unfasten", "thistle", "moisten", "soften", "often"] },
  { id: "4.48", name: "Level 4.48 - A- Prefix", feature: "a- prefix patterns", words: ["afloat", "alone", "ablaze", "ashore", "aside", "aloft", "astray", "abandon", "abroad", "ahead", "ashamed", "abide"] },
  { id: "4.49", name: "Level 4.49 - ER Agent", feature: "er endings for people", words: ["producer", "extinguisher", "observer", "caretaker", "announcer", "adviser", "consider", "trespasser", "designer", "invader", "cylinder", "foreigner"] },
  { id: "4.50", name: "Level 4.50 - IVE Adjectives", feature: "ive ending adjectives", words: ["attractive", "native", "extensive", "sensitive", "imaginative", "detective", "aggressive", "cursive", "elective", "adhesive", "assistive", "cognitive"] },
  { id: "4.51", name: "Level 4.51 - AL Complex", feature: "al patterns in complex words", words: ["water", "almost", "always", "install", "enthral", "walnut", "ask", "last", "fast", "class", "past", "bath"] },
  { id: "4.52", name: "Level 4.52 - Princess & Excitement", feature: "Complex everyday words", words: ["princess", "excited", "juicy", "incentive", "deceptive", "recent", "pencil", "except", "concert", "century", "parcel", "bicycle"] },
  { id: "4.53", name: "Level 4.53 - SURE Patterns", feature: "sure sound patterns", words: ["sugar", "pressure", "sure", "asphalt", "issue", "capsule", "insurance", "censure", "fissure", "surely", "tissue", "sugary"] },
  { id: "4.54", name: "Level 4.54 - EAR Complex", feature: "ear sound in complex words", words: ["earth", "learn", "learnt", "heard", "search", "yearn", "earthworm", "research", "rehearse", "rehearsal", "earnest", "early"] },
  { id: "4.55", name: "Level 4.55 - TION Complex", feature: "tion in complex words", words: ["infection", "direction", "sensation", "examination", "attention", "creation", "competition", "destination", "inspection", "isolation", "reaction", "rejection"] },
  { id: "4.56", name: "Level 4.56 - OUR Patterns", feature: "our ending patterns", words: ["favourite", "colour", "flavour", "candour", "labour", "rigour", "neighbour", "harbour", "humour", "endeavour", "splendour", "honour"] },
  { id: "4.57", name: "Level 4.57 - AL Adjectives", feature: "al ending adjectives", words: ["rural", "loyal", "final", "technical", "equal", "hospital", "total", "spiral", "several", "general", "festival", "electrical"] },
  { id: "4.58", name: "Level 4.58 - Complex Patterns", feature: "Advanced spelling patterns", words: ["embarrassed", "arrange", "surround", "correspond", "quarrel", "barricade", "arrival", "territory", "current", "burrow", "hurricane", "errands"] },
  { id: "4.59", name: "Level 4.59 - GU Patterns", feature: "gu letter combinations", words: ["guiding", "vaguely", "beguile", "disguise", "guarantee", "guilty", "guarded", "guessing", "guitar", "builder", "biscuit", "build"] },
  { id: "4.60", name: "Level 4.60 - MICRO Prefix", feature: "micro- prefix patterns", words: ["microscope", "microphone", "microscopic", "micron", "microbe", "microorganism", "microclimate", "microfilm", "microchip", "microwave", "microgroove", "microfauna"] },
  { id: "4.61", name: "Level 4.61 - EER Patterns", feature: "eer ending patterns", words: ["reporter", "butcher", "carpenter", "plumber", "engineer", "mountaineer", "volunteer", "auctioneer", "mutineer", "musketeer", "cashier", "soldier"] },
  { id: "4.62", name: "Level 4.62 - LESS Suffix", feature: "less suffix patterns", words: ["harmless", "priceless", "pointless", "penniless", "reckless", "merciless", "careless", "worthless", "helpless", "lifeless", "restless", "speechless"] },
  { id: "4.63", name: "Level 4.63 - IST Endings", feature: "ist ending patterns", words: ["artist", "dentist", "pianist", "scientist", "feminist", "pessimist", "soloist", "optimist", "journalist", "machinist", "cyclist", "biologist"] },
  { id: "4.64", name: "Level 4.64 - OUS Endings", feature: "ous ending patterns", words: ["famous", "marvellous", "disastrous", "mischievous", "dangerous", "tremendous", "adventurous", "enormous", "humourous", "fabulous", "nervous", "ravenous"] },
  { id: "4.65", name: "Level 4.65 - Complex Words", feature: "Advanced vocabulary", words: ["marriage", "carriage", "bream", "sieve", "tortoise", "porpoise", "women", "leopard", "jeopardy", "friend", "leisure", "bury"] }
];

// ===============================================
// EXPANDED SPELLING ACTIVITIES WITH INSTRUCTIONS
// ===============================================
const ACTIVITIES = [
  { 
    id: "look_cover_write", 
    name: "Look, Cover, Write, Check", 
    icon: "👀", 
    color: "bg-blue-500",
    instructions: "1. LOOK at the word carefully\n2. COVER the word with your hand\n3. WRITE the word from memory\n4. CHECK by uncovering and comparing\n5. If wrong, repeat the process\n\nThis classic method helps build visual memory of spelling patterns."
  },
  { 
    id: "rainbow_words", 
    name: "Rainbow Words", 
    icon: "🌈", 
    color: "bg-purple-500",
    instructions: "1. Write each spelling word in different colors\n2. Use a different color for each letter, or\n3. Use different colors for different letter patterns\n4. Make your words look like rainbows!\n\nThis activity helps students notice letter patterns and makes spelling fun and colorful."
  },
  { 
    id: "silly_sentences", 
    name: "Silly Sentences", 
    icon: "😄", 
    color: "bg-green-500",
    instructions: "1. Use each spelling word in a funny sentence\n2. Make the sentences as silly as possible\n3. Draw pictures to go with your silly sentences\n4. Share your funniest sentences with the class\n\nExample: 'The purple elephant could spell every word backwards while dancing!'"
  },
  { 
    id: "word_sorting", 
    name: "Word Sorting", 
    icon: "📊", 
    color: "bg-orange-500",
    instructions: "1. Look at all your spelling words\n2. Sort them into groups by:\n   • Number of letters\n   • Spelling patterns\n   • Word endings\n   • Vowel sounds\n3. Explain why you grouped them together\n4. Try sorting the same words in a different way"
  },
  { 
    id: "spelling_pyramid", 
    name: "Spelling Pyramid", 
    icon: "🔺", 
    color: "bg-red-500",
    instructions: "Build a pyramid for each word:\n\nFor the word 'SPELL':\nS\nSP\nSPE\nSPEL\nSPELL\n\nWrite each word as a pyramid, adding one letter at a time. This helps students see how words are built letter by letter."
  },
  { 
    id: "trace_write", 
    name: "Trace & Write", 
    icon: "✏️", 
    color: "bg-indigo-500",
    instructions: "1. Trace over each spelling word 3 times\n2. Write the word 3 times without tracing\n3. Say each letter as you write it\n4. Use your finger to 'write' the word in the air\n\nThis builds muscle memory for correct spelling patterns."
  },
  {
    id: "word_shapes",
    name: "Word Shapes",
    icon: "📐",
    color: "bg-pink-500",
    instructions: "1. Draw a box around each word\n2. Notice the shape made by tall letters (like b, d, h)\n3. Notice letters that go below the line (like g, j, p)\n4. Draw the 'shape' of each word without the letters\n5. Can you recognize words just by their shapes?"
  },
  {
    id: "backwards_spelling",
    name: "Backwards Spelling",
    icon: "🔄",
    color: "bg-cyan-500",
    instructions: "1. Say each spelling word backwards\n2. Write each word backwards\n3. Can you read the backwards words?\n4. Practice spelling the words forwards and backwards\n\nExample: 'HOUSE' becomes 'ESUOH'\nThis challenges students to really know their letters!"
  },
  {
    id: "word_hunt",
    name: "Word Hunt",
    icon: "🔍",
    color: "bg-emerald-500",
    instructions: "1. Find your spelling words hidden around the classroom\n2. Look for them in books, on posters, or labels\n3. When you find a word, write down where you found it\n4. Try to find each word in 3 different places\n5. Which words were easiest/hardest to find?"
  },
  {
    id: "syllable_clap",
    name: "Syllable Clapping",
    icon: "👏",
    color: "bg-amber-500",
    instructions: "1. Say each spelling word slowly\n2. Clap for each syllable (word part)\n3. Write the word with a dot between syllables\n4. Sort words by number of syllables\n\nExample: 'BUT•TER•FLY' (3 claps)\nHelps students break words into manageable parts."
  },
  {
    id: "rhyme_time",
    name: "Rhyme Time",
    icon: "🎵",
    color: "bg-violet-500",
    instructions: "1. Find words that rhyme with your spelling words\n2. Make up short poems using your spelling words\n3. Create rap songs or chants with the words\n4. Perform your rhymes for the class\n\nExample: 'The CAT sat on a MAT and wore a HAT!'"
  },
  {
    id: "word_detectives",
    name: "Word Detectives",
    icon: "🕵️",
    color: "bg-slate-500",
    instructions: "1. Investigate each spelling word like a detective\n2. Find clues about the word:\n   • How many vowels?\n   • Any double letters?\n   • What does it rhyme with?\n   • Where might you see this word?\n3. Make a 'case file' for each word\n4. Present your findings!"
  },
  {
    id: "memory_palace",
    name: "Memory Palace",
    icon: "🏰",
    color: "bg-rose-500",
    instructions: "1. Choose a familiar place (your bedroom, kitchen)\n2. 'Place' each spelling word in different spots\n3. Create a story connecting the word to that location\n4. Take a mental walk through your space\n5. Can you remember all the words by visiting each spot?\n\nExample: Place 'LAUGH' by your pillow where you have funny dreams!"
  },
  {
    id: "air_writing",
    name: "Air Writing",
    icon: "✈️",
    color: "bg-teal-500",
    instructions: "1. Use your finger to write spelling words in the air\n2. Make the letters BIG with your whole arm\n3. Have a partner guess which word you're writing\n4. Try writing with your opposite hand\n5. Write words with your foot!\n\nThis helps your body remember how to form letters."
  },
  {
    id: "word_art",
    name: "Word Art",
    icon: "🎨",
    color: "bg-lime-500",
    instructions: "1. Turn each spelling word into art\n2. Make the letters look like what the word means\n3. Use bubble letters, fancy fonts, or decorations\n4. Add pictures that show the word's meaning\n5. Create a word art gallery!\n\nExample: Make 'FIRE' look like flames, 'ICE' look frozen!"
  }
];

// ===============================================
// READING + FLUENCY DATA
// ===============================================
export const READING_PASSAGES = [
  ...LEVEL_1_PASSAGES,
  ...LEVEL_2_PASSAGES_1,
  ...LEVEL_2_PASSAGES_2,
  ...LEVEL_2_PASSAGES_3,
  ...LEVEL_2_PASSAGES_4,
  ...LEVEL_2_PASSAGES_5,
  ...LEVEL_2_PASSAGES_6,
  ...LEVEL_2_PASSAGES_7,
  ...LEVEL_2_PASSAGES_8,
  ...LEVEL_2_PASSAGES_9,
  ...LEVEL_2_PASSAGES_10,
  ...LEVEL_3_PASSAGES_1,
  ...LEVEL_3_PASSAGES_2,
  ...LEVEL_3_PASSAGES_3,
  ...LEVEL_3_PASSAGES_4,
  ...LEVEL_3_PASSAGES_5,
  ...LEVEL_3_PASSAGES_6,
  ...LEVEL_3_PASSAGES_7,
  ...LEVEL_3_PASSAGES_8,
  ...LEVEL_3_PASSAGES_9,
  ...LEVEL_3_PASSAGES_10,
  ...LEVEL_3_PASSAGES_11,
  ...LEVEL_3_PASSAGES_12,
  ...LEVEL_3_PASSAGES_13,
  ...LEVEL_4_PASSAGES_1,
  ...LEVEL_4_PASSAGES_2,
  ...LEVEL_4_PASSAGES_3,
  ...LEVEL_4_PASSAGES_4,
  ...LEVEL_4_PASSAGES_5,
  ...LEVEL_4_PASSAGES_6,
  ...LEVEL_4_PASSAGES_7,
  ...LEVEL_4_PASSAGES_8,
  ...LEVEL_4_PASSAGES_9,
  ...LEVEL_4_PASSAGES_10,
  ...LEVEL_4_PASSAGES_11,
  ...LEVEL_4_PASSAGES_12,
  ...LEVEL_4_PASSAGES_13
];

const TEXT_TYPES = [
  { id: 'narrative', name: 'Narrative', icon: '📖', color: 'from-blue-500 to-indigo-500' },
  { id: 'informational', name: 'Information', icon: '📊', color: 'from-emerald-500 to-teal-500' },
  { id: 'persuasive', name: 'Persuasive', icon: '💡', color: 'from-orange-500 to-amber-500' },
  { id: 'poetry', name: 'Poetry', icon: '🎭', color: 'from-purple-500 to-pink-500' }
];

const QUESTION_TYPES = {
  'right-there': {
    name: 'Right There',
    description: 'Answer can be pointed to in one sentence',
    icon: '👆',
    chip: 'bg-green-100 text-green-700 border-green-300'
  },
  'think-and-search': {
    name: 'Think & Search',
    description: 'Combine details from different parts of the text',
    icon: '🧠',
    chip: 'bg-sky-100 text-sky-700 border-sky-300'
  },
  'author-and-me': {
    name: 'Author & Me',
    description: 'Use clues + your thinking to infer',
    icon: '🤝',
    chip: 'bg-purple-100 text-purple-700 border-purple-300'
  },
  'on-my-own': {
    name: 'On My Own',
    description: 'Connect the topic to your own life',
    icon: '💬',
    chip: 'bg-amber-100 text-amber-700 border-amber-300'
  }
};

const FLUENCY_MOMENTS = [
  {
    title: 'Pencil Tap Pace',
    icon: '🎵',
    color: 'from-blue-500 via-indigo-500 to-purple-500',
    description: 'Tap a steady beat while students track the words to feel smooth pacing.'
  },
  {
    title: 'Echo Encore',
    icon: '🪞',
    color: 'from-emerald-500 via-teal-500 to-cyan-500',
    description: 'Teacher reads with expression, students echo with matching phrasing.'
  },
  {
    title: 'Spotlight Words',
    icon: '🔦',
    color: 'from-amber-500 via-orange-500 to-rose-500',
    description: 'Highlight focus words, then whisper-read and perform them with big expression.'
  },
  {
    title: 'Beat the Bumpy Bits',
    icon: '🚦',
    color: 'from-violet-500 via-fuchsia-500 to-pink-500',
    description: 'Students rehearse tricky sections three ways: whisper, robot, and then storyteller voice.'
  }
];

const FLUENCY_GAMES = [
  {
    title: '60-Second Spotlight',
    subtitle: 'Timed partner reads',
    icon: '⏱️',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    steps: [
      'Partner A reads for 60 seconds while Partner B tracks words with a pointer',
      'Switch roles and try to read a few more words smoothly',
      'Celebrate improvements with a quick fist bump or positive note'
    ]
  },
  {
    title: 'Expression Switch-Up',
    subtitle: 'Mood-based reading',
    icon: '🎭',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    steps: [
      'Roll the expression cube (happy, serious, sneaky, shocked, calm, news reporter)',
      'Read the next paragraph using the expression you rolled',
      'Talk about which expression matched the text best'
    ]
  },
  {
    title: 'Phrase Trail Race',
    subtitle: 'Chunked phrasing practice',
    icon: '🛤️',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    steps: [
      'Mark natural phrase breaks in the passage with slashes',
      'Read each phrase in one breath, then connect the phrases smoothly',
      'Race a partner to see who can read the paragraph with the fewest pauses'
    ]
  }
];

const ASSESSMENT_TIPS = [
  {
    title: 'Accuracy First',
    detail: 'Listen for automatic recognition of focus words and track miscues with quick tally marks.'
  },
  {
    title: 'Phrasing & Expression',
    detail: 'Record a short clip to replay with students. Highlight where the voice matched punctuation cues.'
  },
  {
    title: 'Rate Goals',
    detail: 'Use one-minute reads to graph words correct per minute alongside the spelling list focus.'
  },
  {
    title: 'Comprehension Connection',
    detail: 'Ask one question from each QAR type. Link responses back to the weekly spelling pattern.'
  }
];

// ===============================================
// MAIN SPELLING PROGRAM COMPONENT
// ===============================================
const SpellingProgram = ({
  showToast = () => {},
  students = [],
  saveData = () => {},
  loadedData = {}
}) => {
  const [groups, setGroups] = useState(loadedData?.spellingGroups || []);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showListSelector, setShowListSelector] = useState(false);
  const [viewingList, setViewingList] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showActivityInstructions, setShowActivityInstructions] = useState(null);
  const [showStudentAssignment, setShowStudentAssignment] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('1');
  const [selectedListId, setSelectedListId] = useState('1.1');
  const [selectedTextType, setSelectedTextType] = useState('narrative');

  const passageMap = useMemo(() => {
    const map = {};
    READING_PASSAGES.forEach(passage => {
      map[passage.id] = passage;
    });
    return map;
  }, []);

  const listsWithPassages = useMemo(() => {
    return SPELLING_LISTS.map(list => {
      const passage = passageMap[list.id];
      return {
        ...list,
        passage,
        texts: passage?.texts || []
      };
    });
  }, [passageMap]);

  const levelLists = useMemo(() => {
    return listsWithPassages.filter(list => list.id.startsWith(`${selectedLevel}.`));
  }, [listsWithPassages, selectedLevel]);

  useEffect(() => {
    if (levelLists.length === 0) return;
    const hasSelected = levelLists.some(list => list.id === selectedListId);
    if (!hasSelected) {
      setSelectedListId(levelLists[0].id);
    }
  }, [levelLists, selectedListId]);

  const selectedList = useMemo(() => {
    return listsWithPassages.find(list => list.id === selectedListId) || levelLists[0] || listsWithPassages[0];
  }, [listsWithPassages, levelLists, selectedListId]);

  useEffect(() => {
    if (!selectedList) return;
    const availableTypes = selectedList.texts.map(text => text.type);
    if (availableTypes.length === 0) {
      setSelectedTextType('narrative');
      return;
    }
    if (!availableTypes.includes(selectedTextType)) {
      setSelectedTextType(availableTypes[0]);
    }
  }, [selectedList, selectedTextType]);

  const selectedText = useMemo(() => {
    if (!selectedList) return null;
    return selectedList.texts.find(text => text.type === selectedTextType) || selectedList.texts[0] || null;
  }, [selectedList, selectedTextType]);

  // Initialize groups if empty
  useEffect(() => {
    // Load from Firebase data only
    if (loadedData?.spellingGroups && loadedData.spellingGroups.length > 0) {
      setGroups(loadedData.spellingGroups);
      setHasUnsavedChanges(false);
      console.log('📚 Loaded spelling groups from Firebase:', loadedData.spellingGroups);
    } else if (loadedData?.fluencyGroups && loadedData.fluencyGroups.length > 0) {
      const converted = loadedData.fluencyGroups.map(group => ({
        id: group.id,
        name: group.name,
        color: group.color || 'bg-blue-500',
        students: group.students || [],
        assignedLists: Array.from(new Set((group.assignedTexts || []).map(textId => textId.split('-')[0]))),
        assignedActivity: null
      }));
      setGroups(converted);
      setHasUnsavedChanges(false);
      console.log('🔄 Converted legacy fluency groups to new spelling groups format');
    } else if (loadedData !== undefined && groups.length === 0) {
      // Only create defaults if no groups exist in Firebase and local state is empty
      const defaultGroups = [
        { id: 1, name: "Group 1", color: "bg-blue-500", students: [], assignedLists: [], assignedActivity: null },
        { id: 2, name: "Group 2", color: "bg-green-500", students: [], assignedLists: [], assignedActivity: null },
        { id: 3, name: "Group 3", color: "bg-purple-500", students: [], assignedLists: [], assignedActivity: null }
      ];
      setGroups(defaultGroups);
      setHasUnsavedChanges(true);
      console.log('📚 Created default spelling groups');
    }
  }, [loadedData]);

  // Update groups when loadedData changes (Firebase data loaded) - but avoid infinite loops
  useEffect(() => {
    if (loadedData?.spellingGroups &&
        Array.isArray(loadedData.spellingGroups) &&
        loadedData.spellingGroups.length > 0 &&
        JSON.stringify(loadedData.spellingGroups) !== JSON.stringify(groups)) {
      setGroups(loadedData.spellingGroups);
      setHasUnsavedChanges(false);
      console.log('🔄 Updated spelling groups from Firebase data change');
    } else if (loadedData?.fluencyGroups &&
               Array.isArray(loadedData.fluencyGroups) &&
               loadedData.fluencyGroups.length > 0 &&
               (!loadedData?.spellingGroups || loadedData.spellingGroups.length === 0)) {
      const converted = loadedData.fluencyGroups.map(group => ({
        id: group.id,
        name: group.name,
        color: group.color || 'bg-blue-500',
        students: group.students || [],
        assignedLists: Array.from(new Set((group.assignedTexts || []).map(textId => textId.split('-')[0]))),
        assignedActivity: null
      }));
      setGroups(converted);
      setHasUnsavedChanges(false);
      console.log('🔄 Updated groups from legacy fluency data change');
    }
  }, [loadedData?.spellingGroups, loadedData?.fluencyGroups]);

  // Clean up groups when students change (remove deleted students from groups)
  useEffect(() => {
    if (groups.length > 0 && students.length > 0) {
      const studentIds = students.map(s => s.id);
      let hasChanges = false;
      
      const cleanedGroups = groups.map(group => {
        const validStudents = group.students.filter(student => studentIds.includes(student.id));
        if (validStudents.length !== group.students.length) {
          hasChanges = true;
          return { ...group, students: validStudents };
        }
        return group;
      });
      
      if (hasChanges) {
        console.log('🧹 Cleaned up removed students from spelling groups');
        setGroups(cleanedGroups);
        setHasUnsavedChanges(true);
      }
    }
  }, [students]);

  // Manual save function
  const saveGroups = () => {
    try {
      if (!saveData || typeof saveData !== 'function') {
        console.error('❌ saveData function not available');
        return;
      }

      if (!groups || groups.length === 0) {
        console.error('❌ No groups to save');
        return;
      }
      
      // Get existing toolkit data and merge spelling groups
      const existingToolkitData = loadedData || {};
      const updatedToolkitData = {
        ...existingToolkitData,
        spellingGroups: groups,
        lastSaved: new Date().toISOString()
      };
      
      // Save to toolkitData to match loading location
      saveData({ toolkitData: updatedToolkitData });
      setHasUnsavedChanges(false);
      console.log('📝 Spelling groups saved to Firebase successfully:', groups);
      
    } catch (error) {
      console.error('❌ Error saving spelling groups:', error);
    }
  };

  // Update groups locally (without auto-saving)
  const updateGroups = (updatedGroups) => {
    if (!Array.isArray(updatedGroups)) {
      console.error('❌ Invalid groups data - must be array');
      return;
    }
    setGroups(updatedGroups);
    setHasUnsavedChanges(true);
    console.log('📝 Groups updated locally, unsaved changes flagged');
  };

  const addGroup = () => {
    if (groups.length >= 5) return;
    
    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-red-500"];
    const newGroup = {
      id: Date.now(),
      name: `Group ${groups.length + 1}`,
      color: colors[groups.length % colors.length],
      students: [],
      assignedLists: [],
      assignedActivity: null
    };
    const updatedGroups = [...groups, newGroup];
    updateGroups(updatedGroups);
  };

  const removeGroup = (groupId) => {
    const updatedGroups = groups.filter(g => g.id !== groupId);
    updateGroups(updatedGroups);
  };

  const updateGroupName = (groupId, newName) => {
    const updatedGroups = groups.map(g => 
      g.id === groupId ? { ...g, name: newName } : g
    );
    updateGroups(updatedGroups);
  };

  const assignStudentToGroup = (studentId, groupId) => {
    const updatedGroups = groups.map(group => ({
      ...group,
      students: group.id === groupId 
        ? [...group.students.filter(s => s.id !== studentId), students.find(s => s.id === studentId)]
        : group.students.filter(s => s.id !== studentId)
    }));
    updateGroups(updatedGroups);
  };

  const assignListsToGroup = (groupId, listIds) => {
    const updatedGroups = groups.map(g => 
      g.id === groupId ? { ...g, assignedLists: listIds } : g
    );
    updateGroups(updatedGroups);
  };

  const assignActivityToGroup = (groupId, activityId) => {
    const updatedGroups = groups.map(g => 
      g.id === groupId ? { ...g, assignedActivity: activityId } : g
    );
    updateGroups(updatedGroups);
  };

  const printLists = (listIds) => {
    const lists = listsWithPassages.filter(list => listIds.includes(list.id));

    if (lists.length === 0) return;

    const printWindow = window.open('', 'Print', 'height=800,width=600');

    // Generate HTML for 8 copies of each list (2 rows of 4)
    const generateListCopies = (list) => {
      const passage = list.passage;
      const featuredText = passage?.texts?.[0];
      let copiesHtml = '';
      for (let i = 0; i < 8; i++) {
        copiesHtml += `
          <div class="list-copy">
            <div class="list-title">${list.name}</div>
            <div class="feature">${list.feature}</div>
            <div class="words">
              ${list.words.map(word => `<div class="word">${word}</div>`).join('')}
            </div>
            ${passage ? `
              <div class="reading-link">
                <strong>Connected Reading:</strong>
                <div>${passage.level}</div>
                ${featuredText ? `<div>${featuredText.title} (${featuredText.wordCount} words)</div>` : ''}
              </div>
            ` : ''}
          </div>
        `;
      }
      return copiesHtml;
    };
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Spelling Lists - 8 Copies</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 10px; 
              padding: 0;
              font-size: 12px;
            }
            .list-page {
              page-break-after: always;
              margin-bottom: 20px;
            }
            .list-page:last-child {
              page-break-after: auto;
            }
            .copies-container { 
              display: grid; 
              grid-template-columns: repeat(4, 1fr); 
              grid-template-rows: repeat(2, 1fr);
              gap: 10px; 
              width: 100%;
              height: 90vh;
            }
            .list-copy { 
              border: 2px solid #333; 
              padding: 8px;
              break-inside: avoid;
              display: flex;
              flex-direction: column;
            }
            .list-title { 
              font-weight: bold; 
              text-align: center; 
              margin-bottom: 4px;
              font-size: 11px;
              border-bottom: 1px solid #666;
              padding-bottom: 2px;
            }
            .feature {
              font-style: italic;
              text-align: center;
              font-size: 9px;
              color: #666;
              margin-bottom: 6px;
            }
            .words { 
              display: flex;
              flex-direction: column;
              gap: 2px;
              flex-grow: 1;
            }
            .word {
              padding: 2px 4px;
              border: 1px solid #ddd;
              text-align: center;
              font-size: 10px;
              background: #f9f9f9;
            }
            .reading-link {
              margin-top: 6px;
              font-size: 9px;
              color: #555;
              text-align: center;
              border-top: 1px solid #ddd;
              padding-top: 4px;
            }
            @media print {
              body { margin: 0; }
              .copies-container {
                gap: 8px;
                height: 95vh;
              }
              .list-copy { 
                padding: 6px; 
              }
            }
          </style>
        </head>
        <body>
          ${lists.map(list => `
            <div class="list-page">
              <div class="copies-container">
                ${generateListCopies(list)}
              </div>
            </div>
          `).join('')}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const printPassages = (listIds) => {
    const passagesToPrint = [];
    listIds.forEach(listId => {
      const list = listsWithPassages.find(l => l.id === listId);
      if (list?.passage?.texts) {
        list.passage.texts.forEach(text => {
          passagesToPrint.push({ list, text, passage: list.passage });
        });
      }
    });

    if (passagesToPrint.length === 0) return;

    const printWindow = window.open('', 'Print', 'height=900,width=700');

    printWindow.document.write(`
      <html>
        <head>
          <title>Fluency Passages</title>
          <style>
            body {
              font-family: 'Georgia', serif;
              margin: 20px;
              padding: 0;
              background: #f8fafc;
            }
            .text-page {
              page-break-after: always;
              background: white;
              border: 1px solid #cbd5f5;
              border-radius: 12px;
              padding: 24px;
              box-shadow: 0 10px 30px rgba(79,70,229,0.1);
              margin-bottom: 24px;
            }
            .text-page:last-child {
              page-break-after: auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #6366f1;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .header h2 {
              margin: 0;
              font-size: 22px;
              color: #312e81;
            }
            .meta {
              font-size: 12px;
              color: #4338ca;
              margin-top: 4px;
            }
            .feature {
              background: #eef2ff;
              border-radius: 8px;
              padding: 8px 12px;
              font-size: 12px;
              margin-bottom: 16px;
              text-align: center;
            }
            .content {
              font-size: 15px;
              line-height: 1.8;
              color: #1f2937;
              white-space: pre-wrap;
            }
            .focus-words {
              margin-top: 16px;
              font-size: 12px;
              color: #4c1d95;
              border-top: 1px dashed #818cf8;
              padding-top: 8px;
            }
          </style>
        </head>
        <body>
          ${passagesToPrint.map(({ list, text, passage }) => `
            <div class="text-page">
              <div class="header">
                <h2>${text.title}</h2>
                <div class="meta">${passage.level} • ${text.type.toUpperCase()} • ${text.wordCount} words</div>
              </div>
              <div class="feature">Spelling Focus: ${list.feature}</div>
              <div class="content">${text.content.replace(/\n/g, '<br/>')}</div>
              <div class="focus-words"><strong>Target Words:</strong> ${list.words.join(', ')}</div>
            </div>
          `).join('')}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const togglePresentationMode = () => {
    setIsPresentationMode(!isPresentationMode);
  };

  const getAssignedStudents = (students) => {
    return groups.reduce((assigned, group) => [...assigned, ...group.students], []);
  };

  const unassignedStudents = students.filter(student => 
    !getAssignedStudents(students).some(assigned => assigned?.id === student.id)
  );

  if (isPresentationMode) {
    const activeGroups = groups.filter(g => g.assignedLists.length > 0);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">📝 Today's Spelling</h1>
          <button
            onClick={togglePresentationMode}
            className="bg-gray-600 text-white px-6 py-3 rounded-xl text-xl font-bold hover:bg-gray-700"
          >
            Exit Presentation
          </button>
        </div>

        {/* UPDATED: Show all groups in one row when more than 3 */}
        <div className={`grid gap-4 ${
          activeGroups.length <= 3 
            ? activeGroups.length === 1 ? 'grid-cols-1' : activeGroups.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
            : 'grid-cols-1'
        }`}>
          {activeGroups.length > 3 ? (
            // Single row layout for 4+ groups
            <div className="grid grid-cols-4 gap-4">
              {activeGroups.map(group => {
                const assignedActivity = ACTIVITIES.find(a => a.id === group.assignedActivity);
                return (
                  <div key={group.id} className="bg-white rounded-xl shadow-lg p-4">
                    <div className={`${group.color} text-white text-center py-3 rounded-lg mb-4`}>
                      <h2 className="text-xl font-bold">{group.name}</h2>
                      <p className="text-sm opacity-90">{group.students.length} students</p>
                    </div>

                    {group.assignedLists.map(listId => {
                      const list = listsWithPassages.find(l => l.id === listId);
                      if (!list) return null;
                      const passage = list.passage;
                      return (
                        <div key={listId} className="mb-4 space-y-2">
                          <h3 className="text-lg font-bold text-center text-gray-800">{list.name}</h3>
                          <p className="text-xs text-center text-blue-600 italic">{list.feature}</p>
                          <div className="grid grid-cols-2 gap-1">
                            {list.words.map((word, index) => (
                              <div key={index} className="bg-gray-100 border border-gray-300 rounded p-1 text-center">
                                <span className="text-sm font-medium text-gray-800">{word}</span>
                              </div>
                            ))}
                          </div>
                          {passage && (
                            <div className="bg-gradient-to-r from-sky-100 to-indigo-100 border border-indigo-200 rounded-lg p-2 text-center">
                              <p className="text-xs font-semibold text-indigo-700">📖 Connected Reading: {passage.level}</p>
                              {passage.texts?.[0] && (
                                <p className="text-[11px] text-indigo-600">
                                  {passage.texts[0].title} • {passage.texts[0].wordCount} words
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {assignedActivity && (
                      <div className={`${assignedActivity.color} text-white p-3 rounded-lg mt-4 cursor-pointer hover:opacity-90 transition-opacity`}
                           onClick={() => setShowActivityInstructions(assignedActivity)}>
                        <div className="text-center">
                          <div className="text-2xl mb-2">{assignedActivity.icon}</div>
                          <h3 className="text-sm font-bold">{assignedActivity.name}</h3>
                          <p className="text-xs opacity-80">Click for instructions</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // Original layout for 1-3 groups
            activeGroups.map(group => {
              const assignedActivity = ACTIVITIES.find(a => a.id === group.assignedActivity);
              return (
                <div key={group.id} className="bg-white rounded-2xl shadow-2xl p-8">
                  <div className={`${group.color} text-white text-center py-6 rounded-xl mb-6`}>
                    <h2 className="text-4xl font-bold">{group.name}</h2>
                    <p className="text-2xl opacity-90">{group.students.length} students</p>
                  </div>

                  {group.assignedLists.map(listId => {
                    const list = listsWithPassages.find(l => l.id === listId);
                    if (!list) return null;
                    const passage = list.passage;
                    return (
                      <div key={listId} className="mb-8 space-y-4">
                        <div>
                          <h3 className="text-3xl font-bold text-center text-gray-800">{list.name}</h3>
                          <p className="text-lg text-center text-blue-600 italic">{list.feature}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {list.words.map((word, index) => (
                            <div key={index} className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 text-center">
                              <span className="text-3xl font-bold text-gray-800">{word}</span>
                            </div>
                          ))}
                        </div>
                        {passage && (
                          <div className="bg-gradient-to-r from-sky-200 via-indigo-200 to-purple-200 border border-indigo-300 rounded-xl p-4 text-center">
                            <p className="text-base font-semibold text-indigo-800 flex items-center justify-center gap-2">
                              <span>📖</span>
                              Connected Reading: {passage.level}
                            </p>
                            {passage.texts?.[0] && (
                              <p className="text-sm text-indigo-700">
                                {passage.texts[0].title} • {passage.texts[0].wordCount} words
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {assignedActivity && (
                    <div className={`${assignedActivity.color} text-white p-6 rounded-xl mt-6`}>
                      <div className="text-center">
                        <div className="text-6xl mb-4">{assignedActivity.icon}</div>
                        <h3 className="text-3xl font-bold">{assignedActivity.name}</h3>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-white rounded-3xl p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🌀</span>
              <div>
                <h1 className="text-3xl lg:text-4xl font-extrabold">Spelling & Fluency Studio</h1>
                <p className="text-lg opacity-90">Plan, teach, and assign word study with perfectly paired reading passages.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-sm uppercase tracking-wide opacity-80">Spelling Lists</p>
                <p className="text-2xl font-bold">{SPELLING_LISTS.length}</p>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-sm uppercase tracking-wide opacity-80">Reading Passages</p>
                <p className="text-2xl font-bold">{READING_PASSAGES.length}</p>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-sm uppercase tracking-wide opacity-80">Levels</p>
                <p className="text-2xl font-bold">4</p>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-sm uppercase tracking-wide opacity-80">Activities</p>
                <p className="text-2xl font-bold">{ACTIVITIES.length}</p>
              </div>
            </div>
            {loadedData?.spellingGroups && loadedData.spellingGroups.length > 0 && !hasUnsavedChanges && (
              <p className="text-sm opacity-75">✅ Groups loaded from your saved data</p>
            )}
            {hasUnsavedChanges && (
              <p className="text-sm opacity-80">⚠️ You have unsaved changes</p>
            )}
          </div>
          <div className="flex flex-wrap gap-3 items-start lg:items-center justify-end">
            <button
              onClick={() => setShowListSelector(!showListSelector)}
              className="bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition"
            >
              📋 Browse Lists
            </button>
            <button
              onClick={() => setShowStudentAssignment(true)}
              className="bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition"
            >
              👥 Assign Students
            </button>
            <button
              onClick={togglePresentationMode}
              className="bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition"
            >
              🎭 Presentation
            </button>
            {hasUnsavedChanges && (
              <button
                onClick={saveGroups}
                className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg"
              >
                💾 Save Groups
              </button>
            )}
          </div>
        </div>

        {/* Dynamic pairing preview */}
        {selectedList && (
          <div className="mt-8 bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1 space-y-3">
                <p className="text-sm uppercase tracking-[0.2em] opacity-80">Current Focus</p>
                <h2 className="text-2xl font-bold">{selectedList.name}</h2>
                <p className="text-white/80 italic">{selectedList.feature}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {['1','2','3','4'].map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`px-3 py-1 rounded-full text-sm font-semibold transition ${selectedLevel === level ? 'bg-white text-indigo-700' : 'bg-white/20 text-white hover:bg-white/30'}`}
                    >
                      Level {level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-1 bg-white/90 text-gray-900 rounded-xl p-4 shadow-inner">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span>🔡</span> Spelling Words
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedList.words.map((word, index) => (
                    <span key={index} className="bg-indigo-50 text-indigo-700 font-semibold rounded-lg px-2 py-1 text-center">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-1 bg-white/90 text-gray-900 rounded-xl p-4 shadow-inner space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span>📖</span> Connected Reading
                  </h3>
                  <div className="flex gap-2">
                    {TEXT_TYPES.map(type => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedTextType(type.id)}
                        className={`px-2 py-1 rounded-full text-xs font-semibold transition ${selectedTextType === type.id ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      >
                        {type.icon}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedText ? (
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-indigo-700">{selectedList.passage?.level}</p>
                    <h4 className="text-xl font-semibold">{selectedText.title}</h4>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <span>📝 {selectedText.wordCount} words</span>
                    </p>
                    <p className="text-sm text-gray-700 bg-gray-100 rounded-lg p-3 max-h-36 overflow-y-auto">
                      {selectedText.content.split('\n').join(' ')}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No passage found for this list yet.</p>
                )}
              </div>
            </div>

            {/* Level list quick picker */}
            <div className="mt-6 overflow-x-auto">
              <div className="flex gap-3 min-w-max">
                {levelLists.map(list => (
                  <button
                    key={list.id}
                    onClick={() => setSelectedListId(list.id)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition ${selectedListId === list.id ? 'bg-white text-indigo-700 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >
                    {list.name.replace('Level ', 'L').split(' - ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Coaching cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-6 space-y-4">
          <h2 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
            <span>🎙️</span> Fluency Mini-Lessons
          </h2>
          <p className="text-sm text-gray-600">Sprinkle one of these quick routines before students tackle their connected passage.</p>
          <div className="space-y-3">
            {FLUENCY_MOMENTS.map(moment => (
              <div key={moment.title} className={`bg-gradient-to-r ${moment.color} text-white rounded-xl p-4 shadow`}> 
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{moment.icon}</span>
                  <div>
                    <h3 className="font-semibold">{moment.title}</h3>
                    <p className="text-sm opacity-90">{moment.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 space-y-4">
          <h2 className="text-xl font-bold text-purple-700 flex items-center gap-2">
            <span>🎮</span> Engagement Games
          </h2>
          <p className="text-sm text-gray-600">Keep practice joyful while reinforcing expression, pacing, and phrasing.</p>
          <div className="space-y-3">
            {FLUENCY_GAMES.map(game => (
              <div key={game.title} className={`border-2 ${game.color} rounded-xl p-4`}> 
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{game.icon}</span>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm uppercase tracking-wide font-semibold">{game.subtitle}</p>
                      <h3 className="text-lg font-bold">{game.title}</h3>
                    </div>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {game.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-emerald-700 flex items-center gap-2">
              <span>📊</span> Assess & Reflect
            </h2>
            <p className="text-sm text-gray-600">Capture a quick snapshot of student growth after each reading.</p>
          </div>
          <div className="space-y-3">
            {ASSESSMENT_TIPS.map(tip => (
              <div key={tip.title} className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <h3 className="text-sm font-semibold text-emerald-800">{tip.title}</h3>
                <p className="text-sm text-emerald-700">{tip.detail}</p>
              </div>
            ))}
          </div>
          <div className="bg-emerald-100 border border-emerald-200 rounded-xl p-4 space-y-2">
            <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
              <span>❓</span> Comprehension Prompts
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(QUESTION_TYPES).map(([key, info]) => (
                <div key={key} className={`border ${info.chip} rounded-lg px-2 py-2`}> 
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span>{info.icon}</span>
                    <span>{info.name}</span>
                  </div>
                  <p className="text-xs mt-1">{info.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* List Selector Modal */}
      {showListSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Browse Spelling Lists</h2>
                <button
                  onClick={() => {
                    setShowListSelector(false);
                    setViewingList(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              {viewingList ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{viewingList.name}</h3>
                      <p className="text-blue-600 italic">{viewingList.feature}</p>
                      <p className="text-gray-600">{viewingList.words.length} words</p>
                    </div>
                    <button
                      onClick={() => setViewingList(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      ← Back to Lists
                    </button>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span>🔡</span> Word List
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {viewingList.words.map((word, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                            <span className="text-base font-bold text-gray-800">{word}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
                      <h4 className="text-lg font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                        <span>📖</span> Connected Passages
                      </h4>
                      {viewingList.passage ? (
                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-indigo-700">{viewingList.passage.level}</p>
                          <ul className="space-y-2">
                            {viewingList.passage.texts.map(text => (
                              <li key={`${text.type}-${text.title}`} className="bg-white rounded-lg p-3 border border-indigo-100">
                                <div className="flex items-center justify-between">
                                  <div className="font-semibold text-gray-800">{text.title}</div>
                                  <span className="text-xs uppercase tracking-wide text-indigo-600">{text.type}</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-1">{text.wordCount} words</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-indigo-700">No aligned passage saved for this list yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {listsWithPassages.map(list => (
                    <button
                      key={list.id}
                      onClick={() => setViewingList(list)}
                      className="p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-left transition-all"
                    >
                      <div className="font-bold text-sm">{list.name}</div>
                      <div className="text-xs text-blue-600 italic mb-1">{list.feature}</div>
                      <div className="text-xs text-gray-600">{list.words.length} words</div>
                      <div className="text-xs mt-1">
                        {list.words.slice(0, 3).join(', ')}...
                      </div>
                      {list.passage && (
                        <div className="text-[11px] text-indigo-600 mt-1">
                          📖 {list.passage.level}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Unassigned Students */}
      {unassignedStudents.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-bold text-yellow-800 mb-3">👤 Unassigned Students ({unassignedStudents.length})</h3>
          <p className="text-sm text-yellow-700 mb-3">Click "Assign Students" above to quickly assign students to groups</p>
          <div className="flex flex-wrap gap-2">
            {unassignedStudents.slice(0, 5).map(student => (
              <div key={student.id} className="bg-white border border-yellow-300 rounded-lg p-2">
                <span className="text-sm font-medium">{student.firstName} {student.lastName}</span>
              </div>
            ))}
            {unassignedStudents.length > 5 && (
              <div className="bg-white border border-yellow-300 rounded-lg p-2">
                <span className="text-sm text-gray-500">+{unassignedStudents.length - 5} more</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Groups Display */}
      <div className={`grid gap-4 ${
        groups.length === 1 ? 'grid-cols-1' :
        groups.length === 2 ? 'grid-cols-2' :
        groups.length === 3 ? 'grid-cols-3' :
        groups.length === 4 ? 'grid-cols-4' :
        'grid-cols-5'
      }`}>
        {groups.map(group => (
          <div key={group.id} className="bg-white rounded-xl shadow-lg border-2 border-gray-200">
            {/* Group Header */}
            <div className={`${group.color} text-white p-3 rounded-t-xl`}>
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={group.name}
                  onChange={(e) => updateGroupName(group.id, e.target.value)}
                  className={`bg-transparent text-white font-bold border-none outline-none ${
                    groups.length >= 4 ? 'text-sm' : 'text-lg'
                  }`}
                />
                <button
                  onClick={() => removeGroup(group.id)}
                  className="text-white hover:text-red-200 text-lg"
                >
                  ×
                </button>
              </div>
              <p className={`opacity-90 ${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}>
                {group.students.length} students
              </p>
            </div>

            <div className={`${groups.length >= 4 ? 'p-3' : 'p-4'}`}>
              {/* Students */}
              <div className="mb-3">
                <h4 className={`font-bold text-gray-700 mb-2 ${groups.length >= 4 ? 'text-sm' : 'text-base'}`}>
                  Students:
                </h4>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {group.students.map(student => (
                    <div key={student.id} className="flex items-center justify-between bg-gray-50 p-1 rounded">
                      <span className={`${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}>
                        {student.firstName} {student.lastName}
                      </span>
                      <button
                        onClick={() => assignStudentToGroup(student.id, null)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {group.students.length === 0 && (
                    <p className={`text-gray-500 italic ${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}>
                      No students assigned
                    </p>
                  )}
                </div>
              </div>

              {/* Assigned Lists */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-bold text-gray-700 ${groups.length >= 4 ? 'text-sm' : 'text-base'}`}>
                    Lists:
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => printLists(group.assignedLists)}
                      disabled={group.assignedLists.length === 0}
                      className={`bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 ${
                        groups.length >= 4 ? 'text-xs px-1 py-1' : 'text-xs px-2 py-1'
                      }`}
                    >
                      🖨️
                    </button>
                    <button
                      onClick={() => printPassages(group.assignedLists)}
                      disabled={group.assignedLists.length === 0}
                      className={`bg-purple-500 text-white rounded disabled:opacity-50 hover:bg-purple-600 ${
                        groups.length >= 4 ? 'text-xs px-1 py-1' : 'text-xs px-2 py-1'
                      }`}
                    >
                      📚
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1 mb-2 max-h-32 overflow-y-auto">
                  {group.assignedLists.map(listId => {
                    const list = listsWithPassages.find(l => l.id === listId);
                    if (!list) return null;
                    const passage = list.passage;
                    return (
                      <div key={listId} className="bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border border-blue-200 rounded p-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-medium text-blue-800 ${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}>
                            {list.name}
                          </span>
                          <button
                            onClick={() => assignListsToGroup(group.id, group.assignedLists.filter(id => id !== listId))}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            ×
                          </button>
                        </div>
                        <div className={`text-blue-600 italic ${groups.length >= 5 ? 'text-xs' : 'text-xs'}`}>
                          {list.feature}
                        </div>
                        <div className={`text-blue-700 ${groups.length >= 5 ? 'text-[11px]' : 'text-xs'}`}>
                          {groups.length >= 5 ? `${list.words.slice(0, 3).join(', ')}...` : list.words.join(', ')}
                        </div>
                        {passage && (
                          <div className={`text-indigo-700 ${groups.length >= 5 ? 'text-[11px]' : 'text-xs'}`}>
                            📖 {passage.level}{passage.texts?.[0] ? ` – ${passage.texts[0].title}` : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <select
                  onChange={(e) => {
                    if (e.target.value && !group.assignedLists.includes(e.target.value)) {
                      if (group.assignedLists.length < 5) {
                        assignListsToGroup(group.id, [...group.assignedLists, e.target.value]);
                      } else {
                        showToast('Maximum 5 lists per group', 'error');
                      }
                    }
                    e.target.value = '';
                  }}
                  className={`w-full border border-gray-300 rounded p-1 ${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}
                  defaultValue=""
                >
                  <option value="">Add list...</option>
                  {listsWithPassages.filter(list => !group.assignedLists.includes(list.id)).map(list => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </select>
              </div>

              {/* Assigned Activity */}
              <div>
                <h4 className={`font-bold text-gray-700 mb-2 ${groups.length >= 4 ? 'text-sm' : 'text-base'}`}>
                  Activity:
                </h4>
                {group.assignedActivity ? (
                  <div 
                    className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-2 cursor-pointer hover:bg-green-100 transition-colors"
                    onClick={() => setShowActivityInstructions(ACTIVITIES.find(a => a.id === group.assignedActivity))}
                  >
                    <div className="flex items-center">
                      <span className={`mr-2 ${groups.length >= 4 ? 'text-lg' : 'text-xl'}`}>
                        {ACTIVITIES.find(a => a.id === group.assignedActivity)?.icon}
                      </span>
                      <span className={`font-medium text-green-800 ${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}>
                        {ACTIVITIES.find(a => a.id === group.assignedActivity)?.name}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        assignActivityToGroup(group.id, null);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <select
                    onChange={(e) => e.target.value && assignActivityToGroup(group.id, e.target.value)}
                    className={`w-full border border-gray-300 rounded p-1 ${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}
                    defaultValue=""
                  >
                    <option value="">Select activity...</option>
                    {ACTIVITIES.map(activity => (
                      <option key={activity.id} value={activity.id}>
                        {activity.icon} {activity.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add Group Button */}
        {groups.length < 5 && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center min-h-[300px]">
            <button
              onClick={addGroup}
              className="text-gray-600 hover:text-gray-800 text-center"
            >
              <div className={`mb-2 ${groups.length >= 4 ? 'text-2xl' : 'text-4xl'}`}>+</div>
              <div className={`font-bold ${groups.length >= 4 ? 'text-sm' : 'text-base'}`}>Add Group</div>
            </button>
          </div>
        )}
      </div>

      {/* Student Assignment Modal */}
      {showStudentAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">👥 Assign Students to Groups</h2>
                <button
                  onClick={() => setShowStudentAssignment(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Available Students */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Available Students</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {unassignedStudents.map(student => (
                      <div key={student.id} className="bg-gray-50 border rounded-lg p-3">
                        <div className="font-medium">{student.firstName} {student.lastName}</div>
                        <div className="flex gap-2 mt-2">
                          {groups.map(group => (
                            <button
                              key={group.id}
                              onClick={() => assignStudentToGroup(student.id, group.id)}
                              className={`${group.color} text-white text-xs px-3 py-1 rounded hover:opacity-80`}
                            >
                              → {group.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {unassignedStudents.length === 0 && (
                      <p className="text-gray-500 italic">All students are assigned to groups!</p>
                    )}
                  </div>
                </div>

                {/* Groups with Students */}
                <div>
                  <h3 className="text-lg font-bold mb-4">Groups</h3>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {groups.map(group => (
                      <div key={group.id} className="border rounded-lg">
                        <div className={`${group.color} text-white p-2 rounded-t-lg`}>
                          <h4 className="font-bold">{group.name} ({group.students.length})</h4>
                        </div>
                        <div className="p-2 space-y-1">
                          {group.students.map(student => (
                            <div key={student.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm">{student.firstName} {student.lastName}</span>
                              <button
                                onClick={() => assignStudentToGroup(student.id, null)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                          {group.students.length === 0 && (
                            <p className="text-gray-400 text-sm italic">No students assigned</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Instructions Modal */}
      {showActivityInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className={`${showActivityInstructions.color} text-white p-6 rounded-t-xl`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-4xl mr-4">{showActivityInstructions.icon}</span>
                  <h2 className="text-2xl font-bold">{showActivityInstructions.name}</h2>
                </div>
                <button
                  onClick={() => setShowActivityInstructions(null)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">📋 Instructions for Students:</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans">
                  {showActivityInstructions.instructions}
                </pre>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Teacher Tip:</strong> You can display these instructions to the class or print them out for student reference.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpellingProgram;