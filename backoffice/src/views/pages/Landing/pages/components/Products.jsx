import React, { useState } from "react";
import contenedor1 from "../../../../../assets/images/landing/Contenedor-1.png";
import frame from "../../../../../assets/images/landing/Frame.png";
import { motion } from "framer-motion";

// Array de datos para cada card
const productsData = [
  {
    id: 1,
    title: "Procesos psicoanaliticos centrados en el adulto",
    description: "Procesos psicoanalíticos que promueven la adecuada interrelación entre los factores emocionales e intelectuales, individuales y sociales del participante. El objetivo es, por un lado, la apertura a una vida plena y centrada en el presente, y por otro, la consolidación de los proyectos vitales y la trascendencia. La adultez es un período extenso en donde coinciden vitalidad y experiencia. Se destaca una búsqueda de equilibrio y plenitud en cuyo proceso suelen manifestarse las consecuencias y vulnerabilidades resultantes de las elecciones y las renuncias hechas a lo largo de la vida. Nucleus ofrece un espacio y un tiempo para reflexionar sobre las dinámicas propias de la adultez, el presente y la finitud de la vida.",
  },
  {
    id: 2,
    title: "Procesos psicoanaliticos centrados en el adolescente",
    description: "Procesos psicoanalíticos que invitan a indagar hacia sí mismo, identificando anhelos y ansiedades, deseos y desilusiones, los límites y las transgresiones del joven participante. El objetivo es, por un lado, desarrollar las potencialidades del adolescente, y por otro, elaborar y consolidar valores e ideales. Las adolescencias son una oportunidad crítica y crucial para armonizar lo que se es y lo que se querría ser. Este proceso involucra la discriminación, diferenciación y autonomización del contexto familiar, necesarios para transitar hacia un futuro adulto saludable. Nucleus ofrece un espacio para la adecuada elaboración y tramitación de estos procesos, al servicio del acceso en lo más singular del participante para poder amar, desarrollarse y consolidar la propia personalidad",
  },
  {
    id: 3,
    title: "Procesos psicoanaliticos centrados en el Púber",
    description: "Procesos psicoanalíticos que posibilitan la evolución de un individuo cuya personalidad es aún endeble y dúctil. El objetivo es facilitar la asimilación de nuevas destrezas y libertades que rebozan de creatividad y, al mismo tiempo, de angustia. La pubertad es la etapa de metamorfosis que ocurre entre los 9 y 12 años, en la que coinciden el duelo por la vida infantil con la ilusión por las nuevas adquisiciones, posibilidades y libertades que están por venir. Nucleus permite adquirir las herramientas disponibles frente al advenimiento de la adolescencia.",
  },
  {
    id: 4,
    title: "Procesos psicoanaliticos centrados en el adulto mayor",
    description: "Procesos psicoanalíticos que abren un espacio para reflexionar sobre el legado. El objetivo es, por un lado, situar en perspectiva una vida signada por ganancias y pérdidas, y por otro, disfrutar y cosechar lo sembrado. El adulto mayor, menos propenso a la vorágine de la adultez, profundiza sobre la finitud, enmarcando sus procesos subjetivos en la reflexión de sus trayectos vitales y en el desapego paulatino de las cosas. Nucleus acompaña la tramitación de los duelos, las ansiedades y los pensamientos de estos participantes.",
  },
  {
    id: 5,
    title: "Procesos psicoanaliticos centrados en la pareja",
    description: "Procesos psicoanalíticos que trabajan de forma dinámica y sistémica en la elaboración de las crisis y las evoluciones que hacen parte sustancial de los vínculos familiares. La familia continúa entendiéndose como una agrupación en la que sus integrantes ratifican sus lazos y los objetivos comunes que los sostienen. Nucleus acompaña al grupo familiar en sus procesos, indistintamente del tipo de configuración que esta posee, desde el modelo clásico familiar a las nuevas y diversas parentalidades.",
  },
];

function Products({isSmallScreen}) {
  const [expanded, setExpanded] = useState(null); // Estado para controlar la expansión del texto

  const handleReadMore = (id) => {
    setExpanded(id); // Expande el texto cuando se hace clic en "Leer más"
  };

  const handleBack = () => {
    setExpanded(null); // Vuelve al estado anterior al "Leer más"
  };

  return (
    <>
      <center className="absolute -mt-7 w-full">
        <h2 className="bg-third text-white text-2xl shadow-2xl w-min px-10 py-3 rounded-full">
          Standar
        </h2>
      </center>
      <div className="flex justify-center py-10 bg-third">
        {/* Contenedor horizontal con scroll */}
        <div className="carousel container justify-between w-full overflow-x-scroll flex gap-5 px-4 ">
          {productsData.map((product) => (
            // Cada card con ancho fijo (w-80) y sin permitir que se encoja (flex-shrink-0)
            <div
              key={product.id}
              className={`relative flex-shrink-0 ${
                isSmallScreen ? 'w-[85vw] min-w-[280px]' : 'w-[26rem]'
              } h-auto`}
              style={{ perspective: "1000px" }}
            >
              <motion.div
                className="absolute w-full h-full transform-style-3d transition-transform duration-500"
                style={{
                  transform: expanded === product.id ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Cara frontal */}
                <div
                  className="absolute w-full h-full backface-hidden rounded-lg flex flex-col justify-between p-5"
                  style={{
                    backgroundImage: expanded === product.id ? "none" : `url(${contenedor1})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundColor: expanded === product.id ? "transparent" : "initial",
                  }}
                >
                  <img
                    src={frame}
                    className="absolute right-25 top-10"
                    alt="Frame"
                  />
                  <div className="mt-20 w-full flex-col justify-center">
                    <div className="title pt-20 pb-5 w-[75%] leading-7 font-semibold text-lg">
                      {product.title}
                    </div>
                    <div
                      className={`paragraph py-3 transition-all duration-500 text-sm ${expanded === product.id ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto"
                        }`}
                      style={{
                        maxHeight: "100px",
                        overflow: "hidden",
                      }}
                    >
                      {product.description}
                    </div>
                    <button
                      onClick={() => handleReadMore(product.id)}
                      className="text-right w-full hover:text-blue-600 py-2 text-black rounded"
                    >
                      Leer más
                    </button>
                  </div>
                </div>

                {/* Cara trasera */}
                <div
                  className="absolute w-full h-full backface-hidden rounded-lg shadow-lg p-5 flex flex-col justify-between rotate-y-180"
                  style={{ backgroundColor: "transparent" }}
                >
                  <button
                    onClick={handleBack}
                    className="backButton self-start px-2 py-1 rounded text-white"
                  >
                    ← Atrás
                  </button>
                  <div className="text-sm text-white">
                    {product.description}
                  </div>

                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
          .transform-style-3d {
            transform-style: preserve-3d;
          }
          .backface-hidden {
            backface-visibility: hidden;
          }
          .rotate-y-180 {
            transform: rotateY(180deg);
          }
          .backButton {
            cursor: pointer;
          }
        `}
      </style>
    </>
  );
}

export default Products;
