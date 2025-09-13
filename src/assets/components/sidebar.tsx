import React, { useMemo, useState } from 'react';
import { Space, Text } from '@mantine/core';
import CenteredModal from './centerModal';
import LogoBaseboard from './logoBaseboard';

type Item = {
	key: string;
	label: string;
	icon: React.ReactNode;
	link: string;
};

// Pequenos ícones SVG inline (sem dependências externas)
const HomeIcon = (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
		<polyline points="9 22 9 12 15 12 15 22" />
	</svg>
);

const SearchIcon = (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<circle cx="11" cy="11" r="8" />
		<line x1="21" y1="21" x2="16.65" y2="16.65" />
	</svg>
);


const IconChevron = ({ dir }: { dir: 'left' | 'right' }) => (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		{dir === 'left' ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
	</svg>
);

const SocialTwitter = (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
		<path d="M22 5.92c-.77.34-1.6.57-2.46.67a4.21 4.21 0 0 0 1.85-2.33 8.36 8.36 0 0 1-2.66 1.02 4.18 4.18 0 0 0-7.12 3.81A11.87 11.87 0 0 1 3.16 4.6a4.17 4.17 0 0 0 1.29 5.58 4.17 4.17 0 0 1-1.9-.52v.05a4.18 4.18 0 0 0 3.35 4.1 4.22 4.22 0 0 1-1.89.07 4.18 4.18 0 0 0 3.9 2.9A8.38 8.38 0 0 1 2 19.54a11.83 11.83 0 0 0 6.41 1.88c7.69 0 11.89-6.37 11.89-11.89 0-.18-.01-.36-.02-.54A8.5 8.5 0 0 0 22 5.92Z" />
	</svg>
);

const SocialDiscord = (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
		<path d="M20 4a16.1 16.1 0 0 0-4 .99c-.37-.22-.79-.37-1.24-.45A12.6 12.6 0 0 0 12 4c-.87 0-1.73.09-2.56.27-.45.08-.87.23-1.24.45A16.1 16.1 0 0 0 4 4C2.35 6.6 1.75 9.46 2 12.3c.57 2.57 2.8 4.5 5.44 5.15.42-.56.78-1.16 1.08-1.8-.59-.22-1.15-.5-1.68-.83.11-.08.22-.17.32-.26 1.2.56 2.52.86 3.85.86s2.65-.3 3.85-.86c.11.09.21.18.32.26-.53.33-1.09.61-1.68.83.3.64.66 1.24 1.08 1.8 2.64-.65 4.87-2.58 5.44-5.15.3-2.84-.35-5.7-2-8.3ZM9.25 12.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm5.5 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z" />
	</svg>
);

const SocialGithub = (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
		<path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.69c-2.78.6-3.37-1.2-3.37-1.2-.45-1.15-1.1-1.46-1.1-1.46-.9-.61.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.33 1.08 2.9.83.09-.64.35-1.08.64-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.69.92.69 1.86v2.76c0 .26.18.58.69.48A10 10 0 0 0 12 2Z" />
	</svg>
);

const InformationIcon = (
	<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<circle cx="12" cy="12" r="10" />
		<line x1="12" y1="16" x2="12" y2="12" />
		<line x1="12" y1="8" x2="12.01" y2="8" />
	</svg>
);

const Sidebar: React.FC = () => {
	const [collapsed, setCollapsed] = useState<boolean>(true);
	const [active, setActive] = useState<string>('dashboard');
	const [aboutOpen, setAboutOpen] = useState<boolean>(false);

	const items: Item[] = useMemo(() => ([
		{ key: 'home', label: 'Inicio', icon: HomeIcon, link: '/selectionScreen' },
		{ key: 'search', label: 'Buscar Anime', icon: SearchIcon, link: '/searchScreen' },
	]), []);

	const widthClass = collapsed ? 'w-16' : 'w-64';

	return (
		<aside
			className={`fixed left-6 top-1/2 -translate-y-1/2 ${widthClass} h-[80vh] 
      rounded-3xl border backdrop-blur-md shadow-xl z-20 flex flex-col overflow-hidden 
      transition-all duration-300 ease-out`}
			style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}
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
				<button
					aria-label="Collapse sidebar"
					className="ml-auto inline-flex items-center justify-center w-8 h-8 rounded-xl hover:bg-white/10 text-(--color1)"
					onClick={() => setCollapsed((v) => !v)}
				>
					<IconChevron dir={collapsed ? 'right' : 'left'} />
				</button>
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

								// Navegação simples sem react-router
								e.preventDefault();
								window.location.href = it.link;

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
							className="flex flex-col gap-1.5 p-1.5 backdrop-blur-sm mb-1"
							style={{ color: 'var(--color1)' }}
						>
							{[
								{ key: 'twitter', icon: SocialTwitter, label: 'Abrir Twitter/X', onClick: () => window.open('https://x.com', '_blank', 'noopener,noreferrer') },
								{ key: 'discord', icon: SocialDiscord, label: 'Abrir Discord', onClick: () => window.open('https://discord.com', '_blank', 'noopener,noreferrer') },
								{ key: 'github', icon: SocialGithub, label: 'Abrir GitHub', onClick: () => window.open('https://github.com', '_blank', 'noopener,noreferrer') },
								{ key: 'info', icon: InformationIcon, label: 'Sobre o projeto', onClick: () => setAboutOpen(true) },
							].map((btn) => (
								<button
									key={btn.key}
									aria-label={btn.label}
									title={btn.label}
									className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition"
									onClick={btn.onClick}
								>
									{btn.icon}
								</button>
							))}
						</div>
					) : (
						<div className="flex gap-2">
							{[
								{ key: 'twitter', icon: SocialTwitter, label: 'Abrir Twitter/X', onClick: () => window.open('https://x.com', '_blank', 'noopener,noreferrer') },
								{ key: 'discord', icon: SocialDiscord, label: 'Abrir Discord', onClick: () => window.open('https://discord.com', '_blank', 'noopener,noreferrer') },
								{ key: 'github', icon: SocialGithub, label: 'Abrir GitHub', onClick: () => window.open('https://github.com', '_blank', 'noopener,noreferrer') },
								{ key: 'info', icon: InformationIcon, label: 'Sobre o projeto', onClick: () => setAboutOpen(true) },
							].map((btn) => (
								<button
									key={btn.key}
									aria-label={btn.label}
									title={btn.label}
									className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition"
									style={{ color: 'var(--color1)' }}
									onClick={btn.onClick}
								>
									{btn.icon}
								</button>
							))}
						</div>
					)}

					{!collapsed && (
						<button
							className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20"
							style={{ color: 'var(--color1)' }}
							onClick={() => setCollapsed((v) => !v)}
						>
							<IconChevron dir={collapsed ? 'right' : 'left'} />
						</button>
					)}
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
		</aside>
	);
};

export default Sidebar;
