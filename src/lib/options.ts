export type DatasetName = 'fz' | 'lotr' | 'hp' | 'shkspr' | 'hhgg' | 'sp';
export type Dataset = {
  name: DatasetName;
  value: number;
  theme: 'yellow' | 'blue' | 'green' | 'red' | 'purple' | 'teal';
  disabled?: boolean;
  size: number;
};

export const datasets: Dataset[] = [
  { name: 'fz', value: 0, theme: 'blue', size: 2 },
  { name: 'lotr', value: 1, theme: 'green', size: 6 },
  { name: 'hp', value: 2, theme: 'red', size: 13 },
  { name: 'shkspr', value: 3, theme: 'purple', size: 10 },
  { name: 'hhgg', value: 4, theme: 'yellow', size: 4 },
  { name: 'sp', value: 5, theme: 'teal', size: 9 },
];

export type HashOptions = {
  dataset: DatasetName;
  haiku: boolean;
  seed: string;
};

export const getDefaultHashOptions = (): HashOptions => {
  return {
    dataset: datasets[0].name,
    haiku: false,
    seed: '',
  };
};

export type LocalStorageOptions = {
  debug: boolean;
  autoplay: boolean;
  sfx: boolean;
};

export const getDefaultLocalStorageOptions = (): LocalStorageOptions => {
  if (typeof window === 'undefined') {
    return {
      debug: false,
      autoplay: false,
      sfx: true,
    };
  }

  return {
    debug: localStorage.getItem('debug') === 'true',
    autoplay: localStorage.getItem('autoplay') === 'true',
    sfx: localStorage.getItem('sfx') === 'true',
  };
};
