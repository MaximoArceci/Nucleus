import React, { useState } from "react";
import { SignedIn } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "contexts/Auth0Context";

// Importando iconos de MUI
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import StorageIcon from "@mui/icons-material/Storage";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { CreditCard } from "@mui/icons-material";

function Navbar({ toggleNavbar }) {
  const location = useLocation();
  const [isBaseDeDatosOpen, setIsBaseDeDatosOpen] = useState(false);
  const { role } = useAuth();
  return (
    <div
      className={`z-50 min-h-full bg-primary ${toggleNavbar ? "w-[4rem]" : "w-56"
        } pt-10 text-white transition-all duration-300 flex flex-col items-center`}
    >
        <ul className={`text-texto font-[500] space-y-4 pt-8 w-full ${!toggleNavbar && 'px-2'}`}>
          {/* Calendario */}
          <li className="mb-4 nav-menu">
            <Link
              to={"/home"}
              className={`flex items-center    ${toggleNavbar ? "w-[4rem] justify-center" : "w-52 justify-left"
                } ${location.pathname === "/" && "bg-hovercolor"
                }`}
            >
              <div className="flex items-center justify-center ">
                <CalendarMonthIcon className="min-w-max" />
                <span
                  className={`overflow-hidden transition-all duration-300 ${toggleNavbar ? "hidden" : "max-w-full opacity-100 ml-4"
                    }`}
                >
                  Calendario
                </span>
              </div>
            </Link>
          </li>

          {(role === "Admin" || role === "Terapeuta") && (
            <li
              className="mb-4 nav-menu relative group"
              onMouseEnter={() => toggleNavbar && setIsBaseDeDatosOpen(true)}
              onMouseLeave={() => toggleNavbar && setIsBaseDeDatosOpen(false)}
            >
              <button
                onClick={() => !toggleNavbar && setIsBaseDeDatosOpen(!isBaseDeDatosOpen)}
                className={`flex justify-center  ${toggleNavbar ? "w-[4rem]" : "w-52"
                  } items-center ${isBaseDeDatosOpen && !toggleNavbar ? "bg-hovercolor" : ""
                  }`}
              >
                <div className="flex items-center justify-center w-full">
                  <StorageIcon className="min-w-max" />
                  <span
                    className={`overflow-hidden transition-all duration-300 ${toggleNavbar ? "hidden" : "min-w-fit opacity-100 ml-4"
                      }`}
                  >
                    Usuarios
                  </span>
                  {!toggleNavbar && <ExpandMoreIcon className="ml-auto" />}
                </div>
              </button>

              {/* Submenú en hover cuando está retraída */}
              {isBaseDeDatosOpen && toggleNavbar && (
                <ol className="absolute left-16 top-0 bg-primary p-2 rounded-md shadow-2xl space-y-2 min-w-[10rem] z-[1001] list-disc">
                  <div className="ml-5">
                    {role === "Admin" &&
                      <li className="p-2 hover:bg-hovercolor">
                        <Link to="/terapeuta">Terapeuta</Link>
                      </li>
                    }
                    <li className="p-2 hover:bg-hovercolor">
                      <Link to="/paciente">Paciente</Link>
                    </li>
                    {role === "Admin" &&

                      <li className="p-2 hover:bg-hovercolor">
                        <Link to="/candidato">Candidato</Link>
                      </li>
                    }
                  </div>
                </ol>
              )}

              {/* Submenú cuando no está retraída */}
              {isBaseDeDatosOpen && !toggleNavbar && (
                <ol className="text-left space-y-3 pl-10 transition-all duration-300 pt-5 list-disc">
                  <li className="submenu-item big-buttons p-2 w-full">
                    <Link to="/terapeuta">Terapeuta</Link>
                  </li>
                  <li className="submenu-item big-buttons p-2 w-full">
                    <Link to="/paciente">Paciente</Link>
                  </li>
                  <li className="submenu-item big-buttons p-2 w-full">
                    <Link to="/candidato">Candidato</Link>
                  </li>
                </ol>
              )}
            </li>

          )}

          {role === "Paciente" &&


            <Link
              to={"/pagos"}
              className={`flex items-center    ${toggleNavbar ? "w-[4rem] justify-center" : "w-52 justify-left"
                } ${location.pathname === "/" && "bg-hovercolor"
                }`}
            >
              <div className="flex items-center justify-center ">
                <CreditCard className="min-w-max" />
                <span
                  className={`overflow-hidden transition-all duration-300 ${toggleNavbar ? "hidden" : "max-w-full opacity-100 ml-4"
                    }`}
                >
                  Pagos
                </span>
              </div>
            </Link>
          }
          {/* {
            role === "Admin" &&
            <Link
              to={"/auditoria"}
              className={`flex items-center    ${toggleNavbar ? "w-[4rem] justify-center" : "w-52 justify-left"
                } ${location.pathname === "/" && "bg-hovercolor"
                }`}
            >
              <div className="flex items-center justify-center ">
                <CalendarMonthIcon className="min-w-max" />
                <span
                  className={`overflow-hidden transition-all duration-300 ${toggleNavbar ? "hidden" : "max-w-full opacity-100 ml-4"
                    }`}
                >
                  Calendario
                </span>
              </div>
            </Link>
          } */}
        </ul>
    </div>
  );
}

export default Navbar;
