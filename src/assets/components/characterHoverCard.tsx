import React from 'react';
import { Group, HoverCard, Image, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

import HoverCardModule from '../inputInfos/HoverCard.module.css';

interface CharacterImageFormats {
    image_url?: string;
}

interface CharacterImages {
    jpg?: CharacterImageFormats;
    webp?: CharacterImageFormats;
}

interface CharacterPerson {
    name?: string;
}

interface CharacterVoiceActor {
    language?: string | null;
    person?: CharacterPerson | null;
}

interface CharacterData {
    name?: string;
    favorites?: number | null;
    images?: CharacterImages | null;
    mal_id?: number;
}

interface AnimeData {
    mal_id?: number;
    title?: string;
    images?: CharacterImages | null;
}

interface CharacterAnimeographyItem {
    role?: string;
    anime?: AnimeData | null;
}

export interface CharacterEntry {
    role?: string;
    character?: CharacterData | null;
    voice_actors?: CharacterVoiceActor[] | null;
    animeography?: CharacterAnimeographyItem[] | null;
    parentAnime?: AnimeData | null;
}

interface VoiceActorInfo {
    name: string;
    language?: string | null;
}

interface CharacterHoverCardProps {
    characterEntry: CharacterEntry;
    nameColor?: string;
    imageHeight?: number;
    imageWidth?: number;
    parentAnime?: AnimeData | null;
}

function formatNumber(value?: number | null) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return '-';
    }
    try {
        return new Intl.NumberFormat('pt-BR').format(value);
    } catch {
        return String(value);
    }
}

function getPrimaryVoiceActor(entry: CharacterEntry): VoiceActorInfo | null {
    const actors: CharacterVoiceActor[] = Array.isArray(entry?.voice_actors) ? entry.voice_actors : [];
    if (actors.length === 0) {
        return null;
    }
    const preferred = actors.find((actor) => actor?.language === 'Japanese') ?? actors[0];
    const name = preferred?.person?.name;
    if (!name) {
        return null;
    }
    return { name, language: preferred?.language };
}

const CharacterHoverCard: React.FC<CharacterHoverCardProps> = ({
    characterEntry,
    nameColor = 'var(--colorTextWhite)',
    imageHeight = 120,
    imageWidth = 80,
    parentAnime: parentAnimeProp = null,
}) => {
    const isSmDown = useMediaQuery('(max-width: 640px)');
    const character = characterEntry?.character ?? undefined;
    const images = character?.images ?? undefined;
    const imageUrl: string | undefined = images?.jpg?.image_url ?? images?.webp?.image_url;
    const name: string = character?.name ?? 'Personagem';
    const role: string = characterEntry?.role ?? 'Desconhecido';
    const favorites = typeof character?.favorites === 'number' ? character.favorites : null;
    const voiceActor = getPrimaryVoiceActor(characterEntry);
    const parentAnime = characterEntry?.parentAnime ?? parentAnimeProp ?? null;
    const compactImageHeight = isSmDown ? Math.min(imageHeight, 96) : imageHeight;
    const compactImageWidth = isSmDown ? Math.min(imageWidth, 64) : imageWidth;

    return (
        <HoverCard
            width={340}
            shadow="md"
            withinPortal
            openDelay={200}
            closeDelay={120}
            classNames={{ dropdown: HoverCardModule.dropdownHoverCard }}
        >
            <HoverCard.Target>
                <Group
                    align="center"
                    gap={isSmDown ? 'sm' : 'md'}
                    wrap={isSmDown ? 'wrap' : 'nowrap'}
                    style={{ cursor: 'pointer', width: '100%' }}
                >
                    <Image
                        src={imageUrl}
                        radius="md"
                        h={compactImageHeight}
                        w={compactImageWidth}
                        alt={name}
                    />
                    <Text
                        style={{ color: nameColor, fontWeight: 600, fontSize: isSmDown ? 14 : undefined, wordBreak: 'break-word' }}
                        lineClamp={2}
                    >
                        {name}
                    </Text>
                </Group>
            </HoverCard.Target>
            <HoverCard.Dropdown>
                <div className="flex items-start gap-3">
                    <Image src={imageUrl} radius="sm" w={72} h={96} alt={name} />
                    <div className="min-w-0">
                        <Text className={HoverCardModule.titleHoverCard}>{name}</Text>
                        <Text size="sm" className={HoverCardModule.metaHoverCard}>Função: {role}</Text>
                        {favorites !== null && (
                            <Text size="sm" className={HoverCardModule.metaHoverCard}>
                                Favoritos: {formatNumber(favorites)}
                            </Text>
                        )}
                        {voiceActor && (
                            <Text size="sm" className={HoverCardModule.metaHoverCard}>
                                Dublador: {voiceActor.name}
                                {voiceActor.language ? ` (${voiceActor.language})` : ''}
                            </Text>
                        )}
                        {parentAnime && (
                            <Text size="sm" className={HoverCardModule.metaHoverCard}>
                                Anime: {parentAnime.title ?? 'Desconhecido'}
                            </Text>
                        )}
                    </div>
                </div>
            </HoverCard.Dropdown>
        </HoverCard>
    );
};

export default CharacterHoverCard;
