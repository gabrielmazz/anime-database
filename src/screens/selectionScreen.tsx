import React from "react";

// Importação dos assets da tela
import imgCard01 from '../assets/imgSelectionScreen/imgCard01.png';
import imgCard02 from '../assets/imgSelectionScreen/imgCard02.png';

// Importação dos componentes do mantine
import { Card } from '@mantine/core';
import { BackgroundImage } from '@mantine/core';

const SelectionScreen: React.FC = () => {
    return (

        <div className="
            w-screen h-screen 
            bg-black text-white 
            flex items-center justify-center"
        >

            {/* títulos */}
            <h1 className="absolute top-8 text-4xl font-bold">Anime Database</h1>
            <h2 className="absolute top-20 text-lg opacity-80">Selecione uma opção</h2>

            {/* grade 2x2 */}
            <div className="grid grid-cols-2 grid-rows-2 gap-8">

                {/* Card 1 */}
                <div
                    className="
                        border-2 border-white rounded-lg
                        w-[40vw] h-[40vh]
                        overflow-hidden
                        cursor-pointer
                    "
                    onClick={() => {
                        window.location.href = '/searchScreen';
                    }}
                >
                    <BackgroundImage
                        src={imgCard01}
                        className="
                            w-full h-full flex 
                            items-center justify-center
                            brightness-55
                            hover:brightness-100
                            transition duration-300
                            cursor-pointer
                        "
                    >
                        <h1 className="
                            text-4xl font-bold mb-4
                            w-full h-full
                            items-center
                            justify-center flex align-middle
                        "
                        >
                            Procurar Anime
                        </h1>
                    </BackgroundImage>
                </div>

                {/* Card 2 */}
                <div className="
                    border-2 border-white rounded-lg
                    w-[40vw] h-[40vh]
                    overflow-hidden
                ">
                    <BackgroundImage
                        src={imgCard02}
                        className="
                            w-full h-full flex 
                            items-center justify-center
                            brightness-55
                            hover:brightness-100
                            transition duration-300
                            cursor-pointer
                        "
                    >
                        <h1 className="
                            text-4xl font-bold mb-4
                            w-full h-full
                            items-center
                            justify-center flex align-middle
                        "
                        >
                            Procurar Personagem
                        </h1>
                    </BackgroundImage>

                </div>

                {/* Card 3 */}
                {/* <div className="
                    border-2 border-white rounded-lg
                    w-[40vw] h-[40vh]
                    overflow-hidden
                ">
                    <BackgroundImage
                        src={imgCard01}
                        className="
                            w-full h-full flex 
                            items-center justify-center
                            brightness-55
                            hover:brightness-100
                            transition duration-300
                            cursor-pointer
                        "
                    >
                        <h1 className="
                            text-4xl font-bold mb-4
                            w-full h-full
                            items-center
                            justify-center flex align-middle
                        "
                        >
                            Procurar --
                        </h1>
                    </BackgroundImage>

                </div> */}

                {/* Card 4 */}
                {/* <div className="
                    border-2 border-white rounded-lg
                    w-[40vw] h-[40vh]
                    overflow-hidden
                ">
                    <BackgroundImage
                        src={imgCard01}
                        className="
                            w-full h-full flex 
                            items-center justify-center
                            brightness-55
                            hover:brightness-100
                            transition duration-300
                            cursor-pointer
                        "
                    >
                        <h1 className="
                            text-4xl font-bold mb-4
                            w-full h-full
                            items-center
                            justify-center flex align-middle
                        "
                        >
                            Procurar Personagem
                        </h1>
                    </BackgroundImage>

                </div> */}

            </div>
        </div>
    );
};

export default SelectionScreen;
