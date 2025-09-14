import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'

import { BrowserRouter } from 'react-router-dom'
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

createRoot(document.getElementById('root')!).render(

    <StrictMode>
        <MantineProvider>
            <SettingsProvider>

            <BrowserRouter basename="/introScreen">
                <IntroScreen />
            </BrowserRouter>

            <BrowserRouter basename="/selectionScreen">
                <SelectionScreen />
            </BrowserRouter>

			<BrowserRouter basename="/searchScreen">
				<SearchScreen />
			</BrowserRouter>

            <BrowserRouter basename="/devConfigurationsScreen">
                <DevConfigurationsScreen />
            </BrowserRouter>

            <BrowserRouter basename="/searchScreenManga">
                <SearchScreenManga />
            </BrowserRouter>

            </SettingsProvider>
        </MantineProvider>

	</StrictMode>,
)
