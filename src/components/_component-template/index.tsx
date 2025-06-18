import clsx from 'clsx';
import './index.css';

type ComponentProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
  className?: string;
};

const Component = ({ className = '', children, ...props }: ComponentProps) => {
  return (
    <div {...props} className={clsx('', className)}>
      {children}
    </div>
  );
};

export default Component;
