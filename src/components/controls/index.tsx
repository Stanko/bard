import clsx from 'clsx';
import type { DatasetName } from '../../lib/options';
import { getSeed } from '../../lib/get-seed';
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

  return (
    <div {...props} className={clsx('controls', 'px-border', className)}>
      <div className="controls__toggles">
        <Toggle
          label="Debug"
          className="red"
          checked={options.debug}
          onChange={(checked) => setOptions({ debug: checked })}
        />
        <Toggle
          label="Autoplay"
          checked={options.autoplay}
          onChange={(checked) => setOptions({ autoplay: checked })}
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
          value={options.seed}
          onChange={(e) =>
            setOptions({ seed: (e.target as HTMLInputElement).value })
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
        <NgramsState />
      </div>
    </div>
  );
};

export default Controls;
