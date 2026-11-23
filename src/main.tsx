import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';

// Self-hosted fonts (unicode-range subsets: only the scripts in use are downloaded).
import '@fontsource/moul/khmer-400.css';
import '@fontsource/battambang/khmer-400.css';
import '@fontsource/battambang/khmer-700.css';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/kantumruy-pro/khmer-400.css';
import '@fontsource/kantumruy-pro/latin-400.css';
import '@fontsource/kantumruy-pro/khmer-500.css';
import '@fontsource/kantumruy-pro/latin-500.css';

import './styles/tokens.css';
import './styles/base.css';
import './motion/motion.css';
import { applyTheme } from './config/theme';
import { App } from './App';

applyTheme();

// The heritage registry viewer (?heritage) is a design tool: development only, not shipped to guests.
const HeritageLab = import.meta.env.DEV ? lazy(() => import('./heritage/HeritageLab')) : null;
const isLab = !!HeritageLab && new URLSearchParams(location.search).has('heritage');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isLab && HeritageLab ? (
      <Suspense fallback={null}>
        <HeritageLab />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
