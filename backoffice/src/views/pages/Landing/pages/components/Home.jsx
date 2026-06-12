import React from "react";

function Home({ screen }) {
  return (
    <center
      className={`${
        screen ? "pt-24 h-screen" : "h-screen"
      } bg-primary text-white flex justify-center items-center`}
    >
      <div className="w-full flex flex-col space-y-10 md:space-y-20 items-center px-4">
        {/* Texto principal */}
        <div className="relative z-10 w-full max-w-[90%] sm:max-w-[70%] lg:w-1/3">
          <h2 className="text-2xl sm:text-3xl md:text-4xl text-center">
            ¿Dispones de un tiempo para la introspección?
          </h2>
        </div>

        {/* Icono SVG con animación */}
        <div className="hover:scale-90 transition-all duration-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 md:w-20"
            viewBox="0 0 76 38"
            fill="none"
          >
            <path d="M2 2L38 35L74 2" stroke="white" strokeWidth="3"></path>
          </svg>
        </div>
      </div>
    </center>
  );
}

export default Home;
