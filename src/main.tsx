import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './styles/index.css';

import App from './components/app';
import Options from './components/options';
import SvgSymbols from './components/svg-symbols';

const root = document.getElementById('root') as HTMLDivElement;

createRoot(root).render(
  <StrictMode>
    <Options>
      <App />
      <SvgSymbols />
    </Options>
  </StrictMode>
);

if (typeof window !== 'undefined') {
  window.speechSynthesis.cancel();
}
