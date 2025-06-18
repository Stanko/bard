import clsx from 'clsx';
import { useState } from 'react';
import ToggleFont from '../toggle-font';
import './index.css';
import Dialog from '../dialog';

type ComponentProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

const Footer = ({ className = '', ...props }: ComponentProps) => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  return (
    <div {...props} className={clsx('footer', className)}>
      <button onClick={() => setIsAboutOpen(true)} className="text-link">
        What in the robot hell is this?
      </button>
      <a href="https://muffinman.io">Made by MuffinMan</a>
      <ToggleFont />

      <Dialog onClose={() => setIsAboutOpen(false)} isOpen={isAboutOpen}>
        <h2>About BARD</h2>
        <p>
          BARD is an experiment in robot poetry made fot{' '}
          <a href="https://cca.codes">Creative Coding Amsterdam's</a> Poetry
          Afternoon.
        </p>
      </Dialog>
    </div>
  );
};

export default Footer;
