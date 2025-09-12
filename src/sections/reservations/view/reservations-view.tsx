import type { IUser } from 'src/types/user';
import type { ICommonArea } from 'src/types/common-area';
import type { IReservation, ReservationStatus } from 'src/types/reservation';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Menu from '@mui/material/Menu';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';
import { fDate, fTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

type FilterStatus = 'Todas' | ReservationStatus;

const STATUS_OPTIONS: FilterStatus[] = ['Todas', 'Pendiente', 'Confirmada', 'Cancelada'];

const STATUS_COLORS = {
  Pendiente: 'warning',
  Confirmada: 'success',
  Cancelada: 'error',
} as const;

const DEFAULT_FORM_VALUES = {
  common_area_id: '',
  user_id: '',
  start_time: '',
  end_time: '',
  status: 'Pendiente' as ReservationStatus,
  total_paid: '',
};

export function ReservationsView() {
  const [reservations, setReservations] = useState<IReservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<IReservation[]>([]);
  const [currentTab, setCurrentTab] = useState<FilterStatus>('Todas');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReservation, setSelectedReservation] = useState<IReservation | null>(null);

  // Estados para el formulario de creación
  const [commonAreas, setCommonAreas] = useState<ICommonArea[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [formValues, setFormValues] = useState(DEFAULT_FORM_VALUES);

  const createModal = useBoolean();
  const { enqueueSnackbar } = useSnackbar();

  const fetchReservations = useCallback(async () => {
    try {
      const response = await endpoints.get('/administration/reservations/');
      console.log('Reservations response:', response.data);
      
      // El backend puede devolver una respuesta paginada o directa
      const data = response.data?.results || response.data || [];
      setReservations(data);
    } catch (error: any) {
      console.error('Error fetching reservations:', error);
      if (error.response?.status === 401) {
        enqueueSnackbar('Sesión expirada, por favor vuelva a iniciar sesión', { variant: 'error' });
      } else {
        enqueueSnackbar('Error al cargar las reservas', { variant: 'error' });
      }
      setReservations([]);
    }
  }, [enqueueSnackbar]);

  const fetchCommonAreas = useCallback(async () => {
    try {
      const response = await endpoints.get('/administration/common-areas/');
      const data = response.data?.results || response.data || [];
      setCommonAreas(data);
    } catch (error: any) {
      console.error('Error fetching common areas:', error);
      enqueueSnackbar('Error al cargar las áreas comunes', { variant: 'error' });
      setCommonAreas([]);
    }
  }, [enqueueSnackbar]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await endpoints.get('/administration/users/');
      const data = response.data?.results || response.data || [];
      setUsers(data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      enqueueSnackbar('Error al cargar los usuarios', { variant: 'error' });
      setUsers([]);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchReservations();
    fetchCommonAreas();
    fetchUsers();
  }, [fetchReservations, fetchCommonAreas, fetchUsers]);

  useEffect(() => {
    if (currentTab === 'Todas') {
      setFilteredReservations(reservations);
    } else {
      setFilteredReservations(reservations.filter((reservation) => reservation.status === currentTab));
    }
  }, [reservations, currentTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: FilterStatus) => {
    setCurrentTab(newValue);
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, reservation: IReservation) => {
    setAnchorEl(event.currentTarget);
    setSelectedReservation(reservation);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedReservation(null);
  };

  // Función más genérica para actualizar cualquier estado
  const handleUpdateStatus = async (reservationId: number, newStatus: ReservationStatus) => {
    try {
      await endpoints.patch(`/administration/reservations/${reservationId}/`, {
        status: newStatus,
      });
      
      enqueueSnackbar(`Reserva actualizada a ${newStatus.toLowerCase()}`, { variant: 'success' });
      fetchReservations();
      handleCloseMenu();
    } catch (error) {
      console.error('Error updating reservation status:', error);
      enqueueSnackbar('Error al actualizar el estado de la reserva', { variant: 'error' });
    }
  };

  // Funciones del formulario de creación
  const handleOpenCreateModal = () => {
    setFormValues(DEFAULT_FORM_VALUES);
    createModal.onTrue();
  };

  const handleCloseCreateModal = () => {
    setFormValues(DEFAULT_FORM_VALUES);
    createModal.onFalse();
  };

  const handleFormChange = (field: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateReservation = async () => {
    try {
      // Validación básica
      if (!formValues.common_area_id || !formValues.user_id || !formValues.start_time || !formValues.end_time) {
        enqueueSnackbar('Por favor complete todos los campos obligatorios', { variant: 'error' });
        return;
      }

      // Convertir fechas a formato ISO 8601 completo para Django
      const formatDateTimeForDjango = (dateTimeLocal: string) => {
        if (!dateTimeLocal) return '';
        // datetime-local format: "2023-12-15T14:30"
        // Django expects: "2023-12-15T14:30:00Z"
        return dateTimeLocal + ':00Z';
      };

      const startDateTime = formatDateTimeForDjango(formValues.start_time);
      const endDateTime = formatDateTimeForDjango(formValues.end_time);

      // Payload correcto según documentación del backend
      const payload = {
        common_area: Number(formValues.common_area_id),     // Campo: common_area (no common_area_id)
        resident: Number(formValues.user_id),              // Campo: resident (no user)
        start_time: startDateTime,                          // Formato ISO 8601 con Z
        end_time: endDateTime,                              // Formato ISO 8601 con Z
        status: formValues.status,                          // String: "Pendiente", "Confirmada", "Cancelada"
        total_paid: formValues.total_paid ? parseFloat(formValues.total_paid).toFixed(2) : "0.00", // String decimal
      };

      console.log('Sending payload:', payload);
      console.log('Form values:', formValues);

      await endpoints.post('/administration/reservations/', payload);
      enqueueSnackbar('Reserva creada correctamente', { variant: 'success' });
      fetchReservations();
      handleCloseCreateModal();
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Mostrar errores específicos si están disponibles
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData).map(([field, messages]) => 
            `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
          ).join('\n');
          enqueueSnackbar(`Errores: ${errorMessages}`, { variant: 'error' });
        } else {
          enqueueSnackbar(errorData.toString(), { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Error al crear la reserva', { variant: 'error' });
      }
    }
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
        <Typography variant="h4">Gestión de Reservas</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenCreateModal}
        >
          Crear Reserva
        </Button>
      </Box>

      <Card>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            px: 2,
            bgcolor: 'background.neutral',
          }}
        >
          {STATUS_OPTIONS.map((status) => (
            <Tab
              key={status}
              value={status}
              label={status}
              sx={{ textTransform: 'capitalize' }}
            />
          ))}
        </Tabs>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Área Común</TableCell>
              <TableCell>Residente</TableCell>
              <TableCell>Fecha de Reserva</TableCell>
              <TableCell>Horario</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Total Pagado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {Array.isArray(filteredReservations) && filteredReservations.length > 0 ? (
              filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>{reservation.common_area_name}</TableCell>
                  <TableCell>{reservation.resident_name}</TableCell>
                  <TableCell>{fDate(reservation.start_time)}</TableCell>
                  <TableCell>
                    {fTime(reservation.start_time)} - {fTime(reservation.end_time)}
                  </TableCell>
                  <TableCell>
                    <Label
                      variant="soft"
                      color={STATUS_COLORS[reservation.status]}
                    >
                      {reservation.status}
                    </Label>
                  </TableCell>
                  <TableCell>${reservation.total_paid}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={(event) => handleOpenMenu(event, reservation)}
                      size="small"
                    >
                      <Iconify icon="eva:more-vertical-fill" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {currentTab === 'Todas' 
                      ? 'No hay reservas registradas' 
                      : `No hay reservas ${currentTab.toLowerCase()}`
                    }
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Menú de acciones para reservas pendientes */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {selectedReservation?.status !== 'Confirmada' && (
          <MenuItem
            onClick={() => handleUpdateStatus(selectedReservation!.id, 'Confirmada')}
            sx={{ color: 'success.main' }}
          >
            <Iconify icon="eva:checkmark-fill" sx={{ mr: 1 }} />
            Confirmar
          </MenuItem>
        )}
        {selectedReservation?.status !== 'Pendiente' && (
          <MenuItem
            onClick={() => handleUpdateStatus(selectedReservation!.id, 'Pendiente')}
            sx={{ color: 'warning.main' }}
          >
            <Iconify icon="solar:restart-bold" sx={{ mr: 1 }} />
            Marcar como Pendiente
          </MenuItem>
        )}
        {selectedReservation?.status !== 'Cancelada' && (
          <MenuItem
            onClick={() => handleUpdateStatus(selectedReservation!.id, 'Cancelada')}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="mingcute:close-line" sx={{ mr: 1 }} />
            Cancelar
          </MenuItem>
        )}
      </Menu>

      {/* Modal de Creación de Reserva */}
      <Dialog open={createModal.value} onClose={handleCloseCreateModal} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nueva Reserva</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'grid', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Área Común</InputLabel>
              <Select
                value={formValues.common_area_id}
                onChange={(e) => handleFormChange('common_area_id', e.target.value)}
                label="Área Común"
              >
                {commonAreas.map((area) => (
                  <MenuItem key={area.id} value={area.id}>
                    {area.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Residente</InputLabel>
              <Select
                value={formValues.user_id}
                onChange={(e) => handleFormChange('user_id', e.target.value)}
                label="Residente"
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Fecha y Hora de Inicio"
              type="datetime-local"
              value={formValues.start_time}
              onChange={(e) => handleFormChange('start_time', e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              label="Fecha y Hora de Fin"
              type="datetime-local"
              value={formValues.end_time}
              onChange={(e) => handleFormChange('end_time', e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={formValues.status}
                onChange={(e) => handleFormChange('status', e.target.value)}
                label="Estado"
              >
                <MenuItem value="Pendiente">Pendiente</MenuItem>
                <MenuItem value="Confirmada">Confirmada</MenuItem>
                <MenuItem value="Cancelada">Cancelada</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Monto Pagado"
              type="number"
              value={formValues.total_paid}
              onChange={(e) => handleFormChange('total_paid', e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateModal} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleCreateReservation} variant="contained">
            Crear Reserva
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
