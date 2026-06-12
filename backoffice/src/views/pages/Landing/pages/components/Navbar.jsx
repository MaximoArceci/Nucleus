import React, { useState, useEffect } from "react";
import home from "assets/images/logo.png";
import { Menu, Close } from "@mui/icons-material";

function Navbar({ scrolled }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (showMenu) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showMenu]);

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleScroll = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
    setShowMenu(false); // Cierra el menú después de hacer clic
  };

  return (
    <nav
      className={`w-full z-[3001] transition-all ${scrolled ? "bg-primary" : "bg-white"
        } ${isMobile ? "fixed top-0 left-0" : ""}`}
    >
      <div className="flex items-center justify-between px-6 py-4 lg:px-24">
        <a href="#">
          <img src={home} alt="Logo 45 minutos" className={` ${showMenu && "hidden"} ${isMobile ? "h-full" : "absolute top-0 left-10 h-40"}`} />
        </a>

        {/* Menú para escritorio */}
        {!isMobile && (
          <ul className="flex space-x-8 font-semibold text-sm">
            <li><a href="#home" className="nav-links" onClick={(e) => handleScroll(e, "home")}>Nuestra propuesta</a></li>
            <li><a href="#about" className="nav-links" onClick={(e) => handleScroll(e, "products")}>Nuestros productos</a></li>
            <li><a href="#products" className="nav-links" onClick={(e) => handleScroll(e, "design")}>Nosotros</a></li>
            <li><a href="#contact" className="nav-links" onClick={(e) => handleScroll(e, "contact")}>Contacto</a></li>
            <li><a href="/login" className="bg-black text-white px-6 py-2 rounded-full">Ingresar</a></li>
          </ul>
        )}

        {/* Botón de menú para móviles */}
        {isMobile && (
          <button onClick={handleMenuToggle} className="text-black">
            {showMenu ? <Close fontSize="large" /> : <Menu fontSize="large" />}
          </button>
        )}
      </div>

      {/* Menú desplegable en móviles */}
      {isMobile && showMenu && (
        <ul className="absolute top-16 left-0 w-full bg-white shadow-lg flex flex-col items-center space-y-6 py-6 font-semibold text-sm overflow-hidden">
          <li><a href="#home" className="nav-links" onClick={(e) => handleScroll(e, "home")}>Nuestra propuesta</a></li>
          <li><a href="#about" className="nav-links" onClick={(e) => handleScroll(e, "products")}>Nuestros productos</a></li>
          <li><a href="#products" className="nav-links" onClick={(e) => handleScroll(e, "design")}>Nosotros</a></li>
          <li><a href="#contact" className="nav-links" onClick={(e) => handleScroll(e, "contact")}>Contacto</a></li>
          <li><a href="/login" className="bg-black text-white px-6 py-2 rounded-full">Ingresar</a></li>
        </ul>
      )}
    </nav>
  );
}

export default Navbar;