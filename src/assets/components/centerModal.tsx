import React from 'react';
import { Modal } from '@mantine/core';

type Props = {
    opened: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
};

const CenteredModal: React.FC<Props> = ({ opened, onClose, children, title, size = 'md' }) => {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={title}
            size={size}
            centered
        >
            {children}
        </Modal>
    );
};

export default CenteredModal;