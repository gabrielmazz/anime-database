import React, { useEffect, useMemo, useRef, useState } from 'react';

// UI base (Mantine)
import {
	BackgroundImage,
	Box,
	Container,
	Divider,
	Group,
	Image,
	Pill,
	Space,
	Table,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

// Componentes compartilhados
import Sidebar from '../assets/components/sidebar.tsx';
import LoadingOverlayFullscreen from '../assets/components/overlay.tsx';
import InfoDrawer from '../assets/components/infoDrawer.tsx';
import AlertBox from '../assets/components/alert.tsx';

// CSS Modules / estilos
import TextInputModule from '../assets/inputInfos/TextInput.module.css';
import MultiSelectModule from '../assets/inputInfos/MultiSelect.module.css';
import TableModule from '../assets/inputInfos/Table.module.css';
import DrawerModule from '../assets/inputInfos/Drawer.module.css';

// Tema / utils
import { applyPaletteToCssVariables, extractPaletteFromImage } from '../utils/palette';
import { getRandomWallpaper } from '../utils/wallpaper';

// API
import { getProducers, searchProducersByName, getProducerFull, type Producer } from '../assets/API/jikan';
import LoaderBox from '../assets/components/loaderBox.tsx';

const SearchScreenProducers: React.FC = () => {
	const [wallpaper, _setWallpaper] = useState<string>(() => getRandomWallpaper('producers'));
	const [isLoading, setIsLoading] = useState(false);
	const [query, setQuery] = useState('');
	const [rows, setRows] = useState<Producer[]>([]);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const sentinelRef = useRef<HTMLDivElement | null>(null);

	const [opened, setOpened] = useState(false);
	const [selected, setSelected] = useState<Producer | null>(null);
	const [selectedFull, setSelectedFull] = useState<any | null>(null);

	const isLgDown = useMediaQuery('(max-width: 1024px)');
	const isSmDown = useMediaQuery('(max-width: 640px)');
	const drawerSize = isLgDown ? '100%' : '35%';
	const logoHeight = isSmDown ? 120 : 160;

	const [alertVisible, setAlertVisible] = useState(false);
	const [alertMessage, setAlertMessage] = useState('');
	const [alertType, setAlertType] = useState<'info' | 'warning' | 'error' | 'success'>('info');

	// Paleta dinâmica
	useEffect(() => {
		if (!wallpaper) return;
		extractPaletteFromImage(wallpaper).then(applyPaletteToCssVariables).catch(() => { });
	}, [wallpaper]);

	// Carrega primeira lista
	useEffect(() => {
		let cancelled = false;
		const run = async () => {
			setIsLoading(true);
			try {
				const r = await getProducers(1, 25);
				if (!cancelled) {
					setRows(r.data ?? []);
					setPage(1);
					setHasMore((r as any)?.data?.length >= 25);
					setAlertType('success');
					setAlertMessage(`Produtores carregados (${(r as any)?.data?.length ?? 0})`);
					setAlertVisible(true);
				}
			} catch {
				setAlertType('error');
				setAlertMessage('Falha ao carregar produtores.');
				setAlertVisible(true);
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		};
		run();
		return () => { cancelled = true; };
	}, []);

	// Busca por nome (debounce simples)
	useEffect(() => {
		let cancelled = false;
		const h = window.setTimeout(async () => {
			if (cancelled) return;
			const q = query.trim();
			if (!q) {
				// volta para listagem básica
				const r = await getProducers(1, 25);
				setRows(r.data ?? []);
				setPage(1);
				setHasMore((r as any)?.data?.length >= 25);
				return;
			}
			setIsLoading(true);
			try {
				const r = await searchProducersByName(q, 1, 25);
				setRows(r.data ?? []);
				setPage(1);
				setHasMore((r as any)?.data?.length >= 25);
				setAlertType('success');
				setAlertMessage(`${(r as any)?.data?.length ?? 0} produtores encontrados.`);
				setAlertVisible(true);
			} catch {
				setAlertType('error');
				setAlertMessage('Falha na busca por produtores.');
				setAlertVisible(true);
			} finally {
				setIsLoading(false);
			}
		}, 400);
		return () => { cancelled = true; window.clearTimeout(h); };
	}, [query]);

	// Auto esconde o alerta após alguns segundos
	useEffect(() => {
		if (!alertVisible) return;
		const id = window.setTimeout(() => setAlertVisible(false), 2500);
		return () => window.clearTimeout(id);
	}, [alertVisible]);

	// Infinite scroll
	useEffect(() => {
		if (!scrollRef.current || !sentinelRef.current) return;
		const root = scrollRef.current;
		const sentinel = sentinelRef.current;
		const obs = new IntersectionObserver((entries) => {
			const entry = entries[0];
			if (!entry?.isIntersecting || isLoadingMore || !hasMore) return;
			const next = page + 1;
			setIsLoadingMore(true);
			(async () => {
				try {
					const q = query.trim();
					const r = q ? await searchProducersByName(q, next, 25) : await getProducers(next, 25);
					const count = (r as any)?.data?.length ?? 0;
					setRows((prev) => [...prev, ...(r.data ?? [])]);
					setPage(next);
					setHasMore(count >= 25);
				} finally {
					setIsLoadingMore(false);
				}
			})();
		}, { root, rootMargin: '0px 0px 200px 0px', threshold: 0.05 });
		obs.observe(sentinel);
		return () => obs.disconnect();
	}, [page, query, isLoadingMore, hasMore]);

	// Linhas da tabela
	const tableRows = useMemo(() => rows.map((p, idx) => (
		<Table.Tr
			key={p.mal_id}
			className={TableModule.trTable}
			style={{ cursor: 'pointer' }}
			onClick={() => {
				setSelected(p);
				setOpened(true);
				setSelectedFull(null);
				getProducerFull(p.mal_id).then((full) => setSelectedFull((full as any)?.data ?? full)).catch(() => {
					setAlertType('error');
					setAlertMessage('Falha ao carregar detalhes do produtor.');
					setAlertVisible(true);
				});
			}}
		>
			<Table.Td className={TableModule.tdTable} width={64}>
				<Text style={{ color: 'var(--color1)', fontWeight: 700 }}>{idx + 1}</Text>
			</Table.Td>
			<Table.Td className={TableModule.tdTable}>
				<Group wrap="nowrap" gap="sm" align="center">
					{p.images?.jpg?.image_url && (
						<Image src={p.images.jpg.image_url} w={56} h={56} radius="sm" fit="contain" alt={p.name} />
					)}
					<Box>
						<Text style={{ color: 'var(--colorTextWhite)' }}>{p.name}</Text>
						{typeof p.favorites === 'number' && (
							<Text size="xs" c="dimmed">Favorites: {p.favorites}</Text>
						)}
					</Box>
				</Group>
			</Table.Td>
		</Table.Tr>
	)), [rows]);

	return (
		<>
			<BackgroundImage src={wallpaper} className="relative text-white w-full min-h-screen bg-cover bg-no-repeat bg-center bg-fixed">
				<div className="absolute inset-0 bg-black/60 pointer-events-none" />

				<AlertBox visible={alertVisible} message={alertMessage} type={alertType} />
				<LoadingOverlayFullscreen visible={isLoading} message={query ? 'Buscando produtores...' : 'Carregando produtores...'} />
				<Sidebar />

				<div className="container relative z-10 min-h-screen mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
					<Title
						className="flex justify-center text-center pt-8 text-shadow-lg/20 text-(--color1) uppercase tracking-(--title-letter-spacing) text-2xl sm:text-3xl lg:text-4xl"
						style={{ fontFamily: 'var(--text-font-mono)' }}
					>
						Produtores — Busca
					</Title>

					<Space h={33} />

					<Group grow>
						<TextInput
							size="md"
							label="Buscar produtor"
							description="Digite o nome do estúdio/produtor para buscar"
							placeholder="Ex.: Toei Animation, MAPPA, ufotable..."
							value={query}
							classNames={{ input: TextInputModule.inputTextInput, label: TextInputModule.labelTextInput, description: TextInputModule.descriptionTextInput }}
							className="mt-4 w-full max-w-2xl mx-auto"
							onChange={(e) => setQuery(e.currentTarget.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									const v = (e.currentTarget.value || '').trim();
									setQuery(v);
									e.currentTarget.blur();
									if (!v) {
										setAlertType('warning'); setAlertMessage('Digite um nome para buscar.'); setAlertVisible(true);
									}
								}
							}}
							onBlur={(e) => { const v = (e.currentTarget.value || '').trim(); if (v !== query) setQuery(v); }}
							onFocus={(e) => e.target.select()}
						/>
					</Group>

					<Space h="md" />

					<Container fluid className="bg-black/40 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg w-full max-w-none mx-auto p-4 sm:p-6 md:p-8 mt-6 mb-0 h-[70vh] overflow-hidden">
						<div ref={scrollRef} className="h-[calc(100%-0px)] overflow-auto rounded-md overflow-x-auto">
							<Table highlightOnHover className="min-w-[640px]" classNames={{ table: TableModule.tableTable, thead: TableModule.theadTable, th: TableModule.thTable, tr: TableModule.trTable, td: TableModule.tdTable, caption: TableModule.captionTable }}>
								<Table.Thead className="sticky top-0 z-10">
									<Table.Tr>
										<Table.Th style={{ width: 64 }}>#</Table.Th>
										<Table.Th>Produtor</Table.Th>
									</Table.Tr>
								</Table.Thead>
								<Table.Tbody>{tableRows}</Table.Tbody>
							</Table>
							<div ref={sentinelRef} style={{ height: 8, width: '100%' }} />
						</div>
					</Container>
				</div>
			</BackgroundImage>

			<InfoDrawer
				opened={opened}
				onClose={() => { setOpened(false); setSelected(null); setSelectedFull(null); }}
				title={<Title order={2} className="font-bold text-shadow-lg/20 text-(--colorTextWhite) uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 32, fontFamily: 'var(--text-font-mono)' }}>Informações do Produtor</Title>}
				position="right"
				size={drawerSize}
				overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
				classNames={{ root: DrawerModule.rootDrawer, header: DrawerModule.headerDrawer, body: DrawerModule.bodyDrawer }}
				content={selected && (
					<>
						<Box>
							{selected.images?.jpg?.image_url && (
								<Image src={selected.images.jpg.image_url} radius="md" h={logoHeight} w="auto" className="mb-4" />
							)}
							<Title size="xl" className="font-bold text-center text-shadow-lg/20 text-(--colorTextWhite) uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 28, fontFamily: 'var(--text-font-mono)' }}>
								{selected.name}
							</Title>
						</Box>

						<Space h="md" />

						{!selectedFull && (<LoaderBox message="Carregando detalhes do produtor..." />)}

						{selectedFull && (
							<>
								{selectedFull?.about && (
									<Box>
										<Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>Sobre:</Text>
										<Text component="span" style={{ color: 'var(--colorTextWhite)' }}>{selectedFull.about}</Text>
									</Box>
								)}

								<Space h="lg" />

								{Array.isArray(selectedFull?.anime) && selectedFull.anime.length > 0 && (
									<>
										<Divider my="xl" label={<Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>Principais Obras</Text>} labelPosition="center" />
										<div className="rounded-lg border border-white/20 bg-black/30 backdrop-blur-sm p-2">
											<Pill.Group className="flex flex-wrap gap-2">
												{(selectedFull.anime as any[]).slice(0, 24).map((a: any, i: number) => (
													<Pill key={i} size="sm" radius="xl" className={MultiSelectModule.pillMultiSelect} style={{ color: 'var(--colorTextWhite)' }}>{a?.title ?? '-'}</Pill>
												))}
											</Pill.Group>
										</div>
									</>
								)}
							</>
						)}
					</>
				)}
			/>
		</>
	);
};

export default SearchScreenProducers;
