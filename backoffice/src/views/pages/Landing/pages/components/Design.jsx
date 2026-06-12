import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import coma from '../../../../../assets/images/landing/Vector-15.png';
import comilla from '../../../../../assets/images/landing/Comilla.png';
import paraleleogramo from '../../../../../assets/images/landing/paralelogramo.png';
import lastParalelogram from '../../../../../assets/images/landing/paralelogramo-final-1.png';
import maxi from '../../../../../assets/images/landing/maxi.png';

function Design({ isSmallScreen }) {
    const designData = [
        {
            id: 1,
            title: "Entrevista preliminar",
            description:
                "Proponemos un trabajo mancomunado en un presente que, de cara al futuro, habilite el bienestar, la claridad de las ideas y la concreción de los proyectos vitales.",
        },
        {
            id: 2,
            title: "Referencia personalizada",
            description:
                "Asesoría y derivación personalizada con el profesional más adecuado a las necesidades y requerimientos mutuamente consensuados en la entrevista preliminar.",
        },
        {
            id: 3,
            title: "Marco virtual de acompañamento",
            description:
                "La propuesta de un encuadre virtual singular, cálido y confidencial con tecnología actualizada que garantiza la privacidad y el intercambio desprejuiciado y libre.",
        },
    ];
    const [finalTriggered, setFinalTriggered] = useState(true);
    // Ref y visibilidad del título
    const [h2Ref, h2InView] = useInView({ triggerOnce: true, threshold: 1 });
    // Ref para el contenedor general de las imágenes
    const imagesRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: imagesRef,
        offset: ["start end", "end start"],
    });

    // Refs de visibilidad para las comillas
    const [imagesInViewRef, imagesInView] = useInView({ 
        triggerOnce: true, 
    });

    const paralelogramosRef = useRef(null);
    const { scrollYProgress: scrollYParalelogramo } = useScroll({
        target: paralelogramosRef,
        offset: ["start end", "end start"],
    });

    const ultimoParalelogramoRef = useRef(null);
    const { scrollYProgress: scrollYUltimo } = useScroll({
        target: ultimoParalelogramoRef,
        offset: ["start end", "end start"],
    });

    // Animaciones basadas en scroll del contenedor de imágenes (comillas)
    const rotateImage = useTransform(scrollYProgress, [0.3, 0.55], [0, -180]);
    const opacity = useTransform(scrollYProgress, [0.4, 0.55], [1, 0]);
    
    // Valores finales para ambas comillas
    const comillasFinalX = -300;
    const comillasFinalY = 300;
    
    const x = useTransform(scrollYProgress, [0.3, 0.65], [0, -705]);
    const y = useTransform(scrollYProgress, [0.3, 0.65], [0, comillasFinalY]);
    
    // Movimiento circular para la comilla 1
    const radius = 800;
    const angle = useTransform(scrollYProgress, [0.3, 0.65], [0, Math.PI * 2]);
    const x1 = useTransform(angle, [0, Math.PI * 2], [0, comillasFinalX]);
    const y1 = useTransform(angle, [0, Math.PI * 2], [0, comillasFinalY]);

    // Animaciones de los paralelogramos en la sección final, usando scrollYProgress
    const parallelogramOpacity = useTransform(scrollYProgress, [0.5, 1], [0, 1]);
    const parallelogramY = useTransform(scrollYProgress, [0.5, 1], [-650, 100]);

    const parallelogramOpacityMobile = useTransform(scrollYProgress, [0.5, 0.55], [0, 1]);
    const parallelogramYMobile = useTransform(scrollYProgress, [0.5, 0.55], [-700, 100]);

    const parallelogramRotate = useTransform(scrollYProgress, [0.4, 0.7], [0, 0]);
    // Para el paralelogramo final (de la secuencia interna) usaremos scrollYParalelogramo:

    const parallelogramOpacity1 = useTransform(scrollYParalelogramo, [0.25, 0.35], [0, 1]);
    const parallelogramOpacity2 = useTransform(scrollYParalelogramo, [0.30, 0.40], [0, 1]);
    const parallelogramOpacity3 = useTransform(scrollYParalelogramo, [0.35, 0.8], [0, 1]);
    const firstRotate = useTransform(scrollYParalelogramo, [0.25, 0.35], [85, 45]);
    const secondRotate = useTransform(scrollYParalelogramo, [0.30, 0.40], [55, 30]);
    const thirdRotate = useTransform(scrollYParalelogramo, [0.35, 0.5], [50, 15]);

    // Otros desplazamientos (no modificados en este ejemplo)
    const xp = useTransform(scrollYParalelogramo, [0.35, 0.8], [0, 250]);
    const yp = useTransform(scrollYParalelogramo, [0.35, 0.5], [0, 100]);
    const xExaggerated = useTransform(scrollYParalelogramo, [0, 0.25], [0, 300]);
    const yExaggerated = useTransform(scrollYParalelogramo, [0, 0.25], [0, -300]);

    // El último paralelogramo (transición final) se ubicará en y:0 cuando scrollYParalelogramo llegue a 1


    const finalLastOpacity = useTransform(scrollYUltimo, [0, 0.5], [0, 1]);
    const finalLastY = useTransform(scrollYUltimo, [0, 0.4], [-400, 125]);
    const finalLastScale = useTransform(scrollYUltimo, [0, 0.4], [1, 0.65]);


    const finalImage = useTransform(scrollYUltimo, [0.10, 0.4], [0, 1]);
    const finalY = useTransform(scrollYUltimo, [0.20, 0.4], [-200, -50]);

    const finalDiv = useTransform(scrollYUltimo, [0.20, 0.4], [-200, -50]);

    // Nueva animación de desplazamiento vertical para el texto final
    const finalTextY = useTransform(scrollYUltimo, [0.4, 0.8], [0, 500]);

    //Animacion de escalado de imagen final
    const escaladoOpacity = useTransform(scrollYUltimo, [0.7, 0.8], [0, 1]);
    const escalado = useTransform(scrollYUltimo, [0.7, 0.9], [1, 100]);

    useEffect(() => {
        const unsub = scrollYUltimo.onChange((value) => {
            if (value >= 0.5) {
                setFinalTriggered(true);
            }
        });
        return () => unsub();
    }, [scrollYUltimo, finalTriggered]);


    return (
        <center className=' overflow-hidden'>
            {/* Sección superior: título y comillas */}
            <div className='w-full flex justify-center custom-gradient'>
                <div className='container flex w-fit '>
                    <div className='w-fit lg:max-w-1/2 mx-4 space-y-20 py-72'>
                        <motion.h2
                            ref={h2Ref}
                            initial={{ opacity: 0, y: 50 }}
                            animate={h2InView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className='text-black text-4xl font-semibold'
                        >
                            Diseñamos un marco exclusivo para el tratamiento, acompañamiento y consultoría psicoanalítica digital, que consta del siguiente recorrido:
                        </motion.h2>
                        {designData.map((design) => {
                            const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
                            return (
                                <motion.div
                                    ref={ref}
                                    key={design.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={inView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                    className='flex flex-col text-white font-semibold space-y-4'
                                >
                                    <div className='flex items-center space-x-5'>
                                        <motion.img
                                            src={coma}
                                            width={""}
                                            alt="coma"
                                            initial={{ opacity: 0, rotate: 270, y: 20 }}
                                            animate={inView ? { opacity: 1, rotate: 360, y: 0 } : {}}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                        />
                                        <h3 className='text-4xl'>{design.title}</h3>
                                    </div>
                                    <p className='text-2xl'>{design.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                    {/* Sección de comillas */}
                    {!isSmallScreen &&
                        <div ref={imagesRef} className='flex justify-center w-fit pl-20 space-x-20 h-full items-center relative'>
                            <motion.img
                                ref={imagesInViewRef}
                                src={comilla}
                                className='w-[256px] h-auto'
                                width={256}
                                height={490}
                                alt="comilla1"
                                transition={{ 
                                    duration: 0.5,
                                    ease: 'easeInOut'
                                }}
                                style={{ 
                                    x: x1, 
                                    y: y1, 
                                    rotate: rotateImage,
                                    opacity: opacity,
                                    zIndex: 2,
                                    transformOrigin: 'center center'
                                }}
                            />
                            <motion.img
                                src={comilla}
                                width={256}
                                height={490}
                                className='w-[256px] h-auto'
                                alt="comilla2"
                                transition={{ duration: 1, ease: 'easeOut' }}
                                style={{ 
                                    x: x, 
                                    y: y, 
                                    opacity: opacity,
                                    zIndex: 1
                                }}
                            />
                        </div>
                    }
                </div>
            </div>
            {/* Sección intermedia: paralelogramos animados (controlados por scrollYProgress) */}
            <div className={`${finalTriggered ? 'bg-[#090515]' : 'bg-white'}  flex flex-col justify-center items-center relative`}>
            {!isSmallScreen &&
            <>
                <motion.img
                src={paraleleogramo}
                height={200}
                className='-top-72'
                alt="paralelogramo"
                style={{
                    opacity: isSmallScreen ? parallelogramOpacityMobile : parallelogramOpacity,
                    y: isSmallScreen ? parallelogramYMobile : parallelogramY,
                    rotate: parallelogramRotate,
                    zIndex: 1000,
                }}
                transition={{ duration: 2, ease: 'easeOut' }}
                />
                <div className='-mt-72 -mr-16'>
                    <img src={paraleleogramo} alt="paralelogramo-placeholder" />
                </div>
                <div className='bg-[#090515] py-52 flex flex-col items-center relative'>
                    <div className='text-white text-center'>
                        <motion.h4
                            className='text-4xl'
                            initial={{ opacity: 0.5, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.5 }}
                            viewport={{ once: true, amount: 0.5 }}
                            >
                            En el encuentro con un otro descubrimos
                        </motion.h4>
                        <motion.h4
                            className='text-2xl'
                            initial={{ opacity: 0.5, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.5, delay: 0.2 }}
                            viewport={{ once: true, amount: 0.5 }}
                            >
                            nuevas dimensiones de nuestro propio ser
                        </motion.h4>
                    </div>

                    <div className="relative top-0 flex flex-col items-center" ref={paralelogramosRef}>
                        <div className="min-h-full">
                            <motion.img
                                src={paraleleogramo}
                                height={200}
                                className="top-32 transform"
                                alt="paralelogramo"
                                style={{
                                    opacity: parallelogramOpacity1, // Vinculado al scroll del ref paralelogramosRef
                                    rotate: firstRotate,
                                    zIndex: 100,
                                }}
                                />
                            <motion.img
                                src={paraleleogramo}
                                height={200}
                                className="top-32 transform -mt-96"
                                alt="paralelogramo"
                                style={{
                                    opacity: parallelogramOpacity2,
                                    rotate: secondRotate,
                                    zIndex: 100,
                                }}
                                />
                            <motion.img
                                src={paraleleogramo}
                                height={200}
                                className="transform ml-96 -mt-32"
                                alt="paralelogramo"
                                style={{
                                    opacity: parallelogramOpacity3,
                                    rotate: thirdRotate,
                                    zIndex: 100,
                                    // x: xp,
                                    y: yp
                                }}
                                />
                        </div>

                    </div>
                </div>
                                </>
                }
                {/* Sección final*/}
                <div className="py-52 mb-[24rem]" ref={ultimoParalelogramoRef}>
                    <motion.div
                        style={{
                            y: finalTextY,
                        }}
                    >


                        <motion.img
                            src={paraleleogramo}
                            height={100}
                            alt="paralelogramo"
                            style={{
                                opacity: finalLastOpacity,
                                scale: finalLastScale,
                                y: finalLastY,
                                zIndex: 1000,
                            }}
                            transition={{ duration: 2, ease: 'easeOut' }}
                        />

                        <motion.img
                            src={lastParalelogram}
                            height={200}
                            alt="lastParalelogram"
                            className='relative -mt-[11.75rem] h-72'
                            style={{
                                opacity: finalImage,
                                y: finalY,
                            }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        />

                        <div className='flex flex-col items-center relative'>
                            <div className='text-white text-center'>
                                <motion.h4
                                    className='text-4xl'
                                    initial={{ opacity: 0.5, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1.5 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                >
                                    Espacios dinámicos
                                </motion.h4>
                                <motion.h4
                                    className='text-2xl'
                                    initial={{ opacity: 0.5, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1.5, delay: 0.2 }}
                                    viewport={{ once: true, amount: 0.5 }}
                                >
                                    que nos transforman
                                </motion.h4>

                            </div>
                        </div>
                    </motion.div>


                    {finalTriggered &&
                        <motion.img
                            src={maxi}
                            height={200}
                            alt="lastParalelogram"
                            className=' z-[3000]'
                            style={{
                                scale: escalado,
                                opacity: escaladoOpacity,
                                zIndex: 2000,
                            }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                    }


                </div>
            </div>
        </center>
    );
}

export default Design;
