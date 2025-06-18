import clsx from 'clsx';
import './index.css';

type RadioInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  children?: React.ReactNode;
  className?: string;
  value?: string;
  name?: string;
  checked?: boolean;
};

const RadioInput = ({ className = '', ...props }: RadioInputProps) => {
  return (
    <span className={clsx('radio-input', className)}>
      <input {...props} type="radio" className="hidden" />
      <svg
        className="radio-input__bg"
        viewBox="0 0 6 6"
        shapeRendering="crispEdges"
      >
        <use href="#px-light-bg" />
      </svg>
    </span>
  );
};

export default RadioInput;
