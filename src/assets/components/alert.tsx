import React, { useEffect, useState } from 'react';
import { Alert } from '@mantine/core';

type Props = {
    visible: boolean;
    message: string;
    type?: 'info' | 'warning' | 'error' | 'success';
};

// Componente de alerta para exibir mensagens importantes ao usuário
const AlertBox: React.FC<Props> = ({ visible, message, type = 'info' }) => {
    const DURATION = 300; // ms

    // Mantém o componente montado até a animação de saída terminar
    const [shouldRender, setShouldRender] = useState(visible);
    // Fase da animação: 'enter' | 'entered' | 'exit'
    const [phase, setPhase] = useState<'enter' | 'entered' | 'exit'>(visible ? 'enter' : 'exit');

    useEffect(() => {
        if (visible) {
            setShouldRender(true);
            setPhase('enter');
            const id = requestAnimationFrame(() => setPhase('entered'));
            return () => cancelAnimationFrame(id);
        } else {
            setPhase('exit');
            const t = setTimeout(() => setShouldRender(false), DURATION);
            return () => clearTimeout(t);
        }
    }, [visible]);

    if (!shouldRender) return null;

    const base = 'fixed top-4 left-4 z-[1000] w-full max-w-md pr-4 transition-all duration-300 ease-out transform';
    const enterFrom = ' opacity-0 -translate-x-6';
    const enterTo = ' opacity-100 translate-x-0';
    const exitTo = ' opacity-0 -translate-x-6'; // saída: direita -> esquerda
    const cls = base + (phase === 'enter' ? enterFrom : phase === 'entered' ? enterTo : exitTo);

    return (
        <div className={cls}>
            {/* Mapeia tipos semânticos para cores do Mantine */}
            <Alert
                color={typeToColor(type)}
                variant="filled"
                title={typeLabel(type)}
            >
                {message}
            </Alert>
        </div>
    );
};

function typeToColor(type: 'info' | 'warning' | 'error' | 'success'): string {
    switch (type) {
        case 'success': return 'green';
        case 'warning': return 'yellow';
        case 'error': return 'red';
        case 'info':
        default: return 'blue';
    }
}

function typeLabel(type: 'info' | 'warning' | 'error' | 'success'): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
}

export default AlertBox;
