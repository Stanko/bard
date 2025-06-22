import clsx from 'clsx';
import { useEffect } from 'react';
import type { Verse } from '../../lib/poem';
import { speak } from '../../lib/speak';
import { useOptionsStore } from '../../stores/options';
import { useSpeechStore } from '../../stores/speech';
import SmallButton from '../small-button';
import './index.css';

type SpeechControlsProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  verses: Verse[];
};

const checkIfVoiceExists = async (voice: string): Promise<boolean> => {
  if (typeof window === 'undefined') {
    return false; // Mock for pre-rendering
  }

  return new Promise((resolve) => {
    // Wait for voices to be loaded
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener(
        'voiceschanged',
        () => {
          const voices = window.speechSynthesis.getVoices();
          resolve(
            voices.some((v) => v.name.toLowerCase() === voice.toLowerCase())
          );
        },
        { once: true }
      );
    } else {
      const voices = window.speechSynthesis.getVoices();
      resolve(voices.some((v) => v.name.toLowerCase() === voice.toLowerCase()));
    }
  });
};

let noOrganVoice = false;

checkIfVoiceExists('Organ').then((exists) => {
  noOrganVoice = !exists;
});

const SpeechControls = ({
  className = '',
  verses,
  ...props
}: SpeechControlsProps) => {
  const {
    activeVerse,
    setActiveVerse,
    voice,
    play,
    sing,
    stop,
    setRemoveEndListener,
  } = useSpeechStore();
  const localOptions = useOptionsStore((state) => state.localOptions);

  useEffect(() => {
    if (localOptions.autoplay && verses.length > 0) {
      play();
    }
  }, [verses]);

  useEffect(() => {
    if (activeVerse >= 0 && activeVerse < verses.length) {
      const verse = verses[activeVerse];

      let text = '';

      // Sing
      if (voice === 'organ') {
        // No punctuation for singing
        text = verse.map((line) => line.line).join(' ');
      } else {
        text = verse.map((line) => line.line).join('. ') + '.';
      }

      speak(text, voice, () => {
        if (activeVerse >= 0 && activeVerse + 1 < verses.length) {
          setActiveVerse(activeVerse + 1);
        } else {
          setActiveVerse(-1);
        }
      }).then((method) => {
        setRemoveEndListener(method);
      });
    } else {
      window.speechSynthesis.cancel();
    }
  }, [activeVerse, verses, voice, setActiveVerse, setRemoveEndListener]);

  const stopDisabled = activeVerse === -1;
  const playDisabled = verses.length === 0 || activeVerse > -1;

  return (
    <>
      <div {...props} className={clsx('speech-controls', className)}>
        <SmallButton
          disabled={playDisabled}
          onClick={() => play()}
          title="Read poem"
        >
          <svg
            viewBox="0 0 5 5"
            shapeRendering="crispEdges"
            className="speech-controls__play-icon"
          >
            <path
              fill="currentColor"
              d="M 0 0 h 2 v 1 h 2 v 1 h1 v 1 h -1 v 1 h -2 v 1 h -2 z"
            />
          </svg>
        </SmallButton>
        <SmallButton
          className="speech-controls__sing"
          disabled={playDisabled || noOrganVoice}
          onClick={sing}
          title={'Sing poem'}
        >
          <svg
            viewBox="0 0 6 7"
            shapeRendering="crispEdges"
            className="speech-controls__sing-icon"
          >
            <path
              fill="currentColor"
              d="M 3 0 h1 v1 h1 v1 h1 v1 h-1 v-1 h-1 v4 h-1 v1 h-2 v-1 h-1 v-1 h1 v-1 h2 z"
            />
          </svg>
        </SmallButton>
        <SmallButton
          className="red speech-controls__stop"
          disabled={stopDisabled}
          onClick={stop}
          title="Stop"
        >
          <svg
            viewBox="0 0 4 4"
            shapeRendering="crispEdges"
            className="speech-controls__stop-icon"
          >
            <path fill="currentColor" d="M 0 0 h 4 v 4 H 0 z" />
          </svg>
        </SmallButton>
      </div>
      {noOrganVoice && (
        <div className="red">
          Unfortunately, singing works only on iOS and macOS for now
        </div>
      )}
    </>
  );
};

export default SpeechControls;
