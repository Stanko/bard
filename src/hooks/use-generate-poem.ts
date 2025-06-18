// import { apostrophed } from '../lib/apostrophed';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Verse } from '../lib/poem';
import { getHaiku, getVerse } from '../lib/poem';
import { useNgramsStore } from '../stores/ngrams';
import { useOptionsStore } from '../stores/options';

const TRIES_FOR_BEST_VERSE = 20;

const useGeneratePoem = () => {
  const options = useOptionsStore((state) => state.options);
  const rng = useOptionsStore((state) => state.rng);
  const ngramsData = useNgramsStore((state) => state.data);

  const [verses, setVerses] = useState<Verse[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [time, setTime] = useState(0);
  const versesLeftRef = useRef(4);
  const rhymePattern = useRef<(number | null)[]>([]);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const processNextItem = useCallback(() => {
    if (versesLeftRef.current > 0) {
      try {
        versesLeftRef.current--;
        const ngrams = ngramsData[options.dataset];

        const start = performance.now();

        if (!ngrams) {
          return;
        }

        const maxRhymes = rhymePattern.current.filter(
          (rhyme) => rhyme !== null
        ).length;

        let currentVerse: Verse = getVerse(
          ngrams,
          4,
          true,
          rhymePattern.current
        );
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

          currentVerse = getVerse(ngrams, 4, true, rhymePattern.current);
        }

        setTime((prev) => prev + performance.now() - start);

        setVerses((prev) => [...prev, bestVerse]);

        timeoutId.current = setTimeout(processNextItem, 30); // Schedule next item
      } catch (error) {
        setGenerating(false);

        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
          timeoutId.current = null;
        }

        setError(String(error));
      }
    } else {
      timeoutId.current = null;
      setGenerating(false);
    }
  }, [options.dataset, ngramsData]);

  // Main function to initiate the calculations
  const generateVerses = useCallback(() => {
    setVerses([]);

    setGenerating(true);
    setError(null);
    setTime(0);
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    if (options.haiku) {
      const start = performance.now();
      const haiku = getHaiku(ngramsData[options.dataset]);

      setVerses([haiku]);
      setGenerating(false);
      setTime(performance.now() - start);

      return;
    }

    versesLeftRef.current = 4;
    rhymePattern.current = rng() < 0.5 ? [null, null, 0, 1] : [null, 0, 1, 2];

    // Start processing items in animation frames if not already running
    if (!timeoutId.current) {
      timeoutId.current = setTimeout(processNextItem, 30);
    }
  }, [processNextItem, rng]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  return { verses, generateVerses, generating, time, error };
};

export default useGeneratePoem;
