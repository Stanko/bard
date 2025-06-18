import clsx from 'clsx';
import './index.css';
import Toggle from '../toggle';
import { useState } from 'react';

type ToggleFontProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
  className?: string;
};

const MONO_FONT_ID = 'mono-font';

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
        localStorage.setItem(MONO_FONT_ID, String(checked));
        if (checked) {
          document.documentElement.classList.add(MONO_FONT_ID);
        } else {
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
