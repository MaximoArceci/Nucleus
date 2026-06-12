import { Autocomplete, TextField, Button, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import { dispatch } from 'store';
import { getEvents } from 'store/slices/calendar';
import axios from 'utils/axios';

const UserSelector = ({ setLoading, setEvents, events, selectedUser, setSelectedUser }) => {
    const [users, setUsers] = useState([]);
    const [originales, setOriginales] = useState(events);

    useEffect(() => {
        fetchAllUsers();
    }, []);

    const fetchAllUsers = async () => {
        try {
            const response = await axios.get('/datos/administrador/allUsers');
            const data = response.data;

            const formattedUsers = [
                ...data[0].map(user => ({
                    ...user,
                    displayName: user.username,
                    role: 'Candidato'
                })),
                ...data[1].map(user => ({
                    ...user,
                    displayName: user.nombre || user.username,
                    role: 'Paciente'
                })),
                ...data[2].map(user => ({
                    ...user,
                    displayName: user.nombre || user.username,
                    role: 'Terapeuta'
                })),
            ];

            setUsers(formattedUsers);
        } catch (error) {
        }
    };

    const handleUserSelect = async (event, newValue) => {
        setSelectedUser(newValue);

        if (newValue) {
            const payload = {
                role: newValue.role,
                Id: newValue.id
            };

            try {
                const response = await axios.patch('/reuniones/reunion_inicial/reuniones_all/', payload);

                const eventos = response.data;

                setEvents(eventos);
                dispatch(getEvents(formattedEvents));

            } catch (error) {
            }
        }
    };

    const handleResetCalendar = () => {
        setSelectedUser(null);  // Limpia selección
    
        const formattedEvents = events.map(evento => ({
            id: evento.id,
            title: evento.title,
            start: new Date(evento.start),
            end: new Date(evento.end),
            usuarioId: evento.usuarioId
        }));
    
        setEvents(events); // Usa el prop
        dispatch(getEvents(formattedEvents));
    
    };
    

    return (
        <Stack direction="row" spacing={2} alignItems="center">
            <Autocomplete
                value={selectedUser}
                options={users}
                getOptionLabel={(option) => `${option.displayName} (${option.role})`}
                onChange={handleUserSelect}
                renderInput={(params) => <TextField {...params} label="Seleccionar Usuario" variant="outlined" />}
                isOptionEqualToValue={(option, value) => option.id === value.id && option.role === value.role}
                sx={{ width: 300 }}
            />

            <Button
                variant="contained"
                color="secondary"
                onClick={handleResetCalendar}
            >
                <span>Volver a mi calendario</span>
            </Button>
        </Stack>
    );
};

export default UserSelector;
