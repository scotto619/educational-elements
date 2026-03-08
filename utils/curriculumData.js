// utils/curriculumData.js

// ------------------------------------------------------------------
// ENGLISH
// ------------------------------------------------------------------
export const englishDomains = [{
  id: 'how_english_works',
  name: '1. Language (How English Works)',
  icon: '📚',
  color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  topics: [{
    id: 'grammar',
    name: 'Grammar',
    icon: '🔤',
    domain: 'Language (How English Works)',
    categories: [{
      id: 'parts_of_speech',
      name: 'Parts of Speech',
      subtopics: [{
        id: 'nouns',
        name: 'Nouns',
        resources: {
          display: [{
            type: 'image',
            title: 'Noun Kingdom Display',
            src: '/Curriculum/New Literacy/Grammar/Nouns/Displays/Nouns.png'
          }],
          learn: [{
            type: 'pdf',
            title: 'Noun Kingdom Guide',
            src: '/Curriculum/New Literacy/Grammar/Nouns/Learning/Noun_Kingdom.pdf',
            pptxSrc: '/Curriculum/New Literacy/Grammar/Nouns/Learning/Noun_Kingdom.pptx',
            thumbnail: '/Curriculum/New Literacy/Grammar/Nouns/Learning/Cover.png'
          }, {
            type: "pdf",
            title: "The Noun Hunt",
            src: "/Unit Resources/Literacy/The_Noun_Hunt.pdf",
            extra: true
          }],
          practice: [{
            type: 'game',
            componentId: 'noun_sorting',
            title: 'Noun Master Challenge',
            thumbnail: '/Curriculum/New Literacy/Grammar/Nouns/Displays/Nouns.png'
          }, {
            type: 'game',
            componentId: 'noun_detective',
            title: 'Noun Detective Case',
            thumbnail: '/Curriculum/New Literacy/Grammar/Nouns/Displays/Nouns.png'
          }, {
            type: 'game',
            componentId: 'noun_pop',
            title: 'Balloon Pop Nouns',
            thumbnail: '/Curriculum/New Literacy/Grammar/Nouns/Displays/Nouns.png'
          }]
        }
      }, {
        id: 'verbs',
        name: 'Verbs',
        resources: {
          display: [{
            type: 'image',
            title: 'Verbs Display',
            src: '/Curriculum/New Literacy/Grammar/Verbs/Display/Verbs.png'
          }],
          learn: [{
            type: 'pdf',
            title: 'Verbs Guide',
            src: '/Curriculum/New Literacy/Grammar/Verbs/Learning/Verbs.pdf',
            pptxSrc: '/Curriculum/New Literacy/Grammar/Verbs/Learning/Verbs.pptx',
            thumbnail: '/Curriculum/New Literacy/Grammar/Verbs/Learning/cover.png'
          }],
          practice: [{
            type: 'game',
            componentId: 'verb_race',
            title: 'Verb Action Race',
            thumbnail: '/Curriculum/New Literacy/Grammar/Verbs/Display/Verbs.png'
          }, {
            type: 'game',
            componentId: 'verb_sorting',
            title: 'Verb Master Challenge',
            thumbnail: '/Curriculum/New Literacy/Grammar/Verbs/Display/Verbs.png'
          }, {
            type: 'game',
            componentId: 'verb_time_machine',
            title: 'Verb Time Machine',
            thumbnail: '/Curriculum/New Literacy/Grammar/Verbs/Display/Verbs.png'
          }]
        }
      }, {
        id: 'adjectives',
        name: 'Adjectives',
        resources: {
          display: [{
            type: 'image',
            title: 'Adjectives Display',
            src: '/Curriculum/New Literacy/Grammar/Adjectives/Display/Adjectives.png'
          }],
          learn: [{
            type: 'pdf',
            title: 'Adjectives Guide',
            src: '/Curriculum/New Literacy/Grammar/Adjectives/Learning/Adjectives.pdf',
            pptxSrc: '/Curriculum/New Literacy/Grammar/Adjectives/Learning/Adjectives.pptx',
            thumbnail: '/Curriculum/New Literacy/Grammar/Adjectives/Learning/cover.png'
          }],
          practice: [{
            type: 'game',
            componentId: 'adjective_detective',
            title: 'Adjective Detective Case',
            thumbnail: '/Curriculum/New Literacy/Grammar/Adjectives/Display/Adjectives.png'
          }, {
            type: 'game',
            componentId: 'adjective_sorting',
            title: 'Adjective Master Challenge',
            thumbnail: '/Curriculum/New Literacy/Grammar/Adjectives/Display/Adjectives.png'
          }, {
            type: 'game',
            componentId: 'adjective_opposites',
            title: 'Adjective Opposites Match',
            thumbnail: '/Curriculum/New Literacy/Grammar/Adjectives/Display/Adjectives.png'
          }]
        }
      }, {
        id: 'adverbs',
        name: 'Adverbs',
        resources: {
          display: [{
            type: 'image',
            title: 'Adverbs Display',
            src: '/Curriculum/New Literacy/Grammar/Adverbs/Display/Adverbs.png'
          }],
          learn: [{
            type: 'pdf',
            title: 'Adverbs Guide',
            src: '/Curriculum/New Literacy/Grammar/Adverbs/Learning/Adverbs.pdf',
            pptxSrc: '/Curriculum/New Literacy/Grammar/Adverbs/Learning/Adverbs.pptx',
            thumbnail: '/Curriculum/New Literacy/Grammar/Adverbs/Learning/cover.png'
          }],
          practice: [{
            type: 'game',
            title: 'Adverb Asteroids',
            src: 'AdverbAsteroidsGame',
            thumbnail: '/Curriculum/New Literacy/Grammar/Adverbs/Display/Adverbs.png'
          }, {
            type: 'game',
            title: 'Adverb Sort',
            src: 'AdverbSortingGame',
            thumbnail: '/Curriculum/New Literacy/Grammar/Adverbs/Display/Adverbs.png'
          }, {
            type: 'game',
            title: 'Action Builder',
            src: 'AdverbActionBuilder',
            thumbnail: '/Curriculum/New Literacy/Grammar/Adverbs/Display/Adverbs.png'
          }]
        }
      }, {
        id: 'pronouns',
        name: 'Pronouns',
        resources: {
          display: [{
            type: 'image',
            title: 'Pronouns Display',
            src: '/Curriculum/New Literacy/Grammar/Pronouns/Display/Pronouns.png'
          }],
          learn: [{
            type: 'pdf',
            title: 'Pronouns Guide',
            src: '/Curriculum/New Literacy/Grammar/Pronouns/Learning/Pronouns.pdf',
            pptxSrc: '/Curriculum/New Literacy/Grammar/Pronouns/Learning/Pronouns.pptx',
            thumbnail: '/Curriculum/New Literacy/Grammar/Pronouns/Learning/cover.png'
          }],
          practice: [{
            type: 'game',
            title: 'Pronoun Replacement Race',
            src: 'PronounReplacementRace',
            thumbnail: '/Curriculum/New Literacy/Grammar/Pronouns/Display/Pronouns.png'
          }, {
            type: 'game',
            title: 'Pronoun Type Match',
            src: 'PronounTypeMatch',
            thumbnail: '/Curriculum/New Literacy/Grammar/Pronouns/Display/Pronouns.png'
          }, {
            type: 'game',
            title: 'Pronoun Rescue Mission',
            src: 'PronounRescueMission',
            thumbnail: '/Curriculum/New Literacy/Grammar/Pronouns/Display/Pronouns.png'
          }]
        }
      }, {
        id: 'prepositions',
        name: 'Prepositions',
        resources: {
          display: [{
            type: 'image',
            title: 'Prepositions Display',
            src: '/Curriculum/New Literacy/Grammar/Prepositions/Display/Prepositions.png'
          }],
          learn: [{
            type: 'pdf',
            title: 'Prepositions Guide',
            src: '/Curriculum/New Literacy/Grammar/Prepositions/Learning/Prepositions.pdf',
            pptxSrc: '/Curriculum/New Literacy/Grammar/Prepositions/Learning/Prepositions.pptx',
            thumbnail: '/Curriculum/New Literacy/Grammar/Prepositions/Learning/cover.png'
          }],
          practice: [{
            type: 'game',
            title: 'Preposition Ninja',
            src: 'PrepositionNinja',
            thumbnail: '/Curriculum/New Literacy/Grammar/Prepositions/Display/Prepositions.png'
          }, {
            type: 'game',
            title: 'Preposition Location Match',
            src: 'PrepositionLocationGame',
            thumbnail: '/Curriculum/New Literacy/Grammar/Prepositions/Display/Prepositions.png'
          }, {
            type: 'game',
            title: 'Phrase Builder',
            src: 'PrepositionPhraseBuilder',
            thumbnail: '/Curriculum/New Literacy/Grammar/Prepositions/Display/Prepositions.png'
          }]
        }
      }, {
        id: 'conjunctions',
        name: 'Conjunctions',
        resources: {
          display: [{
            type: 'image',
            title: 'Conjunctions Display',
            src: '/Curriculum/New Literacy/Grammar/Conjunctions/Display/Conjunctions.png'
          }],
          learn: [{
            type: 'pdf',
            title: 'Conjunctions Guide',
            src: '/Curriculum/New Literacy/Grammar/Conjunctions/Learning/Conjunctions.pdf',
            pptxSrc: '/Curriculum/New Literacy/Grammar/Conjunctions/Learning/Conjunctions.pptx',
            thumbnail: '/Curriculum/New Literacy/Grammar/Conjunctions/Learning/cover.png'
          }, {
            type: "pdf",
            title: "FANBOYS The Super Squad of Sentences",
            src: "/Unit Resources/Literacy/FANBOYS_The_Super_Squad_of_Sentences.pdf",
            extra: true
          }],
          practice: [{
            type: 'game',
            title: 'Conjunction Conductor',
            src: 'ConjunctionConductor',
            thumbnail: '/Curriculum/New Literacy/Grammar/Conjunctions/Display/Conjunctions.png'
          }, {
            type: 'game',
            title: 'Bridge Builder',
            src: 'ConjunctionBridgeBuilder',
            thumbnail: '/Curriculum/New Literacy/Grammar/Conjunctions/Display/Conjunctions.png'
          }, {
            type: 'game',
            title: 'Conjunction Sort',
            src: 'ConjunctionSort',
            thumbnail: '/Curriculum/New Literacy/Grammar/Conjunctions/Display/Conjunctions.png'
          }]
        }
      }, {
        id: 'interjections',
        name: 'Interjections',
        resources: {
          display: [{
            type: 'image',
            title: 'Interjections Display',
            src: '/Curriculum/New Literacy/Grammar/Interjections/Displays/Interjections.png'
          }],
          learn: [{
            type: 'pdf',
            title: 'Interjections Guide',
            src: '/Curriculum/New Literacy/Grammar/Interjections/Learning/Interjections.pdf',
            pptxSrc: '/Curriculum/New Literacy/Grammar/Interjections/Learning/Interjections.pptx',
            thumbnail: '/Curriculum/New Literacy/Grammar/Interjections/Learning/cover.png'
          }],
          practice: [{
            type: 'game',
            title: 'Emotion Match',
            src: 'InterjectionEmotionMatch',
            thumbnail: '/Curriculum/New Literacy/Grammar/Interjections/Displays/Interjections.png'
          }, {
            type: 'game',
            title: 'Balloon Pop Interjections',
            src: 'InterjectionPopGame',
            thumbnail: '/Curriculum/New Literacy/Grammar/Interjections/Displays/Interjections.png'
          }, {
            type: 'game',
            title: 'Interjection Comic Strip',
            src: 'InterjectionComicStrip',
            thumbnail: '/Curriculum/New Literacy/Grammar/Interjections/Displays/Interjections.png'
          }]
        }
      }]
    }, {
      id: 'sentence_structure',
      name: 'Sentence Structure',
      subtopics: [{
        id: 'simple_compound_complex',
        name: 'Simple, compound, complex sentences',
        resources: {
          display: [{
            type: 'image',
            title: 'Sentence Types Display',
            src: '/Curriculum/New Literacy/Grammar/Simple Compound Complex Sentences/Display/SentenceTypes.png'
          }],
          learn: [{
            type: 'pdf',
            title: 'Sentence Types Guide',
            src: '/Curriculum/New Literacy/Grammar/Simple Compound Complex Sentences/Learning/SentenceTypes.pdf',
            pptxSrc: '/Curriculum/New Literacy/Grammar/Simple Compound Complex Sentences/Learning/SentenceTypes.pptx',
            thumbnail: '/Curriculum/New Literacy/Grammar/Simple Compound Complex Sentences/Learning/cover.png'
          }],
          practice: []
        }
      }, {
        id: 'clauses',
        name: 'Clauses (main/subordinate)',
        resources: {
          display: [{
            type: 'image',
            title: 'Clauses Display',
            src: '/Curriculum/New Literacy/Grammar/Clauses/Display/Clauses.png'
          }],
          learn: [{
            type: 'pdf',
            title: 'Clauses Guide',
            src: '/Curriculum/New Literacy/Grammar/Clauses/Learning/Clauses.pdf',
            pptxSrc: '/Curriculum/New Literacy/Grammar/Clauses/Learning/Clauses.pptx',
            thumbnail: '/Curriculum/New Literacy/Grammar/Clauses/Learning/cover.png'
          }],
          practice: []
        }
      }, {
        id: 'subjects_predicates',
        name: 'Subjects and Predicates',
        resources: {
          display: [{
            type: 'image',
            title: 'Subjects and Predicates Display',
            src: '/Curriculum/New Literacy/Grammar/Subject and Predicate/Display/SubjectandPredicate.png'
          }],
          learn: [{
            type: 'pdf',
            title: 'Subjects and Predicates Guide',
            src: '/Curriculum/New Literacy/Grammar/Subject and Predicate/Learning/SubjectandPredicate.pdf',
            pptxSrc: '/Curriculum/New Literacy/Grammar/Subject and Predicate/Learning/SubjectandPredicate.pptx',
            thumbnail: '/Curriculum/New Literacy/Grammar/Subject and Predicate/Learning/cover.png'
          }],
          practice: []
        }
      }, {
        id: 'active_passive_voice',
        name: 'Active and Passive Voice',
        resources: {
          display: [{
            type: 'image',
            title: 'Active vs Passive Voice Display',
            src: '/Curriculum/New Literacy/Grammar/Active vs Passive Voice/Display/ActiveVsPassive.png'
          }],
          learn: [{
            type: 'pdf',
            title: 'Active vs Passive Voice Guide',
            src: '/Curriculum/New Literacy/Grammar/Active vs Passive Voice/Learning/ActiveVsPassive.pdf',
            pptxSrc: '/Curriculum/New Literacy/Grammar/Active vs Passive Voice/Learning/ActiveVsPassive.pptx',
            thumbnail: '/Curriculum/New Literacy/Grammar/Active vs Passive Voice/Learning/cover.png'
          }],
          practice: []
        }
      }, {
        id: 'fragments_run_ons',
        name: 'Fragments and Run-Ons',
        resources: {
          display: [{
            type: 'image',
            title: 'Fragments and Run-Ons Display',
            src: '/Curriculum/New Literacy/Grammar/Sentence Fragments and Run-ons/Display/FragmentsandRunons.png'
          }],
          learn: [{
            type: 'pdf',
            title: 'Fragments and Run-Ons Guide',
            src: '/Curriculum/New Literacy/Grammar/Sentence Fragments and Run-ons/Learning/SegmentsandRunons.pdf',
            pptxSrc: '/Curriculum/New Literacy/Grammar/Sentence Fragments and Run-ons/Learning/SegmentsandRunons.pptx',
            thumbnail: '/Curriculum/New Literacy/Grammar/Sentence Fragments and Run-ons/Learning/cover.png'
          }],
          practice: []
        }
      }]
    }, {
      id: 'tense',
      name: 'Tense',
      subtopics: [{
        id: 'past_present_future',
        name: 'Past, present, future',
        resources: {
          display: [{
            type: 'image',
            title: 'Past, Present, Future Display',
            src: '/Curriculum/New Literacy/Grammar/Past Present Future/Display/PastPresentFuture.png'
          }],
          learn: [{
            type: 'pdf',
            title: 'Past, Present, Future Guide',
            src: '/Curriculum/New Literacy/Grammar/Past Present Future/Learning/PastPresentFuture.pdf',
            pptxSrc: '/Curriculum/New Literacy/Grammar/Past Present Future/Learning/PastPresentFuture.pptx',
            thumbnail: '/Curriculum/New Literacy/Grammar/Past Present Future/Learning/cover.png'
          }],
          practice: [{
            type: 'game',
            title: 'Verb Tense Time Machine',
            src: 'VerbTenseTimeMachine',
            thumbnail: '/Curriculum/New Literacy/Grammar/Past Present Future/Display/PastPresentFuture.png'
          }]
        }
      }, {
        id: 'irregular_verbs',
        name: 'Irregular verbs',
        resources: {
          display: [{
            type: 'image',
            title: 'Irregular Verbs Display',
            src: '/Curriculum/New Literacy/Grammar/Irreguluar Verbs/Display/IrregularVerbs.png'
          }],
          learn: [{
            type: 'pdf',
            title: 'Irregular Verbs Guide',
            src: '/Curriculum/New Literacy/Grammar/Irreguluar Verbs/Learning/IrregularVerbs.pdf',
            pptxSrc: '/Curriculum/New Literacy/Grammar/Irreguluar Verbs/Learning/IrregularVerbs.pptx',
            thumbnail: '/Curriculum/New Literacy/Grammar/Irreguluar Verbs/Learning/cover.png'
          }],
          practice: []
        }
      }, {
        id: 'consistent_tense',
        name: 'Consistent tense use',
        resources: {
          display: [{
            type: 'image',
            title: 'Consistent Tense Use Display',
            src: '/Curriculum/New Literacy/Grammar/Consistent Tense Use/Display/ConsistentTenseUse.png'
          }],
          learn: [{
            type: 'pdf',
            title: 'Consistent Tense Use Guide',
            src: '/Curriculum/New Literacy/Grammar/Consistent Tense Use/Learning/ConsistentTenseUse.pdf',
            pptxSrc: '/Curriculum/New Literacy/Grammar/Consistent Tense Use/Learning/ConsistentTenseUse.pptx',
            thumbnail: '/Curriculum/New Literacy/Grammar/Consistent Tense Use/Learning/cover.png'
          }],
          practice: []
        }
      }]
    }]
  }, {
    id: 'punctuation',
    name: 'Punctuation',
    icon: '❕',
    domain: 'Language (How English Works)',
    subtopics: [{
      id: 'capital_letters',
      name: 'Capital letters'
    }, {
      id: 'full_stops',
      name: 'Full stops'
    }, {
      id: 'question_marks',
      name: 'Question marks'
    }, {
      id: 'exclamation_marks',
      name: 'Exclamation marks'
    }, {
      id: 'commas',
      name: 'Commas (lists, clauses, dialogue)'
    }, {
      id: 'apostrophes',
      name: 'Apostrophes (contractions/possession)'
    }, {
      id: 'quotation_marks',
      name: 'Quotation marks'
    }, {
      id: 'colons_semicolons',
      name: 'Colons and semicolons (upper primary)'
    }, {
      id: 'hyphens',
      name: 'Hyphens'
    }]
  }, {
    id: 'spelling',
    name: 'Spelling & Word Study',
    icon: '📝',
    domain: 'Language (How English Works)',
    subtopics: [{
      id: 'phonics_patterns',
      name: 'Phonics patterns',
      resources: {
        display: [{
          type: "image",
          title: "A",
          src: "/Displays/English/Alphabet/A.png",
          extra: true
        }, {
          type: "image",
          title: "Alphabet",
          src: "/Displays/English/Alphabet/Alphabet.png",
          extra: true
        }, {
          type: "image",
          title: "B",
          src: "/Displays/English/Alphabet/B.png",
          extra: true
        }, {
          type: "image",
          title: "C",
          src: "/Displays/English/Alphabet/C.png",
          extra: true
        }, {
          type: "image",
          title: "D",
          src: "/Displays/English/Alphabet/D.png",
          extra: true
        }, {
          type: "image",
          title: "E",
          src: "/Displays/English/Alphabet/E.png",
          extra: true
        }, {
          type: "image",
          title: "A",
          src: "/Displays/English/Alphabet/EyeSpy/A.png",
          extra: true
        }, {
          type: "image",
          title: "B",
          src: "/Displays/English/Alphabet/EyeSpy/B.png",
          extra: true
        }, {
          type: "image",
          title: "C",
          src: "/Displays/English/Alphabet/EyeSpy/C.png",
          extra: true
        }, {
          type: "image",
          title: "D",
          src: "/Displays/English/Alphabet/EyeSpy/D.png",
          extra: true
        }, {
          type: "image",
          title: "E",
          src: "/Displays/English/Alphabet/EyeSpy/E.png",
          extra: true
        }, {
          type: "image",
          title: "F",
          src: "/Displays/English/Alphabet/EyeSpy/F.png",
          extra: true
        }, {
          type: "image",
          title: "G",
          src: "/Displays/English/Alphabet/EyeSpy/G.png",
          extra: true
        }, {
          type: "image",
          title: "F",
          src: "/Displays/English/Alphabet/F.png",
          extra: true
        }, {
          type: "image",
          title: "G",
          src: "/Displays/English/Alphabet/G.png",
          extra: true
        }, {
          type: "image",
          title: "H",
          src: "/Displays/English/Alphabet/H.png",
          extra: true
        }, {
          type: "image",
          title: "I",
          src: "/Displays/English/Alphabet/I.png",
          extra: true
        }, {
          type: "image",
          title: "J",
          src: "/Displays/English/Alphabet/J.png",
          extra: true
        }, {
          type: "image",
          title: "K",
          src: "/Displays/English/Alphabet/K.png",
          extra: true
        }, {
          type: "image",
          title: "L",
          src: "/Displays/English/Alphabet/L.png",
          extra: true
        }, {
          type: "image",
          title: "M",
          src: "/Displays/English/Alphabet/M.png",
          extra: true
        }, {
          type: "image",
          title: "N",
          src: "/Displays/English/Alphabet/N.png",
          extra: true
        }, {
          type: "image",
          title: "O",
          src: "/Displays/English/Alphabet/O.png",
          extra: true
        }, {
          type: "image",
          title: "P",
          src: "/Displays/English/Alphabet/P.png",
          extra: true
        }, {
          type: "image",
          title: "Q",
          src: "/Displays/English/Alphabet/Q.png",
          extra: true
        }, {
          type: "image",
          title: "R",
          src: "/Displays/English/Alphabet/R.png",
          extra: true
        }, {
          type: "image",
          title: "S",
          src: "/Displays/English/Alphabet/S.png",
          extra: true
        }, {
          type: "image",
          title: "T",
          src: "/Displays/English/Alphabet/T.png",
          extra: true
        }, {
          type: "image",
          title: "U",
          src: "/Displays/English/Alphabet/U.png",
          extra: true
        }, {
          type: "image",
          title: "V",
          src: "/Displays/English/Alphabet/V.png",
          extra: true
        }, {
          type: "image",
          title: "W",
          src: "/Displays/English/Alphabet/W.png",
          extra: true
        }, {
          type: "image",
          title: "X",
          src: "/Displays/English/Alphabet/X.png",
          extra: true
        }, {
          type: "image",
          title: "Y",
          src: "/Displays/English/Alphabet/Y.png",
          extra: true
        }, {
          type: "image",
          title: "Z",
          src: "/Displays/English/Alphabet/Z.png",
          extra: true
        }, {
          type: "image",
          title: "BL Story",
          src: "/Displays/English/Phonics/BL Story.png",
          extra: true
        }, {
          type: "image",
          title: "BL",
          src: "/Displays/English/Phonics/BL.png",
          extra: true
        }, {
          type: "image",
          title: "BR Story",
          src: "/Displays/English/Phonics/BR Story.png",
          extra: true
        }, {
          type: "image",
          title: "BR",
          src: "/Displays/English/Phonics/BR.png",
          extra: true
        }, {
          type: "image",
          title: "CH",
          src: "/Displays/English/Phonics/CH.png",
          extra: true
        }, {
          type: "image",
          title: "CL",
          src: "/Displays/English/Phonics/CL.png",
          extra: true
        }, {
          type: "image",
          title: "CR",
          src: "/Displays/English/Phonics/CR.png",
          extra: true
        }, {
          type: "image",
          title: "DR",
          src: "/Displays/English/Phonics/DR.png",
          extra: true
        }, {
          type: "image",
          title: "FL",
          src: "/Displays/English/Phonics/FL.png",
          extra: true
        }, {
          type: "image",
          title: "FR",
          src: "/Displays/English/Phonics/FR.png",
          extra: true
        }, {
          type: "image",
          title: "GL",
          src: "/Displays/English/Phonics/GL.png",
          extra: true
        }, {
          type: "image",
          title: "GR",
          src: "/Displays/English/Phonics/GR.png",
          extra: true
        }, {
          type: "image",
          title: "PL",
          src: "/Displays/English/Phonics/PL.png",
          extra: true
        }, {
          type: "image",
          title: "PR",
          src: "/Displays/English/Phonics/PR.png",
          extra: true
        }, {
          type: "image",
          title: "SC",
          src: "/Displays/English/Phonics/SC.png",
          extra: true
        }, {
          type: "image",
          title: "SCR",
          src: "/Displays/English/Phonics/SCR.png",
          extra: true
        }, {
          type: "image",
          title: "SH Story",
          src: "/Displays/English/Phonics/SH Story.png",
          extra: true
        }, {
          type: "image",
          title: "SH",
          src: "/Displays/English/Phonics/SH.png",
          extra: true
        }, {
          type: "image",
          title: "SK",
          src: "/Displays/English/Phonics/SK.png",
          extra: true
        }, {
          type: "image",
          title: "SL",
          src: "/Displays/English/Phonics/SL.png",
          extra: true
        }, {
          type: "image",
          title: "SM",
          src: "/Displays/English/Phonics/SM.png",
          extra: true
        }, {
          type: "image",
          title: "SN",
          src: "/Displays/English/Phonics/SN.png",
          extra: true
        }, {
          type: "image",
          title: "SP",
          src: "/Displays/English/Phonics/SP.png",
          extra: true
        }, {
          type: "image",
          title: "SPL",
          src: "/Displays/English/Phonics/SPL.png",
          extra: true
        }, {
          type: "image",
          title: "SPR",
          src: "/Displays/English/Phonics/SPR.png",
          extra: true
        }, {
          type: "image",
          title: "ST",
          src: "/Displays/English/Phonics/ST.png",
          extra: true
        }, {
          type: "image",
          title: "STR",
          src: "/Displays/English/Phonics/STR.png",
          extra: true
        }, {
          type: "image",
          title: "SW",
          src: "/Displays/English/Phonics/SW.png",
          extra: true
        }, {
          type: "image",
          title: "TH",
          src: "/Displays/English/Phonics/TH.png",
          extra: true
        }, {
          type: "image",
          title: "TR",
          src: "/Displays/English/Phonics/TR.png",
          extra: true
        }, {
          type: "image",
          title: "WH",
          src: "/Displays/English/Phonics/WH.png",
          extra: true
        }, {
          type: "image",
          title: "Chunking",
          src: "/Displays/English/Spelling/Chunking.png",
          extra: true
        }, {
          type: "image",
          title: "LetterSound",
          src: "/Displays/English/Spelling/LetterSound.png",
          extra: true
        }, {
          type: "image",
          title: "Phonetic Strategies",
          src: "/Displays/English/Spelling/Phonetic Strategies.png",
          extra: true
        }, {
          type: "image",
          title: "Rhyming",
          src: "/Displays/English/Spelling/Rhyming.png",
          extra: true
        }, {
          type: "image",
          title: "SoundItOut",
          src: "/Displays/English/Spelling/SoundItOut.png",
          extra: true
        }]
      }
    }, {
      id: 'digraphs_trigraphs',
      name: 'Digraphs/trigraphs/quadgraphs'
    }, {
      id: 'prefixes_suffixes',
      name: 'Prefixes/suffixes'
    }, {
      id: 'root_words',
      name: 'Root words'
    }, {
      id: 'homophones',
      name: 'Homophones'
    }, {
      id: 'silent_letters',
      name: 'Silent letters'
    }, {
      id: 'spelling_rules',
      name: 'Spelling rules'
    }, {
      id: 'high_frequency_words',
      name: 'High-frequency words'
    }, {
      id: 'morphology',
      name: 'Morphology'
    }]
  }, {
    id: 'vocabulary',
    name: 'Vocabulary Development',
    icon: '🧠',
    domain: 'Language (How English Works)',
    subtopics: [{
      id: 'synonyms_antonyms',
      name: 'Synonyms and antonyms'
    }, {
      id: 'shades_of_meaning',
      name: 'Shades of meaning'
    }, {
      id: 'figurative_vocabulary',
      name: 'Figurative vocabulary'
    }, {
      id: 'technical_vocabulary',
      name: 'Technical vocabulary'
    }, {
      id: 'context_clues',
      name: 'Context clues'
    }, {
      id: 'word_origins',
      name: 'Word origins (etymology basics)'
    }]
  }]
}, {
  id: 'literature',
  name: '2. Literature (Understanding Texts)',
  icon: '🎭',
  color: 'bg-purple-50 border-purple-200 text-purple-900',
  topics: [{
    id: 'narrative_texts',
    name: 'Narrative Texts',
    icon: '📚',
    domain: 'Literature',
    subtopics: [{
      id: 'story_elements',
      name: 'Story elements (Character, Setting, Plot, Conflict, Resolution)',
      resources: {
        learn: [{
          type: "pdf",
          title: "Shelter, Shore, Identity, Craft",
          src: "/Unit Resources/Literacy/Shelter_Shore_Identity_Craft.pdf",
          extra: true
        }]
      }
    }, {
      id: 'themes_messages',
      name: 'Themes and messages',
      resources: {
        learn: [{
          type: "pdf",
          title: "Narnia Deep Magic and the Wardrobe",
          src: "/Unit Resources/Literacy/Narnia_Deep_Magic_and_the_Wardrobe.pdf",
          extra: true
        }]
      }
    }, {
      id: 'point_of_view',
      name: 'Point of view'
    }, {
      id: 'character_development',
      name: 'Character development',
      resources: {
        learn: [{
          type: "pdf",
          title: "Character Creation Crew",
          src: "/Unit Resources/Literacy/Character_Creation_Crew_Building_Unforgettable_Sto.pdf",
          extra: true
        }],
        practice: [{
          type: "pdf",
          title: "Character Profile Comprehension",
          src: "/Unit Resources/Literacy/Character Profile Comprehension.pdf",
          extra: true
        }]
      }
    }, {
      id: 'narrative_voice',
      name: 'Narrative voice'
    }]
  }, {
    id: 'poetry_lit',
    name: 'Poetry',
    icon: '📝',
    domain: 'Literature',
    subtopics: [{
      id: 'rhythm_rhyme',
      name: 'Rhythm and rhyme'
    }, {
      id: 'imagery_poetry',
      name: 'Imagery'
    }, {
      id: 'figurative_language',
      name: 'Figurative language (Simile, Metaphor, Personification, Alliteration)'
    }, {
      id: 'free_verse',
      name: 'Free verse vs structured poetry'
    }, {
      id: 'performance_poetry',
      name: 'Performance poetry'
    }]
  }, {
    id: 'drama',
    name: 'Drama',
    icon: '🎭',
    domain: 'Literature',
    subtopics: [{
      id: 'scripts_dialogue',
      name: 'Scripts and dialogue'
    }, {
      id: 'role_play',
      name: 'Role play'
    }, {
      id: 'readers_theatre',
      name: 'Readers theatre'
    }, {
      id: 'performance_skills',
      name: 'Performance skills'
    }, {
      id: 'stage_directions',
      name: 'Stage directions'
    }]
  }, {
    id: 'literary_appreciation',
    name: 'Literary Appreciation',
    icon: '🌍',
    domain: 'Literature',
    subtopics: [{
      id: 'author_studies',
      name: 'Author studies'
    }, {
      id: 'genre_exploration',
      name: 'Genre exploration'
    }, {
      id: 'cultural_perspectives',
      name: 'Cultural perspectives in texts'
    }, {
      id: 'comparing_texts',
      name: 'Comparing texts',
      resources: {
        learn: [{
          type: "pdf",
          title: "Teresa: A New Australian Book Analysis",
          src: "/Unit Resources/Literacy/Teresa_A_New_Australian_Book_Analysis.pdf",
          extra: true
        }]
      }
    }, {
      id: 'visual_literacy_lit',
      name: 'Visual literacy (illustrations, film, media)'
    }]
  }]
}, {
  id: 'literacy',
  name: '3. Literacy (Using English)',
  icon: '🗣️',
  color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  topics: [{
    id: 'writing_genres',
    name: 'Writing Genres',
    icon: '📝',
    domain: 'Literacy',
    subtopics: [{
      id: 'narrative_writing',
      name: 'Narrative Writing (Short stories, Fantasy/adventure, Historical fiction, Personal narratives)'
    }, {
      id: 'persuasive_writing',
      name: 'Persuasive Writing (Arguments, Opinion pieces, Debates, Advertisements)',
      resources: {
        practice: [{
          type: "image",
          title: "Persuasive Prompt 1",
          src: "/Curriculum/Literacy/VisualPrompts/Persuasive/1.png",
          extra: true
        }, {
          type: "image",
          title: "Persuasive Prompt 2",
          src: "/Curriculum/Literacy/VisualPrompts/Persuasive/2.png",
          extra: true
        }, {
          type: "image",
          title: "Persuasive Prompt 3",
          src: "/Curriculum/Literacy/VisualPrompts/Persuasive/3.png",
          extra: true
        }, {
          type: "image",
          title: "Persuasive Prompt 4",
          src: "/Curriculum/Literacy/VisualPrompts/Persuasive/4.png",
          extra: true
        }, {
          type: "image",
          title: "Persuasive Prompt 5",
          src: "/Curriculum/Literacy/VisualPrompts/Persuasive/5.png",
          extra: true
        }, {
          type: "image",
          title: "Persuasive Prompt 6",
          src: "/Curriculum/Literacy/VisualPrompts/Persuasive/6.png",
          extra: true
        }, {
          type: "image",
          title: "Persuasive Prompt 7",
          src: "/Curriculum/Literacy/VisualPrompts/Persuasive/7.png",
          extra: true
        }, {
          type: "image",
          title: "Persuasive Prompt 8",
          src: "/Curriculum/Literacy/VisualPrompts/Persuasive/8.png",
          extra: true
        }, {
          type: "image",
          title: "Persuasive Prompt 9",
          src: "/Curriculum/Literacy/VisualPrompts/Persuasive/9.png",
          extra: true
        }, {
          type: "image",
          title: "Persuasive Prompt 10",
          src: "/Curriculum/Literacy/VisualPrompts/Persuasive/10.png",
          extra: true
        }, {
          type: "image",
          title: "Persuasive Prompt 11",
          src: "/Curriculum/Literacy/VisualPrompts/Persuasive/11.png",
          extra: true
        }, {
          type: "image",
          title: "Persuasive Prompt 12",
          src: "/Curriculum/Literacy/VisualPrompts/Persuasive/12.png",
          extra: true
        }, {
          type: "image",
          title: "Persuasive Prompt 13",
          src: "/Curriculum/Literacy/VisualPrompts/Persuasive/13.png",
          extra: true
        }, {
          type: "image",
          title: "Persuasive Prompt 14",
          src: "/Curriculum/Literacy/VisualPrompts/Persuasive/14.png",
          extra: true
        }, {
          type: "image",
          title: "Persuasive Prompt 15",
          src: "/Curriculum/Literacy/VisualPrompts/Persuasive/15.png",
          extra: true
        }, {
          type: "image",
          title: "Persuasive Prompt 16",
          src: "/Curriculum/Literacy/VisualPrompts/Persuasive/16.png",
          extra: true
        }],
        display: [{
          type: "image",
          title: "Persuasive Checklist",
          src: "/Displays/English/Writing/Persuasive/Persuasive Checklist.png",
          extra: true
        }, {
          type: "image",
          title: "Persuasive Devices",
          src: "/Displays/English/Writing/Persuasive/Persuasive Devices.png",
          extra: true
        }, {
          type: "image",
          title: "Persuasive Elements",
          src: "/Displays/English/Writing/Persuasive/Persuasive Elements.png",
          extra: true
        }, {
          type: "image",
          title: "Persuasive Structure",
          src: "/Displays/English/Writing/Persuasive/Persuasive Structure.png",
          extra: true
        }, {
          type: "image",
          title: "Persuasive",
          src: "/Displays/English/Writing/Persuasive/Persuasive.png",
          extra: true
        }, {
          type: "image",
          title: "Persuasive",
          src: "/Displays/English/Writing/Persuasive.png",
          extra: true
        }]
      }
    }, {
      id: 'informative_writing',
      name: 'Informative Writing (Reports, Explanations, Procedures, Information texts)',
      resources: {
        learn: [{
          type: "pdf",
          title: "The Nintendo Story",
          src: "/Unit Resources/Literacy/The_Nintendo_Story.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "World Cup History The Global Game",
          src: "/Unit Resources/Literacy/World_Cup_History_The_Global_Game.pdf",
          extra: true
        }],
        display: [{
          type: "image",
          title: "Book Review",
          src: "/Displays/English/Writing/Book Review/Book Review.png",
          extra: true
        }, {
          type: "image",
          title: "Review Body 1",
          src: "/Displays/English/Writing/Book Review/Review Body 1.png",
          extra: true
        }, {
          type: "image",
          title: "Review Body 2",
          src: "/Displays/English/Writing/Book Review/Review Body 2.png",
          extra: true
        }, {
          type: "image",
          title: "Review Body 3",
          src: "/Displays/English/Writing/Book Review/Review Body 3.png",
          extra: true
        }, {
          type: "image",
          title: "Review Checklist",
          src: "/Displays/English/Writing/Book Review/Review Checklist.png",
          extra: true
        }, {
          type: "image",
          title: "Review Conclusion",
          src: "/Displays/English/Writing/Book Review/Review Conclusion.png",
          extra: true
        }, {
          type: "image",
          title: "Review Draft",
          src: "/Displays/English/Writing/Book Review/Review Draft.png",
          extra: true
        }, {
          type: "image",
          title: "Review Editing",
          src: "/Displays/English/Writing/Book Review/Review Editing.png",
          extra: true
        }, {
          type: "image",
          title: "Review Introduction",
          src: "/Displays/English/Writing/Book Review/Review Introduction.png",
          extra: true
        }, {
          type: "image",
          title: "Review Preperation",
          src: "/Displays/English/Writing/Book Review/Review Preperation.png",
          extra: true
        }, {
          type: "image",
          title: "Review Structure",
          src: "/Displays/English/Writing/Book Review/Review Structure.png",
          extra: true
        }]
      }
    }, {
      id: 'creative_writing',
      name: 'Creative Writing (Poetry, Plays/scripts, Imaginative pieces)',
      resources: {
        practice: [{
          type: "image",
          title: "Visual Prompt 1",
          src: "/Curriculum/Literacy/VisualPrompts/1.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 2",
          src: "/Curriculum/Literacy/VisualPrompts/2.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 3",
          src: "/Curriculum/Literacy/VisualPrompts/3.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 4",
          src: "/Curriculum/Literacy/VisualPrompts/4.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 5",
          src: "/Curriculum/Literacy/VisualPrompts/5.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 6",
          src: "/Curriculum/Literacy/VisualPrompts/6.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 7",
          src: "/Curriculum/Literacy/VisualPrompts/7.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 8",
          src: "/Curriculum/Literacy/VisualPrompts/8.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 9",
          src: "/Curriculum/Literacy/VisualPrompts/9.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 10",
          src: "/Curriculum/Literacy/VisualPrompts/10.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 11",
          src: "/Curriculum/Literacy/VisualPrompts/11.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 12",
          src: "/Curriculum/Literacy/VisualPrompts/12.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 13",
          src: "/Curriculum/Literacy/VisualPrompts/13.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 14",
          src: "/Curriculum/Literacy/VisualPrompts/14.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 15",
          src: "/Curriculum/Literacy/VisualPrompts/15.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 16",
          src: "/Curriculum/Literacy/VisualPrompts/16.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 17",
          src: "/Curriculum/Literacy/VisualPrompts/17.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 18",
          src: "/Curriculum/Literacy/VisualPrompts/18.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 19",
          src: "/Curriculum/Literacy/VisualPrompts/19.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 20",
          src: "/Curriculum/Literacy/VisualPrompts/20.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 21",
          src: "/Curriculum/Literacy/VisualPrompts/21.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 22",
          src: "/Curriculum/Literacy/VisualPrompts/22.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 23",
          src: "/Curriculum/Literacy/VisualPrompts/23.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 24",
          src: "/Curriculum/Literacy/VisualPrompts/24.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 25",
          src: "/Curriculum/Literacy/VisualPrompts/25.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 26",
          src: "/Curriculum/Literacy/VisualPrompts/26.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 27",
          src: "/Curriculum/Literacy/VisualPrompts/27.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 28",
          src: "/Curriculum/Literacy/VisualPrompts/28.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 29",
          src: "/Curriculum/Literacy/VisualPrompts/29.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 30",
          src: "/Curriculum/Literacy/VisualPrompts/30.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 31",
          src: "/Curriculum/Literacy/VisualPrompts/31.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 32",
          src: "/Curriculum/Literacy/VisualPrompts/32.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 33",
          src: "/Curriculum/Literacy/VisualPrompts/33.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 34",
          src: "/Curriculum/Literacy/VisualPrompts/34.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 35",
          src: "/Curriculum/Literacy/VisualPrompts/35.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 36",
          src: "/Curriculum/Literacy/VisualPrompts/36.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 37",
          src: "/Curriculum/Literacy/VisualPrompts/37.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 38",
          src: "/Curriculum/Literacy/VisualPrompts/38.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 39",
          src: "/Curriculum/Literacy/VisualPrompts/39.png",
          extra: true
        }, {
          type: "image",
          title: "Visual Prompt 40",
          src: "/Curriculum/Literacy/VisualPrompts/40.png",
          extra: true
        }],
        learn: [{
          type: "pdf",
          title: "The Wilds of Writing A Field Guide",
          src: "/Unit Resources/Literacy/The_Wilds_of_Writing_A_Field_Guide.pdf",
          extra: true
        }],
        display: [{
          type: "image",
          title: "Poetry Display",
          src: "/Displays/English/Writing/Poetry.png",
          extra: true
        }, {
          type: "image",
          title: "Recount Display",
          src: "/Displays/English/Writing/Recount.png",
          extra: true
        }, {
          type: "image",
          title: "SciFi Narratives Display",
          src: "/Displays/English/Writing/SciFi Narratives.png",
          extra: true
        }]
      }
    }]
  }, {
    id: 'writing_skills',
    name: 'Writing Skills',
    icon: '📊',
    domain: 'Literacy',
    subtopics: [{
      id: 'planning_drafting',
      name: 'Planning and drafting'
    }, {
      id: 'editing_revising',
      name: 'Editing and revising'
    }, {
      id: 'paragraph_structure',
      name: 'Paragraph structure (TEEL/PEEL etc.)'
    }, {
      id: 'cohesion_flow',
      name: 'Cohesion and flow'
    }, {
      id: 'audience_awareness',
      name: 'Audience awareness'
    }]
  }, {
    id: 'reading_skills',
    name: 'Reading Skills',
    icon: '📖',
    domain: 'Literacy',
    subtopics: [{
      id: 'decoding_fluency',
      name: 'Decoding & Fluency (Phonics, Sight words, Expression, Reading pace)'
    }, {
      id: 'comprehension_strategies',
      name: 'Comprehension Strategies (Predicting, Questioning, Summarising, Inferring, Visualising, Clarifying)',
      resources: {
        practice: [{
          type: "image",
          title: "Bees Comprehension",
          src: "/Curriculum/Literacy/Comprehension Pages/Non Fiction/Bees.png",
          extra: true
        }, {
          type: "image",
          title: "Climate Comprehension",
          src: "/Curriculum/Literacy/Comprehension Pages/Non Fiction/Climate.png",
          extra: true
        }, {
          type: "image",
          title: "Fortnite Comprehension",
          src: "/Curriculum/Literacy/Comprehension Pages/Non Fiction/Fortnite.png",
          extra: true
        }, {
          type: "image",
          title: "Volcanoes Comprehension",
          src: "/Curriculum/Literacy/Comprehension Pages/Non Fiction/Volcanoes.png",
          extra: true
        }, {
          type: "pdf",
          title: "Leveled Comprehension PACK 1",
          src: "/Unit Resources/Literacy/Leveled Comprehension PACK 1.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "Leveled Comprehension PACK 2",
          src: "/Unit Resources/Literacy/Leveled Comprehension PACK 2.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "Blend Friends Adventure",
          src: "/Unit Resources/Literacy/Blend_Friends_Adventure.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "Character Creation Crew Building Unforgettable Stories",
          src: "/Unit Resources/Literacy/Character_Creation_Crew_Building_Unforgettable_Stories.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "Grammar Garden Helpers",
          src: "/Unit Resources/Literacy/Grammar_Garden_Helpers.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "Grammar The Four Kingdoms",
          src: "/Unit Resources/Literacy/Grammar_The_Four_Kingdoms.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "Information Text Comprehension",
          src: "/Unit Resources/Literacy/Information Text Comprehension.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "Literary Architecture",
          src: "/Unit Resources/Literacy/Literary_Architecture.pdf",
          extra: true
        }],
        learn: [{
          type: "pdf",
          title: "Comprehension Information Texts",
          src: "/Unit Resources/Literacy/Comprehension Information Texts.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "Reading Strategies",
          src: "/Unit Resources/Literacy/Reading Strategies.pdf",
          extra: true
        }]
      }
    }, {
      id: 'higher_level_comprehension',
      name: 'Higher-Level Comprehension (Analysing themes, Evaluating texts, Comparing texts, Identifying bias)'
    }]
  }, {
    id: 'speaking_listening',
    name: 'Speaking & Listening',
    icon: '🗣',
    domain: 'Literacy',
    subtopics: [{
      id: 'oral_presentations',
      name: 'Oral presentations'
    }, {
      id: 'discussions',
      name: 'Discussions'
    }, {
      id: 'active_listening',
      name: 'Active listening'
    }, {
      id: 'public_speaking',
      name: 'Public speaking skills'
    }, {
      id: 'interviews',
      name: 'Interviews'
    }, {
      id: 'debates',
      name: 'Debates'
    }]
  }]
}, {
  id: 'media_digital_literacy',
  name: '4. Media & Digital Literacy',
  icon: '📱',
  color: 'bg-cyan-50 border-cyan-200 text-cyan-900',
  topics: [{
    id: 'media_texts',
    name: 'Media Texts',
    icon: "\uD83D\uDCF1",
    subtopics: [{
      id: 'advertisements',
      name: 'Advertisements'
    }, {
      id: 'news_reports',
      name: 'News reports'
    }, {
      id: 'films_videos',
      name: 'Films/videos'
    }, {
      id: 'social_media',
      name: 'Social media texts'
    }]
  }, {
    id: 'critical_literacy',
    name: 'Critical Literacy',
    icon: "\uD83E\uDDE0",
    subtopics: [{
      id: 'bias_persuasion',
      name: 'Bias and persuasion'
    }, {
      id: 'fact_vs_opinion',
      name: 'Fact vs opinion'
    }, {
      id: 'audience_targeting',
      name: 'Audience targeting'
    }, {
      id: 'credibility',
      name: 'Credibility of sources'
    }]
  }, {
    id: 'digital_communication',
    name: 'Digital Communication',
    icon: "\uD83D\uDCAC",
    subtopics: [{
      id: 'emails_messages',
      name: 'Emails/messages'
    }, {
      id: 'multimedia_presentations',
      name: 'Multimedia presentations'
    }, {
      id: 'online_etiquette',
      name: 'Online etiquette'
    }]
  }]
}, {
  id: 'text_types_genres',
  name: '5. Text Types & Genres (Great for Units)',
  icon: '🎯',
  color: 'bg-rose-50 border-rose-200 text-rose-900',
  topics: [{
    id: 'fiction_genres',
    name: 'Fiction Genres',
    icon: "\uD83D\uDC09",
    subtopics: [{
      id: 'fantasy',
      name: 'Fantasy'
    }, {
      id: 'sci_fi',
      name: 'Sci-fi'
    }, {
      id: 'mystery',
      name: 'Mystery'
    }, {
      id: 'adventure',
      name: 'Adventure'
    }, {
      id: 'historical_fiction',
      name: 'Historical fiction'
    }, {
      id: 'humour',
      name: 'Humour'
    }]
  }, {
    id: 'non_fiction_genres',
    name: 'Non-Fiction Genres',
    icon: "\uD83D\uDCF0",
    subtopics: [{
      id: 'biographies',
      name: 'Biographies'
    }, {
      id: 'reports',
      name: 'Reports'
    }, {
      id: 'explanations',
      name: 'Explanations'
    }, {
      id: 'instructions',
      name: 'Instructions'
    }]
  }, {
    id: 'functional_texts',
    name: 'Functional Texts',
    icon: "\uD83D\uDCCB",
    subtopics: [{
      id: 'letters',
      name: 'Letters'
    }, {
      id: 'emails',
      name: 'Emails'
    }, {
      id: 'posters',
      name: 'Posters'
    }, {
      id: 'speeches',
      name: 'Speeches'
    }]
  }]
}, {
  id: 'language_features_style',
  name: '6. Language Features & Style',
  icon: '🌟',
  color: 'bg-amber-50 border-amber-200 text-amber-900',
  topics: [{
    id: 'figurative_language',
    name: 'Figurative Language',
    icon: "\uD83C\uDFAD",
    subtopics: [{
      id: 'simile_metaphor',
      name: 'Simile/metaphor',
      resources: {
        learn: [{
          type: "pdf",
          title: "Comparison Cuties Metaphors and Similes",
          src: "/Unit Resources/Literacy/Comparison_Cuties_Metaphors_and_Similes.pdf",
          extra: true
        }]
      }
    }, {
      id: 'personification',
      name: 'Personification'
    }, {
      id: 'hyperbole',
      name: 'Hyperbole'
    }, {
      id: 'idioms',
      name: 'Idioms'
    }]
  }, {
    id: 'author_techniques',
    name: 'Author Techniques',
    icon: "\u270D",
    subtopics: [{
      id: 'tone',
      name: 'Tone'
    }, {
      id: 'mood',
      name: 'Mood'
    }, {
      id: 'imagery',
      name: 'Imagery',
      resources: {
        learn: [{
          type: "pdf",
          title: "Paint Worlds With Words",
          src: "/Unit Resources/Literacy/Paint_Worlds_With_Words.pdf",
          extra: true
        }],
        display: [{
          type: "image",
          title: "Characterisation Display",
          src: "/Displays/English/Writing/Literary Devices/Characterisation.png",
          extra: true
        }, {
          type: "image",
          title: "Imagery Display",
          src: "/Displays/English/Writing/Literary Devices/Imagery.png",
          extra: true
        }, {
          type: "image",
          title: "Literary Devices Display",
          src: "/Displays/English/Writing/Literary Devices/Literary Devices.png",
          extra: true
        }, {
          type: "image",
          title: "Metaphors Display",
          src: "/Displays/English/Writing/Literary Devices/Metaphors.png",
          extra: true
        }, {
          type: "image",
          title: "Personification Display",
          src: "/Displays/English/Writing/Literary Devices/Personification.png",
          extra: true
        }, {
          type: "image",
          title: "Setting Display",
          src: "/Displays/English/Writing/Literary Devices/Setting.png",
          extra: true
        }, {
          type: "image",
          title: "Similes Display",
          src: "/Displays/English/Writing/Literary Devices/Similes.png",
          extra: true
        }, {
          type: "image",
          title: "Symbolism Display",
          src: "/Displays/English/Writing/Literary Devices/Symbolism.png",
          extra: true
        }]
      }
    }, {
      id: 'symbolism',
      name: 'Symbolism'
    }]
  }]
}, {
  id: 'oral_language',
  name: '7. Oral Language Development',
  icon: '🧩',
  color: 'bg-blue-50 border-blue-200 text-blue-900',
  topics: [{
    id: 'conversation_skills',
    name: 'Conversation skills',
    icon: "\uD83D\uDDE3",
    subtopics: [{
      id: "conversation_skills",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: [{
          type: "image",
          title: "20Questions Game Rules",
          src: "/Displays/Games/20Questions.png",
          extra: true
        }, {
          type: "image",
          title: "2truths Game Rules",
          src: "/Displays/Games/2truths.png",
          extra: true
        }, {
          type: "image",
          title: "Bang Game Rules",
          src: "/Displays/Games/Bang.png",
          extra: true
        }, {
          type: "image",
          title: "CaptainsOrders Game Rules",
          src: "/Displays/Games/CaptainsOrders.png",
          extra: true
        }, {
          type: "image",
          title: "CelebrityHeads Game Rules",
          src: "/Displays/Games/CelebrityHeads.png",
          extra: true
        }, {
          type: "image",
          title: "Corners Game Rules",
          src: "/Displays/Games/Corners.png",
          extra: true
        }, {
          type: "image",
          title: "FruitSalad Game Rules",
          src: "/Displays/Games/FruitSalad.png",
          extra: true
        }, {
          type: "image",
          title: "HeadsDownThumbsUp Game Rules",
          src: "/Displays/Games/HeadsDownThumbsUp.png",
          extra: true
        }, {
          type: "image",
          title: "HumanKnot Game Rules",
          src: "/Displays/Games/HumanKnot.png",
          extra: true
        }, {
          type: "image",
          title: "Musical Statues Game Rules",
          src: "/Displays/Games/Musical Statues.png",
          extra: true
        }, {
          type: "image",
          title: "OneWord Game Rules",
          src: "/Displays/Games/OneWord.png",
          extra: true
        }, {
          type: "image",
          title: "PSR Game Rules",
          src: "/Displays/Games/PSR.png",
          extra: true
        }, {
          type: "image",
          title: "SecretLeader Game Rules",
          src: "/Displays/Games/SecretLeader.png",
          extra: true
        }, {
          type: "image",
          title: "SharksandMinnows Game Rules",
          src: "/Displays/Games/SharksandMinnows.png",
          extra: true
        }, {
          type: "image",
          title: "Silent Ball Game Rules",
          src: "/Displays/Games/Silent Ball.png",
          extra: true
        }, {
          type: "image",
          title: "SleepySpy Game Rules",
          src: "/Displays/Games/SleepySpy.png",
          extra: true
        }]
      }
    }]
  }, {
    id: 'turn_taking',
    name: 'Turn-taking',
    icon: "\u23F3",
    subtopics: [{
      id: "turn_taking",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'expressive_language',
    name: 'Expressive language',
    icon: "\uD83C\uDFAD",
    subtopics: [{
      id: "expressive_language",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'questioning_techniques',
    name: 'Questioning techniques',
    icon: "\u2753",
    subtopics: [{
      id: "questioning_techniques",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'storytelling',
    name: 'Storytelling',
    icon: "\uD83D\uDCD6",
    subtopics: [{
      id: "storytelling",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}, {
  id: 'cross_curricular_english',
  name: '8. Cross-Curricular English Topics',
  icon: '🧪',
  color: 'bg-green-50 border-green-200 text-green-900',
  topics: [{
    id: 'science_report',
    name: 'Science report writing',
    icon: "\uD83D\uDD2C",
    subtopics: [{
      id: "science_report",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'historical_narratives',
    name: 'Historical narratives',
    icon: "\uD83C\uDFFA",
    subtopics: [{
      id: "historical_narratives",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'persuasive_environmental',
    name: 'Persuasive environmental writing',
    icon: "\uD83C\uDF0D",
    subtopics: [{
      id: "persuasive_environmental",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'stem_explanations',
    name: 'STEM explanations',
    icon: "\u2699",
    subtopics: [{
      id: "stem_explanations",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'media_literacy_projects',
    name: 'Media literacy projects',
    icon: "\uD83D\uDCF9",
    subtopics: [{
      id: "media_literacy_projects",
      name: "General",
      resources: {
        display: [{
          type: "image",
          title: "ClassroomChampions",
          src: "/Displays/Banners/ClassroomChampions.png",
          extra: true
        }, {
          type: "image",
          title: "CurriculumCorner",
          src: "/Displays/Banners/CurriculumCorner.png",
          extra: true
        }, {
          type: "image",
          title: "Displays",
          src: "/Displays/Banners/Displays.png",
          extra: true
        }, {
          type: "image",
          title: "Educational Elements",
          src: "/Displays/Banners/Educational Elements.png",
          extra: true
        }, {
          type: "image",
          title: "Games",
          src: "/Displays/Banners/Games.png",
          extra: true
        }, {
          type: "image",
          title: "GEOGRAPHY",
          src: "/Displays/Banners/GEOGRAPHY.png",
          extra: true
        }, {
          type: "image",
          title: "HISTORY",
          src: "/Displays/Banners/HISTORY.png",
          extra: true
        }, {
          type: "image",
          title: "Home",
          src: "/Displays/Banners/Home.png",
          extra: true
        }, {
          type: "image",
          title: "Jobs",
          src: "/Displays/Banners/Jobs.png",
          extra: true
        }, {
          type: "image",
          title: "Literacy",
          src: "/Displays/Banners/Literacy.png",
          extra: true
        }, {
          type: "image",
          title: "Mathematics",
          src: "/Displays/Banners/Mathematics.png",
          extra: true
        }, {
          type: "image",
          title: "PetRace",
          src: "/Displays/Banners/PetRace.png",
          extra: true
        }, {
          type: "image",
          title: "Quests",
          src: "/Displays/Banners/Quests.png",
          extra: true
        }, {
          type: "image",
          title: "Resources",
          src: "/Displays/Banners/Resources.png",
          extra: true
        }, {
          type: "image",
          title: "Science",
          src: "/Displays/Banners/Science.png",
          extra: true
        }, {
          type: "image",
          title: "Shop",
          src: "/Displays/Banners/Shop.png",
          extra: true
        }, {
          type: "image",
          title: "Students",
          src: "/Displays/Banners/Students.png",
          extra: true
        }, {
          type: "image",
          title: "TeacherToolkit",
          src: "/Displays/Banners/TeacherToolkit.png",
          extra: true
        }, {
          type: "image",
          title: "Timetable",
          src: "/Displays/Banners/Timetable.png",
          extra: true
        }, {
          type: "image",
          title: "Tools",
          src: "/Displays/Banners/Tools.png",
          extra: true
        }, {
          type: "image",
          title: "Fantasy Narratives",
          src: "/Displays/English/Writing/Fantasy Narratives.png",
          extra: true
        }, {
          type: "image",
          title: "InfoReports",
          src: "/Displays/English/Writing/InfoReports.png",
          extra: true
        }],
        learn: [],
        practice: []
      }
    }]
  }]
}, {
  id: 'aus_curriculum_cultural',
  name: '9. Australian Curriculum / Cultural Context Topics',
  icon: '🇦🇺',
  color: 'bg-orange-50 border-orange-200 text-orange-900',
  topics: [{
    id: 'indigenous_storytelling',
    name: 'Indigenous storytelling',
    icon: "\uD83E\uDE83",
    subtopics: [{
      id: "indigenous_storytelling",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'australian_authors',
    name: 'Australian authors',
    icon: "\uD83D\uDC28",
    subtopics: [{
      id: "australian_authors",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'multicultural_literature',
    name: 'Multicultural literature',
    icon: "\uD83C\uDF10",
    subtopics: [{
      id: "multicultural_literature",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'local_community_texts',
    name: 'Local community texts',
    icon: "\uD83C\uDFD8",
    subtopics: [{
      id: "local_community_texts",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}, {
  id: 'higher_level_literacy',
  name: '10. Higher-Level Literacy Skills (Upper Primary)',
  icon: '💡',
  color: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900',
  topics: [{
    id: 'author_intent',
    name: 'Author intent',
    icon: "\uD83C\uDFAF",
    subtopics: [{
      id: "author_intent",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'bias_perspective',
    name: 'Bias and perspective',
    icon: "\u2696",
    subtopics: [{
      id: "bias_perspective",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'critical_analysis',
    name: 'Critical analysis',
    icon: "\uD83D\uDD0D",
    subtopics: [{
      id: "critical_analysis",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'comparing_sources',
    name: 'Comparing multiple sources',
    icon: "\uD83D\uDCDA",
    subtopics: [{
      id: "comparing_sources",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'research_skills',
    name: 'Research skills',
    icon: "\uD83D\uDCBB",
    subtopics: [{
      id: "research_skills",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}];

// ------------------------------------------------------------------
// MATH
// ------------------------------------------------------------------
export const mathDomains = [{
  id: 'number_algebra',
  name: '1. Number & Algebra',
  icon: '🔢',
  color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  topics: [{
    id: 'number_place_value',
    name: 'Number & Place Value',
    icon: '🧮',
    domain: 'Number & Algebra',
    subtopics: [{
      id: "number_place_value",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'addition_subtraction',
    name: 'Addition & Subtraction',
    icon: '➕',
    domain: 'Number & Algebra',
    subtopics: [{
      id: "addition_subtraction",
      name: "General",
      resources: {
        display: [{
          type: "image",
          title: "Addition",
          src: "/Displays/Maths/Addition.png",
          extra: true
        }, {
          type: "image",
          title: "Subtraction",
          src: "/Displays/Maths/Subtraction.png",
          extra: true
        }],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'multiplication_division',
    name: 'Multiplication & Division',
    icon: '✖',
    domain: 'Number & Algebra',
    subtopics: [{
      id: "multiplication_division",
      name: "General",
      resources: {
        display: [{
          type: "image",
          title: "Multiplication",
          src: "/Displays/Maths/Multiplication.png",
          extra: true
        }, {
          type: "image",
          title: "Division",
          src: "/Displays/Maths/Division.png",
          extra: true
        }],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'fractions',
    name: 'Fractions',
    icon: '🍰',
    domain: 'Number & Algebra',
    subtopics: [{
      id: "fractions",
      name: "General",
      resources: {
        display: [],
        learn: [{
          type: "pdf",
          title: "Fraction Building Blocks",
          src: "/Unit Resources/Mathematics/Fraction_Building_Blocks.pdf",
          extra: true
        }],
        practice: []
      }
    }]
  }, {
    id: 'decimals',
    name: 'Decimals',
    icon: '🧁',
    domain: 'Number & Algebra',
    subtopics: [{
      id: "decimals",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'percentages',
    name: 'Percentages',
    icon: '💰',
    domain: 'Number & Algebra',
    subtopics: [{
      id: "percentages",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'patterns_algebra',
    name: 'Patterns & Algebra',
    icon: '📐',
    domain: 'Number & Algebra',
    subtopics: [{
      id: "patterns_algebra",
      name: "General",
      resources: {
        display: [{
          type: "image",
          title: "ComparingFractions",
          src: "/Displays/Maths/ComparingFractions.png",
          extra: true
        }, {
          type: "image",
          title: "Flip",
          src: "/Displays/Maths/Flip.png",
          extra: true
        }, {
          type: "image",
          title: "FlipTurnSlide",
          src: "/Displays/Maths/FlipTurnSlide.png",
          extra: true
        }, {
          type: "image",
          title: "Integers",
          src: "/Displays/Maths/Integers.png",
          extra: true
        }, {
          type: "image",
          title: "Recount",
          src: "/Displays/Maths/Recount.png",
          extra: true
        }, {
          type: "image",
          title: "Slide",
          src: "/Displays/Maths/Slide.png",
          extra: true
        }, {
          type: "image",
          title: "Symmetry",
          src: "/Displays/Maths/Symmetry.png",
          extra: true
        }, {
          type: "image",
          title: "TessellatingPaterns",
          src: "/Displays/Maths/TessellatingPaterns.png",
          extra: true
        }, {
          type: "image",
          title: "Turn",
          src: "/Displays/Maths/Turn.png",
          extra: true
        }],
        learn: [],
        practice: [{
          type: "pdf",
          title: "Integer Ocean Adventure",
          src: "/Unit Resources/Mathematics/Integer_Ocean_Adventure.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "The World Beyond Zero",
          src: "/Unit Resources/Mathematics/The_World_Beyond_Zero.pdf",
          extra: true
        }]
      }
    }]
  }]
}, {
  id: 'measurement_geometry',
  name: '2. Measurement & Geometry',
  icon: '📏',
  color: 'bg-blue-50 border-blue-200 text-blue-900',
  topics: [{
    id: 'length',
    name: 'Length',
    icon: '📐',
    domain: 'Measurement & Geometry',
    subtopics: [{
      id: "length",
      name: "General",
      resources: {
        display: [{
          type: "image",
          title: "Length",
          src: "/Displays/Maths/Length.png",
          extra: true
        }],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'area',
    name: 'Area',
    icon: '🟦',
    domain: 'Measurement & Geometry',
    subtopics: [{
      id: "area",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'volume_capacity',
    name: 'Volume & Capacity',
    icon: '🧊',
    domain: 'Measurement & Geometry',
    subtopics: [{
      id: "volume_capacity",
      name: "General",
      resources: {
        display: [{
          type: "image",
          title: "Volume",
          src: "/Displays/Maths/Volume.png",
          extra: true
        }],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'mass',
    name: 'Mass',
    icon: '⚖',
    domain: 'Measurement & Geometry',
    subtopics: [{
      id: "mass",
      name: "General",
      resources: {
        display: [{
          type: "image",
          title: "Mass",
          src: "/Displays/Maths/Mass.png",
          extra: true
        }],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'time',
    name: 'Time',
    icon: '🕒',
    domain: 'Measurement & Geometry',
    subtopics: [{
      id: "time",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'money',
    name: 'Money',
    icon: '💵',
    domain: 'Measurement & Geometry',
    subtopics: [{
      id: "money",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: [{
          type: "pdf",
          title: "Australian Coins and Notes",
          src: "/Unit Resources/Mathematics/Australian Coins and Notes.pdf",
          extra: true
        }]
      }
    }]
  }, {
    id: '2d_shapes',
    name: '2D Shapes',
    icon: '🔷',
    domain: 'Measurement & Geometry',
    subtopics: [{
      id: "2d_shapes",
      name: "General",
      resources: {
        display: [{
          type: "image",
          title: "2D Shapes",
          src: "/Displays/Maths/2D Shapes.png",
          extra: true
        }],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: '3d_objects',
    name: '3D Objects',
    icon: '🧊',
    domain: 'Measurement & Geometry',
    subtopics: [{
      id: "3d_objects",
      name: "General",
      resources: {
        display: [{
          type: "image",
          title: "3D Shapes",
          src: "/Displays/Maths/3D Shapes.png",
          extra: true
        }],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'transformation',
    name: 'Transformation',
    icon: '🔁',
    domain: 'Measurement & Geometry',
    subtopics: [{
      id: "transformation",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'position_direction',
    name: 'Position & Direction',
    icon: '🧭',
    domain: 'Measurement & Geometry',
    subtopics: [{
      id: "position_direction",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}, {
  id: 'statistics_probability',
  name: '3. Statistics & Probability',
  icon: '📊',
  color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  topics: [{
    id: 'data_representation',
    name: 'Data Representation',
    icon: '📈',
    domain: 'Statistics & Probability',
    subtopics: [{
      id: "data_representation",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'interpreting_data',
    name: 'Interpreting Data',
    icon: '📊',
    domain: 'Statistics & Probability',
    subtopics: [{
      id: "interpreting_data",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'probability',
    name: 'Probability',
    icon: '🎲',
    domain: 'Statistics & Probability',
    subtopics: [{
      id: "probability",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}, {
  id: 'mathematical_thinking',
  name: '4. Mathematical Thinking & Problem Solving',
  icon: '🧠',
  color: 'bg-purple-50 border-purple-200 text-purple-900',
  topics: [{
    id: 'problem_solving_strategies',
    name: 'Problem Solving Strategies',
    icon: '🧩',
    domain: 'Mathematical Thinking',
    subtopics: [{
      id: "problem_solving_strategies",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'mathematical_communication',
    name: 'Mathematical Communication',
    icon: '🗣',
    domain: 'Mathematical Thinking',
    subtopics: [{
      id: "mathematical_communication",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}, {
  id: 'financial_real_world',
  name: '5. Financial & Real-World Mathematics',
  icon: '💡',
  color: 'bg-amber-50 border-amber-200 text-amber-900',
  topics: [{
    id: 'financial_mathematics',
    name: 'Financial Mathematics',
    icon: '🪙',
    domain: 'Financial & Real-World',
    subtopics: [{
      id: "financial_mathematics",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'real_world_applications',
    name: 'Real-World Applications',
    icon: '🌍',
    domain: 'Financial & Real-World',
    subtopics: [{
      id: "real_world_applications",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}, {
  id: 'cross_curricular_maths',
  name: '6. Cross-Curricular Maths Topics',
  icon: '🧩',
  color: 'bg-teal-50 border-teal-200 text-teal-900',
  topics: [{
    id: 'maths_across_curriculum',
    name: 'Maths Across the Curriculum',
    icon: '🔗',
    domain: 'Cross-Curricular Maths',
    subtopics: [{
      id: "maths_across_curriculum",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}];

// ------------------------------------------------------------------
// SCIENCE
// ------------------------------------------------------------------
export const scienceDomains = [{
  id: 'physical_sciences',
  name: '1. Physical Sciences (Physics)',
  icon: '🔬',
  color: 'bg-blue-50 border-blue-200 text-blue-900',
  topics: [{
    id: 'forces_motion',
    name: 'Forces & Motion',
    icon: '⚡',
    domain: 'Physical Sciences',
    subtopics: [{
      id: 'pushes_pulls',
      name: 'Pushes and Pulls',
      resources: {
        display: [{
          type: 'image',
          title: 'Pushes and Pulls Display',
          src: '/Curriculum/New Science/Forces and Motion/Pushes and pulls/Display/PushesAndPulls.png'
        }],
        learn: [{
          type: 'pdf',
          title: 'Pushes and Pulls Guide',
          src: '/Curriculum/New Science/Forces and Motion/Pushes and pulls/Learning/PushesAndPulls.pdf',
          pptxSrc: '/Curriculum/New Science/Forces and Motion/Pushes and pulls/Learning/PushesAndPulls.pptx',
          thumbnail: '/Curriculum/New Science/Forces and Motion/Pushes and pulls/Learning/cover.png'
        }],
        practice: []
      }
    }, {
      id: 'contact_vs_non_contact',
      name: 'Contact vs Non-Contact Forces',
      resources: {
        display: [{
          type: 'image',
          title: 'Contact Vs Non Contact Display',
          src: '/Curriculum/New Science/Forces and Motion/Contact Vs Non Contact/Display/ContactVsNonContact.png'
        }],
        learn: [{
          type: 'pdf',
          title: 'Contact Vs Non Contact Guide',
          src: '/Curriculum/New Science/Forces and Motion/Contact Vs Non Contact/Learning/ContactVsNonContact.pdf',
          pptxSrc: '/Curriculum/New Science/Forces and Motion/Contact Vs Non Contact/Learning/ContactVsNonContact.pptx',
          thumbnail: '/Curriculum/New Science/Forces and Motion/Contact Vs Non Contact/Learning/cover.png'
        }],
        practice: []
      }
    }, {
      id: 'gravity',
      name: 'Gravity',
      resources: {
        display: [{
          type: 'image',
          title: 'Gravity Display',
          src: '/Curriculum/New Science/Forces and Motion/Gravity/Display/Gravity.png'
        }],
        learn: [{
          type: 'pdf',
          title: 'Gravity Guide',
          src: '/Curriculum/New Science/Forces and Motion/Gravity/Learning/Gravity.pdf',
          pptxSrc: '/Curriculum/New Science/Forces and Motion/Gravity/Learning/Gravity.pptx',
          thumbnail: '/Curriculum/New Science/Forces and Motion/Gravity/Learning/cover.png'
        }],
        practice: []
      }
    }, {
      id: 'friction',
      name: 'Friction',
      resources: {
        display: [{
          type: 'image',
          title: 'Friction Display',
          src: '/Curriculum/New Science/Forces and Motion/Friction/Display/Friction.png'
        }],
        learn: [{
          type: 'pdf',
          title: 'Friction Guide',
          src: '/Curriculum/New Science/Forces and Motion/Friction/Learning/Friction.pdf',
          pptxSrc: '/Curriculum/New Science/Forces and Motion/Friction/Learning/Friction.pptx',
          thumbnail: '/Curriculum/New Science/Forces and Motion/Friction/Learning/cover.png'
        }],
        practice: []
      }
    }, {
      id: 'air_resistance',
      name: 'Air Resistance',
      resources: {
        display: [{
          type: 'image',
          title: 'Air Resistance Display',
          src: '/Curriculum/New Science/Forces and Motion/Air Resistance/Display/AirResistance.png'
        }],
        learn: [{
          type: 'pdf',
          title: 'Air Resistance Guide',
          src: '/Curriculum/New Science/Forces and Motion/Air Resistance/Learning/AirResistance.pdf',
          pptxSrc: '/Curriculum/New Science/Forces and Motion/Air Resistance/Learning/AirResistance.pptx',
          thumbnail: '/Curriculum/New Science/Forces and Motion/Air Resistance/Learning/cover.png'
        }],
        practice: []
      }
    }, {
      id: 'magnetic_forces',
      name: 'Magnetic Forces',
      resources: {
        display: [{
          type: 'image',
          title: 'Magnetic Forces Display',
          src: '/Curriculum/New Science/Forces and Motion/Magnetic Forces/Display/Magnetic Forces.png'
        }],
        learn: [{
          type: 'pdf',
          title: 'Magnetic Forces Guide',
          src: '/Curriculum/New Science/Forces and Motion/Magnetic Forces/Learning/MagneticForces.pdf',
          pptxSrc: '/Curriculum/New Science/Forces and Motion/Magnetic Forces/Learning/MagneticForces.pptx',
          thumbnail: '/Curriculum/New Science/Forces and Motion/Magnetic Forces/Learning/cover.png'
        }],
        practice: []
      }
    }, {
      id: 'simple_machines',
      name: 'Simple Machines',
      resources: {
        display: [{
          type: 'image',
          title: 'Simple Machines Display',
          src: '/Curriculum/New Science/Forces and Motion/Simple Machines/Display/Simple Machines.png'
        }, {
          type: "image",
          title: "EnvironmentalChangeVocab",
          src: "/Displays/Science/EnvironmentalChange/EnvironmentalChangeVocab.png",
          extra: true
        }, {
          type: "image",
          title: "Bottle Rocket",
          src: "/Displays/Science/Experiments/Bottle Rocket.png",
          extra: true
        }, {
          type: "image",
          title: "Elephant Toothpaste",
          src: "/Displays/Science/Experiments/Elephant Toothpaste.png",
          extra: true
        }],
        learn: [{
          type: 'pdf',
          title: 'Simple Machines Guide',
          src: '/Curriculum/New Science/Forces and Motion/Simple Machines/Learning/SimpleMachines.pdf',
          pptxSrc: '/Curriculum/New Science/Forces and Motion/Simple Machines/Learning/SimpleMachines.pptx',
          thumbnail: '/Curriculum/New Science/Forces and Motion/Simple Machines/Learning/cover.png'
        }],
        practice: []
      }
    }]
  }, {
    id: 'energy',
    name: 'Energy',
    icon: '🔊',
    domain: 'Physical Sciences',
    subtopics: [{
      id: "energy",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'light',
    name: 'Light',
    icon: '💡',
    domain: 'Physical Sciences',
    subtopics: [{
      id: "light",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'sound',
    name: 'Sound',
    icon: '🔉',
    domain: 'Physical Sciences',
    subtopics: [{
      id: "sound",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'heat_temp',
    name: 'Heat & Temperature',
    icon: '🌡',
    domain: 'Physical Sciences',
    subtopics: [{
      id: "heat_temp",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'electricity',
    name: 'Electricity',
    icon: '⚙',
    domain: 'Physical Sciences',
    subtopics: [{
      id: "electricity",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}, {
  id: 'earth_space',
  name: '2. Earth & Space Sciences',
  icon: '🌍',
  color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  topics: [{
    id: 'earth_materials',
    name: 'Earth Materials',
    icon: '🌎',
    domain: 'Earth & Space Sciences',
    subtopics: [{
      id: "earth_materials",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'weather_climate',
    name: 'Weather & Climate',
    icon: '🌦',
    domain: 'Earth & Space Sciences',
    subtopics: [{
      id: "weather_climate",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'water_earth',
    name: 'Water on Earth',
    icon: '🌊',
    domain: 'Earth & Space Sciences',
    subtopics: [{
      id: "water_earth",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'earth_systems',
    name: 'Earth Systems',
    icon: '🌏',
    domain: 'Earth & Space Sciences',
    subtopics: [{
      id: "earth_systems",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'space',
    name: 'Space',
    icon: '🚀',
    domain: 'Earth & Space Sciences',
    subtopics: [{
      id: "space",
      name: "General",
      resources: {
        display: [{
          type: "image",
          title: "Earth Display",
          src: "/Displays/Science/Space/Earth.png",
          extra: true
        }, {
          type: "image",
          title: "Jupiter Display",
          src: "/Displays/Science/Space/Jupiter.png",
          extra: true
        }, {
          type: "image",
          title: "Mars Display",
          src: "/Displays/Science/Space/Mars.png",
          extra: true
        }, {
          type: "image",
          title: "Mercury Display",
          src: "/Displays/Science/Space/Mercury.png",
          extra: true
        }, {
          type: "image",
          title: "Neptune Display",
          src: "/Displays/Science/Space/Neptune.png",
          extra: true
        }, {
          type: "image",
          title: "Saturn Display",
          src: "/Displays/Science/Space/Saturn.png",
          extra: true
        }, {
          type: "image",
          title: "SolarSystem Display",
          src: "/Displays/Science/Space/SolarSystem.png",
          extra: true
        }, {
          type: "image",
          title: "SpaceVocab Display",
          src: "/Displays/Science/Space/SpaceVocab.png",
          extra: true
        }, {
          type: "image",
          title: "Uranus Display",
          src: "/Displays/Science/Space/Uranus.png",
          extra: true
        }, {
          type: "image",
          title: "Venus Display",
          src: "/Displays/Science/Space/Venus.png",
          extra: true
        }],
        learn: [{
          type: "pdf",
          title: "A City In The Stars",
          src: "/Unit Resources/Science/A_City_In_The_Stars.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "Celestial Clockwork",
          src: "/Unit Resources/Science/Celestial_Clockwork.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "Our Solar System Tour",
          src: "/Unit Resources/Science/Our_Solar_System_Tour.pdf",
          extra: true
        }],
        practice: []
      }
    }]
  }]
}, {
  id: 'biological_sciences',
  name: '3. Biological Sciences (Life Science)',
  icon: '🌱',
  color: 'bg-green-50 border-green-200 text-green-900',
  topics: [{
    id: 'plants',
    name: 'Plants',
    icon: '🌿',
    domain: 'Biological Sciences',
    subtopics: [{
      id: "plants",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'animals',
    name: 'Animals',
    icon: '🐾',
    domain: 'Biological Sciences',
    subtopics: [{
      id: "animals",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'human_biology',
    name: 'Human Biology',
    icon: '👩‍⚕️',
    domain: 'Biological Sciences',
    subtopics: [{
      id: "human_biology",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'ecosystems',
    name: 'Ecosystems',
    icon: '🌏',
    domain: 'Biological Sciences',
    subtopics: [{
      id: "ecosystems",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'adaptations',
    name: 'Adaptations',
    icon: '🧬',
    domain: 'Biological Sciences',
    subtopics: [{
      id: "adaptations",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}, {
  id: 'chemical_sciences',
  name: '4. Chemical Sciences (Chemistry)',
  icon: '🧪',
  color: 'bg-rose-50 border-rose-200 text-rose-900',
  topics: [{
    id: 'matter',
    name: 'Matter',
    icon: '🧱',
    domain: 'Chemical Sciences',
    subtopics: [{
      id: "matter",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'materials',
    name: 'Materials',
    icon: '🧴',
    domain: 'Chemical Sciences',
    subtopics: [{
      id: "materials",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'changes_materials',
    name: 'Changes in Materials',
    icon: '🔄',
    domain: 'Chemical Sciences',
    subtopics: [{
      id: "changes_materials",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}, {
  id: 'inquiry_skills',
  name: '5. Scientific Inquiry Skills (Process Skills)',
  icon: '🔎',
  color: 'bg-amber-50 border-amber-200 text-amber-900',
  topics: [{
    id: 'investigating',
    name: 'Investigating',
    icon: '🔬',
    domain: 'Scientific Inquiry Skills',
    subtopics: [{
      id: "investigating",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'observing_measuring',
    name: 'Observing & Measuring',
    icon: '📏',
    domain: 'Scientific Inquiry Skills',
    subtopics: [{
      id: "observing_measuring",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'analysing',
    name: 'Analysing',
    icon: '📊',
    domain: 'Scientific Inquiry Skills',
    subtopics: [{
      id: "analysing",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'communicating_science',
    name: 'Communicating Science',
    icon: '🗣',
    domain: 'Scientific Inquiry Skills',
    subtopics: [{
      id: "communicating_science",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}, {
  id: 'stem_technology',
  name: '6. STEM & Technology Links',
  icon: '🤖',
  color: 'bg-cyan-50 border-cyan-200 text-cyan-900',
  topics: [{
    id: 'engineering_concepts',
    name: 'Engineering Concepts',
    icon: '🏗',
    domain: 'STEM & Technology',
    subtopics: [{
      id: "engineering_concepts",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'digital_science_skills',
    name: 'Digital Science Skills',
    icon: '💻',
    domain: 'STEM & Technology',
    subtopics: [{
      id: "digital_science_skills",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'sustainability',
    name: 'Sustainability & Environmental Science',
    icon: '♻',
    domain: 'STEM & Technology',
    subtopics: [{
      id: "sustainability",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}, {
  id: 'cross_curriculum',
  name: '7. Cross-Curriculum / Real-World Science',
  icon: '🧠',
  color: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900',
  topics: [{
    id: 'health_science',
    name: 'Health Science',
    icon: '🍎',
    domain: 'Cross-Curriculum',
    subtopics: [{
      id: "health_science",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'environmental_awareness',
    name: 'Environmental Awareness',
    icon: '🌲',
    domain: 'Cross-Curriculum',
    subtopics: [{
      id: "environmental_awareness",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'indigenous_science',
    name: 'Indigenous Science Perspectives',
    icon: '🪃',
    domain: 'Cross-Curriculum',
    subtopics: [{
      id: "indigenous_science",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}];

// ------------------------------------------------------------------
// HASS
// ------------------------------------------------------------------
export const hassDomains = [{
  id: 'history',
  name: '1. History',
  icon: '🌏',
  color: 'bg-amber-50 border-amber-200 text-amber-900',
  topics: [{
    id: 'ancient_history',
    name: 'Ancient History',
    icon: '🏺',
    domain: 'History',
    subtopics: [{
      id: "ancient_history",
      name: "General",
      resources: {
        display: [{
          type: "image",
          title: "AustralianFederationVocab",
          src: "/Displays/HASS/AustralianFederationVocab.png",
          extra: true
        }],
        learn: [{
          type: "pdf",
          title: "Alexander Unbroken",
          src: "/Unit Resources/HASS/Alexander_Unbroken_The_Life_of_Conquest.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "Attila Scourge and Sovereign",
          src: "/Unit Resources/HASS/Attila_Scourge_and_Sovereign.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "Caesar's Path to Empire",
          src: "/Unit Resources/HASS/Caesar_s_Path_to_Empire.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "Cleopatra Power Propaganda Legacy",
          src: "/Unit Resources/HASS/Cleopatra_Power_Propaganda_Legacy.pdf",
          extra: true
        }, {
          type: "pptx",
          title: "Historical Figures Presentations",
          src: "/Unit Resources/HASS/Historical Figures.pptx",
          extra: true
        }],
        practice: [{
          type: "pdf",
          title: "Bermuda Triangle Investigation",
          src: "/Unit Resources/HASS/Bermuda_Triangle_Investigation.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "Cross and Crescent War and Ideas",
          src: "/Unit Resources/HASS/Cross_and_Crescent_War_and_Ideas.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "Einstein Mind Matter Time",
          src: "/Unit Resources/HASS/Einstein_Mind_Matter_Time.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "Genghis Khan Architect of the Modern World",
          src: "/Unit Resources/HASS/Genghis_Khan_Architect_of_the_Modern_World.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "Joan of Arc The Maid Who Saved France",
          src: "/Unit Resources/HASS/Joan_of_Arc_The_Maid_Who_Saved_France.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "Pyramid Engineering Solved",
          src: "/Unit Resources/HASS/Pyramid_Engineering_Solved.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "The Black Death A Timeline of History",
          src: "/Unit Resources/HASS/The_Black_Death_A_Timeline_of_History.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "The French Revolution A World Transformed",
          src: "/Unit Resources/HASS/The_French_Revolution_A_World_Transformed.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "The Second World War 1939\u20131945",
          src: "/Unit Resources/HASS/The_Second_World_War_1939\u20131945.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "The Way of Confucius Endures",
          src: "/Unit Resources/HASS/The_Way_of_Confucius_Endures.pdf",
          extra: true
        }]
      }
    }]
  }, {
    id: 'australian_history',
    name: 'Australian History',
    icon: '🇦🇺',
    domain: 'History',
    subtopics: [{
      id: "australian_history",
      name: "General",
      resources: {
        display: [],
        learn: [{
          type: "pdf",
          title: "Australia Deep Time to Now",
          src: "/Unit Resources/HASS/Australia_Deep_Time_to_Now.pdf",
          extra: true
        }],
        practice: []
      }
    }]
  }, {
    id: 'wars_conflict',
    name: 'Wars & Conflict',
    icon: '⚔',
    domain: 'History',
    subtopics: [{
      id: "wars_conflict",
      name: "General",
      resources: {
        display: [],
        learn: [{
          type: "pdf",
          title: "World War I Timeline",
          src: "/Unit Resources/HASS/World_War_I_Timeline_From_Spark_to_Treaty.pdf",
          extra: true
        }, {
          type: "pdf",
          title: "The Second World War",
          src: "/Unit Resources/HASS/The_Second_World_War_1939-1945.pdf",
          extra: true
        }],
        practice: []
      }
    }]
  }, {
    id: 'local_history',
    name: 'Local History',
    icon: '🧭',
    domain: 'History',
    subtopics: [{
      id: "local_history",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'historical_skills',
    name: 'Historical Skills',
    icon: '👤',
    domain: 'History',
    subtopics: [{
      id: "historical_skills",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}, {
  id: 'geography',
  name: '2. Geography',
  icon: '🌍',
  color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  topics: [{
    id: 'physical_geography',
    name: 'Physical Geography',
    icon: '🌎',
    domain: 'Geography',
    subtopics: [{
      id: "physical_geography",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'weather_climate',
    name: 'Weather & Climate',
    icon: '🌦',
    domain: 'Geography',
    subtopics: [{
      id: "weather_climate",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'environmental_geography',
    name: 'Environmental Geography',
    icon: '🌱',
    domain: 'Geography',
    subtopics: [{
      id: "environmental_geography",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'human_geography',
    name: 'Human Geography',
    icon: '🗺',
    domain: 'Geography',
    subtopics: [{
      id: "human_geography",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'mapping_skills',
    name: 'Mapping Skills',
    icon: '🧭',
    domain: 'Geography',
    subtopics: [{
      id: "mapping_skills",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}, {
  id: 'civics_citizenship',
  name: '3. Civics & Citizenship',
  icon: '🏛',
  color: 'bg-blue-50 border-blue-200 text-blue-900',
  topics: [{
    id: 'government_democracy',
    name: 'Government & Democracy',
    icon: '🏫',
    domain: 'Civics & Citizenship',
    subtopics: [{
      id: "government_democracy",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'citizenship',
    name: 'Citizenship',
    icon: '👥',
    domain: 'Civics & Citizenship',
    subtopics: [{
      id: "citizenship",
      name: "General",
      resources: {
        display: [{
          type: "image",
          title: "Blue",
          src: "/Displays/Behaviour/Blue.png",
          extra: true
        }, {
          type: "image",
          title: "Colours",
          src: "/Displays/Behaviour/Colours.png",
          extra: true
        }, {
          type: "image",
          title: "Green",
          src: "/Displays/Behaviour/Green.png",
          extra: true
        }, {
          type: "image",
          title: "Red",
          src: "/Displays/Behaviour/Red.png",
          extra: true
        }, {
          type: "image",
          title: "Yellow",
          src: "/Displays/Behaviour/Yellow.png",
          extra: true
        }],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'justice_laws',
    name: 'Justice & Laws',
    icon: '⚖',
    domain: 'Civics & Citizenship',
    subtopics: [{
      id: "justice_laws",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'global_citizenship',
    name: 'Global Citizenship',
    icon: '🌐',
    domain: 'Civics & Citizenship',
    subtopics: [{
      id: "global_citizenship",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}, {
  id: 'economics_business',
  name: '4. Economics & Business',
  icon: '💰',
  color: 'bg-rose-50 border-rose-200 text-rose-900',
  topics: [{
    id: 'consumer_skills',
    name: 'Consumer Skills',
    icon: '💵',
    domain: 'Economics & Business',
    subtopics: [{
      id: "consumer_skills",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'business_basics',
    name: 'Business Basics',
    icon: '🛒',
    domain: 'Economics & Business',
    subtopics: [{
      id: "business_basics",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'financial_literacy',
    name: 'Financial Literacy',
    icon: '🏦',
    domain: 'Economics & Business',
    subtopics: [{
      id: "financial_literacy",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'trade_economy',
    name: 'Trade & Economy',
    icon: '🌍',
    domain: 'Economics & Business',
    subtopics: [{
      id: "trade_economy",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}, {
  id: 'culture_society',
  name: '5. Culture & Society',
  icon: '🌏',
  color: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  topics: [{
    id: 'cultural_studies',
    name: 'Cultural Studies',
    icon: '🌎',
    domain: 'Culture & Society',
    subtopics: [{
      id: "cultural_studies",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'communities',
    name: 'Communities',
    icon: '🏘',
    domain: 'Culture & Society',
    subtopics: [{
      id: "communities",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'family_identity',
    name: 'Family & Identity',
    icon: '👨‍👩‍👧',
    domain: 'Culture & Society',
    subtopics: [{
      id: "family_identity",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}, {
  id: 'inquiry_skills',
  name: '6. Inquiry Skills (HASS Skills)',
  icon: '🧠',
  color: 'bg-purple-50 border-purple-200 text-purple-900',
  topics: [{
    id: 'investigating',
    name: 'Investigating',
    icon: '🔍',
    domain: 'Inquiry Skills',
    subtopics: [{
      id: "investigating",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'analysing',
    name: 'Analysing',
    icon: '📊',
    domain: 'Inquiry Skills',
    subtopics: [{
      id: "analysing",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'communicating',
    name: 'Communicating',
    icon: '🗣',
    domain: 'Inquiry Skills',
    subtopics: [{
      id: "communicating",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}, {
  id: 'integrated_inquiry',
  name: '7. Integrated Inquiry Topics',
  icon: '🧩',
  color: 'bg-teal-50 border-teal-200 text-teal-900',
  topics: [{
    id: 'sustainability_projects',
    name: 'Sustainability Projects',
    icon: '♻',
    domain: 'Integrated Inquiry',
    subtopics: [{
      id: "sustainability_projects",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'leadership_community',
    name: 'Leadership & Community Projects',
    icon: '🤝',
    domain: 'Integrated Inquiry',
    subtopics: [{
      id: "leadership_community",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'global_issues',
    name: 'Global Issues',
    icon: '🌍',
    domain: 'Integrated Inquiry',
    subtopics: [{
      id: "global_issues",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}, {
  id: 'indigenous_perspectives',
  name: '8. Indigenous Perspectives',
  icon: '🇦🇺',
  color: 'bg-orange-50 border-orange-200 text-orange-900',
  topics: [{
    id: 'traditional_custodianship',
    name: 'Traditional Custodianship',
    icon: '🪃',
    domain: 'Indigenous Perspectives',
    subtopics: [{
      id: "traditional_custodianship",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'cultural_knowledge',
    name: 'Cultural Knowledge Systems',
    icon: '🌌',
    domain: 'Indigenous Perspectives',
    subtopics: [{
      id: "cultural_knowledge",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}, {
  id: 'future_focused',
  name: '9. Future-Focused HASS Topics',
  icon: '🚀',
  color: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900',
  topics: [{
    id: 'globalisation',
    name: 'Globalisation',
    icon: '🌐',
    domain: 'Future-Focused HASS',
    subtopics: [{
      id: "globalisation",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'digital_citizenship',
    name: 'Digital Citizenship',
    icon: '💻',
    domain: 'Future-Focused HASS',
    subtopics: [{
      id: "digital_citizenship",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }, {
    id: 'future_cities',
    name: 'Future Cities',
    icon: '🏙',
    domain: 'Future-Focused HASS',
    subtopics: [{
      id: "future_cities",
      name: "General",
      resources: {
        display: [],
        learn: [],
        practice: []
      }
    }]
  }]
}];

// Helper to lookup subject by id and return the data object
export const getCurriculumData = () => {
  return {
    english: englishDomains,
    mathematics: mathDomains,
    science: scienceDomains,
    hass: hassDomains
  };
};

/**
 * Helper to fetch a complete topic/subtopic object.
 * Finds the object matching the provided config identifiers.
 */
export const getTopicData = (subjectId, domainId, topicId) => {
  const allData = getCurriculumData();
  const domains = allData[subjectId];
  if (!domains) return null;
  const domain = domains.find(d => d.id === domainId);
  if (!domain) return null;
  const topic = domain.topics?.find(t => t.id === topicId);

  // Add the subject and domain metadata down if we found it
  if (topic) {
    return {
      ...topic,
      subjectId,
      domainId,
      domainName: domain.name
    };
  }
  return null;
};