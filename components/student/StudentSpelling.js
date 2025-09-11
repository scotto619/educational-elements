// components/student/StudentSpelling.js
import React, { useState, useEffect } from 'react';

// Import spelling lists from the main program
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

// Import spelling activities
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

const StudentSpelling = ({ 
  studentData, 
  classData, 
  showToast 
}) => {
  const [studentAssignments, setStudentAssignments] = useState(null);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [showActivityInstructions, setShowActivityInstructions] = useState(null);

  useEffect(() => {
    if (studentData && classData) {
      findStudentAssignments();
      loadCompletedActivities();
    }
  }, [studentData, classData]);

  const findStudentAssignments = () => {
    // Get spelling groups from class toolkit data
    const spellingGroups = classData?.toolkitData?.spellingGroups || [];
    
    // Find which group this student belongs to
    const studentGroup = spellingGroups.find(group => 
      group.students.some(s => s.id === studentData.id)
    );

    if (studentGroup) {
      // Get assigned spelling lists
      const assignedLists = studentGroup.assignedLists.map(listId => 
        SPELLING_LISTS.find(list => list.id === listId)
      ).filter(Boolean);

      setStudentAssignments({
        groupName: studentGroup.name,
        groupColor: studentGroup.color,
        lists: assignedLists
      });
    } else {
      setStudentAssignments(null);
    }
  };

  const getCurrentWeek = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek);
  };

  const getStorageKey = () => {
    const week = getCurrentWeek();
    return `spelling_activities_${studentData.id}_week_${week}`;
  };

  const loadCompletedActivities = () => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        setCompletedActivities(JSON.parse(stored));
      } else {
        setCompletedActivities([]);
      }
    } catch (error) {
      console.error('Error loading completed activities:', error);
      setCompletedActivities([]);
    }
  };

  const saveCompletedActivities = (activities) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(activities));
      setCompletedActivities(activities);
    } catch (error) {
      console.error('Error saving completed activities:', error);
    }
  };

  const toggleActivity = (activityId) => {
    const newCompleted = completedActivities.includes(activityId)
      ? completedActivities.filter(id => id !== activityId)
      : [...completedActivities, activityId];
    
    saveCompletedActivities(newCompleted);
    
    if (newCompleted.includes(activityId)) {
      if (showToast) {
        showToast(`Activity completed! ${newCompleted.length}/5 activities done this week.`, 'success');
      }
    }
  };

  const getProgressPercentage = () => {
    return Math.min((completedActivities.length / 5) * 100, 100);
  };

  const getProgressColor = () => {
    const completed = completedActivities.length;
    if (completed >= 5) return 'bg-green-500';
    if (completed >= 3) return 'bg-yellow-500';
    return 'bg-blue-500';
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
            📣 <strong>Ask your teacher</strong> to assign you to a spelling group in the Curriculum Corner!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${studentAssignments.groupColor} text-white rounded-xl p-6 md:p-8`}>
        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 flex items-center justify-center">
            <span className="mr-3">📝</span>
            My Spelling Words
          </h1>
          <div className="text-lg md:text-xl opacity-90">
            {studentAssignments.groupName}
          </div>
          <div className="text-sm md:text-base opacity-80 mt-2">
            {studentAssignments.lists.length} spelling list{studentAssignments.lists.length !== 1 ? 's' : ''} assigned
          </div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">🎯 Weekly Spelling Challenge</h2>
          <p className="text-gray-600">Complete 5 different spelling activities this week!</p>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progress: {completedActivities.length}/5 activities
            </span>
            <span className="text-sm font-medium text-gray-700">
              {Math.round(getProgressPercentage())}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>

        {completedActivities.length >= 5 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🎉</div>
            <h3 className="text-lg font-bold text-green-800">Congratulations!</h3>
            <p className="text-green-700">You've completed your weekly spelling challenge!</p>
          </div>
        )}
      </div>

      {/* Spelling Activities Grid */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 md:p-6 rounded-t-xl">
          <h2 className="text-xl md:text-2xl font-bold text-center">🎲 Choose Your Spelling Activities</h2>
          <p className="text-sm md:text-base opacity-90 text-center mt-2">
            Pick any activities you'd like to try with your spelling words!
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACTIVITIES.map(activity => {
              const isCompleted = completedActivities.includes(activity.id);
              return (
                <div 
                  key={activity.id} 
                  className={`border-2 rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                    isCompleted 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                  }`}
                  onClick={() => toggleActivity(activity.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{activity.icon}</span>
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm md:text-base">
                          {activity.name}
                        </h3>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-300'
                    }`}>
                      {isCompleted && '✓'}
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActivityInstructions(activity);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    View Instructions
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spelling Lists */}
      <div className="grid gap-6">
        {studentAssignments.lists.map(list => (
          <div key={list.id} className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 md:p-6 rounded-t-xl">
              <h2 className="text-xl md:text-2xl font-bold text-center">{list.name}</h2>
              <p className="text-sm md:text-base opacity-90 text-center mt-2">{list.feature}</p>
              <div className="text-center mt-2">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                  {list.words.length} words to learn
                </span>
              </div>
            </div>
            
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {list.words.map((word, index) => (
                  <div 
                    key={index} 
                    className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-lg p-3 md:p-4 text-center hover:shadow-md transition-all duration-200 hover:scale-105"
                  >
                    <span className="text-lg md:text-xl font-bold text-gray-800 select-text">
                      {word}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Practice Tips */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">🎯 Spelling Practice Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-800 mb-2">📚 Study Tips:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Practice a little bit every day</li>
              <li>• Say the letters out loud as you write</li>
              <li>• Break long words into smaller parts</li>
              <li>• Use the words in sentences</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-bold text-green-800 mb-2">🏆 Challenge Yourself:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Try spelling words with your eyes closed</li>
              <li>• Write words in different fonts or styles</li>
              <li>• Make up memory tricks for tricky words</li>
              <li>• Teach the words to a friend or family member</li>
            </ul>
          </div>
        </div>
      </div>

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
              <h3 className="text-lg font-bold mb-4">📋 How to do this activity:</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-gray-800 leading-relaxed font-sans text-sm md:text-base">
                  {showActivityInstructions.instructions}
                </pre>
              </div>
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    toggleActivity(showActivityInstructions.id);
                    setShowActivityInstructions(null);
                  }}
                  className={`px-6 py-3 rounded-lg font-bold text-white transition-colors ${
                    completedActivities.includes(showActivityInstructions.id)
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {completedActivities.includes(showActivityInstructions.id) 
                    ? '✓ Mark as Not Done' 
                    : '✓ Mark as Done'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No assignments message */}
      {studentAssignments.lists.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">📝</div>
          <h2 className="text-xl font-bold text-yellow-800 mb-2">No Spelling Lists Yet</h2>
          <p className="text-yellow-700">
            Your teacher hasn't assigned any spelling lists to your group yet. Check back later!
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentSpelling;