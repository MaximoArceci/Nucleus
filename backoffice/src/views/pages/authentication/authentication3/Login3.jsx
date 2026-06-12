import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from 'contexts/Auth0Context';

// material-ui
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

// project imports
import AuthWrapper1 from '../AuthWrapper1';
import AuthCardWrapper from '../AuthCardWrapper';
import Logo from 'ui-component/Logo';
import AuthFooter from 'ui-component/cards/AuthFooter';
import { SignInButton } from '@clerk/clerk-react';
import { Button } from '@mui/material';
import GoogleIcon from "@mui/icons-material/Google"; // Para el icono de Google

// assets

// ================================|| AUTH3 - LOGIN ||================================ //

const Login = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useAuth(); // <--- Agrega isLoading
    const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const url = import.meta.env.VITE_APP_API_URL;

    const dev = import.meta.env.VITE_APP_DEV ?? "false";
    const handleLoginWithGoogle = async () => {
        try {
          const response = await fetch(url + "/reuniones/auth/auth?dev=" + dev);
          const data = await response.json();
          if (data.auth_url) {
            window.location.href = data.auth_url;
          }
        } catch (error) {
          console.error("Error al obtener el auth_url", error);
        }
      };

      

    return (
        <AuthWrapper1>
            <Grid container direction="column" justifyContent="flex-end" sx={{ minHeight: '100vh' }}>
                <Grid item xs={12}>
                    <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: 'calc(100vh - 68px)' }}>
                        <Grid item sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
                            <AuthCardWrapper>
                                <Grid container spacing={2} alignItems="center" justifyContent="center">
                                    <Grid item sx={{ mb: 3 }}>
                                        <Link to="/" aria-label="logo">
                                            <Logo />
                                        </Link>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid
                                            container
                                            direction={{ xs: 'column-reverse', md: 'row' }}
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            <Grid item>
                                                <Stack alignItems="center" justifyContent="center" spacing={1}>
                                                    <Typography color="secondary.main" gutterBottom variant={downMD ? 'h3' : 'h2'}>
                                                        Hola, bienvenido
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        fontSize="16px"
                                                        textAlign={{ xs: 'center', md: 'inherit' }}
                                                    >
                                                        Ingrese sus datos para continuar
                                                    </Typography>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                        {/* <SignInButton redirectUrl="/home" > */}
                                                <Button
                                                    startIcon={<GoogleIcon />}
                                                    color="primary"
                                                    fullWidth
                                                    size="large"
                                                    variant="outlined"
                                                    onClick={handleLoginWithGoogle} // Cambiado a la función de inicio de sesión con Google
                                                >

                                                    Ingresar con Google
                                                </Button>
                                        {/* </SignInButton> */}
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Divider />
                                    </Grid>
                                </Grid>
                            </AuthCardWrapper>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
                    <AuthFooter />
                </Grid>
            </Grid>
        </AuthWrapper1>
    );
};

export default Login;
