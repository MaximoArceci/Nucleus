import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import { LocalizationProvider, MobileDateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third-party
import _ from 'lodash-es';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project imports
import ColorPalette from './ColorPalette';

import { gridSpacing } from 'store/constant';

// assets
import DateRangeIcon from '@mui/icons-material/DateRange';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from 'contexts/Auth0Context';
// constant
import { setSeconds, setMilliseconds } from 'date-fns';
import { InputLabel, MenuItem, Select } from '@mui/material';

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import { useState } from "react";

const MeetLinkDisplay = ({ link }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar el enlace", err);
    }
  };

  return (
    <Grid item xs={12}>
      <FormHelperText>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#e8f0fe",
            padding: "8px 12px",
            borderRadius: "8px",
            marginTop: "4px",
          }}
        >
          <VideoCallIcon style={{ color: "#34a853" }} />
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#1a73e8",
              textDecoration: "none",
              fontWeight: 500,
              fontSize: "0.95rem",
              flexGrow: 1,
            }}
          >
            Unirse a la videollamada
          </a>
          <Tooltip title={copied ? "¡Copiado!" : "Copiar enlace"}>
            <IconButton size="small" onClick={handleCopy}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </FormHelperText>
    </Grid>
  );
};


const getInitialValues = (event, range) => {
    const { userId } = useAuth();
    let start = range ? new Date(range.start) : new Date();
    let end = new Date(start.getTime() + 45 * 60000);

    start = setMilliseconds(setSeconds(start, start.getSeconds()), 0);
    end = setMilliseconds(setSeconds(end, end.getSeconds()), 0);

    const newEvent = {
        guestId: event?.guestId,
        ownerId: userId,
        tipoGuest: event?.role,
        link: '',
        title: '',
        description: '',
        color: '#5a82e5',
        textColor: '',
        allDay: false,
        start,
        end,
    };

    if (event || range) {
        return _.merge({}, newEvent, event);
    }

    return newEvent;
};

// ==============================|| CALENDAR EVENT ADD / EDIT / DELETE ||============================== //

const AddEventFrom = ({ event, range, handleDelete, handleCreate, handleUpdate, onCancel, pacientes, terapeutas, candidatos, openSnackbar, setOpenSnackbar, selectedUser }) => {
    const theme = useTheme();
    const isCreating = !event;
    const [errorMessage, setErrorMessage] = useState();
    const EventSchema = Yup.object().shape({
        title: Yup.string().max(255).required('Se requiere un título'),
        description: Yup.string().max(5000),
        end: Yup.date().when('start', (start, schema) => start && schema.min(start, 'End date must be later than start date')),
        start: Yup.date(),
        color: Yup.string().max(255),
        tipoGuest: Yup.string().max(255),
        textColor: Yup.string().max(255),
        guestId: Yup.number().integer().required('Se requiere un paciente'),
        ownerId: Yup.number().integer(),
        link: Yup.string().max(255),
    });


    const formik = useFormik({
        initialValues: getInitialValues(event, range),
        validationSchema: EventSchema,
        onSubmit: async (values, { resetForm, setSubmitting }) => {

            const formatDate = (date) => {
                return date; // Recorta hasta "YYYY-MM-DDTHH:mm"
            };
            try {
                const cleanedValues = {
                    title: values.title,
                    description: values.description,
                    end: formatDate(values.end),
                    start: formatDate(values.start),
                    color: values.color,
                    tipoGuest: values.tipoGuest,
                    textColor: values.textColor,
                    guestId: values.guestId,
                    ownerId: values.ownerId,
                    link: values.link,
                    allDay: false
                };

                if (event) {
                    await handleUpdate(event.id, cleanedValues);
                } else {
                    await handleCreate(cleanedValues);
                }
                resetForm();
                setOpenSnackbar(true);
            } catch (error) {

            } finally {
                setSubmitting(false);
            }
        },

    });
    const obtenerListaPorTipo = () => {
        switch (tipoSeleccionado) {
            case 0:
                return candidatos || [];
            case 1:
                return pacientes || [];
            case 2:
                return terapeutas || [];
            default:
                return [];
        }
    };






    const [tipoSeleccionado, setTipoSeleccionado] = useState(1);
    const { values, errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;
    const isDisabled = selectedUser !== null;

    return (
        <FormikProvider value={formik}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                    <DialogTitle>{event ? 'Editar Evento' : 'Agregar Evento'}</DialogTitle>
                    <Divider />
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={gridSpacing}>
                            {/* Campo de título */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Título"
                                    {...getFieldProps('title')}
                                    error={Boolean(touched.title && errors.title)}
                                    helperText={touched.title && errors.title}
                                    disabled={isDisabled}
                                />
                            </Grid>

                            {/* Selección de usuario y Autocomplete */}
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel id="tipo-usuario-label">Tipo de Usuario</InputLabel>
                                            <Select
                                                labelId="tipo-usuario-label"
                                                value={tipoSeleccionado}
                                                onChange={(event) => setTipoSeleccionado(event.target.value)}
                                                disabled={isDisabled}
                                            >
                                                <MenuItem value={0}>Candidatos</MenuItem>
                                                <MenuItem value={1}>Pacientes</MenuItem>
                                                <MenuItem value={2}>Terapeutas</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Autocomplete
                                            options={obtenerListaPorTipo()}
                                            getOptionLabel={(option) => option.username}
                                            value={obtenerListaPorTipo().find((p) => p.id === values.guestId) || null}
                                            onChange={(event, newValue) => {
                                                setFieldValue('guestId', newValue ? newValue.id : null);
                                                setFieldValue('tipoGuest', newValue ? newValue.role : '');
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Seleccionar Usuario"
                                                    error={Boolean(touched.guestId && errors.guestId)}
                                                    helperText={touched.guestId && errors.guestId}
                                                    disabled={isDisabled}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>


                            {/* Descripción */}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Descripción"
                                    {...getFieldProps('description')}
                                    error={Boolean(touched.description && errors.description)}
                                    helperText={touched.description && errors.description}
                                    disabled={isDisabled}
                                />
                            </Grid>

                            {/* Fecha y hora */}
                            <Grid item xs={12}>
                                <MobileDateTimePicker
                                    label="Comienzo de sesión"
                                    value={new Date(values.start)}
                                    format="dd/MM/yyyy hh:mm a"
                                    onChange={(date) => {
                                        if (date) {
                                            const truncatedDate = setMilliseconds(setSeconds(date, date.getSeconds()), 0);
                                            setFieldValue('start', truncatedDate);

                                            const endDate = setMilliseconds(setSeconds(new Date(truncatedDate.getTime() + 45 * 60000), 0), 0);
                                            setFieldValue('end', endDate);
                                        }
                                    }}
                                    fullWidth
                                    disabled={isDisabled}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            InputProps: {
                                                endAdornment: (
                                                    <InputAdornment position="end" sx={{ cursor: 'pointer' }}>
                                                        <DateRangeIcon />
                                                    </InputAdornment>
                                                )
                                            }
                                        }
                                    }}
                                />
                                {touched.start && errors.start && <FormHelperText error={true}>{errors.start}</FormHelperText>}
                            </Grid>
                            <Grid item xs={12}>
                                {event && (
                                    <FormHelperText>
                                        <MeetLinkDisplay link={values.link} />
                                        {/* <a
        href={values.link}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: '#1a73e8',
          textDecoration: 'none',
          fontWeight: 500,
          fontSize: '0.95rem',
          display: 'inline-block',
          backgroundColor: '#e8f0fe',
          padding: '6px 12px',
          borderRadius: '8px',
          marginTop: '4px',
        }}
      >
        Unirse a la videollamada
      </a> */}
                                    </FormHelperText>
                                )}
                            </Grid>

                        </Grid>
                    </DialogContent>

                    {/* Acciones del formulario */}
                    <DialogActions sx={{ p: 3 }}>
                        <Grid container justifyContent="space-between" alignItems="center">
                            <Grid item>
                                {!isCreating && !isDisabled && (
                                    <Tooltip title="Borrar sesión">
                                        <IconButton onClick={() => handleDelete(event?.id, event)} size="large">
                                            <DeleteIcon color="error" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Grid>
                            <Grid item>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Button type="button" variant="outlined" onClick={onCancel}>
                                        Cancelar
                                    </Button>
                                    {!isDisabled && (
                                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                                            {event ? 'Editar' : 'Agregar'}
                                        </Button>
                                    )}
                                </Stack>
                            </Grid>
                        </Grid>
                    </DialogActions>
                </Form>
            </LocalizationProvider>
        </FormikProvider>
    );

};

AddEventFrom.propTypes = {
    event: PropTypes.object,
    range: PropTypes.object,
    handleDelete: PropTypes.func,
    handleCreate: PropTypes.func,
    handleUpdate: PropTypes.func,
    onCancel: PropTypes.func
};

export default AddEventFrom;
