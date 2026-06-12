// import { FiPhone } from "react-icons/fi";
// import { FiMail } from "react-icons/fi";

import React from "react";

function Products({ screen }) {
  return (
    <div className="py-20 mx-[2rem] ">
      <div className={` space-y-3 ${screen ? "" : ""} `}>
        <div className={`text-left  `}>
          <li className="text-zettabluest list-solutions">CONTACT US</li>
          <h3>
            No dude en llamarnos o enviarnos un correo electrónico con sus
            preguntas o comentarios.
          </h3>
          <div className="space-y-5 mt-5">
            <p className="list-parraf">
              Nos encantaría saber de usted, ya sea que esté interesado en
              trabajar con nuestro equipo o seguir una carrera con nosotros.
            </p>
          </div>
        </div>
        <center className="contact-info space-y-5 h-min py-5">
          <div className="space-y-3">
            <h5>Contact us</h5>
            <div className="flex items-center space-x-3">
              {/* <FiPhone className="scale-125" /> */}
              <p>+54 9 11 2528-8977</p>
            </div>
            <div className="flex items-center space-x-3">
              {/* <FiMail className="scale-125" /> */}
              <p>contacto@zetta-plus.com
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <h5>Location</h5>
            <div>
              <a
                className="underline underline-offset-2"
                target="_blank"
                href="https://www.google.com/maps/place/+Buenos+Aires+Cdad.+Aut%C3%B3noma+de+Buenos+Aires+AR"
              >
                Buenos Aires, Cdad. Autónoma de Buenos Aires AR
              </a>
            </div>
          </div>
        </center>
      </div>
    </div>
  );
}

export default Products;
