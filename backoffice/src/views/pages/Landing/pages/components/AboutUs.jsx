import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import aboutus from "../../../../../assets/images/landing/Vector-14.webp";

function AboutUs({ isSmallScreen }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <div className="py-10 px-5 sm:px-10 flex justify-center">
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`max-w-screen-lg w-full ${isSmallScreen ? "flex-col" : "flex"} items-center lg:items-start space-y-10 lg:space-y-0 lg:space-x-10`}
      >
        {/* Contenedor de Imagen */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="w-full lg:w-1/2"
        >
          <img src={aboutus} className="w-full h-auto rounded-lg " />
        </motion.div>

        {/* Contenedor de Texto */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="w-full lg:w-1/2 text-left space-y-5"
        >
          <h3 className="text-primary text-3xl font-semibold">Sobre nosotros</h3>
          <h2 className="font-semibold text-2xl">¿Quiénes somos?</h2>
          <p className="text-lg sm:text-xl">
            Somos una firma de psicoanalistas con una extensa experiencia profesional en el ámbito digital, acompañando a la comunidad hispanohablante, especialmente expatriados, nómadas digitales, ejecutivos y profesionales que requieren de la constancia de un terapeuta confiable y disponible.
          </p>
          <p className="text-lg sm:text-xl">
            Cada uno de nuestros asociados cuenta con el aval de la International Psychoanalytical Association (IPA), cumpliendo con los estándares de excelencia y solidez que demanda la práctica psicoanalítica contemporánea.
          </p>
          <p className="text-lg sm:text-xl text-primary underline">Federico Berconsky</p>
          <p className="text-lg sm:text-xl text-primary underline">Jean Marc Tauszik</p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default AboutUs;
