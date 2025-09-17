import type { IResident, IVisitorLog, ICreateVisitorLog } from 'src/types/visitor-log';

import { useSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';

import { endpoints } from 'src/utils/axios';
import { fDateTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const initialFormValues: ICreateVisitorLog = {
  visitor_name: '',
  visitor_dni: '',
  resident: 0,
  vehicle_license_plate: '',
  observations: '',
};

export function VisitorLogView() {
  const { enqueueSnackbar } = useSnackbar();
  
  // Estados principales
  const [visitorLogs, setVisitorLogs] = useState<IVisitorLog[]>([]);
  const [residents, setResidents] = useState<IResident[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estados del modal
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState<ICreateVisitorLog>(initialFormValues);

  // Obtener registros de visitantes
  const fetchVisitorLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await endpoints.get('/administration/visitor-logs/');
      console.log('VisitorLogs API response:', response.data);
      
      // Manejar respuesta paginada o array directo
      if (Array.isArray(response.data)) {
        setVisitorLogs(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        setVisitorLogs(response.data.results);
      } else {
        console.error('Expected array or paginated object but got:', typeof response.data);
        setVisitorLogs([]);
        enqueueSnackbar('Error: Formato de datos inesperado para registros de visitantes', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching visitor logs:', error);
      setVisitorLogs([]);
      enqueueSnackbar('Error al cargar los registros de visitantes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  // Obtener lista de residentes
  const fetchResidents = useCallback(async () => {
    try {
      const response = await endpoints.get('/administration/users/');
      console.log('Residents API response:', response.data);
      
      // Manejar respuesta paginada o array directo
      if (Array.isArray(response.data)) {
        setResidents(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        setResidents(response.data.results);
      } else {
        console.error('Expected array or paginated object but got:', typeof response.data);
        setResidents([]);
        enqueueSnackbar('Error: Formato de datos inesperado para residentes', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching residents:', error);
      setResidents([]);
      enqueueSnackbar('Error al cargar los residentes', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchVisitorLogs();
    fetchResidents();
  }, [fetchVisitorLogs, fetchResidents]);

  // Abrir modal
  const handleOpen = () => {
    setOpen(true);
  };

  // Cerrar modal
  const handleClose = () => {
    setOpen(false);
    setFormValues(initialFormValues);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof ICreateVisitorLog, value: string | number) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Registrar nueva visita
  const handleCreateVisit = async () => {
    try {
      if (!formValues.visitor_name || !formValues.visitor_dni || !formValues.resident) {
        enqueueSnackbar('Por favor completa todos los campos obligatorios', { variant: 'warning' });
        return;
      }

      // Validación del DNI (debe tener al menos 7 caracteres según el backend)
      if (formValues.visitor_dni.trim().length < 7) {
        enqueueSnackbar('El DNI debe tener al menos 7 caracteres', { variant: 'warning' });
        return;
      }

      // Validación del residente seleccionado
      if (formValues.resident <= 0) {
        enqueueSnackbar('Por favor selecciona un residente válido', { variant: 'warning' });
        return;
      }

      // Crear payload limpio sin campos undefined
      const payload: any = {
        visitor_name: formValues.visitor_name.trim(),
        visitor_dni: formValues.visitor_dni.trim(),
        resident: formValues.resident,
      };

      // Solo añadir campos opcionales si tienen valor
      if (formValues.vehicle_license_plate && formValues.vehicle_license_plate.trim()) {
        payload.vehicle_license_plate = formValues.vehicle_license_plate.trim();
      }

      if (formValues.observations && formValues.observations.trim()) {
        payload.observations = formValues.observations.trim();
      }

      console.log('Sending payload:', payload);
      console.log('Form values:', formValues);

      await endpoints.post('/administration/visitor-logs/', payload);
      
      enqueueSnackbar('Visita registrada correctamente', { variant: 'success' });
      handleClose();
      fetchVisitorLogs();
    } catch (error: any) {
      console.error('Error creating visitor log:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Mostrar error específico del backend si está disponible
      if (error.response?.data) {
        const errorMessage = typeof error.response.data === 'string' 
          ? error.response.data 
          : JSON.stringify(error.response.data);
        enqueueSnackbar(`Error: ${errorMessage}`, { variant: 'error' });
      } else {
        enqueueSnackbar('Error al registrar la visita', { variant: 'error' });
      }
    }
  };

  // Registrar salida de visitante
  const handleRegisterExit = async (visitorLogId: number) => {
    try {
      await endpoints.post(`/administration/visitor-logs/${visitorLogId}/register_exit/`, {});
      
      enqueueSnackbar('Salida registrada correctamente', { variant: 'success' });
      fetchVisitorLogs();
    } catch (error: any) {
      console.error('Error registering exit:', error);
      
      // Manejar errores específicos del backend
      if (error.response?.data?.error) {
        enqueueSnackbar(error.response.data.error, { variant: 'error' });
      } else {
        enqueueSnackbar('Error al registrar la salida', { variant: 'error' });
      }
    }
  };

  return (
    <Container>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Registro de Visitas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gestiona el registro de entrada y salida de visitantes al condominio
        </Typography>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpen}
        >
          Registrar Nueva Visita
        </Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Visitante</TableCell>
                <TableCell>DNI</TableCell>
                <TableCell>Residente Visitado</TableCell>
                <TableCell>Hora de Entrada</TableCell>
                <TableCell>Hora de Salida</TableCell>
                <TableCell>Placa del Vehículo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography>Cargando...</Typography>
                  </TableCell>
                </TableRow>
              ) : Array.isArray(visitorLogs) && visitorLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography>No hay registros de visitantes</Typography>
                  </TableCell>
                </TableRow>
              ) : Array.isArray(visitorLogs) ? (
                visitorLogs.map((visitorLog) => (
                  <TableRow key={visitorLog.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {visitorLog.visitor_name}
                      </Typography>
                    </TableCell>
                    <TableCell>{visitorLog.visitor_dni}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {visitorLog.resident_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {visitorLog.unit_number}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {fDateTime(visitorLog.entry_time)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {visitorLog.exit_time ? (
                        <Typography variant="body2">
                          {fDateTime(visitorLog.exit_time)}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="warning.main">
                          En el condominio
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {visitorLog.vehicle_license_plate || '-'}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor: visitorLog.status === 'Activo' ? 'warning.lighter' : 'success.lighter',
                          color: visitorLog.status === 'Activo' ? 'warning.darker' : 'success.darker',
                          display: 'inline-block',
                        }}
                      >
                        <Typography variant="caption" fontWeight="medium">
                          {visitorLog.status}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {!visitorLog.exit_time && (
                        <IconButton
                          color="primary"
                          onClick={() => handleRegisterExit(visitorLog.id)}
                          title="Registrar Salida"
                        >
                          <Iconify icon="solar:check-circle-bold" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography>Error al cargar los datos</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal para registrar nueva visita */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar Nueva Visita</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Nombre del Visitante"
              value={formValues.visitor_name}
              onChange={(e) => handleInputChange('visitor_name', e.target.value)}
              required
            />
            
            <TextField
              fullWidth
              label="DNI del Visitante"
              value={formValues.visitor_dni}
              onChange={(e) => handleInputChange('visitor_dni', e.target.value)}
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Residente Visitado</InputLabel>
              <Select
                value={formValues.resident}
                label="Residente Visitado"
                onChange={(e) => handleInputChange('resident', e.target.value as number)}
              >
                {Array.isArray(residents) && residents.length > 0 ? (
                  residents.map((resident) => (
                    <MenuItem key={resident.id} value={resident.id}>
                      {`${resident.first_name} ${resident.last_name} - ${resident.unit_number}`}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value={0}>
                    No hay residentes disponibles
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Placa del Vehículo (Opcional)"
              value={formValues.vehicle_license_plate}
              onChange={(e) => handleInputChange('vehicle_license_plate', e.target.value)}
            />

            <TextField
              fullWidth
              label="Observaciones (Opcional)"
              multiline
              rows={3}
              value={formValues.observations}
              onChange={(e) => handleInputChange('observations', e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateVisit}>
            Registrar Visita
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}