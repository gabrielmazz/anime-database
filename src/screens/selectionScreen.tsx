import React, { useEffect, useState } from "react";

// Importação dos assets da tela
import imgCard01 from '../assets/images/imgSelectionScreen/imgCard01.jpg';
import imgCard02 from '../assets/images/imgSelectionScreen/imgCard02.png';
import imgCard03 from '../assets/images/imgSelectionScreen/imgCard03.jpg';
import imgCard04 from '../assets/images/imgSelectionScreen/imgCard04.jpg';
import imgCard05 from '../assets/images/imgSelectionScreen/imgCard05.jpg';
import imgCard06 from '../assets/images/imgSelectionScreen/imgCard06.jpg';
import imgCard07 from '../assets/images/imgSelectionScreen/imgCard07.jpg';
import imgCard08 from '../assets/images/imgSelectionScreen/imgCard08.jpg';
import imgCard09 from '../assets/images/imgSelectionScreen/imgCard09.png';

// Importação dos componentes do mantine
import { BackgroundImage, Container, Space, Title, Text, Box, Pagination } from '@mantine/core';
import PaginationModule from '../assets/inputInfos/Pagination.module.css';
import { useNavigate } from 'react-router-dom';

// import { ScrollArea } from '@mantine/core';

// Sidebar e utilitários de tema
import Sidebar from '../assets/components/sidebar.tsx';
import { getRandomWallpaper } from '../utils/wallpaper';
import { applyPaletteToCssVariables, extractPaletteFromImage } from '../utils/palette';

const SelectionScreen: React.FC = () => {
	const [wallpaper, _setWallpaper] = useState<string>(() => getRandomWallpaper('selection'));
    const [page, setPage] = useState<number>(1);
    const [renderedPage, setRenderedPage] = useState<number>(1);
    const [fadeState, setFadeState] = useState<'idle' | 'out' | 'in'>('idle');
	const navigate = useNavigate();

	// Extrai paleta baseada no wallpaper e aplica nas CSS variables (mesmo padrão das outras telas)
    useEffect(() => {
        if (!wallpaper) return;
        extractPaletteFromImage(wallpaper)
            .then(applyPaletteToCssVariables)
            .catch(() => { /* ignora silenciosamente */ });
    }, [wallpaper]);

    // Anima transição entre páginas (fade out -> troca conteúdo -> fade in)
    useEffect(() => {
        if (page === renderedPage) return;
        setFadeState('out');
        const outT = window.setTimeout(() => {
            setRenderedPage(page);
            setFadeState('in');
            const inT = window.setTimeout(() => setFadeState('idle'), 260);
            return () => window.clearTimeout(inT);
        }, 220);
        return () => window.clearTimeout(outT);
    }, [page, renderedPage]);

	const placeholderCards = Array.from({ length: 3 }, (_, idx) => (
		<Box
			key={`placeholder-${idx}`}
			className="
				border-2 rounded-lg shadow-lg/30 overflow-hidden
				transition-all duration-300 ease-out
				min-h-[220px] md:min-h-[240px]
				flex items-center justify-center
			"
			style={{ borderColor: 'var(--color1)' }}
		>
			<div className="
				w-full h-full flex items-center justify-center
				bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]
				text-center text-shadow-lg/60 font-bold uppercase
				tracking-(--title-letter-spacing)
			">
				<Text
					style={{ fontFamily: 'var(--text-font-mono)', color: 'var(--colorTextWhite)', fontSize: 24 }}
				>
					Novas opções em breve
				</Text>
			</div>
		</Box>
	));

	const firstPageCards = (
		<>
			{/* Card 1: Buscar Anime */}
			<Box
				className="
					border-2 rounded-lg shadow-lg/30 overflow-hidden cursor-pointer
					transition-all duration-300 ease-out
					hover:scale-[1.01]
					min-h-[220px] md:min-h-[240px]
				"
				style={{ borderColor: 'var(--color1)' }}
				onClick={() => navigate('/searchScreen')}
			>
				<BackgroundImage
					src={imgCard01}
					className="
						w-full h-full flex items-center justify-center
						brightness-60 hover:brightness-100 transition duration-300
					"
				>
					<Text
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
							color: 'var(--colorTextWhite)',
							fontSize: 28
						}}
					>
						Procurar Anime
					</Text>
				</BackgroundImage>
			</Box>

			{/* Card 2: Buscar Mangá */}
			<Box
				className="
					border-2 rounded-lg shadow-lg/30 overflow-hidden cursor-pointer
					transition-all duration-300 ease-out
					hover:scale-[1.01]
					min-h-[220px] md:min-h-[240px]
				"
				style={{ borderColor: 'var(--color1)' }}
				onClick={() => navigate('/searchScreenManga')}
			>
				<BackgroundImage
					src={imgCard03}
					className="
						w-full h-full flex items-center justify-center
						brightness-60 hover:brightness-100 transition duration-300
						cursor-pointer
					"
				>
					<Text
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
							color: 'var(--colorTextWhite)',
							fontSize: 28
						}}
					>
						Procurar Mangá
					</Text>
				</BackgroundImage>
			</Box>

			{/* Card 3: Buscar Personagem (placeholder) */}
			<Box
				className="
					border-2 rounded-lg shadow-lg/30 overflow-hidden
					transition-all duration-300 ease-out
					hover:scale-[1.01]
					min-h-[220px] md:min-h-[240px]
				"
				style={{ borderColor: 'var(--color1)' }}
				onClick={() => navigate('/searchScreenCharacters')}
			>
				<BackgroundImage
					src={imgCard02}
					className="
						w-full h-full flex items-center justify-center
						brightness-60 hover:brightness-100 transition duration-300
						cursor-default
					"
				>
					<Text
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
							color: 'var(--colorTextWhite)',
							fontSize: 28
						}}
					>
						Procurar Personagem
					</Text>
				</BackgroundImage>
			</Box>

			{/* Card 4: Buscar Produtores (placeholder) */}
			<Box
				className="
					border-2 rounded-lg shadow-lg/30 overflow-hidden
					transition-all duration-300 ease-out
					hover:scale-[1.01]
					min-h-[220px] md:min-h-[240px]
				"
				style={{ borderColor: 'var(--color1)' }}
				onClick={() => navigate('/searchScreenProducers')}
			>
				<BackgroundImage
					src={imgCard04}
					className="
						w-full h-full flex items-center justify-center
						brightness-60 hover:brightness-100 transition duration-300
						cursor-default
					"
				>
					<Text
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
							color: 'var(--colorTextWhite)',
							fontSize: 28
						}}
					>
						Procurar Produtores
					</Text>
				</BackgroundImage>
			</Box>

			{/* Card 5: Explorar Temporadas */}
			<Box
				className="
					border-2 rounded-lg shadow-lg/30 overflow-hidden cursor-pointer
					transition-all duration-300 ease-out
					hover:scale-[1.01]
					min-h-[220px] md:min-h-[240px]
				"
				style={{ borderColor: 'var(--color1)' }}
				onClick={() => navigate('/seasonScreen')}
			>
				<BackgroundImage
					src={imgCard05}
					className="
						w-full h-full flex items-center justify-center
						brightness-60 hover:brightness-100 transition duration-300
					"
				>
					<Text
						className="
							p-4 flex items-center justify-center h-full w-full text-center
							text-shadow-lg/60 font-bold uppercase tracking-(--title-letter-spacing)
						"
						style={{
							fontFamily: 'var(--text-font-mono)',
							color: 'var(--colorTextWhite)',
							fontSize: 28,
						}}
					>
						Explorar Temporadas
					</Text>
				</BackgroundImage>
			</Box>

			{/* Card 6: Top Animes */}
			<Box
				className="
					border-2 rounded-lg shadow-lg/30 overflow-hidden cursor-pointer
					transition-all duration-300 ease-out
					hover:scale-[1.01]
					min-h-[220px] md:min-h-[240px]
				"
				style={{ borderColor: 'var(--color1)' }}
				onClick={() => navigate('/topAnimesScreen')}
			>
				<BackgroundImage
					src={imgCard06}
					className="
						w-full h-full flex items-center justify-center
						brightness-60 hover:brightness-100 transition duration-300
					"
				>
					<Text
						className="
							p-4 flex items-center justify-center h-full w-full text-center
							text-shadow-lg/60 font-bold uppercase tracking-(--title-letter-spacing)
						"
						style={{
							fontFamily: 'var(--text-font-mono)',
							color: 'var(--colorTextWhite)',
							fontSize: 28,
						}}
					>
						Top Animes
					</Text>
				</BackgroundImage>
			</Box>
		</>
	);

	const secondPageCards = (
		<>
			{/* Card 7: Random Anime */}
			<Box
				className="
					border-2 rounded-lg shadow-lg/30 overflow-hidden cursor-pointer
					transition-all duration-300 ease-out
					hover:scale-[1.01]
					min-h-[220px] md:min-h-[240px]
				"
				style={{ borderColor: 'var(--color1)' }}
				onClick={() => navigate('/randomAnimeScreen')}
			>
				<BackgroundImage
					src={imgCard07}
					className="
						w-full h-full flex items-center justify-center
						brightness-60 hover:brightness-100 transition duration-300
					"
				>
					<Text
						className="p-4 flex items-center justify-center h-full w-full text-center text-shadow-lg/60 font-bold uppercase tracking-(--title-letter-spacing)"
						style={{ fontFamily: 'var(--text-font-mono)', color: 'var(--colorTextWhite)', fontSize: 28 }}
					>
						Sortear Anime
					</Text>
				</BackgroundImage>
			</Box>

			{/* Card 8: Random Manga */}
			<Box
				className="
					border-2 rounded-lg shadow-lg/30 overflow-hidden cursor-pointer
					transition-all duration-300 ease-out
					hover:scale-[1.01]
					min-h-[220px] md:min-h-[240px]
				"
				style={{ borderColor: 'var(--color1)' }}
				onClick={() => navigate('/randomMangaScreen')}
			>
				<BackgroundImage
					src={imgCard08}
					className="
						w-full h-full flex items-center justify-center
						brightness-60 hover:brightness-100 transition duration-300
					"
				>
					<Text
						className="p-4 flex items-center justify-center h-full w-full text-center text-shadow-lg/60 font-bold uppercase tracking-(--title-letter-spacing)"
						style={{ fontFamily: 'var(--text-font-mono)', color: 'var(--colorTextWhite)', fontSize: 28 }}
					>
						Sortear Mangá
					</Text>
				</BackgroundImage>
			</Box>

			{/* Card 9: Buscar Pessoas */}
			<Box
				className="
					border-2 rounded-lg shadow-lg/30 overflow-hidden cursor-pointer
					transition-all duration-300 ease-out
					hover:scale-[1.01]
					min-h-[220px] md:min-h-[240px]
				"
				style={{ borderColor: 'var(--color1)' }}
				onClick={() => navigate('/searchScreenPeople')}
			>
				<BackgroundImage
					src={imgCard09}
					className="
						w-full h-full flex items-center justify-center
						brightness-60 hover:brightness-100 transition duration-300
					"
				>
					<Text
						className="p-4 flex items-center justify-center h-full w-full text-center text-shadow-lg/60 font-bold uppercase tracking-(--title-letter-spacing)"
						style={{ fontFamily: 'var(--text-font-mono)', color: 'var(--colorTextWhite)', fontSize: 28 }}
					>
						Buscar Pessoas
					</Text>
				</BackgroundImage>
			</Box>

			{/* Demais placeholders (4) */}
			{placeholderCards}
		</>
	);

	return (
		<BackgroundImage
			src={wallpaper}
			className="
				relative
				w-full
				min-h-screen
				bg-cover bg-no-repeat bg-center bg-fixed
			"
		>
			{/* Overlay escuro por cima do wallpaper */}
			<div className="absolute inset-0 bg-black/60 pointer-events-none" />

			{/* Sidebar fixa lateral, mantendo consistência visual */}
			<Sidebar />

			{/* Container principal */}
			<div
				className="
					relative z-10
					w-full min-h-screen
					max-w-[92vw] 2xl:max-w-[1900px]
					mx-auto
					px-4 sm:px-6 lg:px-12
				"
			>
				<Title
					className="
                        pt-6
                        text-shadow-lg/20 text-(--color1)
                        uppercase tracking-(--title-letter-spacing)
                        text-[clamp(24px,4vw,42px)]
                        text-center
                    "
					style={{ fontFamily: 'var(--text-font-mono)' }}
				>
					Menu de opções
				</Title>

				<Space h="md" />

				<Container
					fluid
					className="
                        bg-black/40 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg
                        w-full max-w-none mx-auto
                        p-4 sm:p-6 md:p-8
                        mt-6 sm:mt-10 lg:mt-12 mb-16 sm:mb-20 lg:mb-0
                        h-auto lg:h-[80vh]
                        overflow-visible lg:overflow-y-auto
                    "
				>
						<Box
							className="
								relative lg:h-full
								pt-2 pb-2 pr-2 pl-2 lg:pb-16
							"
						>
							<div className="grid gap-4 h-auto grid-cols-1 lg:hidden">
								{firstPageCards}
								{secondPageCards}
							</div>
							<div
								className={`
									hidden lg:grid gap-4 h-auto lg:h-full
									grid-cols-1 md:grid-cols-2
									md:[grid-template-rows:repeat(3,minmax(220px,1fr))]
									transition-opacity duration-300 ease-out
									${fadeState === 'out' ? 'opacity-0' : 'opacity-100'}
									${fadeState !== 'idle' ? 'pointer-events-none' : ''}
								`}
							>
								{renderedPage === 1 ? firstPageCards : secondPageCards}
							</div>

							{/* Paginação fixa no rodapé do container (apenas desktop) */}
							<div
                            className="hidden lg:flex absolute left-0 right-0 bottom-3 items-center justify-center"
                            aria-hidden={false}
                        >
                            <div className="bg-black/40 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-1.5 shadow-md">
                                <Pagination
                                    total={2}
                                    value={page}
                                    onChange={(val) => {
                                        if (val !== page) setPage(val);
                                    }}
                                    size="sm"
                                    radius="md"
                                    classNames={{
                                        root: PaginationModule.root,
                                        control: PaginationModule.control,
                                        dots: PaginationModule.dots,
                                    }}
                                />
                            </div>
                        </div>

                    </Box>
				</Container>
			</div>
		</BackgroundImage>
	);
};

export default SelectionScreen;
