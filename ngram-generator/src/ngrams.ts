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

  return (
    text
      // replace 3+ spaces with a full stop to indicate a sentence break
      .replace(/\s\s+/g, '.')
      // replace multiple full stops with a single one
      .replace(/\.+/g, '.')
      // replace multiple spaces with a single one
      .replace(/\s+/g, ' ')
      // now split into sentences
      .split(splitRegex)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0)
      .map((sentence) => {
        const words = sentence
          .toUpperCase()
          // replace long dash and en dash (— and –) with hyphen (-)
          .replace(/(—|–)/g, '-')
          // keep apostrophes that are in the middle of words
          .replace(/('\s|\s')/g, '')
          // keep dashes that are in the middle of words
          .replace(/(-\s|\s-)/g, '')
          // replace multiple apostrophes with a single one
          .replace(/'+/g, "'")
          // replace multiple dashes with a single one
          .replace(/-+/g, '-')
          // remove any character that is not a letter, hyphen, apostrophe, or space
          .replace(/[^A-Z-'\s]/g, '')
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
      })
  );
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
