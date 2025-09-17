import React, { useEffect, useMemo, useRef, useState } from 'react';

// UI base e layout
import { BackgroundImage, Box, Container, Group, Image, Space, Table, Text, Title } from '@mantine/core';
import InfoDrawer from '../assets/components/infoDrawer.tsx';
import DrawerModule from '../assets/inputInfos/Drawer.module.css';
import LoaderBox from '../assets/components/loaderBox.tsx';
import AlertBox from '../assets/components/alert.tsx';

// Componentes compartilhados
import Sidebar from '../assets/components/sidebar.tsx';
import LoadingOverlayFullscreen from '../assets/components/overlay.tsx';

// Tema dinâmico
import { applyPaletteToCssVariables, extractPaletteFromImage } from '../utils/palette';
import { getRandomWallpaper } from '../utils/wallpaper';

// APIs
import { getTopAnime, type Anime } from '../assets/API/jikan';
import { useSettings } from '../state/settings';

// Estilos da Tabela no padrão do projeto
import TableModule from '../assets/inputInfos/Table.module.css';

function formatNumber(n?: number | null) {
  if (typeof n !== 'number') return '-';
  try { return new Intl.NumberFormat('pt-BR').format(n); } catch { return String(n); }
}

const TopAnimesScreen: React.FC = () => {
  const [wallpaper, setWallpaper] = useState<string>(() => getRandomWallpaper('topAnimes'));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rows, setRows] = useState<Anime[]>([]);
  const { apiModalEnabled, setLastApiPayload, setLastSearchPayload, animesPageLimit } = useSettings();
  const [page, setPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [openedInfo, setOpenedInfo] = useState<boolean>(false);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);

  // Alertas (suave) para feedback de requisições
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<'info' | 'warning' | 'error' | 'success'>('info');

  // Aplica paleta baseada no wallpaper
  useEffect(() => {
    if (!wallpaper) return;
    extractPaletteFromImage(wallpaper)
      .then(applyPaletteToCssVariables)
      .catch(() => { /* ignora erros silenciosamente */ });
  }, [wallpaper]);

  // Carrega Top Animes no primeiro render e quando o limite muda
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      try {
        const r = await getTopAnime(1, animesPageLimit);
        if (apiModalEnabled) {
          const payload = { endpoint: 'getTopAnime', page: 1, limit: animesPageLimit, response: r };
          setLastApiPayload(payload);
          setLastSearchPayload(payload);
        }
        if (!cancelled) {
          setRows(r.data ?? []);
          setPage(1);
          setHasMore(((r as any)?.data?.length ?? 0) >= animesPageLimit);
        }
        setAlertType('success');
        setAlertMessage(`Top Animes carregado (${(r as any)?.data?.length ?? 0} itens)`);
        setAlertVisible(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [animesPageLimit]);

  // Auto esconde o alerta após alguns segundos
  useEffect(() => {
    if (!alertVisible) return;
    const id = window.setTimeout(() => setAlertVisible(false), 2500);
    return () => window.clearTimeout(id);
  }, [alertVisible]);

  // Observa o fim da lista para carregar mais itens
  useEffect(() => {
    if (!scrollRef.current || !sentinelRef.current) return;
    const root = scrollRef.current;
    const sentinel = sentinelRef.current;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting) return;
      if (isLoadingMore || !hasMore) return;

      const nextPage = page + 1;
      setIsLoadingMore(true);
      const loadMore = async () => {
        try {
          const r2 = await getTopAnime(nextPage, animesPageLimit);
          if (apiModalEnabled) {
            const payload = { endpoint: 'getTopAnime', page: nextPage, limit: animesPageLimit, response: r2 };
            setLastApiPayload(payload);
            setLastSearchPayload(payload);
          }
          const count = (r2 as any)?.data?.length ?? 0;
          setRows((prev) => [...prev, ...(r2.data ?? [])]);
          setAlertType('success');
          setAlertMessage(`Mais ${count} animes carregados — pág. ${nextPage}`);
          setAlertVisible(true);
          setPage(nextPage);
          setHasMore(count >= animesPageLimit);
        } catch { }
        finally {
          setIsLoadingMore(false);
        }
      };
      loadMore();
    }, { root, rootMargin: '0px 0px 200px 0px', threshold: 0.05 });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [page, rows, apiModalEnabled, hasMore, isLoadingMore, animesPageLimit]);

  const tableRows = useMemo(() => {
    return rows.map((a, idx) => (
      <Table.Tr
        key={a.mal_id}
        className={TableModule.trTable}
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setSelectedAnime(a);
          setOpenedInfo(true);
        }}
      >
        <Table.Td className={TableModule.tdTable} width={64}>
          <Text style={{ color: 'var(--color1)', fontWeight: 700 }}>{idx + 1}</Text>
        </Table.Td>
        <Table.Td className={TableModule.tdTable}>
          <Group wrap="nowrap" gap="sm" align="center">
            <Image src={a.images?.jpg?.image_url} w={56} h={56} radius="sm" fit="cover" alt={a.title} />
            <Box>
              <Text style={{ color: 'var(--colorTextWhite)' }}>{a.title}</Text>
              <Text size="xs" c="dimmed">ID: {a.mal_id}</Text>
            </Box>
          </Group>
        </Table.Td>
        <Table.Td className={TableModule.tdTable} style={{ textAlign: 'right' }}>
          <Text style={{ color: 'var(--colorTextWhite)' }}>{formatNumber(a.score)}</Text>
        </Table.Td>
      </Table.Tr>
    ));
  }, [rows]);

  return (
    <>
      <BackgroundImage
        src={wallpaper}
        className="relative text-white w-full min-h-screen bg-cover bg-no-repeat bg-center bg-fixed"
      >
        {/* Overlay escurecedor */}
        <div className="absolute inset-0 bg-black/60 pointer-events-none" />

        {/* Alert + Loading overlay */}
        <AlertBox visible={alertVisible} message={alertMessage} type={alertType} />
        <LoadingOverlayFullscreen visible={isLoading} message={'Carregando ranking de animes...'} />

        {/* Sidebar */}
        <Sidebar />

        {/* Conteúdo principal */}
        <div
          className="
          relative z-10 w-full min-h-screen
          max-w-[92vw] 2xl:max-w-[1900px] mx-auto align-top
          px-4 sm:px-6 lg:px-12
        "
        >
          <Title
            className="
              flex justify-center pt-6
              text-shadow-lg/20 text-(--color1)
              uppercase tracking-(--title-letter-spacing)
              text-[clamp(24px,4vw,42px)]
            "
            style={{ fontFamily: 'var(--text-font-mono)' }}
          >
            Animes — Top
          </Title>

          <Space h="md" />

          <Container
            fluid
            className="
              bg-black/40 rounded-lg backdrop-blur-sm border border-white/20 shadow-lg
              w-full max-w-none mx-auto
              p-4 sm:p-6 md:p-8
              mt-12 mb-0
              h-[80vh] overflow-hidden
            "
          >
            <div ref={scrollRef} className="h-[calc(100%-0px)] overflow-auto rounded-md">
              <Table
                highlightOnHover
                classNames={{
                  table: TableModule.tableTable,
                  thead: TableModule.theadTable,
                  th: TableModule.thTable,
                  tr: TableModule.trTable,
                  td: TableModule.tdTable,
                  caption: TableModule.captionTable,
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th style={{ width: 64 }}>Rank</Table.Th>
                    <Table.Th>Anime</Table.Th>
                    <Table.Th style={{ width: 140, textAlign: 'right' }}>Score</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {tableRows}
                </Table.Tbody>
              </Table>
              <div ref={sentinelRef} style={{ height: 8, width: '100%' }} />
            </div>
          </Container>
        </div>
      </BackgroundImage>

      {/* Drawer de informações do anime */}
      <InfoDrawer
        opened={openedInfo}
        onClose={() => { setOpenedInfo(false); setSelectedAnime(null); }}
        title={
          <Title
            order={2}
            className="font-bold text-shadow-lg/20 text-(--colorTextWhite) uppercase tracking-(--title-letter-spacing)"
            style={{ fontSize: 32, fontFamily: 'var(--text-font-mono)' }}
          >
            Informações do Anime
          </Title>
        }
        position="right"
        size="40%"
        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
        classNames={{ root: DrawerModule.rootDrawer, header: DrawerModule.headerDrawer, body: DrawerModule.bodyDrawer }}
        content={selectedAnime && (
          <>
            <Box>
              <Image src={selectedAnime.images?.jpg?.image_url} radius="md" h={300} w="auto" className="mb-4" />
              <Title size="xl" className="font-bold text-center text-shadow-lg/20 text-(--colorTextWhite) uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 28, fontFamily: 'var(--text-font-mono)' }}>
                {selectedAnime.title}
              </Title>
              <Space h="md" />
              <Text style={{ color: 'var(--colorTextWhite)' }}>Score: {formatNumber(selectedAnime.score)} • Episódios: {formatNumber(selectedAnime.episodes)}</Text>
              <Text style={{ color: 'var(--colorTextWhite)' }}>Status: {selectedAnime.status}</Text>
            </Box>

            <Space h="lg" />

            {selectedAnime?.synopsis && (
              <Box>
                <Text className="font-bold uppercase tracking-(--title-letter-spacing)" style={{ fontSize: 16, fontFamily: 'Raleway, sans-serif', color: 'var(--colorTextWhite)', marginRight: 6 }}>Sinopse:</Text>
                <Text style={{ color: 'var(--colorTextWhite)' }}>{selectedAnime.synopsis}</Text>
              </Box>
            )}

            {!selectedAnime?.synopsis && (
              <LoaderBox message="Sem detalhes adicionais do anime." />
            )}
          </>
        )}
      />
    </>
  );
};

export default TopAnimesScreen;

