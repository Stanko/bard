import { useOptionsStore } from '../stores/options';

let audioContext: AudioContext | null = null;
const soundBuffers: Record<string, AudioBuffer> = {};

type Sound = 'click' | 'rotary' | 'keyboard';

const sounds: {
  name: Sound;
  url: string;
}[] = [
  {
    name: 'click',
    url: '/sounds/click.mp3',
  },
  {
    name: 'rotary',
    url: '/sounds/rotary.mp3',
  },
  {
    name: 'keyboard',
    url: '/sounds/keyboard.mp3',
  },
];

export const initSounds = () => {
  if (!audioContext) {
    const webkitWindow = window as unknown as {
      webkitAudioContext: AudioContext;
    };

    audioContext = new (window.AudioContext ||
      webkitWindow.webkitAudioContext)();

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    sounds.forEach((sound) => {
      load(sound.url, sound.name);
    });
  }
};

if (typeof document !== 'undefined') {
  document.addEventListener('touchstart', () => {
    initSounds();
  });
  document.addEventListener('click', () => {
    initSounds();
  });
}

async function load(url: string, name: string) {
  if (!audioContext) {
    console.warn('AudioContext not initialized. Click on the page first.');
    return;
  }

  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    soundBuffers[name] = audioBuffer;
    console.log(`Sound "${name}" loaded successfully.`);
  } catch (error) {
    console.error(`Error loading or decoding sound "${name}":`, error);
  }
}

export function play(name: Sound) {
  const sfx = useOptionsStore.getState().localOptions.sfx;

  if (!sfx) {
    return;
  }

  if (!audioContext || !soundBuffers[name]) {
    console.warn(`AudioContext not ready or sound "${name}" not loaded.`);
    return;
  }

  const source = audioContext.createBufferSource();
  source.buffer = soundBuffers[name];
  source.connect(audioContext.destination);
  source.start(0); // Play immediately
}
