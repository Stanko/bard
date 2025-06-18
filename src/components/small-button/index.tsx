import clsx from 'clsx';
import './index.css';

type SmallButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  className?: string;
  value?: number;
};

const SmallButton = ({
  className = '',
  children,
  title,
  ...props
}: SmallButtonProps) => {
  return (
    <button {...props} className={clsx('small-button', className)}>
      <div className="small-button__bg-wrapper">
        <svg
          className="small-button__bg"
          shapeRendering="crispEdges"
          viewBox="0 -0.5 32 18"
        >
          <use href="#px-button-sm-bg" />
        </svg>
      </div>
      {children}
      {title && (
        <span className="small-button__tooltip">
          <span className="small-button__title">{title}</span>
        </span>
      )}
    </button>
  );
};

export default SmallButton;
