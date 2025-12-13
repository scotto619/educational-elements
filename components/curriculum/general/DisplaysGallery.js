"use client";

import React, { useEffect, useState } from 'react';

const displayCategories = [
  {
    id: 'english',
    name: 'English',
    icon: '📚',
    description: 'Narrative structures, poetry, persuasive and informative writing supports.',
    folder: 'English',
    accent: 'from-purple-500 to-indigo-500',
    sections: [
      {
        name: 'Letters',
        images: [
          { name: 'Alphabet Display', file: 'Alphabet/Alphabet.png' },
          { name: 'Letter A', file: 'Alphabet/A.png' },
          { name: 'Letter B', file: 'Alphabet/B.png' },
          { name: 'Letter C', file: 'Alphabet/C.png' },
          { name: 'Letter D', file: 'Alphabet/D.png' },
          { name: 'Letter E', file: 'Alphabet/E.png' },
          { name: 'Letter F', file: 'Alphabet/F.png' },
          { name: 'Letter G', file: 'Alphabet/G.png' },
          { name: 'Letter H', file: 'Alphabet/H.png' },
          { name: 'Letter I', file: 'Alphabet/I.png' },
          { name: 'Letter J', file: 'Alphabet/J.png' },
          { name: 'Letter K', file: 'Alphabet/K.png' },
          { name: 'Letter L', file: 'Alphabet/L.png' },
          { name: 'Letter M', file: 'Alphabet/M.png' },
          { name: 'Letter N', file: 'Alphabet/N.png' },
          { name: 'Letter O', file: 'Alphabet/O.png' },
          { name: 'Letter P', file: 'Alphabet/P.png' },
          { name: 'Letter Q', file: 'Alphabet/Q.png' },
          { name: 'Letter R', file: 'Alphabet/R.png' },
          { name: 'Letter S', file: 'Alphabet/S.png' },
          { name: 'Letter T', file: 'Alphabet/T.png' },
          { name: 'Letter U', file: 'Alphabet/U.png' },
          { name: 'Letter V', file: 'Alphabet/V.png' },
          { name: 'Letter W', file: 'Alphabet/W.png' },
          { name: 'Letter X', file: 'Alphabet/X.png' },
          { name: 'Letter Y', file: 'Alphabet/Y.png' },
          { name: 'Letter Z', file: 'Alphabet/Z.png' }
        ]
      },
      {
        name: 'Alphabet Eye Spy',
        images: [
          { name: 'Eye Spy - A', file: 'Alphabet/EyeSpy/A.png' },
          { name: 'Eye Spy - B', file: 'Alphabet/EyeSpy/B.png' },
          { name: 'Eye Spy - C', file: 'Alphabet/EyeSpy/C.png' },
          { name: 'Eye Spy - D', file: 'Alphabet/EyeSpy/D.png' },
          { name: 'Eye Spy - E', file: 'Alphabet/EyeSpy/E.png' },
          { name: 'Eye Spy - F', file: 'Alphabet/EyeSpy/F.png' },
          { name: 'Eye Spy - G', file: 'Alphabet/EyeSpy/G.png' }
        ]
      },
      {
        name: 'Spelling',
        images: [
          { name: 'Spelling - Chunking', file: 'Spelling/Chunking.png' },
          { name: 'Spelling - Letter Sounds', file: 'Spelling/LetterSound.png' },
          { name: 'Spelling - Phonetic Strategies', file: 'Spelling/Phonetic Strategies.png' },
          { name: 'Spelling - Rhyming', file: 'Spelling/Rhyming.png' },
          { name: 'Spelling - Sound It Out', file: 'Spelling/SoundItOut.png' }
        ]
      },
      {
        name: 'Phonics Blends & Digraphs',
        images: [
          { name: 'BL Blend', file: 'Phonics/BL.png' },
          { name: 'BL Story', file: 'Phonics/BL Story.png' },
          { name: 'BR Blend', file: 'Phonics/BR.png' },
          { name: 'BR Story', file: 'Phonics/BR Story.png' },
          { name: 'CH Digraph', file: 'Phonics/CH.png' },
          { name: 'CL Blend', file: 'Phonics/CL.png' },
          { name: 'CR Blend', file: 'Phonics/CR.png' },
          { name: 'DR Blend', file: 'Phonics/DR.png' },
          { name: 'FL Blend', file: 'Phonics/FL.png' },
          { name: 'FR Blend', file: 'Phonics/FR.png' },
          { name: 'GL Blend', file: 'Phonics/GL.png' },
          { name: 'GR Blend', file: 'Phonics/GR.png' },
          { name: 'PL Blend', file: 'Phonics/PL.png' },
          { name: 'PR Blend', file: 'Phonics/PR.png' },
          { name: 'SC Blend', file: 'Phonics/SC.png' },
          { name: 'SCR Blend', file: 'Phonics/SCR.png' },
          { name: 'SH Digraph', file: 'Phonics/SH.png' },
          { name: 'SH Story', file: 'Phonics/SH Story.png' },
          { name: 'SK Blend', file: 'Phonics/SK.png' },
          { name: 'SL Blend', file: 'Phonics/SL.png' },
          { name: 'SM Blend', file: 'Phonics/SM.png' },
          { name: 'SN Blend', file: 'Phonics/SN.png' },
          { name: 'SP Blend', file: 'Phonics/SP.png' },
          { name: 'SPL Blend', file: 'Phonics/SPL.png' },
          { name: 'SPR Blend', file: 'Phonics/SPR.png' },
          { name: 'ST Blend', file: 'Phonics/ST.png' },
          { name: 'STR Blend', file: 'Phonics/STR.png' },
          { name: 'SW Blend', file: 'Phonics/SW.png' },
          { name: 'TH Digraph', file: 'Phonics/TH.png' },
          { name: 'TR Blend', file: 'Phonics/TR.png' },
          { name: 'WH Digraph', file: 'Phonics/WH.png' }
        ]
      },
      {
        name: 'Writing Genres',
        images: [
          { name: 'Fantasy Narratives', file: 'Writing/Fantasy Narratives.png' },
          { name: 'Information Reports', file: 'Writing/InfoReports.png' },
          { name: 'Poetry', file: 'Writing/Poetry.png' },
          { name: 'Recount Writing', file: 'Writing/Recount.png' },
          { name: 'Science Fiction Narratives', file: 'Writing/SciFi Narratives.png' }
        ]
      },
      {
        name: 'Literary Devices',
        images: [
          { name: 'Characterisation', file: 'Writing/Literary Devices/Characterisation.png' },
          { name: 'Imagery', file: 'Writing/Literary Devices/Imagery.png' },
          { name: 'Literary Devices Overview', file: 'Writing/Literary Devices/Literary Devices.png' },
          { name: 'Metaphors', file: 'Writing/Literary Devices/Metaphors.png' },
          { name: 'Personification', file: 'Writing/Literary Devices/Personification.png' },
          { name: 'Setting', file: 'Writing/Literary Devices/Setting.png' },
          { name: 'Similes', file: 'Writing/Literary Devices/Similes.png' },
          { name: 'Symbolism', file: 'Writing/Literary Devices/Symbolism.png' }
        ]
      },
      {
        name: 'Book Review Writing',
        images: [
          { name: 'Book Review', file: 'Writing/Book Review/Book Review.png' },
          { name: 'Review Body 1', file: 'Writing/Book Review/Review Body 1.png' },
          { name: 'Review Body 2', file: 'Writing/Book Review/Review Body 2.png' },
          { name: 'Review Body 3', file: 'Writing/Book Review/Review Body 3.png' },
          { name: 'Review Checklist', file: 'Writing/Book Review/Review Checklist.png' },
          { name: 'Review Conclusion', file: 'Writing/Book Review/Review Conclusion.png' },
          { name: 'Review Draft', file: 'Writing/Book Review/Review Draft.png' },
          { name: 'Review Editing', file: 'Writing/Book Review/Review Editing.png' },
          { name: 'Review Introduction', file: 'Writing/Book Review/Review Introduction.png' },
          { name: 'Review Preparation', file: 'Writing/Book Review/Review Preperation.png' },
          { name: 'Review Structure', file: 'Writing/Book Review/Review Structure.png' }
        ]
      },
      {
        name: 'Persuasive Writing',
        images: [
          { name: 'Persuasive Display', file: 'Writing/Persuasive/Persuasive.png' },
          { name: 'Persuasive Checklist', file: 'Writing/Persuasive/Persuasive Checklist.png' },
          { name: 'Persuasive Devices', file: 'Writing/Persuasive/Persuasive Devices.png' },
          { name: 'Persuasive Elements', file: 'Writing/Persuasive/Persuasive Elements.png' },
          { name: 'Persuasive Structure', file: 'Writing/Persuasive/Persuasive Structure.png' }
        ]
      }
    ]
  },
  {
    id: 'maths',
    name: 'Maths',
    icon: '🧮',
    description: 'Printable visuals to support numeracy lessons.',
    folder: 'Maths',
    accent: 'from-blue-500 to-cyan-500',
    sections: [
      {
        name: 'Number & Operations',
        images: [
          { name: 'Addition', file: 'Addition.png' },
          { name: 'Division', file: 'Division.png' },
          { name: 'Integers', file: 'Integers.png' },
          { name: 'Multiplication', file: 'Multiplication.png' },
          { name: 'Subtraction', file: 'Subtraction.png' }
        ]
      },
      {
        name: 'Fractions',
        images: [{ name: 'Comparing Fractions', file: 'ComparingFractions.png' }]
      },
      {
        name: 'Shapes & Transformations',
        images: [
          { name: '2D Shapes', file: '2D Shapes.png' },
          { name: '3D Shapes', file: '3D Shapes.png' },
          { name: 'Flip', file: 'Flip.png' },
          { name: 'Flip Turn Slide', file: 'FlipTurnSlide.png' },
          { name: 'Tessellating Patterns', file: 'TessellatingPaterns.png' },
          { name: 'Slide', file: 'Slide.png' },
          { name: 'Symmetry', file: 'Symmetry.png' },
          { name: 'Turn', file: 'Turn.png' }
        ]
      },
      {
        name: 'Measurement',
        images: [
          { name: 'Length', file: 'Length.png' },
          { name: 'Mass', file: 'Mass.png' },
          { name: 'Volume', file: 'Volume.png' }
        ]
      }
    ]
  },
  {
    id: 'science',
    name: 'Science',
    icon: '🔬',
    description: 'Planets and solar system displays for inquiry learning.',
    folder: 'Science',
    accent: 'from-emerald-500 to-teal-500',
    sections: [
      {
        name: 'Experiments',
        images: [
          { name: 'Bottle Rocket Experiment', file: 'Experiments/Bottle Rocket.png' },
          { name: 'Elephant Toothpaste Experiment', file: 'Experiments/Elephant Toothpaste.png' }
        ]
      },
      {
        name: 'Space',
        images: [
          { name: 'Earth', file: 'Space/Earth.png' },
          { name: 'Jupiter', file: 'Space/Jupiter.png' },
          { name: 'Mars', file: 'Space/Mars.png' },
          { name: 'Mercury', file: 'Space/Mercury.png' },
          { name: 'Neptune', file: 'Space/Neptune.png' },
          { name: 'Saturn', file: 'Space/Saturn.png' },
          { name: 'Solar System', file: 'Space/SolarSystem.png' },
          { name: 'Space Vocabulary', file: 'Space/SpaceVocab.png' },
          { name: 'Uranus', file: 'Space/Uranus.png' },
          { name: 'Venus', file: 'Space/Venus.png' }
        ]
      },
      {
        name: 'Environmental Change',
        images: [{ name: 'Environmental Change Vocabulary', file: 'EnvironmentalChange/EnvironmentalChangeVocab.png' }]
      }
    ]
  },
  {
    id: 'hass',
    name: 'HASS',
    icon: '🧭',
    description: 'Humanities displays and vocabulary to support inquiry units.',
    folder: 'HASS',
    accent: 'from-orange-500 to-amber-500',
    sections: [
      {
        name: 'Vocabulary',
        images: [{ name: 'Australian Federation Vocabulary', file: 'AustralianFederationVocab.png' }]
      }
    ]
  },
  {
    id: 'behaviour',
    name: 'Behaviour',
    icon: '🌈',
    description: 'Visual cues for classroom expectations and colour systems.',
    folder: 'Behaviour',
    accent: 'from-amber-500 to-rose-500',
    sections: [
      {
        name: 'Behaviour Cues',
        images: [
          { name: 'Blue', file: 'Blue.png' },
          { name: 'Colours', file: 'Colours.png' },
          { name: 'Green', file: 'Green.png' },
          { name: 'Red', file: 'Red.png' },
          { name: 'Yellow', file: 'Yellow.png' }
        ]
      }
    ]
  },
  {
    id: 'games',
    name: 'Games',
    icon: '🎲',
    description: 'Brain breaks and energisers to display for students.',
    folder: 'Games',
    accent: 'from-pink-500 to-fuchsia-600',
    sections: [
      {
        name: 'Brain Breaks',
        images: [
          { name: '20 Questions', file: '20Questions.png' },
          { name: 'Two Truths', file: '2truths.png' },
          { name: 'Bang', file: 'Bang.png' },
          { name: "Captain's Orders", file: 'CaptainsOrders.png' },
          { name: 'Celebrity Heads', file: 'CelebrityHeads.png' },
          { name: 'Corners', file: 'Corners.png' },
          { name: 'Fruit Salad', file: 'FruitSalad.png' },
          { name: 'Heads Down Thumbs Up', file: 'HeadsDownThumbsUp.png' },
          { name: 'Human Knot', file: 'HumanKnot.png' },
          { name: 'Musical Statues', file: 'Musical Statues.png' },
          { name: 'One Word', file: 'OneWord.png' },
          { name: 'PSR', file: 'PSR.png' },
          { name: 'Secret Leader', file: 'SecretLeader.png' },
          { name: 'Sharks and Minnows', file: 'SharksandMinnows.png' },
          { name: 'Silent Ball', file: 'Silent Ball.png' },
          { name: 'Sleepy Spy', file: 'SleepySpy.png' }
        ]
      }
    ]
  }
];

const buildImageUrl = (folder, file) => {
  const encodedPath = file
    .split('/')
    .map(part => encodeURIComponent(part))
    .join('/');
  return `/Displays/${folder}/${encodedPath}`;
};

const DisplaysGallery = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(displayCategories[0].id);
  const [selectedImage, setSelectedImage] = useState(null);

  const getCategoryImageCount = category =>
    category.sections?.reduce((total, section) => total + section.images.length, 0) || 0;

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        closeImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedCategory = displayCategories.find(category => category.id === selectedCategoryId) || displayCategories[0];
  const sortedSections = selectedCategory.sections?.map(section => ({
    ...section,
    images: [...section.images].sort((a, b) => a.name.localeCompare(b.name))
  }));

  const openImage = image => {
    setSelectedImage({ ...image, categoryFolder: selectedCategory.folder, categoryName: selectedCategory.name });
  };

  const closeImage = () => setSelectedImage(null);

  const handlePrint = image => {
    const folder = image.categoryFolder || selectedCategory.folder;
    const imageUrl = buildImageUrl(folder, image.file);
    const printWindow = window.open('', '_blank', 'width=900,height=1200');

    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Display - ${image.name}</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
            img { max-width: 100%; max-height: 100%; }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" alt="${image.name}" />
          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-3xl font-bold flex items-center gap-3">
              <span>🖼️</span>
              Classroom Displays
            </h3>
            <p className="text-white/90 max-w-2xl">
              Choose a category to quickly preview, enlarge, or print the ready-made display posters for your classroom.
            </p>
          </div>
          <div className="bg-white/15 border border-white/20 rounded-full px-4 py-2 text-sm flex items-center gap-2">
            <span className="text-yellow-200">✨</span>
            <span>Tap a display to view fullscreen or print directly.</span>
          </div>
        </div>
      </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {displayCategories.map(category => {
            const isActive = category.id === selectedCategoryId;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategoryId(category.id)}
                className={`p-4 rounded-xl border transition-all duration-300 text-left shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                  isActive ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white'
                }`}
                aria-pressed={isActive}
              >
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${category.accent} flex items-center justify-center text-2xl mb-3`}
                  aria-hidden
                >
                  {category.icon}
                </div>
                <h4 className="font-bold text-slate-800 text-lg mb-1">{category.name}</h4>
                <p className="text-sm text-slate-600 leading-snug">{category.description}</p>
                <div className="mt-3 text-xs text-slate-500 font-semibold">{getCategoryImageCount(category)} displays</div>
              </button>
            );
          })}
        </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <p className="text-xs uppercase text-slate-500 font-semibold">Selected Category</p>
            <h4 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span>{selectedCategory.icon}</span>
              {selectedCategory.name}
            </h4>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
            <span className="text-lg">🖨️</span>
            <span>Print from any card or fullscreen view</span>
          </div>
        </div>

        <div className="space-y-8">
          {sortedSections?.map(section => (
            <div key={section.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-lg font-semibold text-slate-800">{section.name}</h5>
                <span className="text-xs font-semibold text-slate-500">{section.images.length} items</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {section.images.map(image => {
                  const imageUrl = buildImageUrl(selectedCategory.folder, image.file);
                  return (
                    <div
                      key={image.file}
                      className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                      <button
                        type="button"
                        className="relative group cursor-pointer w-full"
                        onClick={() => openImage(image)}
                        aria-label={`Open ${image.name} in fullscreen`}
                      >
                        <img src={imageUrl} alt={image.name} className="w-full h-56 object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-semibold">
                          View Fullscreen
                        </div>
                      </button>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <h5 className="font-bold text-slate-800">{image.name}</h5>
                          <p className="text-sm text-slate-600">Tap to enlarge or print</p>
                        </div>
                        <button
                          onClick={() => handlePrint(image)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                          🖨️ Print
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeImage}
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedImage.name} fullscreen preview`}
          >
            <div
              className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-5xl w-full relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
                <div>
                  <p className="text-xs uppercase text-slate-500 font-semibold">{selectedImage.categoryName}</p>
                  <h5 className="text-xl font-bold text-slate-800">{selectedImage.name}</h5>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePrint(selectedImage)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow"
                  >
                    🖨️ Print
                  </button>
                  <button
                    onClick={closeImage}
                    className="px-3 py-2 rounded-full bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
                    aria-label="Close fullscreen view"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>
              <div className="bg-slate-900 flex items-center justify-center p-4">
                <img
                  src={buildImageUrl(selectedImage.categoryFolder, selectedImage.file)}
                  alt={selectedImage.name}
                  className="max-h-[75vh] max-w-full rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default DisplaysGallery;
