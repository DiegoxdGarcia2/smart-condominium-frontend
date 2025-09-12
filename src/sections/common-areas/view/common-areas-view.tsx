import type { ICommonArea } from 'src/types/common-area';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------

const DEFAULT_AREA: Omit<ICommonArea, 'id'> = {
  name: '',
  description: '',
  capacity: 0,
  booking_price: '0.00',
};

export function CommonAreasView() {
  const [commonAreas, setCommonAreas] = useState<ICommonArea[]>([]);
  const [currentArea, setCurrentArea] = useState<Omit<ICommonArea, 'id'> & { id?: number }>(DEFAULT_AREA);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const modal = useBoolean();
  const deleteDialog = useBoolean();
  const { enqueueSnackbar } = useSnackbar();

  const fetchCommonAreas = useCallback(async () => {
    try {
      const response = await endpoints.get('/administration/common-areas/');
      console.log('Common areas response:', response.data);
      
      // El backend devuelve una respuesta paginada con estructura: { count, next, previous, results }
      const data = response.data?.results || [];
      setCommonAreas(data);
    } catch (error: any) {
      console.error('Error fetching common areas:', error);
      if (error.response?.status === 401) {
        enqueueSnackbar('Sesión expirada, por favor vuelva a iniciar sesión', { variant: 'error' });
      } else {
        enqueueSnackbar('Error al cargar las áreas comunes', { variant: 'error' });
      }
      setCommonAreas([]);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchCommonAreas();
  }, [fetchCommonAreas]);

  const handleSave = async () => {
    try {
      const payload = {
        name: currentArea.name,
        description: currentArea.description,
        capacity: Number(currentArea.capacity),
        booking_price: currentArea.booking_price,
      };

      if (currentArea.id) {
        await endpoints.put(`/administration/common-areas/${currentArea.id}/`, payload);
        enqueueSnackbar('Área común actualizada correctamente', { variant: 'success' });
      } else {
        await endpoints.post('/administration/common-areas/', payload);
        enqueueSnackbar('Área común creada correctamente', { variant: 'success' });
      }
      
      fetchCommonAreas();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving common area:', error);
      enqueueSnackbar('Error al guardar el área común', { variant: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await endpoints.delete(`/administration/common-areas/${deleteId}/`);
      enqueueSnackbar('Área común eliminada correctamente', { variant: 'success' });
      fetchCommonAreas();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Error deleting common area:', error);
      enqueueSnackbar('Error al eliminar el área común', { variant: 'error' });
    }
  };

  const handleOpenModal = (area?: ICommonArea) => {
    if (area) {
      setCurrentArea(area);
    } else {
      setCurrentArea(DEFAULT_AREA);
    }
    modal.onTrue();
  };

  const handleCloseModal = () => {
    setCurrentArea(DEFAULT_AREA);
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
        <Typography variant="h4">Gestión de Áreas Comunes</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => handleOpenModal()}
        >
          Nueva Área Común
        </Button>
      </Box>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Capacidad</TableCell>
              <TableCell>Precio de Reserva</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {Array.isArray(commonAreas) && commonAreas.length > 0 ? (
              commonAreas.map((area) => (
                <TableRow key={area.id}>
                  <TableCell>{area.name}</TableCell>
                  <TableCell>{area.capacity} personas</TableCell>
                  <TableCell>${area.booking_price}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton onClick={() => handleOpenModal(area)}>
                        <Iconify icon="solar:pen-bold" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton onClick={() => handleOpenDeleteDialog(area.id)} color="error">
                        <Iconify icon="solar:trash-bin-trash-bold" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No hay áreas comunes registradas
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal de Creación/Edición */}
      <Dialog open={modal.value} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{currentArea.id ? 'Editar Área Común' : 'Nueva Área Común'}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
            <TextField
              label="Nombre"
              value={currentArea.name}
              onChange={(e) => setCurrentArea({ ...currentArea, name: e.target.value })}
              fullWidth
            />

            <TextField
              label="Descripción"
              value={currentArea.description}
              onChange={(e) => setCurrentArea({ ...currentArea, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />

            <TextField
              label="Capacidad"
              type="number"
              value={currentArea.capacity}
              onChange={(e) => setCurrentArea({ ...currentArea, capacity: Number(e.target.value) })}
              fullWidth
            />

            <TextField
              label="Precio de Reserva"
              type="number"
              value={currentArea.booking_price}
              onChange={(e) => setCurrentArea({ ...currentArea, booking_price: e.target.value })}
              fullWidth
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="contained">
            {currentArea.id ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Confirmación de Eliminación */}
      <Dialog open={deleteDialog.value} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <Typography>¿Está seguro que desea eliminar esta área común?</Typography>
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
