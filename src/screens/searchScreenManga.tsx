import React, { useEffect, useState } from 'react';

// UI base (Mantine)
import {
  BackgroundImage,
  Box,
  Divider,
  Grid,
  Group,
  Image,
  Space,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { useMediaQuery } from '@mantine/hooks';
import Autoplay from 'embla-carousel-autoplay';

// Componentes compartilhados
import Sidebar from '../assets/components/sidebar.tsx';
import LoadingOverlayFullscreen from '../assets/components/overlay.tsx';
import LoaderBox from '../assets/components/loaderBox.tsx';
import AlertBox from '../assets/components/alert.tsx';
import InfoDrawer from '../assets/components/infoDrawer.tsx';

// CSS Modules
import DrawerModule from './../assets/inputInfos/Drawer.module.css';
import TextInputModule from './../assets/inputInfos/TextInput.module.css';

// Utilitários / estado global
import { getRandomWallpaper } from '../utils/wallpaper';
import { applyPaletteToCssVariables, extractPaletteFromImage } from '../utils/palette';
import { useSettings } from '../state/settings';

// API Jikan (mangá)
import {
  searchMangaByName,
  getMangaPictures,
  getMangaCharacters,
  type Manga,
  type MangaApiSearchResponse,
} from '../assets/API/jikan';
import { translateText, translateTextDetailed } from '../assets/API/translate';

const SearchScreenManga: React.FC = () => {
	const [query, setQuery] = useState('');
	const { apiModalEnabled, setLastApiPayload, setLastSearchPayload, setLastPicturesPayload, setLastCharactersPayload } = useSettings();

	const [wallpaper, _setWallpaper] = useState<string>(() => getRandomWallpaper('manga'));

	useEffect(() => {
		if (!wallpaper) return;
		extractPaletteFromImage(wallpaper)
			.then(applyPaletteToCssVariables)
			.catch(() => { });
	}, [wallpaper]);

	// Base de dados
	const [mangaDatabase, setMangaDatabase] = useState<MangaApiSearchResponse | null>(null);
	const [mangaSelectedPictures, setMangaSelectedPictures] = useState<any>(null);
	const [mangaSelectedCharacters, setMangaSelectedCharacters] = useState<any>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [revealCount, setRevealCount] = useState<number>(0);

    const searchManga = async () => {
        setIsLoading(true);
        try {
            const data = await searchMangaByName(query);
            setMangaDatabase(data);

            const count = Array.isArray(data?.data) ? data.data.length : 0;
            if (count === 0) {
                setAlertType('warning');
                setAlertMessage('Nenhum mangá encontrado para a busca.');
                setAlertVisible(true);
            } else {
                setAlertType('success');
                setAlertMessage(`Foram encontrados ${count} mangás para a busca "${query}".`);
                setAlertVisible(true);
            }

            if (apiModalEnabled) {
                const payload = { endpoint: 'searchMangaByName', query, response: data };
                setLastApiPayload?.(payload);
                setLastSearchPayload?.(payload);
            }
        } catch {
            setAlertType('error');
            setAlertMessage('Falha ao buscar mangás. Verifique sua conexão.');
            setAlertVisible(true);
        } finally {
            setIsLoading(false);
        }
    };

	useEffect(() => {
		if (!mangaDatabase || !mangaDatabase.data) return;
		setRevealCount(0);
		const total = mangaDatabase.data.length;
		const stepMs = 70;
		const id = window.setInterval(() => {
			setRevealCount((prev) => {
				if (prev >= total) { window.clearInterval(id); return prev; }
				return prev + 1;
			});
		}, stepMs);
		return () => window.clearInterval(id);
	}, [mangaDatabase]);

	const searchMangaPictures = async (id: number) => {
		const data = await getMangaPictures(id);
		setMangaSelectedPictures(data);
		if (apiModalEnabled) {
			const payload = { endpoint: 'getMangaPictures', id, response: data };
			setLastApiPayload?.(payload);
			setLastPicturesPayload?.(payload);
		}
	};

	const searchMangaCharacters = async (id: number) => {
		const data = await getMangaCharacters(id);
		setMangaSelectedCharacters(data);
		if (apiModalEnabled) {
			const payload = { endpoint: 'getMangaCharacters', id, response: data };
			setLastApiPayload?.(payload);
			setLastCharactersPayload?.(payload);
		}
	};

	const [openedCardInformation, setOpenedCardInformation] = useState(false);
	const [selectedManga, setSelectedManga] = useState<Manga | null>(null);
	const [translatedSynopsis, setTranslatedSynopsis] = useState<string | null>(null);
	const [translateStatus, setTranslateStatus] = useState<string | null>(null);
	const [alertVisible, setAlertVisible] = useState(false);
	const [alertMessage, setAlertMessage] = useState("");
	const [alertType, setAlertType] = useState<'info' | 'warning' | 'error' | 'success'>('info');

	// Breakpoints para responsividade semelhante à tela de animes
	const isSmDown = useMediaQuery('(max-width: 640px)');
	const isLgDown = useMediaQuery('(max-width: 1024px)');
	const drawerSize = isLgDown ? '100%' : '35%';
	const coverHeight = isSmDown ? 360 : isLgDown ? 480 : 600;
	const carouselHeight = isSmDown ? 320 : isLgDown ? 420 : 600;

	useEffect(() => {
		let cancelled = false;
		const run = async () => {
			if (!selectedManga || !selectedManga.synopsis) { setTranslatedSynopsis(null); return; }
			try {
				const { text, translated } = await translateTextDetailed(selectedManga.synopsis, 'en', 'pt-BR');
				if (!cancelled) {
					setTranslatedSynopsis(text);
					setAlertType(translated ? 'success' : 'warning');
					setAlertMessage(translated ? 'Sinopse traduzida com sucesso!' : 'Não foi possível traduzir. Mostrando o texto original.');
					setAlertVisible(true);
				}
			} catch {
				if (!cancelled) { setTranslatedSynopsis(selectedManga.synopsis); setAlertType('error'); setAlertMessage('Falha ao traduzir a sinopse.'); setAlertVisible(true); }
			}
		};
		run();
		return () => { cancelled = true; };
	}, [selectedManga]);

	useEffect(() => {
		if (!alertVisible) return;
		const id = window.setTimeout(() => setAlertVisible(false), 2500);
		return () => window.clearTimeout(id);
	}, [alertVisible]);

	useEffect(() => {
		let cancelled = false;
		const run = async () => {
			if (!selectedManga || !selectedManga.status) { setTranslateStatus(null); return; }
			try {
				const t = await translateText(selectedManga.status, 'en', 'pt-BR');
				if (!cancelled) setTranslateStatus(t);
			} catch {
				if (!cancelled) setTranslateStatus(selectedManga.status);
			}
		};
		run();
		return () => { cancelled = true; };
	}, [selectedManga]);

	return (
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
			<div className="absolute inset-0 bg-black/60 pointer-events-none" />
			<LoadingOverlayFullscreen visible={isLoading} message="Buscando mangás..." />
			<AlertBox visible={alertVisible} message={alertMessage} type={alertType} />
			<Sidebar />

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
					Pesquise seu mangá
				</Title>

				<Space h={33} />

				<Group grow>
					<TextInput
						value={query}
						size="md"
						label="Buscar mangá"
						description="Digite o nome do mangá para buscar"
						placeholder="Ex.: Berserk, Vagabond, OP..."
						classNames={{
							input: TextInputModule.inputTextInput,
							label: TextInputModule.labelTextInput,
							description: TextInputModule.descriptionTextInput,
						}}
						className="mt-4 w-full max-w-2xl mx-auto"
						onChange={(e) => { setMangaDatabase(null); setQuery(e.currentTarget.value); }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                const v = (e.currentTarget.value || '').trim();
                                setQuery(v);
                                e.currentTarget.blur();
                                if (!v) {
                                    setAlertType('warning');
                                    setAlertMessage('Digite um nome para buscar.');
                                    setAlertVisible(true);
                                    return;
                                }
                                searchManga();
                            }
                        }}
						onBlur={(e) => {
							const v = (e.currentTarget.value || '').trim();
							if (v !== query) setQuery(v);
						}}
						onFocus={(e) => e.target.select()}
					/>
				</Group>

				<div className="grid mt-4 gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
					{mangaDatabase && mangaDatabase.data.map((manga: Manga, index: number) => (
						<div
							key={manga.mal_id}
							className={`border-2 rounded-lg shadow-lg/30 overflow-hidden cursor-pointer transition-all duration-500 ease-out ${index < revealCount ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
							style={{ willChange: 'opacity, transform', borderColor: 'var(--color1)' }}
						>
							<BackgroundImage
								src={manga.images.jpg.image_url}
								w="auto"
								radius="md"
								className="w-full flex h-56 sm:h-64 md:h-72 lg:h-96 xl:h-[28rem] brightness-60 hover:brightness-100 transition duration-300"
								onClick={() => { setSelectedManga(manga); searchMangaPictures(manga.mal_id); searchMangaCharacters(manga.mal_id); setOpenedCardInformation(true); }}
							>
								<Text
									size="xl"
									className="p-4 flex items-center justify-center h-full w-full text-center text-shadow-lg/60 font-bold uppercase tracking-(--title-letter-spacing) text-base sm:text-lg lg:text-xl"
									style={{ fontFamily: 'var(--text-font-mono)', color: 'var(--colorTextWhite)' }}
								>
									{manga.title}
								</Text>
							</BackgroundImage>
						</div>
					))}
				</div>
			</div>

			<InfoDrawer
				opened={openedCardInformation}
				onClose={() => { setOpenedCardInformation(false); setSelectedManga(null); setMangaSelectedPictures(null); setMangaSelectedCharacters(null); }}
				title={
					<Title
						order={2}
						className="font-bold text-shadow-lg/20 text-(--colorTextWhite) uppercase tracking-(--title-letter-spacing)"
						style={{ fontSize: 32, fontFamily: 'var(--text-font-mono)' }}
					>
						Informações do Mangá
					</Title>
				}
				position="right"
				size={drawerSize}
				overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
				classNames={{ root: DrawerModule.rootDrawer, header: DrawerModule.headerDrawer, body: DrawerModule.bodyDrawer }}
				content={selectedManga && (
					<>
						<Box>
							<Image src={selectedManga.images.jpg.image_url} radius="md" h={coverHeight} w="auto" className="mb-4 flex items-center justify-center justify-self-center shadow-lg/40" />

							<Space h="md" />

							<Title size="xl" className="font-bold text-center text-shadow-lg/20 text-(--colorTextWhite) uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 32, fontFamily: 'var(--text-font-mono)' }}>
								{selectedManga.title}
							</Title>

							<Space h="md" />

							<Box>
								<Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>
									Sinopse:
								</Text>
								{translatedSynopsis === null && selectedManga?.synopsis ? (
									<LoaderBox message="Traduzindo sinopse..." />
								) : (
									<Text component="span" style={{ color: 'var(--colorTextWhite)' }}>
										{translatedSynopsis ?? selectedManga?.synopsis}
									</Text>
								)}
							</Box>
						</Box>

						<Space h="lg" />

						<Box>
							<Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>
								Número de Capítulos:
							</Text>
							<Text component="span" style={{ color: 'var(--colorTextWhite)' }}>
								{selectedManga.chapters ?? 'N/A'}
							</Text>
						</Box>

						<Space h="lg" />

						<Box>
							<Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>
								Status do Mangá:
							</Text>
							{translateStatus === null && selectedManga?.status ? (
								<LoaderBox message="Traduzindo status..." />
							) : (
								<Text component="span" style={{ color: 'var(--colorTextWhite)' }}>
									{translateStatus ?? selectedManga?.status}
								</Text>
							)}
						</Box>

						<Space h="lg" />

						<Box>
							<Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>
								Nota do Mangá:
							</Text>
							<Text component="span" style={{ color: 'var(--colorTextWhite)' }}>
								{selectedManga.score ?? 'N/A'}
							</Text>
						</Box>

						<Divider my="xl" label={
							<Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>
								Imagens do Mangá
							</Text>
						} labelPosition="center" />

						<Carousel slideSize="70%" height={carouselHeight} withControls={false} withIndicators={false} slideGap="xs" emblaOptions={{ loop: true, dragFree: true, align: 'center', slidesToScroll: 1 }} plugins={[Autoplay({ delay: 2500 })]}>
							{mangaSelectedPictures && mangaSelectedPictures.data.map((picture: any, index: number) => (
								<Carousel.Slide key={index}>
									<Image src={picture.jpg.large_image_url} radius="md" h={carouselHeight} w="auto" />
								</Carousel.Slide>
							))}
						</Carousel>

            {mangaSelectedCharacters && Array.isArray(mangaSelectedCharacters.data) &&
              mangaSelectedCharacters.data.some((character: any) => character.role === 'Main') && (
              <>
                <Divider my="xl" label={
                  <Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>
                    Personagens Principais
                  </Text>
                } labelPosition="center" />

                {Array.from({ length: Math.ceil(mangaSelectedCharacters.data.filter((c: any) => c.role === 'Main').length / 2) }, (_, rowIndex) => {
                  const mainCharacters = mangaSelectedCharacters.data.filter((c: any) => c.role === 'Main');
                  const rowCharacters = mainCharacters.slice(rowIndex * 2, rowIndex * 2 + 2);
                  return (
                    <Grid key={rowIndex} gutter="md" mb="md">
                      {rowCharacters.map((character: any, colIndex: number) => (
                        <Grid.Col span={6} key={colIndex}>
                          <Group>
                            <Image src={character.character.images.jpg.image_url} radius="md" h={120} w={80} alt={character.character.name} />
                            <Text style={{ color: '#E8D4B7', fontWeight: 600 }}>
                              {character.character.name}
                            </Text>
                          </Group>
                        </Grid.Col>
                      ))}
                    </Grid>
                  );
                })}
              </>
            )}

						{mangaSelectedCharacters && Array.isArray(mangaSelectedCharacters.data) &&
							mangaSelectedCharacters.data.some((character: any) => character.role !== 'Main') && (
								<>
									<Divider my="xl" label={
										<Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>
											Outros Personagens
										</Text>
									} labelPosition="center" />
									{Array.from({ length: Math.ceil(mangaSelectedCharacters.data.filter((c: any) => c.role !== 'Main').length / 2) }, (_, rowIndex) => {
										const otherCharacters = mangaSelectedCharacters.data.filter((c: any) => c.role !== 'Main');
										const rowCharacters = otherCharacters.slice(rowIndex * 2, rowIndex * 2 + 2);
										return (
											<Grid key={rowIndex} gutter="md" mb="md">
												{rowCharacters.map((character: any, colIndex: number) => (
													<Grid.Col span={6} key={colIndex}>
														<Group>
															<Image src={character.character.images.jpg.image_url} radius="md" h={120} w={80} alt={character.character.name} />
															<Text style={{ color: 'var(--colorTextWhite)', fontWeight: 600 }}>
																{character.character.name}
															</Text>
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
		</BackgroundImage>
	);
};

export default SearchScreenManga;
