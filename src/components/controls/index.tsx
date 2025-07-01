import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { getSeed } from '../../lib/get-seed';
import type { DatasetName } from '../../lib/options';
import { useOptionsStore } from '../../stores/options';
import DatasetSelector from '../dataset-selector';
import NgramsState from '../ngrams-state';
import SmallButton from '../small-button';
import TextInput from '../text-input';
import Toggle from '../toggle';
import './index.css';

type ControlsProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

const Controls = ({ className = '', ...props }: ControlsProps) => {
  const options = useOptionsStore((state) => state.options);
  const setOptions = useOptionsStore((state) => state.setOptions);

  const localOptions = useOptionsStore((state) => state.localOptions);
  const setLocalOptions = useOptionsStore((state) => state.setLocalOptions);

  const [localSeedValue, setLocalSeedValue] = useState<string>(options.seed);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | 0>(0);

  // Using local state in order to debounce the seed input changes,
  // because poems are automatically generated on every seed change
  useEffect(() => {
    clearTimeout(timeoutRef.current);

    if (localSeedValue !== options.seed) {
      timeoutRef.current = setTimeout(() => {
        setOptions({ seed: localSeedValue });
      }, 500);
    }
  }, [localSeedValue]);

  useEffect(() => {
    if (localSeedValue !== options.seed) {
      clearTimeout(timeoutRef.current);
      setLocalSeedValue(options.seed);
    }
  }, [options.seed]);

  useEffect(() => {
    clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div {...props} className={clsx('controls', 'px-border', className)}>
      <div className="controls__toggles">
        <Toggle
          label="Debug"
          className="red"
          checked={localOptions.debug}
          onChange={(checked) => setLocalOptions({ debug: checked })}
        />
        <Toggle
          label="Autoplay"
          checked={localOptions.autoplay}
          onChange={(checked) => setLocalOptions({ autoplay: checked })}
        />
        <Toggle
          label="SFX"
          className="purple"
          checked={localOptions.sfx}
          onChange={(checked) => setLocalOptions({ sfx: checked })}
        />
        <Toggle
          label="Haiku"
          className="yellow"
          checked={options.haiku}
          onChange={(checked) => setOptions({ haiku: checked })}
        />
      </div>
      <div className="controls__seed">
        <TextInput
          value={localSeedValue}
          onChange={(e) =>
            setLocalSeedValue((e.target as HTMLInputElement).value)
          }
          className="green controls__seed-input"
          label="Seed"
        />
        <SmallButton
          className="green controls__seed-button"
          onClick={() => setOptions({ seed: getSeed() })}
          title="New seed"
        >
          <span aria-hidden="true">»</span>
        </SmallButton>
      </div>

      <div>Dataset</div>
      <div className="controls__datasets">
        <DatasetSelector
          value={options.dataset}
          onChange={(dataset) => {
            setOptions({ dataset: dataset as DatasetName });
          }}
        />
        <NgramsState className="controls__ngrams-state" />
      </div>
    </div>
  );
};

export default Controls;
