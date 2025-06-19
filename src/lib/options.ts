import { getSeed } from './get-seed';

export type DatasetName = 'fz' | 'lotr' | 'hp' | 'shkspr' | 'td';
export type Dataset = {
  name: DatasetName;
  value: number;
  theme: 'yellow' | 'blue' | 'green' | 'red' | 'purple';
  disabled?: boolean;
};

export const datasets: Dataset[] = [
  { name: 'fz', value: 0, theme: 'blue' },
  // { name: 'td', value: 4, theme: 'yellow' },
  { name: 'lotr', value: 1, theme: 'green' },
  { name: 'hp', value: 2, theme: 'red' },
  { name: 'shkspr', value: 3, theme: 'purple' },
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
