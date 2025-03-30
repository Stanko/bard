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
    return fetch(`./ngrams/${path}/ngrams-${n}.json`).then((response) =>
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

  $cartridge.src = `./${color}.gif?cache=${Date.now()}`;
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
      `<pre>`,
      verseLine.rhyme ? `${JSON.stringify(verseLine.rhyme, null, 2)}` : '',
      `</pre>`,
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
  const maxRhymes = rhymePattern.filter((rhyme) => rhyme !== null).length;

  for (let i = 0; i < 4; i++) {
    let currentVerse: Verse = getVerse(nGrams, 4, true, rhymePattern);
    let bestVerse: Verse = currentVerse;

    for (let t = 0; t < 30; t++) {
      const rhymesCount = currentVerse.reduce((sum, line) => {
        if (line.rhyme) {
          return sum + 1;
        }
        return sum;
      }, 0);

      if (rhymesCount === maxRhymes) {
        bestVerse = currentVerse;
        break;
      } else if (rhymesCount === maxRhymes - 1) {
        bestVerse = currentVerse;
      } else if (rhymesCount === maxRhymes - 2) {
        bestVerse = currentVerse;
      }

      currentVerse = getVerse(nGrams, 4, true, rhymePattern);
    }

    verses.push(bestVerse);

    await tick();

    const html = verseToHTML(currentVerse);

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
