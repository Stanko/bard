import { dictionary } from './cmu';

const isVowel = (phoneme: string): boolean => {
  return /^[AEIOU]/.test(phoneme);
};

export type SimilarityResult = {
  word: string;
  rhyme: string;
  phonemes: string;
  phonemesRhyme: string;
  score: number;
  type?: RhymeType;
};

// Define rhyme types with specific characteristics
type RhymeType =
  | 'perfect' // Identical from stressed vowel to end (LIGHT/BRIGHT)
  | 'family' // Similar phonetic ending with minimal variation (SEEM/DREAM)
  | 'additive' // Extra syllable(s) at end (FIND/MINDED)
  | 'subtractive' // Missing syllable(s) at end (WONDER/BLUNDER/THUNDER)
  | 'assonance' // Same vowel sounds, different consonants (LAKE/MATE)
  | 'consonance' // Same consonant pattern, different vowels (MILL/MOLE)
  | 'slant'; // Partial match with significant differences (STONE/GONE)

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
const determineRhymeType = (
  rhymePart1: string[],
  rhymePart2: string[]
): { type: RhymeType; score: number } => {
  // Normalize both rhyme parts for comparison
  const normalized1 = rhymePart1.map(normalizePhoneme);
  const normalized2 = rhymePart2.map(normalizePhoneme);

  // Get the stressed vowel phonemes (first element should be a vowel in rhyme part)
  const stressedVowel1 = normalized1[0];
  const stressedVowel2 = normalized2[0];

  // Perfect match: exactly the same phonemes from stressed vowel to end
  if (normalized1.join('') === normalized2.join('')) {
    return { type: 'perfect', score: 100 };
  }

  // Check vowel match at stress position (essential for most rhyme types)
  const stressedVowelMatch = stressedVowel1 === stressedVowel2;

  if (!stressedVowelMatch) {
    // Different stressed vowels means not a strong rhyme
    // Check for consonance (similar consonant patterns)
    const consonantPattern1 = normalized1.filter((p) => !isVowel(p)).join('');
    const consonantPattern2 = normalized2.filter((p) => !isVowel(p)).join('');

    if (
      consonantPattern1 === consonantPattern2 &&
      consonantPattern1.length > 1
    ) {
      return { type: 'consonance', score: 40 };
    }

    // Check for assonance (similar vowel patterns)
    const vowelPattern1 = normalized1.filter((p) => isVowel(p)).join('');
    const vowelPattern2 = normalized2.filter((p) => isVowel(p)).join('');

    if (vowelPattern1 === vowelPattern2 && vowelPattern1.length > 0) {
      return { type: 'assonance', score: 50 };
    }

    // Weak match - slant rhyme
    return { type: 'slant', score: 20 };
  }

  // Length difference to check for additive/subtractive rhymes
  const lengthDiff = normalized1.length - normalized2.length;

  // Similar phonemes with the same stressed vowel
  if (Math.abs(lengthDiff) <= 1) {
    // Count matching phonemes
    let matchCount = 0;
    const minLength = Math.min(normalized1.length, normalized2.length);

    for (let i = 0; i < minLength; i++) {
      if (normalized1[i] === normalized2[i]) {
        matchCount++;
      }
    }

    // Family rhyme: mostly matching with minor variations
    if (matchCount >= minLength - 1) {
      return { type: 'family', score: 85 };
    }
  }

  // Additive rhyme (one has extra syllables)
  if (lengthDiff > 0) {
    // Check if shorter one is contained at the beginning of longer one
    const isContained = normalized2.every((p, i) => p === normalized1[i]);
    if (isContained) {
      return { type: 'additive', score: 75 };
    }
  } else if (lengthDiff < 0) {
    // Check if shorter one is contained at the beginning of longer one
    const isContained = normalized1.every((p, i) => p === normalized2[i]);
    if (isContained) {
      return { type: 'subtractive', score: 75 };
    }
  }

  // Default to slant rhyme if nothing else matches
  return { type: 'slant', score: 30 };
};

// At the top of getRhymes
const MIN_RHYME_TAIL_LENGTH = 2;

export const getRhymes = (
  word: string | string[],
  options: {
    maxResults?: number;
    includeTypes?: RhymeType[];
    minScore?: number;
  } = {}
): SimilarityResult[] => {
  const {
    maxResults = 40,
    includeTypes = [
      'perfect',
      // 'family',
      // 'additive',
      // 'subtractive'
    ],
    minScore = 50,
  } = options;

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
  const { stressIndex, rhymePart } = extractRhymingPart(wordPhonemes);

  const results: SimilarityResult[] = [];

  // Search dictionary for potential rhymes
  Object.entries(dictionary).forEach(([dictWord, dictPhonemes]) => {
    // Skip same word
    if (dictWord.toUpperCase() === wordStr.toUpperCase()) {
      return;
    }

    // Extract potential rhyme part
    // Extract potential rhyme part
    const { stressIndex: dictStressIndex, rhymePart: dictRhymePart } =
      extractRhymingPart(dictPhonemes);

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

    // Determine rhyme type and score
    const { type, score } = determineRhymeType(rhymePart, dictRhymePart);

    // Filter by requested types and minimum score
    if (includeTypes.includes(type) && score >= minScore) {
      results.push({
        word: wordStr,
        rhyme: dictWord,
        type,
        score,
        phonemes: wordPhonemes.join(' '),
        phonemesRhyme: dictPhonemes.join(' '),
      });
    }
  });

  // Sort by score and return top results
  return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
};
