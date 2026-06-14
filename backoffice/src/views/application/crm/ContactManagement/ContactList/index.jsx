import * as React from 'react';
import { useLocation } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import MainCard from 'ui-component/cards/MainCard';
import Avatar from 'ui-component/extended/Avatar';
import axios from 'utils/axios';

const emptyUserForm = {
    username: '',
    email: '',
    role: 'Volunteer',
    imagen: '',
    areaIds: [],
    activo: true
};

const emptyAreaForm = {
    name: '',
    slug: '',
    description: '',
    active: true
};

const makeSlug = (value) =>
    value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

const getErrorMessage = (error) => {
    const detail = error?.response?.data?.detail;
    if (Array.isArray(detail)) return detail.map((item) => item.msg).join(', ');
    return detail || 'No se pudo guardar el cambio.';
};

const UsersAreasManagement = () => {
    const location = useLocation();
    const initialTab = location.pathname.includes('/areas') ? 'areas' : 'users';

    const [tab, setTab] = React.useState(initialTab);
    const [users, setUsers] = React.useState([]);
    const [areas, setAreas] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState('');
    const [userDialogOpen, setUserDialogOpen] = React.useState(false);
    const [areaDialogOpen, setAreaDialogOpen] = React.useState(false);
    const [editingUser, setEditingUser] = React.useState(null);
    const [editingArea, setEditingArea] = React.useState(null);
    const [userForm, setUserForm] = React.useState(emptyUserForm);
    const [areaForm, setAreaForm] = React.useState(emptyAreaForm);

    const areaById = React.useMemo(() => new Map(areas.map((area) => [area.id, area])), [areas]);

    const loadData = React.useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [usersResponse, areasResponse] = await Promise.all([
                axios.get('/datos/voluntario/'),
                axios.get('/datos/area/')
            ]);
            setUsers(usersResponse.data || []);
            setAreas(areasResponse.data || []);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        loadData();
    }, [loadData]);

    React.useEffect(() => {
        setTab(initialTab);
    }, [initialTab]);

    const openCreateUser = () => {
        setEditingUser(null);
        setUserForm(emptyUserForm);
        setUserDialogOpen(true);
    };

    const openEditUser = (user) => {
        setEditingUser(user);
        setUserForm({
            username: user.username || '',
            email: user.email || '',
            role: user.role || 'Volunteer',
            imagen: user.imagen || '',
            areaIds: user.areaIds || [],
            activo: user.activo !== false
        });
        setUserDialogOpen(true);
    };

    const openCreateArea = () => {
        setEditingArea(null);
        setAreaForm(emptyAreaForm);
        setAreaDialogOpen(true);
    };

    const openEditArea = (area) => {
        setEditingArea(area);
        setAreaForm({
            name: area.name || '',
            slug: area.slug || '',
            description: area.description || '',
            active: area.active !== false
        });
        setAreaDialogOpen(true);
    };

    const handleUserSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        const payload = {
            ...userForm,
            areaIds: userForm.areaIds.map(Number)
        };

        try {
            if (editingUser) {
                await axios.patch(`/datos/voluntario/${editingUser.id}`, payload);
            } else {
                await axios.post('/datos/voluntario/', payload);
            }
            setUserDialogOpen(false);
            await loadData();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleAreaSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        const payload = {
            ...areaForm,
            slug: areaForm.slug || makeSlug(areaForm.name)
        };

        try {
            if (editingArea) {
                await axios.patch(`/datos/area/${editingArea.id}`, payload);
            } else {
                await axios.post('/datos/area/', payload);
            }
            setAreaDialogOpen(false);
            await loadData();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteUser = async (user) => {
        if (!window.confirm(`Eliminar usuario ${user.username}?`)) return;
        setError('');
        try {
            await axios.delete(`/datos/voluntario/?id=${user.id}`);
            await loadData();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const handleDeleteArea = async (area) => {
        if (!window.confirm(`Eliminar area ${area.name}?`)) return;
        setError('');
        try {
            await axios.delete(`/datos/area/?id=${area.id}`);
            await loadData();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div className="min-h-screen bg-navbar">
            <MainCard content={false}>
                <Box sx={{ px: 3, pt: 3 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
                        <Box>
                            <Typography variant="h2">Gestion de usuarios y areas</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Administra voluntarios, roles operativos y pertenencia a una o varias areas.
                            </Typography>
                        </Box>
                        <Stack direction="row" gap={1}>
                            <Button variant="outlined" startIcon={<AddIcon />} onClick={openCreateArea}>
                                Nueva area
                            </Button>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateUser}>
                                Nuevo usuario
                            </Button>
                        </Stack>
                    </Stack>
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}
                    <Tabs value={tab} onChange={(event, value) => setTab(value)} sx={{ mt: 2 }}>
                        <Tab value="users" label="Usuarios" />
                        <Tab value="areas" label="Areas" />
                    </Tabs>
                </Box>
                <Divider />

                {tab === 'users' && (
                    <TableContainer>
                        <Table sx={{ minWidth: 760 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Usuario</TableCell>
                                    <TableCell>Rol</TableCell>
                                    <TableCell>Areas</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell align="right">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow hover key={user.id}>
                                        <TableCell>
                                            <Stack direction="row" spacing={1.25} alignItems="center">
                                                <Avatar alt={user.username} src={user.imagen} />
                                                <Stack>
                                                    <Typography variant="h5">{user.username}</Typography>
                                                    <Typography variant="subtitle2">{user.email}</Typography>
                                                </Stack>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell>
                                            <Stack direction="row" gap={0.75} flexWrap="wrap">
                                                {(user.areaIds || []).length > 0 ? (
                                                    user.areaIds.map((areaId) => (
                                                        <Chip key={areaId} size="small" label={areaById.get(areaId)?.name || `Area ${areaId}`} />
                                                    ))
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">
                                                        Sin areas
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Chip size="small" color={user.activo === false ? 'default' : 'success'} label={user.activo === false ? 'Inactivo' : 'Activo'} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton aria-label="Editar usuario" onClick={() => openEditUser(user)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton aria-label="Eliminar usuario" onClick={() => handleDeleteUser(user)}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {tab === 'areas' && (
                    <TableContainer>
                        <Table sx={{ minWidth: 720 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Area</TableCell>
                                    <TableCell>Slug</TableCell>
                                    <TableCell>Voluntarios</TableCell>
                                    <TableCell>Estado</TableCell>
                                    <TableCell align="right">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {areas.map((area) => {
                                    const members = users.filter((user) => (user.areaIds || []).includes(area.id));
                                    return (
                                        <TableRow hover key={area.id}>
                                            <TableCell>
                                                <Stack>
                                                    <Typography variant="h5">{area.name}</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {area.description || 'Sin descripcion'}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>{area.slug}</TableCell>
                                            <TableCell>{members.length}</TableCell>
                                            <TableCell>
                                                <Chip size="small" color={area.active === false ? 'default' : 'success'} label={area.active === false ? 'Inactiva' : 'Activa'} />
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton aria-label="Editar area" onClick={() => openEditArea(area)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton aria-label="Eliminar area" onClick={() => handleDeleteArea(area)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </MainCard>

            <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} fullWidth maxWidth="sm">
                <form onSubmit={handleUserSubmit}>
                    <DialogTitle>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h4">{editingUser ? 'Editar usuario' : 'Nuevo usuario'}</Typography>
                            <IconButton onClick={() => setUserDialogOpen(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Stack>
                    </DialogTitle>
                    <Divider />
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Nombre"
                                    value={userForm.username}
                                    onChange={(event) => setUserForm((current) => ({ ...current, username: event.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    required
                                    type="email"
                                    label="Email"
                                    value={userForm.email}
                                    onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Rol"
                                    value={userForm.role}
                                    onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="URL de imagen"
                                    value={userForm.imagen}
                                    onChange={(event) => setUserForm((current) => ({ ...current, imagen: event.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Autocomplete
                                    multiple
                                    options={areas}
                                    getOptionLabel={(option) => option.name}
                                    value={areas.filter((area) => userForm.areaIds.includes(area.id))}
                                    onChange={(event, newValue) => setUserForm((current) => ({ ...current, areaIds: newValue.map((area) => area.id) }))}
                                    renderInput={(params) => <TextField {...params} label="Areas" placeholder="Asignar una o mas areas" />}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={userForm.activo}
                                            onChange={(event) => setUserForm((current) => ({ ...current, activo: event.target.checked }))}
                                        />
                                    }
                                    label="Usuario activo"
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button variant="outlined" onClick={() => setUserDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained" disabled={saving}>
                            {editingUser ? 'Guardar' : 'Crear usuario'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={areaDialogOpen} onClose={() => setAreaDialogOpen(false)} fullWidth maxWidth="sm">
                <form onSubmit={handleAreaSubmit}>
                    <DialogTitle>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h4">{editingArea ? 'Editar area' : 'Nueva area'}</Typography>
                            <IconButton onClick={() => setAreaDialogOpen(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Stack>
                    </DialogTitle>
                    <Divider />
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Nombre"
                                    value={areaForm.name}
                                    onChange={(event) => {
                                        const name = event.target.value;
                                        setAreaForm((current) => ({ ...current, name, slug: editingArea ? current.slug : makeSlug(name) }));
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Slug"
                                    value={areaForm.slug}
                                    onChange={(event) => setAreaForm((current) => ({ ...current, slug: makeSlug(event.target.value) }))}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    label="Descripcion"
                                    value={areaForm.description}
                                    onChange={(event) => setAreaForm((current) => ({ ...current, description: event.target.value }))}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={areaForm.active}
                                            onChange={(event) => setAreaForm((current) => ({ ...current, active: event.target.checked }))}
                                        />
                                    }
                                    label="Area activa"
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button variant="outlined" onClick={() => setAreaDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained" disabled={saving}>
                            {editingArea ? 'Guardar' : 'Crear area'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </div>
    );
};

export default UsersAreasManagement;
