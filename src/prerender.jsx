import { renderToString } from 'react-dom/server.browser';
import fs from 'node:fs';

import App from './components/app';
import Options from './components/options';
import SvgSymbols from './components/svg-symbols';

export const render = (page) => {
  const html = renderToString(page);

  return html;
};

const html = render(
  <Options>
    <App addGoatCounter />
    <SvgSymbols />
  </Options>
);

const INDEX_PATH = './docs/index.html';

const template = fs.readFileSync(INDEX_PATH, {
  encoding: 'utf8',
});

fs.writeFileSync(INDEX_PATH, template.replace('<!--app-->', html), {
  encoding: 'utf8',
});

process.exit(0);
