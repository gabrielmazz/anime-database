import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Imagens e utilitários
import logo from '../assets/images/imgLogo/logo.png';
import { getRandomWallpaper } from '../utils/wallpaper';
import { applyPaletteToCssVariables, extractPaletteFromImage } from '../utils/palette';

// Componentes do Mantine
import {
  ActionIcon,
  BackgroundImage,
  Box,
  Container,
  Divider,
  Group,
  Image,
  List,
  Space,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
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
import { MdOutlineBiotech, MdApi } from "react-icons/md";
import { FaReact } from "react-icons/fa";
import { TbBrandVite, TbBrandTailwind, TbBrandTypescript, TbPalette, TbIcons } from "react-icons/tb";
import { SiReactrouter } from "react-icons/si";

// Importação do modal centralizado
import CenteredModal from '../assets/components/centerModal.tsx';

const IntroScreen: React.FC = () => {
    const navigate = useNavigate();
    const [wallpaper, _setWallpaper] = useState<string>(() => getRandomWallpaper('intro'));

    const [aboutOpen, setAboutOpen] = useState<boolean>(false);
    const [techOpen, setTechOpen] = useState<boolean>(false);

    useEffect(() => {
        if (!wallpaper) return;
        extractPaletteFromImage(wallpaper)
            .then(applyPaletteToCssVariables)
            .catch(() => { /* ignora silenciosamente */ });
    }, [wallpaper]);

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
            {/* Overlay escuro por cima do wallpaper */}
            <div className="absolute inset-0 bg-black/60 pointer-events-none" />

            {/* Conteúdo centralizado (responsivo) */}
            <div
                className="
                    relative z-10 w-full min-h-screen
                    max-w-[92vw] 2xl:max-w-[1900px] mx-auto
                    px-4 sm:px-6 lg:px-12
                    flex items-start lg:items-center justify-center
                    py-8 lg:py-0
                "
            >
                {/* Grid responsiva: empilha no mobile e divide 2:3 no desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch w-full min-h-0 lg:min-h-[70vh]">

                    <div className="col-span-1 lg:col-span-2 h-auto lg:h-full">

                        <Container
                            fluid
                            className="
                                    w-full h-full max-w-none
                                    bg-black/40 rounded-lg 
                                    backdrop-blur-sm border border-white/20 shadow-lg 
                                    p-6
                                "
                        >

                            <Box className="flex flex-col items-center justify-center h-full">
                                <Image
                                    src={logo}
                                    w="auto"
                                    alt="AniDex Logo"
                                    className="h-36 sm:h-48 md:h-56 lg:h-[28rem] xl:h-[34rem]"
                                    style={{
                                        filter: 'drop-shadow(0 12px 26px rgba(0,0,0,0.55))',
                                    }}
                                />

                                <Space h="md" />

                                <Title
                                    order={2}
                                    className="text-shadow-lg/40 uppercase tracking-(--title-letter-spacing) text-center"
                                    style={{
                                        fontFamily: 'var(--text-font-mono)',
                                        color: 'var(--color1)'
                                    }}
                                >
                                    Bem-vindo
                                </Title>

                                <Text
                                    className="mt-2 opacity-90 uppercase tracking-(--title-letter-spacing) text-center text-sm sm:text-base md:text-lg"
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
                                    onClick={() => { navigate('/selectionScreen'); }}
                                >
                                    Entrar
                                </Button>
                            </Box>

                        </Container>
                    </div>

                    <div className="col-span-1 lg:col-span-3 h-auto lg:h-full mt-6 lg:mt-0">
                        <Container
                            fluid
                            className="
                                w-full h-auto lg:h-full max-w-none
                                bg-black/40 rounded-lg 
                                backdrop-blur-sm border border-white/20 shadow-lg 
                                p-4 sm:p-6 md:p-8
                                flex items-center justify-center
                            "
                            
                        >
                            <div>
                                <Title
                                    order={3}
                                    className="text-shadow-lg/40 text-center uppercase tracking-(--title-letter-spacing) text-xl sm:text-2xl md:text-3xl"
                                    style={{
                                        fontFamily: 'var(--text-font-mono)',
                                        color: 'var(--color1)'
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
                                    text-sm sm:text-base md:text-lg lg:text-xl
                                "
                                    style={{
                                        fontFamily: 'var(--text-font-body)',
                                        color: 'var(--colorTextWhite)'
                                    }}
                                >
                                    Este é um projeto pessoal, sem fins lucrativos, concebido com finalidade exclusivamente educacional. Seu objetivo é explorar, validar e aprimorar práticas de desenvolvimento de software, design de interfaces e integração de serviços, sem qualquer intenção comercial.
                                    Todos os materiais, imagens e dados exibidos destinam-se apenas ao estudo e à demonstração técnica, podendo incluir referências a conteúdos de terceiros para fins ilustrativos.
                                </Text>

                                <Space h="md" />

                                <Divider my="xl"  />

                                <Text
                                    className="
                                    w-full
                                    text-center
                                    text-shadow-lg/60
                                    text-justify
                                    font-bold
                                    uppercase
                                    tracking-(--title-letter-spacing)
                                    text-sm sm:text-base md:text-lg lg:text-xl
                                "
                                    style={{
                                        fontFamily: 'var(--text-font-body)',
                                        color: 'var(--colorTextWhite)'
                                    }}
                                >
                                    Este projeto utiliza a API não oficial do MyAnimeList (Jikan) para buscar informações sobre animes. 
                                </Text>

                                <Space h="md" />

                                <Group>

                                    {[
                                        { key: 'github', icon: FaGithub, label: 'Abrir GitHub', onClick: () => window.open('https://github.com', '_blank', 'noopener,noreferrer') },
                                        { key: 'info', icon: FaInfo, label: 'Sobre o projeto', onClick: () => setAboutOpen(true) },
                                        { key: 'tech', icon: MdOutlineBiotech, label: 'Tecnologias usadas', onClick: () => setTechOpen(true) },
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

                <CenteredModal
                    opened={false}
                    onClose={() => { }}
                    title="Tecnologias usadas"
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
                        Este projeto utiliza a API não oficial do MyAnimeList (Jikan) para buscar informações sobre animes.
                    </Text>

                </CenteredModal>

                <CenteredModal
                    opened={techOpen}
                    onClose={() => setTechOpen(false)}
                    title="Tecnologias usadas"
                    size="xl"
                >
                    {/* Lista de tecnologias usadas no projeto */}
                    <Text
                        size="sm"
                        className="
                                mb-4
                                tracking-(--title-letter-spacing)
                            "
                        style={
                            {
                                color: 'var(--color1)',
                                fontFamily: 'var(--text-font-body)',
                            }
                        }
                    >
                        As tecnologias utilizadas no desenvolvimento do AniDex incluem:
                    </Text>

                    <Space h="md" />

                    {(() => {
                        const iconStyle = { color: 'var(--color1)' } as const;
                        const techs = [
                            { key: 'react', icon: <FaReact size={18} style={iconStyle} />, text: 'React – Framework UI.' },
                            { key: 'ts', icon: <TbBrandTypescript size={18} style={iconStyle} />, text: 'TypeScript – Linguagem principal.' },
                            { key: 'vite', icon: <TbBrandVite size={18} style={iconStyle} />, text: 'Vite – build dev rápido para React/TS.' },
                            { key: 'mantine', icon: <TbPalette size={18} style={iconStyle} />, text: 'Mantine UI – componentes (Core + Carousel).' },
                            { key: 'tailwind', icon: <TbBrandTailwind size={18} style={iconStyle} />, text: 'Tailwind CSS + @tailwindcss/vite.' },
                            { key: 'router', icon: <SiReactrouter size={18} style={iconStyle} />, text: 'React Router DOM – navegação entre telas.' },
                            { key: 'icons', icon: <TbIcons size={18} style={iconStyle} />, text: 'React Icons – pacote de ícones.' },
                            { key: 'jikan', icon: <MdApi size={18} style={iconStyle} />, text: 'Jikan API (MyAnimeList) – dados de animes.' },
                        ];
                        return (
                            <List
                                size="sm"
                                spacing="sm"
                                center
                                className="mb-4"
                                style={{ color: 'var(--colorTextWhite)', fontFamily: 'var(--text-font-body)' }}
                            >
                                {techs.map((t) => (
                                    <List.Item
                                        key={t.key}
                                        icon={
                                            <ThemeIcon
                                                variant="outline"
                                                radius="md"
                                                size={28}
                                                style={{
                                                    borderColor: 'var(--color1)',
                                                    color: 'var(--color1)',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                {t.icon}
                                            </ThemeIcon>
                                        }
                                    >
                                        <Text component="span" className="tracking-(--title-letter-spacing)" style={{ fontFamily: 'var(--text-font-body)' }}>
                                            {t.text}
                                        </Text>
                                    </List.Item>
                                ))}
                            </List>
                        );
                    })()}

                </CenteredModal>

            </div>

            {/* Rodapé com logo e créditos (escondido em dispositivos mobile) */}
            <div className="absolute bottom-4 left-0 right-0 hidden sm:flex flex-col items-center justify-center pointer-events-none">
                <LogoBaseboard />
            </div>

        </BackgroundImage >
    );
};

export default IntroScreen;
