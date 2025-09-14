import React from 'react';
import { Modal } from '@mantine/core';

// Importando o CSS module
import CenterModule from '../inputInfos/CenterModal.module.css';

type Props = {
    opened: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    radius?: string | number;
};

const CenteredModal: React.FC<Props> = ({ opened, onClose, children, title, size = 'md', radius = 'md' }) => {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={title}
            size={size}
            radius={radius}
            centered
            classNames={{
                root: CenterModule.rootCenterModal,
                content: CenterModule.contentCenterModal,
                header: CenterModule.headerCenterModal,
                title: CenterModule.titleCenterModal,
            }}
        >
            {children}
        </Modal>
    );
};

export default CenteredModal;