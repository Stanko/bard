import clsx from 'clsx';
import { apostrophed } from '../../lib/apostrophed';
import type { Verse } from '../../lib/poem';
import { useOptionsStore } from '../../stores/options';
import './index.css';

type VerseProps = React.HTMLAttributes<HTMLDivElement> & {
  verse: Verse;
  active?: boolean;
};

const VerseComponent = ({
  className = '',
  verse,
  active,
  ...props
}: VerseProps) => {
  const options = useOptionsStore((state) => state.options);

  return (
    <div
      {...props}
      className={clsx('verse', className, {
        'verse--active': active,
      })}
    >
      {verse.map((line, lineIndex) => {
        return (
          <div key={lineIndex} className="verse__line">
            <div>
              {active && '> '}
              {line.line.map((word) => apostrophed[word] || word).join(' ')}
            </div>
            {options.debug && line.rhyme && (
              <div className="muted verse__debug">
                <div>
                  <div>- {line.rhyme.word}</div>
                  <div>{line.rhyme.phonemes}</div>
                </div>
                <div>
                  <div>- {line.rhyme.rhyme}</div>
                  <div>{line.rhyme.phonemesRhyme}</div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default VerseComponent;
