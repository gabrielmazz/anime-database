import React, { useEffect, useState } from 'react';

// Imagens e utilitários
import logo from '../assets/images/imgLogo/logo.png';
import { getRandomWallpaper } from '../utils/wallpaper';
import { applyPaletteToCssVariables, extractPaletteFromImage } from '../utils/palette';

// Componentes do Mantine
import { BackgroundImage, Container, Title, Text, Box, Space } from '@mantine/core';
import { Image } from '@mantine/core';
import { Group } from '@mantine/core';

import { ActionIcon } from '@mantine/core';
import ActionIconModule from './../assets/inputInfos/ActionIcon.module.css';

import { Tooltip } from '@mantine/core';
import TooltipModule from './../assets/inputInfos/Tooltip.module.css';

import { Button } from '@mantine/core';
import ButtonModule from './../assets/inputInfos/Button.module.css';

// Componentes de estilização
import LogoBaseboard from '../assets/components/logoBaseboard.tsx';

// Importação do icones
import { FaGithub } from "react-icons/fa";
import { FaInfo } from "react-icons/fa6";
import CenteredModal from '../assets/components/centerModal.tsx';

const IntroScreen: React.FC = () => {
    const [wallpaper, setWallpaper] = useState<string>(() => getRandomWallpaper('intro'));


    const [aboutOpen, setAboutOpen] = useState<boolean>(false);

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

            {/* Conteúdo centralizado */}
            <div
                className="
                    relative z-10 w-full min-h-screen
                    max-w-[92vw] 2xl:max-w-[1900px] mx-auto
                    px-4 sm:px-6 lg:px-12
                    flex items-center justify-center
                "
            >
                {/* Grid 2:3 com altura fixa e itens esticando */}
                <div className="grid grid-cols-5 gap-4 items-stretch min-h-[70vh]">

                    <div className="col-span-2 h-full">

                        <Container
                            fluid
                            className="
                                    w-full h-full max-w-none
                                    bg-black/40 rounded-lg 
                                    backdrop-blur-sm border border-white/20 shadow-lg 
                                    p-6
                                "
                        >

                            <Box className="flex flex-col items-center">
                                <Image
                                    src={logo}
                                    h={700}
                                    w="auto"
                                    alt="AniDex Logo"
                                    style={{
                                        filter: 'drop-shadow(0 12px 26px rgba(0,0,0,0.55))',
                                    }}
                                />

                                <Space h="md" />

                                <Title
                                    order={2}
                                    className="text-shadow-lg/40 uppercase tracking-(--title-letter-spacing)"
                                    style={{
                                        fontFamily: 'var(--text-font-mono)',
                                        color: 'var(--color1)',
                                        fontSize: 28,
                                    }}
                                >
                                    Bem-vindo
                                </Title>

                                <Text
                                    className="mt-2 opacity-90 uppercase tracking-(--title-letter-spacing) text-center"
                                    style={{
                                        fontFamily: 'var(--text-font-body)',
                                        color: 'var(--colorTextWhite)'
                                    }}
                                >
                                    Pesquise, explore e descubra animes de forma fácil e rápida.
                                </Text>

                                <Space h="xl" />

                                <Button
                                    size="md"
                                    radius="md"
                                    variant="filled"
                                    classNames={{
                                        root: ButtonModule.rootButton,
                                    }}
                                    onClick={() => { window.location.href = '/selectionScreen'; }}
                                >
                                    Entrar
                                </Button>
                            </Box>

                        </Container>
                    </div>

                    <div className="col-span-3 h-full">
                        <Container
                            fluid
                            className="
                                w-full h-full max-w-none
                                bg-black/40 rounded-lg 
                                backdrop-blur-sm border border-white/20 shadow-lg 
                                p-6
                                flex items-center justify-center
                            "
                            style={{ paddingLeft: 58, paddingRight: 58 }}
                        >
                            <div>
                                <Title
                                    order={3}
                                    className="text-shadow-lg/40 text-center uppercase tracking-(--title-letter-spacing)"
                                    style={{
                                        fontFamily: 'var(--text-font-mono)',
                                        color: 'var(--color1)',
                                        fontSize: 32,
                                    }}
                                >
                                    Aviso importante
                                </Title>

                                <Space h="xl" />

                                <Text
                                    className="
                                    w-full
                                    text-center
                                    text-shadow-lg/60
                                    text-justify
                                    font-bold
                                    uppercase
                                    tracking-(--title-letter-spacing)
                                "
                                    style={{
                                        fontFamily: 'var(--text-font-body)',
                                        color: 'var(--colorTextWhite)',
                                        fontSize: 24,
                                    }}
                                >
                                    Este é um projeto pessoal, sem fins lucrativos, concebido com finalidade exclusivamente educacional. Seu objetivo é explorar, validar e aprimorar práticas de desenvolvimento de software, design de interfaces e integração de serviços, sem qualquer intenção comercial.
                                    Todos os materiais, imagens e dados exibidos destinam-se apenas ao estudo e à demonstração técnica, podendo incluir referências a conteúdos de terceiros para fins ilustrativos.
                                </Text>

                                <Space h="md" />

                                <Group>

                                    {[
                                        { key: 'github', icon: FaGithub, label: 'Abrir GitHub', onClick: () => window.open('https://github.com', '_blank', 'noopener,noreferrer') },
                                        { key: 'info', icon: FaInfo, label: 'Sobre o projeto', onClick: () => setAboutOpen(true) },
                                    ].map((btn) => (
                                        <Tooltip
                                            label={btn.label}
                                            withinPortal
                                            offset={8}
                                            openDelay={200}
                                            closeDelay={80}
                                            classNames={{ tooltip: TooltipModule.tooltip, arrow: TooltipModule.arrow }}
                                            key={btn.key}
                                        >
                                            <ActionIcon
                                                size={42}
                                                variant="default"
                                                onClick={btn.onClick}
                                                classNames={{
                                                    root: ActionIconModule.rootActionIcon,
                                                    icon: ActionIconModule.iconActionIcon,
                                                }}
                                            >
                                                {btn.icon({ size: 20 })}
                                            </ActionIcon>
                                        </Tooltip>
                                    ))}

                                </Group>

                            </div>

                        </Container>

                    </div>
                </div>

                <CenteredModal
                    opened={aboutOpen}
                    onClose={() => setAboutOpen(false)}
                    title="Sobre o projeto"
                    size="md"
                >
                    <Text
                        size="sm"
                        className="
								text-center mb-4
                                tracking-(--title-letter-spacing)
							"
                        style={
                            {
                                color: 'var(--color1)',
                                fontFamily: 'var(--text-font-body)',
                            }
                        }
                    >
                        AniDex é um projeto pessoal desenvolvido por Gabriel Mazzuco, com o objetivo de criar uma aplicação para buscar, explorar e conhecer animes
                    </Text>

                    <Space h="md" />

                    {/* Conteúdo interno do modal: centraliza o LogoBaseboard dentro do corpo do modal */}
                    <div className="flex items-center justify-center py-2">
                        <LogoBaseboard />
                    </div>


                </CenteredModal>


            </div>

            {/* Rodapé com logo e créditos */}
            <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center justify-center pointer-events-none">
                <LogoBaseboard />
            </div>

        </BackgroundImage >
    );
};

export default IntroScreen;
