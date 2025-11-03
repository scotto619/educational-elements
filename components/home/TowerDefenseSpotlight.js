import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const TowerDefenseGamePreview = dynamic(() => import('../games/TowerDefenseGame'), {
  ssr: false
});

const FeatureBullet = ({ icon, title, description }) => (
  <div className="flex items-start space-x-3">
    <div className="text-2xl">{icon}</div>
    <div>
      <div className="font-semibold text-white">{title}</div>
      <div className="text-sm text-indigo-100">{description}</div>
    </div>
  </div>
);

const TowerDefenseSpotlight = () => (
  <section className="py-16 md:py-24 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              🏰 Tower Defense Legends
            </h2>
            <p className="mt-3 text-base md:text-lg text-indigo-100">
              Build a Bloons-style defense using real avatars, pets, and Hero Forge weapons from your classroom. Drag heroes onto the track, pop enchanted relics, and push to higher waves for endless replayability.
            </p>
          </div>
          <div className="space-y-4 bg-white/10 rounded-2xl p-5 border border-white/10">
            <FeatureBullet
              icon="🧙"
              title="Classroom Champions"
              description="Every defender is a classroom avatar paired with their favorite pet. Mix and match heroes to create clutch lane coverage."
            />
            <FeatureBullet
              icon="⚔️"
              title="Hero Forge Projectiles"
              description="Projectiles use the exact Hero Forge weapon art your students unlock—bows pierce, gauntlets slow, and tridents ignite splash damage."
            />
            <FeatureBullet
              icon="🌀"
              title="Animated Bloon Lanes"
              description="Relics stream down twisting paths with health bars and effects, delivering a true Bloons-style feel that keeps students glued to the action."
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/student"
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold shadow-lg shadow-emerald-500/30 transition"
            >
              Launch in Student Portal →
            </Link>
            <Link
              href="#games"
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20"
            >
              Explore All Games
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-indigo-100">
            <div>
              <div className="text-3xl font-bold text-white">3</div>
              <div className="uppercase tracking-wider text-xs">Difficulty Modes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">∞</div>
              <div className="uppercase tracking-wider text-xs">Replay Combinations</div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-6 border border-indigo-100">
            <TowerDefenseGamePreview demoMode storageKeySuffix="homepage" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default TowerDefenseSpotlight;
