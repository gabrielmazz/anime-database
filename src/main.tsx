import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { createTheme, MantineProvider } from '@mantine/core';
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            {/* Default route: Intro as home */}
            <Route path="/" element={<IntroScreen />} />

            {/* Explicit routes for each screen */}
            <Route path="/introScreen" element={<IntroScreen />} />
            <Route path="/selectionScreen" element={<SelectionScreen />} />
            <Route path="/searchScreen" element={<SearchScreen />} />
            <Route path="/devConfigurationsScreen" element={<DevConfigurationsScreen />} />
            <Route path="/searchScreenManga" element={<SearchScreenManga />} />
            <Route path="/searchScreenCharacters" element={<SearchScreenCharacters />} />
            <Route path="/topAnimesScreen" element={<TopAnimesScreen />} />
            <Route path="/seasonScreen" element={<ExploreSeasonsScreen />} />

            {/* Fallback to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </MantineProvider>
  </StrictMode>,
)
