import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getSeed } from '../../lib/get-seed';
import { datasets, type Options } from '../../lib/options';
import { useNgramsStore } from '../../stores/ngrams';
import { useOptionsStore } from '../../stores/options';
import { usePoemStore } from '../../stores/poem';
import { useSpeechStore } from '../../stores/speech';
import Button from '../button';
import Intro from '../intro';
import SpeechControls from '../speech-controls';
import Verse from '../verse';
import './index.css';
import Share from '../share';

type PoemProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

const optionsToKey = (options: Options) => {
  return `${options.seed}-${options.dataset}-${options.haiku}`;
};

const Poem = ({ className = '', ...props }: PoemProps) => {
  const ngramsStore = useNgramsStore();
  const {
    generate: generatePoem,
    generating: generatingPoem,
    verses,
    time,
    error: poemError,
    cache,
  } = usePoemStore();
  const options = useOptionsStore((state) => state.options);
  const setOptions = useOptionsStore((state) => state.setOptions);
  const activeVerse = useSpeechStore((state) => state.activeVerse);
  const stop = useSpeechStore((state) => state.stop);

  const [lastGeneratedKey, setLastGeneratedKey] = useState('');
  // const [isGenerateClicked, setIsGenerateClicked] = useState(false);
  const isGenerateClickedRef = useRef(false);
  const [loadingDatasetName, setLoadingDatasetName] = useState('');
  const [showNudge, setShowNudge] = useState(false);

  const ngrams = ngramsStore.data[options.dataset];
  const loading = ngramsStore.loading[options.dataset];
  const ngramsError = ngramsStore.errors[options.dataset];

  const currentKey = optionsToKey(options);

  const isAlreadyGenerated = lastGeneratedKey === currentKey;

  const generating =
    generatingPoem ||
    ngramsStore.loading[options.dataset] ||
    loadingDatasetName !== '';
  const error = poemError || ngramsError;

  const generate = useCallback(() => {
    setShowNudge(false);
    setLastGeneratedKey(currentKey);
    generatePoem(currentKey, options.haiku);
  }, [currentKey, generatePoem, options.haiku]);

  useEffect(() => {
    if (ngrams && !loading) {
      // If the correct dataset is loaded, generate the poem
      if (loadingDatasetName === options.dataset) {
        generate();
      }

      // Reset even if other dataset was loaded
      setLoadingDatasetName('');
    }
  }, [ngrams, loading, generate, loadingDatasetName, options.dataset]);

  useEffect(() => {
    if (ngramsError) {
      setLoadingDatasetName('');
    }
  }, [ngramsError]);

  useEffect(() => {
    if (cache[currentKey]) {
      // If the poem is already generated, use the cached version
      setLastGeneratedKey(currentKey);
      generate();
    } else if (isGenerateClickedRef.current) {
      generate();
    } else if (ngrams) {
      generate();
    } else {
      // If the poem is not generated yet, show the nudge
      setShowNudge(true);
    }

    isGenerateClickedRef.current = false;
  }, [currentKey]);

  useEffect(() => {
    if (!generating && verses.length > 0) {
      document.title = `Glitchy BARD - ${verses[0][0].line}`;
    }
  }, [verses, generating]);

  useEffect(() => {
    if (ngramsError) {
      isGenerateClickedRef.current = false;
    }
  }, [ngramsError]);

  const handleGenerateClick = () => {
    // Stop the voice
    stop();

    if (!ngrams && !loading) {
      setLoadingDatasetName(options.dataset);
      ngramsStore.load(options.dataset);
      return;
    }

    if (isAlreadyGenerated) {
      // Indicate that we need to generate a new poem after the new seed is set
      // because the seed can be changed by the user
      isGenerateClickedRef.current = true;

      // If the seed hasn't changed, generate a new one
      setOptions({
        seed: getSeed(),
      });
    } else {
      generate();
    }
  };

  let label = [
    'New',
    options.dataset.toLocaleUpperCase(),
    options.haiku ? 'haiku' : 'poem',
  ].join(' ');

  if (loading) {
    label = 'Loading rhymes...';
  } else if (generatingPoem) {
    label = 'Generating poem...';

    for (const line of verses[verses.length - 1] || []) {
      if (line.rhyme?.word && line.rhyme?.rhyme) {
        label = `${line.rhyme.word} / ${line.rhyme.rhyme}`;
        break;
      }
    }
  }

  const showIntro = !error && verses.length === 0 && !generating;
  const showPoem = !error && verses.length > 0 && !showNudge;
  const showTime = !error && time !== 0 && !generating;
  const showParametersChanged = showNudge && !showIntro && !generating;

  const activeDataset = datasets.find(
    (dataset) => dataset.name === options.dataset
  );

  return (
    <div {...props} className={clsx('poem', className)}>
      <div className="poem__generate-wrapper">
        <Button
          disabled={generating}
          onClick={handleGenerateClick}
          className={clsx('poem__generate', activeDataset?.theme)}
        >
          {label}
        </Button>
        <div
          className={clsx('poem__nudge', {
            'poem__nudge--show':
              showNudge && !generating && !isAlreadyGenerated,
          })}
        >
          Generate!
        </div>
      </div>

      {error && (
        <div className="red">
          <div>
            Something went wrong, please trying oiling me a little bit and try
            again.
          </div>
          {options.debug && <pre className="poem__error">{error}</pre>}
        </div>
      )}

      {showIntro && <Intro />}

      {showPoem && (
        <>
          <div className="poem__verses">
            {verses.map((verse, index) => {
              return (
                <Verse
                  key={index}
                  verse={verse}
                  active={index === activeVerse}
                />
              );
            })}
          </div>

          {showTime && (
            <div>
              <SpeechControls
                className="poem__speech-controls"
                verses={verses}
              />
              <div className="poem__time muted">
                {typeof time === 'string'
                  ? `Pulled from cache.`
                  : `Generated in ${time.toFixed(1)} ms.`}
              </div>
              <Share className="poem__share" />
            </div>
          )}
        </>
      )}

      {showParametersChanged && (
        <p className="muted">
          Dataset has changed.
          <br />
          When you click to generate a new poem, {activeDataset?.name} dataset
          will be downloaded ({activeDataset?.size} Mb).
        </p>
      )}

      {options.debug && lastGeneratedKey && <div>key: {lastGeneratedKey}</div>}
    </div>
  );
};

export default Poem;
