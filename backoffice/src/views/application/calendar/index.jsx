import { useEffect, useRef, useState } from 'react';
import { es } from "date-fns/locale";

// material-ui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import useMediaQuery from '@mui/material/useMediaQuery';

// third-party
import FullCalendar from '@fullcalendar/react';
import listPlugin from '@fullcalendar/list';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import timelinePlugin from '@fullcalendar/timeline';
import interactionPlugin from '@fullcalendar/interaction';

// project imports
import Toolbar from './Toolbar';
import AddEventForm from './AddEventForm';
import CalendarStyled from './CalendarStyled';

import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';

import { dispatch, useSelector } from 'store';
import { getEvents, addEvent, updateEvent, removeEvent } from 'store/slices/calendar';
// assets
import AddAlarmTwoToneIcon from '@mui/icons-material/AddAlarmTwoTone';
import axios from 'utils/axios';
import { Alert, Snackbar } from '@mui/material';
import UserSelector from './UserSelector';

// import { IconCalendarStats } from '@tabler/icons-react';

// ==============================|| APPLICATION CALENDAR ||============================== //

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

const Calendar = () => {
    const calendarRef = useRef(null);
    const matchSm = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const [loading, setLoading] = useState(true);
    // fetch events data
    const [events, setEvents] = useState([]);
    const [sourceEvents, setSourceEvents] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [areas, setAreas] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const calendarState = useSelector((state) => state.calendar);

    useEffect(() => {
        dispatch(getEvents()).then(() => setLoading(false));
    }, []);

    useEffect(() => {
        const nextEvents = Array.isArray(calendarState.events) ? calendarState.events : [];
        setSourceEvents(nextEvents);
        const visibleEvents = selectedUser ? nextEvents.filter((event) => isVisibleForVolunteer(event, selectedUser)) : nextEvents;
        setEvents(visibleEvents.map(normalizeCalendarEvent));
    }, [calendarState, selectedUser]);



    const [date, setDate] = useState(new Date());
    const [view, setView] = useState(matchSm ? 'listWeek' : 'dayGridMonth');

    // calendar toolbar events
    const handleDateToday = () => {
        const calendarEl = calendarRef.current;

        if (calendarEl) {
            const calendarApi = calendarEl.getApi();

            calendarApi.today();
            setDate(calendarApi.getDate());
        }
    };

    const handleViewChange = (newView) => {
        const calendarEl = calendarRef.current;

        if (calendarEl) {
            const calendarApi = calendarEl.getApi();

            calendarApi.changeView(newView);
            setView(newView);
        }
    };

    // set calendar view
    useEffect(() => {
        handleViewChange(matchSm ? 'listWeek' : 'dayGridMonth');
    }, [matchSm]);

    const handleDatePrev = () => {
        const calendarEl = calendarRef.current;

        if (calendarEl) {
            const calendarApi = calendarEl.getApi();

            calendarApi.prev();
            setDate(calendarApi.getDate());
        }
    };

    const handleDateNext = () => {
        const calendarEl = calendarRef.current;

        if (calendarEl) {
            const calendarApi = calendarEl.getApi();

            calendarApi.next();
            setDate(calendarApi.getDate());
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRange, setSelectedRange] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);



    useEffect(() => {
        const fetchDirectory = async () => {
            try {
                const [volunteersResponse, areasResponse] = await Promise.all([
                    axios.get('/datos/voluntario/'),
                    axios.get('/datos/area/')
                ]);
                setVolunteers(Array.isArray(volunteersResponse.data) ? volunteersResponse.data : []);
                setAreas(Array.isArray(areasResponse.data) ? areasResponse.data : []);
            } catch (error) {
            }
        };
        fetchDirectory();
    }, []);



    // calendar event select/add/edit/delete
    const handleRangeSelect = (arg) => {
        const calendarEl = calendarRef.current;
        if (calendarEl) {
            const calendarApi = calendarEl.getApi();
            calendarApi.unselect();
        }

        setSelectedRange({
            start: arg.start,
            end: arg.end
        });
        setIsModalOpen(true);
    };

    const handleEventSelect = (arg) => {
        

        if (Array.isArray(events)) {
            const selectEvent = events.find((_event) => Number(_event.id) === Number(arg.event.id));
            setSelectedEvent(selectEvent);
        } else {
        }
        setIsModalOpen(true);
    };
    

    const handleEventUpdate = async ({ event }) => {
        try {
            dispatch(
                updateEvent({
                    eventId: event.id,
                    update: {
                        allDay: event.allDay,
                        start: event.start,
                        end: event.end
                    }
                })
            );
        } catch (err) {
        }
    };
    const [errorSnackbar, setErrorSnackbar] = useState(false);

    const handleEventCreate = async (data) => {
        try {
            await dispatch(addEvent(data));
            handleModalClose();
            setOpenSnackbar(true);
        } catch (err) {
            setErrorSnackbar(true);
        }
    };

    const handleUpdateEvent = async (eventId, update) => {
        try {
            await dispatch(updateEvent({ eventId, update }));
            handleModalClose();
            setOpenSnackbar(true);
        } catch (err) {
            setErrorSnackbar(true);
        }
    };

    const handleEventDelete = async (id, event) => {
        try {
            const result = await dispatch(removeEvent(id, event));
            
            handleModalClose();
            setOpenSnackbar(true);
        } catch (err) {

            setErrorSnackbar(true);
        }
    };
    
    const handleAddClick = () => {
        setIsModalOpen(true);
    };
    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedEvent(null);
        setSelectedRange(null);
    };


    if (loading) return <Loader />;
    return (
        <MainCard
            title="Gestion de sesiones"
            secondary={
                <div>
                    <Button
                        color="secondary"
                        variant="contained"
                        onClick={handleAddClick}>
                        <AddAlarmTwoToneIcon fontSize="small" sx={{ mr: 0.75 }} />
                        Agregar sesion
                    </Button>
                </div>
            }

        >
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Centrado abajo
                sx={{ width: '50%', maxWidth: 'none' }} // Ocupa todo el ancho
            >
                <Alert
                    onClose={() => setOpenSnackbar(false)}
                    severity="success"
                    sx={{ width: '100%' }} // Agrandar texto y padding
                >
                    ¡Evento guardado con éxito!
                </Alert>
            </Snackbar>
            <Snackbar
                open={errorSnackbar}
                autoHideDuration={3000}
                onClose={() => setErrorSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Centrado abajo
                sx={{ width: '50%', maxWidth: 'none' }} // Ocupa todo el ancho
            >
                <Alert
                    onClose={() => setErrorSnackbar(false)}
                    severity="error"
                    sx={{ width: '100%' }} // Agrandar texto y padding
                >
                    {calendarState.error || "Error desconocido"}
                </Alert>
            </Snackbar>

            <CalendarStyled>
                <UserSelector
                    setEvents={setEvents}
                    events={events}
                    sourceEvents={sourceEvents}
                    volunteers={volunteers}
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                />
                <Toolbar
                    date={date}
                    view={view}
                    onClickNext={handleDateNext}
                    onClickPrev={handleDatePrev}
                    onClickToday={handleDateToday}
                    onChangeView={handleViewChange}
                />
                <SubCard>
                    <FullCalendar
                        locale={es}
                        weekends
                        editable
                        eventStartEditable={false}
                        eventDurationEditable
                        droppable
                        selectable
                        events={events}
                        ref={calendarRef}
                        rerenderDelay={10}
                        initialDate={date}
                        initialView={view}
                        dayMaxEventRows={3}
               
                        eventDisplay="block"
                        headerToolbar={false}
                        allDayMaintainDuration
                        select={handleRangeSelect}
                        eventClick={handleEventSelect}
                        height={matchSm ? 'auto' : 720}
                        plugins={[listPlugin, dayGridPlugin, timelinePlugin, timeGridPlugin, interactionPlugin]}
                    />

                </SubCard>
            </CalendarStyled>

            {/* Dialog renders its body even if not open */}
            <Dialog maxWidth="sm" fullWidth onClose={handleModalClose} open={isModalOpen} sx={{ '& .MuiDialog-paper': { p: 0 } }}>
                {isModalOpen && (
                    <AddEventForm
                        selectedUser={selectedUser}
                        volunteers={volunteers}
                        areas={areas}
                        event={selectedEvent}
                        range={selectedRange}
                        onCancel={handleModalClose}
                        handleDelete={handleEventDelete}
                        handleCreate={handleEventCreate}
                        handleUpdate={handleUpdateEvent}
                    />
                )}
            </Dialog>



        </MainCard>
    );
};

export default Calendar;
