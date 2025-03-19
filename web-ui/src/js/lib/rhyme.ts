import { dictionary } from './cmu';

const phoneticSimilarity: Record<string, Record<string, number>> = {
  // Vowels (with varying degrees of similarity)
  AE: { EH: 0.95, IH: 0.85, IY: 0.75, AA: 0.7 },
  EH: { AE: 0.95, IH: 0.9, IY: 0.8, AA: 0.7 },
  IH: { AE: 0.85, EH: 0.9, IY: 0.95, UH: 0.7 },
  IY: { AE: 0.75, EH: 0.8, IH: 0.95 },
  AA: { AO: 0.9, UH: 0.8, UW: 0.7, AE: 0.7, EH: 0.7 },
  AO: { AA: 0.9, UH: 0.85, UW: 0.75 },
  UH: { AA: 0.8, AO: 0.85, UW: 0.9, IH: 0.7 },
  UW: { AA: 0.7, AO: 0.75, UH: 0.9 },
  AW: { AY: 0.9, EY: 0.8, OW: 0.75, OY: 0.7 },
  AY: { AW: 0.9, EY: 0.85, OW: 0.7, OY: 0.75 },
  EY: { AW: 0.8, AY: 0.85, OW: 0.9, OY: 0.8 },
  OW: { AW: 0.75, AY: 0.7, EY: 0.9, OY: 0.95 },
  OY: { AW: 0.7, AY: 0.75, EY: 0.8, OW: 0.95 },
  AH: { ER: 0.9 },
  ER: { AH: 0.9 },

  // Consonants (with varying degrees of similarity)
  B: { P: 0.65, M: 0.5 },
  P: { B: 0.65, M: 0.5 },
  M: { B: 0.5, P: 0.5, N: 0.55 },
  N: { M: 0.55, NG: 0.6, L: 0.5, R: 0.5 },
  NG: { N: 0.6, G: 0.5, K: 0.5 },
  D: { T: 0.65, DH: 0.55 },
  T: { D: 0.65, TH: 0.55 },
  G: { K: 0.65, NG: 0.5 },
  K: { G: 0.65, NG: 0.5 },
  V: { F: 0.65, TH: 0.5 },
  F: { V: 0.65, TH: 0.5 },
  Z: { S: 0.65, ZH: 0.55 },
  S: { Z: 0.65, SH: 0.55 },
  ZH: { SH: 0.65, Z: 0.55 },
  SH: { ZH: 0.65, S: 0.55 },
  JH: { CH: 0.65, DH: 0.5 },
  CH: { JH: 0.65, TH: 0.5 },
  L: { R: 0.55, N: 0.5 },
  R: { L: 0.55, N: 0.5 },
  TH: { DH: 0.6, T: 0.55, F: 0.5, V: 0.5 },
  DH: { TH: 0.6, D: 0.55, JH: 0.5 },
  W: { WH: 0.65 },
  WH: { W: 0.65 },
};

const isVowel = (phoneme: string): boolean => {
  return [
    'AE',
    'EH',
    'IH',
    'IY',
    'AA',
    'AO',
    'UH',
    'UW',
    'AW',
    'AY',
    'EY',
    'OW',
    'OY',
    'AH',
    'ER',
  ].includes(phoneme);
};

export const countRhymePhoneticSimilarity = (
  phonemes1?: string[],
  phonemes2?: string[],
  usePhoneticSimilarity: boolean = true
): number => {
  if (!phonemes1 || !phonemes2) {
    return 0;
  }

  let similarity = 0;

  // Reverse the phoneme arrays for comparison from the end
  const p1 = phonemes1.toReversed();
  const p2 = phonemes2.toReversed();

  // Determine the minimum length to avoid out-of-bounds errors
  const n = Math.min(p1.length, p2.length);

  // Iterate through the phonemes
  for (let i = 0; i < n; i++) {
    const phoneme1 = p1[i];
    const phoneme2 = p2[i];

    // Check if the phoneme has stress (indicated by a digit)
    const hasStress = phoneme1.match(/\d/);

    // Remove stress digits from phonemes for comparison
    const phonemeWithoutStress1 = p1[i].replace(/\d/g, '');
    const phonemeWithoutStress2 = p2[i].replace(/\d/g, '');

    // Exact match with stress (only vowels can have stress)
    if (phoneme1 === phoneme2 && hasStress) {
      similarity += 3; // Higher weight for stressed vowel match
    }
    // Exact match without stress
    else if (phonemeWithoutStress1 === phonemeWithoutStress2) {
      if (isVowel(phonemeWithoutStress1)) {
        similarity += 2; // Higher weight for vowel match
      } else {
        similarity += 1.5; // Lower weight for consonant match
      }
    }
    // Phonetic similarity match
    else if (usePhoneticSimilarity) {
      const similarPhonemes = phoneticSimilarity[phonemeWithoutStress1];

      if (similarPhonemes && similarPhonemes[phonemeWithoutStress2]) {
        let weight = similarPhonemes[phonemeWithoutStress2];

        similarity += weight;
      }
    } else {
      break; // Break if no similarity is found
    }
  }

  return similarity;
};

export type SimilarityResult = {
  word: string;
  similarity: number;
};

export const getRhymes = (
  word: string | string[],
  minSimilarity: number = 5,
  usePhoneticSimilarity: boolean = true,
  maxRhymes: number = 40
): SimilarityResult[] => {
  let phonemes: string[];

  // Convert the input word(s) to phonemes
  if (Array.isArray(word)) {
    phonemes = word
      // If the word is not found in the dictionary, return an array of underscores
      .map((w) => dictionary[w] || w.split('').map((_) => ''))
      .flat();
  } else {
    phonemes = dictionary[word];
  }

  // Return an empty array if no phonemes are found
  if (!phonemes) {
    return [];
  }

  const results: SimilarityResult[] = [];

  // Iterate through the dictionary to find rhymes
  Object.keys(dictionary).forEach((key) => {
    const currentPhonemes = dictionary[key];

    // Skip if the word is the same as the input word
    if (phonemes.join('') === currentPhonemes.join('')) {
      return;
    }

    // Calculate the phonetic similarity
    const similarity = countRhymePhoneticSimilarity(
      phonemes,
      currentPhonemes,
      usePhoneticSimilarity
    );

    // Add to results if similarity meets the minimum threshold
    if (similarity >= minSimilarity) {
      results.push({
        word: key,
        similarity,
      });
    }
  });

  // Sort the results by similarity in descending order
  const sorted = results.sort((a, b) => b.similarity - a.similarity);

  // Return the top results based on maxRhymes limit
  if (maxRhymes) {
    return sorted.slice(0, maxRhymes);
  }

  return sorted;
};

export const getRandomRhyme = (
  word: string,
  minSimilarity: number = 5
): string => {
  const rhymes = getRhymes(word, minSimilarity);
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
