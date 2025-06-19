import clsx from 'clsx';
import { useState } from 'react';
import Toggle from '../toggle';
import './index.css';

type ToggleFontProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  className?: string;
};

const MONO_FONT_ID = 'mono-font';

// Mock localStorage for pre-rendering
let localStorage: {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

if (typeof window === 'undefined') {
  localStorage = {
    getItem: (key: string) => {
      console.log(`Get ${key}`);
      return null;
    },
    setItem: (key: string, value: string) => {
      console.log(`Set ${key} to ${value}`);
    },
    removeItem: (key: string) => {
      console.log(`Remove ${key}`);
    },
  };
} else {
  localStorage = window.localStorage;
}

const ToggleFont = ({ className = '', ...props }: ToggleFontProps) => {
  const [checked, setChecked] = useState(
    localStorage.getItem(MONO_FONT_ID) === 'true'
  );
  return (
    <Toggle
      {...props}
      checked={checked}
      onChange={(checked) => {
        setChecked(checked);

        if (checked) {
          localStorage.setItem(MONO_FONT_ID, 'true');
          document.documentElement.classList.add(MONO_FONT_ID);
        } else {
          localStorage.removeItem(MONO_FONT_ID);
          document.documentElement.classList.remove(MONO_FONT_ID);
        }
      }}
      className={clsx('toggle-font', className)}
      id="toggle-font-checkbox"
      label="Disable pixel art font"
      labelPosition="horizontal"
    />
  );
};

export default ToggleFont;
