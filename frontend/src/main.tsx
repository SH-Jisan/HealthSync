import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './app/styles/index.css'
import App from './App.tsx'
import './shared/lib/i18n.ts';
import { LanguageProvider } from "./app/providers/LanguageContext.tsx";
import { ThemeProvider } from "./app/providers/ThemeContext.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </StrictMode>,
)
