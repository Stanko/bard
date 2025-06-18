import clsx from 'clsx';
import './index.css';

type ToggleProps = {
  className?: string;
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  labelPosition?: 'left' | 'right' | 'horizontal';
};

const Toggle = ({
  className = '',
  id,
  checked,
  onChange,
  label,
  labelPosition,
}: ToggleProps) => {
  return (
    <label className={clsx('toggle', labelPosition, className)}>
      <input
        onChange={(e) => onChange(e.target.checked)}
        type="checkbox"
        className="hidden"
        checked={checked}
        id={id}
      />

      <div className="toggle__bg-wrapper">
        <svg
          className="toggle__bg"
          shapeRendering="crispEdges"
          viewBox="0 -0.5 68 25"
        >
          <use href="#px-toggle-bg" />
        </svg>
      </div>
      <span className="toggle__label">
        <svg
          className="toggle__light"
          viewBox="0 0 6 6"
          shapeRendering="crispEdges"
        >
          <use href="#px-light-bg" />
        </svg>
        {label}
      </span>
    </label>
  );
};

export default Toggle;
