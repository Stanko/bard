import type { Options } from './options';

export const getHash = (options: Options): string => {
  return Object.entries(options)
    .map(([key, value]) => {
      return `${key}:${value.toString()}`;
    })
    .join('/');
};
