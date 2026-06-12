import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
// ❌ import { ClerkProvider } from "@clerk/clerk-react"; // ya no se usa
import { BrowserRouter } from "react-router-dom";
import ThemeCustomization from "./themes/index.jsx";
import { Auth0Provider } from "./contexts/Auth0Context.jsx";
import { store, persister } from "./store"; // Asegúrate de que la ruta sea correcta
import App from "./App.jsx";
import "./index.css";
import Loader from "./ui-component/Loader";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "./contexts/Auth0Context.jsx";

const root = createRoot(document.getElementById("root"));
console.log(import.meta.env.VITE_STRIPE_KEY, import.meta.env.VITE_STRIPE_SECRET_KEY);

const LoadingOverlay = () => (
  <Box
    sx={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 9999
    }}
  >
    <CircularProgress />
  </Box>
);

// Este componente usa useAuth, así que debe ir DEBAJO de Auth0Provider
const AppWithLoading = () => {
  const { isLoading } = useAuth();
  return (
    <>
      {isLoading && <LoadingOverlay />}
      <Suspense fallback={<Loader />}>
        <Provider store={store}>
          <PersistGate loading={<Loader />} persistor={persister}>
            <ThemeCustomization>
              <App />
            </ThemeCustomization>
          </PersistGate>
        </Provider>
      </Suspense>
    </>
  );
};

root.render(
  <BrowserRouter>
    <Auth0Provider>
      <AppWithLoading />
    </Auth0Provider>
  </BrowserRouter>
);
