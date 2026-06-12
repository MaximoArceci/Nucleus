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
import AddContactDialogContent from './UpgradeContactDialogContent';

// assets
import CancelTwoToneIcon from '@mui/icons-material/CancelTwoTone';

// ==============================|| ADD CONTACT ||============================== //

const AddContactDialog = ({ open, handleToggleAscendDialog, row, pacientes }) => {
    return (
        <Dialog open={open} sx={{ '.css-tmnkt9-MuiPaper-root-MuiDialog-paper': { p: 0 } }} onClose={handleToggleAscendDialog}>
            {open && (
                <>
                    <DialogTitle sx={{ px: 3, py: 2.5 }}>
                        <Stack direction="row" justifyContent="space-between">
                            {!row ? (
                                <Typography variant="h4">Ascender candidato</Typography>
                            ) : (
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="h4">Ascender candidato</Typography>
                                </Stack>
                            )}
                            <IconButton sx={{ p: 0 }} size="medium" onClick={handleToggleAscendDialog}>
                                <CancelTwoToneIcon />
                            </IconButton>
                        </Stack>
                    </DialogTitle>
                    <Divider />
                    <AddContactDialogContent {...{ row, pacientes, handleToggleAscendDialog  }} />
           
                </>
            )}
        </Dialog>
    );
};

AddContactDialog.propTypes = {
    open: PropTypes.bool,
    handleToggleAddDialog: PropTypes.func,
    row: PropTypes.object
};

export default AddContactDialog;
