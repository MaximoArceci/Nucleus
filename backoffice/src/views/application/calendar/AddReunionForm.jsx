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
import axiosServices from 'utils/axios';
// constant
const getInitialValues = (event, range) => {
    const { userId } = useAuth();
    const newEvent = {
     
        description: '',
   
    };

    if (event || range) {
        return _.merge({}, newEvent, event);
    }

    return newEvent;
};

// ==============================|| CALENDAR EVENT ADD / EDIT / DELETE ||============================== //

const AddReunionForm = ({ event, range, handleDelete, handleCreate, handleUpdate, onCancel, pacientes }) => {
    const theme = useTheme();
    const isCreating = !event;


 
    const EventSchema = Yup.object().shape({
    
        description: Yup.string().max(5000),

    });

    const formik = useFormik({
        initialValues: getInitialValues(event, range),
        validationSchema: EventSchema,
        onSubmit: async (values, { resetForm, setSubmitting }) => {
            try {
                const data = {
                    description: values.description,
                };

                if (event) {
                    handleUpdate(event.id, data.description);
                } else {
                    axiosServices.post(`reuniones/reunion_administracion/solicitar_reunion?motivo=${data.description}`)
                }
                resetForm();
                onCancel();
                setSubmitting(false);
            } catch (error) {
            }
        }
    });



    const { values, errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;
    return (
        <FormikProvider value={formik}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                    <DialogTitle>{event ? 'Solicitar turno' : 'Solicitar turno'}</DialogTitle>
                    <Divider />
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={gridSpacing}>
                            {/* <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Título"
                                    {...getFieldProps('title')}
                                    error={Boolean(touched.title && errors.title)}
                                    helperText={touched.title && errors.title}
                                />
                            </Grid> */}
                            {/* <Grid item xs={12}>
                                <Autocomplete
                                    options={pacientes || []} // Asegura que `options` sea un array
                                    getOptionLabel={(option) => option.username}
                                    value={(pacientes || []).find((p) => p.id === values.pacienteId) || null} // Accede correctamente al array
                                    onChange={(event, newValue) => setFieldValue('pacienteId', newValue ? newValue.id : null)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Seleccionar Paciente"
                                            error={Boolean(touched.pacienteId && errors.pacienteId)}
                                            helperText={touched.pacienteId && errors.pacienteId}
                                        />
                                    )}
                                />
                            </Grid> */}

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Motivo"
                                    {...getFieldProps('description')}
                                    error={Boolean(touched.description && errors.description)}
                                    helperText={touched.description && errors.description}
                                />
                            </Grid>
                            {/* <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Switch checked={values.allDay} {...getFieldProps('allDay')} />}
                                    label="Día completo"
                                />
                            </Grid> */}
                            {/* <Grid item xs={12}>
                                <MobileDateTimePicker
                                    label="Comienzo de sesión"
                                    value={new Date(values.start)}
                                    format="dd/MM/yyyy hh:mm a"
                                    onChange={(date) => {
                                        setFieldValue('start', date);
                                        if (date) {
                                            const endDate = new Date(date.getTime() + 45 * 60000); // Suma 45 minutos
                                            setFieldValue('end', endDate);
                                        }
                                    }}
                                    

                                    fullWidth // <-- Hace que el DatePicker ocupe todo el ancho
                                    slotProps={{
                                        textField: {
                                            fullWidth: true, // <-- Asegura que el TextField dentro del picker ocupe todo el ancho
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
                            </Grid> */}

                            {/* <Grid item xs={12} md={6}>
                                <MobileDateTimePicker
                                    label="Fin de sesión"
                                    value={new Date(values.end)}
                                    format="dd/MM/yyyy hh:mm a"
                                    onChange={(date) => setFieldValue('end', date)}
                                    slotProps={{
                                        textField: {
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
                                {touched.end && errors.end && <FormHelperText error={true}>{errors.end}</FormHelperText>}
                            </Grid> */}
                            {/* <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1">Color de fondo</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl>
                                            <RadioGroup
                                                row
                                                aria-label="color"
                                                {...getFieldProps('color')}
                                                onChange={(e) => setFieldValue('color', e.target.value)}
                                                name="color-radio-buttons-group"
                                                sx={{ '& .MuiFormControlLabel-root': { mr: 0 } }}
                                            >
                                                {backgroundColor.map((item, index) => (
                                                    <ColorPalette key={index} value={item.value} color={item.color} />
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1">Color de texto</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <FormControl component="fieldset">
                                            <RadioGroup
                                                row
                                                aria-label="textColor"
                                                {...getFieldProps('textColor')}
                                                onChange={(e) => setFieldValue('textColor', e.target.value)}
                                                name="text-color-radio-buttons-group"
                                                sx={{ '& .MuiFormControlLabel-root': { mr: 0 } }}
                                            >
                                                <FormControlLabel
                                                    value=""
                                                    control={<Radio color="default" />}
                                                    label="Default"
                                                    sx={{ pr: 1 }}
                                                />
                                                {textColor.map((item, index) => (
                                                    <ColorPalette key={index} value={item.value} color={item.color} />
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Grid> */}
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ p: 3 }}>
                        <Grid container justifyContent="space-between" alignItems="center">
                            <Grid item>
                                {!isCreating && (
                                    <Tooltip title="Borrar sesión">
                                        <IconButton onClick={() => handleDelete(event?.id)} size="large">
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
                                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                                        {event ? 'Solicitar' : 'Solicitar'}
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    </DialogActions>
                </Form>
            </LocalizationProvider>
        </FormikProvider>
    );
};

AddReunionForm.propTypes = {
    event: PropTypes.object,
    range: PropTypes.object,
    handleDelete: PropTypes.func,
    handleCreate: PropTypes.func,
    handleUpdate: PropTypes.func,
    onCancel: PropTypes.func
};

export default AddReunionForm;
