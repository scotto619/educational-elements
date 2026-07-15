// components/student/StudentSpelling.js
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { READING_PASSAGES, SPELLING_LISTS as PROGRAM_SPELLING_LISTS } from '../curriculum/literacy/SpellingProgram';
import { INTERACTIVE_ACTIVITIES } from './SpellingActivities';
import SpellingBee, { isBeeCompatible } from './SpellingBee';

// Legacy local copy (levels 1-4 only) kept as a fallback.
// The canonical list — including levels 5 and 6 — is imported from SpellingProgram.js above.
const LEGACY_SPELLING_LISTS = [
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

// Use the shared spelling lists (levels 1-6); fall back to the legacy local copy if needed
const SPELLING_LISTS = (Array.isArray(PROGRAM_SPELLING_LISTS) && PROGRAM_SPELLING_LISTS.length > 0)
  ? PROGRAM_SPELLING_LISTS
  : LEGACY_SPELLING_LISTS;

// Interactive activities live in SpellingActivities.js; the two lab puzzles below are defined in this file
const LAB_ACTIVITY_CARDS = [
  { id: 'digital_word_search', name: 'Word Search', icon: '🔎', tagline: 'Find the hidden words', gradient: 'from-teal-400 to-emerald-600' },
  { id: 'digital_crossword', name: 'Crossword', icon: '🧩', tagline: 'Solve clues, type the words', gradient: 'from-blue-500 to-indigo-600' }
];

const ALL_ACTIVITIES = [...INTERACTIVE_ACTIVITIES, ...LAB_ACTIVITY_CARDS];

const SPELLING_REWARDS = {
  ACTIVITY_XP: 5,
  ACTIVITY_COINS: 1,
  WEEKLY_GOAL: 5,
  GOAL_BONUS_XP: 10,
  GOAL_BONUS_COINS: 3
};

const normalizeSpellingWord = (word = '') => word.toUpperCase().replace(/[^A-Z]/g, '');

const shuffleArray = (array) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const WORD_SEARCH_DIRECTIONS = [
  { dx: 0, dy: 1 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: -1 },
  { dx: -1, dy: 0 },
  { dx: 1, dy: 1 },
  { dx: 1, dy: -1 },
  { dx: -1, dy: 1 },
  { dx: -1, dy: -1 }
];

const randomLetter = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));

const canPlaceWordSearch = (grid, word, startRow, startCol, direction) => {
  const size = grid.length;
  for (let i = 0; i < word.length; i++) {
    const row = startRow + direction.dx * i;
    const col = startCol + direction.dy * i;

    if (row < 0 || row >= size || col < 0 || col >= size) {
      return false;
    }

    const existing = grid[row][col];
    if (existing && existing !== word[i]) {
      return false;
    }
  }
  return true;
};

const placeWordSearch = (grid, word, startRow, startCol, direction) => {
  const positions = [];
  for (let i = 0; i < word.length; i++) {
    const row = startRow + direction.dx * i;
    const col = startCol + direction.dy * i;
    grid[row][col] = word[i];
    positions.push({ row, col });
  }
  return positions;
};

const createWordSearchPuzzle = (words, size = 12) => {
  const normalized = words
    .map(normalizeSpellingWord)
    .filter(word => word.length >= 3 && word.length <= size);

  const seen = new Set();
  const uniqueWords = [];
  normalized.forEach(word => {
    if (!seen.has(word)) {
      seen.add(word);
      uniqueWords.push(word);
    }
  });

  const sortedWords = uniqueWords.sort((a, b) => b.length - a.length);
  const chosenWords = sortedWords.slice(0, Math.min(sortedWords.length, 10));

  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  const placements = [];

  chosenWords.forEach(word => {
    let placed = false;
    const directions = shuffleArray(WORD_SEARCH_DIRECTIONS);

    for (const direction of directions) {
      const startPositions = [];

      for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
          const endRow = row + direction.dx * (word.length - 1);
          const endCol = col + direction.dy * (word.length - 1);

          if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) {
            continue;
          }

          if (canPlaceWordSearch(grid, word, row, col, direction)) {
            startPositions.push({ row, col });
          }
        }
      }

      const shuffledStarts = shuffleArray(startPositions);

      for (const start of shuffledStarts) {
        const positions = placeWordSearch(grid, word, start.row, start.col, direction);
        placements.push({
          id: `${word}-${placements.length}`,
          word,
          positions
        });
        placed = true;
        break;
      }

      if (placed) break;
    }

    if (!placed) {
      for (let row = 0; row < size && !placed; row++) {
        for (let col = 0; col <= size - word.length && !placed; col++) {
          if (canPlaceWordSearch(grid, word, row, col, { dx: 0, dy: 1 })) {
            const positions = placeWordSearch(grid, word, row, col, { dx: 0, dy: 1 });
            placements.push({
              id: `${word}-${placements.length}`,
              word,
              positions
            });
            placed = true;
          }
        }
      }
    }
  });

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!grid[row][col]) {
        grid[row][col] = randomLetter();
      }
    }
  }

  return {
    grid,
    placements,
    wordBank: placements.map(placement => placement.word)
  };
};

const buildWordSignature = (words) => words
  .map(normalizeSpellingWord)
  .filter(Boolean)
  .sort()
  .join('|');

const SpellingWordSearch = ({ words, onSolved }) => {
  const [puzzle, setPuzzle] = useState(() => createWordSearchPuzzle(words));
  const [foundWords, setFoundWords] = useState([]);
  const [selection, setSelection] = useState([]);
  const [selectionDirection, setSelectionDirection] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [cellSize, setCellSize] = useState(36);
  const [gridGap, setGridGap] = useState(4);
  const activePointerIdRef = useRef(null);

  const columnCount = puzzle?.grid?.length || 0;

  const signature = useMemo(() => buildWordSignature(words), [words]);

  useEffect(() => {
    const newPuzzle = createWordSearchPuzzle(words);
    setPuzzle(newPuzzle);
    setFoundWords([]);
    setSelection([]);
    setSelectionDirection(null);
    setIsSelecting(false);
    setIsComplete(false);
  }, [signature, words]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!columnCount) return;

    const updateCellSize = () => {
      const viewportWidth = window.innerWidth || 0;
      const isTabletOrLarger = viewportWidth >= 768;
      const paddingAllowance = isTabletOrLarger ? 96 : 48;
      const gap = isTabletOrLarger ? 6 : 4;
      const availableWidth = Math.max(220, Math.min(viewportWidth - paddingAllowance, 560));
      const adjustedWidth = Math.max(160, availableWidth - (columnCount - 1) * gap);
      const rawSize = Math.floor(adjustedWidth / columnCount);
      const clampedSize = Math.max(20, Math.min(rawSize, 52));

      setGridGap(gap);
      setCellSize(clampedSize);
    };

    updateCellSize();
    window.addEventListener('resize', updateCellSize);

    return () => {
      window.removeEventListener('resize', updateCellSize);
    };
  }, [columnCount]);

  const finalizeSelection = useCallback(() => {
    if (!selection.length) {
      setIsSelecting(false);
      setSelection([]);
      setSelectionDirection(null);
      return;
    }

    if (puzzle && puzzle.placements) {
      const selectionKey = selection.map(cell => `${cell.row}-${cell.col}`).join('|');
      const selectionSet = new Set(selection.map(cell => `${cell.row}-${cell.col}`));
      const matchedPlacement = puzzle.placements.find(placement => {
        const forwardKey = placement.positions.map(pos => `${pos.row}-${pos.col}`).join('|');
        if (selectionKey === forwardKey) return true;
        const backwardKey = [...placement.positions].reverse().map(pos => `${pos.row}-${pos.col}`).join('|');
        if (selectionKey === backwardKey) return true;

        if (selection.length !== placement.positions.length) return false;
        return placement.positions.every(pos => selectionSet.has(`${pos.row}-${pos.col}`));
      });

      if (matchedPlacement) {
        setFoundWords(prev => {
          if (prev.includes(matchedPlacement.word)) {
            return prev;
          }
          const updated = [...prev, matchedPlacement.word];
          if (puzzle.placements.length && updated.length === puzzle.placements.length && !isComplete) {
            setIsComplete(true);
            if (onSolved) {
              onSolved();
            }
          }
          return updated;
        });
      }
    }

    setIsSelecting(false);
    setSelection([]);
    setSelectionDirection(null);
    activePointerIdRef.current = null;
  }, [selection, puzzle, isComplete, onSolved]);

  // handlePointerEnter and handleGlobalPointerMove must be declared BEFORE the
  // useEffect below that lists handleGlobalPointerMove in its dependency array.
  // Declaring them after that useEffect causes a Temporal Dead Zone (TDZ)
  // ReferenceError when SpellingWordSearch mounts.
  const handlePointerEnter = useCallback((row, col) => {
    if (!isSelecting || !selection.length) return;

    const last = selection[selection.length - 1];
    if (last.row === row && last.col === col) return;

    if (selection.some(cell => cell.row === row && cell.col === col)) return;

    const deltaRow = row - last.row;
    const deltaCol = col - last.col;

    if (Math.abs(deltaRow) > 1 || Math.abs(deltaCol) > 1) return;

    const normalized = {
      dx: deltaRow === 0 ? 0 : deltaRow / Math.abs(deltaRow),
      dy: deltaCol === 0 ? 0 : deltaCol / Math.abs(deltaCol)
    };

    const direction = selectionDirection || normalized;

    if (direction.dx !== normalized.dx || direction.dy !== normalized.dy) return;

    const expectedRow = last.row + direction.dx;
    const expectedCol = last.col + direction.dy;

    if (row !== expectedRow || col !== expectedCol) return;

    if (!selectionDirection) {
      setSelectionDirection(direction);
    }

    setSelection(prev => [...prev, { row, col }]);
  }, [isSelecting, selection, selectionDirection]);

  const handleGlobalPointerMove = useCallback((event) => {
    if (activePointerIdRef.current !== null && typeof event?.pointerId === 'number') {
      if (event.pointerId !== activePointerIdRef.current) {
        return;
      }
    }

    const point = event?.touches?.[0] || event?.changedTouches?.[0] || event;
    if (!point) return;

    if (event?.cancelable) {
      event.preventDefault();
    }

    if (typeof document === 'undefined') return;

    const target = document.elementFromPoint(point.clientX, point.clientY);
    if (!target) return;

    const cellKey = target.getAttribute?.('data-cell');
    if (!cellKey) return;

    const [row, col] = cellKey.split('-').map(Number);
    if (Number.isNaN(row) || Number.isNaN(col)) return;

    handlePointerEnter(row, col);
  }, [handlePointerEnter]);

  useEffect(() => {
    if (!isSelecting) return;

    const handlePointerUp = event => {
      if (activePointerIdRef.current !== null && typeof event?.pointerId === 'number') {
        if (event.pointerId !== activePointerIdRef.current) {
          return;
        }
      }

      handleGlobalPointerMove(event);

      activePointerIdRef.current = null;
      finalizeSelection();
    };

    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    window.addEventListener('touchcancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('touchcancel', handlePointerUp);
    };
  }, [isSelecting, finalizeSelection, handleGlobalPointerMove]);

  const handlePointerDown = useCallback((event, row, col) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }

    const pointerId = typeof event?.pointerId === 'number' ? event.pointerId : null;
    activePointerIdRef.current = pointerId;

    if (pointerId !== null && event?.currentTarget?.setPointerCapture) {
      try {
        event.currentTarget.setPointerCapture(pointerId);
      } catch {
        // Ignore pointer capture issues on unsupported devices/elements
      }
    }

    setIsSelecting(true);
    setSelection([{ row, col }]);
    setSelectionDirection(null);
  }, []);

  const handlePointerUp = useCallback(event => {
    if (!isSelecting) return;

    if (typeof event?.pointerId === 'number' && activePointerIdRef.current !== null) {
      if (event.pointerId !== activePointerIdRef.current) {
        return;
      }
    }

    handleGlobalPointerMove(event);

    activePointerIdRef.current = null;
    finalizeSelection();
  }, [isSelecting, finalizeSelection, handleGlobalPointerMove]);

  useEffect(() => {
    if (!isSelecting) return;
    if (typeof window === 'undefined') return;

    const moveListener = (event) => {
      handleGlobalPointerMove(event);
    };

    window.addEventListener('pointermove', moveListener, { passive: false });
    window.addEventListener('touchmove', moveListener, { passive: false });

    return () => {
      window.removeEventListener('pointermove', moveListener);
      window.removeEventListener('touchmove', moveListener);
    };
  }, [isSelecting, handleGlobalPointerMove]);

  const foundCells = useMemo(() => {
    if (!puzzle || !puzzle.placements) return new Set();
    const set = new Set();
    puzzle.placements.forEach(placement => {
      if (foundWords.includes(placement.word)) {
        placement.positions.forEach(pos => set.add(`${pos.row}-${pos.col}`));
      }
    });
    return set;
  }, [puzzle, foundWords]);

  const activeCells = useMemo(() => {
    const set = new Set();
    selection.forEach(cell => set.add(`${cell.row}-${cell.col}`));
    return set;
  }, [selection]);

  if (!puzzle || !puzzle.grid.length) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-6 text-center">
        <p className="text-slate-600">Not enough words to build a word search yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-indigo-200 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-indigo-700">Interactive Word Search</h3>
          <p className="text-sm text-indigo-600">Tap and drag to highlight each hidden spelling word.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const newPuzzle = createWordSearchPuzzle(words);
              setPuzzle(newPuzzle);
              setFoundWords([]);
              setSelection([]);
              setSelectionDirection(null);
              setIsSelecting(false);
              setIsComplete(false);
            }}
            className="px-3 py-2 text-sm font-semibold rounded-lg bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50"
          >
            🔁 Shuffle Puzzle
          </button>
          <button
            onClick={() => {
              setFoundWords([]);
              setSelection([]);
              setSelectionDirection(null);
              setIsSelecting(false);
              setIsComplete(false);
            }}
            className="px-3 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            ♻️ Reset Progress
          </button>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <div
          className="grid mx-auto"
          style={{
            gap: `${gridGap}px`,
            gridTemplateColumns: `repeat(${puzzle.grid.length}, ${cellSize}px)`,
            gridAutoRows: `${cellSize}px`,
            touchAction: 'none'
          }}
        >
          {puzzle.grid.map((row, rowIndex) =>
            row.map((letter, colIndex) => {
              const key = `${rowIndex}-${colIndex}`;
              const isFound = foundCells.has(key);
              const isActive = activeCells.has(key);

              return (
                <div
                  key={key}
                  data-cell={key}
                  className={`relative select-none rounded-md flex items-center justify-center font-bold text-sm sm:text-base uppercase transition-all duration-150 border ${
                    isFound
                      ? 'bg-green-500 text-white border-green-500'
                      : isActive
                        ? 'bg-yellow-300 text-slate-900 border-yellow-400'
                        : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                  }`}
                  onPointerDown={event => handlePointerDown(event, rowIndex, colIndex)}
                  onPointerEnter={() => handlePointerEnter(rowIndex, colIndex)}
                  onPointerUp={handlePointerUp}
                >
                  {letter}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold text-indigo-700 uppercase tracking-wide mb-2">Words to find</h4>
        <div className="flex flex-wrap gap-2">
          {puzzle.wordBank.map(word => {
            const isFound = foundWords.includes(word);
            return (
              <span
                key={word}
                className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                  isFound
                    ? 'bg-green-100 border-green-300 text-green-700 line-through'
                    : 'bg-white border-indigo-200 text-indigo-700'
                }`}
              >
                {word}
              </span>
            );
          })}
        </div>
        {isComplete && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 flex items-center gap-2">
            <span className="text-xl">🎉</span>
            <div>
              <p className="font-semibold">Puzzle complete!</p>
              <p className="text-sm">Amazing work finding every spelling word.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const generateCrosswordPuzzle = (words, size = 13) => {
  const normalizedWords = words
    .map((word, index) => ({
      raw: word,
      normalized: normalizeSpellingWord(word),
      index
    }))
    .filter(item => item.normalized.length >= 3 && item.normalized.length <= size - 1);

  const seen = new Set();
  const uniqueWords = [];
  normalizedWords.forEach(item => {
    if (!seen.has(item.normalized)) {
      seen.add(item.normalized);
      uniqueWords.push({
        ...item,
        id: `${item.normalized}_${item.index}`
      });
    }
  });

  if (!uniqueWords.length) {
    return {
      grid: [],
      placements: [],
      numberMap: new Map(),
      clues: []
    };
  }

  const sorted = uniqueWords.sort((a, b) => b.normalized.length - a.normalized.length);
  const selected = sorted.slice(0, Math.min(sorted.length, 9));

  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  const usage = new Map();
  const placements = [];

  const markUsage = (row, col, direction) => {
    const key = `${row}-${col}`;
    if (!usage.has(key)) {
      usage.set(key, new Set());
    }
    usage.get(key).add(direction);
  };

  const canPlaceWord = (wordObj, row, col, direction) => {
    const word = wordObj.normalized;

    if (direction === 'across') {
      if (col < 0 || col + word.length > size || row < 0 || row >= size) return false;
    } else {
      if (row < 0 || row + word.length > size || col < 0 || col >= size) return false;
    }

    for (let i = 0; i < word.length; i++) {
      const r = direction === 'across' ? row : row + i;
      const c = direction === 'across' ? col + i : col;

      if (r < 0 || r >= size || c < 0 || c >= size) {
        return false;
      }

      const existing = grid[r][c];

      if (existing && existing !== word[i]) {
        return false;
      }

      const key = `${r}-${c}`;
      if (existing) {
        const existingUsage = usage.get(key);
        if (existingUsage && existingUsage.has(direction)) {
          return false;
        }
      } else {
        if (direction === 'across') {
          if ((r > 0 && grid[r - 1][c]) || (r < size - 1 && grid[r + 1][c])) return false;
        } else {
          if ((c > 0 && grid[r][c - 1]) || (c < size - 1 && grid[r][c + 1])) return false;
        }
      }
    }

    if (direction === 'across') {
      if (col > 0 && grid[row][col - 1]) return false;
      if (col + word.length < size && grid[row][col + word.length]) return false;
    } else {
      if (row > 0 && grid[row - 1][col]) return false;
      if (row + word.length < size && grid[row + word.length][col]) return false;
    }

    return true;
  };

  const placeWord = (wordObj, row, col, direction) => {
    const word = wordObj.normalized;
    const positions = [];

    for (let i = 0; i < word.length; i++) {
      const r = direction === 'across' ? row : row + i;
      const c = direction === 'across' ? col + i : col;
      grid[r][c] = word[i];
      positions.push({ row: r, col: c });
      markUsage(r, c, direction);
    }

    placements.push({
      id: wordObj.id,
      word,
      display: wordObj.raw,
      row,
      col,
      direction,
      length: word.length,
      listIndex: wordObj.index,
      positions,
      number: 0
    });
  };

  const tryToPlaceWord = (wordObj) => {
    let placed = false;

    const shuffledPlaced = shuffleArray(placements);

    for (const placedWord of shuffledPlaced) {
      for (let i = 0; i < wordObj.normalized.length && !placed; i++) {
        const letter = wordObj.normalized[i];
        for (let j = 0; j < placedWord.word.length && !placed; j++) {
          if (placedWord.word[j] !== letter) continue;

          const direction = placedWord.direction === 'across' ? 'down' : 'across';
          const startRow = placedWord.direction === 'across'
            ? placedWord.row - i
            : placedWord.row + j;
          const startCol = placedWord.direction === 'across'
            ? placedWord.col + j
            : placedWord.col - i;

          if (canPlaceWord(wordObj, startRow, startCol, direction)) {
            placeWord(wordObj, startRow, startCol, direction);
            placed = true;
          }
        }
      }
    }

    if (!placed) {
      const directions = shuffleArray(['across', 'down']);
      for (const direction of directions) {
        for (let row = 1; row < size - 1 && !placed; row++) {
          for (let col = 1; col < size - 1 && !placed; col++) {
            if (canPlaceWord(wordObj, row, col, direction)) {
              placeWord(wordObj, row, col, direction);
              placed = true;
            }
          }
        }
      }
    }
  };

  const centerRow = Math.floor(size / 2);
  const firstWord = selected[0];
  const startCol = Math.max(1, Math.floor((size - firstWord.normalized.length) / 2));
  placeWord(firstWord, centerRow, startCol, 'across');

  for (let i = 1; i < selected.length; i++) {
    tryToPlaceWord(selected[i]);
  }

  const numberMap = new Map();
  const sortedPlacements = [...placements].sort((a, b) => {
    if (a.row !== b.row) return a.row - b.row;
    return a.col - b.col;
  });

  let counter = 1;
  sortedPlacements.forEach(word => {
    const key = `${word.row}-${word.col}`;
    if (!numberMap.has(key)) {
      numberMap.set(key, counter++);
    }
    word.number = numberMap.get(key);
  });

  const clues = placements
    .map(word => ({
      id: word.id,
      number: word.number,
      direction: word.direction,
      answer: word.word,
      display: word.display,
      listIndex: word.listIndex,
      positions: word.positions,
      clue: `List word ${word.listIndex + 1} (starts with "${word.display?.charAt(0)?.toUpperCase()}" · ${word.length} letters)`
    }))
    .sort((a, b) => {
      if (a.number !== b.number) return a.number - b.number;
      return a.direction.localeCompare(b.direction);
    });

  return {
    grid,
    placements,
    numberMap,
    clues
  };
};

const createEmptyUserGrid = (grid) => grid.map(row => row.map(cell => (cell ? '' : null)));

const SpellingCrossword = ({ words, onSolved }) => {
  const [puzzle, setPuzzle] = useState(() => generateCrosswordPuzzle(words));
  const [userGrid, setUserGrid] = useState(() => createEmptyUserGrid(puzzle.grid || []));
  const [activeClueId, setActiveClueId] = useState(null);
  const [isSolved, setIsSolved] = useState(false);

  const signature = useMemo(() => buildWordSignature(words), [words]);

  useEffect(() => {
    const nextPuzzle = generateCrosswordPuzzle(words);
    setPuzzle(nextPuzzle);
    setUserGrid(createEmptyUserGrid(nextPuzzle.grid || []));
    setActiveClueId(null);
    setIsSolved(false);
  }, [signature, words]);

  const handleInputChange = (row, col, value) => {
    const letter = value.slice(-1).toUpperCase().replace(/[^A-Z]/g, '');
    setUserGrid(prev => {
      const next = prev.map(r => [...r]);
      if (next[row]) {
        next[row][col] = letter;
      }
      return next;
    });
  };

  const checkSolved = useCallback((currentGrid, currentPuzzle) => {
    if (!currentPuzzle.grid.length) return false;

    for (let row = 0; row < currentPuzzle.grid.length; row++) {
      for (let col = 0; col < currentPuzzle.grid[row].length; col++) {
        const solution = currentPuzzle.grid[row][col];
        if (!solution) continue;
        if (currentGrid[row]?.[col] !== solution) {
          return false;
        }
      }
    }
    return true;
  }, []);

  useEffect(() => {
    if (!puzzle.grid.length) return;
    if (isSolved) return;

    if (checkSolved(userGrid, puzzle)) {
      setIsSolved(true);
      if (onSolved) {
        onSolved();
      }
    }
  }, [userGrid, puzzle, checkSolved, isSolved, onSolved]);

  const handleCellFocus = (row, col) => {
    if (!puzzle.placements.length) return;
    const wordsAtCell = puzzle.placements.filter(word =>
      word.positions.some(pos => pos.row === row && pos.col === col)
    );
    if (!wordsAtCell.length) return;
    const preferred = wordsAtCell.find(word => word.direction === 'across') || wordsAtCell[0];
    setActiveClueId(preferred.id);
  };

  const handleClueClick = (clueId) => {
    setActiveClueId(clueId);
  };

  const resetAnswers = () => {
    setUserGrid(createEmptyUserGrid(puzzle.grid || []));
    setIsSolved(false);
  };

  const regeneratePuzzle = () => {
    const nextPuzzle = generateCrosswordPuzzle(words);
    setPuzzle(nextPuzzle);
    setUserGrid(createEmptyUserGrid(nextPuzzle.grid || []));
    setActiveClueId(null);
    setIsSolved(false);
  };

  const activeCells = useMemo(() => {
    if (!activeClueId) return new Set();
    const clue = puzzle.placements.find(word => word.id === activeClueId);
    if (!clue) return new Set();
    const set = new Set();
    clue.positions.forEach(pos => set.add(`${pos.row}-${pos.col}`));
    return set;
  }, [activeClueId, puzzle]);

  if (!puzzle.grid.length) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-6 text-center">
        <p className="text-slate-600">Add a few more words to unlock the crossword challenge.</p>
      </div>
    );
  }

  const acrossClues = puzzle.clues.filter(clue => clue.direction === 'across');
  const downClues = puzzle.clues.filter(clue => clue.direction === 'down');

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl border border-orange-200 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-orange-700">Classroom Crossword</h3>
          <p className="text-sm text-orange-600">Type your spelling words into the grid using the clues.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={regeneratePuzzle}
            className="px-3 py-2 text-sm font-semibold rounded-lg bg-white text-orange-600 border border-orange-200 hover:bg-orange-50"
          >
            🔁 New Crossword
          </button>
          <button
            onClick={resetAnswers}
            className="px-3 py-2 text-sm font-semibold rounded-lg bg-orange-600 text-white hover:bg-orange-700"
          >
            ♻️ Clear Answers
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${puzzle.grid.length}, minmax(0, 1fr))` }}
          >
            {puzzle.grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const key = `${rowIndex}-${colIndex}`;
                if (!cell) {
                  return <div key={key} className="aspect-square rounded-md bg-orange-200 opacity-40" />;
                }

                const number = puzzle.numberMap.get(key);
                const isActive = activeCells.has(key);
                const value = userGrid[rowIndex]?.[colIndex] || '';
                const isCorrect = value && value === cell;

                return (
                  <div
                    key={key}
                    className={`relative aspect-square border-2 rounded-md overflow-hidden ${
                      isActive
                        ? 'border-orange-500 bg-white'
                        : 'border-orange-200 bg-white'
                    } ${isCorrect ? 'shadow-inner shadow-orange-200' : ''}`}
                  >
                    {number && (
                      <span className="absolute top-0.5 left-1 text-[0.65rem] font-semibold text-orange-500">
                        {number}
                      </span>
                    )}
                    <input
                      value={value}
                      onChange={(e) => handleInputChange(rowIndex, colIndex, e.target.value)}
                      onFocus={() => handleCellFocus(rowIndex, colIndex)}
                      className="w-full h-full text-center text-lg md:text-xl font-bold uppercase text-orange-700 bg-transparent focus:outline-none"
                      maxLength={1}
                      autoComplete="off"
                    />
                  </div>
                );
              })
            )}
          </div>
          {isSolved && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <div>
                <p className="font-semibold">Crossword complete!</p>
                <p className="text-sm">Every answer matches your spelling list perfectly.</p>
              </div>
            </div>
          )}
        </div>

        <div className="lg:w-1/2 space-y-4">
          <div className="bg-white rounded-xl border border-orange-100 p-4">
            <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-2">Across</h4>
            <ul className="space-y-2">
              {acrossClues.map(clue => (
                <li
                  key={clue.id}
                  onClick={() => handleClueClick(clue.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                    clue.id === activeClueId
                      ? 'bg-orange-100 border-orange-300 text-orange-800'
                      : 'bg-orange-50 border-orange-100 text-orange-700 hover:bg-orange-100'
                  }`}
                >
                  <p className="text-sm font-semibold">{clue.number}. {clue.clue}</p>
                  <p className="text-xs text-orange-500 mt-1">{clue.answer.length} letters</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-orange-100 p-4">
            <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-2">Down</h4>
            <ul className="space-y-2">
              {downClues.map(clue => (
                <li
                  key={clue.id}
                  onClick={() => handleClueClick(clue.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                    clue.id === activeClueId
                      ? 'bg-orange-100 border-orange-300 text-orange-800'
                      : 'bg-orange-50 border-orange-100 text-orange-700 hover:bg-orange-100'
                  }`}
                >
                  <p className="text-sm font-semibold">{clue.number}. {clue.clue}</p>
                  <p className="text-xs text-orange-500 mt-1">{clue.answer.length} letters</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentSpelling = ({
  studentData,
  classData,
  showToast,
  updateStudentData
}) => {
  const [studentAssignments, setStudentAssignments] = useState(null);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [activeActivity, setActiveActivity] = useState(null);
  const [showBee, setShowBee] = useState(false);
  const [selectedListId, setSelectedListId] = useState(null);
  const [selectedTextType, setSelectedTextType] = useState('narrative');
  const [passageFontSize, setPassageFontSize] = useState(16);
  const [expandedPassage, setExpandedPassage] = useState(false);

  const passageMap = useMemo(() => {
    const map = {};
    READING_PASSAGES.forEach(passage => {
      map[passage.id] = passage;
    });
    return map;
  }, []);

  useEffect(() => {
    if (studentData && classData) {
      findStudentAssignments();
      loadCompletedActivities();
    }
  }, [studentData, classData]);

  useEffect(() => {
    if (studentAssignments?.lists?.length) {
      setSelectedListId(prev => {
        if (prev && studentAssignments.lists.some(list => list.id === prev)) {
          return prev;
        }
        return studentAssignments.lists[0].id;
      });
    } else {
      setSelectedListId(null);
    }
  }, [studentAssignments]);

  const selectedList = useMemo(() => {
    if (!studentAssignments?.lists?.length) return null;
    return studentAssignments.lists.find(list => list.id === selectedListId) || studentAssignments.lists[0];
  }, [studentAssignments, selectedListId]);

  const selectedWords = selectedList?.words || [];

  const findStudentAssignments = () => {
    if (!studentData) {
      setStudentAssignments(null);
      return;
    }

    // Get spelling groups from class toolkit data
    const spellingGroups = Array.isArray(classData?.toolkitData?.spellingGroups)
      ? classData.toolkitData.spellingGroups
      : [];

    // Find which group this student belongs to
    const studentGroup = spellingGroups.find(group =>
      Array.isArray(group?.students) && group.students.some(s => s.id === studentData.id)
    );

    const assignedLists = (studentGroup?.assignedLists || [])
      .map(listId => {
        const baseList = SPELLING_LISTS.find(list => list.id === listId);
        if (!baseList) return null;
        const passage = passageMap[listId];
        return {
          ...baseList,
          passage,
          texts: passage?.texts || []
        };
      })
      .filter(Boolean);

    if (studentGroup && assignedLists.length > 0) {
      setStudentAssignments({
        groupName: studentGroup.name,
        groupColor: studentGroup.color,
        lists: assignedLists
      });
    } else {
      setStudentAssignments(null);
    }
  };

  const getWeekKey = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const week = Math.floor((now - start) / (1000 * 60 * 60 * 24 * 7));
    return `${now.getFullYear()}-W${week}`;
  };

  const getStorageKey = () => `spelling_activities_${studentData.id}_${getWeekKey()}`;

  const loadCompletedActivities = () => {
    const weekKey = getWeekKey();
    // Prefer progress saved on the student record (syncs across devices)
    const saved = studentData?.spellingActivityProgress;
    if (saved?.weekKey === weekKey && Array.isArray(saved.completed)) {
      setCompletedActivities(saved.completed);
      return;
    }
    try {
      const stored = localStorage.getItem(getStorageKey());
      setCompletedActivities(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error('Error loading completed activities:', error);
      setCompletedActivities([]);
    }
  };

  const markActivityComplete = async (activityId) => {
    if (completedActivities.includes(activityId)) return;

    const updated = [...completedActivities, activityId];
    setCompletedActivities(updated);

    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving completed activities:', error);
    }

    const reachedGoal = updated.length === SPELLING_REWARDS.WEEKLY_GOAL;
    let xp = SPELLING_REWARDS.ACTIVITY_XP;
    let coins = SPELLING_REWARDS.ACTIVITY_COINS;
    if (reachedGoal) {
      xp += SPELLING_REWARDS.GOAL_BONUS_XP;
      coins += SPELLING_REWARDS.GOAL_BONUS_COINS;
    }

    if (updateStudentData) {
      await updateStudentData({
        spellingActivityProgress: { weekKey: getWeekKey(), completed: updated },
        totalPoints: (studentData?.totalPoints || 0) + xp,
        currency: (studentData?.currency || 0) + coins
      });
    }

    if (showToast) {
      if (reachedGoal) {
        showToast(`🏆 Weekly goal smashed! +${xp} XP, +${coins} coins!`, 'success');
      } else {
        showToast(`🎉 Activity complete! +${xp} XP, +${coins} coin${coins !== 1 ? 's' : ''} (${updated.length}/${SPELLING_REWARDS.WEEKLY_GOAL} this week)`, 'success');
      }
    }
  };

  const getProgressPercentage = () => Math.min((completedActivities.length / SPELLING_REWARDS.WEEKLY_GOAL) * 100, 100);

  // ── Spelling Bee: save best scores + rewards in ONE update ─────────────────
  const handleBeeFinished = async (result) => {
    const prevAll = studentData?.spellingBeeResults || {};
    const prev = prevAll[result.listId] || {};
    const beeResults = {
      ...prevAll,
      [result.listId]: {
        best: Math.max(prev.best || 0, result.score),
        total: result.total,
        stars: Math.max(prev.stars || 0, result.stars),
        attempts: (prev.attempts || 0) + 1,
        perfectRewarded: prev.perfectRewarded || false,
        lastPlayed: new Date().toISOString()
      }
    };

    let xp = 0;
    let coins = 0;
    const messages = [];
    const updates = { spellingBeeResults: beeResults };

    // Passing the Bee counts toward the weekly activity goal (once per week)
    if (result.passed && !completedActivities.includes('spelling_bee')) {
      const weekly = [...completedActivities, 'spelling_bee'];
      setCompletedActivities(weekly);
      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(weekly));
      } catch (error) {
        console.error('Error saving completed activities:', error);
      }
      updates.spellingActivityProgress = { weekKey: getWeekKey(), completed: weekly };
      xp += SPELLING_REWARDS.ACTIVITY_XP;
      coins += SPELLING_REWARDS.ACTIVITY_COINS;
      if (weekly.length === SPELLING_REWARDS.WEEKLY_GOAL) {
        xp += SPELLING_REWARDS.GOAL_BONUS_XP;
        coins += SPELLING_REWARDS.GOAL_BONUS_COINS;
        messages.push('🏆 Weekly goal smashed!');
      } else {
        messages.push(`🐝 Bee passed! (${weekly.length}/${SPELLING_REWARDS.WEEKLY_GOAL} this week)`);
      }
    }

    // One-time bonus for a first PERFECT round on this list
    if (result.stars === 3 && !prev.perfectRewarded) {
      beeResults[result.listId].perfectRewarded = true;
      xp += 10;
      coins += 2;
      messages.push('💯 First perfect round on this list!');
    }

    if (xp || coins) {
      updates.totalPoints = (studentData?.totalPoints || 0) + xp;
      updates.currency = (studentData?.currency || 0) + coins;
    }

    if (updateStudentData) {
      await updateStudentData(updates);
    }

    if (showToast && (xp || coins)) {
      showToast(`${messages.join(' ')} +${xp} XP, +${coins} coin${coins !== 1 ? 's' : ''}!`, 'success');
    }
  };

  if (!studentAssignments) {
    return (
      <div className="bg-white rounded-xl p-6 md:p-8 text-center">
        <div className="text-4xl md:text-6xl mb-4">📤</div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">No Spelling Assignment</h2>
        <p className="text-gray-600 text-sm md:text-base leading-relaxed">
          Your teacher hasn't assigned you to a spelling group yet, or there are no spelling lists assigned to your group.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <p className="text-blue-800 text-sm">
            📣 <strong>Ask your teacher</strong> to assign you to a spelling group in the Resource Hub!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── HEADER ── */}
      <div className={`${studentAssignments.groupColor} text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm`}>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">📝 My Spelling</h1>
          <p className="text-white/80 text-sm mt-0.5">{studentAssignments.groupName} · {studentAssignments.lists.length} list{studentAssignments.lists.length !== 1 ? 's' : ''} assigned</p>
        </div>
      </div>

      {/* ── LIST TABS (if multiple lists assigned) ── */}
      {studentAssignments.lists.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {studentAssignments.lists.map(list => (
            <button
              key={list.id}
              onClick={() => setSelectedListId(list.id)}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all border ${
                selectedListId === list.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              {list.id} — {list.feature}
            </button>
          ))}
        </div>
      )}

      {selectedList ? (
        <>
          {/* ── SECTION 1: SPELLING WORDS ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-4">
              <h2 className="text-lg font-bold">{selectedList.name}</h2>
              <p className="text-white/80 text-sm">{selectedList.feature}</p>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {selectedList.words.map((word, i) => (
                  <div key={i} className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-3 text-center select-text hover:shadow-sm transition-shadow">
                    <span className="text-lg font-bold text-gray-800">{word}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── SECTION 2: READING PASSAGE ── */}
          {selectedList.passage && selectedList.texts?.length > 0 && (() => {
            const passageText = selectedList.texts.find(t => t.type === selectedTextType) || selectedList.texts[0];
            return (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <div>
                    <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">📖 Connected Reading</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{selectedList.passage.level}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Text type tabs */}
                    {selectedList.texts.length > 1 && (
                      <div className="flex gap-1 flex-wrap">
                        {selectedList.texts.map(text => (
                          <button
                            key={text.type}
                            onClick={() => setSelectedTextType(text.type)}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition capitalize ${
                              selectedTextType === text.type ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {text.type}
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Font size controls */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-xl px-2 py-1">
                      <button onClick={() => setPassageFontSize(s => Math.max(s - 2, 12))} className="text-gray-500 hover:text-gray-800 text-xs font-bold px-1">A−</button>
                      <span className="text-xs text-gray-400 w-8 text-center">{passageFontSize}px</span>
                      <button onClick={() => setPassageFontSize(s => Math.min(s + 2, 28))} className="text-gray-500 hover:text-gray-800 text-sm font-bold px-1">A+</button>
                    </div>
                    <button
                      onClick={() => setExpandedPassage(true)}
                      className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1.5 rounded-xl hover:bg-indigo-100 font-semibold"
                    >
                      ⛶ Full screen
                    </button>
                  </div>
                </div>
                {passageText && (
                  <div className="p-5">
                    <div className="flex items-baseline gap-3 mb-3">
                      <h3 className="text-lg font-bold text-gray-800">{passageText.title}</h3>
                      <span className="text-sm text-gray-400">{passageText.wordCount} words</span>
                    </div>
                    <div
                      className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-2xl p-4 max-h-72 overflow-y-auto"
                      style={{ fontSize: `${passageFontSize}px` }}
                    >
                      {passageText.content}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-3">📝</div>
          <p className="text-yellow-800 font-medium">No spelling lists assigned to your group yet — check back later!</p>
        </div>
      )}

      {/* ── SPELLING BEE (featured) ── */}
      {selectedList && selectedWords.length > 0 && (
        isBeeCompatible(selectedList) ? (
          <button
            onClick={() => setShowBee(true)}
            className="w-full text-left bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-2xl px-5 py-4 shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl">🐝</span>
              <div>
                <h2 className="text-lg font-extrabold text-amber-900">Spelling Bee Challenge</h2>
                <p className="text-sm text-amber-800/80 font-semibold">Hear each word out loud, spell it with no peeking — the real test!</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              {studentData?.spellingBeeResults?.[selectedList.id] ? (
                <>
                  <div className="text-xl">{'⭐'.repeat(studentData.spellingBeeResults[selectedList.id].stars || 0) || '☆'}</div>
                  <div className="text-xs font-bold text-amber-900/70">
                    Best: {studentData.spellingBeeResults[selectedList.id].best}/{studentData.spellingBeeResults[selectedList.id].total}
                  </div>
                </>
              ) : (
                <span className="px-3 py-1.5 bg-white/80 rounded-xl text-sm font-extrabold text-amber-700">Take the test →</span>
              )}
            </div>
          </button>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-sm text-amber-700 font-semibold">
            🐝 The Spelling Bee is off for this list — these words sound the same out loud! Practise them with the games below instead.
          </div>
        )
      )}

      {/* ── SECTION 3: SPELLING ACTIVITIES (interactive) ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">🎮 Spelling Activities</h2>
              <p className="text-sm text-gray-500 mt-0.5">Tap any card to play a game using your spelling words!</p>
            </div>
            <div className="min-w-[180px]">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-gray-500">⭐ Weekly goal</span>
                <span className={completedActivities.length >= SPELLING_REWARDS.WEEKLY_GOAL ? 'text-green-600' : 'text-indigo-600'}>
                  {Math.min(completedActivities.length, SPELLING_REWARDS.WEEKLY_GOAL)}/{SPELLING_REWARDS.WEEKLY_GOAL}
                  {completedActivities.length >= SPELLING_REWARDS.WEEKLY_GOAL ? ' 🏆' : ''}
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completedActivities.length >= SPELLING_REWARDS.WEEKLY_GOAL
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                      : 'bg-gradient-to-r from-indigo-400 to-purple-500'
                  }`}
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="p-5">
          {(!selectedList || !selectedWords.length) ? (
            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center text-sm text-gray-500">
              Your spelling list needs words assigned to unlock the activities.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {ALL_ACTIVITIES.map(activity => {
                const isDone = completedActivities.includes(activity.id);
                return (
                  <button
                    key={activity.id}
                    onClick={() => setActiveActivity(activity)}
                    className={`relative rounded-2xl p-3 text-center text-white bg-gradient-to-br ${activity.gradient} shadow-sm hover:shadow-lg hover:scale-105 transition-all ${
                      isDone ? 'ring-4 ring-green-300' : ''
                    }`}
                  >
                    {isDone && (
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow border-2 border-white">✓</span>
                    )}
                    <div className="text-3xl mb-1.5 drop-shadow">{activity.icon}</div>
                    <div className="text-xs font-extrabold leading-tight drop-shadow">{activity.name}</div>
                    <div className="text-[10px] text-white/80 font-semibold mt-0.5 leading-tight">{activity.tagline}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── EXPANDED PASSAGE MODAL ── */}
      {expandedPassage && selectedList && (() => {
        const passageText = selectedList.texts?.find(t => t.type === selectedTextType) || selectedList.texts?.[0];
        return passageText ? (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-5 border-b flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{passageText.title}</h2>
                  <p className="text-sm text-gray-500">{selectedList.passage?.level} · {passageText.type} · {passageText.wordCount} words</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-xl px-2 py-1">
                    <button onClick={() => setPassageFontSize(s => Math.max(s - 2, 12))} className="text-gray-500 text-xs font-bold px-1">A−</button>
                    <span className="text-xs text-gray-400 w-8 text-center">{passageFontSize}px</span>
                    <button onClick={() => setPassageFontSize(s => Math.min(s + 2, 30))} className="text-gray-500 text-sm font-bold px-1">A+</button>
                  </div>
                  <button onClick={() => setExpandedPassage(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <div className="text-gray-800 leading-loose whitespace-pre-wrap" style={{ fontSize: `${passageFontSize}px` }}>
                  {passageText.content}
                </div>
              </div>
            </div>
          </div>
        ) : null;
      })()}

      {/* ── SPELLING BEE MODAL ── */}
      {showBee && selectedList && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl">
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-5 py-4 rounded-t-2xl flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🐝</span>
                <div>
                  <h2 className="text-lg font-extrabold leading-tight">Spelling Bee</h2>
                  <p className="text-white/80 text-xs font-semibold">{selectedList.name}</p>
                </div>
              </div>
              <button onClick={() => setShowBee(false)} className="text-white/70 hover:text-white text-3xl leading-none font-bold">×</button>
            </div>
            <div className="p-4 sm:p-5 overflow-y-auto flex-1">
              <SpellingBee
                key={`bee-${selectedList.id}`}
                list={selectedList}
                previousBest={studentData?.spellingBeeResults?.[selectedList.id] || null}
                onFinished={handleBeeFinished}
                onExit={() => setShowBee(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── ACTIVITY GAME MODAL ── */}
      {activeActivity && selectedList && (() => {
        const isDone = completedActivities.includes(activeActivity.id);
        const closeActivity = () => setActiveActivity(null);
        const handleComplete = () => markActivityComplete(activeActivity.id);
        const GameComponent = activeActivity.component;
        return (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl">
              <div className={`bg-gradient-to-r ${activeActivity.gradient} text-white px-5 py-4 rounded-t-2xl flex items-center justify-between flex-shrink-0`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl drop-shadow">{activeActivity.icon}</span>
                  <div>
                    <h2 className="text-lg font-extrabold leading-tight">{activeActivity.name}</h2>
                    <p className="text-white/80 text-xs font-semibold">{selectedList.name}{isDone ? ' · ✓ completed this week' : ''}</p>
                  </div>
                </div>
                <button onClick={closeActivity} className="text-white/70 hover:text-white text-3xl leading-none font-bold">×</button>
              </div>
              <div className="p-4 sm:p-5 overflow-y-auto flex-1">
                {activeActivity.id === 'digital_word_search' ? (
                  <SpellingWordSearch key={`word-search-${selectedList.id}`} words={selectedWords} onSolved={handleComplete} />
                ) : activeActivity.id === 'digital_crossword' ? (
                  <SpellingCrossword key={`crossword-${selectedList.id}`} words={selectedWords} onSolved={handleComplete} />
                ) : GameComponent ? (
                  <GameComponent key={`${activeActivity.id}-${selectedList.id}`} words={selectedWords} onComplete={handleComplete} onExit={closeActivity} />
                ) : null}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default StudentSpelling;