import { get } from './cmu';
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

export const getRandomFromRhymes = (
  rhymes: SimilarityResult[]
): SimilarityResult | null => {
  const totalSimilarity = rhymes.reduce((sum, rhyme) => sum + rhyme.score, 0);
  let randomValue = Math.random() * totalSimilarity;

  for (const rhyme of rhymes) {
    if (randomValue < rhyme.score) {
      return rhyme;
    }
    randomValue -= rhyme.score;
  }

  return null;
};

export type VerseLine = {
  line: string[];
  rhyme: SimilarityResult | null;
  wordToRhymeWith: string;
  maxScore?: number;
};

export type Verse = VerseLine[];

export const getVerse = (
  nGrams: NGram[],
  linesCount: number = 4,
  reversed: boolean = false,
  rhymePattern: (number | null)[] = [null, null, 0, 1],
  // rhymePattern: (number | null)[] = [null, 0, 0, 0],
  // rhymePattern: (number | null)[] = [null, 0, 1, 2],
  minSimilarity: number = 3,
  maxTries: number = 1000
): Verse => {
  const verse: Verse = [];

  let usedRhymeWords: string[] = [];

  for (let i = 0; i < linesCount; i++) {
    const pattern = rhymePattern[i % rhymePattern.length];

    let wordToRhymeWith: string | string[] = '';
    let rhymes: SimilarityResult[] = [];

    if (pattern !== null) {
      const lineToRhymeWith = verse[pattern]?.line;

      if (!lineToRhymeWith) {
        continue;
      }

      wordToRhymeWith = lineToRhymeWith[lineToRhymeWith.length - 1];

      if (wordToRhymeWith.length < 3) {
        wordToRhymeWith = lineToRhymeWith.slice(-2);
      }

      rhymes = getRhymes(wordToRhymeWith);
      usedRhymeWords.push(
        Array.isArray(wordToRhymeWith)
          ? wordToRhymeWith.join(' ')
          : wordToRhymeWith
      );
    }

    let tries = 0;

    while (tries < maxTries) {
      const rhyme = getRandomFromRhymes(rhymes) || '';

      if (rhyme && usedRhymeWords.includes(rhyme.rhyme)) {
        tries++;
        continue;
      }

      if (rhyme) {
        usedRhymeWords.push(rhyme.rhyme);
      }

      const line = getSentenceOfLength(
        nGrams,
        rhyme ? rhyme.rhyme : '',
        25,
        30,
        reversed,
        maxTries
      );

      if (line.length) {
        verse.push({
          line,
          wordToRhymeWith: Array.isArray(wordToRhymeWith)
            ? wordToRhymeWith.join(' ')
            : wordToRhymeWith || '',
          rhyme: rhyme || null,
          maxScore: rhymes[0]?.score,
        });
        break;
      }

      tries++;
    }
  }

  return verse;
};

// ----- HAIKU ----- //

/**
 * Counts the syllables in a sentence using the CMU pronunciation dictionary
 * @param sentence An array of words
 * @param get Function to access the CMU pronunciation dictionary
 * @returns The total number of syllables in the sentence
 */
function countSyllables(sentence: string[]): number {
  let totalSyllables = 0;

  for (const word of sentence) {
    try {
      // Get pronunciation from CMU dictionary
      const pronunciation = get(word);

      if (pronunciation) {
        // Count vowel phonemes (marked with digits 0-2 in CMU dict)
        const syllableCount = pronunciation.filter((phoneme) =>
          /\d$/.test(phoneme)
        ).length;

        totalSyllables += syllableCount;
      } else {
        // Fallback: estimate syllables by counting vowel groups
        totalSyllables += countSyllablesHeuristic(word);
      }
    } catch (error) {
      // Fallback in case of any errors with the dictionary
      totalSyllables += countSyllablesHeuristic(word);
    }
  }

  return totalSyllables;
}

/**
 * Heuristic fallback method to estimate syllables when the word isn't in the dictionary
 * @param word A single word
 * @returns Estimated number of syllables
 */
function countSyllablesHeuristic(word: string): number {
  if (word.length <= 3) return 1;

  // Remove trailing 'e' which is often silent
  word = word.replace(/e$/, '');

  // Count groups of vowels (each group is roughly a syllable)
  const vowelGroups = word.toLowerCase().match(/[aeiouy]+/g);
  return vowelGroups ? vowelGroups.length : 1;
}

// Method that returns a haiku
export const getHaiku = (
  nGrams: NGram[],
  syllables: [number, number, number] = [3, 5, 3],
  maxTries: number = 100
): Verse => {
  const totalSyllables = syllables.reduce((sum, s) => sum + s, 0);

  let generatedSyllables = 0;
  let tries = 0;
  let sentence: string[] = [];
  // Get a sentence with the required number of syllables
  do {
    sentence = getSentenceOfLength(
      nGrams,
      '',
      totalSyllables * 3,
      totalSyllables * 5,
      true,
      maxTries
    );

    generatedSyllables = countSyllables(sentence);

    if (++tries > maxTries) {
      break;
    }
  } while (generatedSyllables !== totalSyllables);

  // Split the sentence into lines with the required syllable count
  const haiku: Verse = [];
  let syllableCount = 0;
  let currentLine = 0;
  let line: string[] = [];

  for (let i = 0; i < sentence.length; i++) {
    const word = sentence[i];

    const wordSyllables = countSyllables([word]);
    const currentSyllablesCount = syllables[currentLine];

    line.push(word);

    if (syllableCount + wordSyllables > currentSyllablesCount) {
      haiku.push({ line, wordToRhymeWith: '', rhyme: null });

      currentLine++;
      syllableCount = 0;

      if (currentLine >= 2) {
        line = sentence.slice(i + 1);
        break;
      }

      line = [];
    }

    syllableCount += wordSyllables;
  }

  haiku.push({ line, wordToRhymeWith: '', rhyme: null });

  return haiku;
};
