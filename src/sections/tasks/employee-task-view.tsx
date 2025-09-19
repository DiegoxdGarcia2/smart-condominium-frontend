import type { ITask } from 'src/types/task';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Menu from '@mui/material/Menu';
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

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

interface EmployeeTaskViewProps {
  tasks: ITask[];
  onRefresh: () => void;
}

export function EmployeeTaskView({ tasks, onRefresh }: EmployeeTaskViewProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, task: ITask) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedTask) return;

    try {
      await api.patch(`/administration/tasks/${selectedTask.id}/`, {
        status: newStatus,
      });
      
      setSnackbar({
        open: true,
        message: `Tarea marcada como ${newStatus}`,
        severity: 'success'
      });
      
      onRefresh();
      handleCloseMenu();
    } catch (error: any) {
      console.error('Error updating task status:', error);
      setSnackbar({
        open: true,
        message: 'Error al actualizar el estado de la tarea',
        severity: 'error'
      });
    }
  };

  const getLabelColor = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return 'warning';
      case 'En Progreso':
        return 'info';
      case 'Completada':
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
      minute: '2-digit',
    });

  const getStatusMenuOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'Pendiente':
        return [{ value: 'En Progreso', label: 'Iniciar Tarea' }];
      case 'En Progreso':
        return [{ value: 'Completada', label: 'Completar Tarea' }];
      case 'Completada':
        return []; // Las tareas completadas no se pueden cambiar
      default:
        return [];
    }
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Mis Tareas Asignadas
      </Typography>

      <Card>
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha de Creación</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No tienes tareas asignadas
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {task.title}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {task.description.length > 100
                            ? `${task.description.substring(0, 100)}...`
                            : task.description
                          }
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Label color={getLabelColor(task.status)}>
                          {task.status}
                        </Label>
                      </TableCell>

                      <TableCell>
                        {formatDate(task.created_at)}
                      </TableCell>

                      <TableCell align="right">
                        <IconButton
                          onClick={(event) => handleOpenMenu(event, task)}
                          disabled={task.status === 'Completada'}
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
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {selectedTask &&
          getStatusMenuOptions(selectedTask.status).map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => handleUpdateStatus(option.value)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Iconify 
                  icon={option.value === 'En Progreso' ? 'solar:restart-bold' : 'solar:eye-bold'} 
                  sx={{ mr: 1 }} 
                />
                {option.label}
              </Box>
            </MenuItem>
          ))
        }
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