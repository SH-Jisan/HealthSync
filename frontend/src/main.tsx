import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './lib/i18n.ts';
import {LanguageProvider} from "./context/LanguageContext.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <LanguageProvider>
          <App/>
      </LanguageProvider>
  </StrictMode>,
)
