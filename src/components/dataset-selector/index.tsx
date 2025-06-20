import clsx from 'clsx';
import { datasets, type DatasetName } from '../../lib/options';
import RadioInput from '../radio-input';
import RotaryInput from '../rotary-input';
import './index.css';

type DatasetSelectorProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  value: DatasetName;
  onChange: (value: DatasetName) => void;
};

const DatasetSelector = ({
  className = '',
  value,
  onChange,
  ...props
}: DatasetSelectorProps) => {
  const datasetIndex = datasets.findIndex((d) => d.name === value);

  return (
    <div {...props} className={clsx('dataset-selector', className)}>
      <RotaryInput
        className="dataset-selector__rotary"
        value={datasetIndex}
        onChange={(v) => onChange(datasets[v].name as DatasetName)}
        offset={1}
        min={0}
        max={datasets.length - 1}
      />
      <div className="dataset-selector__radios">
        {datasets.map((option) => (
          <label key={option.value} className="dataset-selector__label">
            <RadioInput
              name="dataset"
              value={option.name.toString()}
              checked={value === option.name}
              onChange={() => onChange(option.name as DatasetName)}
              disabled={option.disabled}
            />{' '}
            {option.name}
          </label>
        ))}
      </div>
    </div>
  );
};

export default DatasetSelector;
