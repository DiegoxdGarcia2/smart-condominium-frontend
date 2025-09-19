import type { PaginatedResponse } from 'src/types/api-responses';
import type { FinancialFee, ResidentialUnit, FinancialFeeStatus, EditingFinancialFee } from 'src/types/financial-fee';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useAuth } from 'src/context/AuthContext';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

// Interfaz para usuarios desde la API
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role_name: string;
}

// Función para transformar estados del backend (español) al frontend (inglés)
const transformStatusFromBackend = (status: string): FinancialFeeStatus => {
  switch (status) {
    case 'Pendiente':
      return 'pending';
    case 'Pagado':
      return 'paid';
    case 'Vencido':
      return 'overdue';
    default:
      return status as FinancialFeeStatus;
  }
};

// Función para transformar estados del frontend (inglés) al backend (español)
const transformStatusToBackend = (status: FinancialFeeStatus): string => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'paid':
      return 'Pagado';
    case 'overdue':
      return 'Vencido';
    default:
      return status;
  }
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente', color: 'warning' },
  { value: 'paid', label: 'Pagado', color: 'success' },
  { value: 'overdue', label: 'Vencido', color: 'error' },
];

const DEFAULT_FEE: EditingFinancialFee = {
  unit_number: '',
  description: '',
  amount: '0.00',
  due_date: new Date().toISOString().split('T')[0],
  status: 'pending' as const,
};

export function FinancesView() {
  const [fees, setFees] = useState<FinancialFee[]>([]);
  const [units, setUnits] = useState<ResidentialUnit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentFee, setCurrentFee] = useState<EditingFinancialFee>(DEFAULT_FEE);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<ResidentialUnit | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const modal = useBoolean();
  const deleteDialog = useBoolean();
  const { enqueueSnackbar } = useSnackbar();
  const { isAuthenticated, user } = useAuth();

  const getFees = useCallback(async (pageNum = 1) => {
    // No hacer peticiones si no está autenticado
    if (!isAuthenticated || !user) {
      return;
    }

    try {
      const response = await endpoints.get(`/administration/financial-fees/?page=${pageNum}`);
      const data = response.data as PaginatedResponse<FinancialFee>;
      
      // Transformar estados y establecer placeholder temporal solo si no hay datos de unidades/usuarios
      const transformedResults = data.results.map(fee => ({
        ...fee,
        status: transformStatusFromBackend(fee.status as string),
        resident_name: fee.resident_name || 'Sin asignar' // Usar dato existente o placeholder
      }));
      
      // Ordenar por fecha de vencimiento (due_date) de la más reciente a la más antigua
      const sortedResults = transformedResults.sort((a, b) => {
        const dateA = new Date(a.due_date);
        const dateB = new Date(b.due_date);
        return dateB.getTime() - dateA.getTime(); // Orden descendente (más reciente primero)
      });
      
      setFees(sortedResults);
    } catch (error: any) {
      console.error('Error fetching fees:', error);
      if (error.response?.status === 401) {
        enqueueSnackbar('Sesión expirada, por favor vuelva a iniciar sesión', { variant: 'error' });
      } else {
        enqueueSnackbar('Error al cargar las cuotas', { variant: 'error' });
      }
      setFees([]);
    }
  }, [enqueueSnackbar, isAuthenticated, user]);

  const getUnits = useCallback(async () => {
    // No hacer peticiones si no está autenticado
    if (!isAuthenticated || !user) {
      return;
    }

    try {
      const response = await endpoints.get('/administration/residential-units/');
      const data = response.data as PaginatedResponse<ResidentialUnit>;
      setUnits(data.results);
    } catch (error: any) {
      console.error('Error fetching units:', error);
      if (error.response?.status === 401) {
        enqueueSnackbar('Sesión expirada, por favor vuelva a iniciar sesión', { variant: 'error' });
      } else {
        enqueueSnackbar('Error al cargar las unidades', { variant: 'error' });
      }
      setUnits([]);
    }
  }, [enqueueSnackbar, isAuthenticated, user]);

  const getUsers = useCallback(async () => {
    // No hacer peticiones si no está autenticado
    if (!isAuthenticated || !user) {
      return;
    }

    try {
      const response = await endpoints.get('/administration/users/');
      const data = response.data as PaginatedResponse<User>;
      setUsers(data.results);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        enqueueSnackbar('Sesión expirada, por favor vuelva a iniciar sesión', { variant: 'error' });
      } else {
        enqueueSnackbar('Error al cargar los usuarios', { variant: 'error' });
      }
      setUsers([]);
    }
  }, [enqueueSnackbar, isAuthenticated, user]);

  useEffect(() => {
    // Solo cargar datos si el usuario está autenticado
    if (!isAuthenticated || !user) {
      // Limpiar datos si no está autenticado
      setFees([]);
      setUnits([]);
      setUsers([]);
      return;
    }

    // Cargar todos los datos en paralelo para mayor velocidad
    Promise.all([
      getFees(),
      getUnits(),
      getUsers()
    ]).catch(error => {
      console.error('Error loading data:', error);
    });
  }, [isAuthenticated, user]); // Solo depende del estado de autenticación

  // useEffect para enriquecer las cuotas cuando units y users estén disponibles
  useEffect(() => {
    if (fees.length > 0 && units.length > 0 && users.length > 0) {
      // Solo enriquecer si aún hay cuotas sin nombre de residente o con "Sin asignar"
      const needsEnrichment = fees.some(fee => 
        !fee.resident_name || fee.resident_name === 'Sin asignar' || fee.resident_name === 'Cargando...'
      );
      
      if (needsEnrichment) {
        const enrichedFees = fees.map(fee => {
          // Si ya tiene un nombre válido, mantenerlo
          if (fee.resident_name && fee.resident_name !== 'Sin asignar' && fee.resident_name !== 'Cargando...') {
            return fee;
          }
          
          // Encontrar la unidad correspondiente
          const unit = units.find(u => u.unit_number === fee.unit_number);
          // Encontrar el usuario propietario
          const resident = unit?.owner ? users.find(u => u.id === unit.owner) : null;
          // Crear nombre completo del residente
          const residentName = resident ? `${resident.first_name} ${resident.last_name}` : 'Sin asignar';
          
          return {
            ...fee,
            resident_name: residentName
          };
        });
        
        setFees(enrichedFees);
      }
    }
  }, [fees, units, users]); // Incluir fees en las dependencias para detectar cuando necesita enriquecimiento

  // Función para manejar el cambio de residente
  const handleUserChange = (selectedUserParam: User | null) => {
    setSelectedUser(selectedUserParam);
    
    if (selectedUserParam) {
      // Buscar unidades del usuario seleccionado
      const userUnits = units.filter(unit => unit.owner === selectedUserParam.id);
      
      if (userUnits.length === 1) {
        // Si solo tiene una unidad, autocompletar
        const singleUnit = userUnits[0];
        setSelectedUnit(singleUnit);
        setCurrentFee(prev => ({
          ...prev,
          unit_number: singleUnit.unit_number
        }));
      } else {
        // Si tiene múltiples o ninguna unidad, limpiar el campo de unidad
        setSelectedUnit(null);
        setCurrentFee(prev => ({
          ...prev,
          unit_number: ''
        }));
      }
    } else {
      // Si no hay usuario seleccionado, limpiar todo
      setSelectedUnit(null);
      setCurrentFee(prev => ({
        ...prev,
        unit_number: ''
      }));
    }
  };

  // Función para manejar el cambio de unidad
  const handleUnitChange = (unit: ResidentialUnit | null) => {
    setSelectedUnit(unit);
    
    if (unit) {
      setCurrentFee(prev => ({
        ...prev,
        unit_number: unit.unit_number
      }));
      
      // Buscar el propietario de la unidad
      if (unit.owner) {
        const owner = users.find(u => u.id === unit.owner);
        setSelectedUser(owner || null);
      } else {
        setSelectedUser(null);
      }
    } else {
      setCurrentFee(prev => ({
        ...prev,
        unit_number: ''
      }));
      setSelectedUser(null);
    }
  };

  const handleCreateEdit = async () => {
    try {
      // Validar datos requeridos
      if (!currentFee.unit_number || !currentFee.description || !currentFee.amount) {
        enqueueSnackbar('Por favor complete todos los campos requeridos', { variant: 'error' });
        return;
      }

      // Encontrar el ID de la unidad basado en unit_number
      const foundUnit = units.find(unit => unit.unit_number === currentFee.unit_number);
      if (!foundUnit) {
        enqueueSnackbar('Unidad seleccionada no válida', { variant: 'error' });
        return;
      }

      // Limpiar y preparar los datos para el backend
      const cleanedData = {
        unit: foundUnit.id, // ✅ ID numérico de la unidad
        description: currentFee.description,
        amount: parseFloat(currentFee.amount || '0').toFixed(2), // ✅ Formato decimal XX.XX
        due_date: currentFee.due_date || new Date().toISOString().split('T')[0],
        status: transformStatusToBackend(currentFee.status), // ✅ Estado en español
      };

      console.log('Datos que se envían al backend:', cleanedData);

      if (currentFee.id) {
        await endpoints.put(`/administration/financial-fees/${currentFee.id}/`, cleanedData);
        enqueueSnackbar('Cuota actualizada correctamente', { variant: 'success' });
      } else {
        await endpoints.post('/administration/financial-fees/', cleanedData);
        enqueueSnackbar('Cuota creada correctamente', { variant: 'success' });
      }
      getFees();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving fee:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.data) {
        const errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : JSON.stringify(error.response.data);
        enqueueSnackbar(`Error: ${errorMessage}`, { variant: 'error' });
      } else {
        enqueueSnackbar('Error al guardar la cuota', { variant: 'error' });
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await endpoints.delete(`/administration/financial-fees/${deleteId}/`);
      enqueueSnackbar('Cuota eliminada correctamente', { variant: 'success' });
      getFees();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting fee:', error);
      enqueueSnackbar('Error al eliminar la cuota', { variant: 'error' });
    }
  };

  const handleOpenModal = (fee?: FinancialFee) => {
    if (fee) {
      // Transformar el fee de la API para asegurar valores en inglés
      const transformedFee: EditingFinancialFee = {
        ...fee,
        status: fee.status as FinancialFeeStatus, // El status debe estar en inglés desde la API
      };
      setCurrentFee(transformedFee);
      
      // Encontrar la unidad y usuario correspondientes para el autocompletado
      const unit = units.find(u => u.unit_number === fee.unit_number);
      setSelectedUnit(unit || null);
      
      if (unit?.owner) {
        const foundUser = users.find(u => u.id === unit.owner);
        setSelectedUser(foundUser || null);
      } else {
        setSelectedUser(null);
      }
    } else {
      setCurrentFee(DEFAULT_FEE);
      setSelectedUser(null);
      setSelectedUnit(null);
    }
    modal.onTrue();
  };

  const handleCloseModal = () => {
    setCurrentFee(DEFAULT_FEE);
    setSelectedUser(null);
    setSelectedUnit(null);
    modal.onFalse();
  };

  const handleOpenDeleteDialog = (id: number) => {
    setDeleteId(id);
    deleteDialog.onTrue();
  };

  const handleCloseDeleteDialog = () => {
    setDeleteId(null);
    deleteDialog.onFalse();
  };

  return (
    <Container>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h4">Gestión de Finanzas</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => handleOpenModal()}
        >
          Asignar Nueva Cuota
        </Button>
      </Box>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Unidad</TableCell>
              <TableCell>Residente</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Fecha de Vencimiento</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {fees.map((fee) => (
              <TableRow key={fee.id}>
                <TableCell>{fee.unit_number}</TableCell>
                <TableCell>{fee.resident_name || 'Sin asignar'}</TableCell>
                <TableCell>{fee.description}</TableCell>
                <TableCell>${fee.amount}</TableCell>
                <TableCell>{new Date(fee.due_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Label
                    variant="soft"
                    color={
                      (fee.status === 'paid' && 'success') ||
                      (fee.status === 'overdue' && 'error') ||
                      'warning'
                    }
                  >
                    {STATUS_OPTIONS.find((opt) => opt.value === fee.status)?.label}
                  </Label>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton onClick={() => handleOpenModal(fee)}>
                      <Iconify icon="solar:pen-bold" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton onClick={() => handleOpenDeleteDialog(fee.id)} color="error">
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={modal.value} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{currentFee.id ? 'Editar Cuota' : 'Nueva Cuota'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
            <Autocomplete
              options={users}
              value={selectedUser}
              onChange={(_, newValue) => handleUserChange(newValue)}
              getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Residente"
                  placeholder="Buscar residente..."
                  fullWidth
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            <Autocomplete
              options={selectedUser ? units.filter(unit => unit.owner === selectedUser.id) : units}
              value={selectedUnit}
              onChange={(_, newValue) => handleUnitChange(newValue)}
              getOptionLabel={(option) => {
                const unitType = option.unit_number.includes('-') ? 'Departamento' : 'Casa';
                return `${option.unit_number} - ${unitType}`;
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Unidad *"
                  placeholder="Buscar unidad..."
                  fullWidth
                  required
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            <TextField
              label="Descripción *"
              value={currentFee.description}
              onChange={(e) => setCurrentFee({ ...currentFee, description: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label="Monto *"
              type="number"
              value={currentFee.amount}
              onChange={(e) => setCurrentFee({ ...currentFee, amount: e.target.value })}
              fullWidth
              required
            />

            <DatePicker
              label="Fecha de Vencimiento"
              value={currentFee.due_date ? new Date(currentFee.due_date) : null}
              onChange={(date: Date | null) =>
                setCurrentFee({
                  ...currentFee,
                  due_date: date ? date.toISOString().split('T')[0] : undefined,
                })
              }
              slotProps={{ textField: { fullWidth: true } }}
            />

            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={currentFee.status}
                onChange={(e) =>
                  setCurrentFee({ ...currentFee, status: e.target.value as FinancialFee['status'] })
                }
                label="Estado"
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleCreateEdit} variant="contained">
            {currentFee.id ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog.value} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Está seguro que desea eliminar esta cuota?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
