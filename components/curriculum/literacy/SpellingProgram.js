// components/curriculum/literacy/SpellingProgram.js
// CLEAN SPELLING PROGRAM WITH 59 LEVEL 1 LISTS
import React, { useState, useEffect, useRef } from 'react';

// ===============================================
// ALL 59 SPELLING LISTS FROM DOCUMENT
// ===============================================
const SPELLING_LISTS = [
  { id: "1.1", name: "Level 1.1", words: ["in", "at", "it", "an", "sit", "sat"] },
  { id: "1.2", name: "Level 1.2", words: ["pat", "tap", "nap", "tin", "pin", "pit"] },
  { id: "1.3", name: "Level 1.3", words: ["pan", "nip", "sip", "tan", "tip", "pip"] },
  { id: "1.4", name: "Level 1.4", words: ["him", "red", "did", "can", "man", "ran"] },
  { id: "1.5", name: "Level 1.5", words: ["cat", "am", "hat", "sad", "dad", "had"] },
  { id: "1.6", name: "Level 1.6", words: ["set", "men", "met", "pet", "ten", "net"] },
  { id: "1.7", name: "Level 1.7", words: ["pen", "hen", "rat", "mat", "pad", "mad"] },
  { id: "1.8", name: "Level 1.8", words: ["hip", "cap", "map", "ram", "dip", "hid"] },
  { id: "1.9", name: "Level 1.9", words: ["leg", "get", "let", "run", "sun", "fun"] },
  { id: "1.10", name: "Level 1.10", words: ["but", "hot", "cut", "got", "not", "lot"] },
  { id: "1.11", name: "Level 1.11", words: ["bad", "bed", "us", "bit", "up", "dog"] },
  { id: "1.12", name: "Level 1.12", words: ["mum", "on", "top", "if", "pig", "big"] },
  { id: "1.13", name: "Level 1.13", words: ["gum", "hug", "bag", "fed", "bus", "gap"] },
  { id: "1.14", name: "Level 1.14", words: ["cup", "mud", "rod", "fan", "lip", "rub"] },
  { id: "1.15", name: "Level 1.15", words: ["yes", "wet", "jet", "yet", "vet", "kid"] },
  { id: "1.16", name: "Level 1.16", words: ["job", "jug", "zip", "van", "win", "web"] },
  { id: "1.17", name: "Level 1.17", words: ["but", "sad", "bed", "tub", "dam", "sob", "dip", "nod"] },
  { id: "1.18", name: "Level 1.18", words: ["shed", "fish", "ship", "rush", "shop", "dish", "shot", "wish"] },
  { id: "1.19", name: "Level 1.19", words: ["chop", "such", "chip", "much", "chin", "rich", "chat", "chest"] },
  { id: "1.20", name: "Level 1.20", words: ["lash", "shelf", "shut", "mash", "hush", "chap", "chug", "much"] },
  { id: "1.21", name: "Level 1.21", words: ["that", "them", "this", "then", "with", "moth", "than", "thick"] },
  { id: "1.22", name: "Level 1.22", words: ["cash", "shin", "shift", "such", "chum", "thin", "then", "thud"] },
  { id: "1.23", name: "Level 1.23", words: ["when", "whip", "which", "whiz", "whim", "wheel", "whack", "whacked"] },
  { id: "1.24", name: "Level 1.24", words: ["duck", "sock", "pick", "sick", "thick", "kick", "back", "neck"] },
  { id: "1.25", name: "Level 1.25", words: ["desk", "risk", "thank", "milk", "rock", "shack", "chick", "pack"] },
  { id: "1.26", name: "Level 1.26", words: ["week", "see", "been", "need", "keep", "seem", "feet", "teeth"] },
  { id: "1.27", name: "Level 1.27", words: ["meet", "cheek", "feel", "sheet", "wheel", "weed", "seed", "deep"] },
  { id: "1.28", name: "Level 1.28", words: ["food", "soon", "moon", "room", "tooth", "too", "zoo", "noon"] },
  { id: "1.29", name: "Level 1.29", words: ["root", "hoop", "roof", "mood", "boot", "booth", "shoot", "loop"] },
  { id: "1.30", name: "Level 1.30", words: ["cool", "book", "look", "took", "pool", "shook", "good", "wood"] },
  { id: "1.31", name: "Level 1.31", words: ["six", "box", "fox", "wax", "tax", "fix", "mix", "fax"] },
  { id: "1.32", name: "Level 1.32", words: ["quick", "quiz", "quit", "quits", "quack", "quacks", "quilt", "queen"] },
  { id: "1.33", name: "Level 1.33", words: ["twin", "plan", "frog", "step", "from", "stop", "swim", "flag"] },
  { id: "1.34", name: "Level 1.34", words: ["black", "smash", "three", "sleep", "flash", "green", "tree", "truck"] },
  { id: "1.35", name: "Level 1.35", words: ["drum", "block", "flap", "club", "snap", "track", "flip", "flat"] },
  { id: "1.36", name: "Level 1.36", words: ["trip", "drag", "plug", "crash", "clip", "drop", "spin", "glad"] },
  { id: "1.37", name: "Level 1.37", words: ["just", "left", "and", "lunch", "land", "hand", "went", "must"] },
  { id: "1.38", name: "Level 1.38", words: ["end", "help", "next", "list", "thank", "think", "pink", "best"] },
  { id: "1.39", name: "Level 1.39", words: ["told", "gold", "old", "cold", "felt", "jump", "hold", "milk"] },
  { id: "1.40", name: "Level 1.40", words: ["soft", "lost", "shift", "pond", "wind", "cost", "damp", "bend"] },
  { id: "1.41", name: "Level 1.41", words: ["broom", "snack", "west", "thump", "fresh", "hunt", "speed", "chunk"] },
  { id: "1.42", name: "Level 1.42", words: ["slept", "stand", "blend", "stamp", "plant", "drink", "upon", "until"] },
  { id: "1.43", name: "Level 1.43", words: ["day", "play", "say", "way", "stay", "may", "today", "away"] },
  { id: "1.44", name: "Level 1.44", words: ["paint", "rain", "chain", "train", "paid", "wait", "again", "nail"] },
  { id: "1.45", name: "Level 1.45", words: ["tail", "snail", "afraid", "trail", "tray", "delay", "clay", "sway"] },
  { id: "1.46", name: "Level 1.46", words: ["call", "fall", "all", "stall", "small", "ball", "wall", "tall"] },
  { id: "1.47", name: "Level 1.47", words: ["king", "swing", "bring", "sing", "thing", "long", "song", "along"] },
  { id: "1.48", name: "Level 1.48", words: ["north", "short", "torch", "storm", "sport", "form", "for", "horse"] },
  { id: "1.49", name: "Level 1.49", words: ["start", "hard", "car", "far", "garden", "card", "park", "dark"] },
  { id: "1.50", name: "Level 1.50", words: ["shark", "star", "chart", "march", "arch", "farm", "smart", "part"] },
  { id: "1.51", name: "Level 1.51", words: ["ever", "under", "never", "number", "her", "river", "sister", "term"] },
  { id: "1.52", name: "Level 1.52", words: ["report", "forget", "thorn", "corn", "scarf", "market", "sharp", "alarm"] },
  { id: "1.53", name: "Level 1.53", words: ["carpet", "spark", "charm", "clever", "winter", "jumper", "porch", "pork"] },
  { id: "1.54", name: "Level 1.54", words: ["boy", "toy", "enjoy", "royal", "oil", "point", "soil", "joint"] },
  { id: "1.55", name: "Level 1.55", words: ["faint", "grain", "claim", "slay", "pray", "joy", "moist", "join"] },
  { id: "1.56", name: "Level 1.56", words: ["a", "I", "is", "as", "his", "has", "was", "the"] },
  { id: "1.57", name: "Level 1.57", words: ["of", "for", "me", "be", "he", "we", "she", "are"] },
  { id: "1.58", name: "Level 1.58", words: ["to", "do", "who", "into", "you", "one", "two", "said"] },
  { id: "1.59", name: "Level 1.59", words: ["they", "more", "what", "have", "put", "pull", "so", "no", "go"] },
  
  // LEVEL 2 LISTS
  { id: "2.1", name: "Level 2.1", words: ["drink", "thank", "shrink", "thick", "shack", "chick", "quack", "quick", "queen", "quilt"] },
  { id: "2.2", name: "Level 2.2", words: ["away", "stay", "today", "delay", "again", "drain", "waist", "faith", "strain", "paint"] },
  { id: "2.3", name: "Level 2.3", words: ["point", "spoil", "joint", "moist", "noise", "royal", "loyal", "enjoy", "destroy", "employ"] },
  { id: "2.4", name: "Level 2.4", words: ["number", "finger", "anger", "clever", "garden", "starch", "farmer", "horse", "forget", "report"] },
  { id: "2.5", name: "Level 2.5", words: ["finished", "chicken", "o'clock", "Sunday", "holiday", "football", "morning", "dragon", "seven", "second"] },
  { id: "2.6", name: "Level 2.6", words: ["spell", "hill", "fell", "still", "well", "will", "tell", "doll", "thrill", "smell"] },
  { id: "2.7", name: "Level 2.7", words: ["dress", "miss", "across", "press", "stress", "bless", "chess", "mess", "loss", "fuss"] },
  { id: "2.8", name: "Level 2.8", words: ["frizz", "buzz", "fuzzy", "off", "whiff", "cliff", "scruff", "sniff", "add", "egg"] },
  { id: "2.9", name: "Level 2.9", words: ["boat", "road", "coach", "soap", "float", "throat", "coat", "soak", "coast", "roast"] },
  { id: "2.10", name: "Level 2.10", words: ["yellow", "below", "own", "grow", "show", "follow", "window", "snow", "rainbow", "throw"] },
  { id: "2.11", name: "Level 2.11", words: ["sea", "eat", "team", "beach", "read", "real", "tea", "mean", "each", "season"] },
  { id: "2.12", name: "Level 2.12", words: ["really", "teacher", "reach", "leaf", "dream", "between", "weekend", "asleep", "sweet", "squeeze"] },
  { id: "2.13", name: "Level 2.13", words: ["wrong", "thrash", "throb", "thrill", "shred", "shrub", "shrug", "squeak", "squish", "squat"] },
  { id: "2.14", name: "Level 2.14", words: ["scrub", "splinter", "spring", "strong", "splash", "stream", "street", "spray", "strip", "split"] },
  { id: "2.15", name: "Level 2.15", words: ["shrink", "squint", "branch", "crunch", "squelch", "thrust", "shrimp", "scold", "strict", "sprint"] },
  { id: "2.16", name: "Level 2.16", words: ["kind", "find", "child", "mild", "wild", "grind", "blind", "behind", "mind", "wind"] },
  { id: "2.17", name: "Level 2.17", words: ["out", "house", "found", "mouse", "around", "our", "sound", "ground", "round", "about"] },
  { id: "2.18", name: "Level 2.18", words: ["brown", "now", "flower", "how", "down", "town", "power", "shower", "owl", "clown"] },
  { id: "2.19", name: "Level 2.19", words: ["without", "playground", "south", "shout", "flour", "tower", "frown", "coward", "powder", "crown"] },
  { id: "2.20", name: "Level 2.20", words: ["bird", "girl", "first", "birthday", "swirl", "third", "stir", "skirt", "shirt", "dirt"] },
  { id: "2.21", name: "Level 2.21", words: ["hurt", "turn", "Saturday", "church", "curl", "nurse", "burst", "return", "purse", "sunburn"] },
  { id: "2.22", name: "Level 2.22", words: ["yesterday", "person", "versus", "perfect", "lurk", "burn", "turnip", "twirl", "birth", "squirt"] },
  { id: "2.23", name: "Level 2.23", words: ["saw", "draw", "straw", "shawl", "prawn", "hawk", "claw", "raw", "jaw", "dawn"] },
  { id: "2.24", name: "Level 2.24", words: ["torch", "thorn", "order", "short", "north", "yawn", "crawl", "law", "paw", "fawn"] },
  { id: "2.25", name: "Level 2.25", words: ["new", "threw", "few", "flew", "stew", "drew", "blue", "true", "due", "glue"] },
  { id: "2.26", name: "Level 2.26", words: ["cue", "clue", "grew", "chew", "blew", "smooth", "loose", "scoop", "goose", "balloon"] },
  { id: "2.27", name: "Level 2.27", words: ["plan", "plane", "hid", "hide", "hop", "hope", "cub", "cube", "pet", "Pete"] },
  { id: "2.28", name: "Level 2.28", words: ["made", "snake", "late", "cake", "take", "game", "same", "came", "gave", "state"] },
  { id: "2.29", name: "Level 2.29", words: ["these", "theme", "eve", "delete", "extreme", "teeth", "need", "seem", "sheet", "cheek"] },
  { id: "2.30", name: "Level 2.30", words: ["ride", "slide", "life", "while", "time", "like", "fire", "white", "inside", "five"] },
  { id: "2.31", name: "Level 2.31", words: ["rode", "broke", "woke", "home", "close", "drove", "those", "rope", "choke", "nose"] },
  { id: "2.32", name: "Level 2.32", words: ["cute", "use", "tune", "dune", "rude", "flute", "June", "prune", "mute", "tube"] },
  { id: "2.33", name: "Level 2.33", words: ["make", "ate", "name", "cave", "side", "mile", "bike", "nine", "line", "clothes"] },
  { id: "2.34", name: "Level 2.34", words: ["better", "dinner", "letter", "monster", "paper", "sleepover", "together", "different", "icecream", "outside"] },
  { id: "2.35", name: "Level 2.35", words: ["by", "my", "try", "fly", "why", "cry", "dry", "sky", "shy", "sly"] },
  { id: "2.36", name: "Level 2.36", words: ["live", "have", "leave", "give", "weave", "active", "nerve", "serve", "sleeve", "captive"] },
  { id: "2.37", name: "Level 2.37", words: ["puppy", "happy", "funny", "study", "yummy", "story", "body", "twenty", "party", "quickly"] },
  { id: "2.38", name: "Level 2.38", words: ["buddy", "footy", "sunny", "windy", "rocky", "sticky", "sandy", "bumpy", "forty", "messy"] },
  { id: "2.39", name: "Level 2.39", words: ["know", "knee", "knock", "knew", "knife", "knead", "kneel", "knoll", "knit", "knot"] },
  { id: "2.40", name: "Level 2.40", words: ["be", "bee", "see", "sea", "been", "bean", "reed", "read", "meet", "meat"] },
  { id: "2.41", name: "Level 2.41", words: ["plain", "plane", "sale", "sail", "hear", "here", "some", "sum", "one", "won"] },
  { id: "2.42", name: "Level 2.42", words: ["two", "to", "too", "by", "buy", "bye", "knew", "new", "know", "no"] },
  { id: "2.43", name: "Level 2.43", words: ["Sunday", "Wednesday", "Friday", "Tuesday", "Saturday", "Thursday", "Monday", "yesterday", "holiday", "weekend"] },
  { id: "2.44", name: "Level 2.44", words: ["above", "won", "other", "love", "another", "mother", "month", "Mr", "Mrs", "Miss"] },
  { id: "2.45", name: "Level 2.45", words: ["only", "open", "over", "word", "world", "work", "animal", "buy", "OK", "TV"] },
  { id: "2.46", name: "Level 2.46", words: ["after", "ask", "father", "last", "want", "watch", "water", "their", "there", "where"] },
  { id: "2.47", name: "Level 2.47", words: ["even", "people", "does", "gone", "come", "some", "something", "sometimes", "here", "were"] },
  
  // LEVEL 3 LISTS
  { id: "3.1", name: "Level 3.1", words: ["while", "smile", "knife", "plate", "skate", "whale", "lace", "pace", "trace", "mice", "dice", "rice"] },
  { id: "3.2", name: "Level 3.2", words: ["chase", "blaze", "quake", "brave", "cute", "use", "fuse", "page", "cage", "rage", "stage", "huge"] },
  { id: "3.3", name: "Level 3.3", words: ["squeal", "dream", "stream", "screen", "sweet", "agree", "please", "tease", "cheese", "sneeze", "squeeze", "freeze"] },
  { id: "3.4", name: "Level 3.4", words: ["strode", "alone", "clone", "scope", "quote", "froze", "care", "dare", "hare", "share", "rare", "mare"] },
  { id: "3.5", name: "Level 3.5", words: ["kind", "wild", "find", "blind", "child", "grind", "high", "light", "night", "slight", "tight", "flight"] },
  { id: "3.6", name: "Level 3.6", words: ["sty", "sly", "spy", "shy", "ply", "pry", "might", "fight", "right", "sight", "thigh", "slight"] },
  { id: "3.7", name: "Level 3.7", words: ["draw", "crawl", "straw", "dawn", "lawn", "claw", "coarse", "soar", "roar", "boar", "oar", "board"] },
  { id: "3.8", name: "Level 3.8", words: ["proud", "amount", "shout", "crowd", "tower", "scowl", "fear", "smear", "clear", "spear", "tear", "beard"] },
  { id: "3.9", name: "Level 3.9", words: ["hue", "clue", "due", "brew", "screw", "crew", "cocoon", "scooter", "cartoon", "stoop", "boost", "proof"] },
  { id: "3.10", name: "Level 3.10", words: ["captive", "swerve", "forgive", "festive", "weave", "active", "clutch", "batch", "ditch", "patch", "latch", "hutch"] },
  { id: "3.11", name: "Level 3.11", words: ["throat", "boast", "float", "coast", "groan", "toast", "both", "don't", "most", "host", "post", "gross"] },
  { id: "3.12", name: "Level 3.12", words: ["know", "knew", "knock", "knead", "knife", "kneel", "comb", "limb", "crumb", "lamb", "thumb", "numb"] },
  { id: "3.13", name: "Level 3.13", words: ["squirt", "thirsty", "dirty", "thirteen", "burnt", "return", "burden", "burger", "perfect", "transfer", "understand", "western"] },
  { id: "3.14", name: "Level 3.14", words: ["yellow", "follow", "pillow", "shallow", "arrow", "hollow", "nanny", "funny", "annoy", "mammal", "cotton", "paddock"] },
  { id: "3.15", name: "Level 3.15", words: ["paper", "teacher", "longer", "winter", "jumper", "temper", "actor", "razor", "mirror", "error", "sailor", "tremor"] },
  { id: "3.16", name: "Level 3.16", words: ["memory", "empty", "angry", "candy", "plenty", "silly", "honey", "kidney", "abbey", "jockey", "trolley", "barley"] },
  { id: "3.17", name: "Level 3.17", words: ["face", "place", "race", "space", "trace", "brace", "grace", "nice", "mice", "rice", "slice", "spice"] },
  { id: "3.18", name: "Level 3.18", words: ["twice", "prince", "dance", "peace", "since", "price", "ice-cream", "disgrace", "replace", "embrace", "necklace", "advice"] },
  { id: "3.19", name: "Level 3.19", words: ["horse", "house", "mouse", "goose", "loose", "nurse", "rinse", "grease", "curse", "please", "cheese", "praise"] },
  { id: "3.20", name: "Level 3.20", words: ["sneeze", "squeeze", "freeze", "snooze", "breeze", "noise", "tease", "browse", "raise", "choose", "present", "surprise"] },
  { id: "3.21", name: "Level 3.21", words: ["large", "change", "page", "orange", "stage", "huge", "hinge", "tinge", "plunge", "cage", "rage", "cringe"] },
  { id: "3.22", name: "Level 3.22", words: ["bridge", "edge", "pledge", "hedge", "wedge", "judge", "trudge", "dodge", "lodge", "nudge", "ledge", "porridge"] },
  { id: "3.23", name: "Level 3.23", words: ["fridge", "grudge", "smudge", "fudge", "ridge", "badge", "badger", "budget", "fidget", "gadget", "ledger", "midget"] },
  { id: "3.24", name: "Level 3.24", words: ["twilight", "highway", "lightning", "frighten", "mighty", "brightest", "tighter", "slightest", "higher", "alright", "delight", "midnight"] },
  { id: "3.25", name: "Level 3.25", words: ["bear", "wear", "tear", "pear", "hair", "air", "pair", "chair", "square", "spare", "glare", "stare"] },
  { id: "3.26", name: "Level 3.26", words: ["wearing", "fairy", "airport", "repair", "upstairs", "dairy", "parent", "scared", "scary", "careless", "aware", "compare"] },
  { id: "3.27", name: "Level 3.27", words: ["more", "sore", "score", "shore", "store", "chore", "before", "forecast", "adore", "explore", "restore", "ignore"] },
  { id: "3.28", name: "Level 3.28", words: ["soar", "hoarse", "hoard", "coarse", "cupboard", "door", "floor", "poor", "four", "your", "court", "pour"] },
  { id: "3.29", name: "Level 3.29", words: ["match", "witch", "catch", "snatch", "sketch", "stitch", "scratch", "stretch", "switch", "hitch", "fetch", "hatch"] },
  { id: "3.30", name: "Level 3.30", words: ["bewitch", "itchy", "sketchpad", "rematch", "patching", "satchel", "catchy", "stitching", "splotchy", "kitchen", "hatchet", "butcher"] },
  { id: "3.31", name: "Level 3.31", words: ["hear", "year", "near", "dear", "shear", "clear", "jeer", "steer", "peer", "deer", "cheer", "veer"] },
  { id: "3.32", name: "Level 3.32", words: ["appear", "nearly", "fearful", "endear", "weary", "earwig", "clearly", "peering", "cheery", "career", "pioneer", "engineer"] },
  { id: "3.33", name: "Level 3.33", words: ["group", "toucan", "soup", "coupon", "wound", "youth", "fruit", "juice", "bruise", "suitcase", "cruise", "recruit"] },
  { id: "3.34", name: "Level 3.34", words: ["climbed", "thumb", "lamb", "crumb", "limb", "numb", "comb", "dumb", "plumber", "debt", "doubt", "subtle"] },
  { id: "3.35", name: "Level 3.35", words: ["walk", "talk", "walking", "stalk", "chalk", "balk", "both", "don't", "most", "post", "gross", "host"] },
  { id: "3.36", name: "Level 3.36", words: ["whole", "who", "whose", "whom", "anyhow", "many", "anything", "anyone", "anywhere", "anytime", "anymore", "anybody"] },
  { id: "3.37", name: "Level 3.37", words: ["could", "should", "would", "couldn't", "move", "lose", "prove", "reprove", "movement", "disprove", "approve", "remove"] },
  { id: "3.38", name: "Level 3.38", words: ["head", "dead", "breakfast", "breath", "already", "leather", "healthy", "heavy", "instead", "feather", "weather", "threaten"] },
  { id: "3.39", name: "Level 3.39", words: ["jungle", "uncle", "grumble", "crumble", "candle", "handle", "eagle", "sparkle", "simple", "beetle", "needle", "twinkle"] },
  { id: "3.40", name: "Level 3.40", words: ["angle", "tremble", "crumple", "stifle", "chuckle", "bundle", "purple", "edible", "ample", "tumble", "sample", "tickle"] },
  { id: "3.41", name: "Level 3.41", words: ["apples", "little", "wiggle", "battle", "paddle", "rattle", "gobble", "smuggle", "topple", "fiddle", "drizzle", "ripple"] },
  { id: "3.42", name: "Level 3.42", words: ["pebble", "cattle", "bubble", "puddle", "sniffle", "scribble", "huddle", "bottle", "settle", "puzzle", "snuggle", "struggle"] },
  { id: "3.43", name: "Level 3.43", words: ["happened", "lollies", "rabbit", "soccer", "suddenly", "summer", "butterfly", "letter", "better", "different", "paddock", "sluggish"] },
  { id: "3.44", name: "Level 3.44", words: ["ladder", "cubby", "ribbon", "stagger", "nugget", "tunnel", "sunny", "common", "hammer", "support", "puppet", "occur"] },
  { id: "3.45", name: "Level 3.45", words: ["function", "lotion", "pollution", "fiction", "action", "devotion", "fraction", "mention", "section", "emotion", "option", "solution"] },
  { id: "3.46", name: "Level 3.46", words: ["elephant", "alphabet", "photo", "orphan", "nephew", "telephone", "dolphin", "phase", "triumph", "typhoon", "sphere", "emphasis"] },
  { id: "3.47", name: "Level 3.47", words: ["table", "basic", "label", "paper", "apron", "basin", "major", "vacant", "bacon", "native", "danger", "chamber"] },
  { id: "3.48", name: "Level 3.48", words: ["begin", "began", "before", "below", "being", "became", "behind", "between", "beside", "beyond", "beware", "belong"] },
  { id: "3.49", name: "Level 3.49", words: ["money", "monkey", "key", "donkey", "joey", "valley", "hockey", "alley", "turkey", "parsley", "pulley", "chimney"] },
  { id: "3.50", name: "Level 3.50", words: ["very", "baby", "family", "carry", "every", "everyone", "everything", "lady", "gravy", "duty", "tidy", "tiny"] },
  { id: "3.51", name: "Level 3.51", words: ["doctor", "motorbike", "equator", "creator", "instructor", "tractor", "editor", "visitor", "spectator", "sponsor", "monitor", "terror"] },
  { id: "3.52", name: "Level 3.52", words: ["almost", "also", "always", "water", "already", "install", "walnut", "bald", "almighty", "enthral", "appal", "palsy"] },
  { id: "3.53", name: "Level 3.53", words: ["dwarf", "swarming", "warmest", "warty", "warmup", "warning", "award", "quarter", "reward", "towards", "wardrobe", "warble"] },
  { id: "3.54", name: "Level 3.54", words: ["Indian", "idea", "children", "quickly", "equal", "require", "request", "liquid", "dessert", "scissors", "dissolve", "possess"] },
  { id: "3.55", name: "Level 3.55", words: ["grey", "obey", "survey", "prey", "convey", "great", "break", "steak", "greatest", "straight", "eight", "eighty"] },
  { id: "3.56", name: "Level 3.56", words: ["aunty", "laughed", "city", "excited", "princess", "sentence", "earth", "heard", "learn", "because", "caught", "dinosaur"] },
  { id: "3.57", name: "Level 3.57", words: ["ghost", "hour", "autumn", "castle", "often", "guys", "answer", "write", "school", "friend", "beautiful", "pizza"] },
  { id: "3.58", name: "Level 3.58", words: ["through", "enough", "young", "country", "cousin", "bought", "brought", "though", "computer", "decided", "example", "important"] },
  { id: "3.59", name: "Level 3.59", words: ["giant", "magic", "afternoon", "basketball", "class", "fast", "colour", "favourite", "field", "movie", "brother", "front"] },
  { id: "3.60", name: "Level 3.60", words: ["mountain", "restaurant", "special", "heart", "police", "lion", "trampoline", "picture", "music", "minute", "once", "eye"] },
  { id: "3.61", name: "Level 3.61", words: ["for", "four", "fore", "knot", "not", "which", "witch", "weak", "week", "saw", "sore", "soar"] },
  { id: "3.62", name: "Level 3.62", words: ["so", "sew", "road", "rode", "rowed", "there", "their", "they're", "bear", "bare", "hair", "hare"] },
  { id: "3.63", name: "Level 3.63", words: ["hour", "our", "flower", "flour", "threw", "through", "blew", "blue", "heard", "herd", "would", "wood"] },
  { id: "3.64", name: "Level 3.64", words: ["write", "right", "knight", "night", "steak", "stake", "break", "brake", "made", "maid", "read", "red"] },
  { id: "3.65", name: "Level 3.65", words: ["don't", "didn't", "can't", "wasn't", "couldn't", "I'll", "he's", "I've", "let's", "we're", "it's", "there's"] }
];

// ===============================================
// SPELLING ACTIVITIES
// ===============================================
const ACTIVITIES = [
  { id: "look_cover_write", name: "Look, Cover, Write, Check", icon: "👀", color: "bg-blue-500" },
  { id: "rainbow_words", name: "Rainbow Words", icon: "🌈", color: "bg-purple-500" },
  { id: "silly_sentences", name: "Silly Sentences", icon: "😄", color: "bg-green-500" },
  { id: "word_sorting", name: "Word Sorting", icon: "📊", color: "bg-orange-500" },
  { id: "spelling_pyramid", name: "Spelling Pyramid", icon: "🔺", color: "bg-red-500" },
  { id: "trace_write", name: "Trace & Write", icon: "✏️", color: "bg-indigo-500" }
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
  const [groups, setGroups] = useState(loadedData.spellingGroups || []);
  const [selectedLists, setSelectedLists] = useState([]);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [showListSelector, setShowListSelector] = useState(false);
  const [viewingList, setViewingList] = useState(null);

  // Initialize groups if empty
  useEffect(() => {
    if (groups.length === 0) {
      const defaultGroups = [
        { id: 1, name: "Group 1", color: "bg-blue-500", students: [], assignedLists: [], assignedActivity: null },
        { id: 2, name: "Group 2", color: "bg-green-500", students: [], assignedLists: [], assignedActivity: null },
        { id: 3, name: "Group 3", color: "bg-purple-500", students: [], assignedLists: [], assignedActivity: null }
      ];
      setGroups(defaultGroups);
      saveGroups(defaultGroups);
    }
  }, []);

  const saveGroups = (updatedGroups) => {
    setGroups(updatedGroups);
    saveData({ spellingGroups: updatedGroups });
    showToast('Groups saved successfully!', 'success');
  };

  const addGroup = () => {
    if (groups.length >= 5) {
      showToast('Maximum 5 groups allowed', 'error');
      return;
    }
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
    saveGroups(updatedGroups);
  };

  const removeGroup = (groupId) => {
    const updatedGroups = groups.filter(g => g.id !== groupId);
    saveGroups(updatedGroups);
  };

  const updateGroupName = (groupId, newName) => {
    const updatedGroups = groups.map(g => 
      g.id === groupId ? { ...g, name: newName } : g
    );
    saveGroups(updatedGroups);
  };

  const assignStudentToGroup = (studentId, groupId) => {
    const updatedGroups = groups.map(group => ({
      ...group,
      students: group.id === groupId 
        ? [...group.students.filter(s => s.id !== studentId), students.find(s => s.id === studentId)]
        : group.students.filter(s => s.id !== studentId)
    }));
    saveGroups(updatedGroups);
  };

  const assignListsToGroup = (groupId, listIds) => {
    const updatedGroups = groups.map(g => 
      g.id === groupId ? { ...g, assignedLists: listIds } : g
    );
    saveGroups(updatedGroups);
  };

  const assignActivityToGroup = (groupId, activityId) => {
    const updatedGroups = groups.map(g => 
      g.id === groupId ? { ...g, assignedActivity: activityId } : g
    );
    saveGroups(updatedGroups);
  };

  const printLists = (listIds) => {
    const lists = SPELLING_LISTS.filter(list => listIds.includes(list.id));
    const printWindow = window.open('', 'Print', 'height=800,width=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Spelling Lists</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .list { margin-bottom: 30px; page-break-inside: avoid; }
            .words { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 15px 0; }
            .word { padding: 8px; border: 1px solid #ddd; text-align: center; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Educational Elements - Spelling Lists</h1>
            <p>Student Name: _______________  Date: _______________</p>
          </div>
          ${lists.map(list => `
            <div class="list">
              <h2>${list.name}</h2>
              <div class="words">
                ${list.words.map(word => `<div class="word">${word}</div>`).join('')}
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

  const togglePresentationMode = () => {
    setIsPresentationMode(!isPresentationMode);
    showToast(
      isPresentationMode 
        ? 'Exited presentation mode' 
        : 'Entered presentation mode!', 
      'success'
    );
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-6xl font-bold text-gray-800">📝 Today's Spelling</h1>
          <button
            onClick={togglePresentationMode}
            className="bg-gray-600 text-white px-8 py-4 rounded-xl text-2xl font-bold hover:bg-gray-700"
          >
            Exit Presentation
          </button>
        </div>

        <div className={`grid gap-8 ${activeGroups.length === 1 ? 'grid-cols-1' : activeGroups.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {activeGroups.map(group => {
            const assignedActivity = ACTIVITIES.find(a => a.id === group.assignedActivity);
            return (
              <div key={group.id} className="bg-white rounded-2xl shadow-2xl p-8">
                <div className={`${group.color} text-white text-center py-6 rounded-xl mb-6`}>
                  <h2 className="text-4xl font-bold">{group.name}</h2>
                  <p className="text-2xl opacity-90">{group.students.length} students</p>
                </div>

                {group.assignedLists.map(listId => {
                  const list = SPELLING_LISTS.find(l => l.id === listId);
                  return (
                    <div key={listId} className="mb-6">
                      <h3 className="text-3xl font-bold text-center mb-4 text-gray-800">{list.name}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {list.words.map((word, index) => (
                          <div key={index} className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 text-center">
                            <span className="text-3xl font-bold text-gray-800">{word}</span>
                          </div>
                        ))}
                      </div>
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
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <span className="mr-3">🔤</span>
              Spelling Program
            </h1>
            <p className="text-lg opacity-90">59 Level 1 spelling lists with group management</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowListSelector(!showListSelector)}
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30"
            >
              📋 Browse Lists
            </button>
            <button
              onClick={togglePresentationMode}
              className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30"
            >
              🎭 Presentation Mode
            </button>
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
                      <p className="text-gray-600">{viewingList.words.length} words</p>
                    </div>
                    <button
                      onClick={() => setViewingList(null)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      ← Back to Lists
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {viewingList.words.map((word, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                          <span className="text-lg font-bold text-gray-800">{word}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {SPELLING_LISTS.map(list => (
                    <button
                      key={list.id}
                      onClick={() => setViewingList(list)}
                      className="p-3 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-left transition-all"
                    >
                      <div className="font-bold text-sm">{list.name}</div>
                      <div className="text-xs text-gray-600">{list.words.length} words</div>
                      <div className="text-xs mt-1">
                        {list.words.slice(0, 3).join(', ')}...
                      </div>
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
          <h3 className="font-bold text-yellow-800 mb-3">👤 Unassigned Students</h3>
          <div className="flex flex-wrap gap-2">
            {unassignedStudents.map(student => (
              <div key={student.id} className="bg-white border border-yellow-300 rounded-lg p-2">
                <span className="text-sm font-medium">{student.firstName} {student.lastName}</span>
                <select
                  onChange={(e) => e.target.value && assignStudentToGroup(student.id, parseInt(e.target.value))}
                  className="ml-2 text-xs border rounded"
                  defaultValue=""
                >
                  <option value="">Assign to group...</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>
            ))}
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
                  <button
                    onClick={() => printLists(group.assignedLists)}
                    disabled={group.assignedLists.length === 0}
                    className={`bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600 ${
                      groups.length >= 4 ? 'text-xs px-1 py-1' : 'text-xs px-2 py-1'
                    }`}
                  >
                    🖨️
                  </button>
                </div>
                
                <div className="space-y-1 mb-2 max-h-32 overflow-y-auto">
                  {group.assignedLists.map(listId => {
                    const list = SPELLING_LISTS.find(l => l.id === listId);
                    return (
                      <div key={listId} className="bg-blue-50 border border-blue-200 rounded p-2">
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
                        <div className={`text-blue-600 mt-1 ${groups.length >= 5 ? 'text-xs' : 'text-xs'}`}>
                          {groups.length >= 5 ? 
                            `${list.words.slice(0, 3).join(', ')}...` : 
                            list.words.join(', ')
                          }
                        </div>
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
                  {SPELLING_LISTS.filter(list => !group.assignedLists.includes(list.id)).map(list => (
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
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded p-2">
                    <div className="flex items-center">
                      <span className={`mr-2 ${groups.length >= 4 ? 'text-lg' : 'text-xl'}`}>
                        {ACTIVITIES.find(a => a.id === group.assignedActivity)?.icon}
                      </span>
                      <span className={`font-medium text-green-800 ${groups.length >= 4 ? 'text-xs' : 'text-sm'}`}>
                        {ACTIVITIES.find(a => a.id === group.assignedActivity)?.name}
                      </span>
                    </div>
                    <button
                      onClick={() => assignActivityToGroup(group.id, null)}
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
    </div>
  );
};

export default SpellingProgram;