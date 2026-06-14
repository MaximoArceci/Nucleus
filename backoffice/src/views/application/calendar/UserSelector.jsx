import { Autocomplete, Button, Stack, TextField } from '@mui/material';
import { useMemo } from 'react';

const isVisibleForVolunteer = (event, volunteer) => {
    if (!event || !volunteer) return false;
    if (event.organizerId === volunteer.id) return true;
    if (event.participantMode === 'all') return true;
    if (event.participantMode === 'volunteers') return (event.participantVolunteerIds || []).includes(volunteer.id);
    if (event.participantMode === 'areas') {
        return (event.participantAreaIds || []).some((areaId) => (volunteer.areaIds || []).includes(areaId));
    }
    return false;
};

const normalizeCalendarEvent = (event) => ({
    ...event,
    id: String(event.id),
    title: event.title || 'Reunion',
    start: event.start ? new Date(event.start) : undefined,
    end: event.end ? new Date(event.end) : undefined,
    allDay: Boolean(event.allDay),
    backgroundColor: event.color || '#7CB3E9',
    borderColor: event.color || '#7CB3E9',
    textColor: event.textColor || '#ffffff',
    extendedProps: {
        organizerId: event.organizerId,
        participantMode: event.participantMode,
        participantVolunteerIds: event.participantVolunteerIds || [],
        participantAreaIds: event.participantAreaIds || [],
        link: event.link,
        description: event.description
    }
});

const UserSelector = ({ events, sourceEvents, volunteers, selectedUser, setSelectedUser, setEvents }) => {
    const options = useMemo(
        () =>
            volunteers.map((user) => ({
                ...user,
                displayName: user.username || user.email || `Voluntario ${user.id}`
            })),
        [volunteers]
    );

    const handleUserSelect = (event, newValue) => {
        setSelectedUser(newValue);
        if (!newValue) {
            setEvents(sourceEvents.map(normalizeCalendarEvent));
            return;
        }
        setEvents(sourceEvents.filter((calendarEvent) => isVisibleForVolunteer(calendarEvent, newValue)).map(normalizeCalendarEvent));
    };

    const handleResetCalendar = () => {
        setSelectedUser(null);
        setEvents(sourceEvents.map(normalizeCalendarEvent));
    };

    return (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Autocomplete
                value={selectedUser}
                options={options}
                getOptionLabel={(option) => option.displayName}
                onChange={handleUserSelect}
                renderInput={(params) => <TextField {...params} label="Filtrar por voluntario" variant="outlined" />}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                sx={{ width: { xs: '100%', sm: 320 } }}
            />

            <Button variant="contained" color="secondary" onClick={handleResetCalendar}>
                Ver mi calendario
            </Button>
        </Stack>
    );
};

export default UserSelector;
