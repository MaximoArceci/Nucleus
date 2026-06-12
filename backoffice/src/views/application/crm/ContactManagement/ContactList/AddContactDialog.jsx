import PropTypes from 'prop-types';

// material-ui
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import AddContactDialogContent from './AddContactDialogContent';

// assets
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';

// ==============================|| ADD CONTACT ||============================== //

const AddContactDialog = ({ open, handleToggleAddDialog, row, pacientes }) => {
    return (
        <Dialog 
            open={open} 
            onClose={handleToggleAddDialog}
            keepMounted
            disablePortal
            sx={{ 
                '.css-tmnkt9-MuiPaper-root-MuiDialog-paper': { p: 0 },
                '& .MuiDialog-root': {
                    position: 'fixed'
                }
            }}
        >
            <DialogTitle sx={{ px: 3, py: 2.5 }}>
                <Stack direction="row" justifyContent="space-between">
                    {!row ? (
                        <Typography variant="h4">Agregar Terapeuta</Typography>
                    ) : (
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="h4">Editar Terapeuta</Typography>
                            <Typography variant="h4" sx={{ color: 'grey.400' }}>
                                #{row.id}
                            </Typography>
                        </Stack>
                    )}
                    <IconButton 
                        sx={{ p: 0 }} 
                        size="medium" 
                        onClick={handleToggleAddDialog}
                        aria-label="Cerrar diálogo"
                    >
                        <CancelTwoToneIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>
            <Divider />
            <AddContactDialogContent {...{ row, pacientes, handleToggleAddDialog }} />
        </Dialog>
    );
};

AddContactDialog.propTypes = {
    open: PropTypes.bool,
    handleToggleAddDialog: PropTypes.func,
    row: PropTypes.object,
    pacientes: PropTypes.array
};

export default AddContactDialog;
