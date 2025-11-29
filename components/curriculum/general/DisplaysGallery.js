"use client";

import React, { useEffect, useMemo, useState } from 'react';

const displayCategories = [
  {
    id: 'english',
    name: 'English',
    icon: '📚',
    description: 'Narrative structures, poetry, persuasive and informative writing supports.',
    folder: 'English',
    accent: 'from-purple-500 to-indigo-500',
    images: [
      { name: 'Fantasy Narratives', file: 'Fantasy Narratives.png' },
      { name: 'Science Fiction Narratives', file: 'SciFi Narratives.png' },
      { name: 'Persuasive Writing', file: 'Persuasive.png' },
      { name: 'Information Reports', file: 'InfoReports.png' },
      { name: 'Poetry', file: 'Poetry.png' }
    ]
  },
  {
    id: 'maths',
    name: 'Maths',
    icon: '🧮',
    description: 'Printable visuals to support numeracy lessons.',
    folder: 'Maths',
    accent: 'from-blue-500 to-cyan-500',
    images: [{ name: 'Integers', file: 'Integers.png' }]
  },
  {
    id: 'science',
    name: 'Science',
    icon: '🔬',
    description: 'Planets and solar system displays for inquiry learning.',
    folder: 'Science',
    accent: 'from-emerald-500 to-teal-500',
    images: [
      { name: 'Mercury', file: 'Mercury.png' },
      { name: 'Venus', file: 'Venus.png' },
      { name: 'Earth', file: 'Earth.png' },
      { name: 'Mars', file: 'Mars.png' },
      { name: 'Jupiter', file: 'Jupiter.png' },
      { name: 'Saturn', file: 'Saturn.png' },
      { name: 'Uranus', file: 'Uranus.png' },
      { name: 'Neptune', file: 'Neptune.png' },
      { name: 'Solar System', file: 'SolarSystem.png' }
    ]
  },
  {
    id: 'behaviour',
    name: 'Behaviour',
    icon: '🌈',
    description: 'Visual cues for classroom expectations and colour systems.',
    folder: 'Behaviour',
    accent: 'from-amber-500 to-rose-500',
    images: [
      { name: 'Blue', file: 'Blue.png' },
      { name: 'Green', file: 'Green.png' },
      { name: 'Yellow', file: 'Yellow.png' },
      { name: 'Red', file: 'Red.png' },
      { name: 'Colours', file: 'Colours.png' }
    ]
  },
  {
    id: 'games',
    name: 'Games',
    icon: '🎲',
    description: 'Brain breaks and energisers to display for students.',
    folder: 'Games',
    accent: 'from-pink-500 to-fuchsia-600',
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
];

const buildImageUrl = (folder, file) => `/Displays/${folder}/${encodeURIComponent(file)}`;

const DisplaysGallery = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(displayCategories[0].id);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        closeImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectedCategory = useMemo(
    () => displayCategories.find(category => category.id === selectedCategoryId) || displayCategories[0],
    [selectedCategoryId]
  );

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
                <div className="mt-3 text-xs text-slate-500 font-semibold">{category.images.length} displays</div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {selectedCategory.images.map(image => {
              const imageUrl = buildImageUrl(selectedCategory.folder, image.file);
              return (
                <div key={image.file} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300">
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
