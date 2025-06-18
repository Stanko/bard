import type seedrandom from 'seedrandom';

export const random = (
  min: number,
  max: number,
  integer: boolean = false,
  rng?: seedrandom.PRNG
): number => {
  const value = (rng || Math.random)() * (max - min) + min;

  if (integer) {
    return Math.round(value);
  }

  return value;
};
