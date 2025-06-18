import clsx from 'clsx';
import './index.css';

type IntroProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

const Intro = ({ className = '', ...props }: IntroProps) => {
  return (
    <div {...props} className={clsx('intro', className)}>
      <p>Let me introduce myself, I am BARD.</p>

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
