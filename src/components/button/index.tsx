import clsx from 'clsx';
import './index.css';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  className?: string;
};

const Button = ({ className = '', children, ...props }: ButtonProps) => {
  return (
    <button {...props} className={clsx('button', className)}>
      <span className="button__edge">
        <svg
          className="button__edge-bg button__edge-bg--left"
          shapeRendering="crispEdges"
          viewBox="0 -0.5 32 18"
        >
          <use href="#px-button-sm-bg" />
        </svg>
      </span>
      <span className="button__content">
        <svg
          className="button__content-bg"
          shapeRendering="crispEdges"
          viewBox="0 0 500 36"
          preserveAspectRatio="none"
        >
          <use href="#px-button-content-bg" />
        </svg>

        {children}
      </span>
      <span className="button__edge">
        <svg
          className="button__edge-bg button__edge-bg--right"
          shapeRendering="crispEdges"
          viewBox="0 -0.5 32 18"
        >
          <use href="#px-button-sm-bg" />
        </svg>
      </span>
    </button>
  );
};

export default Button;
