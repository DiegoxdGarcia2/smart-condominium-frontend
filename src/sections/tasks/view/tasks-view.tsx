import type { ITask } from 'src/types/task';
import type { IUser } from 'src/types/user';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { endpoints } from 'src/utils/axios';

import { useAuth } from 'src/context/AuthContext';

import { AdminTaskView } from '../admin-task-view';
import { EmployeeTaskView } from '../employee-task-view';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export function TasksView() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Verificar si el usuario es administrador
  const isAdmin = user?.role_name === 'Administrador';

  const handleRefreshTasks = useCallback(async () => {
    try {
      const response = await endpoints.get('/administration/tasks/');
      const data = response.data as PaginatedResponse<ITask>;
      setTasks(data.results || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await endpoints.get('/administration/users/');
      const data = response.data as PaginatedResponse<IUser>;
      setUsers(data.results || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Siempre cargar las tareas
      await handleRefreshTasks();
      
      // Solo cargar usuarios si es administrador
      if (isAdmin) {
        await fetchUsers();
      }
      
      setLoading(false);
    };

    loadData();
  }, [handleRefreshTasks, fetchUsers, isAdmin]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <Typography>Cargando tareas...</Typography>
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 3 }}>
          <Typography>Error: Usuario no autenticado</Typography>
        </Box>
      </Container>
    );
  }

  // Renderizar vista basada en el rol
  if (isAdmin) {
    return (
      <AdminTaskView
        tasks={tasks}
        users={users}
        onRefreshTasks={handleRefreshTasks}
      />
    );
  }

  return (
    <EmployeeTaskView
      tasks={tasks}
      onRefresh={handleRefreshTasks}
    />
  );
}