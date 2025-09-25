import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Space, Text, Title } from '@mantine/core';
import CenteredModal from './centerModal';
import LogoBaseboard from './logoBaseboard';
import InfoDrawer from './infoDrawer';
import DrawerModule from '../inputInfos/Drawer.module.css';
import { useSettings } from '../../state/settings';

// Importação dos componentes de Input
import { JsonInput } from '@mantine/core';
import JsonInputModule from './../inputInfos/JsonInput.module.css';

import { ActionIcon } from '@mantine/core';
import ActionIconModule from '../inputInfos/ActionIcon.module.css';

import { Tooltip } from '@mantine/core';
import TooltipModule from '../inputInfos/Tooltip.module.css';

// Importação dos icones do React-icons
import { FaGithub, FaCalendarAlt } from "react-icons/fa";
import { FaInfo } from "react-icons/fa6";
import { FaHome } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { GrConfigure } from "react-icons/gr";
import { FaTv, FaTrophy } from "react-icons/fa";
import { MdMenuBook } from "react-icons/md";
import { FaCubes } from "react-icons/fa";
import { IoAccessibilityOutline } from "react-icons/io5";

type Item = {
	key: string;
	label: string;
	icon: React.ReactNode;
	link: string;
};

const IconChevron = ({ dir }: { dir: 'left' | 'right' }) => (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		{dir === 'left' ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
	</svg>
);

const IconHamburger = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const IconClose = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);


const Sidebar: React.FC = () => {
	const navigate = useNavigate();
	const [collapsed, setCollapsed] = useState<boolean>(true);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [active, setActive] = useState<string>('dashboard');
	const [aboutOpen, setAboutOpen] = useState<boolean>(false);
	const [debugOpen, setDebugOpen] = useState<boolean>(false);
	const { devModeEnabled, lastApiPayload: _lastApiPayload, lastSearchPayload, lastPicturesPayload, lastCharactersPayload, lastTopCharactersPayload, lastCharactersSearchPayload } = useSettings();

    const items: Item[] = useMemo(() => ([
        { key: 'intro', label: 'Introdução', icon: <FaCubes />, link: '/introScreen' },
        { key: 'home', label: 'Inicio', icon: <FaHome />, link: '/selectionScreen' },
        { key: 'search', label: 'Buscar Anime', icon: <FaTv />, link: '/searchScreen' },
        { key: 'searchManga', label: 'Buscar Manga', icon: <MdMenuBook />, link: '/searchScreenManga' },
        { key: 'seasons', label: 'Explorar Temporadas', icon: <FaCalendarAlt />, link: '/seasonScreen' },
        { key: 'searchCharacters', label: 'Buscar Personagem', icon: <IoSearch />, link: '/searchScreenCharacters' },
        { key: 'searchProducers', label: 'Buscar Produtores', icon: <IoAccessibilityOutline />, link: '/searchScreenProducers' },
        { key: 'topAnimes', label: 'Top Animes', icon: <FaTrophy />, link: '/topAnimesScreen' },
        { key: 'debug', label: 'Debug', icon: <GrConfigure />, link: '/devConfigurationsScreen' },
    ]), []);

	const widthClass = collapsed ? 'w-16' : 'w-64';

	return (
		<>
			{/* Botão Hambúrguer */}
			{!isOpen && (
				<>
					<button
						aria-label="Abrir menu"
						aria-expanded={isOpen}
						className="fixed left-4 top-4 z-30 inline-flex lg:hidden h-10 w-10 items-center justify-center rounded-md
							bg-black/50 border border-white/20 text-[var(--color1)] backdrop-blur-md hover:bg-black/60 transition"
						onClick={() => { setCollapsed(true); setIsOpen(true); }}
					>
						<IconHamburger />
					</button>

					{/* Botão seta para abrir já expandida */}
					<button
						aria-label="Abrir menu expandido"
						className="fixed left-4 top-4 z-30 hidden lg:inline-flex h-10 w-10 items-center justify-center rounded-md
							bg-black/50 border border-white/20 text-[var(--color1)] backdrop-blur-md hover:bg-black/60 transition"
						onClick={() => { setCollapsed(false); setIsOpen(true); }}
						title="Abrir menu expandido"
					>
						<IconChevron dir="right" />
					</button>
				</>
			)}

			{/* Overlay */}
			<div
				className={`fixed inset-0 z-20 bg-black/40 backdrop-blur-[4px] transition-opacity ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
				onClick={() => { setIsOpen(false); setCollapsed(false); }}
			/>

			<aside
				className={`fixed left-0 top-0 ${widthClass} h-screen rounded-r-xl z-30 flex flex-col overflow-hidden
						bg-black/40 backdrop-blur-md border border-white/20 shadow-xl
						transition-all duration-300 ease-in-out
						${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
				style={{ willChange: 'width, transform' }}
			>

				{/* Header */}
				<div
					className="
					px-4 pt-4 pb-2 
					flex items-center justify-between 
					uppercase
					tracking-(--title-letter-spacing)
				"
				>
					{!collapsed && (
						<Text style={{ color: 'var(--color1)', fontWeight: 700 }}>AniDex</Text>
					)}
					<div className="ml-auto flex items-center gap-2">
						{/* Fechar Drawer */}
						<button
							aria-label="Fechar menu"
							className="inline-flex items-center justify-center w-8 h-8 rounded-xl hover:bg-white/10 text-(--color1)"
							onClick={() => { setIsOpen(false); setCollapsed(false); }}
						>
							<IconClose />
						</button>
						{/* Colapsar largura */}
						<button
							aria-label="Alternar largura"
							className="inline-flex items-center justify-center w-8 h-8 rounded-xl hover:bg-white/10 text-(--color1) transition-transform duration-300 ease-in-out active:scale-95"
							onClick={() => setCollapsed((v) => !v)}
						>
							<span className={`inline-block transition-transform duration-300 ${collapsed ? 'rotate-180' : 'rotate-0'}`}>
								<IconChevron dir={collapsed ? 'right' : 'left'} />
							</span>
						</button>
					</div>
				</div>

				{/* Items */}
				<nav className="flex-1 px-3 space-y-2 overflow-y-auto">
					{items.map((it) => {
						const isActive = it.key === active;
						return (
							<button
								onClick={() => setActive(it.key)}
								className={`group w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start'} gap-3 
										rounded-2xl px-3 py-2 border transition-colors 
										${isActive ? 'border-[var(--panel-border)]' : 'border-transparent'} 
										hover:border-[var(--panel-border)] text-(--color1)`}
								onClickCapture={(e) => {
									// Navegação usando React Router
									e.preventDefault();
									navigate(it.link);
								}}
								style={{
									// um leve gradiente para o ativo
									background: isActive ? 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))' : 'transparent'
								}}
							>
								<span
									className="shrink-0 inline-flex items-center justify-center h-5 w-5 align-middle"
									style={{ color: 'var(--accent)' }}
								>
									{it.icon}
								</span>

								{!collapsed && (
									<span
										className="text-sm uppercase tracking-(--title-letter-spacing) leading-none h-5 flex items-center"
										style={
											{
												color: 'var(--color1)',
												fontSize: '12px',
												fontFamily: 'Raleway, sans-serif',
											}
										}
									>
										{it.label}
									</span>
								)}
							</button>
						);
					})}
				</nav>

				{/* Footer / Social */}
				<div className="px-3 pb-5 mt-auto">
					<div className={`flex ${collapsed ? 'justify-center' : 'justify-between'} items-end`}>
						{collapsed ? (
							// Modo compacto: ícones empilhados em um "dock" elegante
							<div
								className="flex flex-col gap-1.5 p-1.5 sm mb-1"
							>
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
							</div>
						) : (
							<div className="flex gap-2">
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
							</div>
						)}
					</div>
				</div>

			</aside>

			{/* Botão flutuante de DEV (aparece apenas com Dev Mode) */}
			{devModeEnabled && (
				<button
					className="
						fixed left-6 bottom-6 z-20 px-3 py-2 rounded-xl 
						border text-sm uppercase tracking-(--title-letter-spacing)
						shadow-lg backdrop-blur-sm hover:brightness-110 transition
						bg-black/40 border-white/20 text-(--color1)
					"
					style={{
						color: 'var(--color1)'
					}}
					onClick={() => setDebugOpen(true)}
					title="Abrir Drawer de Debug"
				>
					Debug JSON
				</button>
			)}

			<CenteredModal
				opened={aboutOpen}
				onClose={() => setAboutOpen(false)}
				title="Sobre o projeto"
				size="md"
				radius="md"
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

			{/* Drawer de Debug */}
			<InfoDrawer
				opened={debugOpen}
				onClose={() => setDebugOpen(false)}
				position="right"
				size="50%"
				radius="md"
				overlayProps={{ backgroundOpacity: 0.35, blur: 2 }}
				classNames={{
					root: DrawerModule.rootDrawer,
					header: DrawerModule.headerDrawer,
					body: DrawerModule.bodyDrawer,
					content: DrawerModule.contentDrawer,
				}}
				title={
					<Title
						order={2}
						className="
							font-bold
							text-shadow-lg/20
							text-(--colorTextWhite)
							uppercase
							tracking-(--title-letter-spacing)
						"
						style={{ fontSize: 32, fontFamily: 'var(--text-font-mono)' }}
					>
						Retorno das APIs
					</Title>

				}
				content={
					<div className="flex flex-col gap-4">
						<JsonInput
							autosize
							minRows={10}
							maxRows={24}
							readOnly
							label={
								<Title
									order={2}
									className="
										font-bold
										text-shadow-lg/20
										text-(--colorTextWhite)
										uppercase
										tracking-(--title-letter-spacing)
									"
									style={{ fontSize: 12, fontFamily: 'var(--text-font-mono)' }}
								>
									Lista de Animes (getTopAnime)
								</Title>
							}
							classNames={{
								root: JsonInputModule.root,
								label: JsonInputModule.label,
								input: JsonInputModule.input,
								error: JsonInputModule.error,
								description: JsonInputModule.description,
								wrapper: JsonInputModule.wrapper,
							}}
							value={lastSearchPayload ? JSON.stringify(lastSearchPayload, null, 2) : '{\n  "info": "Sem dados de busca ainda."\n}'}
						/>

						<JsonInput
							autosize
							minRows={10}
							maxRows={24}
							readOnly
							label="Imagens (getAnimePictures)"
							classNames={{
								root: JsonInputModule.root,
								label: JsonInputModule.label,
								input: JsonInputModule.input,
								error: JsonInputModule.error,
								description: JsonInputModule.description,
								wrapper: JsonInputModule.wrapper,
							}}
							value={lastPicturesPayload ? JSON.stringify(lastPicturesPayload, null, 2) : '{\n  "info": "Sem dados de imagens ainda."\n}'}
						/>

						<JsonInput
							autosize
							minRows={10}
							maxRows={24}
							readOnly
							label="Personagens (getAnimeCharacters)"
							classNames={{
								root: JsonInputModule.root,
								label: JsonInputModule.label,
								input: JsonInputModule.input,
								error: JsonInputModule.error,
								description: JsonInputModule.description,
								wrapper: JsonInputModule.wrapper,
							}}
							value={lastCharactersPayload ? JSON.stringify(lastCharactersPayload, null, 2) : '{\n  "info": "Sem dados de personagens ainda."\n}'}
						/>

						<JsonInput
							autosize
							minRows={10}
							maxRows={24}
							readOnly
							label="Top Personagens (getTopCharacters)"
							classNames={{
								root: JsonInputModule.root,
								label: JsonInputModule.label,
								input: JsonInputModule.input,
								error: JsonInputModule.error,
								description: JsonInputModule.description,
								wrapper: JsonInputModule.wrapper,
							}}
							value={lastTopCharactersPayload ? JSON.stringify(lastTopCharactersPayload, null, 2) : '{\n  "info": "Sem dados de top personagens ainda."\n}'}
						/>

						<JsonInput
							autosize
							minRows={10}
							maxRows={24}
							readOnly
							label="Busca Personagens (characters?q=)"
							classNames={{
								root: JsonInputModule.root,
								label: JsonInputModule.label,
								input: JsonInputModule.input,
								error: JsonInputModule.error,
								description: JsonInputModule.description,
								wrapper: JsonInputModule.wrapper,
							}}
							value={lastCharactersSearchPayload ? JSON.stringify(lastCharactersSearchPayload, null, 2) : '{\n  "info": "Sem dados de busca de personagens ainda."\n}'}
						/>
					</div>
				}
			/>

		</>
	);
};

export default Sidebar;
