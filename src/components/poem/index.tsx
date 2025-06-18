import clsx from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import useGeneratePoem from '../../hooks/use-generate-poem';
import { getSeed } from '../../lib/get-seed';
import { datasets, type Options } from '../../lib/options';
import { useNgramsStore } from '../../stores/ngrams';
import { useOptionsStore } from '../../stores/options';
import { useSpeechStore } from '../../stores/speech';
import Button from '../button';
import Intro from '../intro';
import SpeechControls from '../speech-controls';
import Verse from '../verse';
import './index.css';

type PoemProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

const optionsToKey = (options: Options) => {
  return `${options.seed}-${options.dataset}-${options.haiku}`;
};

const Poem = ({ className = '', ...props }: PoemProps) => {
  const ngramsStore = useNgramsStore();
  const options = useOptionsStore((state) => state.options);
  const setOptions = useOptionsStore((state) => state.setOptions);
  const activeVerse = useSpeechStore((state) => state.activeVerse);
  const stop = useSpeechStore((state) => state.stop);

  const [lastGeneratedKey, setLastGeneratedKey] = useState('');
  const [isGenerateClicked, setIsGenerateClicked] = useState(false);
  const [loadingDatasetName, setLoadingDatasetName] = useState('');
  const [showNudge, setShowNudge] = useState(false);

  const ngrams = ngramsStore.data[options.dataset];
  const loading = ngramsStore.loading[options.dataset];
  const ngramsError = ngramsStore.errors[options.dataset];

  const currentKey = optionsToKey(options);

  const isAlreadyGenerated = () => {
    return lastGeneratedKey === currentKey;
  };

  const {
    generateVerses,
    verses,
    generating: versesGenerating,
    time,
    error: versesError,
  } = useGeneratePoem();

  const generate = useCallback(() => {
    setShowNudge(false);
    setLastGeneratedKey(currentKey);
    generateVerses();
  }, [currentKey, generateVerses]);

  // TODO this causes for re-generating when user is spinning the dataset control
  //
  // useEffect(() => {
  //   // If the options were changed, but the data is
  //   // already loaded start generating the poem
  //   if (ngrams && !loading) {
  //     generate();
  //   }
  // }, [currentKey]);

  useEffect(() => {
    console.log('currentKey changed');
    setShowNudge(true);
  }, [currentKey]);

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
    if (isGenerateClicked) {
      setIsGenerateClicked(false);
      generate();
    }
  }, [options.seed, isGenerateClicked, generate]);

  useEffect(() => {
    if (ngramsError) {
      setIsGenerateClicked(false);
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

    if (isAlreadyGenerated()) {
      // If the seed hasn't changed, generate a new one
      setOptions({
        seed: getSeed(),
      });
      // Indicate that we need to generate a new poem after the new seed is set
      // because the seed can be changed by the user
      setIsGenerateClicked(true);
    } else {
      generate();
    }
  };

  const generating =
    versesGenerating ||
    ngramsStore.loading[options.dataset] ||
    loadingDatasetName !== '';
  const error = versesError || ngramsError;

  let label = 'Generate ' + (options.haiku ? 'haiku' : 'poem');

  if (loading) {
    label = 'Loading rhymes...';
  } else if (versesGenerating) {
    label = 'Generating poem...';

    for (const line of verses[verses.length - 1] || []) {
      if (line.rhyme?.word && line.rhyme?.rhyme) {
        label = `${line.rhyme.word} / ${line.rhyme.rhyme}`;
        break;
      }
    }
  }

  const showIntro = !error && verses.length === 0 && !generating;
  const showPoem = !error && verses.length > 0;
  const showTime = !error && time > 0 && !generating;

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
              showNudge && !generating && !isAlreadyGenerated(),
          })}
        >
          Click to regenerate!
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
            <>
              <SpeechControls
                className="poem__speech-controls"
                verses={verses}
              />
              <div className="poem__time muted">
                Poem generated in {time.toFixed(1)} ms
                <br />
                You can share the poem by copying the URL.
              </div>
            </>
          )}
        </>
      )}

      {options.debug && lastGeneratedKey && <div>key: {lastGeneratedKey}</div>}
    </div>
  );
};

export default Poem;
