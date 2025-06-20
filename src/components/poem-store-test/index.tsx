import clsx from 'clsx';
import { useState } from 'react';
import { usePoemStore } from '../../stores/poem';
import Button from '../button';
import SmallButton from '../small-button';
import './index.css';

type PoemStoreTestProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
  className?: string;
};

const PoemStoreTest = ({ className = '', ...props }: PoemStoreTestProps) => {
  const poemStore = usePoemStore();
  const [key, setKey] = useState('key1');
  const [count, setCount] = useState(4);

  const debugData = {
    ...poemStore,
    verses: poemStore.verses.map((v) => {
      return v.map((l) => l.line.join(' '));
    }),
    cache: Object.keys(poemStore.cache),
  };

  return (
    <div {...props} className={clsx('', className)}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="range"
          min="1"
          max="6"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          style={{ appearance: 'auto' }}
        />
        {count}
      </div>
      {poemStore.generating && <h1>Loading...</h1>}
      <input
        style={{
          outline: 'none',
          border: 'var(--px) solid var(--outline)',
          padding: '0.5rem',
          marginBlock: '1rem',
        }}
        value={key}
        onChange={(e) => setKey(e.target.value)}
      />
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Button
          onClick={() => {
            poemStore.generate({
              key,
              haiku: false,
              rhymePattern: [null, 0, 1, 2],
              verseCount: count,
            });
          }}
        >
          Generate
        </Button>
        <SmallButton
          className="red"
          onClick={() => {
            poemStore.abortController?.abort();
          }}
        >
          A
        </SmallButton>
      </div>
      <h2>{poemStore.verses.length}</h2>
      <pre>{JSON.stringify(debugData, null, 2)}</pre>
    </div>
  );
};

export default PoemStoreTest;
