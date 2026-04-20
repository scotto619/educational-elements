/**
 * PlayerSprite.tsx
 *
 * Inline SVG character with true 4-directional facing.
 * No external art assets required — swap in real sprite images later
 * by replacing the SVG contents with an <image href="..."> tag.
 *
 * Directions:
 *   down  → front view (facing toward viewer)
 *   up    → back view  (facing away)
 *   right → right-side profile
 *   left  → right-side profile, mirrored via scaleX(-1)
 */

import React from 'react';

type Facing = 'up' | 'down' | 'left' | 'right';
type SpriteType = 'man' | 'woman';

interface PlayerSpriteProps {
  facing: Facing;
  sprite: SpriteType;
  size?: number;
  isRelaxing?: boolean;
}

// ─── Colour palette ───────────────────────────────────────────────────────────
const C = {
  skin:       '#f5c5a3',
  skinDark:   '#e8a875',  // ear / nose shadow
  hairMan:    '#3e2723',
  hairWoman:  '#e8b84b',
  shirtMan:   '#5b8dd9',
  shirtWoman: '#f06292',
  pants:      '#546e7a',
  skirt:      '#9c6fbc',
  shoes:      '#4e342e',
  eye:        '#2c1810',
  blush:      '#f48fb1',
};

// ─── Front view (facing toward the player / "down") ──────────────────────────
function Front({ sprite }: { sprite: SpriteType }) {
  const shirt     = sprite === 'man' ? C.shirtMan  : C.shirtWoman;
  const pants     = sprite === 'man' ? C.pants     : C.skirt;
  const hairColor = sprite === 'man' ? C.hairMan   : C.hairWoman;

  return (
    <>
      {/* Shadow */}
      <ellipse cx="20" cy="54" rx="10" ry="3" fill="black" fillOpacity="0.14" />

      {/* Shoes */}
      <rect x="10" y="47" width="8"  height="5" rx="2.5" fill={C.shoes} />
      <rect x="22" y="47" width="8"  height="5" rx="2.5" fill={C.shoes} />

      {/* Legs */}
      <rect className="leg-left"  x="11" y="36" width="7" height="13" rx="2" fill={pants} />
      <rect className="leg-right" x="22" y="36" width="7" height="13" rx="2" fill={pants} />

      {/* Woman skirt */}
      {sprite === 'woman' && (
        <path d="M 10,36 L 30,36 L 33,49 L 7,49 Z" fill={C.skirt} fillOpacity="0.92" />
      )}

      {/* Body */}
      <rect x="10" y="24" width="20" height="14" rx="4" fill={shirt} />

      {/* Left arm */}
      <rect className="arm-left"  x="3"  y="24" width="8" height="11" rx="3.5" fill={shirt} />
      <circle cx="7"  cy="35" r="3" fill={C.skin} />

      {/* Right arm */}
      <rect className="arm-right" x="29" y="24" width="8" height="11" rx="3.5" fill={shirt} />
      <circle cx="33" cy="35" r="3" fill={C.skin} />

      {/* Neck */}
      <rect x="17" y="22" width="6" height="5" rx="1.5" fill={C.skin} />

      {/* Head */}
      <circle cx="20" cy="13" r="10.5" fill={C.skin} />

      {/* Hair */}
      <path
        d="M 9.5,15 A 10.5,10.5 0 0,1 30.5,15 Q 28,1 20,0.5 Q 12,1 9.5,15 Z"
        fill={hairColor}
      />
      {/* Woman side hair */}
      {sprite === 'woman' && (
        <>
          <ellipse cx="10"  cy="21" rx="3.5" ry="7" fill={hairColor} />
          <ellipse cx="30"  cy="21" rx="3.5" ry="7" fill={hairColor} />
        </>
      )}

      {/* Eyes — white base */}
      <ellipse cx="15.5" cy="13" rx="2.2" ry="2.2" fill="white" />
      <ellipse cx="24.5" cy="13" rx="2.2" ry="2.2" fill="white" />
      {/* Irises */}
      <circle cx="15.8" cy="13.4" r="1.4" fill={C.eye} />
      <circle cx="24.8" cy="13.4" r="1.4" fill={C.eye} />
      {/* Shine */}
      <circle cx="16.3" cy="12.8" r="0.5" fill="white" />
      <circle cx="25.3" cy="12.8" r="0.5" fill="white" />

      {/* Nose */}
      <ellipse cx="20" cy="16.5" rx="1.3" ry="0.9" fill={C.skinDark} fillOpacity="0.55" />

      {/* Smile */}
      <path
        d="M 16.5,18.5 Q 20,21 23.5,18.5"
        stroke="#c07060" strokeWidth="1.3" fill="none" strokeLinecap="round"
      />

      {/* Blush (woman) */}
      {sprite === 'woman' && (
        <>
          <ellipse cx="13.5" cy="16" rx="2.5" ry="1.5" fill={C.blush} fillOpacity="0.38" />
          <ellipse cx="26.5" cy="16" rx="2.5" ry="1.5" fill={C.blush} fillOpacity="0.38" />
        </>
      )}
    </>
  );
}

// ─── Back view (facing away from player / "up") ───────────────────────────────
function Back({ sprite }: { sprite: SpriteType }) {
  const shirt     = sprite === 'man' ? '#4a7bc0' : '#d0547a'; // slightly darker back-faces
  const pants     = sprite === 'man' ? '#455a64' : '#7b4fa0';
  const hairColor = sprite === 'man' ? C.hairMan  : C.hairWoman;

  return (
    <>
      {/* Shadow */}
      <ellipse cx="20" cy="54" rx="10" ry="3" fill="black" fillOpacity="0.14" />

      {/* Shoes */}
      <rect x="10" y="47" width="8" height="5" rx="2.5" fill={C.shoes} />
      <rect x="22" y="47" width="8" height="5" rx="2.5" fill={C.shoes} />

      {/* Legs */}
      <rect className="leg-left"  x="11" y="36" width="7" height="13" rx="2" fill={pants} />
      <rect className="leg-right" x="22" y="36" width="7" height="13" rx="2" fill={pants} />

      {/* Woman skirt */}
      {sprite === 'woman' && (
        <path d="M 10,36 L 30,36 L 33,49 L 7,49 Z" fill={C.skirt} fillOpacity="0.85" />
      )}

      {/* Body */}
      <rect x="10" y="24" width="20" height="14" rx="4" fill={shirt} />

      {/* Arms */}
      <rect className="arm-left"  x="3"  y="24" width="8" height="11" rx="3.5" fill={shirt} />
      <circle cx="7"  cy="35" r="3" fill={C.skin} />
      <rect className="arm-right" x="29" y="24" width="8" height="11" rx="3.5" fill={shirt} />
      <circle cx="33" cy="35" r="3" fill={C.skin} />

      {/* Neck */}
      <rect x="17" y="22" width="6" height="5" rx="1.5" fill={C.skin} />

      {/* Head (back — skin with hair covering most of it) */}
      <circle cx="20" cy="13" r="10.5" fill={C.skin} />

      {/* Hair — covers back of head more fully */}
      <path
        d="M 9.5,16 A 10.5,10.5 0 0,1 30.5,16 Q 30,0 20,0.5 Q 10,0 9.5,16 Z"
        fill={hairColor}
      />
      <ellipse cx="20" cy="20" rx="10.5" ry="5.5" fill={hairColor} />

      {/* Woman: visible side hair + ponytail */}
      {sprite === 'woman' && (
        <>
          <ellipse cx="10" cy="22" rx="3.5" ry="8" fill={hairColor} />
          <ellipse cx="30" cy="22" rx="3.5" ry="8" fill={hairColor} />
          {/* Ponytail */}
          <rect x="17.5" y="24" width="5" height="11" rx="2.5" fill={hairColor} fillOpacity="0.85" />
          <ellipse cx="20" cy="36" rx="3" ry="2" fill={hairColor} fillOpacity="0.6" />
        </>
      )}
    </>
  );
}

// ─── Side view (right profile; App mirrors it for left) ───────────────────────
function Side({ sprite }: { sprite: SpriteType }) {
  const shirt     = sprite === 'man' ? C.shirtMan  : C.shirtWoman;
  const pants     = sprite === 'man' ? C.pants     : C.skirt;
  const hairColor = sprite === 'man' ? C.hairMan   : C.hairWoman;

  return (
    <>
      {/* Shadow */}
      <ellipse cx="19" cy="54" rx="8" ry="3" fill="black" fillOpacity="0.14" />

      {/* Back shoe */}
      <rect x="11" y="47" width="9" height="4" rx="2" fill={C.shoes} fillOpacity="0.65" />
      {/* Front shoe */}
      <rect x="14" y="47" width="10" height="5" rx="2.5" fill={C.shoes} />

      {/* Back leg */}
      <rect className="leg-left"  x="12" y="36" width="7" height="13" rx="2" fill={pants} fillOpacity="0.72" />
      {/* Front leg */}
      <rect className="leg-right" x="16" y="36" width="7" height="13" rx="2" fill={pants} />

      {/* Woman skirt side */}
      {sprite === 'woman' && (
        <path d="M 10,36 L 27,36 L 28,49 L 9,49 Z" fill={C.skirt} fillOpacity="0.9" />
      )}

      {/* Body (narrower side-on) */}
      <rect x="12" y="24" width="15" height="14" rx="4" fill={shirt} />

      {/* Back arm */}
      <rect className="arm-left"  x="10" y="25" width="7" height="10" rx="3" fill={shirt} fillOpacity="0.65" />
      {/* Front arm */}
      <rect className="arm-right" x="24" y="24" width="7" height="11" rx="3" fill={shirt} />
      <circle cx="27.5" cy="35" r="3" fill={C.skin} />

      {/* Neck */}
      <rect x="17" y="22" width="5" height="5" rx="1.5" fill={C.skin} />

      {/* Head */}
      <circle cx="20" cy="13" r="10.5" fill={C.skin} />

      {/* Ear */}
      <ellipse cx="10" cy="13" rx="2.8" ry="3.2" fill={C.skin} />
      <ellipse cx="10" cy="13" rx="1.6" ry="2"   fill={C.skinDark} fillOpacity="0.35" />

      {/* Hair (side profile) */}
      <path
        d="M 10,16 A 10.5,10.5 0 0,1 27,5 Q 24,0 16,2 Q 8,6 10,16 Z"
        fill={hairColor}
      />
      {/* Woman hair — longer, visible at side */}
      {sprite === 'woman' && (
        <ellipse cx="10.5" cy="23" rx="3.5" ry="8.5" fill={hairColor} />
      )}

      {/* Eye (single, side profile) */}
      <ellipse cx="25"   cy="13"   rx="2"   ry="2.2" fill="white" />
      <circle  cx="25.5" cy="13.5" r="1.4"           fill={C.eye}  />
      <circle  cx="25.8" cy="13"   r="0.5"            fill="white"  />

      {/* Nose (side profile) */}
      <path
        d="M 29.5,14 Q 31.5,16.5 29.5,18.5"
        stroke={C.skinDark} strokeWidth="1.2" fill="none"
        strokeLinecap="round" opacity="0.75"
      />

      {/* Blush (woman side) */}
      {sprite === 'woman' && (
        <ellipse cx="25.5" cy="16" rx="2.2" ry="1.4" fill={C.blush} fillOpacity="0.35" />
      )}
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function PlayerSprite({
  facing,
  sprite,
  size = 72,
  isRelaxing = false,
}: PlayerSpriteProps) {
  // Left is identical to right but horizontally mirrored
  const isLeft = facing === 'left';

  const svgTransform = isLeft
    ? 'scaleX(-1)'   // mirror for left-facing
    : undefined;

  return (
    <svg
      viewBox="0 0 40 56"
      width={size}
      height={size}
      style={{
        transform: svgTransform,
        overflow: 'visible',
        filter: isRelaxing ? 'brightness(0.88) saturate(0.9)' : undefined,
      }}
      aria-hidden="true"
    >
      {facing === 'down'  && <Front sprite={sprite} />}
      {facing === 'up'    && <Back  sprite={sprite} />}
      {(facing === 'right' || facing === 'left') && <Side sprite={sprite} />}
    </svg>
  );
}
