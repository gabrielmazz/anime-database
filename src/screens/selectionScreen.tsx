import React, { useEffect, useState } from "react";

// Importação dos assets da tela
import imgCard01 from '../assets/images/imgSelectionScreen/imgCard01.jpg';
import imgCard02 from '../assets/images/imgSelectionScreen/imgCard02.png';
import imgCard03 from '../assets/images/imgSelectionScreen/imgCard03.jpg';
import imgCard04 from '../assets/images/imgSelectionScreen/imgCard04.jpg';

// Importação dos componentes do mantine
import { BackgroundImage, Container, Space, Title, Text, Box } from '@mantine/core';

import { ScrollArea } from '@mantine/core';

// Sidebar e utilitários de tema
import Sidebar from '../assets/components/sidebar.tsx';
import { getRandomWallpaper } from '../utils/wallpaper';
import { applyPaletteToCssVariables, extractPaletteFromImage } from '../utils/palette';

const SelectionScreen: React.FC = () => {
	const [wallpaper, setWallpaper] = useState<string>(() => getRandomWallpaper('selection'));

	// Extrai paleta baseada no wallpaper e aplica nas CSS variables (mesmo padrão das outras telas)
	useEffect(() => {
		if (!wallpaper) return;
		extractPaletteFromImage(wallpaper)
			.then(applyPaletteToCssVariables)
			.catch(() => { /* ignora silenciosamente */ });
	}, [wallpaper]);

	return (
		<BackgroundImage
			src={wallpaper}
			className="relative text-white w-full min-h-screen bg-cover bg-no-repeat bg-center bg-fixed"
		>
			{/* Overlay escuro por cima do wallpaper */}
			<div className="absolute inset-0 bg-black/60 pointer-events-none" />

			{/* Sidebar fixa lateral, mantendo consistência visual */}
			<Sidebar />

			{/* Container principal */}
			<div
				className="
					relative z-10 w-full min-h-screen
					max-w-[92vw] 2xl:max-w-[1900px] mx-auto align-top
					px-4 sm:px-6 lg:px-12
					pl-[88px]
				"
			>
				<Title
					className="
						flex justify-center pt-8
						text-shadow-lg/20 text-(--color1)
						uppercase tracking-(--title-letter-spacing)
						text-[clamp(24px,4vw,42px)]
          			"
					style={{ fontFamily: 'var(--text-font-mono)' }}
				>
					AniDex — Selecione uma opção
				</Title>

				<Space h="md" />

				<Container
					fluid
					className="
						bg-black/40 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg
						w-full max-w-none mx-auto
						p-6 sm:p-10 md:p-16
						mt-8 mb-8
						min-h-[calc(100vh-265px)]
					"
				>
                    <ScrollArea h="78vh" type="auto" scrollbarSize={12} offsetScrollbars>
                        <Box
                            className="
                                grid gap-6 h-full
                                grid-cols-1 md:grid-cols-2 md:grid-rows-2
                                pt-2 pb-6 pr-2 pl-2
                            "
                        >
							{/* Card 1: Buscar Anime */}
                            <Box
                                className="
                                    border-2 rounded-lg shadow-lg/30 overflow-hidden cursor-pointer
                                    transition-all duration-300 ease-out
                                    hover:scale-[1.01]
                                    min-h-[320px] md:min-h-[360px]
                                "
								style={{ borderColor: 'var(--color1)' }}
								onClick={() => { window.location.href = '/searchScreen'; }}
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

						{/* Card 3: Buscar Mangá */}
                            <Box
                            className="
                                border-2 rounded-lg shadow-lg/30 overflow-hidden cursor-pointer
                                transition-all duration-300 ease-out
                                hover:scale-[1.01]
                                min-h-[320px] md:min-h-[360px]
                            "
							style={{ borderColor: 'var(--color1)' }}
							onClick={() => { window.location.href = '/searchScreenManga'; }}
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

							{/* Card 4: Buscar Produtores (placeholder) */}
                            <Box
                                className="
                                    border-2 rounded-lg shadow-lg/30 overflow-hidden
                                    transition-all duration-300 ease-out
                                    hover:scale-[1.01]
                                    min-h-[320px] md:min-h-[360px]
                                "
								style={{ borderColor: 'var(--color1)' }}
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

							{/* Card 2: Buscar Personagem (placeholder) */}
                            <Box
                                className="
                                    border-2 rounded-lg shadow-lg/30 overflow-hidden
                                    transition-all duration-300 ease-out
                                    hover:scale-[1.01]
                                    min-h-[320px] md:min-h-[360px]
                                "
								style={{ borderColor: 'var(--color1)' }}
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
						</Box>
					</ScrollArea>
				</Container>
			</div>
		</BackgroundImage>
	);
};

export default SelectionScreen;
