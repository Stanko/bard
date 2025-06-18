import { getSeed } from './get-seed';

export type DatasetName = 'fz' | 'lotr' | 'hp' | 'shkspr' | 'td';
export type Dataset = {
  name: DatasetName;
  value: number;
  theme: 'yellow' | 'blue' | 'green' | 'red';
  disabled?: boolean;
};

export const datasets: Dataset[] = [
  { name: 'fz', value: 0, theme: 'yellow' },
  { name: 'td', value: 1, theme: 'blue' },
  { name: 'lotr', value: 2, theme: 'green' },
  { name: 'hp', value: 3, theme: 'red' },
  { name: 'shkspr', value: 4, theme: 'blue' },
];

export const getDefaultOptions = (): Options => {
  return {
    debug: false,
    autoplay: false,
    haiku: false,
    dataset: datasets[0].name,
    seed: getSeed(),
  };
};

export type Options = {
  debug: boolean;
  autoplay: boolean;
  haiku: boolean;
  // rhymePattern
  dataset: DatasetName;
  seed: string;
};
