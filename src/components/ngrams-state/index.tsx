import clsx from 'clsx';
import { datasets } from '../../lib/options';
import { useNgramsStore } from '../../stores/ngrams';
import './index.css';

type NgramsStateProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

const NgramsState = ({ className = '', ...props }: NgramsStateProps) => {
  const ngramsStore = useNgramsStore();

  return (
    <div {...props} className={clsx('ngrams-state', className)}>
      {datasets.map((dataset) => {
        const progress = ngramsStore.progress[dataset.name];
        const error = ngramsStore.errors[dataset.name];

        return (
          <div
            key={dataset.name}
            className={clsx('ngrams-state__progress', dataset.theme)}
          >
            {error && <div className="ngrams-state__error">error</div>}
            {!progress && (
              <div className="ngrams-state__size">{dataset.size} Mb</div>
            )}
            <div
              className="ngrams-state__bar"
              style={{
                width: `${progress || 0}%`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default NgramsState;
