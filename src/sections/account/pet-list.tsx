import type { IPet, ICreatePet } from 'src/types/pet';

import { useSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { endpoints } from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';

import { PET_SPECIES_OPTIONS } from 'src/types/pet';

// ----------------------------------------------------------------------

const initialFormValues: ICreatePet = {
  name: '',
  species: 'Perro',
  breed: '',
  age: 1,
};

export function PetList() {
  const { enqueueSnackbar } = useSnackbar();
  
  // Estados principales
  const [pets, setPets] = useState<IPet[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estados del modal
  const [open, setOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<IPet | null>(null);
  const [formValues, setFormValues] = useState<ICreatePet>(initialFormValues);

  // Obtener mascotas del usuario
  const fetchPets = useCallback(async () => {
    try {
      setLoading(true);
      const response = await endpoints.get('/administration/pets/');
      console.log('Pets API response:', response.data);
      
      // Manejar respuesta paginada o array directo
      if (Array.isArray(response.data)) {
        setPets(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        setPets(response.data.results);
      } else {
        console.error('Expected array or paginated object but got:', typeof response.data);
        setPets([]);
        enqueueSnackbar('Error: Formato de datos inesperado para mascotas', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
      setPets([]);
      enqueueSnackbar('Error al cargar las mascotas', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  // Abrir modal para crear
  const handleOpenCreate = () => {
    setEditingPet(null);
    setFormValues(initialFormValues);
    setOpen(true);
  };

  // Abrir modal para editar
  const handleOpenEdit = (pet: IPet) => {
    setEditingPet(pet);
    setFormValues({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
    });
    setOpen(true);
  };

  // Cerrar modal
  const handleClose = () => {
    setOpen(false);
    setEditingPet(null);
    setFormValues(initialFormValues);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof ICreatePet, value: string | number) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Crear o actualizar mascota
  const handleSavePet = async () => {
    try {
      if (!formValues.name || !formValues.species || !formValues.breed || !formValues.age) {
        enqueueSnackbar('Por favor completa todos los campos', { variant: 'warning' });
        return;
      }

      // Validación de edad (debe estar entre 0 y 30 años según el backend)
      if (formValues.age < 0 || formValues.age > 30) {
        enqueueSnackbar('La edad debe estar entre 0 y 30 años', { variant: 'warning' });
        return;
      }

      const payload = {
        name: formValues.name.trim(),
        species: formValues.species,
        breed: formValues.breed.trim(),
        age: formValues.age,
      };

      if (editingPet) {
        // Actualizar mascota existente
        await endpoints.patch(`/administration/pets/${editingPet.id}/`, payload);
        enqueueSnackbar('Mascota actualizada correctamente', { variant: 'success' });
      } else {
        // Crear nueva mascota
        await endpoints.post('/administration/pets/', payload);
        enqueueSnackbar('Mascota registrada correctamente', { variant: 'success' });
      }
      
      handleClose();
      fetchPets();
    } catch (error: any) {
      console.error('Error saving pet:', error);
      console.error('Error response:', error.response?.data);
      
      // Mostrar error específico del backend si está disponible
      if (error.response?.data) {
        if (error.response.data.age) {
          enqueueSnackbar(`Error: ${error.response.data.age[0]}`, { variant: 'error' });
        } else {
          const errorMessage = typeof error.response.data === 'string' 
            ? error.response.data 
            : JSON.stringify(error.response.data);
          enqueueSnackbar(`Error: ${errorMessage}`, { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Error al guardar la mascota', { variant: 'error' });
      }
    }
  };

  // Eliminar mascota
  const handleDeletePet = async (petId: number) => {
    try {
      await endpoints.delete(`/administration/pets/${petId}/`);
      enqueueSnackbar('Mascota eliminada correctamente', { variant: 'success' });
      fetchPets();
    } catch (error: any) {
      console.error('Error deleting pet:', error);
      enqueueSnackbar('Error al eliminar la mascota', { variant: 'error' });
    }
  };

  // Obtener emoji para la especie
  const getSpeciesEmoji = (species: string) => {
    switch (species) {
      case 'Perro': return '🐕';
      case 'Gato': return '🐱';
      case 'Ave': return '🐦';
      case 'Pez': return '🐠';
      default: return '🐾';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Mis Mascotas</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenCreate}
        >
          Añadir Mascota
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>Cargando mascotas...</Typography>
        </Box>
      ) : pets.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tienes mascotas registradas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Registra tu primera mascota para comenzar
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
          {pets.map((pet) => (
            <Card key={pet.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h5" component="span">
                      {getSpeciesEmoji(pet.species)}
                    </Typography>
                    <Typography variant="h6" component="div">
                      {pet.name}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenEdit(pet)}
                      title="Editar"
                    >
                      <Iconify icon="solar:pen-bold" />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeletePet(pet.id)}
                      title="Eliminar"
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography variant="body1" color="text.primary" gutterBottom>
                  {pet.species} • {pet.breed}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  Edad: {pet.age} {pet.age === 1 ? 'año' : 'años'}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Modal para crear/editar mascota */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPet ? 'Editar Mascota' : 'Añadir Nueva Mascota'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Nombre de la Mascota"
              value={formValues.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Buddy, Luna, Max..."
              required
            />
            
            <FormControl fullWidth required>
              <InputLabel>Especie</InputLabel>
              <Select
                value={formValues.species}
                label="Especie"
                onChange={(e) => handleInputChange('species', e.target.value)}
              >
                {PET_SPECIES_OPTIONS.map((species) => (
                  <MenuItem key={species} value={species}>
                    {getSpeciesEmoji(species)} {species}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Raza"
              value={formValues.breed}
              onChange={(e) => handleInputChange('breed', e.target.value)}
              placeholder="Labrador, Persa, Canario..."
              required
            />

            <TextField
              fullWidth
              label="Edad (años)"
              type="number"
              value={formValues.age}
              onChange={(e) => handleInputChange('age', parseInt(e.target.value, 10))}
              inputProps={{ min: 0, max: 30 }}
              required
              helperText="La edad debe estar entre 0 y 30 años"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSavePet}>
            {editingPet ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}