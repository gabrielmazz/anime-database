import React, { useEffect, useState } from 'react';
import { Alert } from '@mantine/core';
import AlertModule from '../inputInfos/Alert.module.css';

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

    // Posição: topo centralizado
    const base = 'fixed top-4 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-xl px-4 transition-all duration-300 ease-out transform';
    const enterFrom = ' opacity-0 -translate-y-2';
    const enterTo = ' opacity-100 translate-y-0';
    const exitTo = ' opacity-0 -translate-y-2';
    const cls = base + (phase === 'enter' ? enterFrom : phase === 'entered' ? enterTo : exitTo);

    return (
        <div className={cls}>
            {/* Tema próprio: aparência alinhada com inputs/painéis */}
            <Alert
                variant="light"
                title={typeLabel(type)}
                classNames={{
                    root: AlertModule.rootAlert,
                    title: AlertModule.titleAlert,
                    message: AlertModule.messageAlert,
                    icon: AlertModule.iconAlert,
                }}
                // Define a cor da barrinha/acento via CSS variable
                style={{ ['--alert-accent' as any]: typeToAccent(type) }}
            >
                {message}
            </Alert>
        </div>
    );
};

// Acento sutil por tipo mantendo contexto da aplicação
function typeToAccent(type: 'info' | 'warning' | 'error' | 'success'): string {
    switch (type) {
        case 'success': return '#22c55e'; // verde
        case 'warning': return '#f59e0b'; // âmbar
        case 'error': return '#ef4444';   // vermelho
        case 'info':
        default: return 'var(--color1)';  // cor de destaque do tema
    }
}

function typeLabel(type: 'info' | 'warning' | 'error' | 'success'): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
}

export default AlertBox;
