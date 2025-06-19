import clsx from 'clsx';
import { useState } from 'react';
import Dialog from '../dialog';
import ToggleFont from '../toggle-font';
import './index.css';
import BardOld from '../bard-old';
import Bard from '../bard';

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

      <Dialog
        onClose={() => setIsAboutOpen(false)}
        isOpen={isAboutOpen}
        className="px8-font"
      >
        <h2>
          About BARD <a href="https://muffinman.io">by MuffinMan</a>
        </h2>
        <p>
          BARD is an experiment in robot poetry made for{' '}
          <a href="https://cca.codes">Creative Coding Amsterdam's</a> Poetry
          Afternoon. It is heavily inspired by{' '}
          <a href="https://www.youtube.com/watch?v=M2o4f_2L0No">this talk</a>. I
          wanted it to be deliberately <s>imperfect</s> crappy as a contrast to
          the hype large language models get.
        </p>
        <h3>How?</h3>
        <p>
          BARD's brain is powered by an{' '}
          <a href="https://en.wikipedia.org/wiki/Word_n-gram_language_model">
            n-gram language model
          </a>{' '}
          and{' '}
          <a href="http://www.speech.cs.cmu.edu/cgi-bin/cmudict">
            The CMU Pronouncing Dictionary
          </a>
          . For the voice, it taps into the browser's native{' '}
          <a href="https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis">
            SpeechSynthesis
          </a>{' '}
          API.
        </p>
        <h3>Why?</h3>
        <p>
          Purely for fun. I love making stuff, and this touched so many
          different things: language models, poetry, pixel art, CSS animations,
          SVGs, speech synthesis...
        </p>
        <p>
          On top of that, it seems that people have fun with it, so I can safely
          say it was worth it.
        </p>
        <h3>Logo</h3>
        <p>
          A few very close friends of mine liked the original BARD logo more. In
          respect to them, here are both the old and new logos for comparison:
        </p>

        <div className="footer__bards">
          <BardOld style={{ fontSize: '0.125rem' }} />
          <Bard />
        </div>
        <p>
          You might also want to check the blog post on the{' '}
          <a href="https://muffinman.io/blog/css-image-glitch/">
            CSS glitch effect
          </a>{' '}
          I created.
        </p>
        <h3>Intro text</h3>
        <p>
          I've tried, to the best of my ability, to make the intro text sound
          like something Douglas Adams would write. Part of the inspiration
          definitely comes from The Guide.
        </p>
        <h3>What else</h3>
        <p>
          I have a <s>todo</s> wishlist of stuff I want to add, and hopefully
          I'll find time to do it. You can find the code on{' '}
          <a href="htthttps://github.com/Stanko/bard/">GitHub</a>. If you have
          any ideas, feel free to open an issue or a pull request.
        </p>
        <p>
          And if you liked BARD, you might want to check out{' '}
          <a href="https://muffinman.io/projects/">my other projects</a>.
        </p>
        <p>Anyway, thanks for checking out BARD. I hope you had fun with it!</p>
      </Dialog>
    </div>
  );
};

export default Footer;
