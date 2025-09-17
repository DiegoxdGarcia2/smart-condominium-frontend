import type { IVehicle, ICreateVehicle } from 'src/types/vehicle';

import { useSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { endpoints } from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const initialFormValues: ICreateVehicle = {
  license_plate: '',
  brand: '',
  model: '',
  color: '',
};

export function VehicleList() {
  const { enqueueSnackbar } = useSnackbar();
  
  // Estados principales
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estados del modal
  const [open, setOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<IVehicle | null>(null);
  const [formValues, setFormValues] = useState<ICreateVehicle>(initialFormValues);

  // Obtener vehículos del usuario
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await endpoints.get('/administration/vehicles/');
      console.log('Vehicles API response:', response.data);
      
      // Manejar respuesta paginada o array directo
      if (Array.isArray(response.data)) {
        setVehicles(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        setVehicles(response.data.results);
      } else {
        console.error('Expected array or paginated object but got:', typeof response.data);
        setVehicles([]);
        enqueueSnackbar('Error: Formato de datos inesperado para vehículos', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
      enqueueSnackbar('Error al cargar los vehículos', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Abrir modal para crear
  const handleOpenCreate = () => {
    setEditingVehicle(null);
    setFormValues(initialFormValues);
    setOpen(true);
  };

  // Abrir modal para editar
  const handleOpenEdit = (vehicle: IVehicle) => {
    setEditingVehicle(vehicle);
    setFormValues({
      license_plate: vehicle.license_plate,
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color,
    });
    setOpen(true);
  };

  // Cerrar modal
  const handleClose = () => {
    setOpen(false);
    setEditingVehicle(null);
    setFormValues(initialFormValues);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof ICreateVehicle, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Crear o actualizar vehículo
  const handleSaveVehicle = async () => {
    try {
      if (!formValues.license_plate || !formValues.brand || !formValues.model || !formValues.color) {
        enqueueSnackbar('Por favor completa todos los campos', { variant: 'warning' });
        return;
      }

      // Validación de placa (debe tener al menos 6 caracteres según el backend)
      if (formValues.license_plate.trim().length < 6) {
        enqueueSnackbar('La placa debe tener al menos 6 caracteres', { variant: 'warning' });
        return;
      }

      const payload = {
        license_plate: formValues.license_plate.trim().toUpperCase(),
        brand: formValues.brand.trim(),
        model: formValues.model.trim(),
        color: formValues.color.trim(),
      };

      if (editingVehicle) {
        // Actualizar vehículo existente
        await endpoints.patch(`/administration/vehicles/${editingVehicle.id}/`, payload);
        enqueueSnackbar('Vehículo actualizado correctamente', { variant: 'success' });
      } else {
        // Crear nuevo vehículo
        await endpoints.post('/administration/vehicles/', payload);
        enqueueSnackbar('Vehículo registrado correctamente', { variant: 'success' });
      }
      
      handleClose();
      fetchVehicles();
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      console.error('Error response:', error.response?.data);
      
      // Mostrar error específico del backend si está disponible
      if (error.response?.data) {
        if (error.response.data.license_plate) {
          enqueueSnackbar(`Error: ${error.response.data.license_plate[0]}`, { variant: 'error' });
        } else {
          const errorMessage = typeof error.response.data === 'string' 
            ? error.response.data 
            : JSON.stringify(error.response.data);
          enqueueSnackbar(`Error: ${errorMessage}`, { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Error al guardar el vehículo', { variant: 'error' });
      }
    }
  };

  // Eliminar vehículo
  const handleDeleteVehicle = async (vehicleId: number) => {
    try {
      await endpoints.delete(`/administration/vehicles/${vehicleId}/`);
      enqueueSnackbar('Vehículo eliminado correctamente', { variant: 'success' });
      fetchVehicles();
    } catch (error: any) {
      console.error('Error deleting vehicle:', error);
      enqueueSnackbar('Error al eliminar el vehículo', { variant: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Mis Vehículos</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenCreate}
        >
          Añadir Vehículo
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Cargando vehículos...</Typography>
        </Box>
      ) : vehicles.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tienes vehículos registrados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Añade tu primer vehículo para comenzar
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {vehicle.license_plate}
                  </Typography>
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenEdit(vehicle)}
                      title="Editar"
                    >
                      <Iconify icon="solar:pen-bold" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                      title="Eliminar"
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography variant="body1" color="text.primary" gutterBottom>
                  {vehicle.brand} {vehicle.model}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  Color: {vehicle.color}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Modal para crear/editar vehículo */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingVehicle ? 'Editar Vehículo' : 'Añadir Nuevo Vehículo'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Placa del Vehículo"
              value={formValues.license_plate}
              onChange={(e) => handleInputChange('license_plate', e.target.value)}
              placeholder="ABC-123"
              required
              helperText="La placa debe tener al menos 6 caracteres"
            />
            
            <TextField
              fullWidth
              label="Marca"
              value={formValues.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              placeholder="Toyota, Honda, BMW..."
              required
            />

            <TextField
              fullWidth
              label="Modelo"
              value={formValues.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              placeholder="Corolla, Accord, X3..."
              required
            />

            <TextField
              fullWidth
              label="Color"
              value={formValues.color}
              onChange={(e) => handleInputChange('color', e.target.value)}
              placeholder="Blanco, Negro, Azul..."
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveVehicle}>
            {editingVehicle ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}