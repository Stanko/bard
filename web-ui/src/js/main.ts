import { apostrophed } from './lib/apostrophed';
import { getHaiku, getVerse, Verse } from './lib/poem';

import './lib/glitch';
import { speak } from './lib/speak';
import { NGram } from './lib/ngrams';

const $datasets = [
  ...document.querySelectorAll('.dataset'),
] as HTMLInputElement[];
const $verses = document.querySelector('.verses') as HTMLDivElement;
const $autoplay = document.querySelector('.autoplay') as HTMLInputElement;
const $haiku = document.querySelector('.haiku') as HTMLInputElement;
const $generate = document.querySelector('.generate') as HTMLButtonElement;
const $stop = document.querySelector('.stop') as HTMLButtonElement;
const $sing = document.querySelector('.sing') as HTMLButtonElement;
const $read = document.querySelector('.read') as HTMLButtonElement;
const $cartridges = document.querySelector('.cartridges') as HTMLDivElement;

let verseIndex = 0;
let verses: Verse[] = [];
let stop = false;

const loadNGrams = async (path: string, nGramsLengths: [2, 3, 4]) => {
  const promises = nGramsLengths.map((n) => {
    return fetch(`/ngrams/${path}/ngrams-${n}.json`).then((response) =>
      response.json()
    );
  });

  return Promise.all(promises);
};

const tick = async () => {
  return new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
};

const nextVerse = (verses: Verse[]) => {
  verseIndex++;

  return verseIndex < verses.length;
};

const readVerse = (verses: Verse[], sing = false) => {
  if (verses.length === 0) {
    return;
  }

  $verses.dataset.verse = (verseIndex + 1).toString();

  let text: string;

  if (sing) {
    // No punctuation for singing
    text = verses[verseIndex].map((line) => line.line.join(' ')).join(' ');
  } else {
    text =
      verses[verseIndex].map((line) => line.line.join(' ')).join('. ') + '.';
  }

  speak(
    text,
    () => {
      if (!stop && nextVerse(verses)) {
        setTimeout(() => {
          readVerse(verses, sing);
        }, 500);
      } else {
        $verses.dataset.verse = '';
      }
    },
    sing ? 'organ' : ''
  );
};

const getSelectedDataset = () => {
  return $datasets.find((el) => el.checked)?.value || 'lotr';
};

const loadCartridge = () => {
  const $cartridge = document.createElement('img');
  $cartridge.classList.add('cartridge');

  const map = {
    lotr: 'green',
    shakespeare: 'blue',
    hp: 'red',
    haiku: 'yellow',
  };
  const dataset = getSelectedDataset() as keyof typeof map;
  const color = map[dataset];

  $cartridge.src = `/${color}.gif?cache=${Date.now()}`;
  $cartridges.replaceChildren($cartridge);
};

const nGramsCache: Record<string, NGram[]> = {};

const verseToHTML = (verse: Verse) => {
  return verse.map((verseLine) => {
    return [
      `<div class="line">`,
      `<div class="text">`,
      verseLine.line.map((w) => apostrophed[w] || w).join(' '),
      `</div>`,
      `<div class="rhyme" aria-hidden>`,
      `<div>`,
      verseLine.wordToRhymeWith,
      verseLine.rhyme ? ` - ${verseLine.rhyme}` : '',
      `</div>`,
      `<div class="score" aria-hidden>`,
      verseLine.maxScore,
      `</div>`,
      `</div>`,
      `</div>`,
    ].join('');
  });
};

const generate = async () => {
  $verses.innerHTML = '<div class="loading"></div>';

  const path = getSelectedDataset();

  console.time('loading n-grams');

  let nGrams: NGram[];
  if (!nGramsCache[path]) {
    nGrams = await loadNGrams(path, [2, 3, 4]);
    nGramsCache[path] = nGrams;
  } else {
    nGrams = nGramsCache[path];
  }

  console.timeEnd('loading n-grams');

  if ($haiku.checked) {
    console.time(`generating haiku`);

    const haiku = getHaiku(nGrams, Math.random() < 0.5 ? [5, 7, 5] : [3, 5, 3]);

    console.timeEnd(`generating haiku`);

    const verses = [haiku];

    const html = verseToHTML(haiku);
    const $verse = document.createElement('div');
    $verse.classList.add('verse');
    $verse.innerHTML = html.join('');
    $verses.replaceChildren($verse);

    if ($autoplay.checked) {
      readVerse(verses);
    }

    return verses;
  }

  console.time(`generating poem`);

  const verses: Verse[] = [];

  const rhymePattern: (number | null)[] =
    Math.random() < 0.5 ? [null, null, 0, 1] : [null, 0, 1, 2];

  for (let i = 0; i < 4; i++) {
    const verse = getVerse(nGrams, 4, true, rhymePattern);
    verses.push(verse);

    await tick();

    const html = verseToHTML(verse);

    const $verse = document.createElement('div');
    $verse.classList.add('verse');
    $verse.innerHTML = html.join('');

    if (i === 0) {
      $verses.replaceChildren($verse);
    } else {
      $verses.appendChild($verse);
    }
  }

  verseIndex = 0;

  if ($autoplay.checked) {
    readVerse(verses);
  }

  console.timeEnd(`generating poem`);

  return verses;
};

$generate.addEventListener('click', async () => {
  stop = true;
  speechSynthesis.cancel();
  verseIndex = 0;
  verses = await generate();
});

$stop.addEventListener('click', () => {
  stop = true;
  speechSynthesis.cancel();
});

$read.addEventListener('click', () => {
  stop = false;
  verseIndex = 0;
  readVerse(verses);
});

$sing.addEventListener('click', () => {
  stop = false;
  verseIndex = 0;
  readVerse(verses, true);
});

loadCartridge();

$datasets.forEach(($dataset) => {
  $dataset.addEventListener('change', () => loadCartridge());
});

// import BezierEasing from 'bezier-easing';

// type KeyFrames = {
//   name: string;
//   frames: {
//     key: string;
//     properties: Record<
//       string,
//       {
//         value: number;
//         unit?: string | null;
//       }
//     >;
//   }[];
// };

// const example: KeyFrames = {
//   name: 'example-animation',
//   frames: [
//     {
//       key: '0%',
//       properties: {
//         opacity: {
//           value: 0,
//           unit: null,
//         },
//         translateX: {
//           value: 0,
//         },
//         translateY: {
//           value: 0,
//         },
//       },
//     },
//     {
//       key: '30%',
//       properties: {
//         opacity: {
//           value: 0.7,
//           unit: null,
//         },
//         translateX: {
//           value: -50,
//           unit: '%',
//         },
//         translateY: {
//           value: 0,
//         },
//       },
//     },
//     {
//       key: '100%',
//       properties: {
//         opacity: {
//           value: 0.5,
//           unit: null,
//         },
//         translateY: {
//           value: 30,
//           unit: '%',
//         },
//         translateX: {
//           value: 0,
//         },
//       },
//     },
//   ],
// };

// const example: KeyFrames = {
//   name: 'example-animation',
//   frames: [
//     {
//       key: '0%',
//       properties: {
//         translateX: {
//           value: 0,
//         },
//       },
//     },
//     // {
//     //   key: '44.9%',
//     //   properties: {
//     //     translateX: {
//     //       value: 0,
//     //     },
//     //   },
//     // },
//     {
//       key: '45%',
//       properties: {
//         translateX: {
//           value: -50,
//           unit: '%',
//         },
//       },
//     },
//     {
//       key: '55%',
//       properties: {
//         translateX: {
//           value: -50,
//           unit: '%',
//         },
//       },
//     },
//     // {
//     //   key: '55.1%',
//     //   properties: {
//     //     translateX: {
//     //       value: 0,
//     //     },
//     //   },
//     // },
//     {
//       key: '100%',
//       properties: {
//         translateX: {
//           value: 0,
//         },
//       },
//     },
//   ],
// };

// const Y_SIZE = 50;
// const POINTS_PER_PERCENT = 2;

// type Vector = { x: number; y: number };
// type Easing = [number, number, number, number];

// const getCurvePoints = (
//   start: number,
//   end: number,
//   startValue: number,
//   endValue: number,
//   easing: Easing = [0.42, 0, 0.58, 1],
//   pointsPerPercent: number = POINTS_PER_PERCENT
// ): Vector[] => {
//   const duration = end - start;
//   const e = BezierEasing(...easing);

//   const steps = [];
//   for (let i = 0; i < duration; i++) {
//     for (let j = 0; j < pointsPerPercent; j++) {
//       steps.push(i + j / pointsPerPercent);
//     }
//   }
//   steps.push(duration);

//   const points = steps.map((step, i) => {
//     const t = step / duration;
//     const value = startValue + (endValue - startValue) * e(t);

//     return {
//       x: start + step,
//       y: value,
//     };
//   });

//   return points;
// };

// const getSvgCurve = (
//   points: Vector[],
//   props: Record<string, string> = {
//     stroke: 'white',
//   },
//   scale: number = 1
// ) => {
//   const [p1, c1, c2, p2] = points;
//   const attrs = Object.entries({
//     fill: 'none',
//     'vector-effect': 'non-scaling-stroke',
//     ...props,
//   })
//     .map(([key, value]) => `${key}="${value}"`)
//     .join(' ');

//   return `<path ${attrs} d="M ${p1.x} ${Y_SIZE - p1.y * scale} C ${c1.x} ${
//     Y_SIZE - c1.y * scale
//   } ${c2.x} ${Y_SIZE - c2.y * scale} ${p2.x} ${Y_SIZE - p2.y * scale}" />

//   <!--
//   <circle cx="${c1.x}" cy="${Y_SIZE - c1.y * scale}" r="1" fill="orange" />
//   <circle cx="${c2.x}" cy="${Y_SIZE - c2.y * scale}" r="1" fill="purple" />
//   -->
//   `;
// };

// const getCurve = (
//   start: number,
//   end: number,
//   startValue: number,
//   endValue: number,
//   easing: Easing = [0.42, 0, 0.58, 1]
// ) => {
//   const duration = end - start;
//   const valueSpan = endValue - startValue;

//   const p1 = { x: start, y: startValue };
//   const c1 = {
//     x: start + duration * easing[0],
//     y: startValue + valueSpan * easing[1],
//   };
//   const c2 = {
//     x: start + duration * easing[2],
//     y: startValue + valueSpan * easing[3],
//   };
//   const p2 = { x: end, y: endValue };

//   return [p1, c1, c2, p2];
// };

// const getSvgLine = (
//   points: Vector[],
//   props: Record<string, string> = {
//     stroke: 'black',
//   },
//   yScale: number = 1
// ) => {
//   const path = points
//     .map((point, i) => {
//       const command = i === 0 ? 'M' : 'L';
//       // Invert y-axis
//       return `${command} ${point.x} ${Y_SIZE - point.y * yScale}`;
//     })
//     .join(' ');

//   const attrs = Object.entries({
//     fill: 'none',
//     'vector-effect': 'non-scaling-stroke',
//     ...props,
//   })
//     .map(([key, value]) => `${key}="${value}"`)
//     .join(' ');

//   return `<path d="${path}" ${attrs} />`;
// };

// // Flat UI colors
// const colors = [
//   '#1abc9c',
//   '#3498db',
//   '#9b59b6',
//   '#f1c40f',
//   '#e67e22',
//   '#e74c3c',
//   '#2ecc71',
// ];

// const $animationSvg = document.querySelector('.animation') as SVGElement;
// const $animationTooltip = document.querySelector(
//   '.animation-tooltip'
// ) as HTMLDivElement;

// type Items = Record<
//   string,
//   {
//     scale: number;
//     line: Vector[];
//     color: string;
//     unit?: string;
//     joints: Vector[];
//     curves: Vector[][];
//   }
// >;

// const prepareAnimation = (
//   keyframes: KeyFrames,
//   easing: Easing = [0.42, 0, 0.58, 1] // ease-in-out
// ): Items => {
//   const { frames } = keyframes;

//   const items: Items = {};

//   frames.forEach((frame, i) => {
//     const nextFrame = frames[i + 1];

//     Object.entries(frame.properties).forEach(
//       ([property, { value, unit }], i) => {
//         const prop = items[property];

//         const line = nextFrame
//           ? getCurvePoints(
//               parseFloat(frame.key),
//               parseFloat(nextFrame.key),
//               value,
//               nextFrame.properties[property].value,
//               easing
//             )
//           : [];
//         const curve = nextFrame
//           ? getCurve(
//               parseFloat(frame.key),
//               parseFloat(nextFrame.key),
//               value,
//               nextFrame.properties[property].value,
//               easing
//             )
//           : [];

//         const scale = value === 0 ? Infinity : Y_SIZE / Math.abs(value);

//         if (!prop) {
//           items[property] = {
//             color: colors[i % colors.length],
//             unit: unit || '',
//             scale,
//             line,
//             joints: [line[0]],
//             curves: [curve],
//           };
//         } else {
//           items[property].scale = Math.min(items[property].scale, scale);

//           if (!prop.unit) {
//             prop.unit = unit || '';
//           }

//           if (curve.length) {
//             items[property].curves.push(curve);
//           }

//           if (line.length) {
//             const joint = line.shift() as Vector; // Remove first point

//             prop.line = [...prop.line, ...line];
//             prop.joints.push(joint, line[line.length - 1]);
//           }
//         }
//       }
//     );
//   });

//   return items;
// };

// const drawAnimation = (
//   items: Items,
//   $svg: SVGElement,
//   $animationTooltip: HTMLDivElement,
//   pointsPerPercent: number = POINTS_PER_PERCENT
// ) => {
//   const elements = [];
//   Object.keys(items).forEach((property) => {
//     const item = items[property];

//     const line = getSvgLine(item.line, { stroke: item.color }, item.scale);

//     const circles = item.joints
//       .map(
//         (point) =>
//           `<circle cx="${point.x}" cy="${
//             Y_SIZE - point.y * item.scale
//           }" r="1" fill="${item.color}" />`
//       )
//       .join('');

//     const curves = item.curves
//       .map((curve) => getSvgCurve(curve, { stroke: item.color }, item.scale))
//       .join('');

//     console.log(curves);

//     elements.push(line, circles, curves);
//   });

//   elements.push(
//     getSvgLine(
//       [
//         { x: 0, y: -Y_SIZE },
//         { x: 0, y: Y_SIZE },
//       ],
//       {
//         stroke: 'rgb(255 255 255 / 0.4)',
//         class: 'axis',
//       }
//     )
//   );

//   $svg.innerHTML = elements.join('');

//   const $axis = $svg.querySelector('.axis') as SVGPathElement;

//   const step = 1 / pointsPerPercent;

//   $svg.addEventListener('mousemove', (x) => {
//     const xPercentage = (x.offsetX / $svg.clientWidth) * 100;
//     // Round to step
//     const xStep = Math.round(xPercentage / step) * step;
//     const index = Math.round(xStep * pointsPerPercent);

//     $axis.setAttribute('transform', `translate(${xStep} 0)`);

//     const html = Object.keys(items).map((property) => {
//       const { color, line, unit } = items[property];
//       const point = line[index];

//       return `<div style="color: ${color}">${property}: ${+point.y.toFixed(
//         3
//       )}${unit}</div>`;
//     });

//     $animationTooltip.innerHTML = `<div>${xStep}%</div>` + html.join('');
//   });
// };

// const items = prepareAnimation(example, [0.42, 0.1, 0.65, 1.5]);

// drawAnimation(items, $animationSvg, $animationTooltip);
