/* eslint-disable perfectionist/sort-imports */
import { useState, useEffect, useCallback } from 'react';

import type { IAnnouncement } from 'src/types/announcement';
import { useAuth } from 'src/context/AuthContext';

import {
  Box,
  Card,
  Table,
  Stack,
  Button,
  Dialog,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Container,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { DashboardContent } from 'src/layouts/dashboard';
import { fDate } from 'src/utils/format-time';

import api from 'src/services/api';

// ----------------------------------------------------------------------

export function AnnouncementsView() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<IAnnouncement[]>([]);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false); // Modal para ver detalles
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<IAnnouncement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);

  // Detectar si es residente
  const isResident = user?.role_name?.toLowerCase() === 'residente' || user?.role_name?.toLowerCase() === 'resident';

  // Obtención de datos
  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/administration/announcements/');
      console.log('API Response:', response.data); // Debug log
      
      // Verificar si la respuesta es un array o si está envuelta en un objeto
      const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]); // Asegurar que siempre sea un array en caso de error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Handlers para el modal
  const handleOpenModal = (announcement?: IAnnouncement) => {
    if (announcement) {
      setSelectedAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        content: announcement.content,
      });
    } else {
      setSelectedAnnouncement(null);
      setFormData({
        title: '',
        content: '',
      });
    }
    setOpen(true);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setSelectedAnnouncement(null);
    setFormData({
      title: '',
      content: '',
    });
  };

  // Handler para ver detalles (solo lectura)
  const handleViewDetails = (announcement: IAnnouncement) => {
    setSelectedAnnouncement(announcement);
    setViewOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewOpen(false);
    setSelectedAnnouncement(null);
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  // CRUD Operations
  const handleSave = async () => {
    try {
      setLoading(true);

      // Validar campos requeridos
      if (!formData.title?.trim() || !formData.content?.trim()) {
        throw new Error('El título y el contenido son obligatorios');
      }

      // Verificar que tenemos el ID del usuario
      if (!user?.id) {
        throw new Error('No se pudo identificar al autor del comunicado');
      }

      // Crear payload con los campos necesarios incluyendo el autor
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        author: user.id
      };

      console.log('Enviando payload:', payload);

      if (selectedAnnouncement?.id) {
        // 2. Lógica para EDITAR (PUT)
        const response = await api.put(`/administration/announcements/${selectedAnnouncement.id}/`, payload);
        console.log('Respuesta PUT:', response);
      } else {
        // 3. Lógica para CREAR (POST)
        const response = await api.post('/administration/announcements/', payload);
        console.log('Respuesta POST:', response);
      }
      
      // 4. Refresca los datos y cierra el modal
      await fetchAnnouncements();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error completo:', error);
      // Intentar obtener el mensaje de error del backend
      const errorMsg = error.response?.data?.detail || 
                      error.response?.data?.message ||
                      error.response?.data ||
                      error.message ||
                      'Error al guardar el comunicado';
      console.error('Mensaje de error:', errorMsg);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este comunicado?')) {
      try {
        setLoading(true);
        await api.delete(`/administration/announcements/${id}/`);
        fetchAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <DashboardContent>
      <Container maxWidth="xl">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4">Comunicados</Typography>
          {!isResident && (
            <Button
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon="solar:check-circle-bold" />}
              onClick={() => handleOpenModal()}
            >
              Nuevo Comunicado
            </Button>
          )}
        </Stack>

        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width="20%">Título</TableCell>
                  <TableCell width={isResident ? "45%" : "40%"}>Contenido</TableCell>
                  <TableCell width="15%">Autor</TableCell>
                  <TableCell width="15%">Fecha de Creación</TableCell>
                  {!isResident && <TableCell width="10%" align="right">Acciones</TableCell>}
                  {isResident && <TableCell width="5%" align="right">Ver</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2">Cargando comunicados...</Typography>
                    </TableCell>
                  </TableRow>
                ) : Array.isArray(announcements) && announcements.length > 0 ? (
                  announcements.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.title}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {row.content}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.author_name}</TableCell>
                      <TableCell>{fDate(row.created_at)}</TableCell>
                      <TableCell align="right">
                        {isResident ? (
                          // Solo botón de ver para residentes
                          <IconButton onClick={() => handleViewDetails(row)} title="Ver detalles">
                            <Iconify icon="solar:eye-bold" />
                          </IconButton>
                        ) : (
                          // Botones de edición y eliminación para administradores
                          <>
                            <IconButton onClick={() => handleOpenModal(row)} title="Editar">
                              <Iconify icon="solar:pen-bold" />
                            </IconButton>
                            <IconButton 
                              onClick={() => handleDelete(row.id)} 
                              sx={{ color: 'error.main' }}
                              title="Eliminar"
                            >
                              <Iconify icon="solar:trash-bin-trash-bold" />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No hay comunicados disponibles
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

      {/* Modal de visualización para residentes */}
      <Dialog
        open={viewOpen}
        onClose={handleCloseViewModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h5" component="div">
            {selectedAnnouncement?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Autor: {selectedAnnouncement?.author_name} • {selectedAnnouncement && fDate(selectedAnnouncement.created_at)}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ 
            whiteSpace: 'pre-wrap', 
            lineHeight: 1.6,
            textAlign: 'justify'
          }}>
            {selectedAnnouncement?.content}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseViewModal} variant="contained" color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

        {/* Modal de Creación/Edición */}
        <Dialog open={open} onClose={handleCloseModal} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedAnnouncement ? 'Editar Comunicado' : 'Nuevo Comunicado'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Título"
                value={formData.title}
                onChange={handleInputChange('title')}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Contenido"
                value={formData.content}
                onChange={handleInputChange('content')}
                margin="normal"
                multiline
                rows={4}
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancelar</Button>
            <Button onClick={handleSave} variant="contained" disabled={loading}>
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardContent>
  );
}
