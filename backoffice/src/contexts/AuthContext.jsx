import { createContext, useContext, useEffect, useState } from "react";
import { useUser, useSession } from "@clerk/clerk-react";
import axios from "axios";

// Crear el contexto
const AuthContext = createContext(null);

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const { isSignedIn, user } = useUser();
  const { session } = useSession();
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    if (!isSignedIn || !session || !user) return;

    const fetchAccessToken = async () => {
      try {
        const email = encodeURIComponent(user.primaryEmailAddress?.emailAddress || "");
        const checkUrl = `/datos/candidato/check_register/${email}`;
        const response = await axios.get(checkUrl);

        if (response.data && response.data.length > 0) {
          const token = response.data[0].access_token;
          setAccessToken(token);
          localStorage.setItem("serviceToken", token);
        } else {
          console.warn("No se encontró access_token en la respuesta.");
        }
      } catch (error) {
        console.error("Error obteniendo el access_token:", error);
      }
    };

    fetchAccessToken();
  }, [isSignedIn, session, user]);

  return (
    <AuthContext.Provider value={{ accessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto en cualquier componente
export const useAuth = () => useContext(AuthContext);
