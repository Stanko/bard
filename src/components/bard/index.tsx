import clsx from 'clsx';
import { random } from '../../lib/random';
import Cartridge from '../cartridges copy';
import './index.css';

type BardProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

type Strip = {
  x1: number;
  hue1: number;
  x2: number;
  hue2: number;
  top: number;
  name: string;
  height: number;
  duration: number;
  delay: number;
};

const getStrip = (top: number, height: number): Strip => {
  const duration = random(5, 10, true);
  const delay = random(0, 2, true);
  const name = `glitch-${duration}`;
  const x1 = random(-6, 6, true);
  const x2 = random(-6, 6, true);
  const hue1 = random(-50, 50, true);
  const hue2 = random(-50, 50, true);

  return {
    x1,
    hue1,
    x2,
    hue2,
    top,
    name,
    height,
    duration,
    delay,
  };
};

const getStrips = (height: number): Strip[] => {
  let i = 0;
  const strips: Strip[] = [];

  // eslint-disable-next-line no-constant-condition
  while (1) {
    const stripHeight = random(1, 5, true);

    if (i + stripHeight < height) {
      const strip = getStrip(i, stripHeight);
      strips.push(strip);
    } else {
      // Last strip
      const strip = getStrip(i, height - i);
      strips.push(strip);
      break;
    }

    i = i + stripHeight;
  }

  return strips;
};

const strips = getStrips(31);

const Bard = ({ className = '', ...props }: BardProps) => {
  return (
    <div {...props} className={clsx('bard', className)}>
      <div className="glitch">
        {strips.map((strip, index) => {
          const { x1, hue1, x2, hue2, top, height, name, duration, delay } =
            strip;
          return (
            <div
              key={index}
              className="strip"
              style={
                {
                  '--glitch-x-1': `${x1}em`,
                  '--glitch-hue-1': `${hue1}deg`,
                  '--glitch-x-2': `${x2}em`,
                  '--glitch-hue-2': `${hue2}deg`,
                  backgroundPosition: `0 -${top}em`,
                  height: `${height}em`,
                  animationName: name,
                  animationDuration: `${duration * 1000}ms`,
                  animationDelay: `${delay}s`,
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>

      <Cartridge />
    </div>
  );
};

export default Bard;
