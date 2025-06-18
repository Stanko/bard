export let dictionary: Record<string, string[]> = {};

const init = async () => {
  dictionary = await fetch('./cmu.json').then((res) => res.json());
};

init();

export const get = (word: string): string[] | undefined => dictionary[word];

export const sansStresses = (word: string): string[] | undefined =>
  get(word)?.map((p) => p.replace(/\d/g, ''));
