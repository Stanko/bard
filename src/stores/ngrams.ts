import { create } from 'zustand';
import { produce } from 'immer';
import type { NGram } from '../lib/ngrams';

export type NgramsStore = {
  data: Record<string, NGram[]>;
  loading: Record<string, boolean>;
  progress: Record<string, number>;
  errors: Record<string, string | null>;
  load: (path: string) => Promise<void>;
};

// Estimate compression ratio for JSON data
const COMPRESSION_RATIO =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 10 // In production actual compression is between 1/8 and 1/10
    : 1;

const fetchWithProgress = async (
  url: string,
  onProgress: (progress: number) => void
): Promise<NGram> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  const contentLength = response.headers.get('Content-Length');
  if (!contentLength) {
    // Fallback if no Content-Length header
    const json = await response.json();
    onProgress(100);
    return json;
  }

  const total = parseInt(contentLength, 10) * COMPRESSION_RATIO;
  let loaded = 0;

  const reader = response.body!.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    chunks.push(value);
    loaded += value.length;
    onProgress((loaded / total) * 100);
  }

  const blob = new Blob(chunks);
  const text = await blob.text();

  return JSON.parse(text);
};

export const useNgramsStore = create<NgramsStore>()((set, get) => ({
  data: {},
  loading: {},
  progress: {},
  errors: {},

  load: async (path: string) => {
    const state = get();

    // If the data is already loaded or still loading, do nothing
    if (state.data[path] || state.loading[path]) {
      return;
    }

    set(
      produce((state: NgramsStore) => {
        state.loading[path] = true;
        state.progress[path] = 40;
        state.errors[path] = null;
      })
    );

    try {
      const urls = [
        `./ngrams/${path}/ngrams-2.json`,
        `./ngrams/${path}/ngrams-3.json`,
        `./ngrams/${path}/ngrams-4.json`,
      ];
      // Initialize progress for each n-gram
      const progressValues = [0, 0, 0];

      const updateProgress = () => {
        let progress =
          (progressValues[0] + progressValues[1] + progressValues[2]) / 3;

        if (progress > 95) {
          progress = 95;
        }

        set(
          produce((state: NgramsStore) => {
            state.progress[path] = progress;
          })
        );
      };

      const promises = urls.map((url, index) =>
        fetchWithProgress(url, (progress) => {
          progressValues[index] = progress;
          updateProgress();
        })
      );

      const results = await Promise.all(promises);

      set(
        produce((state: NgramsStore) => {
          state.data[path] = results;
          state.loading[path] = false;
          state.progress[path] = 100;
        })
      );
    } catch (error) {
      set(
        produce((state: NgramsStore) => {
          state.errors[path] = String(error);
          state.loading[path] = false;
          state.progress[path] = 0;
        })
      );
    }
  },
}));
