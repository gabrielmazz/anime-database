import React from 'react';
import { useState } from 'react';

// Importação dos componentes do mantine
import { TextInput } from '@mantine/core';
import { BackgroundImage } from '@mantine/core';
import { Image } from '@mantine/core';

import { Text } from '@mantine/core';
import { Title } from '@mantine/core';


import { Drawer } from '@mantine/core';
import DrawerModule from './../assets/inputInfos/Drawer.module.css';

import { Carousel } from '@mantine/carousel';
import { Space } from '@mantine/core';
import { Divider } from '@mantine/core';
import { Grid } from '@mantine/core';
import { Group } from '@mantine/core';


import Autoplay from 'embla-carousel-autoplay';

// Importação das API's


const SearchScreen: React.FC = () => {

    const [nameAnimerSearch, setNameAnimeSearch] = useState('');

    // API Jikan para procurar anime pelo nome
    // https://api.jikan.moe/v4/anime?q={nome do anime}

    // Define um tipo para o anime retornado pela API, ficando mais simples
    // para manipular os dados depois
    type Anime = {
        mal_id: number;             // MyAnimeList ID  
        title: string;              // Título do anime
        synopsis: string;           // Sinopse do anime
        episodes: number;           // Número de episódios
        status: string;             // Status do anime
        score: number;              // Nota do anime
        images: {
            jpg: {
                image_url: string;  // URL da imagem do anime
            };
        };
    };

    // Define a struct em formato de lista para abrigar os animes retornados
    type AnimeApiResponse = {
        data: Anime[];
    };

    // Data Base que armazenará os animes retornados pela API
    const [animeDatabase, setAnimeDatabase] = useState<AnimeApiResponse | null>(null);
    const [animeSelectedPictures, setAnimeSelectedPictures] = useState<any>(null);
    const [animeSelectedCharacters, setAnimeSelectedCharacters] = useState<any>(null);

    // API para buscar os animes com base no input do usuário
    const searchAnime = async () => {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${nameAnimerSearch}`);
        const data = await response.json();

        // Passa para a variável global
        setAnimeDatabase(data);
    };

    // API para buscar as imagens do anime selecionado com base do ID do anime
    const searchAnimePictures = async (idAnime: number) => {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${idAnime}/pictures`);
        const data = await response.json();

        // Passa para a variável global
        setAnimeSelectedPictures(data);
        console.log(data);
    };

    // API para buscar os personagens do anime selecionado com base do ID do anime
    const searchAnimeCharacters = async (idAnime: number) => {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${idAnime}/characters`);
        const data = await response.json();

        // Passa para a variável global
        setAnimeSelectedCharacters(data);
        console.log("Personagens do anime: ", data);
    }

    // Estados do Drawer para as informações do card do anime
    const [openedCardInformation, setOpenedCardInformation] = useState(false);

    // Estado para armazenar o anime selecionado
    const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);

    return (

        <div className="
            bg-black text-white
        ">

            <div
                className="
                w-screen h-screen
                max-w-7xl mx-auto
                align-top
                border-2 border-red-500
            "
            >
                <h1 className="
                text-4xl
                flex justify-center
                "
                >
                    Procurar Anime
                </h1>

                <TextInput
                    value={nameAnimerSearch}
                    placeholder="Nome do anime"
                    onChange={

                        (event) => setNameAnimeSearch(event.currentTarget.value)

                    }
                    onKeyDown={
                        (event) => {
                            if (event.key === 'Enter') {
                                searchAnime();
                            }
                        }
                    }
                />

                {/* Seção dos cards que mostraram os animes voltados da
                    consulta na API */}
                <div className="
                    grid grid-cols-3 gap-4
                    mt-4
                "
                >

                    {
                        // Verifica se a dataBase não está nula, se não estiver
                        // percorre o array de animes mostrando eles em tela
                        animeDatabase && animeDatabase.data.map((anime: Anime) => (
                            <div
                                key={anime.mal_id}
                                className="
                                    border-2 border-white rounded-lg
                                "
                            >
                                <BackgroundImage
                                    src={anime.images.jpg.image_url}
                                    h={600}
                                    w="auto"
                                    className="
                                        w-full h-full flex
                                        brightness-60
                                        hover:brightness-100
                                        transition duration-300
                                    "
                                    onClick={() => {

                                        // Ao clicar no card, será aberto o Drawer do anime aonde será indicado
                                        // todas as informações do anime
                                        setSelectedAnime(anime);

                                        // Antes de abrir o drawer, busca as imagens do anime
                                        searchAnimePictures(anime.mal_id);

                                        // Busca os personagens do anime
                                        searchAnimeCharacters(anime.mal_id);

                                        // Abre o drawer
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
                                        "
                                    >
                                        {anime.title}
                                    </Text>
                                </BackgroundImage>
                            </div>
                        ))
                    }


                </div>

            </div>

            {/* Componentes Drawer's que serão rederizados */}
            <Drawer
                opened={openedCardInformation}
                onClose={
                    () => {
                        setOpenedCardInformation(false);
                        setSelectedAnime(null);
                        setAnimeSelectedPictures(null);
                        setAnimeSelectedCharacters(null);
                    }
                }
                title={
                    <Title
                        order={2}
                        className="
                            font-bold
                            text-shadow-lg/20
                            text-[#E8D4B7]
                        "
                        style={{ fontSize: 32 }}
                    >
                        Informações do Anime - {selectedAnime?.title}
                    </Title>
                }
                position="right"
                size="35%"
                classNames={{
                    header: DrawerModule.headerDrawer,
                    title: DrawerModule.titleDrawer,
                    body: DrawerModule.bodyDrawer,
                }}
            >
                {selectedAnime && (
                    <div>
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
                        <Title
                            size="xl"
                            className="
                                font-bold text-center
                                text-shadow-lg/20
                            "
                            style={{
                                fontSize: 42,
                                color: '#E8D4B7'
                            }}
                        >
                            {selectedAnime.title}
                        </Title>

                        <Text
                            mt="md"
                            className="
                                text-justify
                            "
                            style={{
                                fontSize: 16,
                                color: '#E8D4B7'
                            }}
                        >
                            <strong>Sinopse:</strong> {selectedAnime.synopsis}
                        </Text>

                        <Space h="xs" />

                        <Text
                            mt="md"
                            style={{
                                fontSize: 16,
                                color: '#E8D4B7'
                            }}
                        >
                            <strong>Número de episódios:</strong> {selectedAnime.episodes}
                        </Text>

                        <Space h="xs" />

                        <Text
                            mt="md"
                            style={{
                                fontSize: 16,
                                color: '#E8D4B7'
                            }}
                        >
                            <strong>Status:</strong> {selectedAnime.status}
                        </Text>

                        <Space h="xs" />

                        <Text
                            mt="md"
                            style={{
                                fontSize: 16,
                                color: '#E8D4B7'
                            }}
                        >
                            <strong>Nota:</strong> {selectedAnime.score}
                        </Text>

                        <Divider
                            my="xl"
                            label={
                                <Text
                                    style={{
                                        fontSize: 16,
                                        color: '#E8D4B7'
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
                            plugins={[
                                Autoplay({ delay: 2500 }),
                            ]}
                        >
                            {animeSelectedPictures && animeSelectedPictures.data.map((picture: any, index: number) => (
                                <Carousel.Slide key={index}>
                                    <Image
                                        src={picture.jpg.large_image_url}
                                        radius="md"
                                        h={600}
                                        w="auto"
                                    />
                                </Carousel.Slide>
                            ))}
                        </Carousel>

                        <Divider
                            my="xl"
                            label={
                                <Text
                                    style={{
                                        fontSize: 16,
                                        color: '#E8D4B7'
                                    }}
                                >
                                    Personagens Principais
                                </Text>
                            }
                            labelPosition="center"
                        />

                        {animeSelectedCharacters && (
                            <>
                                {Array.from(
                                    { length: Math.ceil(animeSelectedCharacters.data.filter((character: any) => character.role === "Main").length / 2) },
                                    (_, rowIndex) => {
                                        const mainCharacters = animeSelectedCharacters.data.filter((character: any) => character.role === "Main");
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

                        <Divider
                            my="xl"
                            label={
                                <Text
                                    style={{
                                        fontSize: 16,
                                        color: '#E8D4B7'
                                    }}
                                >
                                    Outros Personagens
                                </Text>
                            }
                            labelPosition="center"
                        />

                        {/* Mostra outros personagens aleatórios do anime, sempre sendo uma leva diferente
                            mostrando 10 personagens do anime */}
                        {animeSelectedCharacters && (
                            <>
                                {Array.from(
                                    { length: Math.ceil(animeSelectedCharacters.data.filter((character: any) => character.role !== "Main").length / 2) },
                                    (_, rowIndex) => {
                                        const otherCharacters = animeSelectedCharacters.data.filter((character: any) => character.role !== "Main");
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

                    </div>
                )}
            </Drawer>

        </div>

    );

};

export default SearchScreen;