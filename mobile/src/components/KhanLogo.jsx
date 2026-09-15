import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

/**
 * KHAN brand lockup — inline SVG, no brand font required.
 *
 * Reference: docs/reference/الصفحة الرئيسية.jpg (dashboard sidebar) —
 *
 *     [ خان over thin wide-tracked K H A N ]  |  [ خ emblem with its two dots ]
 *
 * The reference خان is a custom geometric monoline wordmark (not a shipped font:
 * it is roughly twice as wide as any Cairo weight and its خ has no descender),
 * so it is drawn here as vector strokes that scale to any size.
 *
 * Every number below was normalised from that lockup, so all four pieces keep
 * their real relative positions and weights when they are combined:
 * خان is 390 x 136 ("reference units"), the Latin K H A N is justified to the
 * same 390 width with a 63 cap height, and the emblem is 288 x 288 tall next to
 * a hairline divider — the full lockup is 787 x 288.
 *
 * Colours are the shared brand palette:
 *   green  #179B7D  (primary)
 *   amber  #F7B531  (gold accent)
 *   ink    #1E252B  (wordmark on light surfaces)
 *   white  #FFFFFF  (monochrome lockup, e.g. on the dark-green sidebar)
 */
export const KHAN_COLORS = {
  green: '#179B7D',
  greenDark: '#075247',
  amber: '#F7B531',
  ink: '#1E252B',
  white: '#FFFFFF',
};

// The standalone خ (khaa) emblem — path preserved verbatim from the shipped splash mark.
export const KHAN_EMBLEM_PATH =
  'M53 68c15-34 48-46 78-27 11 7 21 10 33 13 14 4 19 17 13 31-3 8-9 12-18 14-31 5-58 10-78 27-19 16-18 46 1 60 22 17 60 10 81-10 12-11 22-28 29-25 8 4-13 47-43 65-38 22-91 11-115-25-23-36-12-78 25-101 13-8 29-13 47-15 8-1 11-4 8-7-9-8-35-7-61 2-13 5-24 11-30 5-7-7-3-23 0-27Z';

/** خان wordmark box (ink is 390 x 136, the last 4 units are breathing room). */
export const KHAN_ARABIC_BOX = { width: 390, height: 140 };

/** Latin "KHAN" box (cap height 63, justified to the same 390 width as خان). */
export const KHAN_LATIN_BOX = { width: 390, height: 63 };

/** خ emblem box, as authored for the original splash mark. */
export const KHAN_EMBLEM_BOX = { width: 180, height: 180 };

/** Full lockup layout — [ words | divider | emblem ]. */
export const KHAN_LOCKUP_BOX = {
  width: 787,
  height: 288,
  arabicTop: 25,
  latinTop: 213,
  dividerX: 426,
  dividerWidth: 3,
  dividerTop: 0,
  dividerHeight: 280,
  emblemX: 497,
  emblemY: 0,
  emblemSize: 288,
};

export const KHAN_LOCKUP_ASPECT = KHAN_LOCKUP_BOX.width / KHAN_LOCKUP_BOX.height;

/* --------------------------------------------------------------- geometry */

const ARABIC_STROKE = 24;
const ARABIC_DOT_RADIUS = 12.5;

// خان read right-to-left: خ (top bar + tail sweeping along the baseline),
// ا (tall stem), ن (open bowl standing on its own).
const ARABIC_STROKES = [
  // ن — bowl, arms at x 12 / 102, flat rounded bottom on the baseline
  'M12 70 V104 Q12 124 57 124 Q102 124 102 104 V70',
  // ا — the tall stem, rising from the baseline to the top of the mark
  'M146 12 V124',
  // خ — head, right shoulder, descending tail, then the baseline back to the alef
  'M312 59 H344 Q368 59 368 83 V124 H146',
];

// The two dots of خان (ن above its bowl, خ above its head) — same weight as the strokes.
const ARABIC_DOTS = [
  { cx: 57, cy: 34 },
  { cx: 352, cy: 20 },
];

const LATIN_STROKE = 9;

// Thin, flat-capped geometric "K H A N", justified across the خان width.
const LATIN_STROKES = [
  'M4.5 0 V63', // K stem
  'M55.5 0 L4.5 31.5', // K arm
  'M4.5 31.5 L55.5 63', // K leg
  'M114.5 0 V63', // H
  'M165.5 0 V63',
  'M114.5 31.5 H165.5',
  'M224.5 63 L250 4.5 L275.5 63', // A
  'M334.5 0 V63', // N
  'M385.5 0 V63',
  'M334.5 0 L385.5 63',
];

// Keep the box aspect of every piece unless the caller overrides the height.
function resolveBox(width, height, box, fallbackWidth) {
  const w = typeof width === 'number' && width > 0 ? width : fallbackWidth;
  const h =
    typeof height === 'number' && height > 0
      ? height
      : typeof w === 'number'
        ? w * (box.height / box.width)
        : undefined;
  return { width: w, height: h };
}

/* ------------------------------------------------------------- components */

/**
 * خان — geometric monoline wordmark with its two dots.
 * Pass `width` and the box height is derived; `height` overrides the aspect.
 */
export function KhanArabic({ width = 160, height, color = KHAN_COLORS.ink, style }) {
  const box = resolveBox(width, height, KHAN_ARABIC_BOX, 160);
  return (
    <View style={[{ width: box.width, height: box.height }, style]}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${KHAN_ARABIC_BOX.width} ${KHAN_ARABIC_BOX.height}`}
      >
        {ARABIC_STROKES.map((d) => (
          <Path
            key={d}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={ARABIC_STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {ARABIC_DOTS.map((dot) => (
          <Circle key={`${dot.cx}-${dot.cy}`} cx={dot.cx} cy={dot.cy} r={ARABIC_DOT_RADIUS} fill={color} />
        ))}
      </Svg>
    </View>
  );
}

/**
 * Thin, wide-tracked Latin "K H A N", justified to the exact width of خان
 * (as in the reference lockup) so the two lines always read as one block.
 */
export function KhanLatin({ width = 160, height, color = KHAN_COLORS.ink, style }) {
  const box = resolveBox(width, height, KHAN_LATIN_BOX, 160);
  return (
    <View style={[{ width: box.width, height: box.height }, style]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${KHAN_LATIN_BOX.width} ${KHAN_LATIN_BOX.height}`}>
        {LATIN_STROKES.map((d, index) => (
          <Path
            key={d}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={LATIN_STROKE}
            strokeLinecap="butt"
            strokeLinejoin={index === 6 ? 'round' : 'miter'}
          />
        ))}
      </Svg>
    </View>
  );
}

/**
 * Standalone خ emblem with its two dots.
 * The dots are individual SVG nodes so the splash can animate them
 * (opacity / drop / pop) while the whole mark scales as one unit.
 */
export function KhanEmblem({
  width = 64,
  height,
  style,
  emblemColor = KHAN_COLORS.green,
  greenDotColor = KHAN_COLORS.green,
  goldDotColor = KHAN_COLORS.amber,
  greenDotOpacity = 1,
  goldDotOpacity = 1,
}) {
  const box = resolveBox(width, height, KHAN_EMBLEM_BOX, 64);
  return (
    <View style={[{ width: box.width, height: box.height }, style]}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${KHAN_EMBLEM_BOX.width} ${KHAN_EMBLEM_BOX.height}`}
      >
        <Path d={KHAN_EMBLEM_PATH} fill={emblemColor} />
        <Circle
          cx="82"
          cy="22"
          r="12"
          fill={greenDotColor}
        />
        <Circle
          cx="154"
          cy="78"
          r="9"
          fill={goldDotColor}
        />
      </Svg>
    </View>
  );
}

/**
 * The full KHAN lockup: خان over "K H A N", a hairline divider, then the خ emblem.
 *
 * `variant`
 *   'brand' — ink wordmark, green emblem, green + gold dots (light surfaces)
 *   'mono'  — one colour for the whole lockup (dark surfaces such as the
 *             dashboard sidebar); the colour comes from `color`
 * Any individual colour prop overrides the variant.
 */
export function KhanWordmark({
  width = 168,
  height,
  style,
  variant = 'brand',
  color,
  arabicColor,
  latinColor,
  emblemColor,
  greenDotColor,
  goldDotColor,
  dividerColor,
  dividerOpacity,
  showDivider = true,
  showEmblem = true,
  greenDotOpacity = 1,
  goldDotOpacity = 1,
}) {
  const mono = variant === 'mono';
  const base = color || (mono ? KHAN_COLORS.white : KHAN_COLORS.ink);
  const wordsInk = arabicColor || base;
  const latinInk = latinColor || base;
  const emblemInk = emblemColor || (mono ? base : KHAN_COLORS.green);
  const greenDotInk = greenDotColor || (mono ? base : KHAN_COLORS.green);
  const goldDotInk = goldDotColor || (mono ? base : KHAN_COLORS.amber);
  const dividerInk = dividerColor || base;
  const dividerAlpha = dividerOpacity ?? (mono ? 0.4 : 0.35);

  const box = resolveBox(width, height, KHAN_LOCKUP_BOX, 168);
  const arabicScale = KHAN_LOCKUP_BOX.width / KHAN_ARABIC_BOX.width;
  const latinScale = KHAN_LOCKUP_BOX.width / KHAN_LATIN_BOX.width;
  const emblemScale = KHAN_LOCKUP_BOX.emblemSize / KHAN_EMBLEM_BOX.width;

  return (
    <View style={[{ width: box.width, height: box.height }, style]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${KHAN_LOCKUP_BOX.width} ${KHAN_LOCKUP_BOX.height}`}>
        <G transform={`translate(0 ${KHAN_LOCKUP_BOX.arabicTop}) scale(${arabicScale})`}>
          {ARABIC_STROKES.map((d) => (
            <Path
              key={d}
              d={d}
              fill="none"
              stroke={wordsInk}
              strokeWidth={ARABIC_STROKE}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {ARABIC_DOTS.map((dot) => (
            <Circle key={`${dot.cx}-${dot.cy}`} cx={dot.cx} cy={dot.cy} r={ARABIC_DOT_RADIUS} fill={wordsInk} />
          ))}
        </G>

        <G transform={`translate(0 ${KHAN_LOCKUP_BOX.latinTop}) scale(${latinScale})`}>
          {LATIN_STROKES.map((d, index) => (
            <Path
              key={d}
              d={d}
              fill="none"
              stroke={latinInk}
              strokeWidth={LATIN_STROKE}
              strokeLinecap="butt"
              strokeLinejoin={index === 6 ? 'round' : 'miter'}
            />
          ))}
        </G>

        {showDivider ? (
          <Rect
            x={KHAN_LOCKUP_BOX.dividerX}
            y={KHAN_LOCKUP_BOX.dividerTop}
            width={KHAN_LOCKUP_BOX.dividerWidth}
            height={KHAN_LOCKUP_BOX.dividerHeight}
            fill={dividerInk}
            opacity={dividerAlpha}
          />
        ) : null}

        {showEmblem ? (
          <G transform={`translate(${KHAN_LOCKUP_BOX.emblemX} ${KHAN_LOCKUP_BOX.emblemY}) scale(${emblemScale})`}>
            <Path d={KHAN_EMBLEM_PATH} fill={emblemInk} />
            <Circle
              cx="82"
              cy="22"
              r="12"
              fill={greenDotInk}
              opacity={greenDotOpacity}
            />
            <Circle
              cx="154"
              cy="78"
              r="9"
              fill={goldDotInk}
              opacity={goldDotOpacity}
            />
          </G>
        ) : null}
      </Svg>
    </View>
  );
}

export default KhanWordmark;