import React from 'react';
import { Overlay, Loader, Text } from '@mantine/core';

type Props = {
    visible: boolean;
    message?: string;
};

const LoadingOverlayFullscreen: React.FC<Props> = ({ visible, message }) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[1000]">
            <Overlay opacity={0.55} color="#000" blur={2} />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader color="var(--color1)" size="lg" type="bars" />
                    {message && (
                        <Text style={{ color: 'var(--color1)' }}>{message}</Text>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlayFullscreen;

