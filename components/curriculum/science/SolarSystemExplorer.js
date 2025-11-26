import React, { useState } from 'react';
import styles from './SolarSystemExplorer.module.css';

const planetsData = [
  { id: 0, name: 'Mercury', className: styles.mercury, size: 12, distance: 90, speed: 5, desc: 'Smallest planet, closest to Sun.', fact: 'A year is only 88 Earth days.' },
  { id: 1, name: 'Venus', className: styles.venus, size: 18, distance: 130, speed: 8, desc: 'Hottest planet due to thick atmosphere.', fact: 'Spins in the opposite direction.' },
  { id: 2, name: 'Earth', className: styles.earth, size: 19, distance: 180, speed: 12, desc: 'Our home. Supports life.', fact: 'Only planet with liquid water on surface.' },
  { id: 3, name: 'Mars', className: styles.mars, size: 14, distance: 230, speed: 16, desc: 'The Red Planet.', fact: 'Home to the largest volcano, Olympus Mons.' },
  { id: 4, name: 'Jupiter', className: styles.jupiter, size: 45, distance: 320, speed: 25, desc: 'Massive gas giant.', fact: 'Has over 75 moons.' },
  { id: 5, name: 'Saturn', className: styles.saturn, size: 38, distance: 420, speed: 32, desc: 'Famous for its beautiful rings.', fact: 'Could float in a bathtub of water.' },
  { id: 6, name: 'Uranus', className: styles.uranus, size: 28, distance: 510, speed: 40, desc: 'Rotates on its side.', fact: 'Coldest planetary atmosphere.' },
  { id: 7, name: 'Neptune', className: styles.neptune, size: 28, distance: 600, speed: 45, desc: 'Windy and dark ice giant.', fact: 'Rain there might be made of diamonds.' }
];

const SolarSystemExplorer = () => {
  const [activePlanet, setActivePlanet] = useState(null);

  const handlePlanetClick = (planet, event) => {
    event?.stopPropagation();
    setActivePlanet((current) => (current?.id === planet.id ? null : planet));
  };

  const handleClose = () => setActivePlanet(null);

  return (
    <div className={`${styles.appContainer} ${activePlanet ? styles.paused : ''}`}>
      <div className={styles.solarSystemView} onClick={handleClose}>
        <div className={styles.stars} />
        <div className={styles.sun} title="The Sun" />

        {planetsData.map((planet) => (
          <React.Fragment key={planet.id}>
            <div
              className={styles.orbitRing}
              style={{
                width: planet.distance * 2,
                height: planet.distance * 2
              }}
            />
            <div
              className={styles.planetOrbitContainer}
              style={{
                width: planet.distance * 2,
                height: planet.distance * 2,
                animationDuration: `${planet.speed}s`,
                zIndex: planet.id + 10
              }}
            >
              <div
                className={`${styles.planetVisual} ${planet.className}`}
                onClick={(event) => handlePlanetClick(planet, event)}
                style={{
                  width: planet.size,
                  height: planet.size,
                  transform: activePlanet?.id === planet.id ? 'translate(-50%, -50%) scale(1.5)' : undefined,
                  boxShadow: activePlanet?.id === planet.id ? '0 0 20px white' : undefined
                }}
              />
            </div>
          </React.Fragment>
        ))}
      </div>

      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <p className={styles.sidebarLabel}>Curriculum · Science</p>
          <h2>Solar Explorer</h2>
          <p className={styles.sidebarIntro}>
            Watch the planets orbit the sun and click any world to freeze its path and reveal a space fact.
          </p>
        </div>

        <ul className={styles.planetList}>
          {planetsData.map((planet) => (
            <li
              key={planet.id}
              className={`${styles.planetListItem} ${activePlanet?.id === planet.id ? styles.active : ''}`}
              onClick={() => handlePlanetClick(planet)}
            >
              <div className={`${styles.thumbVisual} ${planet.className}`} />
              <div className={styles.listInfo}>
                <span className={styles.listName}>{planet.name}</span>
                <span className={styles.listDesc}>{planet.desc}</span>
              </div>
            </li>
          ))}
        </ul>

        {activePlanet ? (
          <div className={styles.infoOverlay}>
            <h3>{activePlanet.name}</h3>
            <p>
              <strong>Fact:</strong> {activePlanet.fact}
            </p>
            <p>
              <strong>Orbit Speed:</strong> Takes {activePlanet.speed} seconds (in this model).
            </p>
            <button type="button" onClick={handleClose} className={styles.resumeButton}>
              Resume Orbit
            </button>
          </div>
        ) : (
          <div className={styles.helperText}>
            Click a planet in the view or the list to learn more.
          </div>
        )}
      </div>
    </div>
  );
};

export default SolarSystemExplorer;
