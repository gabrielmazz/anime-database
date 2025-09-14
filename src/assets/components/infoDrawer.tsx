import React from 'react';
import { Drawer } from '@mantine/core';

type DrawerClassNames = Partial<{
	root: string;
	header: string;
	body: string;
	content: string;
}>;

type Props = {
	opened: boolean;
	onClose: () => void;
	title?: React.ReactNode;
	position?: 'left' | 'right' | 'top' | 'bottom';
	size?: string | number;
	radius?: string | number;
	overlayProps?: any;
	classNames?: DrawerClassNames;
	content: React.ReactNode;
};

// Componente Drawer genérico para reuso. Recebe o conteúdo via prop `content`.
const InfoDrawer: React.FC<Props> = ({
	opened,
	onClose,
	title,
	position = 'right',
	size = '35%',
	radius = 'md',
	overlayProps = { backgroundOpacity: 0.5, blur: 4 },
	classNames,
	content,
}) => {
	return (
		<Drawer
			opened={opened}
			onClose={onClose}
			title={title}
			position={position}
			size={size}
			radius={radius}
			overlayProps={overlayProps}
			classNames={classNames}
		>
			{content}
		</Drawer>
	);
};

export default InfoDrawer;

