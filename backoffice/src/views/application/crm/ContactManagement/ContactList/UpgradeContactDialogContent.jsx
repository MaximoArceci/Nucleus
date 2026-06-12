import PropTypes from 'prop-types';
import * as React from 'react';
import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import AnimateButton from 'ui-component/extended/AnimateButton';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { dispatch, useSelector } from 'store';
import { getOrders } from 'store/slices/customer';
import dayjs from 'dayjs';
import axios from 'utils/axios';

const AddContactDialogContent = ({ row, handleToggleAscendDialog }) => {
    const [nombre, setNombre] = useState(row?.username || "");
    const [telefono, setTelefono] = useState(row?.telefono || "");
    const [email, setEmail] = useState(row?.email || "");
    const [cantFichas, setCantFichas] = useState(row?.cantFichas || 0);
    const [imagen, setImagen] = useState(row?.imagen || "");

    const [errorMessage, setErrorMessage] = useState("");


    const [pacientes, setPacientes] = React.useState();

    React.useEffect(() => {
        const fetchPacientes = async () => {
            try {
                const response = await axios.get("/datos/paciente/");
                setPacientes(response.data);
            } catch (error) {
            }
        };
        fetchPacientes();
    }, []);

    React.useEffect(() => {
    }, [pacientes]); // Solo se ejecuta cuando 'pacientes' cambie
    
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        const formData = {
            nombre,
            username: nombre,
            email,
            tipoFicha: "FICHA 1",
            telefono,
            cantFichas: cantFichas,
            role: "Paciente",
            imagen: imagen
        };

        try {
            if(!row){

                await axios.post(`/datos/paciente/?candidatoId=${row.id}`, formData);
            }
            else{
                await axios.post(`/datos/paciente/?candidatoId=${row.id}`, formData);

            }
                dispatch(getOrders());
                handleToggleAscendDialog();
            
        } catch (error) {
            if (error.response) {
                // Capturar el mensaje exacto del backend si está disponible
                const mensajeError = error.response.data.detail || "Hubo un error al enviar los datos.";
                setErrorMessage(mensajeError);
            } else {
                setErrorMessage("Error inesperado. Intente nuevamente.");
            }
        }
    };

    return (
        <DialogContent sx={{ p: 0 }}>
            <Grid container spacing={1} p={2.5}>
                <Grid item container xs={12} spacing={2.5} my={1}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Nombre"
                            placeholder="Introduzca el nombre y el apellido"
                            value={row?.username}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Teléfono"
                            placeholder="Introduzca el teléfono"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Correo electrónico"
                            placeholder="Introduzca el correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Grid>
 

                </Grid>
            </Grid>
            <DialogActions sx={{ p: 3 }}>
                <Stack spacing={1.5} direction="row" justifyContent="flex-end">
                    <AnimateButton>
                        <Button onClick={handleToggleAscendDialog} variant="outlined">
                            Cancelar
                        </Button>
                    </AnimateButton>
                    <AnimateButton>
                        <Button variant="contained" onClick={handleFormSubmit}>
                            Agregar
                        </Button>
                    </AnimateButton>
                </Stack>
            </DialogActions>
            {errorMessage && <p style={{ color: "red", textAlign: "center" }}>{errorMessage}</p>}
        </DialogContent>
    );
};

AddContactDialogContent.propTypes = {
    row: PropTypes.object,
    pacientes: PropTypes.array,
    handleToggleAddDialog: PropTypes.func.isRequired
};

export default AddContactDialogContent;
