import type { IUser } from 'src/types/user';
import type { ITask, ICreateTask, IUpdateTask } from 'src/types/task';

import { useSnackbar } from 'notistack';
import { useState, useCallback } from 'react';

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

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

interface AdminTaskViewProps {
  tasks: ITask[];
  users: IUser[];
  onRefreshTasks: () => void;
}

export function AdminTaskView({ tasks, users, onRefreshTasks }: AdminTaskViewProps) {
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [formValues, setFormValues] = useState<ICreateTask>({
    title: '',
    description: '',
    assigned_to: 0,
  });

  const { enqueueSnackbar } = useSnackbar();

  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormValues({
      title: '',
      description: '',
      assigned_to: 0,
    });
    setOpen(true);
  };

  const handleOpenEdit = (task: ITask) => {
    setEditingTask(task);
    setFormValues({
      title: task.title,
      description: task.description,
      assigned_to: task.assigned_to || 0,
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = async () => {
    try {
      if (editingTask) {
        const updateData: IUpdateTask = {
          title: formValues.title,
          description: formValues.description,
          assigned_to: formValues.assigned_to,
        };
        await endpoints.patch(`/administration/tasks/${editingTask.id}/`, updateData);
        enqueueSnackbar('Tarea actualizada exitosamente', { variant: 'success' });
      } else {
        await endpoints.post('/administration/tasks/', formValues);
        enqueueSnackbar('Tarea creada exitosamente', { variant: 'success' });
      }
      
      handleClose();
      await onRefreshTasks();
    } catch (error: any) {
      console.error('Error saving task:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        let errorMessage = 'Error al guardar la tarea';
        
        if (typeof errorData === 'object') {
          const errors = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          errorMessage = errors || errorMessage;
        }
        
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } else {
        enqueueSnackbar('Error al guardar la tarea', { variant: 'error' });
      }
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta tarea?')) {
      try {
        await endpoints.delete(`/administration/tasks/${taskId}/`);
        enqueueSnackbar('Tarea eliminada exitosamente', { variant: 'success' });
        await onRefreshTasks();
      } catch (error: any) {
        console.error('Error deleting task:', error);
        enqueueSnackbar('Error al eliminar la tarea', { variant: 'error' });
      }
    }
  };

  const handleFormChange = (field: keyof ICreateTask) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }
  ) => {
    const { value } = event.target;
    setFormValues(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completada':
        return 'success';
      case 'En Progreso':
        return 'warning';
      case 'Pendiente':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = useCallback((dateString: string) => new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }), []);

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
        <Typography variant="h4">Gestión de Tareas</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenCreate}
        >
          Crear Nueva Tarea
        </Button>
      </Box>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título</TableCell>
              <TableCell>Asignada a</TableCell>
              <TableCell>Creada por</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha de Creación</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Typography variant="subtitle2">{task.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {task.description}
                  </Typography>
                </TableCell>
                <TableCell>{task.assigned_to_name || 'Sin asignar'}</TableCell>
                <TableCell>{task.created_by_name || 'Sistema'}</TableCell>
                <TableCell>
                  <Label color={getStatusColor(task.status)}>
                    {task.status}
                  </Label>
                </TableCell>
                <TableCell>{formatDate(task.created_at)}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleOpenEdit(task)}
                    color="primary"
                  >
                    <Iconify icon="solar:pen-bold" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteTask(task.id)}
                    color="error"
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {tasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No hay tareas registradas
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
            <TextField
              label="Título"
              value={formValues.title}
              onChange={handleFormChange('title')}
              fullWidth
              required
            />

            <TextField
              label="Descripción"
              value={formValues.description}
              onChange={handleFormChange('description')}
              fullWidth
              multiline
              rows={3}
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Asignar a</InputLabel>
              <Select
                value={formValues.assigned_to || ''}
                onChange={handleFormChange('assigned_to')}
                label="Asignar a"
              >
                <MenuItem value="">
                  <em>Seleccionar usuario</em>
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
          <Button onClick={handleSaveTask} variant="contained">
            {editingTask ? 'Guardar Cambios' : 'Crear Tarea'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}