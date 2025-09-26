import React, { useEffect, useMemo, useState } from 'react';
import { BackgroundImage, Box, Button, Group, Image, Space, Switch, Text, Title } from '@mantine/core';
import Sidebar from '../assets/components/sidebar.tsx';
import LoadingOverlayFullscreen from '../assets/components/overlay.tsx';
import AlertBox from '../assets/components/alert.tsx';
import ButtonModule from '../assets/inputInfos/Button.module.css';
import SwitchModule from '../assets/inputInfos/Switch.module.css';
import { useSettings } from '../state/settings';
import { getRandomWallpaper } from '../utils/wallpaper';
import { applyPaletteToCssVariables, extractPaletteFromImage } from '../utils/palette';
import { getRandomAnime, type Anime } from '../assets/API/jikan';

const RandomAnimeScreen: React.FC = () => {
	const [wallpaper, _setWallpaper] = useState<string>(() => getRandomWallpaper('randomAnime'));
	const [isLoading, setIsLoading] = useState(false);
	const [alert, setAlert] = useState<{ visible: boolean; type: 'info' | 'warning' | 'error' | 'success'; message: string }>({ visible: false, type: 'info', message: '' });
	const [selected, setSelected] = useState<Anime | null>(null);
	const [allowAdult, setAllowAdult] = useState(false);

	// Animação de sorteio
	const [phase, setPhase] = useState<'idle' | 'rolling' | 'reveal'>('idle');
	const { apiModalEnabled, setLastApiPayload } = useSettings();

	useEffect(() => {
		if (!wallpaper) return;
		extractPaletteFromImage(wallpaper).then(applyPaletteToCssVariables).catch(() => { });
	}, [wallpaper]);

	// Auto-esconde alerta
	useEffect(() => {
		if (!alert.visible) return;
		const t = window.setTimeout(() => setAlert((a) => ({ ...a, visible: false })), 2500);
		return () => window.clearTimeout(t);
	}, [alert.visible]);

	const isAdultAnime = (a: Anime | null): boolean => {
		const r = (a?.rating || '').toLowerCase();
		return r.includes('r - 17') || r.includes('r+') || r.includes('rx');
	};

	const draw = async () => {
		if (phase !== 'idle' && phase !== 'reveal') return;
		setSelected(null);
		setPhase('rolling');
		setIsLoading(true);
		const started = performance.now();
		try {
			let picked: Anime | null = null;
			const attempts = allowAdult ? 1 : 8;
			for (let i = 0; i < attempts; i++) {
				const resp = await getRandomAnime();
				if (allowAdult || !isAdultAnime(resp.data)) {
					picked = resp.data;
					break;
				}
			}
			const minDuration = 900; // garante tempo mínimo para a animação
			const elapsed = performance.now() - started;
			if (elapsed < minDuration) {
				await new Promise((r) => setTimeout(r, minDuration - elapsed));
			}
			if (!picked) {
				setAlert({ visible: true, type: 'warning', message: 'Não foi possível encontrar um anime SFW. Tente novamente.' });
				setPhase('idle');
				return;
			}
			setSelected(picked);
			setPhase('reveal');
			setAlert({ visible: true, type: 'success', message: `Anime sorteado: ${picked.title}` });
			if (apiModalEnabled) setLastApiPayload({ endpoint: 'random/anime', allowAdult, response: picked });
		} catch (e) {
			setAlert({ visible: true, type: 'error', message: 'Falha ao sortear anime. Tente novamente.' });
			setPhase('idle');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		// Primeiro sorteio automático na entrada
		draw();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const cover = useMemo(() => selected?.images?.jpg?.image_url ?? '', [selected]);
	const malUrl = selected ? `https://myanimelist.net/anime/${selected.mal_id}` : undefined;

	return (
		<BackgroundImage src={wallpaper} className="relative w-full min-h-screen bg-cover bg-no-repeat bg-center bg-fixed">
			<div className="absolute inset-0 bg-black/60 pointer-events-none" />
			<Sidebar />

			<LoadingOverlayFullscreen visible={isLoading && phase === 'rolling'} message="Sorteando..." />
			<AlertBox visible={alert.visible} message={alert.message} type={alert.type} />

			<div className="relative z-10 w-full min-h-screen max-w-[92vw] 2xl:max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-12">
				<Title
					className="pt-6 text-shadow-lg/20 text-(--color1) uppercase tracking-(--title-letter-spacing) text-[clamp(24px,4vw,42px)] text-center"
					style={{ fontFamily: 'var(--text-font-mono)' }}
				>
					Sorteio de Anime
				</Title>

				<Space h="md" />

				<Box
					className="bg-black/40 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg w-full max-w-none mx-auto p-4 sm:p-6 md:p-8 mt-6 sm:mt-10 lg:mt-12 mb-16 h-[560px] md:h-[640px] lg:h-[720px]"
				>
					{/* Área de sorteio / resultado */}
					<div className="relative h-full flex items-center justify-center">
						{(phase === 'idle' || phase === 'rolling') && !selected && (
							<div className="w-full h-full border-2 rounded-xl border-[var(--panel-border)] flex items-center justify-center animate-pulse">
								<Text className="text-(--colorTextWhite) text-xl">Preparando sorteio...</Text>
							</div>
						)}

						{selected && (
							<div className={`w-full h-full ${phase === 'reveal' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-400`}>
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch h-full">
									<div className="rounded-xl overflow-hidden border border-white/20 bg-black/30 h-full">
										<Image src={cover} alt={selected.title} fit="cover" className="w-full h-full" />
									</div>
									<div className="lg:col-span-2 flex flex-col gap-4 min-h-0 h-full">
										<Title order={2} className="text-(--colorTextWhite) text-shadow-lg/20 uppercase tracking-(--title-letter-spacing)" style={{ fontFamily: 'var(--text-font-mono)' }}>
											{selected.title}
										</Title>
										<div className="overflow-y-auto pr-1">
											{selected.synopsis && (
												<Text style={{ color: 'var(--colorTextWhite)' }}>{selected.synopsis}</Text>
											)}
										</div>
										<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-(--colorTextWhite)">
											<Stat label="Episódios" value={selected.episodes ?? 0} />
											<Stat label="Status" value={selected.status || '-'} />
											<Stat label="Nota" value={selected.score ?? '-'} />
											<Stat label="Classificação" value={selected.rating ?? '-'} />
										</div>
										<Group className="mt-auto items-center justify-between flex-wrap gap-3">
											{malUrl && (
												<Button component="a" href={malUrl} target="_blank" rel="noopener noreferrer" classNames={{ root: ButtonModule.rootButton }}>
													Ver na MyAnimeList
												</Button>
											)}
											<Button onClick={draw} classNames={{ root: ButtonModule.rootButton }}>
												Sortear novamente
											</Button>
											<Switch
												checked={allowAdult}
												onChange={(e) => setAllowAdult(e.currentTarget.checked)}
												label="Adulto (+17/+18)"
												size="xl"
												classNames={{
													root: SwitchModule.rootSwitch,
													track: SwitchModule.trackSwitch,
													thumb: SwitchModule.thumbSwitch,
													label: SwitchModule.labelSwitch,
												}}
											/>
										</Group>
									</div>
								</div>
							</div>
						)}
					</div>
				</Box>
			</div>
		</BackgroundImage>
	);
};

const Stat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
	<div className="relative rounded-xl p-3 border border-[var(--panel-border)] bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
		<div className="absolute -top-px left-3 right-3 h-px bg-gradient-to-r from-transparent via-[var(--panel-border)] to-transparent opacity-80" />
		<Text className="text-[11px] uppercase tracking-(--title-letter-spacing) text-(--color1) mb-1" style={{ fontFamily: 'Raleway, sans-serif' }}>
			{label}
		</Text>
		<Text className="text-(--colorTextWhite) text-sm">{value}</Text>
	</div>
);

export default RandomAnimeScreen;
