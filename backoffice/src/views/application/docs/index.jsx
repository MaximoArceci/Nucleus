import * as React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

import MainCard from 'ui-component/cards/MainCard';
import axios from 'utils/axios';

const emptyDraft = {
    id: null,
    title: '',
    content: '',
    areaId: ''
};

const getErrorMessage = (error) => {
    const detail = error?.response?.data?.detail;
    if (Array.isArray(detail)) return detail.map((item) => item.msg).join(', ');
    if (detail) return detail;
    if (error?.response?.data?.message) return error.response.data.message;
    if (typeof error?.response?.data === 'string') return error.response.data;
    if (error?.message) return error.message;
    return 'No se pudo completar la accion.';
};

const asArray = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    if (Array.isArray(value?.items)) return value.items;
    if (Array.isArray(value?.results)) return value.results;
    if (Array.isArray(value?.documents)) return value.documents;
    if (Array.isArray(value?.areas)) return value.areas;
    return [];
};

const Docs = () => {
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState('');
    const [areas, setAreas] = React.useState([]);
    const [documents, setDocuments] = React.useState([]);
    const [selectedAreaId, setSelectedAreaId] = React.useState('');
    const [draft, setDraft] = React.useState(emptyDraft);

    const loadBase = React.useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [areasResponse, docsResponse] = await Promise.all([
                axios.get('/datos/area/'),
                axios.get('/documentos/')
            ]);
            const nextAreas = asArray(areasResponse.data);
            const nextDocs = asArray(docsResponse.data);
            setAreas(nextAreas);
            setDocuments(nextDocs);
            const initialAreaId = selectedAreaId || nextDocs[0]?.areaId || nextAreas[0]?.id || '';
            setSelectedAreaId(initialAreaId);
            if (!draft.id && nextDocs.length > 0) {
                const firstDoc = nextDocs.find((doc) => doc.areaId === initialAreaId) || nextDocs[0];
                setDraft({
                    id: firstDoc.id,
                    title: firstDoc.title,
                    content: firstDoc.content || '',
                    areaId: firstDoc.areaId
                });
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [draft.id, selectedAreaId]);

    React.useEffect(() => {
        loadBase();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const visibleDocuments = documents.filter((doc) => Number(doc.areaId) === Number(selectedAreaId));

    const selectDocument = (doc) => {
        setDraft({
            id: doc.id,
            title: doc.title,
            content: doc.content || '',
            areaId: doc.areaId
        });
    };

    const newDocument = () => {
        setDraft({
            ...emptyDraft,
            areaId: selectedAreaId || areas[0]?.id || '',
            title: 'Nuevo documento'
        });
    };

    const saveDocument = async () => {
        setSaving(true);
        setError('');
        const payload = {
            title: draft.title,
            content: draft.content,
            areaId: Number(draft.areaId || selectedAreaId),
            archived: false
        };
        try {
            let response;
            if (draft.id) {
                response = await axios.patch(`/documentos/${draft.id}`, payload);
            } else {
                response = await axios.post('/documentos/', payload);
            }
            const saved = response.data;
            setDraft({ id: saved.id, title: saved.title, content: saved.content || '', areaId: saved.areaId });
            const docsResponse = await axios.get('/documentos/');
            setDocuments(asArray(docsResponse.data));
            setSelectedAreaId(saved.areaId);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const deleteDocument = async () => {
        if (!draft.id || !window.confirm(`Eliminar documento "${draft.title}"?`)) return;
        setSaving(true);
        setError('');
        try {
            await axios.delete(`/documentos/${draft.id}`);
            const docsResponse = await axios.get('/documentos/');
            const nextDocs = asArray(docsResponse.data);
            setDocuments(nextDocs);
            const nextDoc = nextDocs.find((doc) => Number(doc.areaId) === Number(selectedAreaId));
            setDraft(nextDoc ? { id: nextDoc.id, title: nextDoc.title, content: nextDoc.content || '', areaId: nextDoc.areaId } : { ...emptyDraft, areaId: selectedAreaId });
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
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
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2}>
                        <Box>
                            <Typography variant="h2">Docs</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Bloc de notas por area con documentos internos y rich text.
                            </Typography>
                        </Box>
                        <Stack direction="row" gap={1}>
                            <TextField
                                select
                                size="small"
                                label="Area"
                                value={selectedAreaId}
                                onChange={(event) => {
                                    const areaId = event.target.value;
                                    setSelectedAreaId(areaId);
                                    const nextDoc = documents.find((doc) => Number(doc.areaId) === Number(areaId));
                                    setDraft(nextDoc ? { id: nextDoc.id, title: nextDoc.title, content: nextDoc.content || '', areaId: nextDoc.areaId } : { ...emptyDraft, areaId });
                                }}
                                sx={{ minWidth: 220 }}
                            >
                                {areas.map((area) => (
                                    <MenuItem key={area.id} value={area.id}>
                                        {area.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={newDocument}>
                                Nuevo doc
                            </Button>
                        </Stack>
                    </Stack>
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}
                </Box>
                <Divider sx={{ mt: 2 }} />

                <Stack direction={{ xs: 'column', md: 'row' }} sx={{ minHeight: 650 }}>
                    <Paper variant="outlined" sx={{ width: { xs: '100%', md: 280 }, borderRadius: 0, borderTop: 0, borderBottom: 0, p: 1 }}>
                        <List dense>
                            {visibleDocuments.length === 0 && (
                                <ListItemText sx={{ px: 2, py: 1 }} primary="Sin documentos" secondary="Crea el primero para esta area." />
                            )}
                            {visibleDocuments.map((doc) => (
                                <ListItemButton key={doc.id} selected={doc.id === draft.id} onClick={() => selectDocument(doc)}>
                                    <ListItemText primary={doc.title} secondary={doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : ''} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Paper>

                    <Box sx={{ flex: 1, p: 3 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
                            <TextField
                                fullWidth
                                label="Titulo"
                                value={draft.title}
                                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                            />
                            <Stack direction="row" gap={1}>
                                <Button variant="outlined" startIcon={<SaveIcon />} disabled={saving || !draft.title || !selectedAreaId} onClick={saveDocument}>
                                    Guardar
                                </Button>
                                <IconButton color="error" disabled={!draft.id || saving} onClick={deleteDocument}>
                                    <DeleteIcon />
                                </IconButton>
                            </Stack>
                        </Stack>
                        <Paper variant="outlined" sx={{ '.ql-container': { minHeight: 440, fontSize: '1rem' }, '.ql-toolbar': { borderTopLeftRadius: 8, borderTopRightRadius: 8 }, '.ql-container.ql-snow': { borderBottomLeftRadius: 8, borderBottomRightRadius: 8 } }}>
                            <ReactQuill theme="snow" value={draft.content} onChange={(content) => setDraft((current) => ({ ...current, content }))} />
                        </Paper>
                    </Box>
                </Stack>
            </MainCard>
        </div>
    );
};

export default Docs;
