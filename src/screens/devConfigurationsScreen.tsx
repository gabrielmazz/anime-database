import React, { useEffect, useState } from 'react';

// Layout e UI base (igual SearchScreen)
import { BackgroundImage } from '@mantine/core';
import { Box } from '@mantine/core';
import { Space } from '@mantine/core';
import { Text } from '@mantine/core';
import { Title } from '@mantine/core';
import { Container } from '@mantine/core';
import { Group } from '@mantine/core';

// Componentes de input
import { Switch } from '@mantine/core';
import SwitchModule from '../assets/inputInfos/Switch.module.css';
import { useSettings } from '../state/settings';

// Componentes principais, montagem da tela
import Sidebar from '../assets/components/sidebar.tsx';

// Paleta dinâmica baseada no wallpaper
import { applyPaletteToCssVariables, extractPaletteFromImage } from '../utils/palette';

// Wallpapers específicos desta tela
import { getRandomWallpaper } from '../utils/wallpaper';

const DevConfigurationsScreen: React.FC = () => {
    const [wallpaper, setWallpaper] = useState<string>(() => getRandomWallpaper('dev'));
    const { apiModalEnabled, setApiModalEnabled, devModeEnabled, setDevModeEnabled } = useSettings();

    // Extrai paleta baseada no wallpaper e aplica nas CSS variables
    useEffect(() => {
        if (!wallpaper) return;
        extractPaletteFromImage(wallpaper)
            .then(applyPaletteToCssVariables)
            .catch(() => { /* ignora erros de leitura silenciosamente */ });
    }, [wallpaper]);

    return (

        <BackgroundImage
            src={wallpaper}
            className="relative text-white w-full min-h-screen bg-cover bg-no-repeat bg-center bg-fixed"
        >
            {/* Overlay escuro por cima do wallpaper */}
            <div className="absolute inset-0 bg-black/60 pointer-events-none" />

            {/* Sidebar fixa lateral */}
            <Sidebar />

            {/* Container base para conteúdo da página (responsivo) */}
            <div
                className="
                    relative z-10 w-full min-h-screen
                    max-w-[92vw] 2xl:max-w-[1900px] mx-auto align-top
                    px-4 sm:px-6 lg:px-12
                    pl-[1200px]
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
                    Painel de Configurações (Dev)
                </Title>

                <Space h={40} />

                <Container
                    fluid
                    className="
                        bg-black/40 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg
                        w-full max-w-none mx-auto
                        p-4 sm:p-6 md:p-8
                        mt-4 mb-0
                        h-[80vh] overflow-hidden
                    "
                >
                    <Text style={{ color: 'var(--colorTextWhite)' }}>

                        <Group grow>

                            {/* Switch para ativar o Dev Mode (mostra o menu/botão de debug) */}
                            <Switch
                                size="xl"
                                onLabel="ON"
                                offLabel="OFF"
                                label="Dev Mode"
                                description="Ativa recursos de desenvolvimento, incluindo menu lateral de debug."
                                checked={devModeEnabled}
                                onChange={(e) => setDevModeEnabled(e.currentTarget.checked)}
                                classNames={{
                                    root: SwitchModule.rootSwitch,
                                    body: SwitchModule.bodySwitch,
                                    labelWrapper: SwitchModule.labelWrapperSwitch,
                                    description: SwitchModule.descriptionSwitch,
                                    track: SwitchModule.trackSwitch,
                                    thumb: SwitchModule.thumbSwitch,
                                }}
                            />

                            <Switch
                                size="xl"
                                onLabel="ON"
                                offLabel="OFF"
                                label="Capturar retorno das APIs"
                                description="Salva o último retorno de API para inspeção no Drawer de debug."
                                checked={apiModalEnabled}
                                onChange={(e) => setApiModalEnabled(e.currentTarget.checked)}
                                classNames={{
                                    root: SwitchModule.rootSwitch,
                                    body: SwitchModule.bodySwitch,
                                    labelWrapper: SwitchModule.labelWrapperSwitch,
                                    description: SwitchModule.descriptionSwitch,
                                    track: SwitchModule.trackSwitch,
                                    thumb: SwitchModule.thumbSwitch,
                                }}
                            />

                        </Group>

                    </Text>
                </Container>


            </div>
        </BackgroundImage>
    );
};

export default DevConfigurationsScreen;
