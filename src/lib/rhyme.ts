import { dictionary } from './cmu';

const isVowel = (phoneme: string): boolean => {
  return /^[AEIOU]/.test(phoneme);
};

export type SimilarityResult = {
  word: string;
  rhyme: string;
  phonemes: string;
  phonemesRhyme: string;
};

// Extract stressed syllable index and all following phonemes
const extractRhymingPart = (
  phonemes: string[]
): {
  stressIndex: number;
  rhymePart: string[];
} => {
  // Find primary stress (0) or secondary stress (1/2) if no primary exists
  let stressIndex = phonemes.findIndex((p) => p.includes('0'));

  // If no primary stress, look for secondary stress
  if (stressIndex === -1 || stressIndex >= phonemes.length - 2) {
    stressIndex = phonemes.findIndex((p) => p.includes('1'));
  }
  if (stressIndex === -1 || stressIndex >= phonemes.length - 2) {
    stressIndex = phonemes.findIndex((p) => p.includes('2'));
  }

  // If still no stress found, use the last vowel
  if (stressIndex === -1) {
    for (let i = phonemes.length - 1; i >= 0; i--) {
      if (isVowel(phonemes[i])) {
        stressIndex = i;
        break;
      }
    }
  }

  // If still nothing found, use last syllable as fallback
  if (stressIndex === -1 && phonemes.length > 0) {
    stressIndex = Math.max(0, phonemes.length - 2);
  }

  return {
    stressIndex,
    rhymePart: phonemes.slice(stressIndex),
  };
};

// Normalize phoneme by removing stress markers
const normalizePhoneme = (phoneme: string): string => {
  return phoneme.replace(/[0-9]/g, '');
};

// Determine rhyme type based on phonological patterns
const areWordsRhyming = (
  rhymePart1: string[],
  rhymePart2: string[]
): boolean => {
  // Normalize both rhyme parts for comparison
  const normalized1 = rhymePart1.map(normalizePhoneme);
  const normalized2 = rhymePart2.map(normalizePhoneme);

  // Perfect match: exactly the same phonemes from stressed vowel to end
  if (normalized1.join('') === normalized2.join('')) {
    return true;
  }

  return false;
};

// At the top of getRhymes
const MIN_RHYME_TAIL_LENGTH = 2;

export const getRhymes = (
  word: string | string[],
  options: {
    maxResults?: number;
    minScore?: number;
  } = {}
): SimilarityResult[] => {
  const { maxResults = 40 } = options;

  // Get phonemes for the input word
  let wordPhonemes: string[];
  let wordStr: string;

  if (Array.isArray(word)) {
    wordPhonemes = word
      .map((w) => dictionary[w.toUpperCase()] || [])
      .filter((p) => p.length > 0)
      .flat();
    wordStr = word.join(' ');
  } else {
    wordPhonemes = dictionary[word.toUpperCase()] || [];
    wordStr = word;
  }

  // Return empty if word not found in dictionary
  if (!wordPhonemes || wordPhonemes.length === 0) {
    return [];
  }
  // Extract the rhyming part (from stressed vowel to end)
  const { rhymePart } = extractRhymingPart(wordPhonemes);

  const results: SimilarityResult[] = [];

  // Search dictionary for potential rhymes
  Object.entries(dictionary).forEach(([dictWord, dictPhonemes]) => {
    // Skip same word
    if (dictWord.toUpperCase() === wordStr.toUpperCase()) {
      return;
    }

    // Extract potential rhyme part
    const { rhymePart: dictRhymePart } = extractRhymingPart(dictPhonemes);

    // Skip if rhyme part is too short to be meaningful
    if (dictRhymePart.length < MIN_RHYME_TAIL_LENGTH) {
      return;
    }

    // Also skip the input word itself if it's too short
    if (rhymePart.length < MIN_RHYME_TAIL_LENGTH) {
      return [];
    }

    // Skip if no stress info found
    if (dictRhymePart.length === 0) {
      return;
    }

    if (!areWordsRhyming(rhymePart, dictRhymePart)) {
      return;
    }

    results.push({
      word: wordStr,
      rhyme: dictWord,
      phonemes: wordPhonemes.join(' '),
      phonemesRhyme: dictPhonemes.join(' '),
    });
  });

  return results.slice(0, maxResults);
};
