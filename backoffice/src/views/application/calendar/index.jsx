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
import AddReunionForm from './AddReunionForm';
import CalendarStyled from './CalendarStyled';

import Loader from 'ui-component/Loader';
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';

import { dispatch, useSelector } from 'store';
import { getEvents, addEvent, updateEvent, removeEvent } from 'store/slices/calendar';
// assets
import AddAlarmTwoToneIcon from '@mui/icons-material/AddAlarmTwoTone';
import axios from 'utils/axios';
import { EventAvailable } from '@mui/icons-material';
import { Alert, Snackbar } from '@mui/material';
import UserSelector from './UserSelector';

// import { IconCalendarStats } from '@tabler/icons-react';

// ==============================|| APPLICATION CALENDAR ||============================== //

const Calendar = () => {
    const calendarRef = useRef(null);
    const matchSm = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const [loading, setLoading] = useState(true);
    // fetch events data
    const [events, setEvents] = useState([]);
    const calendarState = useSelector((state) => state.calendar);

    useEffect(() => {
        dispatch(getEvents()).then(() => setLoading(false));
    }, []);

    useEffect(() => {
        setEvents(calendarState.events);
    }, [calendarState]);



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



    // Dentro del componente Calendar:
    const [pacientes, setPacientes] = useState([]);
    const [candidatos, setCandidatos] = useState([]);
    const [terapeutas, setTerapeutas] = useState([]);

    useEffect(() => {
        const fetchPacientes = async () => {
            try {
                const response = await axios.get("/datos/administrador/allUsers");
                setPacientes(response.data[1]);
                setCandidatos(response.data[0]);
                setTerapeutas(response.data[2]);
            } catch (error) {
            }
        };
        fetchPacientes();
    }, []);

    useEffect(() => {
    }, [pacientes]); // Solo se ejecuta cuando 'pacientes' cambie



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
    
    const [selectedUser, setSelectedUser] = useState(null);

    const handleAddClick = () => {
        setIsModalOpen(true);
    };
    const [reunionOpen, setReunionOpen] = useState(false);

    const handleReunion = () => {
        setReunionOpen(true)
    }
    const handleModalClose = () => {
        setIsModalOpen(false);
        setReunionOpen(false);
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
                        onClick={handleReunion}
                        sx={{ mr: 1 }}
                    >
                        <EventAvailable />
                        Solicitar sesion
                    </Button>
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
                <UserSelector setLoading={setLoading} setEvents={setEvents} events={events}  selectedUser={selectedUser} setSelectedUser={setSelectedUser}/>
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
                        pacientes={pacientes}
                        candidatos={candidatos}
                        terapeutas={terapeutas}
                        openSnackbar={openSnackbar}
                        setOpenSnackbar={setOpenSnackbar}
                        event={selectedEvent}
                        range={selectedRange}
                        onCancel={handleModalClose}
                        handleDelete={handleEventDelete}
                        handleCreate={handleEventCreate}
                        handleUpdate={handleUpdateEvent}
                    />
                )}
            </Dialog>
            <Dialog maxWidth="sm" fullWidth onClose={handleModalClose} open={reunionOpen} sx={{ '& .MuiDialog-paper': { p: 0 } }}>

                {reunionOpen && (
                    <AddReunionForm
                        pacientes={pacientes}

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
