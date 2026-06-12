import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

// third party
import { Formik } from 'formik';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';



import { SignInButton, useSignIn } from "@clerk/clerk-react";
import GoogleIcon from "@mui/icons-material/Google"; // Para el icono de Google
import axios from 'utils/axios';
// ===============================|| JWT LOGIN ||=============================== //

const JWTLogin = ({ loginProp, ...others }) => {
    const theme = useTheme();
    const { signIn } = useSignIn();
    const { login } = useAuth();
    const scriptedRef = useScriptRef();
    // const { user } = useUser(); // Obtiene el usuario autenticado
    const [checked, setChecked] = React.useState(true);

    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };


    const handleGoogleSignIn = async () => {
        await signIn.authenticateWithRedirect({
            strategy: "oauth_google",
        });
    };

    return (
        <div
        >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                <div>


                    <Box sx={{ mt: 2 }}>
                        <SignInButton>
                            <AnimateButton>
                                <Button
                                    startIcon={<GoogleIcon />}
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    variant="outlined"
                                >

                                    Ingresar con Google
                                </Button>

                    </AnimateButton>
                        </SignInButton>
                </Box>
                </div>
    )
}
        </div >
    );
};

JWTLogin.propTypes = {
    loginProp: PropTypes.number
};

export default JWTLogin;
