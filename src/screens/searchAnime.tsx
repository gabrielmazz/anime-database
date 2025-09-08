import React from 'react';
import { useState } from 'react';

// Importação dos componentes do mantine
import { TextInput } from '@mantine/core';
import { BackgroundImage } from '@mantine/core';
import { Image } from '@mantine/core';
import { Text } from '@mantine/core';
import { Drawer } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import Autoplay from 'embla-carousel-autoplay';

const SearchAnime: React.FC = () => {

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

    // API para buscar os animes com base no input do usuário
    const searchAnime = async () => {
        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${nameAnimerSearch}`);
        const data = await response.json();

        // Passa para a variável global
        setAnimeDatabase(data);
    };

    const searchAnimePictures = async (idAnime: number) => {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${idAnime}/pictures`);
        const data = await response.json();

        // Passa para a variável global
        setAnimeSelectedPictures(data);
        console.log(data);
    };

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
                        // Realiza a busca ao mudar o valor
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
                onClose={() => setOpenedCardInformation(false)}
                title="Informações do Anime"
                position="right"
                size="xl"
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
                                flex items-center justify-center
                            "
                        />
                        <Text size="xl">
                            {selectedAnime.title}
                        </Text>

                        <Carousel
                            slideSize="70%"
                            height={600}
                            withControls={false}
                            withIndicators={false}
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
                                        className="
                                           
                                        "
                                    />
                                </Carousel.Slide>
                            ))}
                        </Carousel>

                    </div>
                )}
            </Drawer>

        </div>

    );

};

export default SearchAnime;