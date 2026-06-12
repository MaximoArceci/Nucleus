import React, { useState, useEffect, useCallback } from "react";

const Navbar = React.lazy(() => import('./components/Navbar'));
const LazyHome = React.lazy(() => import('./components/Home'));
const LazyAbout = React.lazy(() => import('./components/About'));
const LazyAboutUs = React.lazy(() => import('./components/AboutUs'));
const LazyJoinUs = React.lazy(() => import('./components/JoinUs'));
const LazyProducts = React.lazy(() => import('./components/Products'));
const LazyPremiumProducts = React.lazy(() => import('./components/PremiumProducts'));
const LazyFooter = React.lazy(() => import('./components/Footer'));
const LazyDesign = React.lazy(() => import('./components/Design'));
// const LazyPhrase = React.lazy(() => import('./components/Phrase'));


function Page() {
  const [scrolled, setScrolled] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isSmallScreen = window.innerWidth < 1024;


  const handleMenuToggle = useCallback(() => {
    setShowMenu((prevShowMenu) => !prevShowMenu);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <header className=" z-50 ">
        <Navbar scrolled={scrolled} screen={isSmallScreen} />
      </header>
      <div>
        <React.Suspense fallback={<div>Loading...</div>}>
          <section id="home" className="-z-50">
            <LazyHome isSmallScreen={isSmallScreen} />
          </section>

          <section id="about" className="z-10">
            <center>
              <LazyAbout isSmallScreen={isSmallScreen} />
            </center>
          </section>

          <section id="products" className=" -z-50">
            <LazyProducts isSmallScreen={isSmallScreen} />
          </section>
          
          <section id="premium" className=" -z-50">
            <LazyPremiumProducts isSmallScreen={isSmallScreen} />
          </section>
          <section id="design" className=" -z-50">
            <LazyDesign isSmallScreen={isSmallScreen} />
          </section>

          {/* <section id="contact">
            <LazyPhrase screen={isSmallScreen} />
          </section> */}
          <section id="nosotros">
            <LazyAboutUs isSmallScreen={isSmallScreen} />
          </section>
          <section id="contact">
            <LazyJoinUs isSmallScreen={isSmallScreen} />
          </section>
          <footer>
            <LazyFooter isSmallScreen={isSmallScreen} />
          </footer>
        </React.Suspense>
      </div>
    </div>
  );
}

export default React.memo(Page);
