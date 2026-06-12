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
import { useAuth } from 'contexts/Auth0Context';

const AddContactDialogContent = ({ row, handleToggleAddDialog }) => {
    const [nombre, setNombre] = useState(row?.nombre || "");
    const [telefono, setTelefono] = useState(row?.telefono || "");
    const [email, setEmail] = useState(row?.email || "");
    const [imagen, setImagen] = useState(row?.imagen || "");
    const [fechaNacimiento, setFechaNacimiento] = useState(dayjs());
    const [pacientesSeleccionados, setPacientesSeleccionados] = useState(
        row?.pacientes?.map((p) => p.id) || []
    );

    const [errorMessage, setErrorMessage] = useState("");

    const { role } = useAuth();


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
            fichasCobradas: 0,
            fichasPendientes: 0,
            telefono,
            imagen,
            role: "Terapeuta",
            pacientes: pacientesSeleccionados
        };

        try {
            if (!row) {

                await axios.post('/datos/terapeuta/', formData);
            }
            else {
                await axios.patch(`/datos/terapeuta/${row.id}`, formData)
            }
            dispatch(getOrders(role));
            handleToggleAddDialog();

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
                            label="Nombre y Apellido"
                            placeholder="Introduzca el nombre y el apellido"
                            value={nombre}
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
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Correo electrónico"
                            placeholder="Introduzca el correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Autocomplete
                            multiple
                            options={pacientes || []}
                            getOptionLabel={(option) => option.nombre}
                            value={pacientes?.filter((p) => pacientesSeleccionados.includes(p.id)) || []}
                            onChange={(event, newValue) => setPacientesSeleccionados(newValue.map((p) => p.id))}
                            renderInput={(params) => (
                                <TextField {...params} label="Seleccionar Pacientes" placeholder="Seleccione uno o más pacientes" />
                            )}
                        />

                    </Grid>
                    <Grid item xs={12} sm={12} fullWidth>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DesktopDatePicker
                                fullWidth
                                label="Fecha de nacimiento"
                                value={fechaNacimiento}
                                onChange={(newValue) => setFechaNacimiento(newValue)}
                            />
                        </LocalizationProvider>
                    </Grid>

                </Grid>
            </Grid>
            <DialogActions sx={{ p: 3 }}>
                <Stack spacing={1.5} direction="row" justifyContent="flex-end">
                    <AnimateButton>
                        <Button onClick={handleToggleAddDialog} variant="outlined">
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
