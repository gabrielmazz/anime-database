import React, { useEffect, useMemo, useRef, useState } from 'react';

// UI base e layout
import { BackgroundImage, Box, Container, Group, Image, Space, Text, TextInput, Title } from '@mantine/core';
import { Table } from '@mantine/core';
import InfoDrawer from '../assets/components/infoDrawer.tsx';
import DrawerModule from '../assets/inputInfos/Drawer.module.css';
import LoaderBox from '../assets/components/loaderBox.tsx';
import AlertBox from '../assets/components/alert.tsx';

import TextInputModule from './../assets/inputInfos/TextInput.module.css';
import SelectModule from '../assets/inputInfos/Select.module.css';

// Componentes compartilhados
import Sidebar from '../assets/components/sidebar.tsx';
import LoadingOverlayFullscreen from '../assets/components/overlay.tsx';

// Tema dinâmico
import { applyPaletteToCssVariables, extractPaletteFromImage } from '../utils/palette';
import { getRandomWallpaper } from '../utils/wallpaper';

// APIs
import { getTopCharacters, searchCharactersByName, getCharacterFull, type Character } from '../assets/API/jikan';
import { useSettings } from '../state/settings';

// Estilos da Tabela no padrão do projeto
import TableModule from '../assets/inputInfos/Table.module.css';

function formatNumber(n?: number) {
	if (typeof n !== 'number') return '-';
	try { return new Intl.NumberFormat('pt-BR').format(n); } catch { return String(n); }
}

const SearchScreenCharacters: React.FC = () => {
	const [wallpaper, setWallpaper] = useState<string>(() => getRandomWallpaper('characters'));
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [query, setQuery] = useState<string>('');
	const [rows, setRows] = useState<Character[]>([]);
	const { apiModalEnabled, setLastApiPayload, setLastTopCharactersPayload, setLastCharactersSearchPayload, charactersPageLimit } = useSettings();
	const [mode, setMode] = useState<'top' | 'search'>('top');
	const [page, setPage] = useState<number>(1);
	const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const sentinelRef = useRef<HTMLDivElement | null>(null);
	const [openedCharacterInfo, setOpenedCharacterInfo] = useState<boolean>(false);
	const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
	const [selectedCharacterFull, setSelectedCharacterFull] = useState<any | null>(null);

	// Alertas (suave) para feedback de requisições
	const [alertVisible, setAlertVisible] = useState(false);
	const [alertMessage, setAlertMessage] = useState("");
	const [alertType, setAlertType] = useState<'info' | 'warning' | 'error' | 'success'>('info');

	// Aplica paleta baseada no wallpaper
	useEffect(() => {
		if (!wallpaper) return;
		extractPaletteFromImage(wallpaper)
			.then(applyPaletteToCssVariables)
			.catch(() => { /* ignora erros silenciosamente */ });
	}, [wallpaper]);

	// Carrega Top Characters no primeiro render
	useEffect(() => {
		let cancelled = false;
		const run = async () => {
			setIsLoading(true);
			try {
				const r = await getTopCharacters(1, charactersPageLimit);
				if (apiModalEnabled) {
					const payload = { endpoint: 'getTopCharacters', page: 1, limit: charactersPageLimit, response: r };
					setLastApiPayload(payload);
					setLastTopCharactersPayload(payload);
				}
				if (!cancelled) {
					setRows(r.data ?? []);
					setMode('top');
					setPage(1);
					setHasMore(((r as any)?.data?.length ?? 0) >= charactersPageLimit);
				}
				setAlertType('success');
				setAlertMessage(`Top carregado (${(r as any)?.data?.length ?? 0} personagens)`);
				setAlertVisible(true);
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		};
		run();
		return () => { cancelled = true; };
	}, [charactersPageLimit]);

	// Busca por nome quando houver texto (com pequeno debounce), cai para Top quando vazio
	useEffect(() => {
		let cancelled = false;
		const handler = window.setTimeout(async () => {
			if (cancelled) return;
			if (!query.trim()) {
				// Volta para o Top
				setIsLoading(true);
				try {
					const r = await getTopCharacters(1, charactersPageLimit);
					if (apiModalEnabled) {
						const payload = { endpoint: 'getTopCharacters', page: 1, limit: charactersPageLimit, response: r };
						setLastApiPayload(payload);
						setLastTopCharactersPayload(payload);
					}
					if (!cancelled) {
						setRows(r.data ?? []);
						setMode('top');
						setPage(1);
						setHasMore(((r as any)?.data?.length ?? 0) >= charactersPageLimit);
					}
					setAlertType('success');
					setAlertMessage(`Top carregado (${(r as any)?.data?.length ?? 0} personagens)`);
					setAlertVisible(true);
				} finally {
					if (!cancelled) setIsLoading(false);
				}
				return;
			}

			setIsLoading(true);
			try {
				const r = await searchCharactersByName(query.trim(), 1, charactersPageLimit);
				const sorted = (r.data ?? []).slice().sort((a, b) => (b.favorites ?? 0) - (a.favorites ?? 0));
				if (apiModalEnabled) {
					const payload = { endpoint: 'searchCharactersByName', page: 1, limit: charactersPageLimit, query: query.trim(), response: r, responseSorted: sorted };
					setLastApiPayload(payload);
					setLastCharactersSearchPayload(payload);
				}
				if (!cancelled) {
					setRows(sorted);
					setMode('search');
					setPage(1);
					setHasMore(sorted.length >= charactersPageLimit);
				}
				setAlertType('success');
				setAlertMessage(`Busca carregada (${sorted.length} personagens)`);
				setAlertVisible(true);
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		}, 400);
		return () => { cancelled = true; window.clearTimeout(handler); };
	}, [query, charactersPageLimit]);

	// Auto esconde o alerta após alguns segundos
	useEffect(() => {
		if (!alertVisible) return;
		const id = window.setTimeout(() => setAlertVisible(false), 2500);
		return () => window.clearTimeout(id);
	}, [alertVisible]);

	// Observa o fim da lista para carregar mais 25 (página 2)
	useEffect(() => {
		if (!scrollRef.current || !sentinelRef.current) return;
		const root = scrollRef.current;
		const sentinel = sentinelRef.current;

		const observer = new IntersectionObserver((entries) => {
			const entry = entries[0];
			if (!entry?.isIntersecting) return;
			if (isLoadingMore || !hasMore) return;

			const nextPage = page + 1;
			setIsLoadingMore(true);
			const loadMore = async () => {
				try {
					if (mode === 'top') {
						const r2 = await getTopCharacters(nextPage, charactersPageLimit);
						if (apiModalEnabled) {
							const payload = { endpoint: 'getTopCharacters', page: nextPage, limit: charactersPageLimit, response: r2 };
							setLastApiPayload(payload);
							setLastTopCharactersPayload(payload);
						}
						const count = (r2 as any)?.data?.length ?? 0;
						setRows((prev) => [...prev, ...(r2.data ?? [])]);
						setAlertType('success');
						setAlertMessage(`Mais ${count} personagens (Top) carregados — pág. ${nextPage}`);
						setAlertVisible(true);
						setPage(nextPage);
						setHasMore(count >= charactersPageLimit);
					} else {
						const q = query.trim();
						const r2 = await searchCharactersByName(q, nextPage, charactersPageLimit);
						const count = (r2 as any)?.data?.length ?? 0;
						const merged = [...rows, ...(r2.data ?? [])];
						const sorted = merged.slice().sort((a, b) => (b.favorites ?? 0) - (a.favorites ?? 0));
						if (apiModalEnabled) {
							const payload = { endpoint: 'searchCharactersByName', page: nextPage, limit: charactersPageLimit, query: q, response: r2, mergedCount: merged.length };
							setLastApiPayload(payload);
							setLastCharactersSearchPayload(payload);
						}
						setRows(sorted);
						setAlertType('success');
						setAlertMessage(`Mais ${count} personagens (Busca) carregados — pág. ${nextPage}`);
						setAlertVisible(true);
						setPage(nextPage);
						setHasMore(count >= charactersPageLimit);
					}
				} catch { }
				finally {
					setIsLoadingMore(false);
				}
			};
			loadMore();
		}, { root, rootMargin: '0px 0px 200px 0px', threshold: 0.05 });

		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [mode, page, rows, query, apiModalEnabled, hasMore, isLoadingMore, charactersPageLimit]);

	const tableRows = useMemo(() => {
		return rows.map((c, idx) => (
			<Table.Tr
				key={c.mal_id}
				className={TableModule.trTable}
				style={{ cursor: 'pointer' }}
				onClick={() => {
					setSelectedCharacter(c);
					setOpenedCharacterInfo(true);
					setSelectedCharacterFull(null);
					getCharacterFull(c.mal_id)
						.then((full) => setSelectedCharacterFull((full as any)?.data ?? full))
						.catch(() => setSelectedCharacterFull(null));
				}}
			>
				<Table.Td className={TableModule.tdTable} width={64}>
					<Text style={{ color: 'var(--color1)', fontWeight: 700 }}>{idx + 1}</Text>
				</Table.Td>
				<Table.Td className={TableModule.tdTable}>
					<Group wrap="nowrap" gap="sm" align="center">
						<Image src={c.images?.jpg?.image_url} w={56} h={56} radius="sm" fit="cover" alt={c.name} />
						<Box>
							<Text style={{ color: 'var(--colorTextWhite)' }}>{c.name}</Text>
							<Text size="xs" c="dimmed">ID: {c.mal_id}</Text>
						</Box>
					</Group>
				</Table.Td>
				<Table.Td className={TableModule.tdTable} style={{ textAlign: 'right' }}>
					<Text style={{ color: 'var(--colorTextWhite)' }}>{formatNumber(c.favorites)}</Text>
				</Table.Td>
			</Table.Tr>
		));
	}, [rows]);

	return (
		<>
			<BackgroundImage
				src={wallpaper}
				className="relative text-white w-full min-h-screen bg-cover bg-no-repeat bg-center bg-fixed"
			>
				{/* Overlay escurecedor */}
				<div className="absolute inset-0 bg-black/60 pointer-events-none" />

				{/* Alert + Loading overlay */}
				<AlertBox visible={alertVisible} message={alertMessage} type={alertType} />
				<LoadingOverlayFullscreen visible={isLoading} message={query ? 'Buscando personagens...' : 'Carregando ranking...'} />

				{/* Sidebar */}
				<Sidebar />

				{/* Conteúdo principal */}
				<div
					className="
					relative z-10 w-full min-h-screen
					max-w-[92vw] 2xl:max-w-[1900px] mx-auto align-top
					px-4 sm:px-6 lg:px-12
				"
				>
					<Title
						className="
							flex justify-center
							pt-8
							text-shadow-lg/20
							text-(--color1)
							uppercase
							tracking-(--title-letter-spacing)
						"
						style={{ fontFamily: 'var(--text-font-mono)' }}
					>
						Personagens — Top e Busca
					</Title>

					<Space h={33} />

					<Group grow>
						<TextInput
							size="md"
							label="Buscar personagem"
							description="Digite o nome do personagem para buscar"
							placeholder="Ex.: Levi, Luffy, Naruto..."
							value={query}
							classNames={{
								input: TextInputModule.inputTextInput,
								label: TextInputModule.labelTextInput,
								description: TextInputModule.descriptionTextInput,
							}}
							className="
								mt-4
							"
							onChange={(e) => setQuery(e.currentTarget.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									const v = (e.currentTarget.value || '').trim();
									setQuery(v);
									e.currentTarget.blur();
								}
							}}
							onBlur={(e) => {
								const v = (e.currentTarget.value || '').trim();
								if (v !== query) setQuery(v);
							}}
							onFocus={(e) => e.target.select()}
						/>
					</Group>

					<Space h="md" />

					<Container
						fluid
						className="
						bg-black/40 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg
                        w-full max-w-none mx-auto
                        p-4 sm:p-6 md:p-8
                        mt-6 mb-0
                        h-[70vh] overflow-hidden
					"
					>

						<div ref={scrollRef} className="h-[calc(100%-0px)] overflow-auto rounded-md">
							<Table
								highlightOnHover
								classNames={{
									table: TableModule.tableTable,
									thead: TableModule.theadTable,
									th: TableModule.thTable,
									tr: TableModule.trTable,
									td: TableModule.tdTable,
									caption: TableModule.captionTable,
								}}
							>
								<Table.Thead>
									<Table.Tr>
										<Table.Th style={{ width: 64 }}>Rank</Table.Th>
										<Table.Th>Character</Table.Th>
										<Table.Th style={{ width: 140, textAlign: 'right' }}>Favorites</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>
									{tableRows}
								</Table.Tbody>
							</Table>
							<div ref={sentinelRef} style={{ height: 8, width: '100%' }} />
						</div>
					</Container>
				</div>
			</BackgroundImage>

			{/* Drawer de informações do personagem */}
			<InfoDrawer
				opened={openedCharacterInfo}
				onClose={() => { setOpenedCharacterInfo(false); setSelectedCharacter(null); setSelectedCharacterFull(null); }}
				title={
					<Title
						order={2}
						className="font-bold text-shadow-lg/20 text-(--colorTextWhite) uppercase tracking-(--title-letter-spacing)"
						style={{ fontSize: 32, fontFamily: 'var(--text-font-mono)' }}
					>
						Informações do Personagem
					</Title>
				}
				position="right"
				size="40%"
				overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
				classNames={{ root: DrawerModule.rootDrawer, header: DrawerModule.headerDrawer, body: DrawerModule.bodyDrawer }}
				content={selectedCharacter && (
					<>
						<Box>
							<Image src={selectedCharacter.images?.jpg?.image_url} radius="md" h={300} w="auto" className="mb-4" />
							<Title size="xl" className="font-bold text-center text-shadow-lg/20 text-(--colorTextWhite) uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 28, fontFamily: 'var(--text-font-mono)' }}>
								{selectedCharacter.name}
							</Title>
							<Space h="md" />
							<Text style={{ color: 'var(--colorTextWhite)' }}>ID: {selectedCharacter.mal_id} • Favoritos: {formatNumber(selectedCharacter.favorites)}</Text>
						</Box>

						<Space h="lg" />

						{!selectedCharacterFull && (
							<LoaderBox message="Carregando detalhes do personagem..." />
						)}

						{selectedCharacterFull && (
							<>
								{selectedCharacterFull?.about && (
									<Box>
										<Text className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>Sobre:</Text>
										<Text style={{ color: 'var(--colorTextWhite)' }}>{selectedCharacterFull.about}</Text>
									</Box>
								)}

								<Space h="lg" />

								{Array.isArray(selectedCharacterFull?.anime) && selectedCharacterFull.anime.length > 0 && (
									<Box>
										<Text className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>Animeography:</Text>
										<ul style={{ paddingLeft: 16 }}>
											{(selectedCharacterFull.anime as any[]).slice(0, 6).map((a, i) => (
												<li key={i}><Text style={{ color: 'var(--colorTextWhite)' }}>{a?.anime?.title ?? '-'}</Text></li>
											))}
										</ul>
									</Box>
								)}

								<Space h="lg" />

								{Array.isArray(selectedCharacterFull?.manga) && selectedCharacterFull.manga.length > 0 && (
									<Box>
										<Text className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>Mangagraphy:</Text>
										<ul style={{ paddingLeft: 16 }}>
											{(selectedCharacterFull.manga as any[]).slice(0, 6).map((m, i) => (
												<li key={i}><Text style={{ color: 'var(--colorTextWhite)' }}>{m?.manga?.title ?? '-'}</Text></li>
											))}
										</ul>
									</Box>
								)}
							</>
						)}
					</>
				)}
			/>
		</>

	);
};

export default SearchScreenCharacters;
