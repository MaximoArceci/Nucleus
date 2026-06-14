import React, { useState } from "react";
import contenedor1 from "../../../../../assets/images/landing/PremiumCard.png";
import frame from "../../../../../assets/images/landing/Frame.png";
import { motion } from "framer-motion";

// Array de datos para cada card
const productsData = [
  {
    id: 1,
    title: "Procesos psicoanalíticos de pequeños grupos",
    description:
      "Procesos psicoanalíticos de acompañamiento e intervención grupal. Con un objetivo definido y un tiempo acotado y consensuado, se dinamizan procesos para el logro de metas, la elaboración de crisis y la gestión de oportunidades. Las agrupaciones garantizan las relaciones interpersonales, el sostenimiento de las tradiciones culturales y la adquisición y el refinamiento de habilidades y funciones fundamentales para la vida. Nucleus ofrece un exclusivo modelo para tramitar acuerdos y desacuerdos, la conformación de ideas, la confrontación de perspectivas y la ejecución de proyectos.",
  },
  {
    id: 2,
    title: "Procesos psicoanalíticos de la Vocación y el Emprendimiento",
    description:
      "Un espacio creativo para la realización y el reconocimiento, la elaboración de proyectos y la concreción de las oportunidades. Del contacto con el deseo de aprender o ejercer un oficio o una carrera, hasta el proceso de descubrimiento de una vocación cuando ya se posee una profesión consolidada, evocan las preguntas por la vocación y la capacidad de emprender. Nucleus ofrece un modelo diseñado para la indagación en la naturaleza de esta experiencia, en concordancia con el reconocimiento de una cultura signada por novedosas tendencias, plataformas, dispositivos y oficios caracterizados por la aceleración y la fluidez.",
  },
  {
    id: 3,
    title: "Consultoría psicoanalítica del liderazgo y la gestión",
    description:
      "Un espacio exclusivo para abordar las complejidades de la mediación, la gestión y la innovación en un contexto ejecutivo y empresarial. El liderazgo, la negociación y la gestión requieren de una comunicación empática y eficaz que estimule la colaboración entre los integrantes de un equipo y el desarrollo de proyectos y tareas específicas. También requiere de la comprensión y abstracción de problemáticas que toman en cuenta las situaciones, contextos y potencialidades que se le asocian. Capacitados por nuestra experiencia con gerentes, empresarios y CEOs, Nucleus ofrece fundamentos psicoanalíticos que consideran los intereses y actitudes del entorno empresarial, junto a las transformaciones que implican determinadas situaciones críticas que estimulan el cambio necesario de los miembros que componen el grupo.",
  }
];

function Products({isSmallScreen}) {
  const [expanded, setExpanded] = useState(null);

  const handleReadMore = (id) => {
    setExpanded(id);
  };

  const handleBack = () => {
    setExpanded(null);
  };

  return (
    <>
      <center className="absolute -mt-7 w-full">
        <h2 className="bg-secondary text-white text-2xl shadow-2xl w-min px-10 py-3 rounded-full">
          Exclusivos
        </h2>
      </center>
      <div className="flex justify-center py-10 bg-secondary">
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
