import React, { useEffect, useMemo, useRef, useState } from 'react';

// UI base (Mantine)
import {
    BackgroundImage,
    Box,
    Button,
    Container,
    Divider,
    Grid,
    Group,
    HoverCard,
    Image,
    Pill,
    Space,
    Table,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

// Componentes compartilhados
import Sidebar from '../assets/components/sidebar.tsx';
import LoadingOverlayFullscreen from '../assets/components/overlay.tsx';
import AlertBox from '../assets/components/alert.tsx';
import InfoDrawer from '../assets/components/infoDrawer.tsx';
import LoaderBox from '../assets/components/loaderBox.tsx';

// CSS Modules / estilos
import TextInputModule from '../assets/inputInfos/TextInput.module.css';
import TableModule from '../assets/inputInfos/Table.module.css';
import DrawerModule from '../assets/inputInfos/Drawer.module.css';
import MultiSelectModule from '../assets/inputInfos/MultiSelect.module.css';
import HoverCardModule from '../assets/inputInfos/HoverCard.module.css';
import ButtonModule from '../assets/inputInfos/Button.module.css';

// Tema / utils
import { applyPaletteToCssVariables, extractPaletteFromImage } from '../utils/palette';
import { getRandomWallpaper } from '../utils/wallpaper';

// API
import {
    getPeople,
    getPersonFull,
    searchPeopleByName,
    searchAnimeByName,
    type Person,
    type PersonFullResponse,
    type PersonVoiceEntry,
    type Anime,
} from '../assets/API/jikan';
import { translateTextDetailed } from '../assets/API/translate';

const PAGE_SIZE = 25;
const VOICE_CHARACTERS_PER_ROW = 2;
const VOICE_CHARACTERS_INITIAL_COUNT = 20;
const VOICE_CHARACTERS_STEP = 50;

type VoiceCharacterWithFavorites = PersonVoiceEntry['character'] & { favorites?: number | null };

function formatNumber(value?: number | null) {
    if (typeof value !== 'number') return '-';
    try {
        return new Intl.NumberFormat('pt-BR').format(value);
    } catch {
        return String(value);
    }
}

function formatDate(value?: string | null) {
    if (!value) return '-';
    try {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '-';
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(date);
    } catch {
        return '-';
    }
}

function chunkIntoRows<T>(items: T[], perRow: number): T[][] {
    if (perRow <= 0) return [];
    const rows: T[][] = [];
    for (let i = 0; i < items.length; i += perRow) {
        rows.push(items.slice(i, i + perRow));
    }
    return rows;
}

const SearchScreenPeople: React.FC = () => {
    const [wallpaper, _setWallpaper] = useState<string>(() => getRandomWallpaper('people'));
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [query, setQuery] = useState<string>('');
    const [rows, setRows] = useState<Person[]>([]);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [voiceCharactersVisibleCount, setVoiceCharactersVisibleCount] = useState<number>(VOICE_CHARACTERS_INITIAL_COUNT);

    const scrollRef = useRef<HTMLDivElement | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const rowsRef = useRef<Person[]>([]);
    const hasInitializedQueryEffect = useRef<boolean>(false);

    const [openedDrawer, setOpenedDrawer] = useState<boolean>(false);
    const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
    const [selectedPersonFull, setSelectedPersonFull] = useState<PersonFullResponse['data'] | null>(null);
    const [translatedAbout, setTranslatedAbout] = useState<string | null>(null);
    const [animeHoverCache, setAnimeHoverCache] = useState<Record<string, { status: 'loading' | 'success' | 'error'; data?: Anime | null }>>({});

    const isLgDown = useMediaQuery('(max-width: 1024px)');
    const isSmDown = useMediaQuery('(max-width: 640px)');
    const tableWidthClass = isSmDown ? 'w-full' : 'min-w-[640px]';
    const drawerSize = isLgDown ? '100%' : '35%';
    const portraitHeight = isSmDown ? 360 : isLgDown ? 480 : 600;
    const [alertVisible, setAlertVisible] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string>('');
    const [alertType, setAlertType] = useState<'info' | 'warning' | 'error' | 'success'>('info');

    const getDisplayName = (person: Person | null | undefined) => {
        if (!person) return '';
        if (person.name) return person.name;
        const parts = [person.given_name, person.family_name].filter(Boolean).join(' ');
        return parts || 'Desconhecido';
    };

    const handleAlert = (type: typeof alertType, message: string) => {
        setAlertType(type);
        setAlertMessage(message);
        setAlertVisible(true);
    };

    const sortPeopleByFavorites = (list: Person[]) =>
        list
            .slice()
            .sort((a, b) => (b.favorites ?? 0) - (a.favorites ?? 0));

    // Tradução do campo "about" sempre que os detalhes forem atualizados
    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!selectedPersonFull?.about) {
                setTranslatedAbout(null);
                return;
            }
            try {
                const { text, translated } = await translateTextDetailed(selectedPersonFull.about, 'en', 'pt-BR');
                if (!cancelled) {
                    setTranslatedAbout(text);
                    handleAlert(translated ? 'success' : 'warning', translated ? 'Biografia traduzida com sucesso!' : 'Não foi possível traduzir a biografia.');
                }
            } catch {
                if (!cancelled) {
                    setTranslatedAbout(selectedPersonFull.about);
                    handleAlert('error', 'Falha ao traduzir a biografia.');
                }
            }
        };
        run();
        return () => { cancelled = true; };
    }, [selectedPersonFull?.about]);

    // Aplica paleta baseada no wallpaper atual
    useEffect(() => {
        if (!wallpaper) return;
        extractPaletteFromImage(wallpaper)
            .then(applyPaletteToCssVariables)
            .catch(() => { /* silêncio */ });
    }, [wallpaper]);

    const loadInitial = async () => {
        setIsLoading(true);
        try {
            const response = await getPeople(1, PAGE_SIZE);
            const data = sortPeopleByFavorites(response.data ?? []);
            setRows(data);
            setPage(1);
            setHasMore(data.length >= PAGE_SIZE);
            handleAlert('success', `Foram carregadas ${data.length} pessoas.`);
        } catch {
            if (rowsRef.current.length === 0) {
                handleAlert('error', 'Falha ao carregar pessoas.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        rowsRef.current = rows;
    }, [rows]);

    useEffect(() => {
        loadInitial();
    }, []);

    useEffect(() => {
        setVoiceCharactersVisibleCount(VOICE_CHARACTERS_INITIAL_COUNT);
    }, [selectedPersonFull?.mal_id]);

    // Busca com debounce
    useEffect(() => {
        if (!hasInitializedQueryEffect.current) {
            hasInitializedQueryEffect.current = true;
            return;
        }
        let cancelled = false;
        const handle = window.setTimeout(async () => {
            if (cancelled) return;
            const trimmed = query.trim();
            if (!trimmed) {
                await loadInitial();
                return;
            }
            setIsLoading(true);
            try {
                const response = await searchPeopleByName(trimmed, 1, PAGE_SIZE);
                const data = sortPeopleByFavorites(response.data ?? []);
                setRows(data);
                setPage(1);
                setHasMore(data.length >= PAGE_SIZE);
                handleAlert('success', `${data.length} pessoas encontradas para "${trimmed}".`);
            } catch {
                handleAlert('error', 'Falha na busca por pessoas.');
            } finally {
                setIsLoading(false);
            }
        }, 400);
        return () => {
            cancelled = true;
            window.clearTimeout(handle);
        };
    }, [query]);

    // Auto esconde alerta após alguns segundos
    useEffect(() => {
        if (!alertVisible) return;
        const timeout = window.setTimeout(() => setAlertVisible(false), 2500);
        return () => window.clearTimeout(timeout);
    }, [alertVisible]);

    // Infinite scroll
    useEffect(() => {
        if (!scrollRef.current || !sentinelRef.current) return;
        const root = scrollRef.current;
        const sentinel = sentinelRef.current;
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (!entry?.isIntersecting || isLoadingMore || !hasMore) return;
            const nextPage = page + 1;
            setIsLoadingMore(true);
            (async () => {
                try {
                    const trimmed = query.trim();
                    const response = trimmed
                        ? await searchPeopleByName(trimmed, nextPage, PAGE_SIZE)
                        : await getPeople(nextPage, PAGE_SIZE);
                    const data = response.data ?? [];
                    setRows((prev) => sortPeopleByFavorites([...prev, ...data]));
                    setPage(nextPage);
                    setHasMore(data.length >= PAGE_SIZE);
                    if (data.length > 0) {
                        handleAlert('success', `Mais ${data.length} pessoas carregadas.`);
                    } else {
                        handleAlert('info', 'Você já viu todas as pessoas disponíveis.');
                    }
                } finally {
                    setIsLoadingMore(false);
                }
            })();
        }, { root, rootMargin: '0px 0px 200px 0px', threshold: 0.05 });

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [page, query, isLoadingMore, hasMore]);

    const tableRows = useMemo(() => rows.map((person, index) => {
        const birthday = formatDate(person.birthday);
        const imageSize = isSmDown ? 48 : 56;
        return (
            <Table.Tr
                key={person.mal_id}
                className={TableModule.trTable}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                    setOpenedDrawer(true);
                    setSelectedPerson(person);
                    setSelectedPersonFull(null);
                    setTranslatedAbout(null);
                    getPersonFull(person.mal_id)
                        .then((full) => setSelectedPersonFull(full.data))
                        .catch(() => handleAlert('error', 'Falha ao carregar detalhes da pessoa.'));
                }}
            >
                <Table.Td className={TableModule.tdTable} width={64}>
                    <Text style={{ color: 'var(--color1)', fontWeight: 700 }}>{index + 1}</Text>
                </Table.Td>
                <Table.Td className={TableModule.tdTable}>
                    <Group wrap={isSmDown ? 'wrap' : 'nowrap'} gap={isSmDown ? 'xs' : 'sm'} align="center">
                        {person.images?.jpg?.image_url && (
                            <Image
                                src={person.images.jpg.image_url}
                                w={imageSize}
                                h={imageSize}
                                radius="sm"
                                fit="cover"
                                alt={getDisplayName(person)}
                            />
                        )}
                        <Box style={{ flex: 1, minWidth: isSmDown ? '100%' : 0 }}>
                            <Text style={{ color: 'var(--colorTextWhite)', fontSize: isSmDown ? 14 : undefined, wordBreak: 'break-word' }}>
                                {getDisplayName(person)}
                            </Text>
                            {birthday !== '-' && (
                                <Text size={isSmDown ? 'xs' : 'sm'} c="dimmed">Nascimento: {birthday}</Text>
                            )}
                            {typeof person.favorites === 'number' && (
                                <Text size={isSmDown ? 'xs' : 'sm'} c="dimmed">Favoritos: {formatNumber(person.favorites)}</Text>
                            )}
                        </Box>
                    </Group>
                </Table.Td>
            </Table.Tr>
        );
    }), [rows, isSmDown]);

    const alternateNames = useMemo(() => {
        if (!selectedPersonFull?.alternate_names || selectedPersonFull.alternate_names.length === 0) return null;
        return selectedPersonFull.alternate_names.filter(Boolean);
    }, [selectedPersonFull?.alternate_names]);

    const ensureAnimeHoverInfo = async (title: string) => {
        const key = (title || '').trim();
        if (!key) return;
        setAnimeHoverCache((prev) => (prev[key] ? prev : { ...prev, [key]: { status: 'loading' } }));
        if (animeHoverCache[key]) return;
        try {
            const res = await searchAnimeByName(key);
            const data = Array.isArray(res?.data) && res.data.length > 0 ? (res.data[0] as Anime) : null;
            setAnimeHoverCache((prev) => ({ ...prev, [key]: { status: 'success', data } }));
        } catch {
            setAnimeHoverCache((prev) => ({ ...prev, [key]: { status: 'error', data: null } }));
        }
    };

    const voiceCharacterEntries = useMemo<PersonVoiceEntry[]>(() => {
        if (!Array.isArray(selectedPersonFull?.voices) || selectedPersonFull.voices.length === 0) return [];
        return selectedPersonFull.voices as PersonVoiceEntry[];
    }, [selectedPersonFull?.voices]);

    const visibleVoiceCharacterEntries = useMemo(
        () => voiceCharacterEntries.slice(0, voiceCharactersVisibleCount),
        [voiceCharacterEntries, voiceCharactersVisibleCount],
    );

    const voiceCharacterRows = useMemo(
        () => chunkIntoRows(visibleVoiceCharacterEntries, isSmDown ? 1 : VOICE_CHARACTERS_PER_ROW),
        [visibleVoiceCharacterEntries, isSmDown],
    );

    const hasMoreVoiceCharacters = voiceCharacterEntries.length > voiceCharactersVisibleCount;
    const remainingVoiceCharacters = Math.max(voiceCharacterEntries.length - voiceCharactersVisibleCount, 0);
    const nextVoiceCharactersIncrement = Math.min(VOICE_CHARACTERS_STEP, remainingVoiceCharacters);

    const handleShowMoreVoiceCharacters = () => {
        setVoiceCharactersVisibleCount((prev) => Math.min(prev + VOICE_CHARACTERS_STEP, voiceCharacterEntries.length));
    };

    return (
        <BackgroundImage src={wallpaper} className="relative text-white w-full min-h-screen bg-cover bg-no-repeat bg-center bg-fixed">
            <div className="absolute inset-0 bg-black/60 pointer-events-none" />

            <AlertBox visible={alertVisible} message={alertMessage} type={alertType} />
            <LoadingOverlayFullscreen visible={isLoading} message={query.trim() ? 'Buscando pessoas...' : 'Carregando pessoas...'} />
            <Sidebar />

            <div className="container relative z-10 min-h-screen mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
                <Title
                    className="flex justify-center text-center pt-8 text-shadow-lg/20 text-(--color1) uppercase tracking-(--title-letter-spacing) text-2xl sm:text-3xl lg:text-4xl"
                    style={{ fontFamily: 'var(--text-font-mono)' }}
                >
                    Procure por dubladores, diretores e criadores
                </Title>

                <Space h={33} />

                <Group grow>
                    <TextInput
                        size="md"
                        label="Buscar pessoa"
                        description="Digite o nome do profissional do mundo anime/mangá"
                        placeholder="Ex.: Mamoru Hosoda, Megumi Hayashibara, Yoko Kanno..."
                        value={query}
                        classNames={{ input: TextInputModule.inputTextInput, label: TextInputModule.labelTextInput, description: TextInputModule.descriptionTextInput }}
                        className="mt-4 w-full max-w-2xl mx-auto"
                        onChange={(event) => setQuery(event.currentTarget.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                const value = (event.currentTarget.value || '').trim();
                                setQuery(value);
                                event.currentTarget.blur();
                                if (!value) {
                                    handleAlert('warning', 'Digite um nome para buscar.');
                                }
                            }
                        }}
                        onBlur={(event) => {
                            const value = (event.currentTarget.value || '').trim();
                            if (value !== query) setQuery(value);
                        }}
                        onFocus={(event) => event.target.select()}
                    />
                </Group>

                <Space h="md" />

                <Container fluid className="bg-black/40 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg w-full max-w-none mx-auto p-4 sm:p-6 md:p-8 mt-6 mb-0 h-[70vh] overflow-hidden">
                    <div ref={scrollRef} className="h-[calc(100%-0px)] overflow-auto rounded-md overflow-x-auto">
                        <Table
                            highlightOnHover
                            className={tableWidthClass}
                            classNames={{
                                table: TableModule.tableTable,
                                thead: TableModule.theadTable,
                                th: TableModule.thTable,
                                tr: TableModule.trTable,
                                td: TableModule.tdTable,
                                caption: TableModule.captionTable,
                            }}
                        >
                            <Table.Thead className="sticky top-0 z-10">
                                <Table.Tr>
                                    <Table.Th style={{ width: isSmDown ? 48 : 64 }}>#</Table.Th>
                                    <Table.Th>Profissional</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>{tableRows}</Table.Tbody>
                        </Table>
                        <div ref={sentinelRef} style={{ height: 8, width: '100%' }} />
                    </div>
                </Container>

                {isLoadingMore && (
                    <Text size="sm" ta="center" mt="sm" c="dimmed">
                        Carregando mais pessoas...
                    </Text>
                )}
            </div>

            <InfoDrawer
                opened={openedDrawer}
                onClose={() => setOpenedDrawer(false)}
                size={drawerSize}
                overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
                classNames={{ root: DrawerModule.rootDrawer, header: DrawerModule.headerDrawer, body: DrawerModule.bodyDrawer, content: DrawerModule.contentDrawer }}
                title={
                    <Title
                        order={2}
                        className="font-bold text-shadow-lg/20 text-(--colorTextWhite) uppercase tracking-(--title-letter-spacing)"
                        style={{ fontSize: 28, fontFamily: 'var(--text-font-mono)' }}
                    >
                        {getDisplayName(selectedPerson)}
                    </Title>
                }
                content={selectedPerson && (
                    <>
                        <Box>
                            <Image
                                src={selectedPersonFull?.images?.jpg?.large_image_url || selectedPerson?.images?.jpg?.image_url}
                                radius="md"
                                h={portraitHeight}
                                w="auto"
                                className="mb-4 flex items-center justify-center justify-self-center shadow-lg/40"
                                alt={getDisplayName(selectedPerson)}
                            />

                            <Space h="md" />

                            <Box>
                                <Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>
                                    Nome completo:
                                </Text>
                                <Text component="span" style={{ color: 'var(--colorTextWhite)' }}>
                                    {selectedPersonFull?.given_name || selectedPerson?.given_name || '-'} {selectedPersonFull?.family_name || selectedPerson?.family_name || ''}
                                </Text>
                            </Box>

                            <Space h="sm" />

                            <Box>
                                <Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>
                                    Data de nascimento:
                                </Text>
                                <Text component="span" style={{ color: 'var(--colorTextWhite)' }}>
                                    {formatDate(selectedPersonFull?.birthday ?? selectedPerson?.birthday)}
                                </Text>
                            </Box>

                            <Space h="sm" />

                            <Box>
                                <Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>
                                    Favoritos:
                                </Text>
                                <Text component="span" style={{ color: 'var(--colorTextWhite)' }}>
                                    {formatNumber(selectedPersonFull?.favorites ?? selectedPerson?.favorites)}
                                </Text>
                            </Box>

                            {alternateNames && alternateNames.length > 0 && (
                                <>
                                    <Space h="sm" />
                                    <Box>
                                        <Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>
                                            Também conhecido(a) como:
                                        </Text>
                                        <Text component="span" style={{ color: 'var(--colorTextWhite)' }}>
                                            {alternateNames.join(', ')}
                                        </Text>
                                    </Box>
                                </>
                            )}

                            <Space h="lg" />

                            <Divider
                                my="xl"
                                label={
                                    <Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>
                                        Biografia
                                    </Text>
                                }
                                labelPosition="center"
                            />

                            {translatedAbout === null && selectedPersonFull?.about ? (
                                <LoaderBox message="Traduzindo biografia..." />
                            ) : (
                                <Text style={{ color: 'var(--colorTextWhite)' }}>
                                    {translatedAbout ?? selectedPersonFull?.about ?? 'Biografia não informada.'}
                                </Text>
                            )}
                        </Box>

                        {Array.isArray(selectedPersonFull?.anime) && selectedPersonFull.anime.length > 0 && (
                            <>
                                <Divider
                                    my="xl"
                                    label={<Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>Participações em Anime</Text>}
                                    labelPosition="center"
                                />
                                <Pill.Group className="flex flex-wrap gap-2">
                                    {selectedPersonFull.anime.slice(0, 30).map((entry, index) => {
                                        const title = entry.anime?.title ?? '-';
                                        const info = animeHoverCache[title];
                                        return (
                                            <HoverCard
                                                key={`anime-${index}`}
                                                width={340}
                                                shadow="md"
                                                withinPortal
                                                openDelay={250}
                                                closeDelay={100}
                                                classNames={{ dropdown: HoverCardModule.dropdownHoverCard }}
                                            >
                                                <HoverCard.Target>
                                                    <Pill
                                                        size="sm"
                                                        radius="xl"
                                                        className={MultiSelectModule.pillMultiSelect}
                                                        style={{ color: 'var(--colorTextWhite)', cursor: 'pointer' }}
                                                        onMouseEnter={() => ensureAnimeHoverInfo(title)}
                                                    >
                                                        {title}
                                                        {entry.positions && entry.positions.length > 0 ? ` — ${entry.positions.join(', ')}` : ''}
                                                    </Pill>
                                                </HoverCard.Target>
                                                <HoverCard.Dropdown>
                                                    {!info || info.status === 'loading' ? (
                                                        <Text size="sm" className={HoverCardModule.metaHoverCard}>Carregando informações...</Text>
                                                    ) : info.status === 'error' || !info.data ? (
                                                        <Text size="sm" className={HoverCardModule.metaHoverCard}>Não foi possível obter informações.</Text>
                                                    ) : (
                                                        <div className="flex gap-3 items-start">
                                                            <Image src={info.data.images?.jpg?.image_url} w={72} h={96} radius="sm" alt={info.data.title} />
                                                            <div className="min-w-0">
                                                                <Text className={HoverCardModule.titleHoverCard}>{info.data.title}</Text>
                                                                <Text size="sm" className={HoverCardModule.metaHoverCard}>Score: {formatNumber(info.data.score)}</Text>
                                                                <Text size="sm" className={HoverCardModule.metaHoverCard}>Episódios: {formatNumber((info.data as any).episodes)}</Text>
                                                                <Text size="sm" className={HoverCardModule.metaHoverCard}>Status: {(info.data as any).status}</Text>
                                                            </div>
                                                        </div>
                                                    )}
                                                </HoverCard.Dropdown>
                                            </HoverCard>
                                        );
                                    })}
                                </Pill.Group>
                            </>
                        )}

                        {Array.isArray(selectedPersonFull?.manga) && selectedPersonFull.manga.length > 0 && (
                            <>
                                <Divider
                                    my="xl"
                                    label={<Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>Participações em Mangá</Text>}
                                    labelPosition="center"
                                />
                                <Pill.Group className="flex flex-wrap gap-2">
                                    {selectedPersonFull.manga.slice(0, 30).map((entry, index) => (
                                        <Pill key={`manga-${index}`} size="sm" radius="xl" className={MultiSelectModule.pillMultiSelect} style={{ color: 'var(--colorTextWhite)' }}>
                                            {entry.manga?.title ?? '-'}
                                            {entry.positions && entry.positions.length > 0 ? ` — ${entry.positions.join(', ')}` : ''}
                                        </Pill>
                                    ))}
                                </Pill.Group>
                            </>
                        )}

                        {voiceCharacterRows.length > 0 && (
                            <>
                                <Divider
                                    my="xl"
                                    label={<Text component="span" className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>Personagens Dublados</Text>}
                                    labelPosition="center"
                                />
                                {voiceCharacterRows.map((row, rowIndex) => (
                                    <Grid key={`voice-row-${rowIndex}`} gutter={isSmDown ? 'sm' : 'md'} mb="md">
                                        {row.map((voiceEntry, colIndex) => {
                                                const character = voiceEntry.character as VoiceCharacterWithFavorites | null | undefined;
                                                const characterImages = character?.images ?? undefined;
                                                const imageUrl = characterImages?.jpg?.image_url ?? characterImages?.webp?.image_url ?? '';
                                                const characterName = character?.name ?? 'Personagem desconhecido';
                                                const favorites = typeof character?.favorites === 'number' ? character.favorites : null;
                                                const role = voiceEntry.role ?? null;
                                                const language = voiceEntry.language ?? null;
                                                const animeTitle = voiceEntry.anime?.title ?? null;

                                                return (
                                                <Grid.Col span={isSmDown ? 12 : 6} key={`voice-${rowIndex}-${colIndex}`}>
                                                    <Group align="flex-start" gap={isSmDown ? 'sm' : 'md'} wrap={isSmDown ? 'wrap' : 'nowrap'}>
                                                        {imageUrl ? (
                                                            <Image
                                                                src={imageUrl}
                                                                radius="md"
                                                                h={isSmDown ? 96 : 120}
                                                                w={isSmDown ? 64 : 80}
                                                                alt={characterName}
                                                            />
                                                        ) : (
                                                            <Box
                                                                w={isSmDown ? 64 : 80}
                                                                h={isSmDown ? 96 : 120}
                                                                className="flex items-center justify-center bg-white/5 border border-white/10"
                                                                style={{ borderRadius: 12 }}
                                                            >
                                                                <Text size="xs" ta="center" c="dimmed">
                                                                    Sem imagem
                                                                </Text>
                                                            </Box>
                                                        )}
                                                        <Box className="flex flex-col gap-1 min-w-0" style={{ flex: 1 }}>
                                                            <Text style={{ color: 'var(--colorTextWhite)', fontWeight: 600, fontSize: isSmDown ? 14 : undefined, wordBreak: 'break-word' }}>
                                                                {characterName}
                                                            </Text>
                                                            {role && (
                                                                <Text size={isSmDown ? 'xs' : 'sm'} c="dimmed">
                                                                    Função: {role}
                                                                </Text>
                                                            )}
                                                            {favorites !== null && (
                                                                <Text size={isSmDown ? 'xs' : 'sm'} c="dimmed">
                                                                    Favoritos: {formatNumber(favorites)}
                                                                </Text>
                                                            )}
                                                            {language && (
                                                                <Text size={isSmDown ? 'xs' : 'sm'} c="dimmed">
                                                                    Idioma: {language}
                                                                </Text>
                                                            )}
                                                            {animeTitle && (
                                                                <Text size={isSmDown ? 'xs' : 'sm'} c="dimmed" lineClamp={2}>
                                                                    Anime: {animeTitle}
                                                                </Text>
                                                            )}
                                                        </Box>
                                                    </Group>
                                                </Grid.Col>
                                            );
                                        })}
                                    </Grid>
                                ))}
                                {hasMoreVoiceCharacters && (
                                    <Group justify="center" mt="md">
                                        <Button
                                            variant="transparent"
                                            onClick={handleShowMoreVoiceCharacters}
                                            classNames={{ root: ButtonModule.rootButton2 }}
                                        >
                                            Mostrar mais {nextVoiceCharactersIncrement} personagens
                                        </Button>
                                    </Group>
                                )}
                            </>
                        )}
                    </>
                )}
            />
        </BackgroundImage>
    );
};

export default SearchScreenPeople;
