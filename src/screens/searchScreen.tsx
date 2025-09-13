import React, { useEffect } from 'react';
import { useState } from 'react';

// Componentes principais, montagem da tela
import { Drawer } from '@mantine/core';
import DrawerModule from './../assets/inputInfos/Drawer.module.css';

import LoadingOverlayFullscreen from '../assets/components/overlay.tsx';
import Sidebar from '../assets/components/sidebar.tsx'
import LoaderBox from '../assets/components/loaderBox.tsx';
import AlertBox from '../assets/components/alert.tsx';
import InfoDrawer from '../assets/components/infoDrawer.tsx';

// Componente de carrossel
import { Carousel } from '@mantine/carousel';
import Autoplay from 'embla-carousel-autoplay';

// Componentes de layout
import { Grid } from '@mantine/core';
import { Container } from '@mantine/core';
import { Flex } from '@mantine/core';
import { Box } from '@mantine/core';
import { Group } from '@mantine/core';
import { Divider } from '@mantine/core';
import { Space } from '@mantine/core';
import { BackgroundImage } from '@mantine/core';
import { Image } from '@mantine/core';

// Componentes de texto
import { Text } from '@mantine/core';
import { Title } from '@mantine/core';

// Componentes de input
import { TextInput } from '@mantine/core';
import TextInputModule from './../assets/inputInfos/TextInput.module.css';

// Utilitários, funções gerais
import { getRandomWallpaper } from '../utils/wallpaper';
import { applyPaletteToCssVariables, extractPaletteFromImage } from '../utils/palette';

// Importação das API's
import { searchAnimeByName, getAnimePictures, getAnimeCharacters, type Anime, type AnimeApiSearchResponse } from '../assets/API/jikan';
import { translateText, translateTextDetailed } from '../assets/API/translate';



const SearchScreen: React.FC = () => {

    const [nameAnimerSearch, setNameAnimeSearch] = useState('');
    const [wallpaper, setWallpaper] = useState<string>(() => getRandomWallpaper());

    // Extrai paleta baseada no wallpaper e aplica nas CSS variables
    useEffect(() => {
        if (!wallpaper) return;
        extractPaletteFromImage(wallpaper)
            .then(applyPaletteToCssVariables)
            .catch(() => { /* silenciosamente ignora erros de leitura */ });
    }, [wallpaper]);

    // API Jikan para procurar anime pelo nome
    // https://api.jikan.moe/v4/anime?q={nome do anime}

    // Data Base que armazenará os animes retornados pela API
    const [animeDatabase, setAnimeDatabase] = useState<AnimeApiSearchResponse | null>(null);
    const [animeSelectedPictures, setAnimeSelectedPictures] = useState<any>(null);
    const [animeSelectedCharacters, setAnimeSelectedCharacters] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [revealCount, setRevealCount] = useState<number>(0);

    // API para buscar os animes com base no input do usuário
    const searchAnime = async () => {
        setIsLoading(true);
        try {
            const data = await searchAnimeByName(nameAnimerSearch);
            setAnimeDatabase(data);
        } finally {
            setIsLoading(false);
        }
    };

    // Efeito de "stagger reveal" para os cards quando a lista é atualizada
    useEffect(() => {
        if (!animeDatabase || !animeDatabase.data) return;
        setRevealCount(0);
        const total = animeDatabase.data.length;
        const stepMs = 70; // atraso entre itens
        const id = window.setInterval(() => {
            setRevealCount((prev) => {
                if (prev >= total) {
                    window.clearInterval(id);
                    return prev;
                }
                return prev + 1;
            });
        }, stepMs);
        return () => window.clearInterval(id);
    }, [animeDatabase]);

    // API para buscar as imagens do anime selecionado com base do ID do anime
    const searchAnimePictures = async (idAnime: number) => {
        const data = await getAnimePictures(idAnime);
        setAnimeSelectedPictures(data);
        console.log(data);
    };

    // API para buscar os personagens do anime selecionado com base do ID do anime
    const searchAnimeCharacters = async (idAnime: number) => {
        const data = await getAnimeCharacters(idAnime);
        setAnimeSelectedCharacters(data);
        console.log("Personagens do anime: ", data);
    }

    // Estados do Drawer para as informações do card do anime
    const [openedCardInformation, setOpenedCardInformation] = useState(false);

    // Estado para armazenar o anime selecionado
    const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
    const [translatedSynopsis, setTranslatedSynopsis] = useState<string | null>(null);
    const [translateStatus, setTranslateStatus] = useState<string | null>(null);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState<'info' | 'warning' | 'error' | 'success'>('info');

    // Traduz a sinopse automaticamente quando um anime é selecionado
    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!selectedAnime || !selectedAnime.synopsis) {
                setTranslatedSynopsis(null);
                return;
            }
            try {
                const { text, translated, provider } = await translateTextDetailed(selectedAnime.synopsis, 'en', 'pt-BR');
                if (!cancelled) {
                    setTranslatedSynopsis(text);
                    if (translated) {
                        setAlertType('success');
                        setAlertMessage('Sinopse traduzida com sucesso!');
                    } else {
                        setAlertType('warning');
                        setAlertMessage('Não foi possível traduzir. Mostrando o texto original.');
                    }
                    setAlertVisible(true);
                }
            } catch {
                if (!cancelled) {
                    setTranslatedSynopsis(selectedAnime.synopsis);
                    setAlertType('error');
                    setAlertMessage('Falha ao traduzir a sinopse.');
                    setAlertVisible(true);
                }
            }
        };
        run();
        return () => { cancelled = true; };
    }, [selectedAnime]);

    // Auto esconde o alerta após alguns segundos
    useEffect(() => {
        if (!alertVisible) return;
        const id = window.setTimeout(() => setAlertVisible(false), 2500);
        return () => window.clearTimeout(id);
    }, [alertVisible]);

    // Traduz o status do anime (ex: "Finished Airing", "Currently Airing", etc)
    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!selectedAnime || !selectedAnime.status) {
                setTranslateStatus(null);
                return;
            }
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

    return (

        // BackgroundImage fara a estilização por tras da tela, sempre
        // aleatorizando uma imagem do fundo conforme a função getRandomWallpaper
        <BackgroundImage
            src={wallpaper}
            className="relative text-white w-full min-h-screen bg-cover bg-no-repeat bg-center bg-fixed"
        >
            {/* Overlay escurecedor colocado por cima do BackgroundImage */}
            <div className="absolute inset-0 bg-black/60 pointer-events-none" />

            {/* Loading overlay durante chamadas à API */}
            <LoadingOverlayFullscreen visible={isLoading} message="Buscando animes..." />

            {/* Alerta flutuante */}
            <AlertBox visible={alertVisible} message={alertMessage} type={alertType} />

            {/* Sidebar fixa inspirada no design */}
            <Sidebar />

            <div
                // Div principal que abrigará toda a listagem de animes
                className="
                relative z-10
                w-full min-h-screen             
                max-w-7xl mx-auto
                align-top
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
                    style={{
                        fontSize: 42,
                        fontFamily: 'var(--text-font-mono)',
                    }}
                >
                    AniDex - Pesquise seu anime
                </Title>

                <Space h="md" />

                <Group
                    grow
                    className="
                        px-12
                    "
                >
                    <TextInput
                        value={nameAnimerSearch}
                        radius="lg"
                        placeholder="Digite o nome do anime"
                        size="md"
                        classNames={{
                            input: TextInputModule.inputTextInput
                        }}
                        onChange={(event) => {

                            // Limpa o animeDatabase para não mostrar resultados antigos
                            setAnimeDatabase(null);

                            // Atualiza o estado do input com o nome que será buscado
                            setNameAnimeSearch(event.currentTarget.value);

                        }}
                        onKeyDown={
                            (event) => {
                                if (event.key === 'Enter') {
                                    searchAnime();
                                }
                            }
                        }
                    />
                </Group>

                {/* Seção dos cards que mostrarão os animes voltados da
                    consulta na API */}
                <div className="
                    grid grid-cols-3 gap-4
                    mt-4
                "
                >
                    {
                        // Verifica se a dataBase não está nula, se não estiver
                        // percorre o array de animes mostrando eles em tela
                        animeDatabase && animeDatabase.data.map((anime: Anime, index: number) => (
                            <div
                                key={anime.mal_id}
                                className={`
                                    border-2 rounded-lg shadow-lg/30 overflow-hidden cursor-pointer
                                    transition-all duration-500 ease-out
                                    ${index < revealCount ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}
                                `}
                                style={{
                                    willChange: 'opacity, transform',
                                    borderColor: 'var(--color1)', // Usa a cor dinâmica da paleta
                                }}
                            >
                                <BackgroundImage
                                    src={anime.images.jpg.image_url}
                                    h={600}
                                    w="auto"
                                    radius="md"
                                    className="
                                        w-full h-full flex
                                        brightness-60
                                        hover:brightness-100
                                        transition duration-300
                                    "
                                    onClick={() => {
                                        setSelectedAnime(anime);
                                        searchAnimePictures(anime.mal_id);
                                        searchAnimeCharacters(anime.mal_id);
                                        setOpenedCardInformation(true);
                                    }}
                                >
                                    <Text
                                        size="xl"
                                        className="
                                            p-4                                     
                                            flex items-center justify-center
                                            h-full w-full
                                            text-center
                                            text-shadow-lg/60
                                            font-bold
                                            uppercase
                                            tracking-(--title-letter-spacing)
                                        "
                                        style={{ 
                                            fontFamily: 'var(--text-font-mono)',
                                            color: 'var(--colorTextWhite)'
                                        }}
                                    >
                                        {anime.title}
                                    </Text>
                                </BackgroundImage>
                            </div>
                        ))

                    }

                </div>

            </div>
    
            {/* Drawer genérico: conteúdo passado via prop `content` */}
            <InfoDrawer
                opened={openedCardInformation}
                onClose={() => {
                    setOpenedCardInformation(false);
                    setSelectedAnime(null);
                    setAnimeSelectedPictures(null);
                    setAnimeSelectedCharacters(null);
                }}
                title={
                    <Title
                        order={2}
                        className="
                            font-bold
                            text-shadow-lg/20
                            text-(--colorTextWhite)
                            uppercase
                            tracking-(--title-letter-spacing)
                        "
                        style={{ fontSize: 32, fontFamily: 'var(--text-font-mono)' }}
                    >
                        Informações do Anime
                    </Title>
                }
                position="right"
                size="35%"
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
                                src={selectedAnime.images.jpg.image_url}
                                radius="md"
                                h={600}
                                w="auto"
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
                            height={600}
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
                                    <Image src={picture.jpg.large_image_url} radius="md" h={600} w="auto" />
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



        </BackgroundImage>

    );

};

export default SearchScreen;
