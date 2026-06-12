import React from "react";
import logo from "../../../../../assets/images/landing/Logo-tipografico.png";
//import archessy from "@/assets/images/archessy.png";
import archessy from "../../../../../assets/images/landing/archessy.webp";

function Footer() {
  return (
    <footer className="bg-black text-white py-10 px-8">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-6xl mx-auto space-y-6 md:space-y-0">
        {/* Logos */}
        <div className="flex items-center gap-8">
          <a href="/" className="w-40">
            <img src={logo} alt="Company Logo" className="w-full" />
          </a>


        </div>

        {/* Links de navegación */}
        <nav className="flex justify-center space-x-8 text-sm">
          <a href="#products" className="hover:text-gray-300 transition-colors">FAQ</a>
          <a href="/politica" className="hover:text-gray-300 transition-colors">Política de privacidad</a>
          <a href="/terminos" className="hover:text-gray-300 transition-colors">Términos y condiciones</a>
        </nav>

        {/* Links legales */}

        {/* Copyright */}
        <div className="flex items-center justify-center md:justify-end gap-4">
          <p className="text-xs text-gray-400">
            © 2023 – Company, Inc. Todos los derechos reservados.  
          </p>
          <a href="#" className="w-40">
            <img src={archessy} alt="Logo Archessy" className="w-full" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
