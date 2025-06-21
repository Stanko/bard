import { produce } from 'immer';
import seedrandom from 'seedrandom';
import { create } from 'zustand';
import { getHash } from '../lib/get-hash';
import { type Options } from '../lib/options';
import { random } from '../lib/random';
import { getValuesFromHash } from '../components/options';

const setHash = (options: Options) => {
  const hash = getHash(options);

  if (window.location.hash.slice(1) !== hash) {
    window.location.hash = hash;
  }
};

export type OptionsStore = {
  options: Options;
  setOptions: (newOptions: Partial<Options>) => void;
  rng: (min?: number, max?: number, integer?: boolean) => number;
};

const initOptions = getValuesFromHash();
const defaultSeededRNG = seedrandom(initOptions.seed);

export const useOptionsStore = create<OptionsStore>()((set) => ({
  options: initOptions,
  setOptions: (newOptions: Partial<Options>) => {
    set(
      produce((state: OptionsStore) => {
        const options = { ...state.options, ...newOptions };
        state.options = options;

        // Always reset the rng when options change
        const seededRNG = seedrandom(options.seed);
        state.rng = (min = 0, max = 1, integer = false) => {
          return random(min, max, integer, seededRNG);
        };

        setHash(options);
      })
    );
  },
  rng: (min = 0, max = 1, integer = false) => {
    return random(min, max, integer, defaultSeededRNG);
  },
}));
