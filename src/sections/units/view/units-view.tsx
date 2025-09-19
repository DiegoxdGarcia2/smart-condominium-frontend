import type { IUser } from 'src/types/user';
import type { IResidentialUnit, ICreateResidentialUnit, IUpdateResidentialUnit } from 'src/types/unit';

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
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { endpoints } from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';

import { UNIT_TYPE_OPTIONS } from 'src/types/unit';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export function UnitsView() {
  const [units, setUnits] = useState<IResidentialUnit[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<IResidentialUnit | null>(null);
  const [formValues, setFormValues] = useState<ICreateResidentialUnit>({
    unit_number: '',
    type: 'Departamento',
    floor: null,
    owner: null,
  });

  const { enqueueSnackbar } = useSnackbar();

  const fetchUnits = useCallback(async () => {
    try {
      const response = await endpoints.get('/administration/residential-units/');
      const data = response.data as PaginatedResponse<IResidentialUnit>;
      setUnits(data.results || []);
    } catch (error: any) {
      console.error('Error fetching units:', error);
      enqueueSnackbar('Error al cargar las unidades', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await endpoints.get('/administration/users/');
      const data = response.data as PaginatedResponse<IUser>;
      setUsers(data.results || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      enqueueSnackbar('Error al cargar los usuarios', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUnits(), fetchUsers()]);
      setLoading(false);
    };

    loadData();
  }, [fetchUnits, fetchUsers]);

  const handleOpenCreate = () => {
    setEditingUnit(null);
    setFormValues({
      unit_number: '',
      type: 'Departamento',
      floor: null,
      owner: null,
    });
    setOpen(true);
  };

  const handleOpenEdit = (unit: IResidentialUnit) => {
    setEditingUnit(unit);
    setFormValues({
      unit_number: unit.unit_number,
      type: unit.type,
      floor: unit.floor,
      owner: unit.owner,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUnit(null);
  };

  const handleSaveUnit = async () => {
    try {
      if (editingUnit) {
        const updateData: IUpdateResidentialUnit = {
          unit_number: formValues.unit_number,
          type: formValues.type,
          floor: formValues.floor,
          owner: formValues.owner,
        };
        await endpoints.patch(`/administration/residential-units/${editingUnit.id}/`, updateData);
        enqueueSnackbar('Unidad actualizada exitosamente', { variant: 'success' });
      } else {
        await endpoints.post('/administration/residential-units/', formValues);
        enqueueSnackbar('Unidad creada exitosamente', { variant: 'success' });
      }
      
      handleClose();
      await fetchUnits();
    } catch (error: any) {
      console.error('Error saving unit:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = 'Error al guardar la unidad';
        
        if (typeof errorData === 'object') {
          const errors = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          errorMessage = errors || errorMessage;
        }
        
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } else {
        enqueueSnackbar('Error al guardar la unidad', { variant: 'error' });
      }
    }
  };

  const handleDeleteUnit = async (unitId: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta unidad?')) {
      try {
        await endpoints.delete(`/administration/residential-units/${unitId}/`);
        enqueueSnackbar('Unidad eliminada exitosamente', { variant: 'success' });
        await fetchUnits();
      } catch (error: any) {
        console.error('Error deleting unit:', error);
        enqueueSnackbar('Error al eliminar la unidad', { variant: 'error' });
      }
    }
  };

  const handleFormChange = (field: keyof ICreateResidentialUnit) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
  ) => {
    const { value } = event.target;
    setFormValues(prev => ({
      ...prev,
      [field]: value === '' ? null : value,
    }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography>Cargando...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Typography variant="h4">Unidades Residenciales</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenCreate}
        >
          Nueva Unidad
        </Button>
      </Box>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Número de Unidad</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Piso</TableCell>
              <TableCell>Propietario</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell>{unit.unit_number}</TableCell>
                <TableCell>{unit.type}</TableCell>
                <TableCell>{unit.floor || 'N/A'}</TableCell>
                <TableCell>{unit.owner_name || 'Sin asignar'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleOpenEdit(unit)}
                    color="primary"
                  >
                    <Iconify icon="solar:pen-bold" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteUnit(unit.id)}
                    color="error"
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {units.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No hay unidades registradas
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUnit ? 'Editar Unidad' : 'Nueva Unidad'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
            <TextField
              label="Número de Unidad"
              value={formValues.unit_number}
              onChange={handleFormChange('unit_number')}
              fullWidth
              required
              placeholder="Ej: A-101, B-203, Casa-15"
            />

            <FormControl fullWidth required>
              <InputLabel>Tipo de Unidad</InputLabel>
              <Select
                value={formValues.type}
                onChange={handleFormChange('type')}
                label="Tipo de Unidad"
              >
                {UNIT_TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Piso"
              type="number"
              value={formValues.floor || ''}
              onChange={handleFormChange('floor')}
              fullWidth
              helperText="Dejar vacío si no aplica (ej: casas)"
            />

            <FormControl fullWidth>
              <InputLabel>Propietario</InputLabel>
              <Select
                value={formValues.owner || ''}
                onChange={handleFormChange('owner')}
                label="Propietario"
              >
                <MenuItem value="">
                  <em>Sin asignar</em>
                </MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSaveUnit} variant="contained">
            {editingUnit ? 'Guardar Cambios' : 'Crear Unidad'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}