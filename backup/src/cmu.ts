import * as fs from 'fs';

interface CMUDictionary {
  [word: string]: string[];
}

/**
 * Reads and parses the CMU Pronouncing Dictionary file.
 * @param filePath Path to the CMU dictionary file.
 * @returns Parsed dictionary as an object.
 */
const parseCMUDictionary = (filePath: string): CMUDictionary => {
  const dictionary: CMUDictionary = {};
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');

  for (const line of lines) {
    if (line.startsWith(';;;') || !line.trim()) continue; // Skip comments and empty lines

    const parts = line.split('  '); // CMU uses double space as separator
    if (parts.length < 2) continue;

    const word = parts[0].replace(/\(\d+\)$/, ''); // Remove word variations (e.g., TEST(1))
    const phonemes = parts[1].split(' ');

    dictionary[word] = phonemes;
  }

  fs.writeFileSync('./cmu/cmu.json', JSON.stringify(dictionary));

  return dictionary;
};

export const dictionary = parseCMUDictionary('./cmu/cmudict-0.7b');

export const get = (word: string): string[] | undefined => dictionary[word];

export const sansStresses = (word: string): string[] | undefined =>
  get(word)?.map((p) => p.replace(/\d/g, ''));
