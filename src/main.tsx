import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'

import { BrowserRouter } from 'react-router-dom'
import { createTheme, MantineProvider } from '@mantine/core';

import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';

// Importação das telas
import SelectionScreen from './screens/selectionScreen.tsx'
import SearchScreen from './screens/searchScreen.tsx'

createRoot(document.getElementById('root')!).render(

	<StrictMode>
		<MantineProvider>

			<BrowserRouter basename="/selectionScreen">
				<SelectionScreen />
			</BrowserRouter>

			<BrowserRouter basename="/searchScreen">
				<SearchScreen />
			</BrowserRouter>

		</MantineProvider>

	</StrictMode>,
)