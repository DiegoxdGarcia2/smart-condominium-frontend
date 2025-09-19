import type { IFeedback } from 'src/types/feedback';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Menu from '@mui/material/Menu';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import api from 'src/services/api';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { FEEDBACK_STATUS } from 'src/types/feedback';

// ----------------------------------------------------------------------

export function FeedbackView() {
  const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<IFeedback | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchFeedbacks = async () => {
    try {
      const response = await api.get('/administration/feedback/');
      console.log('Feedback response:', response.data);
      
      // Verificar si la respuesta es un array o tiene una estructura diferente
      let feedbackData: IFeedback[] = [];
      
      if (Array.isArray(response.data)) {
        feedbackData = response.data;
      } else if (response.data && Array.isArray(response.data.feedbacks)) {
        feedbackData = response.data.feedbacks;
      } else if (response.data && Array.isArray(response.data.results)) {
        feedbackData = response.data.results;
      } else {
        console.warn('Unexpected response structure:', response.data);
        feedbackData = [];
      }
      
      setFeedbacks(feedbackData);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setFeedbacks([]); // Asegurar que feedbacks sea siempre un array
      setSnackbar({
        open: true,
        message: 'Error al cargar los mensajes',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, feedback: IFeedback) => {
    setAnchorEl(event.currentTarget);
    setSelectedFeedback(feedback);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFeedback(null);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedFeedback) return;

    try {
      await api.patch(`/administration/feedback/${selectedFeedback.id}/`, {
        status: newStatus
      });
      
      setSnackbar({
        open: true,
        message: `Estado cambiado a ${newStatus}`,
        severity: 'success'
      });
      
      fetchFeedbacks();
    } catch (error) {
      console.error('Error updating feedback status:', error);
      setSnackbar({
        open: true,
        message: 'Error al actualizar el estado',
        severity: 'error'
      });
    } finally {
      handleMenuClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case FEEDBACK_STATUS.PENDIENTE:
        return 'warning';
      case FEEDBACK_STATUS.EN_REVISION:
        return 'info';
      case FEEDBACK_STATUS.RESPONDIDO:
        return 'success';
      case FEEDBACK_STATUS.CERRADO:
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Bandeja de Entrada de Feedback
      </Typography>

      <Card>
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Asunto</TableCell>
                  <TableCell>Residente</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha de Envío</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {!Array.isArray(feedbacks) || feedbacks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        {!Array.isArray(feedbacks) ? 'Error cargando mensajes' : 'No hay mensajes de feedback'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  feedbacks.map((feedback) => (
                    <TableRow key={feedback.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">
                            {feedback.subject}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {feedback.message.length > 150 
                              ? `${feedback.message.substring(0, 150)}...`
                              : feedback.message
                            }
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {feedback.resident_name}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={feedback.status}
                          color={getStatusColor(feedback.status)}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        {formatDate(feedback.created_at)}
                      </TableCell>

                      <TableCell align="right">
                        <IconButton
                          onClick={(event) => handleMenuOpen(event, feedback)}
                        >
                          <Iconify icon="custom:menu-duotone" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
      </Card>

      {/* Menú contextual para cambiar estado */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => handleStatusChange(FEEDBACK_STATUS.EN_REVISION)}
          disabled={selectedFeedback?.status === FEEDBACK_STATUS.EN_REVISION}
        >
          <Iconify icon="solar:eye-bold" sx={{ mr: 2 }} />
          Marcar en Revisión
        </MenuItem>
        <MenuItem 
          onClick={() => handleStatusChange(FEEDBACK_STATUS.RESPONDIDO)}
          disabled={selectedFeedback?.status === FEEDBACK_STATUS.RESPONDIDO}
        >
          <Iconify icon="solar:check-circle-bold" sx={{ mr: 2 }} />
          Marcar como Respondido
        </MenuItem>
        <MenuItem 
          onClick={() => handleStatusChange(FEEDBACK_STATUS.CERRADO)}
          disabled={selectedFeedback?.status === FEEDBACK_STATUS.CERRADO}
        >
          <Iconify icon="solar:check-circle-bold" sx={{ mr: 2 }} />
          Cerrar Feedback
        </MenuItem>
      </Menu>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}