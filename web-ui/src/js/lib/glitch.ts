const random = (min: number, max: number): number => {
  return Math.round(Math.random() * (max - min)) + min;
};

const randomFloat = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

const getKeyFrames = (
  name: string,
  steps: number,
  glitchPercentageDuration: number,
  tick: number = 0.01
): string => {
  const percentageStep = 100 / steps;

  const keyframes: {
    keys: number[];
    css: Record<string, string | number>;
  }[] = [];

  // First keyframe
  const baseKeys = [0];

  for (let i = 1; i < steps; i++) {
    const p = i * percentageStep;
    baseKeys.push(p);
    baseKeys.push(p + glitchPercentageDuration);
  }

  // Last keyframe
  baseKeys.push(100);

  keyframes.push({
    keys: baseKeys,
    css: {
      transform: 'none',
      filter: 'hue-rotate(0)', // Hack to force animation in Safari
    },
  });

  for (let i = 1; i < steps; i++) {
    const p = i * percentageStep;

    keyframes.push({
      keys: [p + tick, p + glitchPercentageDuration - tick],
      css: {
        transform: `translateX(${random(-10, 10)}em)`,
        filter: `hue-rotate(${random(-50, 50)}deg)`,
      },
    });
  }

  const css = keyframes
    .map((keyframe) => {
      const keys = keyframe.keys
        .map((key) => `${key.toFixed(2)}%`)
        .join(',\n  ');

      const content = Object.entries(keyframe.css)
        .map(([key, value]) => `  ${key}: ${value};`)
        .join('\n  ');

      return [keys, '{', content, '}'].join('\n  ');
    })
    .join('\n\n  ');

  return `@keyframes ${name} {\n  ${css}\n}`;
};

const getStrip = (
  top: number,
  stripHeight: number,
  src: string
): {
  html: string[];
  keyframes: string;
} => {
  const animationDuration = random(4, 10) * 1000;
  const steps = 3; // random(2, 5);
  const glitchDurationMS = 500;
  const glitchPercentageDuration = (glitchDurationMS * 100) / animationDuration;

  const name = `glitch-${top}`;

  const keyframes = getKeyFrames(name, steps, glitchPercentageDuration, 0.01);

  const html = [
    `<div class="strip" 
      style="
        height: ${stripHeight}em; 
        animation-name: ${name};
        animation-duration: ${animationDuration}ms; 
      ">`,
    `<img style="top: -${top}em" src="${src}" />`,
    `</div>`,
  ];

  return {
    html,
    keyframes,
  };
};

const getStripStaticAnimation = (
  top: number,
  stripHeight: number,
  src: string
): string[] => {
  const duration = random(5, 10);
  const name = `glitch-${duration}`;

  const html = [
    `<div class="strip" 
      style="
        --glitch-x-1: ${random(-10, 10)}em;
        --glitch-hue-1: ${random(-50, 50)}deg;
        --glitch-x-2: ${random(-10, 10)}em;
        --glitch-hue-2: ${random(-50, 50)}deg;

        height: ${stripHeight}em; 
        animation-name: ${name};
        animation-duration: ${duration * 1000}ms; 
        animation-delay: ${random(0, 2)}s;
      ">`,
    `<img style="top: -${top}em" src="${src}" />`,
    `</div>`,
  ];

  return html;
};

const glitch = (src: string, height: number) => {
  let i = 0;
  const html: string[] = [];
  const css: string[] = [];

  while (1) {
    const stripHeight = random(1, 6);

    if (i + stripHeight < height) {
      const strip = getStrip(i, stripHeight, src);
      css.push(strip.keyframes);
      html.push(...strip.html);
    } else {
      // Last strip
      const strip = getStrip(i, height - i, src);
      css.push(strip.keyframes);
      html.push(...strip.html);
      break;
    }

    i = i + stripHeight;
  }

  return {
    css,
    html,
  };
};

const glitchStaticAnimation = (src: string, height: number): string[] => {
  let i = 0;
  const html: string[] = [];

  while (1) {
    const stripHeight = random(1, 6);

    if (i + stripHeight < height) {
      const strip = getStripStaticAnimation(i, stripHeight, src);
      html.push(...strip);
    } else {
      // Last strip
      const strip = getStripStaticAnimation(i, height - i, src);
      html.push(...strip);
      break;
    }

    i = i + stripHeight;
  }

  return html;
};

// const { css, html } = glitch('./bard.png', 62);

// CSS
// const styleEl = document.createElement('style');
// styleEl.innerHTML = css.join('\n');
// document.head.appendChild(styleEl);

const html = glitchStaticAnimation('./bard.png', 62);

// HTML
const $glitch = document.querySelector('.glitch') as HTMLElement;
$glitch.innerHTML = html.join('\n');

// const k = [5, 6, 7, 8, 9, 10].map((n, i) => {
//   const glitchDurationMS = 500;
//   const glitchPercentageDuration = (glitchDurationMS * 100) / (n * 1000);

//   return getKeyFrames(`glitch-${n}`, 3, glitchPercentageDuration);
// });

// const $pre = document.createElement('pre');
// $pre.innerHTML = k.join('\n');
// document.body.appendChild($pre);
