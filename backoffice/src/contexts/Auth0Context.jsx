// contexts/Auth0Context.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "utils/axios";
import Loader from "ui-component/Loader";

const AuthContext = createContext(null);
const SUPERUSER_EMAILS = new Set(["maxiarceci@gmail.com"]);

const withSuperuserPermissions = (userData) => {
  const email = userData?.email?.toLowerCase();
  if (!email || !SUPERUSER_EMAILS.has(email)) return userData;
  return { ...userData, role: "Admin" };
};

export const Auth0Provider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [fichas, setFichas] = useState(null);
  const [tipoFicha, setTipoFicha] = useState(0);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);

  const [userName, setUserName] = useState("");
  const [userPicture, setUserPicture] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const authLockRef = useRef(false);

  // Centraliza seteo de sesión
  const applyLogin = ({ userData, accessToken, fallbackName, fallbackPicture }) => {
    userData = withSuperuserPermissions(userData);

    if (accessToken) localStorage.setItem("serviceToken", accessToken);

    setUserId(userData?.id ?? userData?.user?.id ?? null);
    setRole(userData?.role ?? null);
    setFichas(userData?.cantFichas ?? null);
    setTipoFicha(userData?.tipoFicha ?? 0);

    const name = userData?.username ?? fallbackName ?? "";
    const picture = userData?.imagen ?? fallbackPicture ?? "";
    setUserName(name);
    setUserPicture(picture);

    // Guardar básico por si se recarga
    if (name) localStorage.setItem("userName", name);
    if (picture) localStorage.setItem("userPicture", picture);
    if (userData?.email) localStorage.setItem("userEmail", userData.email);

    setIsAuthenticated(true);
  };

  // Registro -> loguea y entra a /home
  const registerNewUser = async ({ email, name, picture, token }) => {
    const res = await axios.post(
      "/datos/voluntario/",
      {
        username: name,
        email,
        areaIds: [],
        role: "Volunteer",
        imagen: picture,
      },
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );

    const authData = Array.isArray(res.data) ? res.data[0] : res.data;
    const userData = authData?.user ?? authData;
    const accessToken = authData?.access_token;

    applyLogin({ userData, accessToken, fallbackName: name, fallbackPicture: picture });

    // 👉 Entrar a la app privada inmediatamente tras registrar
    navigate("/home", { replace: true });
  };

  const processAuth = async () => {
    if (authLockRef.current) return;
    authLockRef.current = true;
    setIsProcessingAuth(true);
    setIsLoading(true);

    try {
      // 1) Leer params
      const params = new URLSearchParams(location.search);
      const emailParam = params.get("email");
      const nameParam = params.get("name");
      const pictureParam = params.get("picture");
      const hasAuthParams = !!emailParam || !!nameParam || !!pictureParam;

      // Guardar y limpiar URL
      if (emailParam) localStorage.setItem("userEmail", emailParam);
      if (nameParam) localStorage.setItem("userName", nameParam);
      if (pictureParam) localStorage.setItem("userPicture", pictureParam);
      if (hasAuthParams) {
        window.history.replaceState({}, document.title, location.pathname);
      }

      // 2) Fuente: storage (o params recién guardados)
      const email = localStorage.getItem("userEmail") || "";
      const name = localStorage.getItem("userName") || "";
      const picture = localStorage.getItem("userPicture") || "";
      const token = localStorage.getItem("serviceToken") || "";

      if (!email) {
        // No hay datos para autenticar
        setIsAuthenticated(false);
        return;
      }

      // 3) check_register
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

      let res;
      try {
        res = await axios.get(`/datos/voluntario/check_register/${encodeURIComponent(email)}`, { headers });
      } catch (err) {
        // 410 -> no existe: registrar y entrar
        if (err?.response?.status === 410 && email && name && picture) {
          // No limpiar todo: como mucho, token viejo
          localStorage.removeItem("serviceToken");
          await registerNewUser({ email, name, picture, token });
          return; // registerNewUser ya navega y setea sesión
        }
        // 400 -> email ocupado en otra función (tu lógica)
        if (err?.response?.status === 400) {
          setIsAuthenticated(false);
          return;
        }
        throw err;
      }

      // 4) Existe -> loguear (no navegar; queda donde está)
      if (Array.isArray(res.data) && res.data.length > 0) {
        const data = res.data[0];
        const userData = data?.user ?? data;
        const accessToken = data?.access_token;
        applyLogin({ userData, accessToken, fallbackName: name, fallbackPicture: picture });
      } else {
        // No existe pero no devolvió 410: registrar si hay datos
        if (email && name && picture) {
          await registerNewUser({ email, name, picture, token });
          return;
        }
        setIsAuthenticated(false);
      }
    } catch (e) {
      // Si el backend vuelve a avisar 410 aquí, intentá registrar
      const email = localStorage.getItem("userEmail") || "";
      const name = localStorage.getItem("userName") || "";
      const picture = localStorage.getItem("userPicture") || "";
      const token = localStorage.getItem("serviceToken") || "";
      if (e?.response?.status === 410 && email && name && picture) {
        try {
          await registerNewUser({ email, name, picture, token });
          return;
        } catch {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoading(false);
      setIsProcessingAuth(false);
      authLockRef.current = false;
    }
  };

  useEffect(() => {
    processAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const logout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUserName("");
    setUserPicture("");
    setRole(null);
    navigate("/", { replace: true });
  };

  if (isLoading || isProcessingAuth) return <Loader />;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        isProcessingAuth,
        userId,
        role,
        fichas,
        tipoFicha,
        userName,
        userPicture,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
