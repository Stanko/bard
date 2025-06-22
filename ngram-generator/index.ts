import * as fs from 'fs';
import * as path from 'path';
import { log } from './src/log';
import { generateNGrams, textToSentences, type NGram } from './src/ngrams';

export const concatFiles = (filePaths: string[]): string => {
  return filePaths
    .map((filePath) => fs.readFileSync(path.resolve(filePath), 'utf-8'))
    .join(' ');
};

type MainOptions = {
  filePaths: string[];
  nGramsLengths?: number[];
  sentencesToGenerate?: number;
  reversed?: boolean;
  id: string;
  debug?: boolean;
};

const main = async ({
  filePaths,
  nGramsLengths = [2, 3, 4],
  reversed = false,
  id,
  debug = false,
}: MainOptions) => {
  if (!nGramsLengths.includes(2)) {
    throw new Error('Bi-grams (n=2) are required for the sentence generation');
  }

  log.green('\n* files: ');
  console.log(JSON.stringify(filePaths, null, 2));

  if (reversed) {
    log.green('\n* reversed');
  }

  // Sort the n-grams lengths in ascending order
  nGramsLengths = nGramsLengths.sort((a, b) => a - b);

  const dir = debug ? `./ngrams/${id}` : `../public/ngrams/${id}`;

  // ----- CREATE DIR ----- //
  if (fs.existsSync(dir)) {
    fs.rmdirSync(dir, { recursive: true });
  }
  fs.mkdirSync(dir, { recursive: true });

  // ----- GET SENTENCES ----- //
  log.green('\n* get sentences');
  console.time(`getting sentences`);
  const sentences = textToSentences(concatFiles(filePaths), reversed);
  console.timeEnd(`getting sentences`);
  console.log(`total sentences: ${sentences.length}`);

  if (debug) {
    fs.writeFileSync(
      `${dir}/sentences.json`,
      JSON.stringify(sentences, null, 2)
    );
  }

  // ----- NGRAMS ----- //
  log.green('\n* generating ngrams');

  nGramsLengths.map((n): NGram => {
    const fileName = `${dir}/ngrams-${n}.json`;

    console.time(`generating ${n} ngrams`);
    const nGram = generateNGrams(sentences, n);

    console.timeEnd(`generating ${n} ngrams`);
    const nGramsJson = JSON.stringify(nGram, null, 2);

    console.log(`total ${n} ngrams: ${Object.keys(nGram.map).length}`);

    fs.writeFileSync(fileName, nGramsJson);

    return nGram;
  });

  // ----- SAVE FILE PATHS ----- //

  if (debug) {
    fs.writeFileSync(
      `${dir}/file-paths.json`,
      JSON.stringify(filePaths, null, 2)
    );
  }
};

const config = [
  {
    filePaths: ['./text/the-guide.txt'],
    breakOnNewLines: false,
    id: 'hhgg',
  },
  {
    filePaths: ['./text/zappa.txt'],
    breakOnNewLines: true,
    id: 'fz',
  },
  {
    filePaths: ['./text/shakespeare.txt'],
    breakOnNewLines: true,
    id: 'shkspr',
  },
  {
    filePaths: [
      './text/hp/hp1.txt',
      './text/hp/hp2.txt',
      './text/hp/hp3.txt',
      './text/hp/hp4.txt',
      './text/hp/hp5.txt',
      './text/hp/hp6.txt',
      './text/hp/hp7.txt',
    ],
    breakOnNewLines: false,
    id: 'hp',
  },
  {
    filePaths: [
      './text/lotr/01.txt',
      './text/lotr/02.txt',
      './text/lotr/03.txt',
    ],
    breakOnNewLines: false,
    id: 'lotr',
  },
  {
    filePaths: ['./text/sp.txt'],
    breakOnNewLines: false,
    id: 'sp',
  },
];

console.time(`total time`);
config.forEach((item) => {
  main({
    filePaths: item.filePaths,
    nGramsLengths: [2, 3, 4],
    reversed: true,
    id: item.id,
    // debug: true,
  });
});
console.time(`total time`);
