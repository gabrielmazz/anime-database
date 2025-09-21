import React, { useEffect, useMemo, useRef, useState } from 'react';

// UI base e layout
import { BackgroundImage, Box, Container, Group, Image, NumberInput, Select, Space, Table, Text, Title, MultiSelect, Grid, Divider } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useMediaQuery } from '@mantine/hooks';
import InfoDrawer from '../assets/components/infoDrawer.tsx';
import DrawerModule from '../assets/inputInfos/Drawer.module.css';
import LoaderBox from '../assets/components/loaderBox.tsx';
import AlertBox from '../assets/components/alert.tsx';

// Componentes compartilhados
import Sidebar from '../assets/components/sidebar.tsx';
import LoadingOverlayFullscreen from '../assets/components/overlay.tsx';

// Tema dinâmico
import { applyPaletteToCssVariables, extractPaletteFromImage } from '../utils/palette';
import { getRandomWallpaper } from '../utils/wallpaper';

// APIs
import { getAnimeBySeason, getAnimeGenres, getAnimePictures, getAnimeCharacters, type SeasonKey, type Anime, type Genre } from '../assets/API/jikan';
import { translateText, translateTextDetailed } from '../assets/API/translate';
import { useSettings } from '../state/settings';

// Estilos
import TableModule from '../assets/inputInfos/Table.module.css';
import NumberInputModule from '../assets/inputInfos/NumberInput.module.css';
import SelectModule from '../assets/inputInfos/Select.module.css';
import MultiSelectModule from '../assets/inputInfos/MultiSelect.module.css';

const SEASON_OPTIONS: { value: SeasonKey; label: string }[] = [
	{ value: 'winter', label: 'Inverno' },
	{ value: 'spring', label: 'Primavera' },
	{ value: 'summer', label: 'Verão' },
	{ value: 'fall', label: 'Outono' },
];

function getCurrentSeasonKey(d = new Date()): SeasonKey {
	const m = d.getMonth(); // 0-11
	if (m <= 1 || m === 11) return 'winter'; // Jan/Fev/Dez
	if (m >= 2 && m <= 4) return 'spring';   // Mar-Abr-Mai
	if (m >= 5 && m <= 7) return 'summer';   // Jun-Jul-Ago
	return 'fall';                            // Set-Out-Nov
}

function formatNumber(n?: number | null) {
	if (typeof n !== 'number') return '-';
	try { return new Intl.NumberFormat('pt-BR').format(n); } catch { return String(n); }
}

const ExploreSeasonsScreen: React.FC = () => {
	const now = new Date();
	const [wallpaper, setWallpaper] = useState<string>(() => getRandomWallpaper('seasons'));
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [rows, setRows] = useState<Anime[]>([]);
	const [rawRows, setRawRows] = useState<Anime[]>([]);
	const { apiModalEnabled, setLastApiPayload, setLastSearchPayload, animesPageLimit } = useSettings();
	const [page, setPage] = useState<number>(1);
	const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const sentinelRef = useRef<HTMLDivElement | null>(null);
    const [openedInfo, setOpenedInfo] = useState<boolean>(false);
    const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
    const [animeSelectedPictures, setAnimeSelectedPictures] = useState<any>(null);
    const [animeSelectedCharacters, setAnimeSelectedCharacters] = useState<any>(null);
    const [translatedSynopsis, setTranslatedSynopsis] = useState<string | null>(null);
    const [translateStatus, setTranslateStatus] = useState<string | null>(null);
	const [showHentai, setShowHentai] = useState<boolean>(false);
	const [genreOptions, setGenreOptions] = useState<{ value: string; label: string }[]>([]);
	const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

	// Filtros
	const [year, setYear] = useState<number | ''>(now.getFullYear());
	const [season, setSeason] = useState<SeasonKey>(getCurrentSeasonKey(now));

	// Alertas (suave) para feedback de requisições
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState<'info' | 'warning' | 'error' | 'success'>('info');
    const isSmDown = useMediaQuery('(max-width: 640px)');
    const isLgDown = useMediaQuery('(max-width: 1024px)');
    const drawerSize = isLgDown ? '100%' : '35%';
    const coverHeight = isSmDown ? 360 : isLgDown ? 480 : 600;
    const carouselHeight = isSmDown ? 320 : isLgDown ? 420 : 600;

	// Aplica paleta baseada no wallpaper
  useEffect(() => {
      if (!wallpaper) return;
      extractPaletteFromImage(wallpaper)
          .then(applyPaletteToCssVariables)
          .catch(() => { /* ignora erros silenciosamente */ });
  }, [wallpaper]);

  // Busca imagens e personagens quando um anime é selecionado
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!selectedAnime) return;
      try {
        const [pics, chars] = await Promise.all([
          getAnimePictures(selectedAnime.mal_id),
          getAnimeCharacters(selectedAnime.mal_id),
        ]);
        if (!cancelled) {
          setAnimeSelectedPictures(pics);
          setAnimeSelectedCharacters(chars);
        }
      } catch {}
    };
    run();
    return () => { cancelled = true; };
  }, [selectedAnime]);

  // Traduções
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!selectedAnime || !selectedAnime.synopsis) { setTranslatedSynopsis(null); return; }
      try {
        const { text, translated } = await translateTextDetailed(selectedAnime.synopsis, 'en', 'pt-BR');
        if (!cancelled) {
          setTranslatedSynopsis(text);
          setAlertType(translated ? 'success' : 'warning');
          setAlertMessage(translated ? 'Sinopse traduzida com sucesso!' : 'Não foi possível traduzir. Mostrando o texto original.');
          setAlertVisible(true);
        }
      } catch {
        if (!cancelled) setTranslatedSynopsis(selectedAnime.synopsis);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [selectedAnime]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!selectedAnime || !selectedAnime.status) { setTranslateStatus(null); return; }
      try {
        const t = await translateText(selectedAnime.status, 'en', 'pt-BR');
        if (!cancelled) setTranslateStatus(t);
      } catch {
        if (!cancelled) setTranslateStatus(selectedAnime.status);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [selectedAnime]);

	// Helper para derivar gêneros a partir da lista carregada de animes
	function deriveGenreOptionsFromAnimes(list: Anime[]): { value: string; label: string }[] {
		const collect = (arr?: any[]) => (Array.isArray(arr) ? arr.map((g) => String(g?.name || '').trim()).filter(Boolean) : []);
		const set = new Set<string>();
		for (const a of list) {
			for (const n of [
				...collect((a as any)?.genres),
				...collect((a as any)?.themes),
				...collect((a as any)?.explicit_genres),
				...collect((a as any)?.demographics),
			]) set.add(n);
		}
		return Array.from(set)
			.sort((a, b) => a.localeCompare(b))
			.map((name) => ({ value: name, label: name }));
	}

	// Carrega lista de gêneros (flat, sem grupos) com fallback
	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const r = await getAnimeGenres();
				if (!cancelled) {
					const opts = (Array.isArray(r?.data) ? (r.data as Genre[]) : [])
						.map((g) => ({ value: String(g.name), label: String(g.name) }));
					// Remove duplicados e ordena
					const uniq: Record<string, { value: string; label: string }> = {};
					for (const o of opts) uniq[o.value] = o;
					let list = Object.values(uniq).sort((a, b) => a.label.localeCompare(b.label));
					// Fallback: se a API retornar vazio, extrai dos animes carregados
					if (list.length === 0) {
						list = deriveGenreOptionsFromAnimes(rawRows);
					}
					setGenreOptions(list);
				}
			} catch {
				// Fallback total em caso de erro: tenta derivar dos animes já carregados
				if (!cancelled) {
					const list = deriveGenreOptionsFromAnimes(rawRows);
					if (list.length > 0) setGenreOptions(list);
				}
			}
		})();
		return () => { cancelled = true; };
	}, []);

	// Caso a lista de gêneros continue vazia após carregar animes, tenta derivar novamente
	useEffect(() => {
		if (genreOptions.length > 0) return;
		if (!rawRows || rawRows.length === 0) return;
		const list = deriveGenreOptionsFromAnimes(rawRows);
		if (list.length > 0) setGenreOptions(list);
	}, [genreOptions, rawRows]);

	function isHentaiAnime(a: any): boolean {
		try {
			const check = (arr?: any[]) => Array.isArray(arr) && arr.some((g) => String(g?.name || '').toLowerCase() === 'hentai');
			if (check((a as any)?.genres)) return true;
			if (check((a as any)?.explicit_genres)) return true;
			const rating = String((a as any)?.rating || '').toLowerCase();
			if (rating.includes('hentai') || rating.includes('rx')) return true;
			return false;
		} catch { return false; }
	}

	const applyHentaiFilter = (list: Anime[], allow: boolean): Anime[] => allow ? list : list.filter((x) => !isHentaiAnime(x));

	const hasAllSelectedGenres = (a: any, selected: string[]): boolean => {
		if (!Array.isArray(selected) || selected.length === 0) return true; // sem filtro -> inclui
		const selectedLower = selected.map((s) => s.toLowerCase());
		const collect = (arr?: any[]) => (Array.isArray(arr) ? arr.map((g) => String(g?.name || '').toLowerCase()) : []);
		const names = [
			...collect((a as any)?.genres),
			...collect((a as any)?.themes),
			...collect((a as any)?.explicit_genres),
			...collect((a as any)?.demographics),
		];
		const namesSet = new Set(names);
		return selectedLower.every((g) => namesSet.has(g));
	};

	const applyGenreFilter = (list: Anime[], selected: string[]): Anime[] => list.filter((x) => hasAllSelectedGenres(x, selected));

	const applyAllFilters = (base: Anime[]): Anime[] => {
		const selectedLower = selectedGenres.map((g) => g.toLowerCase());
		// Se o usuário selecionou "Hentai" nos gêneros, não filtra +18
		const allowHentai = showHentai || selectedLower.includes('hentai');
		const hentai = applyHentaiFilter(base, allowHentai);
		return applyGenreFilter(hentai, selectedGenres);
	};

	// Carrega animes ao mudar filtros ou limite
	useEffect(() => {
		let cancelled = false;
		const run = async () => {
			if (typeof year !== 'number' || year < 1917 || year > 2999 || !season) return;
			setIsLoading(true);
			try {
				const r = await getAnimeBySeason(year, season, 1, animesPageLimit);
				if (apiModalEnabled) {
					const payload = { endpoint: 'getAnimeBySeason', year, season, page: 1, limit: animesPageLimit, response: r };
					setLastApiPayload(payload);
					setLastSearchPayload(payload);
				}
				if (!cancelled) {
					const base = (r.data ?? []) as Anime[];
					setRawRows(base);
					setRows(applyAllFilters(base));
					setPage(1);
					setHasMore(((r as any)?.data?.length ?? 0) >= animesPageLimit);
				}
				setAlertType('success');
				setAlertMessage(`Temporada carregada (${(r as any)?.data?.length ?? 0} itens)`);
				setAlertVisible(true);
			} finally {
				if (!cancelled) setIsLoading(false);
			}
		};
		run();
		return () => { cancelled = true; };
	}, [year, season, animesPageLimit]);

	// Auto esconde o alerta após alguns segundos
	useEffect(() => {
		if (!alertVisible) return;
		const id = window.setTimeout(() => setAlertVisible(false), 2500);
		return () => window.clearTimeout(id);
	}, [alertVisible]);

	// Observa o fim da lista para carregar mais itens
	useEffect(() => {
		if (!scrollRef.current || !sentinelRef.current) return;
		if (typeof year !== 'number' || year < 1917 || year > 2999 || !season) return;
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
					const r2 = await getAnimeBySeason(year, season, nextPage, animesPageLimit);
					if (apiModalEnabled) {
						const payload = { endpoint: 'getAnimeBySeason', year, season, page: nextPage, limit: animesPageLimit, response: r2 };
						setLastApiPayload(payload);
						setLastSearchPayload(payload);
					}
					const count = (r2 as any)?.data?.length ?? 0;
					const mergedRaw = [...rawRows, ...((r2.data ?? []) as Anime[])];
					setRawRows(mergedRaw);
					setRows(applyAllFilters(mergedRaw));
					setAlertType('success');
					setAlertMessage(`Mais ${count} animes carregados — pág. ${nextPage}`);
					setAlertVisible(true);
					setPage(nextPage);
					setHasMore(count >= animesPageLimit);
				} catch { }
				finally {
					setIsLoadingMore(false);
				}
			};
			loadMore();
		}, { root, rootMargin: '0px 0px 200px 0px', threshold: 0.05 });

		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [page, rows, rawRows, showHentai, apiModalEnabled, hasMore, isLoadingMore, animesPageLimit, year, season]);

	// Reaplica o filtro quando o switch muda sem refazer chamadas
	useEffect(() => {
		setRows(applyAllFilters(rawRows));
	}, [showHentai, selectedGenres, rawRows]);

	const tableRows = useMemo(() => {
		return rows.map((a, idx) => (
			<Table.Tr
				key={a.mal_id}
				className={TableModule.trTable}
				style={{ cursor: 'pointer' }}
				onClick={() => { setSelectedAnime(a); setOpenedInfo(true); }}
			>
				<Table.Td className={TableModule.tdTable} width={64}>
					<Text style={{ color: 'var(--color1)', fontWeight: 700 }}>{idx + 1}</Text>
				</Table.Td>
				<Table.Td className={TableModule.tdTable}>
					<Group wrap="nowrap" gap="sm" align="center">
						<Image src={a.images?.jpg?.image_url} w={56} h={56} radius="sm" fit="cover" alt={a.title} />
						<Box>
							<Text style={{ color: 'var(--colorTextWhite)' }}>{a.title}</Text>
							<Text size="xs" c="dimmed">ID: {a.mal_id}</Text>
						</Box>
					</Group>
				</Table.Td>
				<Table.Td className={TableModule.tdTable} style={{ textAlign: 'right' }}>
					<Text style={{ color: 'var(--colorTextWhite)' }}>{formatNumber(a.score)}</Text>
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
				<LoadingOverlayFullscreen visible={isLoading} message={'Carregando temporada...'} />

				{/* Sidebar */}
				<Sidebar />

				{/* Conteúdo principal */}
				<div
					className="
						container relative z-10 min-h-screen mx-auto
						px-4 sm:px-6 lg:px-8 flex flex-col
					"
				>
					<Title
						className="
							flex justify-center text-center pt-8
							text-shadow-lg/20 text-(--color1)
							uppercase tracking-(--title-letter-spacing)
							text-2xl sm:text-3xl lg:text-4xl
						"
						style={{ fontFamily: 'var(--text-font-mono)' }}
					>
						Explorar Temporadas
					</Title>

					<Space h={50} />

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<NumberInput
							size="md"
							label="Ano"
							description="Ano da temporada (ex.: 2024)"
							min={1917}
							max={2999}
							step={1}
							clampBehavior="blur"
							allowDecimal={false}
							value={year}
							onChange={(v) => {
								if (v === '' || v === null || typeof v === 'undefined') {
									setYear('');
									return;
								}
								const n = typeof v === 'number' ? v : parseInt(String(v), 10);
								if (isNaN(n)) {
									setYear('');
								} else {
									setYear(n);
								}
							}}
							onBlur={() => {
								const current = typeof year === 'number' ? year : now.getFullYear();
								const clamped = Math.min(2999, Math.max(1917, current));
								if (year !== clamped) setYear(clamped);
							}}
							classNames={{
								input: NumberInputModule.inputNumberInput,
								controls: NumberInputModule.controlsNumberInput,
								control: NumberInputModule.controlNumberInput,
								label: NumberInputModule.labelNumberInput,
								description: NumberInputModule.descriptionNumberInput,
							}}
						/>

						<Select
							size="md"
							label="Temporada"
							placeholder="Selecione a temporada"
							description="Estação do ano da temporada"
							data={SEASON_OPTIONS}
							value={season}
							onChange={(val) => { if (val) setSeason(val as SeasonKey); }}
							classNames={{
								input: SelectModule.inputSelect,
								label: SelectModule.labelSelect,
								description: SelectModule.descriptionSelect,
								dropdown: SelectModule.dropdownSelect,
								option: SelectModule.optionSelect,
								wrapper: SelectModule.wrapperSelect,
							}}
						/>

						<MultiSelect
							size="md"
							label="Filtrar por gêneros"
							description="Selecione 1+ gêneros para incluir nos resultados"
							placeholder="Ex.: Ação, Comédia, Romance..."
							data={genreOptions}
							comboboxProps={{ withinPortal: true, zIndex: 400 }}
							nothingFoundMessage="Nenhum gênero encontrado"
							value={selectedGenres}
							onChange={setSelectedGenres}
							searchable
							clearable
							maxDropdownHeight={300}
							classNames={{
								input: MultiSelectModule.inputMultiSelect,
								label: MultiSelectModule.labelMultiSelect,
								description: MultiSelectModule.descriptionMultiSelect,
								dropdown: MultiSelectModule.dropdownMultiSelect,
								option: MultiSelectModule.optionMultiSelect,
								pillsList: MultiSelectModule.pillsListMultiSelect,
								pill: MultiSelectModule.pillMultiSelect,
							}}
						/>
					</div>

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
						<div ref={scrollRef} className="h-[calc(100%-0px)] overflow-auto rounded-md overflow-x-auto">
							<Table
								highlightOnHover
								className="min-w-[640px]"
								classNames={{
									table: TableModule.tableTable,
									thead: TableModule.theadTable,
									th: TableModule.thTable,
									tr: TableModule.trTable,
									td: TableModule.tdTable,
									caption: TableModule.captionTable,
								}}
							>
								<Table.Thead className="sticky top-0 z-10">
									<Table.Tr>
										<Table.Th style={{ width: 64 }}>#</Table.Th>
										<Table.Th>Anime</Table.Th>
										<Table.Th style={{ width: 140, textAlign: 'right' }}>Score</Table.Th>
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

			{/* Drawer de informações do anime */}
            <InfoDrawer
                opened={openedInfo}
                onClose={() => {
                    setOpenedInfo(false);
                    setSelectedAnime(null);
                    setAnimeSelectedPictures(null);
                    setAnimeSelectedCharacters(null);
                }}
                title={
                    <Title
                        order={2}
                        className="font-bold text-shadow-lg/20 text-(--colorTextWhite) uppercase tracking-(--title-letter-spacing)"
                        style={{ fontSize: 32, fontFamily: 'var(--text-font-mono)' }}
                    >
                        Informações do Anime
                    </Title>
                }
                position="right"
                size={drawerSize}
                overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
                classNames={{
                    root: DrawerModule.rootDrawer,
                    header: DrawerModule.headerDrawer,
                    body: DrawerModule.bodyDrawer,
                }}
                content={selectedAnime && (
                    <>
                        <Box>
                            <Image
                                src={selectedAnime.images?.jpg?.image_url}
                                radius="md"
                                w="auto"
                                h={coverHeight}
                                className="
                                    mb-4
                                    flex items-center justify-center justify-self-center
                                    shadow-lg/40
                                "
                            />

                            <Space h="md" />

                            <Title
                                size="xl"
                                className="
                                    font-bold text-center
                                    text-shadow-lg/20
                                    text-(--colorTextWhite)
                                    uppercase
                                    tracking-(--title-letter-spacing)
                                "
                                style={{ fontSize: 32, fontFamily: 'var(--text-font-mono)' }}
                            >
                                {selectedAnime.title}
                            </Title>

                            <Space h="md" />

                            <Box>
                                <Text
                                    component="span"
                                    className="
                                    font-bold
                                    uppercase
                                    tracking-(--title-letter-spacing)
                                "
                                    style={{
                                        fontSize: 16,
                                        fontFamily: 'Raleway, sans-serif',
                                        color: 'var(--colorTextWhite)',
                                        marginRight: 6
                                    }}
                                >
                                    Sinopse:
                                </Text>
                                {translatedSynopsis === null && selectedAnime?.synopsis ? (
                                    <LoaderBox message="Traduzindo sinopse..." />
                                ) : (
                                    <Text component="span" style={{ color: 'var(--colorTextWhite)' }}>
                                        {translatedSynopsis ?? selectedAnime?.synopsis}
                                    </Text>
                                )}
                            </Box>
                        </Box>

                        <Space h="lg" />

                        <Box>
                            <Text
                                component="span"
                                className="
                                    font-bold
                                    uppercase
                                    tracking-(--title-letter-spacing)
                                "
                                style={{
                                    fontSize: 16,
                                    fontFamily: 'Raleway, sans-serif',
                                    color: 'var(--colorTextWhite)',
                                    marginRight: 6
                                }}
                            >
                                Numero de Episódios:
                            </Text>
                            <Text component="span" style={{ color: 'var(--colorTextWhite)' }}>
                                {selectedAnime.episodes}
                            </Text>
                        </Box>

                        <Space h="lg" />

                        <Box>
                            <Text
                                component="span"
                                className="
                                    font-bold
                                    uppercase
                                    tracking-(--title-letter-spacing)
                                "
                                style={{
                                    fontSize: 16,
                                    fontFamily: 'Raleway, sans-serif',
                                    color: 'var(--colorTextWhite)',
                                    marginRight: 6
                                }}
                            >
                                Status do Anime:
                            </Text>
                            {translateStatus === null && selectedAnime?.status ? (
                                <LoaderBox message="Traduzindo status..." />
                            ) : (
                                <Text component="span" style={{ color: 'var(--colorTextWhite)' }}>
                                    {translateStatus ?? selectedAnime.status}
                                </Text>
                            )}
                        </Box>

                        <Space h="lg" />

                        <Box>
                            <Text
                                component="span"
                                className="
                                    font-bold
                                    uppercase
                                    tracking-(--title-letter-spacing)
                                "
                                style={{
                                    fontSize: 16,
                                    fontFamily: 'Raleway, sans-serif',
                                    color: 'var(--colorTextWhite)',
                                    marginRight: 6
                                }}
                            >
                                Nota do Anime:
                            </Text>
                            <Text component="span" style={{ color: 'var(--colorTextWhite)' }}>
                                {selectedAnime.score}
                            </Text>
                        </Box>

                        <Divider
                            my="xl"
                            label={
                                <Text
                                    component="span"
                                    className="
                                        font-bold
                                        uppercase
                                        tracking-(--title-letter-spacing)
                                    "
                                    style={{
                                        fontSize: 16,
                                        fontFamily: 'Raleway, sans-serif',
                                        color: 'var(--colorTextWhite)',
                                        marginRight: 6
                                    }}
                                >
                                    Imagens do Anime
                                </Text>
                            }
                            labelPosition="center"
                        />

                        <Carousel
                            slideSize="70%"
                            height={carouselHeight}
                            withControls={false}
                            withIndicators={false}
                            slideGap="xs"
                            emblaOptions={{
                                loop: true,
                                dragFree: true,
                                align: 'center',
                                slidesToScroll: 1,
                            }}
                            plugins={[Autoplay({ delay: 2500 })]}
                        >
                            {animeSelectedPictures && animeSelectedPictures.data.map((picture: any, index: number) => (
                                <Carousel.Slide key={index}>
                                    <Image src={picture.jpg.large_image_url} radius="md" h={carouselHeight} w="auto" />
                                </Carousel.Slide>
                            ))}
                        </Carousel>

                        {animeSelectedCharacters && Array.isArray(animeSelectedCharacters.data) &&
                            animeSelectedCharacters.data.some((character: any) => character.role === 'Main') && (
                                <>
                                    <Divider
                                        my="xl"
                                        label={
                                            <Text
                                                component="span"
                                                className="
                                                font-bold
                                                uppercase
                                                tracking-(--title-letter-spacing)
                                            "
                                                style={{
                                                    fontSize: 16,
                                                    fontFamily: 'Raleway, sans-serif',
                                                    color: 'var(--colorTextWhite)',
                                                    marginRight: 6
                                                }}
                                            >
                                                Personagens Principais
                                            </Text>
                                        }
                                        labelPosition="center"
                                    />
                                    {Array.from(
                                        { length: Math.ceil(animeSelectedCharacters.data.filter((character: any) => character.role === 'Main').length / 2) },
                                        (_, rowIndex) => {
                                            const mainCharacters = animeSelectedCharacters.data.filter((character: any) => character.role === 'Main');
                                            const rowCharacters = mainCharacters.slice(rowIndex * 2, rowIndex * 2 + 2);
                                            return (
                                                <Grid key={rowIndex} gutter="md" mb="md">
                                                    {rowCharacters.map((character: any, colIndex: number) => (
                                                        <Grid.Col span={6} key={colIndex}>
                                                            <Group>
                                                                <Image
                                                                    src={character.character.images.jpg.image_url}
                                                                    radius="md"
                                                                    h={120}
                                                                    w={80}
                                                                    alt={character.character.name}
                                                                />
                                                                <Text style={{ color: '#E8D4B7', fontWeight: 600 }}>
                                                                    {character.character.name}
                                                                </Text>
                                                            </Group>
                                                        </Grid.Col>
                                                    ))}
                                                </Grid>
                                            );
                                        }
                                    )}
                                </>
                            )}

                        {animeSelectedCharacters && Array.isArray(animeSelectedCharacters.data) &&
                            animeSelectedCharacters.data.some((character: any) => character.role !== 'Main') && (
                                <>
                                    <Divider
                                        my="xl"
                                        label={
                                            <Text
                                                component="span"
                                                className="
                                                font-bold
                                                uppercase
                                                tracking-(--title-letter-spacing)
                                            "
                                                style={{
                                                    fontSize: 16,
                                                    fontFamily: 'Raleway, sans-serif',
                                                    color: 'var(--colorTextWhite)',
                                                    marginRight: 6
                                                }}
                                            >
                                                Outros Personagens
                                            </Text>
                                        }
                                        labelPosition="center"
                                    />
                                    {Array.from(
                                        { length: Math.ceil(animeSelectedCharacters.data.filter((character: any) => character.role !== 'Main').length / 2) },
                                        (_, rowIndex) => {
                                            const otherCharacters = animeSelectedCharacters.data.filter((character: any) => character.role !== 'Main');
                                            const rowCharacters = otherCharacters.slice(rowIndex * 2, rowIndex * 2 + 2);
                                            return (
                                                <Grid key={rowIndex} gutter="md" mb="md">
                                                    {rowCharacters.map((character: any, colIndex: number) => (
                                                        <Grid.Col span={6} key={colIndex}>
                                                            <Group>
                                                                <Image
                                                                    src={character.character.images.jpg.image_url}
                                                                    radius="md"
                                                                    h={120}
                                                                    w={80}
                                                                    alt={character.character.name}
                                                                />
                                                                <Text style={{ color: 'var(--colorTextWhite)', fontWeight: 600 }}>
                                                                    {character.character.name}
                                                                </Text>
                                                            </Group>
                                                        </Grid.Col>
                                                    ))}
                                                </Grid>
                                            );
                                        }
                                    )}
                                </>
                            )}
                    </>
                )}
            />
		</>
	);
};

export default ExploreSeasonsScreen;
