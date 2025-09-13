import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

type Settings = {
  apiModalEnabled: boolean;
  setApiModalEnabled: (v: boolean) => void;
  devModeEnabled: boolean;
  setDevModeEnabled: (v: boolean) => void;
  lastApiPayload: any | null;
  setLastApiPayload: (p: any | null) => void;
  lastSearchPayload: any | null;
  setLastSearchPayload: (p: any | null) => void;
  lastPicturesPayload: any | null;
  setLastPicturesPayload: (p: any | null) => void;
  lastCharactersPayload: any | null;
  setLastCharactersPayload: (p: any | null) => void;
};

const SettingsContext = createContext<Settings | undefined>(undefined);

const STORAGE_KEY = 'anidex:settings:v1';

function loadInitial(): Settings {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
            return {
                apiModalEnabled: Boolean(parsed.apiModalEnabled),
                setApiModalEnabled: () => {},
                devModeEnabled: Boolean(parsed.devModeEnabled),
                setDevModeEnabled: () => {},
                lastApiPayload: null,
                setLastApiPayload: () => {},
                lastSearchPayload: null,
                setLastSearchPayload: () => {},
                lastPicturesPayload: null,
                setLastPicturesPayload: () => {},
                lastCharactersPayload: null,
                setLastCharactersPayload: () => {},
            } as Settings;
		}
	} catch { }
	return {
		apiModalEnabled: false,
		setApiModalEnabled: () => {},
		devModeEnabled: false,
		setDevModeEnabled: () => {},
    lastApiPayload: null,
    setLastApiPayload: () => {},
    lastSearchPayload: null,
    setLastSearchPayload: () => {},
    lastPicturesPayload: null,
    setLastPicturesPayload: () => {},
    lastCharactersPayload: null,
    setLastCharactersPayload: () => {},
  } as Settings;
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const initial = loadInitial();
  const [apiModalEnabled, setApiModalEnabled] = useState<boolean>(initial.apiModalEnabled);
  const [devModeEnabled, setDevModeEnabled] = useState<boolean>(initial.devModeEnabled);
  const [lastApiPayload, setLastApiPayload] = useState<any | null>(null);
  const [lastSearchPayload, setLastSearchPayload] = useState<any | null>(null);
  const [lastPicturesPayload, setLastPicturesPayload] = useState<any | null>(null);
  const [lastCharactersPayload, setLastCharactersPayload] = useState<any | null>(null);

	useEffect(() => {
		try {
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({ apiModalEnabled, devModeEnabled })
			);
		} catch { }
	}, [apiModalEnabled, devModeEnabled]);

  const value = useMemo<Settings>(
    () => ({
      apiModalEnabled,
      setApiModalEnabled,
      devModeEnabled,
      setDevModeEnabled,
      lastApiPayload,
      setLastApiPayload,
      lastSearchPayload,
      setLastSearchPayload,
      lastPicturesPayload,
      setLastPicturesPayload,
      lastCharactersPayload,
      setLastCharactersPayload,
    }),
    [
      apiModalEnabled,
      devModeEnabled,
      lastApiPayload,
      lastSearchPayload,
      lastPicturesPayload,
      lastCharactersPayload,
    ]
  );

	return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings(): Settings {
	const ctx = useContext(SettingsContext);
	if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
	return ctx;
}
