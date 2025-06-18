import { useCallback, useEffect } from 'react';
import { getHash } from '../../lib/get-hash';
import {
  datasets,
  getDefaultOptions,
  type DatasetName,
  type Options,
} from '../../lib/options';
import { getSeed } from '../../lib/get-seed';
import { useOptionsStore } from '../../stores/options';

const datasetKeys = datasets.map((d) => d.name);

const parsers: {
  [K in keyof Options]: (value: string) => Options[K];
} = {
  debug: (value: string): boolean => value === 'true',
  autoplay: (value: string): boolean => value === 'true',
  haiku: (value: string): boolean => value === 'true',
  dataset: (value: string): DatasetName => {
    if (datasetKeys.includes(value as DatasetName)) {
      return value as DatasetName;
    }
    return 'fz'; // default dataset
  },
  seed: (value: string): string => {
    if (typeof value === 'string') {
      return value;
    }
    return getSeed();
  },
};

// Helper function to maintain type safety
const applyParser = <K extends keyof Options>(
  key: K,
  value: string,
  opts: Options
): void => {
  opts[key] = parsers[key](value);
};

const getValuesFromHash = (): Options => {
  const options = getDefaultOptions();

  if (typeof window === 'undefined') {
    return options;
  }

  const hash = window.location.hash.slice(1);

  hash.split('/').forEach((part) => {
    const [untypedKey, value] = part.split(':');
    if (!untypedKey || !value) {
      return options;
    }

    const key = untypedKey as keyof Options;

    if (key in parsers) {
      applyParser(key, value, options);
    }
  });

  return options;
};

const OptionsComponent = ({ children }: { children: React.ReactNode }) => {
  const { options, setOptions } = useOptionsStore();

  const handleHashChange = useCallback(() => {
    const newOptions = getValuesFromHash();

    if (getHash(options) !== window.location.hash.slice(1)) {
      setOptions(newOptions);
    }
  }, [options, setOptions]);

  useEffect(() => {
    handleHashChange();
  }, []);

  useEffect(() => {
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [handleHashChange]);

  return children;
};

export default OptionsComponent;
