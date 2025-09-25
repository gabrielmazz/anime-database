import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MantineProvider } from '@mantine/core';
import { SettingsProvider } from './state/settings.tsx';

import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';

// Importação das telas
import SelectionScreen from './screens/selectionScreen.tsx'
import SearchScreen from './screens/searchScreen.tsx'
import DevConfigurationsScreen from './screens/devConfigurationsScreen.tsx'
import SearchScreenManga from './screens/searchScreenManga.tsx'
import IntroScreen from './screens/introScreen.tsx'
import SearchScreenCharacters from './screens/searchScreenCharacters.tsx'
import TopAnimesScreen from './screens/topAnimesScreen.tsx'
import ExploreSeasonsScreen from './screens/exploreSeasonsScreen.tsx'
import SearchScreenProducers from './screens/searchScreenProducers.tsx'

// Ajusta basename para funcionar em GitHub Pages (usa base do Vite)
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider>
      <SettingsProvider>
        <BrowserRouter basename={basename}>
          <Routes>
            {/* Default route: Rota padrão: IntroScreen */}
            <Route path="/" element={<IntroScreen />} />

            {/* Rotas para as outras telas */}
            <Route path="/introScreen" element={<IntroScreen />} />
            <Route path="/selectionScreen" element={<SelectionScreen />} />
            <Route path="/searchScreen" element={<SearchScreen />} />
            <Route path="/devConfigurationsScreen" element={<DevConfigurationsScreen />} />
            <Route path="/searchScreenManga" element={<SearchScreenManga />} />
            <Route path="/searchScreenCharacters" element={<SearchScreenCharacters />} />
            <Route path="/searchScreenProducers" element={<SearchScreenProducers />} />
            <Route path="/topAnimesScreen" element={<TopAnimesScreen />} />
            <Route path="/seasonScreen" element={<ExploreSeasonsScreen />} />

            {/* Fallback route: Redireciona para a tela inicial se a rota não for encontrada */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </MantineProvider>
  </StrictMode>,
)
