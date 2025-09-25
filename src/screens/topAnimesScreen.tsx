import React, { useEffect, useMemo, useRef, useState } from 'react';

// UI base e layout
import {
  BackgroundImage,
  Box,
  Container,
  Divider,
  Grid,
  Group,
  Image,
  Space,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import Autoplay from 'embla-carousel-autoplay';
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
import { getTopAnime, getAnimePictures, getAnimeCharacters, type Anime } from '../assets/API/jikan';
import { translateText, translateTextDetailed } from '../assets/API/translate';
import { useSettings } from '../state/settings';
import { useMediaQuery } from '@mantine/hooks';

// Estilos da Tabela no padrão do projeto
import TableModule from '../assets/inputInfos/Table.module.css';

function formatNumber(n?: number | null) {
	if (typeof n !== 'number') return '-';
	try { return new Intl.NumberFormat('pt-BR').format(n); } catch { return String(n); }
}

const TopAnimesScreen: React.FC = () => {
	const [wallpaper, _setWallpaper] = useState<string>(() => getRandomWallpaper('topAnimes'));
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [rows, setRows] = useState<Anime[]>([]);
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

	// Breakpoints e dimensões responsivas
	const isSmDown = useMediaQuery('(max-width: 640px)');
	const isLgDown = useMediaQuery('(max-width: 1024px)');
	const drawerSize = isLgDown ? '100%' : '35%';
	const coverHeight = isSmDown ? 360 : isLgDown ? 480 : 600;

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

    // Carrega imagens/personagens quando um anime é selecionado
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
            } catch {
                setAlertType('error');
                setAlertMessage('Falha ao carregar imagens/personagens do anime.');
                setAlertVisible(true);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [selectedAnime]);

    // Tradução da sinopse
    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!selectedAnime || !selectedAnime.synopsis) { setTranslatedSynopsis(null); return; }
            try {
                const { text, translated } = await translateTextDetailed(selectedAnime.synopsis, 'en', 'pt-BR');
                if (!cancelled) {
                    setTranslatedSynopsis(text);
                    if (!translated) {
                        setAlertType('warning');
                        setAlertMessage('Não foi possível traduzir a sinopse.');
                        setAlertVisible(true);
                    }
                }
            } catch {
                if (!cancelled) setTranslatedSynopsis(selectedAnime.synopsis);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [selectedAnime]);

    // Tradução de status
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

	// Carrega Top Animes no primeiro render e quando o limite muda
	useEffect(() => {
		let cancelled = false;
		const run = async () => {
			setIsLoading(true);
			try {
				const r = await getTopAnime(1, animesPageLimit);
				if (apiModalEnabled) {
					const payload = { endpoint: 'getTopAnime', page: 1, limit: animesPageLimit, response: r };
					setLastApiPayload(payload);
					setLastSearchPayload(payload);
				}
				if (!cancelled) {
					setRows(r.data ?? []);
					setPage(1);
					setHasMore(((r as any)?.data?.length ?? 0) >= animesPageLimit);
				}
				setAlertType('success');
				setAlertMessage(`Top Animes carregado (${(r as any)?.data?.length ?? 0} itens)`);
				setAlertVisible(true);
            } catch {
                setAlertType('error');
                setAlertMessage('Falha ao carregar Top Animes.');
                setAlertVisible(true);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
		run();
		return () => { cancelled = true; };
	}, [animesPageLimit]);

	// Auto esconde o alerta após alguns segundos
	useEffect(() => {
		if (!alertVisible) return;
		const id = window.setTimeout(() => setAlertVisible(false), 2500);
		return () => window.clearTimeout(id);
	}, [alertVisible]);

	// Observa o fim da lista para carregar mais itens
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
					const r2 = await getTopAnime(nextPage, animesPageLimit);
					if (apiModalEnabled) {
						const payload = { endpoint: 'getTopAnime', page: nextPage, limit: animesPageLimit, response: r2 };
						setLastApiPayload(payload);
						setLastSearchPayload(payload);
					}
					const count = (r2 as any)?.data?.length ?? 0;
					setRows((prev) => [...prev, ...(r2.data ?? [])]);
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
	}, [page, rows, apiModalEnabled, hasMore, isLoadingMore, animesPageLimit]);

	const tableRows = useMemo(() => {
		return rows.map((a, idx) => (
			<Table.Tr
				key={a.mal_id}
				className={TableModule.trTable}
				style={{ cursor: 'pointer' }}
				onClick={() => {
					setSelectedAnime(a);
					setOpenedInfo(true);
				}}
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
				className="
					relative
					text-white
					w-full
					min-h-screen
					bg-cover bg-no-repeat bg-center bg-fixed
				"
			>
				{/* Overlay escurecedor */}
				<div className="absolute inset-0 bg-black/60 pointer-events-none" />

				{/* Alert + Loading overlay */}
				<AlertBox visible={alertVisible} message={alertMessage} type={alertType} />
				<LoadingOverlayFullscreen visible={isLoading} message={'Carregando ranking de animes...'} />

				{/* Sidebar */}
				<Sidebar />

				{/* Conteúdo principal */}
				<div
					className="
						container
						relative z-10
						min-h-screen
						mx-auto
						px-4 sm:px-6 lg:px-8
						flex flex-col
					"
				>
					<Title
						className="
							flex justify-center text-center
							pt-8
							text-shadow-lg/20
							text-(--color1)
							uppercase
							tracking-(--title-letter-spacing)
							text-2xl sm:text-3xl lg:text-4xl
						"
						style={{ fontFamily: 'var(--text-font-mono)' }}
					>
						Top rank de Animes
					</Title>

					<Space h="md" />

					<Container
						fluid
						className="
              bg-black/40 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg
              w-full max-w-none mx-auto
              p-4 sm:p-6 md:p-8
              mt-12 mb-0
              h-[80vh] overflow-hidden
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
										<Table.Th style={{ width: 64 }}>Rank</Table.Th>
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
                onClose={() => { setOpenedInfo(false); setSelectedAnime(null); }}
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
                classNames={{ root: DrawerModule.rootDrawer, header: DrawerModule.headerDrawer, body: DrawerModule.bodyDrawer }}
                content={selectedAnime && (
                    <>
                        <Box>
                            <Image src={selectedAnime.images?.jpg?.image_url} radius="md" h={coverHeight} w="auto" className="mb-4 shadow-lg/40" />

                            <Title size="xl" className="font-bold text-center text-shadow-lg/20 text-(--colorTextWhite) uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 32, fontFamily: 'var(--text-font-mono)' }}>
                                {selectedAnime.title}
                            </Title>

                            <Space h="md" />

                            <Box>
                                <Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>Sinopse:</Text>
                                {translatedSynopsis === null && selectedAnime?.synopsis ? (
                                    <LoaderBox message="Traduzindo sinopse..." />
                                ) : (
                                    <Text component="span" style={{ color: 'var(--colorTextWhite)' }}>{translatedSynopsis ?? selectedAnime?.synopsis}</Text>
                                )}
                            </Box>
                        </Box>

                        <Space h="lg" />

                        <Box>
                            <Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>Numero de Episódios:</Text>
                            <Text component="span" style={{ color: 'var(--colorTextWhite)' }}>{(selectedAnime as any).episodes}</Text>
                        </Box>

                        <Space h="lg" />

                        <Box>
                            <Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>Status do Anime:</Text>
                            {translateStatus === null && selectedAnime?.status ? (
                                <LoaderBox message="Traduzindo status..." />
                            ) : (
                                <Text component="span" style={{ color: 'var(--colorTextWhite)' }}>{translateStatus ?? (selectedAnime as any).status}</Text>
                            )}
                        </Box>

                        <Space h="lg" />

                        <Box>
                            <Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>Nota do Anime:</Text>
                            <Text component="span" style={{ color: 'var(--colorTextWhite)' }}>{formatNumber((selectedAnime as any).score)}</Text>
                        </Box>

                        <Divider my="xl" label={<Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>Imagens do Anime</Text>} labelPosition="center" />

                        <Carousel
                            slideSize="70%"
                            height={coverHeight}
                            withControls={false}
                            withIndicators={false}
                            slideGap="md"
                            emblaOptions={{ loop: true, dragFree: true, align: 'center', slidesToScroll: 1 }}
                            plugins={[Autoplay({ delay: 2500 })]}
                        >
                            {animeSelectedPictures && animeSelectedPictures.data && animeSelectedPictures.data.map((picture: any, index: number) => (
                                <Carousel.Slide key={index}>
                                    <div className="h-full w-full flex items-center justify-center">
                                        <Image
                                            src={picture.jpg.large_image_url}
                                            radius="md"
                                            h="100%"
                                            w="100%"
                                            fit="contain"
                                        />
                                    </div>
                                </Carousel.Slide>
                            ))}
                        </Carousel>

                        {animeSelectedCharacters && Array.isArray(animeSelectedCharacters.data) &&
                            animeSelectedCharacters.data.some((character: any) => character.role === 'Main') && (
                                <>
                                    <Divider my="xl" label={<Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>Personagens Principais</Text>} labelPosition="center" />
                                    {Array.from({ length: Math.ceil(animeSelectedCharacters.data.filter((c: any) => c.role === 'Main').length / 2) }, (_, rowIndex) => {
                                        const mainCharacters = animeSelectedCharacters.data.filter((c: any) => c.role === 'Main');
                                        const rowCharacters = mainCharacters.slice(rowIndex * 2, rowIndex * 2 + 2);
                                        return (
                                            <Grid key={rowIndex} gutter="md" mb="md">
                                                {rowCharacters.map((character: any, colIndex: number) => (
                                                    <Grid.Col span={6} key={colIndex}>
                                                        <Group>
                                                            <Image src={character.character.images.jpg.image_url} radius="md" h={120} w={80} alt={character.character.name} />
                                                            <Text style={{ color: '#E8D4B7', fontWeight: 600 }}>{character.character.name}</Text>
                                                        </Group>
                                                    </Grid.Col>
                                                ))}
                                            </Grid>
                                        );
                                    })}
                                </>
                            )}

                        {animeSelectedCharacters && Array.isArray(animeSelectedCharacters.data) &&
                            animeSelectedCharacters.data.some((character: any) => character.role !== 'Main') && (
                                <>
                                    <Divider my="xl" label={<Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>Outros Personagens</Text>} labelPosition="center" />
                                    {Array.from({ length: Math.ceil(animeSelectedCharacters.data.filter((c: any) => c.role !== 'Main').length / 2) }, (_, rowIndex) => {
                                        const others = animeSelectedCharacters.data.filter((c: any) => c.role !== 'Main');
                                        const rowCharacters = others.slice(rowIndex * 2, rowIndex * 2 + 2);
                                        return (
                                            <Grid key={rowIndex} gutter="md" mb="md">
                                                {rowCharacters.map((character: any, colIndex: number) => (
                                                    <Grid.Col span={6} key={colIndex}>
                                                        <Group>
                                                            <Image src={character.character.images.jpg.image_url} radius="md" h={120} w={80} alt={character.character.name} />
                                                            <Text style={{ color: 'var(--colorTextWhite)', fontWeight: 600 }}>{character.character.name}</Text>
                                                        </Group>
                                                    </Grid.Col>
                                                ))}
                                            </Grid>
                                        );
                                    })}
                                </>
                            )}
                    </>
                )}
            />
		</>
	);
};

export default TopAnimesScreen;
