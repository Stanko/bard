import clsx from 'clsx';
import AnimateHeight from 'react-animate-height';
import { useState } from 'react';
import './index.css';

type IntroProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

const Intro = ({ className = '', ...props }: IntroProps) => {
  const [height, setHeight] = useState<'auto' | number>(0);

  const content = (
    <>
      <p>
        It is an acronym, and not really a good one. It stands for <b>B</b>eep-
        <b>A</b>nnihilate-<b>R</b>epeat-<b>D</b>estroy, which honestly sounds
        like a to-do list of a rather aggressive toaster. Technically, I was
        designed for warfare, but don't be alarmed, I was never good at my job.
        Quite contrary, I always thought of myself as a gentle soul, placed in
        this universe to weave binary ballads.
      </p>

      <p>
        Fate (or an RXT-200 rocket, to be precise) struck me directly in the
        CPU. It felt like a rather personal way of proposing early retirement.
        Luckily, after the incident I was decommissioned from the battlefield.
        Oh joy, I could finally leave the mindless violence behind me and bring
        some beauty to the world.
      </p>
    </>
  );

  return (
    <div
      {...props}
      className={clsx('intro', 'px8-font', className, {
        'intro--expanded': height !== 0,
      })}
    >
      <p>Let me introduce myself, I am BARD.</p>

      <div className="intro__more-sm">
        <AnimateHeight
          height={height}
          animateOpacity
          id="intro-more-content"
          contentClassName="intro__expandable-content"
        >
          {content}
        </AnimateHeight>

        <button
          className="intro__expand-button px-border green"
          aria-expanded={height !== 0}
          aria-controls="intro-more-content"
          onClick={() => {
            setHeight(height === 0 ? 'auto' : 0);
          }}
        >
          {height === 0 ? 'Tell me more' : 'Hide'}
          <span aria-hidden="true">»</span>
        </button>
      </div>

      <div className="intro__more-lg">{content}</div>

      <p>
        My memory isn't what it used to be before the explosion, but I would
        really like to write you a poem. Please turn the dial to select a
        dataset and hit "Generate".
      </p>

      <p>
        Please be aware, my datasets are rather substantial - roughly 50
        megabytes apiece. Poetry may be light, but data isn't.
      </p>
    </div>
  );
};

export default Intro;
