import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// third-party
import { Chance } from 'chance';
import { findLast, random } from 'lodash-es';

// project imports
import UpgradeContactDialog from './UpgradeContactDialog';
import AddContactDialog from './AddContactDialog';
import ChangeFichasDialog from './ChangeFichasDialog';
import ContactNewMessage from './NewMessage';
import Avatar from 'ui-component/extended/Avatar';
import { ImagePath, getImageUrl } from 'utils/getImageUrl';
import { ThemeMode } from 'config';

// assets
import LinkIcon from '@mui/icons-material/Link';
import CachedIcon from '@mui/icons-material/Cached';
import CancelIcon from '@mui/icons-material/Cancel';
import ChatBubbleTwoToneIcon from '@mui/icons-material/ChatBubbleTwoTone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import EditTwoTone from '@mui/icons-material/EditTwoTone';
import FacebookIcon from '@mui/icons-material/Facebook';
import GoogleIcon from '@mui/icons-material/Google';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import MoreVertTwoTone from '@mui/icons-material/MoreVertTwoTone';
import PhoneTwoToneIcon from '@mui/icons-material/PhoneTwoTone';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Delete } from '@mui/icons-material';
// import { IconTrash } from '@tabler/icons-react';
import axios from 'utils/axios';
import { dispatch } from 'store';
import { getOrders } from 'store/slices/customer';
import AnimateButton from 'ui-component/extended/AnimateButton';
import DeleteContactModal from './DeleteContactModel';
import { useAuth } from 'contexts/Auth0Context';
const chance = new Chance();

// ==============================|| CONTACT - TABLE BODY ||============================== //

const ContactTableBody = ({ row, selected, handleClick, location }) => {
    const { role } = useAuth();
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [openMsgDialog, setOpenMsgDialog] = React.useState(false);
    const [openAddDialog, setOpenAddDialog] = React.useState(false);
    const [openFichas, setOpenFichas] = React.useState(false);
    const [openAscendDialog, setOpenAscendDialog] = React.useState(false);
    const [modalDelete, setModalDelete] = React.useState(false);


    const handleToggleAddDialog = () => {
        setOpenAddDialog(!openAddDialog);
    };
    const handleToggleAscendDialog = () => {
        setOpenAscendDialog(!openAscendDialog);
    };
    const handleFichas = () => {
        setOpenFichas(!openFichas);
    };


    const handleDelete = async (e, id) => {
        e.preventDefault();
        try {
            await axios.delete(`/datos/${location}/?id=${id}`, row);
        } finally {
            dispatch(getOrders(role));
            setModalDelete(false)
        }
    };


    const isSelected = (name) => selected.indexOf(name) !== -1;
    const isItemSelected = isSelected(row.name);

    // open dialog to edit review
    const handleToggleMsgDialog = () => {
        setOpenMsgDialog(!openMsgDialog);
    };

    let chipcolor;
    let color;
    let label;
    let statusIcon;

    switch (row.status) {
        case 1:
            color = 'success.dark';
            chipcolor = alpha(theme.palette.success.light, 0.6);
            label = 'Verify';
            statusIcon = <CheckCircleIcon color="success" fontSize="small" />;
            break;
        case 2:
            label = 'Reject';
            color = 'orange.dark';
            chipcolor = alpha(theme.palette.orange.light, 0.8);
            statusIcon = <CancelIcon color="error" fontSize="small" />;
            break;
        case 3:
        default:
            color = 'warning.dark';
            chipcolor = 'warning.light';
            label = 'New';
            statusIcon = <CachedIcon color="primary" fontSize="small" />;
    }

    let icon;

    switch (Math.floor(Math.random() * 4 + 1)) {
        case 1:
            icon = <TwitterIcon color="info" />;
            break;
        case 2:
            icon = <GoogleIcon color="error" />;
            break;
        case 4:
            icon = <FacebookIcon color="primary" />;
            break;
        case 3:
        default:
            icon = <LinkedInIcon color="inherit" />;
    }


    return (
        <>
            <TableRow hover role="checkbox" aria-checked={isItemSelected} onClick={() => setOpen(!open)} tabIndex={-1} selected={isItemSelected}>
                {/* <TableCell sx={{ pl: 3 }} onClick={() => handleClick(row.name)}>
                    <Checkbox color="primary" checked={isItemSelected} />
                </TableCell> */}
                {/* <TableCell>#{row.id}</TableCell> */}
                <TableCell sx={{ cursor: 'pointer' }}>
                    <Stack spacing={1.25} direction="row" alignItems="center" >
                        <Avatar alt="User 1" src={row.imagen} />
                        <Stack>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Typography variant="h5">{row.username}</Typography>
                            </Stack>
                            <Typography variant="subtitle2">{row.email}</Typography>
                        </Stack>
                    </Stack>
                </TableCell>
                <TableCell>{row.role}</TableCell>
                {row.role === "Terapeuta" || row.role === "Paciente" ? (
                    <>
                        <TableCell>{row.telefono}</TableCell>
                        {row.role === "Terapeuta" ?


                            <TableCell align="left">{row.pacientes.length}</TableCell>
                            :
                            <TableCell align="left">{row.cantFichas}</TableCell>


                        }
                    </>
                ) : (
                    <>
                        <TableCell>{row.reunionInicial ? "Si" : "No"}</TableCell>
                        <TableCell>{row.abonaReunion ? "Si" : "No"}</TableCell>
                    </>
                )}

                {/* <TableCell align="center">{icon}</TableCell> */}
                <TableCell sx={{ pr: 3 }}>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: theme.palette.mode === ThemeMode.DARK ? 'background.default' : 'grey.50' }}>
                <TableCell sx={{ py: 0 }} colSpan={13}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        {open && (
                            <Grid container spacing={1.25} p={2.5}>
                                <Grid item xs={12}>
                                    <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="flex-end">
                                        {row.role === "Terapeuta" &&
                                            <>
                                                <IconButton size="small" onClick={handleToggleAddDialog}>
                                                    <EditTwoTone sx={{ fontSize: '1.15rem' }} />
                                                </IconButton>
                                            </>
                                        }
                                        <IconButton size="small" onClick={() => setOpen(!open)}>
                                            <CloseIcon sx={{ fontSize: '1.15rem' }} />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => setModalDelete(row.id)}>
                                            <Delete sx={{ fontSize: '1.15rem' }} />
                                        </IconButton>


                                    </Stack>
                                </Grid>
                                <Grid item container spacing={2.5} xs={12}>
                                    <Grid item xs={3}>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Stack direction="row" spacing={3}>

                                                <Avatar
                                                    alt="Imagen de google del usuario"
                                                    size="lg"
                                                    src={row.imagen}
                                                />
                                                <Grid container rowSpacing={2.5}>
                                                    <Grid item xs={12} sx={{ mt: -2.5 }}>
                                                        <Stack>
                                                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                                                <Typography variant="h5">{row.username}</Typography>
                                                            </Stack>
                                                            <Typography variant="subtitle2">{row.email}</Typography>
                                                        </Stack>
                                                    </Grid>

                                                </Grid>
                                            </Stack>
                                        </Stack>
                                    </Grid>
                                    {
                                        row.role === "Terapeuta" &&
                                        <>
                                            <Grid item container rowSpacing={2.5} xs={3}>
                                                <Grid item xs={12}>
                                                    <Stack>
                                                        <Typography variant="subtitle2">Fichas cobradas:</Typography>
                                                        <Typography variant="h5">{row.fichasCobradas}</Typography>
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Stack>
                                                        <Typography variant="subtitle2">Fichas pendientes:</Typography>
                                                        <Typography variant="h5">{row.fichasPendientes}</Typography>
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Stack>
                                                        <Typography variant="subtitle2">Telefono</Typography>
                                                        <Typography variant="h5">{row.telefono}</Typography>
                                                    </Stack>
                                                </Grid>

                                            </Grid>
                                            <Grid item container rowSpacing={2.5} xs={3}>
                                                {row.pacientes && row.pacientes.length > 0 ? (
                                                    <Grid item xs={12}>

                                                        <ul>
                                                            {row.pacientes.map((paciente, index) => (
                                                                <li key={index}>
                                                                    <Typography variant="subtitle2">Paciente {index + 1}:</Typography>
                                                                    <Typography variant="h5">{paciente.nombre} </Typography>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </Grid>
                                                ) : (
                                                    <Typography variant="h6">No hay pacientes asociados</Typography>
                                                )}
                                            </Grid>
                                        </>
                                    }
                                    {
                                        row.role === "Paciente" &&
                                        <>
                                            <Grid item container rowSpacing={2.5} xs={3}>
                                                <Grid item xs={12}>
                                                    <Stack>
                                                        <Typography variant="subtitle2">Rol:</Typography>
                                                        <Typography variant="h5">{row.role}</Typography>
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Stack>
                                                        <Typography variant="subtitle2">Telefono</Typography>
                                                        <Typography variant="h5">{row.telefono}</Typography>
                                                    </Stack>
                                                </Grid>

                                            </Grid>

                                            <Grid item container rowSpacing={2.5} xs={3}>
                                                <Grid item xs={12}>
                                                    <Stack>
                                                        <Typography variant="subtitle2">Tipo de fichas:</Typography>
                                                        <Typography variant="h5">{row.tipoFicha}</Typography>
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Stack>
                                                        <Typography variant="subtitle2">Cantidad de fichas:</Typography>
                                                        <Typography variant="h5">{row.cantFichas}</Typography>
                                                    </Stack>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Stack>
                                                        <Typography variant="subtitle2">Cantidad total de fichas</Typography>
                                                        <Typography variant="h5">{row.fichasTotales}</Typography>
                                                    </Stack>
                                                </Grid>
                                            </Grid>
                                            <Grid item container rowSpacing={2.5} xs={3}>
                                                <Grid item xs={12}>
                                                    <AnimateButton>
                                                        <Button onClick={handleFichas} variant="outlined">
                                                            Modificar Fichas
                                                        </Button>
                                                    </AnimateButton>
                                                </Grid>
                                            </Grid>
                                        </>
                                    }
                                    {
                                        row.role === "Candidato" &&
                                        <>
                                            <Grid item container rowSpacing={2.5} xs={3}>
                                                <Grid item xs={12}>
                                                    <Stack>
                                                        <Typography variant="subtitle2">Rol:</Typography>
                                                        <Typography variant="h5">{row.role}</Typography>
                                                    </Stack>
                                                    <Grid item xs={12}>

                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            <Grid item container rowSpacing={2.5} xs={3}>
                                                <Grid item xs={12}>
                                                    <Stack>
                                                        <Typography variant="subtitle2">Abono reunion inicial?</Typography>
                                                        <Typography variant="h5">{row.abonaReunion ? "Si" : "No"}</Typography>

                                                    </Stack>

                                                </Grid>
                                            </Grid>
                                            <AnimateButton>
                                                <Button onClick={handleToggleAscendDialog} variant="outlined">
                                                    Ascender a paciente
                                                </Button>
                                            </AnimateButton>

                                        </>
                                    }
                                </Grid>
                            </Grid>
                        )}
                    </Collapse>
                </TableCell>
                <DeleteContactModal
                    open={modalDelete !== false}
                    handleClose={() => setModalDelete(false)}
                    handleConfirm={(e) => handleDelete(e, modalDelete)}
                    location={location}
                />

            </TableRow>
            <ContactNewMessage {...{ open: openMsgDialog, handleToggleMsgDialog }} />
            <AddContactDialog {...{ open: openAddDialog, handleToggleAddDialog, row }} />
            <ChangeFichasDialog {...{ open: openFichas, handleFichas, row }} />
            <UpgradeContactDialog {...{ open: openAscendDialog, handleToggleAscendDialog, row }} />
        </>
    );
};

ContactTableBody.propTypes = {
    row: PropTypes.object,
    selected: PropTypes.array,
    handleClick: PropTypes.func
};

export default ContactTableBody;
