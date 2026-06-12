// import producto from "../assets/products.webp";
import React from "react";

function JoinUs({ screen }) {
    return (
        <center className=" py-10  flex justify-center bg-primary">
            <div
                className={`  ${screen ? " " : ""}  space-y-10 text-white flex flex-col  `}
            >
                <div className="space-y-5">

                    <h2 >
                        ¿Todavía no sos parte?
                    </h2>
                    <p>
                        Únete y sé parte de la comunidad de ‘45
                    </p>
                </div>
                <ul className="flex justify-center w-full">

                    <li className="w-full flex justify-center">
                        <a
                            href="/login"
                            className="nav-links nav-contact text-lg flex items-center bg-black text-white px-8 py-1 rounded-full"
                            onClick={(e) => handleScroll(e, "contact")}
                        >
                            <h3>

                                Unirme
                            </h3>
                        </a>
                    </li>

                </ul>
            </div>
        </center>
    );
}

export default JoinUs;
