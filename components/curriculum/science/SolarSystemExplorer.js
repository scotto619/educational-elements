import React, { useState } from 'react';
import styles from './SolarSystemExplorer.module.css';

const planetsData = [
  {
    id: 0,
    name: 'Mercury',
    className: styles.mercury,
    size: 12,
    distance: 90,
    speed: 5,
    desc: 'Smallest planet, closest to Sun.',
    facts: [
      'A Mercury year is only 88 Earth days.',
      'It experiences the largest day-night temperature swing in the solar system.',
      'Mercury has almost no atmosphere to trap heat.',
      'Its iron core takes up about 85% of the planet’s radius.'
    ]
  },
  {
    id: 1,
    name: 'Venus',
    className: styles.venus,
    size: 18,
    distance: 130,
    speed: 8,
    desc: 'Hottest planet due to thick atmosphere.',
    facts: [
      'Venus spins in the opposite direction compared to most planets.',
      'Its atmosphere is mostly carbon dioxide with clouds of sulfuric acid.',
      'A day on Venus lasts longer than a Venusian year.',
      'Surface temperatures can melt lead—over 850°F (450°C).'
    ]
  },
  {
    id: 2,
    name: 'Earth',
    className: styles.earth,
    size: 19,
    distance: 180,
    speed: 12,
    desc: 'Our home. Supports life.',
    facts: [
      'Earth is the only known planet with liquid water on the surface.',
      'About 71% of Earth is covered in oceans.',
      'The ozone layer shields us from harmful solar radiation.',
      'Earth’s magnetic field protects the planet from solar wind.'
    ]
  },
  {
    id: 3,
    name: 'Mars',
    className: styles.mars,
    size: 14,
    distance: 230,
    speed: 16,
    desc: 'The Red Planet.',
    facts: [
      'Home to the largest volcano, Olympus Mons.',
      'Mars has two small moons: Phobos and Deimos.',
      'Dust storms on Mars can cover the entire planet.',
      'Evidence suggests Mars once had flowing liquid water.'
    ]
  },
  {
    id: 4,
    name: 'Jupiter',
    className: styles.jupiter,
    size: 45,
    distance: 320,
    speed: 25,
    desc: 'Massive gas giant.',
    facts: [
      'Has the Great Red Spot, a storm bigger than Earth.',
      'Jupiter has at least 92 confirmed moons.',
      'Its magnetic field is the strongest of any planet in the solar system.',
      'Jupiter is mostly hydrogen and helium with no solid surface.'
    ]
  },
  {
    id: 5,
    name: 'Saturn',
    className: styles.saturn,
    size: 38,
    distance: 420,
    speed: 32,
    desc: 'Famous for its beautiful rings.',
    facts: [
      'Saturn’s rings are made of ice, rock, and dust.',
      'It is the least dense planet—low enough to float on water.',
      'Saturn has more than 140 known moons and moonlets.',
      'A hexagon-shaped jet stream sits at Saturn’s north pole.'
    ]
  },
  {
    id: 6,
    name: 'Uranus',
    className: styles.uranus,
    size: 28,
    distance: 510,
    speed: 40,
    desc: 'Rotates on its side.',
    facts: [
      'Uranus’s tilt is about 98 degrees, making it roll around the Sun.',
      'It has a faint ring system discovered in 1977.',
      'Winds can blow at over 500 mph (800 km/h).',
      'Uranus is one of the coldest planets, with temperatures near -371°F (-224°C).'
    ]
  },
  {
    id: 7,
    name: 'Neptune',
    className: styles.neptune,
    size: 28,
    distance: 600,
    speed: 45,
    desc: 'Windy and dark ice giant.',
    facts: [
      'Neptune has supersonic winds reaching 1,300 mph (2,100 km/h).',
      'It was the first planet located through mathematical prediction.',
      'Neptune’s moon Triton has geysers that may erupt nitrogen.',
      'Rain on Neptune might be made of diamonds deep inside the planet.'
    ]
  }
];

const SolarSystemExplorer = () => {
  const [activePlanet, setActivePlanet] = useState(null);

  const handlePlanetClick = (planet, event) => {
    event?.stopPropagation();
    setActivePlanet((current) => (current?.id === planet.id ? null : planet));
  };

  const handleClose = () => setActivePlanet(null);

  return (
    <div className={`${styles.appContainer} ${activePlanet ? styles.appPaused : ''}`}>
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
            <div>
              <strong>Fast facts:</strong>
              <ul className={styles.factList}>
                {activePlanet.facts.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </div>
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
