import React from "react";
import coma1 from "../../../../../assets/images/landing/Vector-5.png";

function Products({ screen }) {
  return (
    <div className="flex justify-center w-full px-4 md:px-10 py-10">
      <div className="flex flex-col lg:flex-row items-center justify-center lg:items-start w-full max-w-screen-xl ">
        
        {/* Sección de texto */}
        <div className="w-full text-center lg:text-left px-6">
          <h3 className="text-primary text-2xl sm:text-3xl">Nuestra propuesta</h3>
          <h2 className="font-semibold text-xl sm:text-2xl md:text-3xl">El psicoanálisis que practicamos</h2>
          
          <div className="space-y-5 mt-5">
            <p className="text-lg sm:text-xl md:text-2xl">
              Nuestra tarea consiste en proveer un espacio para el diálogo donde coincidan dos universos. 
              Uno, el de la persona que requiere herramientas para habilitar su bienestar, la claridad de sus ideas 
              y la concreción de sus proyectos vitales. El otro, el del psicoanalista con una larga experiencia en 
              el diálogo, tratamiento y acompañamiento online.
            </p>

            {/* Cita con comillas */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-5 md:gap-10">
              {/* Comillas izquierda */}
              <div className="flex space-x-2">
                <img src={coma1} className="w-6 md:w-8 lg:w-10" />
                <img src={coma1} className="w-6 md:w-8 lg:w-10" />
              </div>

              <h3 className="text-primary text-center md:w-1/2 text-lg sm:text-xl">
                45minutes.online es el espacio para el despliegue de tu autenticidad.
              </h3>

              {/* Comillas derecha */}
              <div className="flex space-x-2">
                <img src={coma1} className="rotate-180 w-6 md:w-8 lg:w-10" />
                <img src={coma1} className="rotate-180 w-6 md:w-8 lg:w-10" />
              </div>
            </div>

            <p className="text-lg sm:text-xl md:text-2xl">
              Practicamos un psicoanálisis centrado en el contacto emocional y la construcción conjunta, creativa y dinámica 
              de los emergentes que responden por las necesidades del consultante. Nuestra propuesta reúne profesionales especializados 
              en el intercambio activo y único con el participante, para acompañar y, sobre todo, incorporar nuevas aptitudes, 
              transformaciones anímicas y cambios psíquicos.
            </p>
          </div>

          {/* Sección de servicios */}
          <div className="mt-10">
            <p className="text-lg font-bold text-third">SERVICIOS</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-black">Nuestros productos</h2>
          </div>
        </div>

        {/* Imagen */}
     
      </div>
    </div>
  );
}

export default Products;
