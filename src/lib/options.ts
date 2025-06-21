export type DatasetName = 'fz' | 'lotr' | 'hp' | 'shkspr' | 'hhgg';
export type Dataset = {
  name: DatasetName;
  value: number;
  theme: 'yellow' | 'blue' | 'green' | 'red' | 'purple';
  disabled?: boolean;
  size: number;
};

export const datasets: Dataset[] = [
  { name: 'fz', value: 0, theme: 'blue', size: 2 },
  { name: 'lotr', value: 1, theme: 'green', size: 6 },
  { name: 'hp', value: 2, theme: 'red', size: 13 },
  { name: 'shkspr', value: 3, theme: 'purple', size: 10 },
  { name: 'hhgg', value: 4, theme: 'yellow', size: 4 },
];

export const getDefaultOptions = (): Options => {
  return {
    debug: false,
    autoplay: false,
    haiku: false,
    dataset: datasets[0].name,
    seed: '',
  };
};

export type Options = {
  debug: boolean;
  autoplay: boolean;
  haiku: boolean;
  dataset: DatasetName;
  seed: string;
};
