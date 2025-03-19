import { generateSentence, type NGram } from './ngrams';
import { getRhymes, type SimilarityResult } from './rhyme';

const getSentenceOfLength = (
  nGrams: NGram[],
  startWord: string = '',
  minLength: number = 25,
  maxLength: number = 35,
  reversed: boolean = false,
  maxTries: number = 1000
): string[] => {
  let tries = 0;

  while (tries < maxTries) {
    const sentence = generateSentence(nGrams, reversed, startWord);
    const length = sentence.join(' ').length;

    if (length >= minLength && length <= maxLength) {
      return sentence;
    }

    tries++;
  }

  return [];
};

export const getRandomFromRhymes = (rhymes: SimilarityResult[]): string => {
  const totalSimilarity = rhymes.reduce(
    (sum, rhyme) => sum + rhyme.similarity,
    0
  );
  let randomValue = Math.random() * totalSimilarity;

  for (const rhyme of rhymes) {
    if (randomValue < rhyme.similarity) {
      return rhyme.word;
    }
    randomValue -= rhyme.similarity;
  }

  return '';
};

export const getVerse = (
  nGrams: NGram[],
  linesCount: number = 4,
  reversed: boolean = false,
  rhymePattern: (number | null)[] = [null, null, 0, 1],
  // rhymePattern: (number | null)[] = [null, 0, 0, 0],
  // rhymePattern: (number | null)[] = [null, 0, 1, 2],
  minSimilarity: number = 3,
  maxTries: number = 1000
): string[][] => {
  const verse: string[][] = [];

  for (let i = 0; i < linesCount; i++) {
    const pattern = rhymePattern[i % rhymePattern.length];

    let wordToRhymeWith: string | string[] = '';
    let rhymes: SimilarityResult[] = [];

    if (pattern !== null) {
      const lineToRhymeWith = verse[pattern];
      if (!lineToRhymeWith) {
        continue;
      }
      wordToRhymeWith = lineToRhymeWith[lineToRhymeWith.length - 1];

      if (wordToRhymeWith.length < 3) {
        wordToRhymeWith = lineToRhymeWith.slice(-2);
      }

      rhymes = getRhymes(wordToRhymeWith, minSimilarity);
    }

    let tries = 0;
    while (tries < maxTries) {
      const rhyme = getRandomFromRhymes(rhymes) || '';

      const line = getSentenceOfLength(
        nGrams,
        rhyme,
        25,
        35,
        reversed,
        maxTries
      );

      if (line.length) {
        if (pattern !== null) {
          console.log(
            'rhyme:',
            i,
            wordToRhymeWith,
            '-',
            rhyme,
            rhymes.length,
            rhymes[0]?.similarity
          );
        }
        verse.push(line);
        break;
      }

      tries++;
    }
  }

  return verse;
};
