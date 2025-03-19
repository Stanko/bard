import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';
import { log } from './src/log';
import seedrandom from 'seedrandom';
import { apostrophed } from './src/apostrophed';
import {
  generateNGrams,
  readNGramsFromDisk,
  textToSentences,
  type NGram,
} from './src/ngrams';
import { getVerse } from './src/poem';

export const concatFiles = (filePaths: string[]): string => {
  return filePaths
    .map((filePath) => fs.readFileSync(path.resolve(filePath), 'utf-8'))
    .join(' ');
};

type MainOptions = {
  filePaths: string[];
  nGramsLengths?: number[];
  sentencesToGenerate?: number;
  parseFromDisk?: boolean;
  reversed?: boolean;
};

const main = async ({
  filePaths,
  nGramsLengths = [2, 3, 4],
  parseFromDisk = false,
  reversed = false,
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

  // ----- GET HASH ----- //
  const hash = crypto
    .createHash('md5')
    .update(filePaths.join('_') + nGramsLengths.join('_') + reversed)
    .digest('hex');

  const dir = `./ngrams/${hash}`;

  // ----- READ FROM DISK ----- //
  let nGrams: NGram[] = [];

  const allFilesExist = nGramsLengths.every((n) =>
    fs.existsSync(`${dir}/ngrams-${n}.json`)
  );

  if (parseFromDisk && allFilesExist) {
    log.green('\n* loading ngrams from disk');
    console.time('loading ngrams');
    nGrams = await readNGramsFromDisk(dir, nGramsLengths);
    console.timeEnd('loading ngrams');
    console.log(`loaded ${nGrams.length} ngrams files`);
  } else {
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

    fs.writeFileSync(
      `${dir}/sentences.json`,
      JSON.stringify(sentences, null, 2)
    );

    // ----- NGRAMS ----- //

    log.green('\n* generating ngrams');

    nGrams = nGramsLengths.map((n): NGram => {
      const fileName = `${dir}/ngrams-${n}.json`;

      console.time(`generating ${n} ngrams`);
      const nGram = generateNGrams(sentences, n);

      console.timeEnd(`generating ${n} ngrams`);
      const nGramsJson = JSON.stringify(nGram);

      console.log(`total ${n} ngrams: ${Object.keys(nGram.map).length}`);

      fs.writeFileSync(fileName, nGramsJson);

      return nGram;
    });
  }

  // ----- SAVE FILE PATHS ----- //

  fs.writeFileSync(
    `${dir}/file-paths.json`,
    JSON.stringify(filePaths, null, 2)
  );

  // ----- GENERATE POEM ----- //

  log.green('\n* generating poem');
  console.time(`generating poem`);

  const printVerse = (verse: string[][]) => {
    console.log(
      verse
        .map((line) => line.map((w) => apostrophed[w] || w).join(' '))
        .join('\n')
    );
    console.log('');
  };

  // for (let i = 0; i < 20; i++) {
  // Math.random = seedrandom(i.toString());

  console.log('');
  printVerse(getVerse(nGrams, 4, reversed));
  printVerse(getVerse(nGrams, 4, reversed));
  printVerse(getVerse(nGrams, 4, reversed));
  printVerse(getVerse(nGrams, 4, reversed));
  console.log('\n');
  // }

  console.timeEnd(`generating poem`);
  console.log();
};

const filePathsHP = [
  './text/hp1.txt',
  './text/hp2.txt',
  './text/hp3.txt',
  './text/hp4.txt',
  './text/hp5.txt',
  './text/hp6.txt',
  './text/hp7.txt',
];

const filePathsLOTR = [
  './text/lotr/01.txt',
  './text/lotr/02.txt',
  './text/lotr/03.txt',
];

const filePathsShakespeare = ['./text/shakespeare.txt'];

// main({
//   filePaths: filePathsShakespeare,
//   // filePaths: filePathsHP,
//   // filePaths: filePathsLOTR,
//   nGramsLengths: [2, 3, 4],
//   reversed: true,
//   parseFromDisk: true,
// });

// main({
//   // filePaths: filePathsShakespeare,
//   filePaths: filePathsHP,
//   // filePaths: filePathsLOTR,
//   nGramsLengths: [2, 3, 4],
//   reversed: true,
//   parseFromDisk: true,
// });

// main({
//   // filePaths: filePathsShakespeare,
//   // filePaths: filePathsHP,
//   filePaths: filePathsLOTR,
//   nGramsLengths: [2, 3, 4],
//   reversed: true,
//   parseFromDisk: true,
// });

const filePathsHaikus = ['./text/haikus.txt'];

main({
  filePaths: filePathsHaikus,
  nGramsLengths: [2, 3, 4],
  reversed: true,
  parseFromDisk: true,
});
