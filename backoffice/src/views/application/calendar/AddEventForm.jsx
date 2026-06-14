import PropTypes from 'prop-types';
import { useState } from 'react';

import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import { LocalizationProvider, MobileDateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
import { setMilliseconds, setSeconds } from 'date-fns';

import { gridSpacing } from 'store/constant';
import { useAuth } from 'contexts/Auth0Context';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DeleteIcon from '@mui/icons-material/Delete';
import VideoCallIcon from '@mui/icons-material/VideoCall';

const participantModes = [
    { value: 'volunteers', label: 'Voluntarios' },
    { value: 'areas', label: 'Areas' },
    { value: 'all', label: 'Todos' }
];

const normalizeDate = (date) => setMilliseconds(setSeconds(new Date(date), new Date(date).getSeconds()), 0);

const MeetLinkDisplay = ({ link }) => {
    const [copied, setCopied] = useState(false);
    if (!link) return null;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <FormHelperText>
            <Stack direction="row" alignItems="center" gap={1} sx={{ bgcolor: '#e8f0fe', px: 1.5, py: 1, borderRadius: 1, mt: 0.5 }}>
                <VideoCallIcon sx={{ color: '#14B8A6' }} />
                <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 500, flexGrow: 1 }}>
                    Unirse a la videollamada
                </a>
                <Tooltip title={copied ? 'Copiado' : 'Copiar enlace'}>
                    <IconButton size="small" onClick={handleCopy}>
                        <ContentCopyIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Stack>
        </FormHelperText>
    );
};

const getInitialValues = (event, range, userId) => {
    const start = normalizeDate(event?.start || range?.start || new Date());
    const end = normalizeDate(event?.end || range?.end || new Date(start.getTime() + 45 * 60000));

    return {
        organizerId: event?.organizerId || userId || 0,
        title: event?.title || '',
        description: event?.description || '',
        start,
        end,
        link: event?.link || '',
        allDay: event?.allDay || false,
        color: event?.color || '#7CB3E9',
        textColor: event?.textColor || '#ffffff',
        participantMode: event?.participantMode || 'volunteers',
        participantVolunteerIds: event?.participantVolunteerIds || [],
        participantAreaIds: event?.participantAreaIds || []
    };
};

const AddEventForm = ({ event, range, handleDelete, handleCreate, handleUpdate, onCancel, volunteers, areas, selectedUser }) => {
    const { userId } = useAuth();
    const isCreating = !event;
    const isReadOnly = selectedUser !== null;

    const EventSchema = Yup.object().shape({
        title: Yup.string().max(255).required('Se requiere un titulo'),
        description: Yup.string().max(5000),
        start: Yup.date().required('Se requiere fecha de inicio'),
        end: Yup.date().min(Yup.ref('start'), 'La fecha de fin debe ser posterior al inicio').required('Se requiere fecha de fin'),
        participantMode: Yup.string().oneOf(['volunteers', 'areas', 'all']).required(),
        participantVolunteerIds: Yup.array().when('participantMode', {
            is: 'volunteers',
            then: (schema) => schema.min(1, 'Selecciona al menos un voluntario'),
            otherwise: (schema) => schema
        }),
        participantAreaIds: Yup.array().when('participantMode', {
            is: 'areas',
            then: (schema) => schema.min(1, 'Selecciona al menos un area'),
            otherwise: (schema) => schema
        })
    });

    const formik = useFormik({
        initialValues: getInitialValues(event, range, userId),
        validationSchema: EventSchema,
        enableReinitialize: true,
        onSubmit: async (values, { resetForm, setSubmitting }) => {
            const payload = {
                organizerId: Number(values.organizerId || userId || 0),
                title: values.title,
                description: values.description,
                start: values.start,
                end: values.end,
                link: values.link,
                allDay: false,
                color: values.color,
                textColor: values.textColor || '#ffffff',
                participantMode: values.participantMode,
                participantVolunteerIds: values.participantMode === 'volunteers' ? values.participantVolunteerIds : [],
                participantAreaIds: values.participantMode === 'areas' ? values.participantAreaIds : []
            };

            try {
                if (event) {
                    await handleUpdate(event.id, payload);
                } else {
                    await handleCreate(payload);
                }
                resetForm();
            } finally {
                setSubmitting(false);
            }
        }
    });

    const { values, errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;

    return (
        <FormikProvider value={formik}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                    <DialogTitle>{event ? 'Editar reunion' : 'Agregar reunion'}</DialogTitle>
                    <Divider />
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={gridSpacing}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Titulo"
                                    {...getFieldProps('title')}
                                    error={Boolean(touched.title && errors.title)}
                                    helperText={touched.title && errors.title}
                                    disabled={isReadOnly}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Descripcion"
                                    {...getFieldProps('description')}
                                    error={Boolean(touched.description && errors.description)}
                                    helperText={touched.description && errors.description}
                                    disabled={isReadOnly}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth disabled={isReadOnly}>
                                    <InputLabel id="participant-mode-label">Participantes</InputLabel>
                                    <Select
                                        labelId="participant-mode-label"
                                        label="Participantes"
                                        value={values.participantMode}
                                        onChange={(selectEvent) => {
                                            setFieldValue('participantMode', selectEvent.target.value);
                                            setFieldValue('participantVolunteerIds', []);
                                            setFieldValue('participantAreaIds', []);
                                        }}
                                    >
                                        {participantModes.map((mode) => (
                                            <MenuItem key={mode.value} value={mode.value}>
                                                {mode.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {values.participantMode === 'volunteers' && (
                                <Grid item xs={12}>
                                    <Autocomplete
                                        multiple
                                        options={volunteers}
                                        getOptionLabel={(option) => option.username || option.email || `Voluntario ${option.id}`}
                                        value={volunteers.filter((volunteer) => values.participantVolunteerIds.includes(volunteer.id))}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        onChange={(autocompleteEvent, selected) => setFieldValue('participantVolunteerIds', selected.map((volunteer) => volunteer.id))}
                                        disabled={isReadOnly}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Seleccionar voluntarios"
                                                error={Boolean(touched.participantVolunteerIds && errors.participantVolunteerIds)}
                                                helperText={touched.participantVolunteerIds && errors.participantVolunteerIds}
                                            />
                                        )}
                                    />
                                </Grid>
                            )}

                            {values.participantMode === 'areas' && (
                                <Grid item xs={12}>
                                    <Autocomplete
                                        multiple
                                        options={areas}
                                        getOptionLabel={(option) => option.name || option.slug || `Area ${option.id}`}
                                        value={areas.filter((area) => values.participantAreaIds.includes(area.id))}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                        onChange={(autocompleteEvent, selected) => setFieldValue('participantAreaIds', selected.map((area) => area.id))}
                                        disabled={isReadOnly}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Seleccionar areas"
                                                error={Boolean(touched.participantAreaIds && errors.participantAreaIds)}
                                                helperText={touched.participantAreaIds && errors.participantAreaIds}
                                            />
                                        )}
                                    />
                                </Grid>
                            )}

                            <Grid item xs={12} md={6}>
                                <MobileDateTimePicker
                                    label="Inicio"
                                    value={new Date(values.start)}
                                    format="dd/MM/yyyy hh:mm a"
                                    disabled={isReadOnly}
                                    onChange={(date) => {
                                        if (!date) return;
                                        const nextStart = normalizeDate(date);
                                        setFieldValue('start', nextStart);
                                        setFieldValue('end', normalizeDate(new Date(nextStart.getTime() + 45 * 60000)));
                                    }}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            error: Boolean(touched.start && errors.start),
                                            helperText: touched.start && errors.start,
                                            InputProps: {
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <DateRangeIcon />
                                                    </InputAdornment>
                                                )
                                            }
                                        }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <MobileDateTimePicker
                                    label="Fin"
                                    value={new Date(values.end)}
                                    format="dd/MM/yyyy hh:mm a"
                                    disabled={isReadOnly}
                                    onChange={(date) => date && setFieldValue('end', normalizeDate(date))}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            error: Boolean(touched.end && errors.end),
                                            helperText: touched.end && errors.end,
                                            InputProps: {
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <DateRangeIcon />
                                                    </InputAdornment>
                                                )
                                            }
                                        }
                                    }}
                                />
                            </Grid>

                            {event?.link && (
                                <Grid item xs={12}>
                                    <MeetLinkDisplay link={values.link} />
                                </Grid>
                            )}
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ p: 3 }}>
                        <Grid container justifyContent="space-between" alignItems="center">
                            <Grid item>
                                {!isCreating && !isReadOnly && (
                                    <Tooltip title="Borrar reunion">
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
                                    {!isReadOnly && (
                                        <Button type="submit" variant="contained" disabled={isSubmitting}>
                                            {event ? 'Guardar' : 'Agregar'}
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

AddEventForm.propTypes = {
    event: PropTypes.object,
    range: PropTypes.object,
    handleDelete: PropTypes.func,
    handleCreate: PropTypes.func,
    handleUpdate: PropTypes.func,
    onCancel: PropTypes.func,
    volunteers: PropTypes.array,
    areas: PropTypes.array,
    selectedUser: PropTypes.object
};

export default AddEventForm;
