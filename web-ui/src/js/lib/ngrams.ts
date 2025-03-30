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

export const textToSentences = (
  text: string,
  reversed: boolean = false,
  splitOnNewLines: boolean = true
): string[][] => {
  const splitRegex = splitOnNewLines ? /[.!?\n]+/ : /[.!?]/;
  const WORDS_TO_REMOVE = ["'", '-'];

  return text
    .split(splitRegex)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0)
    .map((sentence) => {
      const words = sentence
        .toUpperCase()
        // TODO
        // Not sure what to do here
        // Removing apostrophes is not great, because it removes it from words like "I'm"
        // but some texts have apostrophes around conversations which is even worse
        .replace(/[^A-Z-\s]/g, '')
        // Remove multiple occurrences of "-" with a single one
        .replace(/-+/g, '-')
        .split(/\s+/)
        .filter((word) => word.length)
        .filter((word) => !WORDS_TO_REMOVE.includes(word));

      return [START_TOKEN, ...words, END_TOKEN];
    })
    .filter((sentence) => sentence.length > 2)
    .map((sentence) => {
      if (reversed) {
        return sentence.reverse();
      }
      return sentence;
    });
};

export const generateNGrams = (sentences: string[][], n: number): NGram => {
  const nGram: NGram = {
    n,
    map: {},
  };

  const k = n - 1;

  sentences.forEach((sentence) => {
    for (let i = 0; i < sentence.length - k; i++) {
      const sequence = sentence.slice(i, i + k).join(' ');
      const next = sentence[i + k];

      const item = nGram.map[sequence];

      if (item) {
        if (item.followUps[next]) {
          item.followUps[next]++;
        } else {
          item.followUps[next] = 1;
        }
        item.total++;
      } else {
        nGram.map[sequence] = {
          total: 1,
          followUps: { [next]: 1 },
        };
      }
    }
  });

  return nGram;
};

const selectRandomFromItem = (item: Item): string => {
  const total = item.total;
  const random = Math.floor(Math.random() * total);

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
