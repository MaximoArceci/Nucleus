import PropTypes from 'prop-types';
import * as React from 'react';

// material-ui
import Fab from '@mui/material/Fab';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

// assets
import AddIcon from '@mui/icons-material/AddTwoTone';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from 'contexts/Auth0Context';

// ==============================|| CONTACT FILTER ||============================== //

const Filter = ({ rows, setRows, handleToggleAddDialog, locacion }) => {
    const { role } = useAuth();
    const [search, setSearch] = React.useState('');

    const handleSearch = (event) => {
        const newString = event?.target.value;
        setSearch(newString || '');

        if (newString) {
            const newRows = rows?.filter((row) => {
                let matches = true;
                const properties = ['id', 'nombre', 'username', 'email'];
                let containsQuery = false;

                properties.forEach((property) => {
                    if (row[property].toString().toLowerCase().includes(newString.toString().toLowerCase())) {
                        containsQuery = true;
                    }
                });
                if (!containsQuery) {
                    matches = false;
                }
                return matches;
            });
            setRows(newRows);
        } else {
            setRows(rows);
        }
    };
    return (
        <>
            <Stack
                sx={{ p: 3 }}
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ sm: 'center' }}
                spacing={2}
            >
                <TextField
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        )
                    }}
                    placeholder={`Buscar ${locacion}`}
                    size="small"
                    value={search}
                    onChange={handleSearch}
                />
                {locacion === "terapeuta" &&

                    <Stack direction="row" alignItems="center" justifyContent={{ xs: 'center' }} spacing={1.25}>
                        <Tooltip title={`Agregar nuevo ${locacion}`}>
                            <Fab
                                color="primary"
                                size="small"
                                sx={{ boxShadow: 'none', ml: 1, width: 32, height: 32, minHeight: 32 }}
                                onClick={handleToggleAddDialog}
                            >
                                <AddIcon fontSize="small" />
                            </Fab>
                        </Tooltip>
                    </Stack>
                }
            </Stack>
        </>
    );
};

Filter.propTypes = {
    rows: PropTypes.array,
    setRows: PropTypes.func,
    handleToggleAddDialog: PropTypes.func
};

export default Filter;
