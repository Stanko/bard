export let dictionary: Record<string, string[]> = {};

const init = async () => {
  if (typeof window === 'undefined') {
    return; // Check for pre-rendering
  }
  dictionary = await fetch('./cmu.json').then((res) => res.json());
};

init();

export const get = (word: string): string[] | undefined => dictionary[word];

export const sansStresses = (word: string): string[] | undefined =>
  get(word)?.map((p) => p.replace(/\d/g, ''));
