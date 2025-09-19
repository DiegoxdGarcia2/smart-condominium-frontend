import type { IFeedback, ICreateFeedback } from 'src/types/feedback';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';

import api from 'src/services/api';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [formData, setFormData] = useState<ICreateFeedback>({
    subject: '',
    message: '',
  });

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

  const handleSubmit = async () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      setSnackbar({
        open: true,
        message: 'Por favor completa todos los campos',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/administration/feedback/', formData);
      setSnackbar({
        open: true,
        message: 'Mensaje enviado exitosamente',
        severity: 'success'
      });
      setOpen(false);
      setFormData({ subject: '', message: '' });
      fetchFeedbacks();
    } catch (error) {
      console.error('Error creating feedback:', error);
      setSnackbar({
        open: true,
        message: 'Error al enviar el mensaje',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({ subject: '', message: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 'warning';
      case 'Leído':
        return 'info';
      case 'Resuelto':
        return 'success';
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Mis Sugerencias y Reclamos
        </Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="solar:pen-bold" />}
          onClick={() => setOpen(true)}
        >
          Enviar Nuevo Mensaje
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Asunto</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha de Envío</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!Array.isArray(feedbacks) || feedbacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {!Array.isArray(feedbacks) ? 'Error cargando mensajes' : 'No has enviado ningún mensaje aún'}
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
                        {feedback.message.length > 100 
                          ? `${feedback.message.substring(0, 100)}...`
                          : feedback.message
                        }
                      </Typography>
                    </Box>
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para enviar nuevo mensaje */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Enviar Nuevo Mensaje</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Asunto"
              fullWidth
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
            <TextField
              label="Mensaje"
              fullWidth
              multiline
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
}