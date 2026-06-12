import PropTypes from 'prop-types';

// material-ui
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// assets
import DeleteIcon from '@mui/icons-material/Delete';

// table header options
const headCellsTerapeuta = [
    // { id: 'id', numeric: true, label: 'ID' },
    { id: 'username', numeric: false, label: 'Nombre' },
    { id: 'role', numeric: false, label: 'Rol' },
    { id: 'telefono', numeric: false, label: 'Teléfono' },
    { id: 'pacientes', numeric: false, label: 'Cantidad de Pacientes' }
];

const headCellsPacientes = [
    // { id: 'id', numeric: true, label: 'ID' },
    { id: 'username', numeric: false, label: 'Nombre' },
    { id: 'role', numeric: false, label: 'Rol' },
    { id: 'telefono', numeric: false, label: 'Teléfono' },
    { id: 'cantFichas', numeric: true, label: 'Cantidad de Fichas' }
];

const headCellsCandidatos = [
    // { id: 'id', numeric: true, label: 'ID' },
    { id: 'username', numeric: false, label: 'Nombre' },
    { id: 'role', numeric: false, label: 'Rol' },
    { id: 'reunionInicial', numeric: false, label: 'Reunión Inicial' },
    { id: 'abonaReunion', numeric: false, label: 'Abona Reunión' },
    // { id: 'aceptado', numeric: false, label: 'Aceptado' }
];

// ==============================|| CONTACT - TABLE TOOLBAR ||============================== //

const EnhancedTableToolbar = ({ numSelected }) => (
    <Toolbar sx={{ p: 0, pl: 2, pr: 1, color: numSelected > 0 ? 'secondary.main' : 'inherit' }}>
        {numSelected > 0 ? (
            <Typography color="inherit" variant="h4">
                {numSelected} Selected
            </Typography>
        ) : (
            <Typography variant="h6" id="tableTitle">
                Nutrition
            </Typography>
        )}
        <Box sx={{ flexGrow: 1 }} />
        {numSelected > 0 && (
            <Tooltip title="Delete">
                <IconButton size="large">
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        )}
    </Toolbar>
);

EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired
};

// ==============================|| CONTACT - TABLE HEADER ||============================== //

function ContactTableHeader({ onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, selected, locacion }) {
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    const getHeadCells = (locacion) => {
        switch (locacion) {
            case 'terapeuta':
                return headCellsTerapeuta;
            case 'paciente':
                return headCellsPacientes;
            case 'candidato':
                return headCellsCandidatos;
            default:
                return [];
        }
    };
    
    // Uso en el componente
    const headCells = getHeadCells(locacion);
    

    return (
        <TableHead>
            <TableRow>
                {/* <TableCell padding="checkbox" sx={{ pl: 3 }}>
                    <Checkbox
                        color="primary"
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{
                            'aria-label': 'select all desserts'
                        }}
                    />
                </TableCell> */}
                
                {numSelected > 0 && (
                    <TableCell padding="none" colSpan={12}>
                        <EnhancedTableToolbar numSelected={selected.length} />
                    </TableCell>
                )}
                {numSelected <= 0 &&
                    headCells.map((headCell) => (
                        <TableCell
                            key={headCell.id}
                            align={headCell.align}
                            padding={headCell.disablePadding ? 'none' : 'normal'}
                            sortDirection={orderBy === headCell.id ? order : false}
                        >
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={orderBy === headCell.id ? order : 'asc'}
                                onClick={createSortHandler(headCell.id)}
                            >
                                {headCell.label}
                                {orderBy === headCell.id ? (
                                    <Typography component="span" sx={{ display: 'none' }}>
                                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                    </Typography>
                                ) : null}
                            </TableSortLabel>
                        </TableCell>
                    ))}
                {numSelected <= 0 && <TableCell sortDirection={false} align="center" sx={{ pr: 3 }}></TableCell>}
            </TableRow>
        </TableHead>
    );
}

ContactTableHeader.propTypes = {
    selected: PropTypes.array,
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired
};

export default ContactTableHeader;
