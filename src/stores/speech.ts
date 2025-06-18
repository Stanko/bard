import { produce } from 'immer';
import { create } from 'zustand';

export type SpeechStore = {
  activeVerse: number;
  removeEndListener: (() => void) | null;
  voice: string;

  setActiveVerse: (verse: number) => void;
  setRemoveEndListener: (removeEndListener: (() => void) | null) => void;

  play: (voice?: string) => void;
  sing: () => void;
  stop: () => void;
};

export const useSpeechStore = create<SpeechStore>()((set, get) => ({
  activeVerse: -1,
  voice: '',
  removeEndListener: null,

  setActiveVerse: (verse: number) => {
    set(
      produce((state) => {
        state.activeVerse = verse;

        if (verse < 0) {
          state.utterance = null;
        }
      })
    );
  },

  setRemoveEndListener: (method: (() => void) | null) => {
    set(
      produce((state) => {
        state.removeEndListener = method;
      })
    );
  },

  play: (voice: string = '') => {
    set(
      produce((state) => {
        state.activeVerse = 0;
        state.voice = voice;
      })
    );
  },
  sing: () => {
    get().play('organ');
  },
  stop: () => {
    const { removeEndListener } = get();

    if (removeEndListener) {
      removeEndListener();
      // window.speechSynthesis.cancel();
    }

    set(
      produce((state) => {
        state.activeVerse = -1;
        state.synth = null;
      })
    );
  },
}));
