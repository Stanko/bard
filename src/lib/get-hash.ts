import type { HashOptions } from './options';

export const getHash = (options: HashOptions): string => {
  return Object.entries(options)
    .map(([key, value]) => {
      return `${key}:${value.toString()}`;
    })
    .join('/');
};
