import { produce } from 'immer';
import { create } from 'zustand';
import { useOptionsStore } from './options';
import { getHaiku, getVerse, type Verse } from '../lib/poem';
import { useNgramsStore } from './ngrams';
import type { NGram } from '../lib/ngrams';

export type PoemStore = {
  verses: Verse[];
  cache: Record<string, Verse[]>;

  generating: boolean;
  error: string | null;
  time: number | 'cached';
  abortController: AbortController | null;

  generate: (key: string, haiku: boolean) => void;
};

const VERSE_COUNT = 4;
const TRIES_FOR_BEST_VERSE = 20;
const MAX_CACHE_SIZE = 20;

let timeout: ReturnType<typeof setTimeout> | 0 = 0;

const generateVerse = (
  rhymePattern: (null | number)[],
  ngramsData: NGram[],
  signal: AbortSignal
) => {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }

    timeout = setTimeout(() => {
      const maxRhymes = rhymePattern.filter((rhyme) => rhyme !== null).length;

      let currentVerse: Verse = getVerse(ngramsData, 4, true, rhymePattern);
      let bestVerse: Verse = currentVerse;

      for (let t = 0; t < TRIES_FOR_BEST_VERSE; t++) {
        const rhymesCount = currentVerse.reduce((sum, line) => {
          if (line.rhyme) {
            return sum + 1;
          }
          return sum;
        }, 0);

        if (rhymesCount === maxRhymes) {
          bestVerse = currentVerse;
          break;
        } else if (rhymesCount === maxRhymes - 1) {
          bestVerse = currentVerse;
        } else if (rhymesCount === maxRhymes - 2) {
          bestVerse = currentVerse;
        }

        currentVerse = getVerse(ngramsData, 4, true, rhymePattern);
      }

      resolve(bestVerse);
    }, 30);

    signal.addEventListener('abort', () => {
      reject(signal.reason);
    });
  });
};

export const usePoemStore = create<PoemStore>()((set, get) => ({
  verses: [],
  abortController: null,
  generating: false,
  error: null,
  time: 0,
  cache: {},

  generate: async (key: string, haiku: boolean = false) => {
    const rng = useOptionsStore.getState().rng;
    const options = useOptionsStore.getState().options;
    const ngramsData = useNgramsStore.getState().data[options.dataset];

    clearTimeout(timeout);

    if (get().cache[key]) {
      set(
        produce((state) => {
          state.verses = state.cache[key];
          state.time = 'cached';
        })
      );
      return;
    }

    const abortController = new AbortController();

    set({
      generating: true,
      abortController,
      error: null,
      verses: [],
      time: 0,
    });

    let time = 0;
    const rhymePattern = rng() < 0.5 ? [null, null, 0, 1] : [null, 0, 1, 2];

    if (haiku) {
      const start = performance.now();
      set({
        verses: [getHaiku(ngramsData)],
      });
      time += performance.now() - start;
    } else {
      for (let i = 0; i < VERSE_COUNT; i++) {
        if (abortController.signal.aborted) {
          set({
            generating: false,
            error: abortController.signal.reason,
            abortController: null,
            verses: [],
            time: 0,
          });
          return;
        }

        let verse;
        const start = performance.now();

        try {
          verse = await generateVerse(
            rhymePattern,
            ngramsData,
            abortController.signal
          );
        } catch (error) {
          set({
            generating: false,
            error: String(error),
            abortController: null,
            verses: [],
            time: 0,
          });
          return;
        }
        time += performance.now() - start;

        set(
          produce((state) => {
            state.verses.push(verse);
          })
        );
      }
    }

    set(
      produce((state) => {
        state.generating = false;
        state.time = time;
        state.cache[key] = state.verses;
        state.abortController = null;

        if (Object.keys(state.cache).length > MAX_CACHE_SIZE) {
          // Remove the oldest entry if cache exceeds max size
          const oldestKey = Object.keys(state.cache)[0];
          delete state.cache[oldestKey];
        }
      })
    );
  },
}));
