import clsx from 'clsx';
import Bard from '../bard';
import './index.css';

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
  className?: string;
};

const Header = ({ className = '', ...props }: HeaderProps) => {
  return (
    <header {...props} className={clsx('header', className)}>
      <Bard />
      <div className="header__text">
        <h1 className="header__title">Glitchy BARD</h1>
        <div className="header__subtitle">An experiment in robot poetry</div>
      </div>
    </header>
  );
};

export default Header;
