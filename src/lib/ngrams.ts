import { useOptionsStore } from '../stores/options';

export type Item = {
  total: number;
  followUps: { [key: string]: number };
};

export type NGram = {
  n: number;
  map: { [key: string]: Item };
};

const START_TOKEN = '<START>';
const END_TOKEN = '<END>';

const selectRandomFromItem = (item: Item): string => {
  const total = item.total;

  const rng = useOptionsStore.getState().rng;
  const random = Math.floor(rng(0, total));

  let current = 0;
  let next = '';

  for (const word in item.followUps) {
    current += item.followUps[word];
    if (current >= random) {
      next = word;
      break;
    }
  }

  return next;
};

export const generateSentence = (
  nGrams: NGram[],
  reversed: boolean = false,
  startWord?: string
): string[] => {
  const bigrams = nGrams.find((nGram) => nGram.n === 2) as NGram;

  if (startWord && !bigrams.map[startWord]) {
    return [];
  }

  if (startWord && startWord.length < 3) {
    startWord = '';
  }

  const firstToken = reversed ? END_TOKEN : START_TOKEN;
  const lastToken = reversed ? START_TOKEN : END_TOKEN;

  let sentence = [firstToken];

  if (startWord) {
    sentence.push(startWord);
  }

  let attempts = 0;
  const maxAttempts = 100;

  while (
    sentence[sentence.length - 1] !== lastToken &&
    attempts < maxAttempts
  ) {
    nGrams.forEach((nGram) => {
      const lastWords = sentence.slice(1 - nGram.n).join(' ');

      const item = nGram.map[lastWords];

      if (item) {
        const nextWord = selectRandomFromItem(item);
        sentence.push(nextWord);
      }
    });

    attempts++;
  }

  // Remove start and end tokens
  sentence = sentence.slice(1, -1);

  if (reversed) {
    sentence = sentence.reverse();
  }

  return sentence;
};
