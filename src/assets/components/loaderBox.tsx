import React from 'react';
import { Loader, Text } from '@mantine/core';

type Props = {
    message?: string;
};

// Componente de loader para regiões específicas da tela, com mensagem opcional
const LoaderBox: React.FC<Props> = ({ message }) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <Loader color="var(--color1)" size="lg" type="bars" />
            {message && (
                <Text style={{ color: 'var(--color1)' }}>{message}</Text>
            )}
        </div>
    );
}

export default LoaderBox;