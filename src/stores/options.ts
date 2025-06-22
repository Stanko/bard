import { produce } from 'immer';
import seedrandom from 'seedrandom';
import { create } from 'zustand';
import { getHash } from '../lib/get-hash';
import {
  getDefaultLocalStorageOptions,
  type HashOptions,
  type LocalStorageOptions,
} from '../lib/options';
import { random } from '../lib/random';
import { getValuesFromHash } from '../components/options';
import { getSeed } from '../lib/get-seed';

const setHash = (options: HashOptions) => {
  const hash = getHash(options);

  if (window.location.hash.slice(1) !== hash) {
    window.location.hash = hash;
  }
};

export type OptionsStore = {
  options: HashOptions;
  localOptions: LocalStorageOptions;
  setOptions: (newOptions: Partial<HashOptions>) => void;
  setLocalOptions: (newOptions: Partial<LocalStorageOptions>) => void;
  rng: (min?: number, max?: number, integer?: boolean) => number;
};

const initLocalOptions: LocalStorageOptions = getDefaultLocalStorageOptions();
const initOptions = getValuesFromHash();

if (!initOptions.seed) {
  // If no seed is provided, generate a random one
  initOptions.seed = getSeed();
}

const defaultSeededRNG = seedrandom(initOptions.seed);

export const useOptionsStore = create<OptionsStore>()((set) => ({
  options: initOptions,
  localOptions: initLocalOptions,
  setOptions: (newOptions: Partial<HashOptions>) => {
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
  setLocalOptions: (newOptions: Partial<LocalStorageOptions>) => {
    set(
      produce((state: OptionsStore) => {
        const localOptions = { ...state.localOptions, ...newOptions };
        state.localOptions = localOptions;

        localStorage.setItem('debug', String(localOptions.debug));
        localStorage.setItem('autoplay', String(localOptions.autoplay));
      })
    );
  },
  rng: (min = 0, max = 1, integer = false) => {
    return random(min, max, integer, defaultSeededRNG);
  },
}));
