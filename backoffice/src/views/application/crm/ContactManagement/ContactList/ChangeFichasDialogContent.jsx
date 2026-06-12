import PropTypes from 'prop-types';
import * as React from 'react';
import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import AnimateButton from 'ui-component/extended/AnimateButton';
import { getOrders } from 'store/slices/customer';
import { dispatch, useSelector } from 'store';

import axios from 'utils/axios';

const fichaColors = ['FICHA 1', 'FICHA 2', 'FICHA 3', 'FICHA 4', 'FICHA 5', 'FICHA 6']; // Puedes agregar más si necesitas

const AddContactDialogContent = ({ open, row, handleFichas }) => {
    const [tipoFicha, setTipoFicha] = useState(row?.tipoFicha || "");
    const [errorMessage, setErrorMessage] = useState("");

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        const formData = {
            ...row,
            tipoFicha: tipoFicha
        };

        try {
            await axios.patch(`/datos/paciente/${row.id}`, formData);
            dispatch(getOrders());

            handleFichas();
        } catch (error) {
            if (error.response) {
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
                <Grid item xs={12}>
                    <Autocomplete
                        fullWidth
                        options={fichaColors}
                        value={tipoFicha}
                        onChange={(event, newValue) => setTipoFicha(newValue)}
                        renderInput={(params) => (
                            <TextField {...params} label="Color de Ficha" placeholder="Seleccione el color de la ficha" />
                        )}
                    />
                </Grid>
            </Grid>
            <DialogActions sx={{ p: 3 }}>
                <Stack spacing={1.5} direction="row" justifyContent="flex-end">
                    <AnimateButton>
                        <Button onClick={handleFichas} variant="outlined">
                            Cancelar
                        </Button>
                    </AnimateButton>
                    <AnimateButton>
                        <Button variant="contained" onClick={handleFormSubmit}>
                            Asignar Ficha
                        </Button>
                    </AnimateButton>
                </Stack>
            </DialogActions>
            {errorMessage && <p style={{ color: "red", textAlign: "center" }}>{errorMessage}</p>}
        </DialogContent>
    );
};

AddContactDialogContent.propTypes = {
    row: PropTypes.object.isRequired,
    handleFichas: PropTypes.func.isRequired
};

export default AddContactDialogContent;
