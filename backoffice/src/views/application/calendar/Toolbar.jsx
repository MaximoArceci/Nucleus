import PropTypes from 'prop-types';
import { useEffect, useState, lazy, Suspense } from 'react';

// material-ui
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';

// third-party
import { format } from 'date-fns';
import { es } from "date-fns/locale";

// Lazy load Material UI Icons
const ViewModuleIcon = lazy(() => import('@mui/icons-material/ViewModule'));
const ViewWeekIcon = lazy(() => import('@mui/icons-material/ViewWeek'));
const ViewDayIcon = lazy(() => import('@mui/icons-material/ViewDay'));
const ListIcon = lazy(() => import('@mui/icons-material/List'));
const ChevronLeftIcon = lazy(() => import('@mui/icons-material/ChevronLeft'));
const ChevronRightIcon = lazy(() => import('@mui/icons-material/ChevronRight'));

// constant
const viewOptions = [
    { label: 'Mes', value: 'dayGridMonth', icon: ViewModuleIcon },
    { label: 'Semana', value: 'timeGridWeek', icon: ViewWeekIcon },
    { label: 'Día', value: 'timeGridDay', icon: ViewDayIcon },
    { label: 'Agenda', value: 'listWeek', icon: ListIcon }
];

const Toolbar = ({ date, view, onClickNext, onClickPrev, onClickToday, onChangeView, ...others }) => {
    const matchSm = useMediaQuery((theme) => theme.breakpoints.down('md'));
    const [newViewOption, setNewViewOption] = useState(viewOptions);

    useEffect(() => {
        let newOption = viewOptions;
        if (matchSm) {
            newOption = viewOptions.filter((options) => options.value !== 'dayGridMonth' && options.value !== 'timeGridWeek');
        }
        setNewViewOption(newOption);
    }, [matchSm]);

    return (
        <Grid alignItems="center" container justifyContent="space-between" spacing={3} {...others} sx={{ pb: 3 }}>
            <Grid item>
                <Button variant="outlined" onClick={onClickToday}>
                    Hoy
                </Button>
            </Grid>
            <Grid item>
                <Stack direction="row" alignItems="center" spacing={3}>
                    <Suspense fallback={<IconButton size="large" />}>
                        <IconButton onClick={onClickPrev} size="large">
                            <ChevronLeftIcon />
                        </IconButton>
                    </Suspense>
                    <Typography variant="h3" color="textPrimary">
                        {format(date, "EEEE, dd MMMM", { locale: es })}
                    </Typography>
                    <Suspense fallback={<IconButton size="large" />}>
                        <IconButton onClick={onClickNext} size="large">
                            <ChevronRightIcon />
                        </IconButton>
                    </Suspense>
                </Stack>
            </Grid>
            <Grid item>
                <ButtonGroup variant="outlined" aria-label="outlined button group">
                    {newViewOption.map((viewOption) => (
                        <Tooltip title={viewOption.label} key={viewOption.value}>
                            <Button
                                disableElevation
                                variant={viewOption.value === view ? 'contained' : 'outlined'}
                                onClick={() => onChangeView(viewOption.value)}
                            >
                                <Suspense fallback={null}>
                                    <viewOption.icon fontSize="small" />
                                </Suspense>
                            </Button>
                        </Tooltip>
                    ))}
                </ButtonGroup>
            </Grid>
        </Grid>
    );
};

Toolbar.propTypes = {
    date: PropTypes.object,
    view: PropTypes.string,
    onClickNext: PropTypes.func,
    onClickPrev: PropTypes.func,
    onClickToday: PropTypes.func,
    onChangeView: PropTypes.func
};

export default Toolbar;
