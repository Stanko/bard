import clsx from 'clsx';
import { play } from '../../lib/sounds';
import './index.css';

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
  label?: string;
};

const TextInput = ({
  className = '',
  label,
  value,
  onKeyDown,
  ...props
}: TextInputProps) => {
  return (
    <div className={clsx('text-input', className)}>
      {label && <label className="text-input-label">{label}</label>}

      <div className="text-input__input-wrapper">
        <span className="text-input__edge text-input__edge--left" />
        <input
          className="text-input__input"
          value={value}
          onKeyDown={(e) => {
            onKeyDown?.(e);

            play('keyboard');
          }}
          {...props}
        />
        <span className="text-input__edge text-input__edge--right" />
      </div>
    </div>
  );
};

export default TextInput;
