import { produce } from 'immer';
import { create } from 'zustand';
import { useOptionsStore } from './options';
import { getVerse, type Verse } from '../lib/poem';
import { useNgramsStore } from './ngrams';

type PoemOptions = {
  haiku: boolean;
  verseCount: number;
  rhymePattern: (number | null)[];
  key: string;
};

export type PoemStore = {
  verses: Verse[];
  cache: Record<string, Verse[]>;

  generating: boolean;
  error: string | null;
  time: number | 'cached';
  abortController: AbortController | null;

  generate: (options: PoemOptions) => void;
};

const TRIES_FOR_BEST_VERSE = 20;

const generateVerse = (signal: AbortSignal) => {
  const options = useOptionsStore.getState().options;
  const ngramsData = useNgramsStore.getState().data[options.dataset];

  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }

    const rhymePattern = [null, 0, 1, 2];

    setTimeout(() => {
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
    }, 1000);

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

  generate: async ({
    verseCount,
    // haiku,
    // rhymePattern,
    key,
  }) => {
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

    for (let i = 0; i < verseCount; i++) {
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
        verse = await generateVerse(abortController.signal);
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

    set(
      produce((state) => {
        state.generating = false;
        state.time = time;
        state.cache[key] = state.verses;
        state.abortController = null;
      })
    );
  },
}));
