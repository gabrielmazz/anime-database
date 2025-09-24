// React 19+ não precisa do import explícito
import styled from 'styled-components';

import { Text } from '@mantine/core';
import { Space } from '@mantine/core';

const LogoBaseboard = () => {
	return (
		<StyledWrapper>
			<div>
				<div className="loader">
					<svg viewBox="0 0 80 80">
						<circle r={32} cy={40} cx={40} id="test" />
					</svg>
				</div>
				<div className="loader triangle">
					<svg viewBox="0 0 86 80">
						<polygon points="43 8 79 72 7 72" />
					</svg>
				</div>
				<div className="loader">
					<svg viewBox="0 0 80 80">
						<rect height={64} width={64} y={8} x={8} />
					</svg>
				</div>

				<Space h="xs" />

				<Text
					className="
                        mb-2
                        text-shadow-lg/20
                        font-semibold
                        tracking-wide
						uppercase
                    "
					style={{
						fontSize: 12,
						fontFamily: 'Raleway, sans-serif',
						color: 'var(--color1)'
						, letterSpacing: '0.18em'
					}}
				>
					Gabriel Mazzuco - 2025
				</Text>

			</div>
		</StyledWrapper>
	);
}

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;

  .loader {
    --path: var(--panel-border);
    --dot: var(--accent);
    --duration: 3s;
    width: 44px;
    height: 44px;
    position: relative;
  }

  .loader:before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    position: absolute;
    display: block;
    background: var(--dot);
    top: 37px;
    left: 19px;
    transform: translate(-18px, -18px);
    animation: dotRect var(--duration) cubic-bezier(0.785, 0.135, 0.15, 0.86)
      infinite;
  }

  .loader svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  .loader svg rect,
  .loader svg polygon,
  .loader svg circle {
    fill: none;
    stroke: var(--path);
    stroke-width: 10px;
    stroke-linejoin: round;
    stroke-linecap: round;
  }

  .loader svg polygon {
    stroke-dasharray: 145 76 145 76;
    stroke-dashoffset: 0;
    animation: pathTriangle var(--duration) cubic-bezier(0.785, 0.135, 0.15, 0.86)
      infinite;
  }

  .loader svg rect {
    stroke-dasharray: 192 64 192 64;
    stroke-dashoffset: 0;
    animation: pathRect 3s cubic-bezier(0.785, 0.135, 0.15, 0.86) infinite;
  }

  .loader svg circle {
    stroke-dasharray: 150 50 150 50;
    stroke-dashoffset: 75;
    animation: pathCircle var(--duration) cubic-bezier(0.785, 0.135, 0.15, 0.86)
      infinite;
  }

  .loader.triangle {
    width: 48px;
  }

  .loader.triangle:before {
    left: 21px;
    transform: translate(-10px, -18px);
    animation: dotTriangle var(--duration) cubic-bezier(0.785, 0.135, 0.15, 0.86)
      infinite;
  }

  @keyframes pathTriangle {
    33% {
      stroke-dashoffset: 74;
    }

    66% {
      stroke-dashoffset: 147;
    }

    100% {
      stroke-dashoffset: 221;
    }
  }

  @keyframes dotTriangle {
    33% {
      transform: translate(0, 0);
    }

    66% {
      transform: translate(10px, -18px);
    }

    100% {
      transform: translate(-10px, -18px);
    }
  }

  @keyframes pathRect {
    25% {
      stroke-dashoffset: 64;
    }

    50% {
      stroke-dashoffset: 128;
    }

    75% {
      stroke-dashoffset: 192;
    }

    100% {
      stroke-dashoffset: 256;
    }
  }

  @keyframes dotRect {
    25% {
      transform: translate(0, 0);
    }

    50% {
      transform: translate(18px, -18px);
    }

    75% {
      transform: translate(0, -36px);
    }

    100% {
      transform: translate(-18px, -18px);
    }
  }

  @keyframes pathCircle {
    25% {
      stroke-dashoffset: 125;
    }

    50% {
      stroke-dashoffset: 175;
    }

    75% {
      stroke-dashoffset: 225;
    }

    100% {
      stroke-dashoffset: 275;
    }
  }

  .loader {
    display: inline-block;
    margin: 0 10px;
    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.25));
  }

  /* brilho sutil no ponto com a cor de acento */
  .loader:before {
    box-shadow: 0 0 8px 0 var(--dot), 0 0 16px 0 var(--dot);
  }
`;

export default LogoBaseboard;
