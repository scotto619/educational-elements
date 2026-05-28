// pages/curriculum.js — Standalone Resource Hub, no class required
import React, { useState, useEffect, useRef, useMemo, Suspense, lazy } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { auth } from '../utils/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// ─── Lazy-load tool / section components ─────────────────────────────────────
const BeginnerReaders      = lazy(() => import('../components/curriculum/literacy/BeginnerReaders'));
const ReadingForFun        = lazy(() => import('../components/curriculum/literacy/ReadingForFun'));
const ReadersTheatre       = lazy(() => import('../components/curriculum/literacy/ReadersTheatre'));
const Morphology           = lazy(() => import('../components/curriculum/literacy/Morphology'));
const LiteracyWarmup       = lazy(() => import('../components/curriculum/literacy/LiteracyWarmup'));
const PrepLiteracyWarmup   = lazy(() => import('../components/curriculum/literacy/PrepLiteracyWarmUp'));
const SpellingProgram      = lazy(() => import('../components/curriculum/literacy/SpellingProgram'));
const ReadingComprehension = lazy(() => import('../components/curriculum/literacy/ReadingComprehension'));
const VisualWritingPrompts = lazy(() => import('../components/curriculum/literacy/VisualWritingPrompts'));
const VocabularyCorner     = lazy(() => import('../components/curriculum/literacy/VocabularyCorner'));
const GrammarWorkshop      = lazy(() => import('../components/curriculum/literacy/GrammarWorkshop'));
const PoetryCorner         = lazy(() => import('../components/curriculum/literacy/PoetryCorner'));
const PartnerReading       = lazy(() => import('../components/curriculum/literacy/PartnerReadingPassages'));
const DailyMathChallenges  = lazy(() => import('../components/curriculum/mathematics/DailyMathChallenges'));
const InteractiveAngles    = lazy(() => import('../components/curriculum/mathematics/InteractiveAngles'));
const InteractiveClock     = lazy(() => import('../components/curriculum/mathematics/InteractiveClock'));
const NumbersBoard         = lazy(() => import('../components/curriculum/mathematics/NumbersBoard'));
const MathMentals          = lazy(() => import('../components/curriculum/mathematics/MathMentals'));
const MathWarmup           = lazy(() => import('../components/curriculum/mathematics/MathWarmup'));
const WorksheetGenerator   = lazy(() => import('../components/curriculum/mathematics/WorksheetGenerator'));
const AreaPerimeterTool    = lazy(() => import('../components/curriculum/mathematics/AreaPerimeterTool'));
const FractionVisualiser   = lazy(() => import('../components/curriculum/mathematics/FractionVisualiser'));
const TimesTablesMaster    = lazy(() => import('../components/curriculum/mathematics/TimesTablesMaster'));
const SolarSystemExplorer  = lazy(() => import('../components/curriculum/science/SolarSystemExplorer'));
const FoodChainBuilder     = lazy(() => import('../components/curriculum/science/FoodChainBuilder'));
const EnglishNewSection    = lazy(() => import('../components/curriculum/new/EnglishNewSection'));
const MathNewSection       = lazy(() => import('../components/curriculum/new/MathNewSection'));
const ScienceNewSection    = lazy(() => import('../components/curriculum/new/ScienceNewSection'));
const HassNewSection       = lazy(() => import('../components/curriculum/new/HassNewSection'));

// ─── Display section data (sourced from DisplaysGallery) ──────────────────────
const buildImageUrl = (folder, file) =>
  `/Displays/${folder}/${file.split('/').map(encodeURIComponent).join('/')}`;

// All display categories — used for search index + "All Displays"
const ALL_DISPLAY_CATEGORIES = [
  {
    id: 'english', name: 'English Displays', emoji: '📚', folder: 'English',
    bg: 'bg-blue-100', border: 'border-blue-300', hover: 'hover:bg-blue-200', text: 'text-blue-900',
    sections: [
      { id: 'letters',          name: 'Alphabet',                  emoji: '🔤', bg: 'bg-blue-100',    border: 'border-blue-300',    hover: 'hover:bg-blue-200',    text: 'text-blue-900',    images: [{ name: 'Alphabet Display', file: 'Alphabet/Alphabet/Alphabet.png' },{ name: 'Letter A', file: 'Alphabet/Alphabet/A.png' },{ name: 'Letter B', file: 'Alphabet/Alphabet/B.png' },{ name: 'Letter C', file: 'Alphabet/Alphabet/C.png' },{ name: 'Letter D', file: 'Alphabet/Alphabet/D.png' },{ name: 'Letter E', file: 'Alphabet/Alphabet/E.png' },{ name: 'Letter F', file: 'Alphabet/Alphabet/F.png' },{ name: 'Letter G', file: 'Alphabet/Alphabet/G.png' },{ name: 'Letter H', file: 'Alphabet/Alphabet/H.png' },{ name: 'Letter I', file: 'Alphabet/Alphabet/I.png' },{ name: 'Letter J', file: 'Alphabet/Alphabet/J.png' },{ name: 'Letter K', file: 'Alphabet/Alphabet/K.png' },{ name: 'Letter L', file: 'Alphabet/Alphabet/L.png' },{ name: 'Letter M', file: 'Alphabet/Alphabet/M.png' },{ name: 'Letter N', file: 'Alphabet/Alphabet/N.png' },{ name: 'Letter O', file: 'Alphabet/Alphabet/O.png' },{ name: 'Letter P', file: 'Alphabet/Alphabet/P.png' },{ name: 'Letter Q', file: 'Alphabet/Alphabet/Q.png' },{ name: 'Letter R', file: 'Alphabet/Alphabet/R.png' },{ name: 'Letter S', file: 'Alphabet/Alphabet/S.png' },{ name: 'Letter T', file: 'Alphabet/Alphabet/T.png' },{ name: 'Letter U', file: 'Alphabet/Alphabet/U.png' },{ name: 'Letter V', file: 'Alphabet/Alphabet/V.png' },{ name: 'Letter W', file: 'Alphabet/Alphabet/W.png' },{ name: 'Letter X', file: 'Alphabet/Alphabet/X.png' },{ name: 'Letter Y', file: 'Alphabet/Alphabet/Y.png' },{ name: 'Letter Z', file: 'Alphabet/Alphabet/Z.png' }] },
      { id: 'alphabet-2',       name: 'Alphabet Mnemonics',        emoji: '🧠', bg: 'bg-indigo-100',  border: 'border-indigo-300',  hover: 'hover:bg-indigo-200',  text: 'text-indigo-900',  images: [{ name: 'Alphabet Mnemonic', file: 'Alphabet/Alphabet 2/Mnemonic.png' }] },
      { id: 'eye-spy',          name: 'Alphabet Eye Spy',          emoji: '👁️', bg: 'bg-sky-100',     border: 'border-sky-300',     hover: 'hover:bg-sky-200',     text: 'text-sky-900',     images: [{ name: 'Eye Spy - A', file: 'Alphabet/EyeSpy/A.png' },{ name: 'Eye Spy - B', file: 'Alphabet/EyeSpy/B.png' },{ name: 'Eye Spy - C', file: 'Alphabet/EyeSpy/C.png' },{ name: 'Eye Spy - D', file: 'Alphabet/EyeSpy/D.png' },{ name: 'Eye Spy - E', file: 'Alphabet/EyeSpy/E.png' },{ name: 'Eye Spy - F', file: 'Alphabet/EyeSpy/F.png' },{ name: 'Eye Spy - G', file: 'Alphabet/EyeSpy/G.png' }] },
      { id: 'cvc-cards',        name: 'CVC Blending Cards',        emoji: '🔡', bg: 'bg-teal-100',    border: 'border-teal-300',    hover: 'hover:bg-teal-200',    text: 'text-teal-900',    images: [{ name: 'nap', file: 'Reading/CVC Blending Cards/nap.png' },{ name: 'pan', file: 'Reading/CVC Blending Cards/pan.png' },{ name: 'pat', file: 'Reading/CVC Blending Cards/pat.png' },{ name: 'pin', file: 'Reading/CVC Blending Cards/pin.png' },{ name: 'pit', file: 'Reading/CVC Blending Cards/pit.png' },{ name: 'sat', file: 'Reading/CVC Blending Cards/sat.png' },{ name: 'sit', file: 'Reading/CVC Blending Cards/sit.png' },{ name: 'tap', file: 'Reading/CVC Blending Cards/tap.png' },{ name: 'tin', file: 'Reading/CVC Blending Cards/tin.png' },{ name: 'tip', file: 'Reading/CVC Blending Cards/tip.png' }] },
      { id: 'phonics-blends',   name: 'Phonics Blend Cards',       emoji: '🔊', bg: 'bg-cyan-100',    border: 'border-cyan-300',    hover: 'hover:bg-cyan-200',    text: 'text-cyan-900',    images: [{ name: 'BL Blend', file: 'Phonics/Blends/BL Blend.png' },{ name: 'BR Blend', file: 'Phonics/Blends/BR Blend.png' },{ name: 'CH Blend', file: 'Phonics/Blends/CH Blend.png' },{ name: 'CK Blend', file: 'Phonics/Blends/CK Blend.png' },{ name: 'CL Blend', file: 'Phonics/Blends/CL Blend.png' },{ name: 'DR Blend', file: 'Phonics/Blends/DR Blend.png' },{ name: 'FL Blend', file: 'Phonics/Blends/FL Blend.png' },{ name: 'FR Blend', file: 'Phonics/Blends/FR Blend.png' },{ name: 'GL Blend', file: 'Phonics/Blends/GL Blend.png' },{ name: 'GR Blend', file: 'Phonics/Blends/GR Blend.png' },{ name: 'PH Blend', file: 'Phonics/Blends/PH Blend.png' },{ name: 'PL Blend', file: 'Phonics/Blends/PL Blend.png' },{ name: 'PR Blend', file: 'Phonics/Blends/PR Blend.png' },{ name: 'SH Blend', file: 'Phonics/Blends/SH Blend.png' },{ name: 'SK Blend', file: 'Phonics/Blends/SK Blend.png' },{ name: 'SL Blend', file: 'Phonics/Blends/SL Blend.png' },{ name: 'SM Blend', file: 'Phonics/Blends/SM Blend.png' },{ name: 'SN Blend', file: 'Phonics/Blends/SN Blend.png' },{ name: 'SP Blend', file: 'Phonics/Blends/SP Blend.png' },{ name: 'ST Blend', file: 'Phonics/Blends/ST Blend.png' },{ name: 'SW Blend', file: 'Phonics/Blends/SW Blend.png' },{ name: 'TH Blend', file: 'Phonics/Blends/TH Blend.png' },{ name: 'TR Blend', file: 'Phonics/Blends/TR Blend.png' },{ name: 'WH Blend', file: 'Phonics/Blends/WH Blend.png' }] },
      { id: 'phonics-blends-2', name: 'Phonics Blend Posters',     emoji: '📢', bg: 'bg-blue-100',    border: 'border-blue-300',    hover: 'hover:bg-blue-200',    text: 'text-blue-900',    images: [{ name: 'BL', file: 'Phonics/Blends 2/BL.png' },{ name: 'BL Story', file: 'Phonics/Blends 2/BL Story.png' },{ name: 'BR', file: 'Phonics/Blends 2/BR.png' },{ name: 'BR Story', file: 'Phonics/Blends 2/BR Story.png' },{ name: 'CH', file: 'Phonics/Blends 2/CH.png' },{ name: 'CL', file: 'Phonics/Blends 2/CL.png' },{ name: 'CR', file: 'Phonics/Blends 2/CR.png' },{ name: 'DR', file: 'Phonics/Blends 2/DR.png' },{ name: 'FL', file: 'Phonics/Blends 2/FL.png' },{ name: 'FR', file: 'Phonics/Blends 2/FR.png' },{ name: 'GL', file: 'Phonics/Blends 2/GL.png' },{ name: 'GR', file: 'Phonics/Blends 2/GR.png' },{ name: 'PL', file: 'Phonics/Blends 2/PL.png' },{ name: 'PR', file: 'Phonics/Blends 2/PR.png' },{ name: 'SC', file: 'Phonics/Blends 2/SC.png' },{ name: 'SCR', file: 'Phonics/Blends 2/SCR.png' },{ name: 'SH', file: 'Phonics/Blends 2/SH.png' },{ name: 'SH Story', file: 'Phonics/Blends 2/SH Story.png' },{ name: 'SK', file: 'Phonics/Blends 2/SK.png' },{ name: 'SL', file: 'Phonics/Blends 2/SL.png' },{ name: 'SM', file: 'Phonics/Blends 2/SM.png' },{ name: 'SN', file: 'Phonics/Blends 2/SN.png' },{ name: 'SP', file: 'Phonics/Blends 2/SP.png' },{ name: 'SPL', file: 'Phonics/Blends 2/SPL.png' },{ name: 'SPR', file: 'Phonics/Blends 2/SPR.png' },{ name: 'ST', file: 'Phonics/Blends 2/ST.png' },{ name: 'STR', file: 'Phonics/Blends 2/STR.png' },{ name: 'SW', file: 'Phonics/Blends 2/SW.png' },{ name: 'TH', file: 'Phonics/Blends 2/TH.png' },{ name: 'TR', file: 'Phonics/Blends 2/TR.png' },{ name: 'WH', file: 'Phonics/Blends 2/WH.png' }] },
      { id: 'vowels',           name: 'Long & Short Vowels',       emoji: '🗣️', bg: 'bg-teal-100',    border: 'border-teal-300',    hover: 'hover:bg-teal-200',    text: 'text-teal-900',    images: [{ name: 'Long A / Short A', file: 'Phonics/Vowels/Long a Short s.png' },{ name: 'Long E / Short E', file: 'Phonics/Vowels/Long e Short e.png' },{ name: 'Long I / Short I', file: 'Phonics/Vowels/Long i Short i.png' },{ name: 'Long O / Short O', file: 'Phonics/Vowels/Long o Short o.png' },{ name: 'Long U / Short U', file: 'Phonics/Vowels/Long u Short u.png' }] },
      { id: 'spelling-rules',   name: 'Spelling Rules',            emoji: '📏', bg: 'bg-emerald-100', border: 'border-emerald-300', hover: 'hover:bg-emerald-200', text: 'text-emerald-900', images: [{ name: 'Double the Final Consonant', file: 'Spelling/Spelling Rule Double the final consonant.png' },{ name: 'Drop the E', file: 'Spelling/Spelling Rule Drop the e.png' },{ name: 'Spelling Rule 1', file: 'Spelling/Spelling Rules/Spelling Rule 1.png' },{ name: 'Spelling Rule 2', file: 'Spelling/Spelling Rules/Spelling Rule 2.png' },{ name: 'Spelling Rule 3', file: 'Spelling/Spelling Rules/Spelling Rule 3.png' },{ name: 'Spelling Rule 4', file: 'Spelling/Spelling Rules/Spelling Rule 4.png' },{ name: 'Spelling Rule 5', file: 'Spelling/Spelling Rules/Spelling Rule 5.png' }] },
      { id: 'spelling-strats',  name: 'Spelling Strategies',       emoji: '🔡', bg: 'bg-green-100',   border: 'border-green-300',   hover: 'hover:bg-green-200',   text: 'text-green-900',   images: [{ name: 'Chunking', file: 'Spelling/Spelling Strategies/Chunking.png' },{ name: 'Letter Sounds', file: 'Spelling/Spelling Strategies/LetterSound.png' },{ name: 'Phonetic Strategies', file: 'Spelling/Spelling Strategies/Phonetic Strategies.png' },{ name: 'Rhyming', file: 'Spelling/Spelling Strategies/Rhyming.png' },{ name: 'Sound It Out', file: 'Spelling/Spelling Strategies/SoundItOut.png' }] },
      { id: 'writing-narrative', name: 'Narrative Writing',        emoji: '📖', bg: 'bg-pink-100',    border: 'border-pink-300',    hover: 'hover:bg-pink-200',    text: 'text-pink-900',    images: [{ name: 'Fantasy Narratives', file: 'Writing/Narrative/Fantasy Narratives.png' },{ name: 'Narrative Writing Structure', file: 'Writing/Narrative/Narrative Writing Structure.png' },{ name: 'Science Fiction Narratives', file: 'Writing/Narrative/SciFi Narratives.png' }] },
      { id: 'writing-narrative-forest', name: 'Narrative — Forest Themed Learning Wall', emoji: '🌲', bg: 'bg-green-100', border: 'border-green-300', hover: 'hover:bg-green-200', text: 'text-green-900', images: [{ name: 'Overview', file: 'Writing/Narrative/Forest Themed Learning Wall/1. Overview.png' },{ name: 'Orientation', file: 'Writing/Narrative/Forest Themed Learning Wall/2. Orientation.png' },{ name: 'Complication', file: 'Writing/Narrative/Forest Themed Learning Wall/3. Complication.png' },{ name: 'Events', file: 'Writing/Narrative/Forest Themed Learning Wall/4. Events.png' },{ name: 'Resolution', file: 'Writing/Narrative/Forest Themed Learning Wall/5. Resolution.png' },{ name: 'Conclusion', file: 'Writing/Narrative/Forest Themed Learning Wall/6. Conclusion.png' },{ name: 'Characters', file: 'Writing/Narrative/Forest Themed Learning Wall/7. Characters.png' },{ name: 'Setting 1', file: 'Writing/Narrative/Forest Themed Learning Wall/8. Setting.png' },{ name: 'Setting 2', file: 'Writing/Narrative/Forest Themed Learning Wall/9. Setting.png' },{ name: 'Hook', file: 'Writing/Narrative/Forest Themed Learning Wall/10. Hook.png' },{ name: 'Problem', file: 'Writing/Narrative/Forest Themed Learning Wall/11. Problem.png' },{ name: 'Tension', file: 'Writing/Narrative/Forest Themed Learning Wall/12. Tension.png' },{ name: 'Reactions', file: 'Writing/Narrative/Forest Themed Learning Wall/13. Reactions.png' },{ name: 'Keep it Moving', file: 'Writing/Narrative/Forest Themed Learning Wall/14. Keep it Moving.png' },{ name: 'Sequence', file: 'Writing/Narrative/Forest Themed Learning Wall/15. Sequence.png' },{ name: 'Actions', file: 'Writing/Narrative/Forest Themed Learning Wall/16. Actions.png' },{ name: 'Build Excitement', file: 'Writing/Narrative/Forest Themed Learning Wall/17. Build Excitement.png' },{ name: 'Develop the Plot', file: 'Writing/Narrative/Forest Themed Learning Wall/18. Develop the Plot.png' },{ name: 'Solve the Problem', file: 'Writing/Narrative/Forest Themed Learning Wall/19. Solve the Problem.png' },{ name: 'Show the Results', file: 'Writing/Narrative/Forest Themed Learning Wall/20. Show the Results.png' },{ name: 'End on a Positive Note', file: 'Writing/Narrative/Forest Themed Learning Wall/21. End on a Positive Note.png' },{ name: 'Reflect or Learn', file: 'Writing/Narrative/Forest Themed Learning Wall/22. Reflect or Learn.png' },{ name: 'Wrap Things Up', file: 'Writing/Narrative/Forest Themed Learning Wall/23. Wrap Things Up.png' },{ name: 'Show the Change', file: 'Writing/Narrative/Forest Themed Learning Wall/24. Show the Change.png' },{ name: 'Leave a Final Impression', file: 'Writing/Narrative/Forest Themed Learning Wall/25. Leave a Final Impression.png' },{ name: 'Make the Reader Feel', file: 'Writing/Narrative/Forest Themed Learning Wall/26. Make the Reader Feel.png' },{ name: 'Template', file: 'Writing/Narrative/Forest Themed Learning Wall/27. Template.png' },{ name: 'Checklist', file: 'Writing/Narrative/Forest Themed Learning Wall/28. Checklist.png' },{ name: 'Vocabulary', file: 'Writing/Narrative/Forest Themed Learning Wall/29. Vocabulary.png' },{ name: 'Example', file: 'Writing/Narrative/Forest Themed Learning Wall/30. Example.png' }] },
      { id: 'writing-procedure', name: 'Procedure Writing',          emoji: '📋', bg: 'bg-slate-100',   border: 'border-slate-300',   hover: 'hover:bg-slate-200',   text: 'text-slate-900',   images: [{ name: 'Procedure 1', file: 'Writing/Procedure/1..png' },{ name: 'Procedure 2', file: 'Writing/Procedure/2..png' },{ name: 'Procedure 3', file: 'Writing/Procedure/3..png' }] },
      { id: 'writing-paragraph', name: 'Paragraph Writing',          emoji: '¶',  bg: 'bg-lime-100',    border: 'border-lime-300',    hover: 'hover:bg-lime-200',    text: 'text-lime-900',    images: [{ name: 'Overview', file: 'Writing/Paragraph Writing/1. Overview.png' },{ name: 'Example', file: 'Writing/Paragraph Writing/2. Example.png' },{ name: 'Template', file: 'Writing/Paragraph Writing/3. Template.png' },{ name: 'Checklist', file: 'Writing/Paragraph Writing/4. Checklist.png' }] },
      { id: 'writing-sentence',  name: 'Sentence Writing',            emoji: '✏️', bg: 'bg-yellow-100',  border: 'border-yellow-300',  hover: 'hover:bg-yellow-200',  text: 'text-yellow-900',  images: [{ name: 'Overview', file: 'Writing/Sentence Writing/1. Overview.png' },{ name: 'Template', file: 'Writing/Sentence Writing/2. Template.png' },{ name: 'Sentence Starters', file: 'Writing/Sentence Writing/3. Sentence Starters.png' },{ name: 'Sentence Upgrades', file: 'Writing/Sentence Writing/4. Sentence Upgrades.png' }] },
      { id: 'english-anchor-charts', name: 'Anchor Charts',           emoji: '⚓', bg: 'bg-indigo-100',  border: 'border-indigo-300',  hover: 'hover:bg-indigo-200',  text: 'text-indigo-900',  images: [{ name: 'Adjectives and Adverbs', file: 'Anchor Charts/Adjectives and Adverbs.png' },{ name: 'Authors Purpose', file: 'Anchor Charts/Authors Purpose.png' },{ name: 'Capital Letters', file: 'Anchor Charts/Capital Letters.png' },{ name: 'Cause and Effect', file: 'Anchor Charts/Cause and Effect.png' },{ name: 'Character Traits', file: 'Anchor Charts/Character Traits.png' },{ name: 'Commas', file: 'Anchor Charts/Commas.png' },{ name: 'Connectives', file: 'Anchor Charts/Connectives.png' },{ name: 'Context Clues', file: 'Anchor Charts/Context Clues.png' },{ name: 'Dialogue', file: 'Anchor Charts/Dialogue.png' },{ name: 'Editing 2', file: 'Anchor Charts/Editing 2.png' },{ name: 'Editing', file: 'Anchor Charts/Editing.png' },{ name: 'Emotive Language', file: 'Anchor Charts/Emotive Language.png' },{ name: 'Fact vs Opinion', file: 'Anchor Charts/Fact vs Opinion.png' },{ name: 'Fiction and Non Fiction', file: 'Anchor Charts/Fiction and Non Fiction.png' },{ name: 'Figurative Language', file: 'Anchor Charts/Figurative Language.png' },{ name: 'Homophones', file: 'Anchor Charts/Homophones.png' },{ name: 'Inference Skills', file: 'Anchor Charts/Inference Skills.png' },{ name: 'Information Text', file: 'Anchor Charts/Information Text.png' },{ name: 'Informative Sentence Starters', file: 'Anchor Charts/Informative Sentence Starters.png' },{ name: 'Main Idea', file: 'Anchor Charts/Main Idea.png' },{ name: 'Making Connections', file: 'Anchor Charts/Making Connections.png' },{ name: 'Making Predictions', file: 'Anchor Charts/Making Predictions.png' },{ name: 'Narrative Structure', file: 'Anchor Charts/Narrative Structure.png' },{ name: 'Note Taking Skills', file: 'Anchor Charts/Note Taking Skills.png' },{ name: 'Paragraph Structure', file: 'Anchor Charts/Paragraph Structure.png' },{ name: 'Parts of Speech', file: 'Anchor Charts/Parts of Speech.png' },{ name: 'Persuasive Hooks and Openings', file: 'Anchor Charts/Persuasive Hooks and Openings.png' },{ name: 'Persuasive Sentence Starters', file: 'Anchor Charts/Persuasive Sentence Starters.png' },{ name: 'Persuasive Techniques', file: 'Anchor Charts/Persuasive Techniques.png' },{ name: 'Poetry Features', file: 'Anchor Charts/Poetry Features.png' },{ name: 'Point of View', file: 'Anchor Charts/Point of View.png' },{ name: 'Powerful Verbs', file: 'Anchor Charts/Powerful Verbs.png' },{ name: 'Powerpoint Skills', file: 'Anchor Charts/Powerpoint Skills.png' },{ name: 'Prefixes and Suffixes', file: 'Anchor Charts/Prefixes and Suffixes.png' },{ name: 'Research Skills', file: 'Anchor Charts/Research Skills.png' },{ name: 'Sentences', file: 'Anchor Charts/Sentences.png' },{ name: 'Sequence of Events', file: 'Anchor Charts/Sequence of Events.png' },{ name: 'Similes and Metaphors', file: 'Anchor Charts/Similes and Metaphors.png' },{ name: 'Story Elements', file: 'Anchor Charts/Story Elements.png' },{ name: 'Strong Conclusions', file: 'Anchor Charts/Strong Conclusions.png' },{ name: 'Summarising', file: 'Anchor Charts/Summarising.png' },{ name: 'Synonyms and Antonyms', file: 'Anchor Charts/Synonyms and Antonyms.png' },{ name: 'TEEL Paragraphs', file: 'Anchor Charts/TEEL Paragraphs.png' },{ name: 'Text Features', file: 'Anchor Charts/Text Features.png' },{ name: 'Theme', file: 'Anchor Charts/Theme.png' },{ name: 'Types of Sentences', file: 'Anchor Charts/Types of Sentences.png' },{ name: 'Using Evidence', file: 'Anchor Charts/Using Evidence.png' },{ name: 'Visualising', file: 'Anchor Charts/Visualising.png' }] },
      { id: 'writing-informative', name: 'Informative Writing',    emoji: '📰', bg: 'bg-blue-100',    border: 'border-blue-300',    hover: 'hover:bg-blue-200',    text: 'text-blue-900',    images: [{ name: 'Information Reports', file: 'Writing/Informative/InfoReports.png' },{ name: 'Informative Writing Structure', file: 'Writing/Informative/Informative Writing Structure.png' },{ name: 'Informative Text Display 2', file: 'Writing/Informative/InformativeTextDisplay2.png' },{ name: 'TEEL Paragraph Display', file: 'Writing/Informative/TEELParagraphDisplay.png' },{ name: 'TEEL Paragraph Display 2', file: 'Writing/Informative/TEELParagraphDisplay2.png' }] },
      { id: 'writing-informative-ocean', name: 'Informative — Ocean Theme Learning Wall', emoji: '🌊', bg: 'bg-cyan-100', border: 'border-cyan-300', hover: 'hover:bg-cyan-200', text: 'text-cyan-900', images: [{ name: 'Overview', file: 'Writing/Informative/Ocean Theme Learning Wall/Overview.png' },{ name: 'Anchor Chart', file: 'Writing/Informative/Ocean Theme Learning Wall/Anchor Chart.png' },{ name: 'Brainstorm', file: 'Writing/Informative/Ocean Theme Learning Wall/Brainstorm.png' },{ name: 'Plan', file: 'Writing/Informative/Ocean Theme Learning Wall/Plan.png' },{ name: 'Research', file: 'Writing/Informative/Ocean Theme Learning Wall/Research.png' },{ name: 'Organise', file: 'Writing/Informative/Ocean Theme Learning Wall/Organise.png' },{ name: 'Write', file: 'Writing/Informative/Ocean Theme Learning Wall/Write.png' },{ name: 'Add Details', file: 'Writing/Informative/Ocean Theme Learning Wall/Add Details.png' },{ name: 'Key Facts', file: 'Writing/Informative/Ocean Theme Learning Wall/Key Facts.png' },{ name: 'Key Points', file: 'Writing/Informative/Ocean Theme Learning Wall/Key Points.png' },{ name: 'Headings', file: 'Writing/Informative/Ocean Theme Learning Wall/Headings.png' },{ name: 'Use Facts', file: 'Writing/Informative/Ocean Theme Learning Wall/Use Facts.png' },{ name: 'Use Technical Words', file: 'Writing/Informative/Ocean Theme Learning Wall/Use Technical Words.png' },{ name: 'Use Clear Sentences', file: 'Writing/Informative/Ocean Theme Learning Wall/Use Clear Sentences.png' },{ name: 'Vocabulary', file: 'Writing/Informative/Ocean Theme Learning Wall/Vocabulary.png' },{ name: 'Notes Template', file: 'Writing/Informative/Ocean Theme Learning Wall/Notes Template.png' },{ name: 'Checklist', file: 'Writing/Informative/Ocean Theme Learning Wall/Checklist.png' },{ name: 'Check Your Writing', file: 'Writing/Informative/Ocean Theme Learning Wall/Check Your Writing.png' },{ name: 'Check Facts', file: 'Writing/Informative/Ocean Theme Learning Wall/Check Facts.png' },{ name: 'Check Language', file: 'Writing/Informative/Ocean Theme Learning Wall/Check Language.png' },{ name: 'Check Organisation', file: 'Writing/Informative/Ocean Theme Learning Wall/Check Organisation.png' },{ name: 'Check and Improve', file: 'Writing/Informative/Ocean Theme Learning Wall/Check and Improve.png' },{ name: 'Improve Your Work', file: 'Writing/Informative/Ocean Theme Learning Wall/Improve Your Work.png' },{ name: 'Read Through', file: 'Writing/Informative/Ocean Theme Learning Wall/Read Through.png' }] },
      { id: 'writing-persuasive', name: 'Persuasive Writing',      emoji: '💬', bg: 'bg-amber-100',   border: 'border-amber-300',   hover: 'hover:bg-amber-200',   text: 'text-amber-900',   images: [{ name: 'Persuasive Display', file: 'Writing/Persuasive/Persuasive.png' },{ name: 'Persuasive Display 2', file: 'Writing/Persuasive/Persuasive 2.png' },{ name: 'Persuasive Writing Display', file: 'Writing/Persuasive/PersuasiveWritingDisplay.png' },{ name: 'Persuasive Checklist', file: 'Writing/Persuasive/Persuasive Checklist.png' },{ name: 'Persuasive Devices', file: 'Writing/Persuasive/Persuasive Devices.png' },{ name: 'Persuasive Elements', file: 'Writing/Persuasive/Persuasive Elements.png' },{ name: 'Persuasive Structure', file: 'Writing/Persuasive/Persuasive Structure.png' },{ name: 'Persuasive Writing Structure', file: 'Writing/Persuasive/Persuasive Writing Structure.png' }] },
      { id: 'writing-poetry',   name: 'Poetry Writing',            emoji: '🎭', bg: 'bg-fuchsia-100', border: 'border-fuchsia-300', hover: 'hover:bg-fuchsia-200', text: 'text-fuchsia-900', images: [{ name: 'Poetry', file: 'Writing/Poetry/Poetry.png' },{ name: 'Poetry Writing Structure', file: 'Writing/Poetry/Poetry Writing Structure.png' }] },
      { id: 'writing-recount',  name: 'Recount & Retell Writing',  emoji: '📝', bg: 'bg-orange-100',  border: 'border-orange-300',  hover: 'hover:bg-orange-200',  text: 'text-orange-900',  images: [{ name: 'Recount Writing', file: 'Writing/Recount or Retell/Recount.png' },{ name: 'Retell Writing Structure', file: 'Writing/Recount or Retell/Retell Writing Structure.png' }] },
      { id: 'literary-devices', name: 'Literary Devices',          emoji: '🎭', bg: 'bg-rose-100',    border: 'border-rose-300',    hover: 'hover:bg-rose-200',    text: 'text-rose-900',    images: [{ name: 'Characterisation', file: 'Writing/Literary Devices/Characterisation.png' },{ name: 'Imagery', file: 'Writing/Literary Devices/Imagery.png' },{ name: 'Literary Devices Overview', file: 'Writing/Literary Devices/Literary Devices.png' },{ name: 'Metaphors', file: 'Writing/Literary Devices/Metaphors.png' },{ name: 'Personification', file: 'Writing/Literary Devices/Personification.png' },{ name: 'Setting', file: 'Writing/Literary Devices/Setting.png' },{ name: 'Similes', file: 'Writing/Literary Devices/Similes.png' },{ name: 'Symbolism', file: 'Writing/Literary Devices/Symbolism.png' }] },
      { id: 'book-review',      name: 'Book Review Writing',       emoji: '📗', bg: 'bg-green-100',   border: 'border-green-300',   hover: 'hover:bg-green-200',   text: 'text-green-900',   images: [{ name: 'Book Review', file: 'Writing/Book Review/Book Review.png' },{ name: 'Review Body 1', file: 'Writing/Book Review/Review Body 1.png' },{ name: 'Review Body 2', file: 'Writing/Book Review/Review Body 2.png' },{ name: 'Review Body 3', file: 'Writing/Book Review/Review Body 3.png' },{ name: 'Review Checklist', file: 'Writing/Book Review/Review Checklist.png' },{ name: 'Review Conclusion', file: 'Writing/Book Review/Review Conclusion.png' },{ name: 'Review Draft', file: 'Writing/Book Review/Review Draft.png' },{ name: 'Review Editing', file: 'Writing/Book Review/Review Editing.png' },{ name: 'Review Introduction', file: 'Writing/Book Review/Review Introduction.png' },{ name: 'Review Preparation', file: 'Writing/Book Review/Review Preperation.png' },{ name: 'Review Structure', file: 'Writing/Book Review/Review Structure.png' },{ name: 'Review Writing Structure', file: 'Writing/Book Review/Review Writing Structure.png' }] },
      { id: 'ws-comprehension-yr',  name: 'Comprehension — Young Readers',    emoji: '📄', bg: 'bg-orange-100',  border: 'border-orange-300',  hover: 'hover:bg-orange-200',  text: 'text-orange-900',  images: [{ name: 'Comprehension Worksheet 1', file: 'Worksheets/Comprehension/Young Readers/ComprehensionWorksheet.png' },{ name: 'Comprehension Worksheet 2', file: 'Worksheets/Comprehension/Young Readers/ComprehensionWorksheet2.png' },{ name: 'Comprehension Worksheet 3', file: 'Worksheets/Comprehension/Young Readers/ComprehensionWorksheet3.png' }] },
      { id: 'ws-comprehension-yr2', name: 'Comprehension — Young Readers 2',  emoji: '📄', bg: 'bg-yellow-100',  border: 'border-yellow-300',  hover: 'hover:bg-yellow-200',  text: 'text-yellow-900',  images: [{ name: 'Young Readers 1', file: 'Worksheets/Comprehension/Young Readers 2/Young Readers 1.png' },{ name: 'Young Readers 2', file: 'Worksheets/Comprehension/Young Readers 2/Young Readers 2.png' },{ name: 'Young Readers 3', file: 'Worksheets/Comprehension/Young Readers 2/Young Readers 3.png' },{ name: 'Young Readers 4', file: 'Worksheets/Comprehension/Young Readers 2/Young Readers 4.png' },{ name: 'Young Readers 5', file: 'Worksheets/Comprehension/Young Readers 2/Young Readers 5.png' }] },
      { id: 'ws-comprehension-ah',  name: 'Comprehension — Ancient History',  emoji: '🏛️', bg: 'bg-stone-100',   border: 'border-stone-300',   hover: 'hover:bg-stone-200',   text: 'text-stone-900',   images: [{ name: 'Ancient History 4', file: 'Worksheets/Comprehension/Ancient History/ComprehensionWorksheet4.png' },{ name: 'Ancient History 5', file: 'Worksheets/Comprehension/Ancient History/ComprehensionWorksheet5.png' },{ name: 'Ancient History 6', file: 'Worksheets/Comprehension/Ancient History/ComprehensionWorksheet6.png' }] },
      { id: 'ws-comprehension-slang', name: 'Comprehension — Slang',          emoji: '😎', bg: 'bg-purple-100',  border: 'border-purple-300',  hover: 'hover:bg-purple-200',  text: 'text-purple-900',  images: [{ name: 'Delulu', file: 'Worksheets/Comprehension/Slang/Delulu Comprehension.png' },{ name: 'Rizz', file: 'Worksheets/Comprehension/Slang/Rizz Comprehension.png' },{ name: 'Skibidi', file: 'Worksheets/Comprehension/Slang/Skibidi Comprehension.png' },{ name: 'Slay', file: 'Worksheets/Comprehension/Slang/Slay Comprehension.png' },{ name: 'Yeet', file: 'Worksheets/Comprehension/Slang/Yeet Comprehension.png' }] },
      { id: 'ws-grammar',       name: 'Grammar Worksheets',         emoji: '✏️', bg: 'bg-lime-100',    border: 'border-lime-300',    hover: 'hover:bg-lime-200',    text: 'text-lime-900',    images: [{ name: 'Verbs Worksheet', file: 'Worksheets/Grammar/VerbsWorksheet.png' }] },
      { id: 'ws-writing',       name: 'Writing Worksheets',         emoji: '✍️', bg: 'bg-rose-100',    border: 'border-rose-300',    hover: 'hover:bg-rose-200',    text: 'text-rose-900',    images: [{ name: 'Complex Sentences', file: 'Worksheets/Writing/ComplexSentencesWorksheet.png' },{ name: 'Narrative Writing', file: 'Worksheets/Writing/NarrativeWritingWorksheet.png' },{ name: 'Persuasive Writing', file: 'Worksheets/Writing/PersuasiveWritingWorksheet.png' },{ name: 'Persuasive Writing 2', file: 'Worksheets/Writing/PersuasiveWritingWorksheet2.png' },{ name: 'TEEL Paragraph', file: 'Worksheets/Writing/TEELParagraphWorksheet.png' }] },
      { id: 'eng-mats',         name: 'Classroom Mats',             emoji: '🗂️', bg: 'bg-violet-100',  border: 'border-violet-300',  hover: 'hover:bg-violet-200',  text: 'text-violet-900',  images: [{ name: 'Adjective Mat', file: 'Mats/Adjective Mat.png' },{ name: 'Noun Mat', file: 'Mats/Noun Mat.png' },{ name: 'Simple Sentence Mat', file: 'Mats/Simple Sentence Mat.png' },{ name: 'Verb Mat', file: 'Mats/Verb Mat.png' },{ name: 'Word of the Day Mat', file: 'Mats/Word of the Day Mat.png' }] },
    ],
  },
  {
    id: 'maths', name: 'Maths Displays', emoji: '🧮', folder: 'Maths',
    bg: 'bg-green-100', border: 'border-green-300', hover: 'hover:bg-green-200', text: 'text-green-900',
    sections: [
      { id: 'number-ops',             name: 'Number & Operations',         emoji: '🔢', bg: 'bg-lime-100',    border: 'border-lime-300',    hover: 'hover:bg-lime-200',    text: 'text-lime-900',    images: [{ name: 'Addition', file: 'Number/Addition.png' },{ name: 'Subtraction', file: 'Number/Subtraction.png' },{ name: 'Multiplication', file: 'Number/Multiplication.png' },{ name: 'Division', file: 'Number/Division.png' },{ name: 'Integers', file: 'Number/Integers.png' },{ name: 'Comparing Fractions', file: 'Number/ComparingFractions.png' },{ name: 'Prime Numbers', file: 'Number/Prime Numbers.png' },{ name: 'Composite Numbers', file: 'Number/Composite Numbers.png' },{ name: 'Factors', file: 'Number/factors.png' },{ name: 'Multiples', file: 'Number/multiples.png' }] },
      { id: 'shapes',                 name: '2D & 3D Shapes',              emoji: '📐', bg: 'bg-sky-100',     border: 'border-sky-300',     hover: 'hover:bg-sky-200',     text: 'text-sky-900',     images: [{ name: '2D Shapes', file: 'Shape/2D Shapes.png' },{ name: '3D Shapes', file: 'Shape/3D Shapes.png' }] },
      { id: 'location-transform',     name: 'Location & Transformation',   emoji: '🔄', bg: 'bg-teal-100',    border: 'border-teal-300',    hover: 'hover:bg-teal-200',    text: 'text-teal-900',    images: [{ name: 'Flip', file: 'Location and Transformation/Flip.png' },{ name: 'Flip Turn Slide', file: 'Location and Transformation/FlipTurnSlide.png' },{ name: 'Slide', file: 'Location and Transformation/Slide.png' },{ name: 'Symmetry', file: 'Location and Transformation/Symmetry.png' },{ name: 'Tessellating Patterns', file: 'Location and Transformation/TessellatingPaterns.png' },{ name: 'Turn', file: 'Location and Transformation/Turn.png' }] },
      { id: 'measurement-d',          name: 'Measurement',                 emoji: '📏', bg: 'bg-amber-100',   border: 'border-amber-300',   hover: 'hover:bg-amber-200',   text: 'text-amber-900',   images: [{ name: 'Length', file: 'Measurement/Length.png' },{ name: 'Mass', file: 'Measurement/Mass.png' },{ name: 'Volume', file: 'Measurement/Volume.png' }] },
      { id: 'maths-sheets',           name: 'Worksheets',                  emoji: '📄', bg: 'bg-orange-100',  border: 'border-orange-300',  hover: 'hover:bg-orange-200',  text: 'text-orange-900',  images: [{ name: 'Australian Currency', file: 'Worksheets/AustralianCurrencyWorksheet.png' },{ name: 'BODMAS', file: 'Worksheets/BODMAS Worksheet.png' },{ name: 'Column Addition', file: 'Worksheets/Column Addition Worksheet.png' },{ name: 'Column Subtraction', file: 'Worksheets/Column Subtraction Worksheet.png' },{ name: 'Counting', file: 'Worksheets/CountingWorksheet.png' },{ name: 'Division', file: 'Worksheets/Division Worksheet.png' },{ name: 'Expanded Form', file: 'Worksheets/ExpandedFormWorksheet.png' },{ name: 'Multiplication', file: 'Worksheets/Multiplication Worksheet.png' },{ name: 'Place Value', file: 'Worksheets/PlaceValueWorksheet.png' },{ name: 'Skip Counting', file: 'Worksheets/SkipCountingWorksheet.png' },{ name: 'Whole Numbers', file: 'Worksheets/WholeNumbersWorksheet.png' },{ name: 'Factors', file: 'Worksheets/factors worksheet.png' },{ name: 'Multiples', file: 'Worksheets/multiples worksheet.png' },{ name: 'Fractions', file: 'Worksheets/fractions worksheet.png' }] },
      { id: 'maths-mentals',          name: 'Math Mentals',                emoji: '🧠', bg: 'bg-yellow-100',  border: 'border-yellow-300',  hover: 'hover:bg-yellow-200',  text: 'text-yellow-900',  images: [{ name: 'Math Mentals 1', file: 'Worksheets/Math Mentals/1.png' },{ name: 'Math Mentals 2', file: 'Worksheets/Math Mentals/2.png' },{ name: 'Math Mentals 3', file: 'Worksheets/Math Mentals/3.png' },{ name: 'Math Mentals 4', file: 'Worksheets/Math Mentals/4.png' },{ name: 'Math Mentals 5', file: 'Worksheets/Math Mentals/5.png' },{ name: 'Math Mentals 6', file: 'Worksheets/Math Mentals/6.png' },{ name: 'Math Mentals 7', file: 'Worksheets/Math Mentals/7.png' },{ name: 'Math Mentals 8', file: 'Worksheets/Math Mentals/8.png' },{ name: 'Math Mentals 9', file: 'Worksheets/Math Mentals/9.png' },{ name: 'Math Mentals 10', file: 'Worksheets/Math Mentals/10.png' },{ name: 'Math Mentals 11', file: 'Worksheets/Math Mentals/11.png' },{ name: 'Math Mentals 12', file: 'Worksheets/Math Mentals/12.png' },{ name: 'Math Mentals 13', file: 'Worksheets/Math Mentals/13.png' },{ name: 'Math Mentals 14', file: 'Worksheets/Math Mentals/14.png' },{ name: 'Math Mentals 15', file: 'Worksheets/Math Mentals/15.png' }] },
      { id: 'maths-mats',             name: 'Maths Mats',                  emoji: '🗂️', bg: 'bg-violet-100',  border: 'border-violet-300',  hover: 'hover:bg-violet-200',  text: 'text-violet-900',  images: [{ name: 'Multiplication Mat', file: 'Mats/Multiplication Mat.png' },{ name: 'Number Fact Mat', file: 'Mats/Number Fact Mat.png' },{ name: 'Number of the Day Mat', file: 'Mats/Number of the Day Mat.png' }] },
      { id: 'maths-anchor-charts',    name: 'Anchor Charts',               emoji: '⚓', bg: 'bg-sky-100',     border: 'border-sky-300',     hover: 'hover:bg-sky-200',     text: 'text-sky-900',     images: [{ name: 'Area and Perimeter', file: 'Anchor Charts/Area and Perimeter.png' },{ name: 'Decimal Basics', file: 'Anchor Charts/Decimal Basics.png' },{ name: 'Fractions', file: 'Anchor Charts/Fractions.png' },{ name: 'Measurement Conversions', file: 'Anchor Charts/Measurement Conversions.png' },{ name: 'Measuring in the Metric System', file: 'Anchor Charts/Measuring in the Metric System.png' },{ name: 'Multiplication', file: 'Anchor Charts/Multiplication.png' },{ name: 'Place Value', file: 'Anchor Charts/Place Value.png' },{ name: 'Reading Graphs and Tables', file: 'Anchor Charts/Reading Graphs and Tables.png' },{ name: 'Rounding Numbers', file: 'Anchor Charts/Rounding Numbers.png' }] },
    ],
  },
  {
    id: 'science', name: 'Science Displays', emoji: '🔬', folder: 'Science',
    bg: 'bg-purple-100', border: 'border-purple-300', hover: 'hover:bg-purple-200', text: 'text-purple-900',
    sections: [
      { id: 'experiments',  name: 'Experiments',           emoji: '🧪', bg: 'bg-green-100',  border: 'border-green-300',  hover: 'hover:bg-green-200',  text: 'text-green-900',  images: [{ name: 'Bottle Rocket Experiment', file: 'Experiments/Bottle Rocket.png' },{ name: 'Elephant Toothpaste Experiment', file: 'Experiments/Elephant Toothpaste.png' }] },
      { id: 'space-displays', name: 'Space',               emoji: '🪐', bg: 'bg-indigo-100', border: 'border-indigo-300', hover: 'hover:bg-indigo-200', text: 'text-indigo-900', images: [{ name: 'Earth', file: 'Space/Earth.png' },{ name: 'Jupiter', file: 'Space/Jupiter.png' },{ name: 'Mars', file: 'Space/Mars.png' },{ name: 'Mercury', file: 'Space/Mercury.png' },{ name: 'Neptune', file: 'Space/Neptune.png' },{ name: 'Saturn', file: 'Space/Saturn.png' },{ name: 'Solar System', file: 'Space/SolarSystem.png' },{ name: 'Space Vocabulary', file: 'Space/SpaceVocab.png' },{ name: 'Space Vocabulary Display', file: 'Space/SpaceVocabDisplay.png' },{ name: 'Uranus', file: 'Space/Uranus.png' },{ name: 'Venus', file: 'Space/Venus.png' },{ name: 'NASA Fact File', file: 'Space/NASA Fact File.png' }] },
      { id: 'env-change',   name: 'Environmental Change',  emoji: '🌿', bg: 'bg-emerald-100',border: 'border-emerald-300',hover: 'hover:bg-emerald-200',text: 'text-emerald-900',images: [{ name: 'Environmental Change Vocabulary', file: 'EnvironmentalChange/EnvironmentalChangeVocab.png' }] },
    ],
  },
  {
    id: 'hass', name: 'HASS Displays', emoji: '🌍', folder: 'HASS',
    bg: 'bg-amber-100', border: 'border-amber-300', hover: 'hover:bg-amber-200', text: 'text-amber-900',
    sections: [
      { id: 'hass-vocab', name: 'Vocabulary', emoji: '📖', bg: 'bg-amber-100', border: 'border-amber-300', hover: 'hover:bg-amber-200', text: 'text-amber-900', images: [{ name: 'Australian Federation Vocabulary', file: 'AustralianFederationVocab.png' }] },
    ],
  },
  {
    id: 'behaviour', name: 'Behaviour', emoji: '🌈', folder: 'Behaviour',
    bg: 'bg-rose-100', border: 'border-rose-300', hover: 'hover:bg-rose-200', text: 'text-rose-900',
    sections: [
      { id: 'classroom-rules',    name: 'Classroom Rules',                    emoji: '📋', bg: 'bg-amber-100',   border: 'border-amber-300',   hover: 'hover:bg-amber-200',   text: 'text-amber-900',   images: [{ name: 'Classroom Rules', file: 'Classroom Rules/Classroom Rules.png' },{ name: 'Classroom Rules 2', file: 'Classroom Rules/Classroom Rules 2.png' }] },
      { id: 'behaviour-cues',     name: 'Behaviour Cues',                     emoji: '🎨', bg: 'bg-rose-100',    border: 'border-rose-300',    hover: 'hover:bg-rose-200',    text: 'text-rose-900',    images: [{ name: 'Blue', file: 'Blue.png' },{ name: 'Colours', file: 'Colours.png' },{ name: 'Green', file: 'Green.png' },{ name: 'Red', file: 'Red.png' },{ name: 'Yellow', file: 'Yellow.png' }] },
      { id: 'calm-corner',        name: 'Calm Corner',                        emoji: '🌸', bg: 'bg-pink-100',    border: 'border-pink-300',    hover: 'hover:bg-pink-200',    text: 'text-pink-900',    images: [{ name: 'Calm Corner', file: 'Calm Corner.png' }] },
      { id: 'zones-regulation',   name: 'Zones of Regulation',                emoji: '🌈', bg: 'bg-sky-100',     border: 'border-sky-300',     hover: 'hover:bg-sky-200',     text: 'text-sky-900',     images: [{ name: 'Zones of Regulation', file: 'Zones of Regulation.png' },{ name: 'Zones', file: 'Zones.png' },{ name: 'Zones 2', file: 'Zones 2.png' },{ name: 'Zones 3', file: 'Zones 3.png' },{ name: 'Zones - Blue', file: 'Zones of Regulation Blue.png' },{ name: 'Zones - Blue 2', file: 'Zones Blue 2.png' },{ name: 'Zones - Blue 3', file: 'Zones Blue 3.png' },{ name: 'Zones - Green', file: 'Zones of Regulation Green.png' },{ name: 'Zones - Green 2', file: 'Zones Geen 2.png' },{ name: 'Zones - Green 3', file: 'Zones Green 3.png' },{ name: 'Zones - Red', file: 'Zones of Regulation Red.png' },{ name: 'Zones - Red 2', file: 'Zones Red 2.png' },{ name: 'Zones - Red 3', file: 'Zones Red 3.png' },{ name: 'Zones - Yellow', file: 'Zones of Regulation Yellow.png' },{ name: 'Zones - Yellow 2', file: 'Zones Yellow 2.png' },{ name: 'Zones - Yellow 3', file: 'Zones Yellow 3.png' }] },
      { id: 'breathing-techniques', name: 'Breathing Techniques',            emoji: '💨', bg: 'bg-cyan-100',    border: 'border-cyan-300',    hover: 'hover:bg-cyan-200',    text: 'text-cyan-900',    images: [{ name: 'Overview', file: 'Breathing Techniques/Overview.png' },{ name: '4-4-4 Breath', file: 'Breathing Techniques/444 Breath.png' },{ name: 'Balloon Breath', file: 'Breathing Techniques/Balloon Breath.png' },{ name: 'Belly Breath', file: 'Breathing Techniques/Belly Breath.png' },{ name: 'Bunny Breath', file: 'Breathing Techniques/Bunny Breath.png' },{ name: 'Butterfly Breath', file: 'Breathing Techniques/Butterfly Breath.png' },{ name: 'Star Breath', file: 'Breathing Techniques/Star Breath.png' }] },
      { id: 'coping-toolkit-1',   name: 'Coping Toolkit 1',                   emoji: '🧰', bg: 'bg-teal-100',    border: 'border-teal-300',    hover: 'hover:bg-teal-200',    text: 'text-teal-900',    images: [{ name: 'Overview', file: 'Coping Toolkit 1/Overview.png' },{ name: 'Calm My Mind', file: 'Coping Toolkit 1/Calm My Mind.png' },{ name: 'Connect', file: 'Coping Toolkit 1/Connect.png' },{ name: 'Distract My Mind', file: 'Coping Toolkit 1/Distract my Mind.png' },{ name: 'Express and Release', file: 'Coping Toolkit 1/Express and Release.png' },{ name: 'Remind Myself', file: 'Coping Toolkit 1/Remind Myself.png' },{ name: 'Take Care of My Body', file: 'Coping Toolkit 1/Take Care of my Body.png' }] },
      { id: 'coping-toolkit-2',   name: 'Coping Toolkit 2',                   emoji: '🧰', bg: 'bg-green-100',   border: 'border-green-300',   hover: 'hover:bg-green-200',   text: 'text-green-900',   images: [{ name: 'Overview', file: 'Coping Toolkit 2/Overview.png' },{ name: 'Calming Strategies', file: 'Coping Toolkit 2/Calming Strategies.png' },{ name: 'Afraid', file: 'Coping Toolkit 2/Afraid.png' },{ name: 'Angry', file: 'Coping Toolkit 2/Angry.png' },{ name: 'Bored', file: 'Coping Toolkit 2/Bored.png' },{ name: 'Excited', file: 'Coping Toolkit 2/Excited.png' },{ name: 'Frustrated', file: 'Coping Toolkit 2/Frustrated.png' },{ name: 'Lonely', file: 'Coping Toolkit 2/Lonely.png' },{ name: 'Overwhelmed', file: 'Coping Toolkit 2/Overwhelmed.png' },{ name: 'Sad', file: 'Coping Toolkit 2/Sad.png' },{ name: 'Stressed', file: 'Coping Toolkit 2/Stressed.png' },{ name: 'Worried', file: 'Coping Toolkit 2/Worried.png' }] },
      { id: 'coping-toolkit-3',   name: 'Coping Toolkit 3',                   emoji: '🧰', bg: 'bg-emerald-100', border: 'border-emerald-300', hover: 'hover:bg-emerald-200', text: 'text-emerald-900', images: [{ name: 'Overview', file: 'Coping Toolkit 3/Overview.png' },{ name: 'Calm My Mind', file: 'Coping Toolkit 3/Calm my Mind.png' },{ name: 'Connect', file: 'Coping Toolkit 3/Connect.png' },{ name: 'Distract My Mind', file: 'Coping Toolkit 3/Distract my Mind.png' },{ name: 'Express and Release', file: 'Coping Toolkit 3/Express and Release.png' },{ name: 'Remind Myself', file: 'Coping Toolkit 3/Remind Myself.png' },{ name: 'Take Care of My Body', file: 'Coping Toolkit 3/Take Care of my Body.png' }] },
      { id: 'emotion-ocean',      name: 'Emotion Ocean',                      emoji: '🌊', bg: 'bg-blue-100',    border: 'border-blue-300',    hover: 'hover:bg-blue-200',    text: 'text-blue-900',    images: [{ name: 'Overview', file: 'Emotion Ocean/Overview.png' },{ name: 'Good To Go', file: 'Emotion Ocean/Good To Go.png' },{ name: 'Bumpy Waters', file: 'Emotion Ocean/Bumpy Waters.png' },{ name: 'Stormy Seas', file: 'Emotion Ocean/Stormy Seas.png' },{ name: 'Deep Dive', file: 'Emotion Ocean/Deep Dive.png' }] },
      { id: 'expected-unexpected', name: 'Expected vs Unexpected Behaviours', emoji: '⚖️', bg: 'bg-yellow-100',  border: 'border-yellow-300',  hover: 'hover:bg-yellow-200',  text: 'text-yellow-900',  images: [{ name: 'Overview', file: 'Expected vs Unexpected Behaviours/Overview.png' },{ name: 'Expected Behaviours', file: 'Expected vs Unexpected Behaviours/Expected.png' },{ name: 'Unexpected Behaviours', file: 'Expected vs Unexpected Behaviours/Unexpected.png' }] },
      { id: 'mindfulness',        name: 'Mindfulness',                        emoji: '🧘', bg: 'bg-purple-100',  border: 'border-purple-300',  hover: 'hover:bg-purple-200',  text: 'text-purple-900',  images: [{ name: 'Overview', file: 'Mindfulness/Overview.png' },{ name: '5 Senses', file: 'Mindfulness/5 Senses.png' },{ name: 'Be Present', file: 'Mindfulness/Be Present.png' },{ name: 'Body Scan', file: 'Mindfulness/Body Scan.png' },{ name: 'Gratitude Moment', file: 'Mindfulness/Gratitude Moment.png' },{ name: 'Growth Mindset', file: 'Mindfulness/Growth Mindset.png' },{ name: 'Positive Self Talk', file: 'Mindfulness/Positive Self Talk.png' },{ name: 'Take Deep Breaths', file: 'Mindfulness/Take Deep Breaths.png' }] },
      { id: 'mood-modes-lower',   name: 'Mood Modes — Lower Primary',         emoji: '🐨', bg: 'bg-blue-100',    border: 'border-blue-300',    hover: 'hover:bg-blue-200',    text: 'text-blue-900',    images: [{ name: 'Overview', file: 'Mood Modes/Lower Primary/Mood Modes Overview.png' },{ name: 'Recharge Mode', file: 'Mood Modes/Lower Primary/Recharge Mode.png' },{ name: 'Ready Mode', file: 'Mood Modes/Lower Primary/Ready Mode.png' },{ name: 'Alert Mode', file: 'Mood Modes/Lower Primary/Alert Mode.png' },{ name: 'Overload Mode', file: 'Mood Modes/Lower Primary/Overload Mode.png' }] },
      { id: 'mood-modes-middle',  name: 'Mood Modes — Middle Primary',        emoji: '🦊', bg: 'bg-green-100',   border: 'border-green-300',   hover: 'hover:bg-green-200',   text: 'text-green-900',   images: [{ name: 'Overview', file: 'Mood Modes/Middle Primary/Mood Mode Overview.png' },{ name: 'Recharge Mode', file: 'Mood Modes/Middle Primary/Recharge Mode.png' },{ name: 'Ready Mode', file: 'Mood Modes/Middle Primary/Ready Mode.png' },{ name: 'Alert Mode', file: 'Mood Modes/Middle Primary/Alert Mode.png' },{ name: 'Overload Mode', file: 'Mood Modes/Middle Primary/Overload Mode.png' }] },
      { id: 'mood-modes-upper-f', name: 'Mood Modes — Upper Primary (Female)', emoji: '🌸', bg: 'bg-pink-100',   border: 'border-pink-300',    hover: 'hover:bg-pink-200',    text: 'text-pink-900',    images: [{ name: 'Overview', file: 'Mood Modes/Upper Primary Female/Mood Mode Overview.png' },{ name: 'Recharge Mode', file: 'Mood Modes/Upper Primary Female/Recharge Mode.png' },{ name: 'Ready Mode', file: 'Mood Modes/Upper Primary Female/Ready Mode.png' },{ name: 'Alert Mode', file: 'Mood Modes/Upper Primary Female/Alert Mode.png' },{ name: 'Overload Mode', file: 'Mood Modes/Upper Primary Female/Overload Mode.png' }] },
      { id: 'mood-modes-upper-f2', name: 'Mood Modes — Upper Primary (Female) v2', emoji: '💜', bg: 'bg-purple-100', border: 'border-purple-300', hover: 'hover:bg-purple-200', text: 'text-purple-900', images: [{ name: 'Overview', file: 'Mood Modes/Upper Primary Female 2/1. Overview.png' },{ name: 'Recharge Mode', file: 'Mood Modes/Upper Primary Female 2/2. Recharge Mode.png' },{ name: 'Ready Mode', file: 'Mood Modes/Upper Primary Female 2/3. Ready Mode.png' },{ name: 'Alert Mode', file: 'Mood Modes/Upper Primary Female 2/4. Alert Mode.png' },{ name: 'Overload Mode', file: 'Mood Modes/Upper Primary Female 2/5. Overload Mode.png' }] },
      { id: 'mood-modes-upper-m', name: 'Mood Modes — Upper Primary (Male)',   emoji: '🦒', bg: 'bg-orange-100', border: 'border-orange-300',  hover: 'hover:bg-orange-200',  text: 'text-orange-900',  images: [{ name: 'Overview', file: 'Mood Modes/Upper Primary Male/Mood Mode Overview.png' },{ name: 'Recharge Mode', file: 'Mood Modes/Upper Primary Male/Recharge Mode.png' },{ name: 'Ready Mode', file: 'Mood Modes/Upper Primary Male/Ready Mode.png' },{ name: 'Alert Mode', file: 'Mood Modes/Upper Primary Male/Alert Mode.png' },{ name: 'Overload Mode', file: 'Mood Modes/Upper Primary Male/Overload Mode.png' }] },
      { id: 'mood-modes-upper-mixed', name: 'Mood Modes — Upper Primary (Mixed)', emoji: '🌟', bg: 'bg-yellow-100', border: 'border-yellow-300', hover: 'hover:bg-yellow-200', text: 'text-yellow-900', images: [{ name: 'Overview', file: 'Mood Modes/Upper Primary Mixed/1. Overview.png' },{ name: 'Recharge Mode', file: 'Mood Modes/Upper Primary Mixed/2. Recharge Mode.png' },{ name: 'Ready Mode', file: 'Mood Modes/Upper Primary Mixed/3. Ready Mode.png' },{ name: 'Alert Mode', file: 'Mood Modes/Upper Primary Mixed/4. Alert Mode.png' },{ name: 'Overdrive Mode', file: 'Mood Modes/Upper Primary Mixed/5. Overdrive Mode.png' }] },
      { id: 'size-of-problem',    name: 'Size of the Problem',                 emoji: '📏', bg: 'bg-indigo-100',  border: 'border-indigo-300',  hover: 'hover:bg-indigo-200',  text: 'text-indigo-900',  images: [{ name: 'Overview', file: 'Size of the Problem/Overview.png' },{ name: 'Tiny', file: 'Size of the Problem/Tiny.png' },{ name: 'Small', file: 'Size of the Problem/Small.png' },{ name: 'Medium', file: 'Size of the Problem/Medium.png' },{ name: 'Big', file: 'Size of the Problem/Big.png' }] },
      { id: 'social-skills',      name: 'Social Skills',                       emoji: '🤝', bg: 'bg-violet-100',  border: 'border-violet-300',  hover: 'hover:bg-violet-200',  text: 'text-violet-900',  images: [{ name: 'Overview', file: 'Social Skills/OVerview.png' },{ name: 'Be Honest', file: 'Social Skills/Be Honest.png' },{ name: 'Be Kind', file: 'Social Skills/Be Kind.png' },{ name: 'Include Others', file: 'Social Skills/Include Others.png' },{ name: 'Listen', file: 'Social Skills/Listen.png' },{ name: 'Manage Emotions', file: 'Social Skills/Manage Emotions.png' },{ name: 'Respect Others', file: 'Social Skills/Respect Others.png' },{ name: 'Take Turns', file: 'Social Skills/Take Turns.png' },{ name: 'Use Good Manners', file: 'Social Skills/Use Good Manners.png' }] },
      { id: 'wellbeing', name: 'Wellbeing', emoji: '💚', bg: 'bg-emerald-100', border: 'border-emerald-300', hover: 'hover:bg-emerald-200', text: 'text-emerald-900', images: [{ name: 'Overview', file: 'Wellbeing/1. Overview.png' },{ name: 'Breathing Techniques', file: 'Wellbeing/2. Breathing Techniques.png' },{ name: 'Stretches', file: 'Wellbeing/3. Stretches.png' },{ name: 'Movements', file: 'Wellbeing/4. Movements.png' },{ name: 'Affirmations', file: 'Wellbeing/5. Affiermations.png' },{ name: 'Sleep', file: 'Wellbeing/6. Sleep.png' },{ name: 'Checklist', file: 'Wellbeing/7. Checklist.png' },{ name: 'Journal', file: 'Wellbeing/8. Journal.png' }] },
      { id: 'conflict-resolution-boys',  name: 'Conflict Resolution (Boys)',   emoji: '🤜', bg: 'bg-blue-100',    border: 'border-blue-300',    hover: 'hover:bg-blue-200',    text: 'text-blue-900',    images: [{ name: 'Overview', file: 'Conflict Resolution Boys/1. Overview.png' },{ name: 'Pause and Calm Down', file: 'Conflict Resolution Boys/2. Pause and Calm Down.png' },{ name: 'Understand the Situation', file: 'Conflict Resolution Boys/3. Understand the Situation.png' },{ name: 'Talk it Out Respectfully', file: 'Conflict Resolution Boys/4. Talk it Out Respectfully.png' },{ name: 'Find Solutions Together', file: 'Conflict Resolution Boys/5. Find Solutions Together.png' },{ name: 'Agree and Make a Plan', file: 'Conflict Resolution Boys/6. Agree and Make a Plan.png' },{ name: 'Reflect and Grow', file: 'Conflict Resolution Boys/7. Reflect and Grow.png' }] },
      { id: 'conflict-resolution-girls', name: 'Conflict Resolution (Girls)',  emoji: '🤛', bg: 'bg-rose-100',    border: 'border-rose-300',    hover: 'hover:bg-rose-200',    text: 'text-rose-900',    images: [{ name: 'Overview', file: 'Conflict Resolution Girls/1. Overview.png' },{ name: 'Pause and Calm Down', file: 'Conflict Resolution Girls/2. Pause and Calm Down.png' },{ name: 'Understand the Situation', file: 'Conflict Resolution Girls/3. Understand the Situation.png' },{ name: 'Talk it Out Respectfully', file: 'Conflict Resolution Girls/4. Talk it Out Respectfully.png' },{ name: 'Find Solutions Together', file: 'Conflict Resolution Girls/5. Find Solutions Together.png' },{ name: 'Agree and Make a Plan', file: 'Conflict Resolution Girls/6. Agree and Make a Plan.png' },{ name: 'Reflect and Grow', file: 'Conflict Resolution Girls/7. Reflect and Grow.png' }] },
      { id: 'sensory-options',           name: 'Sensory Options',              emoji: '🌀', bg: 'bg-teal-100',    border: 'border-teal-300',    hover: 'hover:bg-teal-200',    text: 'text-teal-900',    images: [{ name: 'Sensory Options 1', file: 'Sensory Options/1..png' },{ name: 'Sensory Options 2', file: 'Sensory Options/2..png' }] },
      { id: 'behaviour-journal',         name: 'Journal',                      emoji: '📓', bg: 'bg-amber-100',   border: 'border-amber-300',   hover: 'hover:bg-amber-200',   text: 'text-amber-900',   images: [{ name: 'Boys', file: 'Journal/1. Boys.png' },{ name: 'Girls', file: 'Journal/2. Girls.png' }] },
    ],
  },
  {
    id: 'games', name: 'Games & Brain Breaks', emoji: '🎲', folder: 'Games',
    bg: 'bg-fuchsia-100', border: 'border-fuchsia-300', hover: 'hover:bg-fuchsia-200', text: 'text-fuchsia-900',
    sections: [
      { id: 'brain-breaks',   name: 'Brain Breaks',         emoji: '🧠', bg: 'bg-fuchsia-100', border: 'border-fuchsia-300', hover: 'hover:bg-fuchsia-200', text: 'text-fuchsia-900', images: [{ name: '20 Questions', file: 'Classroom Games/20Questions.png' },{ name: 'Two Truths', file: 'Classroom Games/2truths.png' },{ name: 'Bang', file: 'Classroom Games/Bang.png' },{ name: "Captain's Orders", file: 'Classroom Games/CaptainsOrders.png' },{ name: 'Celebrity Heads', file: 'Classroom Games/CelebrityHeads.png' },{ name: 'Corners', file: 'Classroom Games/Corners.png' },{ name: 'Fruit Salad', file: 'Classroom Games/FruitSalad.png' },{ name: 'Heads Down Thumbs Up', file: 'Classroom Games/HeadsDownThumbsUp.png' },{ name: 'Human Knot', file: 'Classroom Games/HumanKnot.png' },{ name: 'Musical Statues', file: 'Classroom Games/Musical Statues.png' },{ name: 'One Word', file: 'Classroom Games/OneWord.png' },{ name: 'Secret Leader', file: 'Classroom Games/SecretLeader.png' },{ name: 'Silent Ball', file: 'Classroom Games/Silent Ball.png' },{ name: 'Sleepy Spy', file: 'Classroom Games/SleepySpy.png' },{ name: 'Paper Scissors Rock', file: 'Classroom Games/PSR.png' },{ name: 'Sharks and Minnows', file: 'Classroom Games/SharksandMinnows.png' }] },
      { id: 'brain-breaks-2', name: 'Brain Breaks — Set 2',  emoji: '🎯', bg: 'bg-purple-100',  border: 'border-purple-300',  hover: 'hover:bg-purple-200',  text: 'text-purple-900',  images: [{ name: 'Four Corners', file: 'Classroom Games 2/Classroom Game Four Corners.png' },{ name: 'Heads Down Thumbs Up', file: 'Classroom Games 2/Classroom Game Heads Down Thumbs Up.png' },{ name: 'Silent Ball', file: 'Classroom Games 2/Classroom Game Silent Ball.png' },{ name: 'Silent Line Up', file: 'Classroom Games 2/Classroom Game Silent Line Up.png' }] },
    ],
  },
];

// ─── Recently Added images (shown in the scrolling showcase on the subject picker) ──
const RECENTLY_ADDED = [
  { src: '/Displays/Behaviour/Conflict Resolution Boys/1. Overview.png',           label: 'Conflict Resolution — Boys',             subject: 'Behaviour' },
  { src: '/Displays/Behaviour/Conflict Resolution Boys/2. Pause and Calm Down.png',label: 'Pause and Calm Down',                    subject: 'Behaviour' },
  { src: '/Displays/Behaviour/Conflict Resolution Girls/1. Overview.png',          label: 'Conflict Resolution — Girls',            subject: 'Behaviour' },
  { src: '/Displays/Behaviour/Conflict Resolution Girls/5. Find Solutions Together.png', label: 'Find Solutions Together',           subject: 'Behaviour' },
  { src: '/Displays/Behaviour/Mood Modes/Upper Primary Female 2/1. Overview.png',  label: 'Mood Modes — Upper Primary Female v2',  subject: 'Behaviour' },
  { src: '/Displays/Behaviour/Mood Modes/Upper Primary Mixed/1. Overview.png',     label: 'Mood Modes — Upper Primary Mixed',       subject: 'Behaviour' },
  { src: '/Displays/Behaviour/Sensory Options/1..png',                             label: 'Sensory Options',                        subject: 'Behaviour' },
  { src: '/Displays/Maths/Number/Prime Numbers.png',                               label: 'Prime Numbers',                          subject: 'Maths' },
  { src: '/Displays/Maths/Number/Composite Numbers.png',                           label: 'Composite Numbers',                      subject: 'Maths' },
  { src: '/Displays/Maths/Number/factors.png',                                     label: 'Factors',                                subject: 'Maths' },
  { src: '/Displays/Maths/Number/multiples.png',                                   label: 'Multiples',                              subject: 'Maths' },
  { src: '/Displays/Maths/Worksheets/factors worksheet.png',                       label: 'Factors Worksheet',                      subject: 'Maths' },
  { src: '/Displays/Maths/Worksheets/multiples worksheet.png',                     label: 'Multiples Worksheet',                    subject: 'Maths' },
  { src: '/Displays/Maths/Worksheets/fractions worksheet.png',                     label: 'Fractions Worksheet',                    subject: 'Maths' },
  { src: '/Displays/English/Writing/Narrative/Forest Themed Learning Wall/1. Overview.png',  label: 'Narrative Forest Wall — Overview', subject: 'English' },
  { src: '/Displays/English/Writing/Narrative/Forest Themed Learning Wall/7. Characters.png', label: 'Narrative — Characters',        subject: 'English' },
  { src: '/Displays/English/Writing/Narrative/Forest Themed Learning Wall/10. Hook.png',      label: 'Narrative — Hook',              subject: 'English' },
  { src: '/Displays/English/Writing/Narrative/Forest Themed Learning Wall/28. Checklist.png', label: 'Narrative Checklist',           subject: 'English' },
  { src: '/Displays/English/Writing/Procedure/1..png',                             label: 'Procedure Writing',                      subject: 'English' },
];

// Seeded shuffle — different order every page load, stable within the session
const shuffled = [...RECENTLY_ADDED].sort(() => Math.random() - 0.5);
const RECENT_DISPLAY = [...shuffled, ...shuffled]; // duplicate for seamless loop

// ─── Scrolling showcase component ────────────────────────────────────────────
const SUBJECT_BADGE = {
  English:   'bg-blue-100 text-blue-800',
  Maths:     'bg-green-100 text-green-800',
  Behaviour: 'bg-rose-100 text-rose-800',
};

const RecentlyAddedShowcase = () => {
  const trackRef = useRef(null);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let pos = 0;
    let rafId;
    const speed = 0.6; // px per frame
    const step = () => {
      pos += speed;
      const half = el.scrollWidth / 2;
      if (pos >= half) pos -= half;
      el.style.transform = `translateX(-${pos}px)`;
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    const pause  = () => cancelAnimationFrame(rafId);
    const resume = () => { rafId = requestAnimationFrame(step); };
    el.parentElement.addEventListener('mouseenter', pause);
    el.parentElement.addEventListener('mouseleave', resume);
    return () => {
      cancelAnimationFrame(rafId);
      el.parentElement?.removeEventListener('mouseenter', pause);
      el.parentElement?.removeEventListener('mouseleave', resume);
    };
  }, []);

  return (
    <div className="mt-2 mb-2">
      <div className="flex items-center gap-3 mb-3 px-1">
        <span className="text-lg">✨</span>
        <h3 className="text-base font-black text-gray-700">Recently Added</h3>
        <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">New</span>
      </div>
      <div className="overflow-hidden rounded-2xl" style={{ cursor: 'grab' }}>
        <div ref={trackRef} className="flex gap-3 will-change-transform" style={{ width: 'max-content' }}>
          {RECENT_DISPLAY.map((img, i) => (
            <div key={i} className="flex-shrink-0 w-44 rounded-xl overflow-hidden bg-white border-2 border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group">
              <div className="h-32 overflow-hidden bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.label} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-2">
                <p className="text-xs font-bold text-gray-700 leading-tight truncate">{img.label}</p>
                <span className={`mt-1 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full ${SUBJECT_BADGE[img.subject] || 'bg-gray-100 text-gray-600'}`}>{img.subject}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Build a flat search index from everything ────────────────────────────────
const buildSearchIndex = (subjects, resourcesBySubject) => {
  const index = [];
  subjects.forEach(subj => {
    subj.areas.forEach(area => {
      if (area.type === 'tools') {
        (area.tools || []).forEach(tool => {
          index.push({ kind: 'tool', label: tool.name, sublabel: `${subj.emoji} ${subj.name} › ${area.emoji} ${area.name}`, subject: subj, area, tool, emoji: tool.emoji });
        });
      }
    });
    // Unit resources
    (resourcesBySubject[subj.id] || []).forEach(res => {
      // find the resources area
      const resArea = subj.areas.find(a => a.type === 'resources');
      index.push({ kind: 'resource', label: res.title, sublabel: `${subj.emoji} ${subj.name} › Bundles`, subject: subj, area: resArea, resource: res, emoji: res.icon || '📄' });
    });
  });
  // Displays
  ALL_DISPLAY_CATEGORIES.forEach(cat => {
    cat.sections.forEach(sec => {
      sec.images.forEach(img => {
        index.push({ kind: 'display', label: img.name, sublabel: `🖼️ ${cat.name} › ${sec.emoji} ${sec.name}`, displayCat: cat, displaySection: { ...sec, folder: cat.folder }, displayImage: { ...img, folder: cat.folder }, emoji: '🖼️' });
      });
    });
  });
  return index;
};

// ─── Unit Resources ───────────────────────────────────────────────────────────
const resourcesBySubject = {
  english: [
    { id: 'informative-ocean-theme',  title: 'Informative Writing — Ocean Theme Learning Wall', icon: '🌊', pdfPath: '/Unit Resources/English/Informative_Ocean_Theme_Learning_Wall.pdf' },
    { id: 'paragraph-writing',        title: 'Paragraph Writing',                               icon: '¶',  pdfPath: '/Unit Resources/English/Paragraph_Writing.pdf' },
    { id: 'sentence-writing',         title: 'Sentence Writing',                                icon: '✏️', pdfPath: '/Unit Resources/English/Sentence_Writing.pdf' },
    { id: 'english-anchor-charts',    title: 'Anchor Charts',                                   icon: '⚓', pdfPath: '/Unit Resources/English/English_Anchor_Charts.pdf' },
    { id: 'narrative-forest-wall',    title: 'Narrative Writing — Forest Themed Learning Wall', icon: '🌲', pdfPath: '/Unit Resources/English/Narrative_Forest_Themed_Learning_Wall.pdf' },
    { id: 'procedure-writing',        title: 'Procedure Writing',                               icon: '📋', pdfPath: '/Unit Resources/English/Procedure_Writing.pdf' },
    { id: 'wilds-of-writing',         title: 'The Wilds of Writing: A Field Guide',      icon: '✍️', pdfPath: '/Unit Resources/Literacy/The_Wilds_of_Writing_A_Field_Guide.pdf' },
    { id: 'blend-friends',            title: 'Blend Friends Adventure',                  icon: '🔤', pdfPath: '/Unit Resources/Literacy/Blend_Friends_Adventure.pdf' },
    { id: 'phonics-superpowers',        title: 'Phonics Superpowers Guide',                icon: '🔡', pdfPath: '/Curriculum/New Literacy/Spelling and Word Study/Phonics Patterns/Learning/Phonics_Superpowers.pdf' },
    { id: 'comprehension-info-texts', title: 'Comprehension Information Texts',          icon: '📖', pdfPath: '/Unit Resources/Literacy/Comprehension Information Texts.pdf' },
    { id: 'leveled-comprehension-1',  title: 'Leveled Comprehension PACK 1',             icon: '📖', pdfPath: '/Unit Resources/Literacy/Leveled Comprehension PACK 1.pdf' },
    { id: 'leveled-comprehension-2',  title: 'Leveled Comprehension PACK 2',             icon: '📖', pdfPath: '/Unit Resources/Literacy/Leveled Comprehension PACK 2.pdf' },
    { id: 'reading-strategies',       title: 'Reading Strategies',                       icon: '🧠', pdfPath: '/Unit Resources/Literacy/Reading Strategies.pdf' },
    { id: 'info-text-comprehension',  title: 'Information Text Comprehension',           icon: '📝', pdfPath: '/Unit Resources/Literacy/Information Text Comprehension.pdf' },
    { id: 'character-profile',        title: 'Character Profile Comprehension',          icon: '🧑‍🎨', pdfPath: '/Unit Resources/Literacy/Character Profile Comprehension.pdf' },
    { id: 'character-creation',       title: 'Character Creation Crew',                  icon: '🧑‍🎨', pdfPath: '/Unit Resources/Literacy/Character_Creation_Crew_Building_Unforgettable_Stories.pdf' },
    { id: 'metaphors-similes',        title: 'Comparison Cuties: Metaphors & Similes',   icon: '🌈', pdfPath: '/Unit Resources/Literacy/Comparison_Cuties_Metaphors_and_Similes.pdf' },
    { id: 'literary-architecture',    title: 'Literary Architecture',                    icon: '🏛️', pdfPath: '/Unit Resources/Literacy/Literary_Architecture.pdf' },
    { id: 'paint-worlds',             title: 'Paint Worlds With Words',                  icon: '🎨', pdfPath: '/Unit Resources/Literacy/Paint_Worlds_With_Words.pdf' },
    { id: 'shelter-shore',            title: 'Shelter Shore: Identity Craft',            icon: '🌊', pdfPath: '/Unit Resources/Literacy/Shelter_Shore_Identity_Craft.pdf' },
    { id: 'teresa-book-analysis',     title: 'Teresa: A New Australian — Book Analysis', icon: '📗', pdfPath: '/Unit Resources/Literacy/Teresa_A_New_Australian_Book_Analysis.pdf' },
    { id: 'fanboys',                  title: 'FANBOYS: The Super Squad of Sentences',    icon: '💥', pdfPath: '/Unit Resources/Literacy/FANBOYS_The_Super_Squad_of_Sentences.pdf' },
    { id: 'grammar-garden',           title: 'Grammar Garden Helpers',                   icon: '🌸', pdfPath: '/Unit Resources/Literacy/Grammar_Garden_Helpers.pdf' },
    { id: 'grammar-kingdoms',         title: 'Grammar: The Four Kingdoms',               icon: '👑', pdfPath: '/Unit Resources/Literacy/Grammar_The_Four_Kingdoms.pdf' },
    { id: 'narnia',                   title: 'Narnia: Deep Magic and the Wardrobe',      icon: '🦁', pdfPath: '/Unit Resources/Literacy/Narnia_Deep_Magic_and_the_Wardrobe.pdf' },
    { id: 'nintendo-story',           title: 'The Nintendo Story',                       icon: '🎮', pdfPath: '/Unit Resources/Literacy/The_Nintendo_Story.pdf' },
    { id: 'noun-hunt',                title: 'The Noun Hunt',                            icon: '🔍', pdfPath: '/Unit Resources/Literacy/The_Noun_Hunt.pdf' },
    { id: 'world-cup',                title: 'World Cup History: The Global Game',       icon: '⚽', pdfPath: '/Unit Resources/Literacy/World_Cup_History_The_Global_Game.pdf' },
  ],
  mathematics: [
    { id: 'math-mentals',      title: 'Math Mentals',                icon: '🧠', pdfPath: '/Unit Resources/Maths/Math_Mentals.pdf' },
    { id: 'maths-anchor-charts', title: 'Anchor Charts',             icon: '⚓', pdfPath: '/Unit Resources/Maths/Maths_Anchor_Charts.pdf' },
    { id: 'coins-notes',       title: 'Australian Coins and Notes',  icon: '💰', pdfPath: '/Unit Resources/Mathematics/Australian Coins and Notes.pdf' },
    { id: 'fraction-blocks',   title: 'Fraction Building Blocks',    icon: '½',  pdfPath: '/Unit Resources/Mathematics/Fraction_Building_Blocks.pdf' },
    { id: 'integer-ocean',     title: 'Integer Ocean Adventure',     icon: '🌊', pdfPath: '/Unit Resources/Mathematics/Integer_Ocean_Adventure.pdf' },
    { id: 'world-beyond-zero', title: 'The World Beyond Zero',       icon: '0️⃣', pdfPath: '/Unit Resources/Mathematics/The_World_Beyond_Zero.pdf' },
  ],
  science: [
    { id: 'city-stars',          title: 'A City In The Stars',   icon: '🌃', pdfPath: '/Unit Resources/Science/A_City_In_The_Stars.pdf' },
    { id: 'celestial-clockwork', title: 'Celestial Clockwork',   icon: '⚙️', pdfPath: '/Unit Resources/Science/Celestial_Clockwork.pdf' },
    { id: 'solar-system-pdf',    title: 'Our Solar System Tour', icon: '🪐', pdfPath: '/Unit Resources/Science/Our_Solar_System_Tour.pdf' },
  ],
  behaviour: [
    { id: 'zones-of-regulation',             title: 'Zones of Regulation',                      icon: '🌈', pdfPath: '/free-resources/Zones_of_Regulation.pdf' },
    { id: 'wellbeing',                         title: 'Wellbeing',                                        icon: '💚', pdfPath: '/Unit Resources/Behaviour/Wellbeing.pdf' },
    { id: 'journal',                           title: 'Journal',                                          icon: '📓', pdfPath: '/Unit Resources/Behaviour/Journal.pdf' },
    { id: 'conflict-resolution-boys',        title: 'Conflict Resolution (Boys)',                icon: '🤜', pdfPath: '/Unit Resources/Behaviour/Conflict_Resolution_Boys.pdf' },
    { id: 'conflict-resolution-girls',       title: 'Conflict Resolution (Girls)',               icon: '🤛', pdfPath: '/Unit Resources/Behaviour/Conflict_Resolution_Girls.pdf' },
    { id: 'mood-modes-upper-primary-female-2', title: 'Mood Modes — Upper Primary (Female) v2', icon: '💜', pdfPath: '/Unit Resources/Behaviour/Mood_Modes_Upper_Primary_Female_2.pdf' },
    { id: 'mood-modes-upper-primary-mixed',  title: 'Mood Modes — Upper Primary (Mixed)',       icon: '🌟', pdfPath: '/Unit Resources/Behaviour/Mood_Modes_Upper_Primary_Mixed.pdf' },
    { id: 'mood-modes-lower-primary',        title: 'Mood Modes — Lower Primary',               icon: '🐨', pdfPath: '/Unit Resources/Behaviour/Mood_Modes_Lower_Primary.pdf' },
    { id: 'mood-modes-middle-primary',       title: 'Mood Modes — Middle Primary',              icon: '🦊', pdfPath: '/Unit Resources/Behaviour/Mood_Modes_Middle_Primary.pdf' },
    { id: 'mood-modes-upper-primary-female', title: 'Mood Modes — Upper Primary (Female)',      icon: '🌸', pdfPath: '/Unit Resources/Behaviour/Mood_Modes_Upper_Primary_Female.pdf' },
    { id: 'mood-modes-upper-primary-male',   title: 'Mood Modes — Upper Primary (Male)',        icon: '🦒', pdfPath: '/Unit Resources/Behaviour/Mood_Modes_Upper_Primary_Male.pdf' },
    { id: 'breathing-techniques',            title: 'Breathing Techniques',                     icon: '💨', pdfPath: '/Unit Resources/Behaviour/Breathing_Techniques.pdf' },
    { id: 'coping-toolkit-1',                title: 'Coping Toolkit 1',                         icon: '🧰', pdfPath: '/Unit Resources/Behaviour/Coping_Toolkit_1.pdf' },
    { id: 'coping-toolkit-2',                title: 'Coping Toolkit 2',                         icon: '🧰', pdfPath: '/Unit Resources/Behaviour/Coping_Toolkit_2.pdf' },
    { id: 'coping-toolkit-3',                title: 'Coping Toolkit 3',                         icon: '🧰', pdfPath: '/Unit Resources/Behaviour/Coping_Toolkit_3.pdf' },
    { id: 'emotion-ocean',                   title: 'Emotion Ocean',                            icon: '🌊', pdfPath: '/Unit Resources/Behaviour/Emotion_Ocean.pdf' },
    { id: 'expected-unexpected',             title: 'Expected vs Unexpected Behaviours',        icon: '⚖️', pdfPath: '/Unit Resources/Behaviour/Expected_vs_Unexpected_Behaviours.pdf' },
    { id: 'mindfulness',                     title: 'Mindfulness',                              icon: '🧘', pdfPath: '/Unit Resources/Behaviour/Mindfulness.pdf' },
    { id: 'size-of-problem',                 title: 'Size of the Problem',                      icon: '📏', pdfPath: '/Unit Resources/Behaviour/Size_of_the_Problem.pdf' },
    { id: 'social-skills',                   title: 'Social Skills',                            icon: '🤝', pdfPath: '/Unit Resources/Behaviour/Social_Skills.pdf' },
    { id: 'classroom-rules-pdf',             title: 'Classroom Rules',                          icon: '📋', pdfPath: '/Unit Resources/Behaviour/Classroom_Rules.pdf' },
  ],
  hass: [
    { id: 'historical-figures',  title: 'Historical Figures',                          icon: '🏛️', pdfPath: '/Unit Resources/HASS/Historical Figures.pptx' },
    { id: 'alexander',           title: 'Alexander Unbroken',                          icon: '⚔️', pdfPath: '/Unit Resources/HASS/Alexander_Unbroken_The_Life_of_Conquest.pdf' },
    { id: 'attila',              title: 'Attila: Scourge and Sovereign',               icon: '🗡️', pdfPath: '/Unit Resources/HASS/Attila_Scourge_and_Sovereign.pdf' },
    { id: 'australia-deep-time', title: 'Australia: Deep Time to Now',                icon: '🦘', pdfPath: '/Unit Resources/HASS/Australia_Deep_Time_to_Now.pdf' },
    { id: 'bermuda',             title: 'Bermuda Triangle Investigation',              icon: '🔺', pdfPath: '/Unit Resources/HASS/Bermuda_Triangle_Investigation.pdf' },
    { id: 'caesar',              title: "Caesar's Path to Empire",                    icon: '🦅', pdfPath: '/Unit Resources/HASS/Caesar_s_Path_to_Empire.pdf' },
    { id: 'cleopatra',           title: 'Cleopatra: Power, Propaganda, Legacy',       icon: '🐍', pdfPath: '/Unit Resources/HASS/Cleopatra_Power_Propaganda_Legacy.pdf' },
    { id: 'cross-crescent',      title: 'Cross and Crescent: War and Ideas',          icon: '✝️', pdfPath: '/Unit Resources/HASS/Cross_and_Crescent_War_and_Ideas.pdf' },
    { id: 'einstein',            title: 'Einstein: Mind, Matter, Time',               icon: '🧠', pdfPath: '/Unit Resources/HASS/Einstein_Mind_Matter_Time.pdf' },
    { id: 'genghis-khan',        title: 'Genghis Khan: Architect of the Modern World',icon: '🏹', pdfPath: '/Unit Resources/HASS/Genghis_Khan_Architect_of_the_Modern_World.pdf' },
    { id: 'joan-of-arc',         title: 'Joan of Arc: The Maid Who Saved France',    icon: '⚜️', pdfPath: '/Unit Resources/HASS/Joan_of_Arc_The_Maid_Who_Saved_France.pdf' },
    { id: 'pyramid-engineering', title: 'Pyramid Engineering Solved',                 icon: '🔺', pdfPath: '/Unit Resources/HASS/Pyramid_Engineering_Solved.pdf' },
    { id: 'black-death',         title: 'The Black Death: A Timeline',                icon: '💀', pdfPath: '/Unit Resources/HASS/The_Black_Death_A_Timeline_of_History.pdf' },
    { id: 'french-revolution',   title: 'The French Revolution: A World Transformed', icon: '🗽', pdfPath: '/Unit Resources/HASS/The_French_Revolution_A_World_Transformed.pdf' },
    { id: 'ww2',                 title: 'The Second World War: 1939–1945',            icon: '🎖️', pdfPath: '/Unit Resources/HASS/The_Second_World_War_1939–1945.pdf' },
    { id: 'confucius',           title: 'The Way of Confucius',                       icon: '☯️', pdfPath: '/Unit Resources/HASS/The_Way_of_Confucius_Endures.pdf' },
    { id: 'ww1',                 title: 'World War I Timeline: From Spark to Treaty', icon: '🕊️', pdfPath: '/Unit Resources/HASS/World_War_I_Timeline_From_Spark_to_Treaty.pdf' },
  ],
};

// ─── Subject → Area → Tool definitions ───────────────────────────────────────
const SUBJECTS = [
  {
    id: 'english', name: 'English', emoji: '📚', description: 'Reading, writing, phonics & language',
    bg: 'bg-blue-200', border: 'border-blue-300', hover: 'hover:bg-blue-300', text: 'text-blue-900',
    areas: [
      { id: 'reading',    name: 'Reading',          emoji: '📖', description: 'Comprehension, passages & reading for fun',   bg: 'bg-sky-100',     border: 'border-sky-300',     hover: 'hover:bg-sky-200',     text: 'text-sky-900',     type: 'tools', tools: [{ id: 'reading-comprehension', name: 'Reading Comprehension',  emoji: '🧠', description: 'Text analysis and understanding',          component: ReadingComprehension, badge: 'UPDATED' },{ id: 'beginner-readers', name: 'Beginner Readers', emoji: '🔤', description: 'Early reading for beginning readers',      component: BeginnerReaders },{ id: 'partner-reading', name: 'Partner Reading Passages', emoji: '🤝', description: 'Printable passages with partner turns',     component: PartnerReading, badge: 'NEW' },{ id: 'reading-for-fun', name: 'Reading for Fun', emoji: '🎉', description: 'Engaging texts for advanced readers',       component: ReadingForFun, badge: 'NEW' }] },
      { id: 'writing',    name: 'Writing',          emoji: '✍️', description: 'Creative writing, grammar & composition',    bg: 'bg-pink-100',    border: 'border-pink-300',    hover: 'hover:bg-pink-200',    text: 'text-pink-900',    type: 'tools', tools: [{ id: 'visual-writing-prompts', name: 'Visual Writing Prompts', emoji: '🖼️', description: 'Image-based storytelling prompts',           component: VisualWritingPrompts },{ id: 'grammar-workshop', name: 'Grammar Workshop', emoji: '✏️', description: 'Interactive grammar lessons & quizzes',     component: GrammarWorkshop, badge: 'NEW' },{ id: 'poetry-corner', name: 'Poetry Corner', emoji: '🎭', description: 'Poetry forms and creative expression',       component: PoetryCorner, badge: 'NEW' }] },
      { id: 'spelling',   name: 'Spelling',         emoji: '🔡', description: 'Spelling programs, morphology & vocabulary', bg: 'bg-emerald-100', border: 'border-emerald-300', hover: 'hover:bg-emerald-200', text: 'text-emerald-900', type: 'tools', tools: [{ id: 'spelling-program', name: 'Spelling & Fluency Studio', emoji: '🌀', description: 'Spelling lists with reading passages',      component: SpellingProgram, badge: 'UPDATED' },{ id: 'morphology', name: 'Morphology Master', emoji: '🔤', description: 'Prefixes, suffixes and base words',           component: Morphology, badge: 'NEW' },{ id: 'vocabulary-builder', name: 'Vocabulary Builder', emoji: '📖', description: 'Definitions, synonyms and word lists',     component: VocabularyCorner, badge: 'NEW' }] },
      { id: 'phonics',    name: 'Phonics',          emoji: '🔤', description: 'Sounds, blending & early literacy',          bg: 'bg-cyan-100',    border: 'border-cyan-300',    hover: 'hover:bg-cyan-200',    text: 'text-cyan-900',    type: 'tools', tools: [{ id: 'literacy-warmup', name: 'Literacy Warmup', emoji: '🔥', description: 'Interactive phonics activities', hasYearLevels: true, yearLevels: [{ id: 'prep', name: 'Prep / Foundation', emoji: '🌱', component: PrepLiteracyWarmup },{ id: 'grade5', name: 'Grade 5', emoji: '🚀', component: LiteracyWarmup }] }] },
      { id: 'speaking',   name: 'Speaking & Drama', emoji: '🎤', description: 'Readers theatre & oral language',            bg: 'bg-fuchsia-100', border: 'border-fuchsia-300', hover: 'hover:bg-fuchsia-200', text: 'text-fuchsia-900', type: 'tools', tools: [{ id: 'readers-theatre', name: 'Readers Theatre', emoji: '🎭', description: 'Drama scripts with character roles',         component: ReadersTheatre, badge: 'NEW' }] },
      { id: 'english-resources',  name: 'Bundles',     emoji: '📁', description: 'Downloadable PDFs & worksheets',          bg: 'bg-rose-100',    border: 'border-rose-300',    hover: 'hover:bg-rose-200',    text: 'text-rose-900',    type: 'resources',   subjectId: 'english' },
      { id: 'english-curriculum', name: 'Curriculum Domains', emoji: '🎓', description: 'Framework topics & structured content',     bg: 'bg-indigo-100',  border: 'border-indigo-300',  hover: 'hover:bg-indigo-200',  text: 'text-indigo-900',  type: 'curriculum',  curriculumComponent: EnglishNewSection },
      { id: 'english-displays',   name: 'Displays',           emoji: '🖼️', description: 'Classroom posters & wall displays',         bg: 'bg-violet-100',  border: 'border-violet-300',  hover: 'hover:bg-violet-200',  text: 'text-violet-900',  type: 'displays-grouped', displayCatId: 'english' },
    ],
  },
  {
    id: 'mathematics', name: 'Mathematics', emoji: '🔢', description: 'Numbers, patterns & problem solving',
    bg: 'bg-green-200', border: 'border-green-300', hover: 'hover:bg-green-300', text: 'text-green-900',
    areas: [
      { id: 'number',      name: 'Number & Operations', emoji: '🧮', description: 'Number facts, mentals & times tables',     bg: 'bg-lime-100',    border: 'border-lime-300',    hover: 'hover:bg-lime-200',    text: 'text-lime-900',    type: 'tools', tools: [{ id: 'math-mentals', name: 'Math Mentals', emoji: '🧮', description: 'Daily number facts practice',           component: MathMentals },{ id: 'times-tables', name: 'Times Tables Master', emoji: '✖️', description: 'Explore and quiz all 12 times tables',  component: TimesTablesMaster, badge: 'NEW' },{ id: 'numbers-board', name: 'Numbers Board', emoji: '💯', description: 'Interactive hundreds board for patterns', component: NumbersBoard },{ id: 'daily-math-challenges', name: 'Daily Math Challenges', emoji: '🎯', description: 'Rich daily challenges for classroom display', component: DailyMathChallenges, badge: 'NEW' },{ id: 'math-warmup', name: 'Math Warmup', emoji: '🔥', description: 'Daily warm-up number activities',          component: MathWarmup }] },
      { id: 'fractions',   name: 'Fractions & Decimals',emoji: '½',  description: 'Fraction models, visualisers & comparisons', bg: 'bg-teal-100',    border: 'border-teal-300',    hover: 'hover:bg-teal-200',    text: 'text-teal-900',    type: 'tools', tools: [{ id: 'fraction-visualiser', name: 'Fraction Visualiser', emoji: '½', description: 'Bar, circle, grid & number line models',  component: FractionVisualiser, badge: 'NEW' }] },
      { id: 'geometry',    name: 'Geometry',            emoji: '📐', description: 'Angles, area, perimeter & shapes',          bg: 'bg-amber-100',   border: 'border-amber-300',   hover: 'hover:bg-amber-200',   text: 'text-amber-900',   type: 'tools', tools: [{ id: 'interactive-angles', name: 'Interactive Angles', emoji: '📐', description: 'Learn, measure, create and play with angles', component: InteractiveAngles, badge: 'NEW' },{ id: 'area-perimeter', name: 'Area & Perimeter', emoji: '📏', description: 'Explore area and perimeter concepts',   component: AreaPerimeterTool }] },
      { id: 'measurement', name: 'Measurement & Time',  emoji: '🕒', description: 'Telling time and measuring',                bg: 'bg-orange-100',  border: 'border-orange-300',  hover: 'hover:bg-orange-200',  text: 'text-orange-900',  type: 'tools', tools: [{ id: 'interactive-clock', name: 'Interactive Clock', emoji: '🕒', description: 'Learn to tell time with draggable hands', component: InteractiveClock }] },
      { id: 'worksheets',  name: 'Worksheet Generator', emoji: '📄', description: 'Create printable maths worksheets',          bg: 'bg-yellow-100',  border: 'border-yellow-300',  hover: 'hover:bg-yellow-200',  text: 'text-yellow-900',  type: 'tools', tools: [{ id: 'worksheet-generator', name: 'Worksheet Generator', emoji: '📄', description: 'Generate printable maths worksheets',   component: WorksheetGenerator }] },
      { id: 'maths-resources',  name: 'Bundles',     emoji: '📁', description: 'Downloadable PDFs & worksheets',          bg: 'bg-rose-100',    border: 'border-rose-300',    hover: 'hover:bg-rose-200',    text: 'text-rose-900',    type: 'resources',       subjectId: 'mathematics' },
      { id: 'maths-curriculum', name: 'Curriculum Domains', emoji: '🎓', description: 'Framework topics & structured content',   bg: 'bg-indigo-100',  border: 'border-indigo-300',  hover: 'hover:bg-indigo-200',  text: 'text-indigo-900',  type: 'curriculum',      curriculumComponent: MathNewSection },
      { id: 'maths-displays',   name: 'Displays',           emoji: '🖼️', description: 'Classroom posters & wall displays',       bg: 'bg-violet-100',  border: 'border-violet-300',  hover: 'hover:bg-violet-200',  text: 'text-violet-900',  type: 'displays-grouped', displayCatId: 'maths' },
    ],
  },
  {
    id: 'science', name: 'Science', emoji: '🔬', description: 'Experiments, nature & discovery',
    bg: 'bg-purple-200', border: 'border-purple-300', hover: 'hover:bg-purple-300', text: 'text-purple-900',
    areas: [
      { id: 'space',       name: 'Space & Earth',   emoji: '🪐', description: 'Planets, solar system & earth science',  bg: 'bg-indigo-100', border: 'border-indigo-300', hover: 'hover:bg-indigo-200', text: 'text-indigo-900', type: 'tools', tools: [{ id: 'solar-system', name: 'Solar System Explorer', emoji: '🪐', description: 'Explore planets and space interactively', component: SolarSystemExplorer, badge: 'NEW' }] },
      { id: 'life-science', name: 'Life Science',   emoji: '🦁', description: 'Food chains, ecosystems & living things', bg: 'bg-green-100',  border: 'border-green-300',  hover: 'hover:bg-green-200',  text: 'text-green-900',  type: 'tools', tools: [{ id: 'food-chain', name: 'Food Chain Builder', emoji: '🦁', description: 'Build food chains across 4 ecosystems',    component: FoodChainBuilder, badge: 'NEW' }] },
      { id: 'science-resources',  name: 'Bundles',     emoji: '📁', description: 'Downloadable PDFs & worksheets',         bg: 'bg-rose-100',   border: 'border-rose-300',   hover: 'hover:bg-rose-200',   text: 'text-rose-900',   type: 'resources',        subjectId: 'science' },
      { id: 'science-curriculum', name: 'Curriculum Domains', emoji: '🎓', description: 'Framework topics & structured content',  bg: 'bg-sky-100',    border: 'border-sky-300',    hover: 'hover:bg-sky-200',    text: 'text-sky-900',    type: 'curriculum',       curriculumComponent: ScienceNewSection },
      { id: 'science-displays',   name: 'Displays',           emoji: '🖼️', description: 'Classroom posters & wall displays',      bg: 'bg-violet-100', border: 'border-violet-300', hover: 'hover:bg-violet-200', text: 'text-violet-900', type: 'displays-grouped', displayCatId: 'science' },
    ],
  },
  {
    id: 'behaviour', name: 'Behaviour & Wellbeing', emoji: '🌈', description: 'Zones of regulation & wellbeing resources',
    bg: 'bg-rose-200', border: 'border-rose-300', hover: 'hover:bg-rose-300', text: 'text-rose-900',
    areas: [
      { id: 'behaviour-resources', name: 'Bundles',  emoji: '📁', description: 'Zones of Regulation & wellbeing PDFs',       bg: 'bg-rose-100',   border: 'border-rose-300',   hover: 'hover:bg-rose-200',   text: 'text-rose-900',   type: 'resources',        subjectId: 'behaviour' },
      { id: 'behaviour-displays',  name: 'Displays',        emoji: '🖼️', description: 'Behaviour cues & classroom display posters', bg: 'bg-violet-100', border: 'border-violet-300', hover: 'hover:bg-violet-200', text: 'text-violet-900', type: 'displays-grouped', displayCatId: 'behaviour' },
    ],
  },
  {
    id: 'hass', name: 'HASS', emoji: '🌍', description: 'History, geography & social sciences',
    bg: 'bg-amber-200', border: 'border-amber-300', hover: 'hover:bg-amber-300', text: 'text-amber-900',
    areas: [
      { id: 'hass-resources',  name: 'Bundles',     emoji: '📁', description: 'Downloadable PDFs & PowerPoints',        bg: 'bg-rose-100',   border: 'border-rose-300',   hover: 'hover:bg-rose-200',   text: 'text-rose-900',   type: 'resources',        subjectId: 'hass' },
      { id: 'hass-curriculum', name: 'Curriculum Domains', emoji: '🎓', description: 'Framework topics & structured content',  bg: 'bg-indigo-100', border: 'border-indigo-300', hover: 'hover:bg-indigo-200', text: 'text-indigo-900', type: 'curriculum',       curriculumComponent: HassNewSection },
      { id: 'hass-displays',   name: 'Displays',           emoji: '🖼️', description: 'Classroom posters & wall displays',      bg: 'bg-violet-100', border: 'border-violet-300', hover: 'hover:bg-violet-200', text: 'text-violet-900', type: 'displays-grouped', displayCatId: 'hass' },
    ],
  },
];

// ─── Small reusable UI pieces ─────────────────────────────────────────────────
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
  </div>
);

const ComingSoon = () => (
  <div className="bg-amber-50 rounded-2xl p-12 text-center border-2 border-dashed border-amber-200">
    <div className="text-5xl mb-4">🚧</div>
    <h3 className="text-xl font-black text-amber-800 mb-2">Coming Soon</h3>
    <p className="text-amber-600 text-sm">We're working hard on this. Check back soon!</p>
  </div>
);

// Pastel tile — core design element
const PastelTile = ({ emoji, name, description, bg, border, hover, text, badge, onClick, disabled }) => (
  <button onClick={disabled ? undefined : onClick} disabled={disabled}
    className={`group rounded-2xl border-2 p-5 text-left transition-all duration-200 w-full ${disabled ? 'bg-gray-100 border-gray-200 opacity-50 cursor-default' : `${bg} ${border} ${hover} hover:-translate-y-1 hover:shadow-xl cursor-pointer shadow-md`}`}>
    <div className="flex items-center gap-3 mb-2">
      <span className="text-4xl leading-none group-hover:scale-110 transition-transform duration-200">{emoji}</span>
      {badge && <span className={`text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-wide ${badge === 'NEW' ? 'bg-emerald-200 text-emerald-800' : badge === 'UPDATED' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>{badge}</span>}
    </div>
    <h3 className={`text-xl font-black leading-tight ${disabled ? 'text-gray-400' : text}`}>{name}</h3>
    {description && <p className="text-gray-500 text-xs mt-1 leading-snug">{description}</p>}
    {!disabled && <div className="mt-3 text-xs font-bold text-gray-400 group-hover:text-gray-600 flex items-center gap-1">Open <span className="group-hover:translate-x-1 transition-transform">→</span></div>}
  </button>
);

// Resource card with download button
const ResourceCard = ({ resource, onPreview }) => {
  const isPpt = resource.pdfPath.endsWith('.pptx') || resource.pdfPath.endsWith('.ppt');
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 hover:border-rose-200 hover:shadow-lg transition-all flex flex-col">
      <button onClick={() => onPreview(resource)} className="flex items-start gap-3 p-4 text-left flex-1">
        <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl ${isPpt ? 'bg-orange-100' : 'bg-red-50'}`}>{resource.icon || (isPpt ? '📊' : '📄')}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-gray-800 text-sm leading-tight mb-1">{resource.title}</h3>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isPpt ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>{isPpt ? 'PowerPoint' : 'PDF'} · Preview →</span>
        </div>
      </button>
      <div className="px-4 pb-4">
        <a href={resource.pdfPath} download onClick={e => e.stopPropagation()}
          className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs py-2 rounded-xl border border-emerald-200 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Download
        </a>
      </div>
    </div>
  );
};

// PDF viewer
const ResourceViewer = ({ resource, onBack }) => {
  const isPdf = resource.pdfPath.toLowerCase().endsWith('.pdf');
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow border border-gray-200 p-4 flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-lg font-black text-gray-800">{resource.title}</h2>
        <div className="flex gap-2">
          <a href={resource.pdfPath} download className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 flex items-center gap-2 text-sm font-black shadow">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Download
          </a>
          <button onClick={onBack} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 text-sm font-bold">← Back</button>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200" style={{ height: '76vh' }}>
        {isPdf ? <iframe src={resource.pdfPath} className="w-full h-full border-0" title={resource.title} /> : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-black text-gray-800 mb-2">PowerPoint — Preview Not Available</h3>
            <p className="text-gray-500 text-sm mb-6">Click Download to open on your device.</p>
            <a href={resource.pdfPath} download className="bg-purple-500 text-white px-6 py-3 rounded-xl hover:bg-purple-600 font-black inline-flex items-center gap-2 shadow">Download File</a>
          </div>
        )}
      </div>
    </div>
  );
};

// Unit resource list
const UnitResourcesList = ({ subjectId, onPreview }) => {
  const resources = resourcesBySubject[subjectId] || [];
  const [filter, setFilter] = useState('');
  const filtered = resources.filter(r => r.title.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className="space-y-5">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
        <input type="text" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search resources…" className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-sm" />
      </div>
      {filtered.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-10 text-center border-2 border-dashed border-gray-200"><p className="text-gray-500 font-bold">{filter ? `No results for "${filter}"` : 'No resources yet'}</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{filtered.map(r => <ResourceCard key={r.id} resource={r} onPreview={onPreview} />)}</div>
      )}
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CurriculumPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState([]);

  // Navigation state
  const [subject,       setSubject]       = useState(null);
  const [area,          setArea]          = useState(null);
  const [tool,          setTool]          = useState(null);
  const [yearLevel,     setYearLevel]     = useState(null);
  const [resource,      setResource]      = useState(null);
  // Displays state
  const [displayCat,    setDisplayCat]    = useState(null); // which ALL_DISPLAY_CATEGORIES entry
  const [displaySection,setDisplaySection]= useState(null); // which section within that cat
  const [displayImage,  setDisplayImage]  = useState(null); // fullscreen image

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (u) { setLoading(false); setSearchIndex(buildSearchIndex(SUBJECTS, resourcesBySubject)); }
      else router.push('/login');
    });
    return () => unsub();
  }, [router]);

  const handleLogout = async () => { await signOut(auth); router.push('/login'); };

  // Reset helpers
  const goHome        = () => { setSubject(null); setArea(null); setTool(null); setYearLevel(null); setResource(null); setDisplayCat(null); setDisplaySection(null); setDisplayImage(null); setSearchQuery(''); };
  const goSubject     = () => { setArea(null); setTool(null); setYearLevel(null); setResource(null); setDisplayCat(null); setDisplaySection(null); setDisplayImage(null); };
  const goArea        = () => { setTool(null); setYearLevel(null); setResource(null); setDisplayCat(null); setDisplaySection(null); setDisplayImage(null); };
  const goTool        = () => { setYearLevel(null); };
  const goDisplayCat  = () => { setDisplaySection(null); setDisplayImage(null); };
  const goDisplaySec  = () => { setDisplayImage(null); };

  const noop = () => {};

  // ── Print helper ────────────────────────────────────────────────────────────
  const handlePrint = (img) => {
    const url = buildImageUrl(img.folder, img.file);
    const w = window.open('', '_blank', 'width=900,height=1200');
    if (!w) return;
    w.document.write(`<html><head><title>${img.name}</title><style>body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh}img{max-width:100%;max-height:100%}</style></head><body><img src="${url}" /><script>window.onload=function(){window.focus();window.print()}<\/script></body></html>`);
    w.document.close();
  };

  // ── Search ──────────────────────────────────────────────────────────────────
  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return searchIndex.filter(item => item.label.toLowerCase().includes(q) || item.sublabel.toLowerCase().includes(q)).slice(0, 30);
  }, [searchQuery, searchIndex]);

  const handleSearchNavigate = (item) => {
    setSearchQuery('');
    if (item.kind === 'tool') { setSubject(item.subject); setArea(item.area); setTool(item.tool); }
    if (item.kind === 'resource') { setSubject(item.subject); setArea(item.area); setResource(item.resource); }
    if (item.kind === 'display') {
      // Navigate to the All Displays → category → section → open image
      setSubject(null); setArea(null);
      setDisplayCat(item.displayCat);
      setDisplaySection(item.displaySection);
      setDisplayImage(item.displayImage);
    }
  };

  // ── Breadcrumb ──────────────────────────────────────────────────────────────
  const renderBreadcrumb = () => {
    const crumbs = [{ label: '📖 Resource Hub', onClick: goHome }];
    if (subject)        crumbs.push({ label: `${subject.emoji} ${subject.name}`,         onClick: goSubject });
    if (area)           crumbs.push({ label: `${area.emoji} ${area.name}`,               onClick: goArea });
    if (displayCat && !subject) crumbs.push({ label: `🖼️ All Displays`,                  onClick: () => { setDisplayCat(null); setDisplaySection(null); setDisplayImage(null); } });
    if (displayCat)     crumbs.push({ label: `${displayCat.emoji} ${displayCat.name}`,  onClick: goDisplayCat });
    if (displaySection) crumbs.push({ label: `${displaySection.emoji} ${displaySection.name}`, onClick: goDisplaySec });
    if (displayImage)   crumbs.push({ label: displayImage.name, onClick: null });
    if (tool)           crumbs.push({ label: `${tool.emoji} ${tool.name}`,               onClick: yearLevel ? goTool : null });
    if (yearLevel)      crumbs.push({ label: `${yearLevel.emoji} ${yearLevel.name}`,     onClick: null });
    if (resource)       crumbs.push({ label: resource.title,                             onClick: null });

    return (
      <nav className="flex items-center gap-2 text-sm flex-wrap bg-white/80 backdrop-blur rounded-xl px-4 py-2.5 border border-gray-100 shadow-sm">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="text-gray-300">/</span>}
            {c.onClick ? (
              <button onClick={c.onClick} className={`font-bold transition-colors ${i === crumbs.length - 1 ? 'text-gray-700' : 'text-purple-600 hover:text-purple-800'}`}>{c.label}</button>
            ) : (
              <span className="font-bold text-gray-700 truncate max-w-[200px]">{c.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  };

  // ── Area header with back button ─────────────────────────────────────────────
  const AreaHeader = ({ bg, border, emoji, name, description, text, onBack }) => (
    <div className={`rounded-3xl border-2 p-5 flex items-center gap-4 ${bg} ${border}`}>
      <span className="text-5xl">{emoji}</span>
      <div className="flex-1"><h2 className={`text-2xl font-black ${text}`}>{name}</h2>{description && <p className="text-gray-500 text-sm">{description}</p>}</div>
      <button onClick={onBack} className="bg-white/70 hover:bg-white text-gray-600 px-4 py-2 rounded-xl text-sm font-bold border border-white/80 transition-colors">← Back</button>
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-purple-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" /></div>;

  // ── Route to correct level ──────────────────────────────────────────────────
  const renderContent = () => {

    // Tool component (deepest level for tools)
    if (tool && (yearLevel || !tool.hasYearLevels)) {
      const Comp = yearLevel ? yearLevel.component : tool.component;
      return (
        <div className="space-y-4">
          {renderBreadcrumb()}
          <Suspense fallback={<LoadingSpinner />}>{Comp ? <Comp showToast={noop} students={[]} saveData={noop} loadedData={{}} /> : <ComingSoon />}</Suspense>
        </div>
      );
    }

    // Year level picker
    if (tool && tool.hasYearLevels && !yearLevel) {
      return (
        <div className="space-y-6">
          {renderBreadcrumb()}
          <AreaHeader bg={area.bg} border={area.border} emoji={tool.emoji} name={tool.name} description="Choose your year level" text={area.text} onBack={goArea} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-lg">
            {tool.yearLevels.map(yl => <PastelTile key={yl.id} emoji={yl.emoji} name={yl.name} bg="bg-white" border="border-gray-200" hover="hover:border-purple-300" text="text-gray-800" onClick={() => setYearLevel(yl)} />)}
          </div>
        </div>
      );
    }

    // PDF viewer
    if (resource) {
      return <div className="space-y-4">{renderBreadcrumb()}<ResourceViewer resource={resource} onBack={() => setResource(null)} /></div>;
    }

    // ── Display image fullscreen modal ─────────────────────────────────────────
    if (displayImage) {
      const url = buildImageUrl(displayImage.folder, displayImage.file);
      return (
        <div className="space-y-4">
          {renderBreadcrumb()}
          <div className="bg-white rounded-2xl shadow border border-gray-200 p-4 flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-lg font-black text-gray-800">{displayImage.name}</h2>
            <div className="flex gap-2">
              <button onClick={() => handlePrint(displayImage)} className="bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 flex items-center gap-2 text-sm font-black shadow">🖨️ Print</button>
              <a href={url} download className="bg-emerald-500 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 flex items-center gap-2 text-sm font-black shadow">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>Download
              </a>
              <button onClick={goDisplaySec} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 text-sm font-bold">← Back</button>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 flex items-center justify-center p-4" style={{ minHeight: '70vh' }}>
            <img src={url} alt={displayImage.name} className="max-w-full max-h-[68vh] object-contain rounded-xl" />
          </div>
        </div>
      );
    }

    // ── Display section image grid ─────────────────────────────────────────────
    if (displaySection) {
      const folder = displaySection.folder || displayCat?.folder;
      const sorted = [...displaySection.images].sort((a, b) => a.name.localeCompare(b.name));
      return (
        <div className="space-y-6">
          {renderBreadcrumb()}
          <AreaHeader bg={displaySection.bg} border={displaySection.border} emoji={displaySection.emoji} name={displaySection.name} description={`${sorted.length} display${sorted.length !== 1 ? 's' : ''}`} text={displaySection.text} onBack={goDisplayCat} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {sorted.map(img => {
              const url = buildImageUrl(folder, img.file);
              return (
                <div key={img.name} className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-purple-300 hover:shadow-lg transition-all overflow-hidden cursor-pointer" onClick={() => setDisplayImage({ ...img, folder })}>
                  <div className="aspect-[3/4] overflow-hidden bg-gray-50">
                    <img src={url} alt={img.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" onError={e => { e.target.style.display = 'none'; }} />
                  </div>
                  <div className="p-2 border-t border-gray-100">
                    <p className="text-xs font-black text-gray-700 text-center leading-tight line-clamp-2">{img.name}</p>
                    <div className="mt-2 flex gap-1">
                      <button onClick={e => { e.stopPropagation(); handlePrint({ ...img, folder }); }} className="flex-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold py-1 rounded-lg transition-colors">🖨️</button>
                      <a href={url} download onClick={e => e.stopPropagation()} className="flex-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-1 rounded-lg text-center transition-colors">⬇️</a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // ── Display category section grid ─────────────────────────────────────────
    if (displayCat) {
      return (
        <div className="space-y-6">
          {renderBreadcrumb()}
          <AreaHeader bg={displayCat.bg} border={displayCat.border} emoji={displayCat.emoji} name={displayCat.name} description={`${displayCat.sections.length} groups`} text={displayCat.text} onBack={() => { setDisplayCat(null); setDisplaySection(null); }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {displayCat.sections.map(sec => (
              <PastelTile key={sec.id} emoji={sec.emoji} name={sec.name} description={`${sec.images.length} display${sec.images.length !== 1 ? 's' : ''}`}
                bg={sec.bg} border={sec.border} hover={sec.hover} text={sec.text}
                onClick={() => setDisplaySection({ ...sec, folder: displayCat.folder })} />
            ))}
          </div>
        </div>
      );
    }

    // ── Area content ──────────────────────────────────────────────────────────
    if (area) {
      const { type } = area;

      // Tools grid
      if (type === 'tools') return (
        <div className="space-y-6">
          {renderBreadcrumb()}
          <AreaHeader bg={area.bg} border={area.border} emoji={area.emoji} name={area.name} description={area.description} text={area.text} onBack={goSubject} />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {(area.tools || []).map(t => <PastelTile key={t.id} emoji={t.emoji} name={t.name} description={t.description} badge={t.badge} bg="bg-white" border="border-gray-200" hover="hover:border-purple-300" text="text-gray-800" onClick={() => setTool(t)} />)}
          </div>
        </div>
      );

      // Unit resources
      if (type === 'resources') return (
        <div className="space-y-6">
          {renderBreadcrumb()}
          <AreaHeader bg={area.bg} border={area.border} emoji={area.emoji} name={area.name} description={area.description} text={area.text} onBack={goSubject} />
          <UnitResourcesList subjectId={area.subjectId} onPreview={setResource} />
        </div>
      );

      // Curriculum domains
      if (type === 'curriculum') {
        const CurriculumComp = area.curriculumComponent;
        return (
          <div className="space-y-4">
            {renderBreadcrumb()}
            <Suspense fallback={<LoadingSpinner />}><CurriculumComp onBack={goSubject} students={[]} showToast={noop} onToggleAssign={noop} assignedTopics={[]} /></Suspense>
          </div>
        );
      }

      // Displays — grouped by section
      if (type === 'displays-grouped') {
        const cat = ALL_DISPLAY_CATEGORIES.find(c => c.id === area.displayCatId);
        if (!cat) return <ComingSoon />;
        return (
          <div className="space-y-6">
            {renderBreadcrumb()}
            <AreaHeader bg={area.bg} border={area.border} emoji={area.emoji} name={area.name} description={`${cat.sections.length} display groups`} text={area.text} onBack={goSubject} />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {cat.sections.map(sec => (
                <PastelTile key={sec.id} emoji={sec.emoji} name={sec.name} description={`${sec.images.length} display${sec.images.length !== 1 ? 's' : ''}`}
                  bg={sec.bg} border={sec.border} hover={sec.hover} text={sec.text}
                  onClick={() => { setDisplayCat(cat); setDisplaySection({ ...sec, folder: cat.folder }); }} />
              ))}
            </div>
          </div>
        );
      }

      return <ComingSoon />;
    }

    // ── Subject area grid ─────────────────────────────────────────────────────
    if (subject) return (
      <div className="space-y-6">
        {renderBreadcrumb()}
        <div className={`rounded-3xl border-2 p-7 flex items-center gap-5 ${subject.bg} ${subject.border}`}>
          <span className="text-6xl">{subject.emoji}</span>
          <div className="flex-1"><h2 className={`text-3xl font-black ${subject.text}`}>{subject.name}</h2><p className="text-gray-500 text-sm mt-1">{subject.description}</p></div>
          <button onClick={goHome} className="bg-white/70 hover:bg-white text-gray-600 px-4 py-2 rounded-xl text-sm font-bold border border-white/80 transition-colors">← Back</button>
        </div>
        <h3 className="text-lg font-black text-gray-600">What are you looking for?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {subject.areas.map(a => <PastelTile key={a.id} emoji={a.emoji} name={a.name} description={a.description} bg={a.bg} border={a.border} hover={a.hover} text={a.text} onClick={() => setArea(a)} />)}
        </div>
      </div>
    );

    // ── Level 0: Subject grid + search ────────────────────────────────────────
    return (
      <div className="space-y-8">
        <div className="text-center pt-2">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-800 tracking-tight mb-3">📖 Resource Hub</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">Find lessons, worksheets, interactive tools and classroom displays — organised by subject.</p>
        </div>

        {/* ── Search bar ── */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
            <input
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tools, resources, displays…"
              className="w-full pl-12 pr-10 py-4 rounded-2xl border-2 border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 shadow-sm transition-all font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Search results ── */}
        {searchQuery.trim() ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 font-semibold">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"</p>
            {searchResults.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="text-4xl mb-2">🔍</div>
                <p className="text-gray-500 font-bold">Nothing found — try a different term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {searchResults.map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl border-2 border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all flex flex-col">
                    <button onClick={() => handleSearchNavigate(item)} className="flex items-start gap-3 p-4 text-left flex-1">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-xl">{item.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-gray-800 text-sm leading-tight">{item.label}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{item.sublabel}</p>
                        <span className={`mt-1 inline-block text-xs font-bold px-2 py-0.5 rounded-full ${item.kind === 'tool' ? 'bg-blue-100 text-blue-700' : item.kind === 'resource' ? 'bg-rose-100 text-rose-700' : 'bg-violet-100 text-violet-700'}`}>
                          {item.kind === 'tool' ? 'Interactive Tool' : item.kind === 'resource' ? 'Unit Resource' : 'Display'}
                        </span>
                      </div>
                    </button>
                    {/* Download button for resources and displays */}
                    {(item.kind === 'resource' || item.kind === 'display') && (
                      <div className="px-4 pb-4">
                        <a href={item.kind === 'resource' ? item.resource.pdfPath : buildImageUrl(item.displayImage.folder, item.displayImage.file)}
                          download onClick={e => e.stopPropagation()}
                          className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs py-2 rounded-xl border border-emerald-200 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          Download
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ── Subject tiles ── */}
            <div>
              <h2 className="text-xl font-black text-gray-700 mb-5 text-center">Choose a Subject</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {SUBJECTS.map(s => (
                  <button key={s.id} onClick={() => setSubject(s)}
                    className={`group rounded-3xl border-2 p-8 text-left transition-all duration-200 hover:-translate-y-2 hover:shadow-2xl shadow-md cursor-pointer ${s.bg} ${s.border} ${s.hover}`}>
                    <span className="block text-6xl mb-5 group-hover:scale-110 transition-transform duration-200">{s.emoji}</span>
                    <h2 className={`text-3xl font-black leading-tight ${s.text}`}>{s.name}</h2>
                    <p className="text-gray-500 text-sm mt-2 leading-snug">{s.description}</p>
                    <div className={`mt-5 text-sm font-black ${s.text} opacity-60 group-hover:opacity-100 flex items-center gap-1 transition-all`}>
                      Explore <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Recently Added showcase ── */}
            <RecentlyAddedShowcase />

            {/* ── Brain Breaks tile ── */}
            <div className="mt-2">
              <button onClick={() => { setDisplayCat(ALL_DISPLAY_CATEGORIES.find(c => c.id === 'games')); }}
                className="group w-full rounded-3xl border-2 border-fuchsia-300 bg-fuchsia-200 hover:bg-fuchsia-300 p-7 flex items-center gap-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-xl shadow-md cursor-pointer">
                <span className="text-6xl group-hover:scale-110 transition-transform duration-200">🎲</span>
                <div>
                  <h3 className="text-3xl font-black text-fuchsia-900">Brain Breaks</h3>
                  <p className="text-gray-500 text-sm mt-1">Games and activities to display in class</p>
                </div>
                <div className="ml-auto text-fuchsia-700 font-black text-sm group-hover:translate-x-1 transition-transform">Browse →</div>
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  // All Displays — category selection (overrides area render)
  const isAllDisplays = area?.id === '_all-displays';
  const renderAllDisplays = () => (
    <div className="space-y-6">
      {renderBreadcrumb()}
      <div className="rounded-3xl border-2 border-violet-300 bg-violet-200 p-7 flex items-center gap-5">
        <span className="text-6xl">🖼️</span>
        <div className="flex-1"><h2 className="text-3xl font-black text-violet-900">Classroom Displays</h2><p className="text-gray-500 text-sm mt-1">Browse all display categories</p></div>
        <button onClick={goHome} className="bg-white/70 hover:bg-white text-gray-600 px-4 py-2 rounded-xl text-sm font-bold border border-white/80 transition-colors">← Back</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {ALL_DISPLAY_CATEGORIES.map(cat => (
          <PastelTile key={cat.id} emoji={cat.emoji} name={cat.name}
            description={`${cat.sections.reduce((t, s) => t + s.images.length, 0)} displays across ${cat.sections.length} group${cat.sections.length !== 1 ? 's' : ''}`}
            bg={cat.bg} border={cat.border} hover={cat.hover} text={cat.text}
            onClick={() => setDisplayCat(cat)} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg,#fdf6ff 0%,#f0f9ff 50%,#fff7ed 100%)' }}>
      <Head>
        <title>Resource Hub | Educational Elements</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-purple-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/main-menu')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Image src="/Logo/LOGO_NoBG.png" alt="Logo" width={36} height={36} className="h-9 w-9" />
                <span className="text-base font-black text-purple-700 hidden sm:block">Educational Elements</span>
              </button>
              <span className="text-gray-300 hidden sm:block">|</span>
              <button onClick={goHome} className="text-base font-black text-gray-600 hidden sm:block hover:text-purple-600 transition-colors">Resource Hub</button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/main-menu')} className="text-gray-500 hover:text-purple-600 font-semibold text-sm transition-colors px-3 py-2 rounded-xl hover:bg-purple-50">← Main Menu</button>
              <button onClick={handleLogout} className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 text-sm font-black shadow">Sign Out</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAllDisplays ? renderAllDisplays() : renderContent()}
      </main>

      <footer className="border-t border-purple-100 mt-16 py-8 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Educational Elements. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
