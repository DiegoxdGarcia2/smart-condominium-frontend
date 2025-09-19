import type { IUser, IRole, ICreateUser, IUpdateUser } from 'src/types/user';

import { useSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
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

import { RoleManagement } from '../role-management';

// ----------------------------------------------------------------------

const initialFormValues: ICreateUser = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  role: '',
};

export function UsersView() {
  const { enqueueSnackbar } = useSnackbar();
  
  // Estado para las pestañas
  const [currentTab, setCurrentTab] = useState('users');
  
  // Estados principales
  const [users, setUsers] = useState<IUser[]>([]);
  const [roles, setRoles] = useState<IRole[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estados del modal
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [formValues, setFormValues] = useState<ICreateUser>(initialFormValues);

  // Obtener usuarios
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await endpoints.get('/administration/users/');
      const data = response.data?.results || response.data || [];
      setUsers(data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        enqueueSnackbar('Sesión expirada, por favor vuelva a iniciar sesión', { variant: 'error' });
      } else {
        enqueueSnackbar('Error al cargar los usuarios', { variant: 'error' });
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  // Obtener roles
  const fetchRoles = useCallback(async () => {
    try {
      const response = await endpoints.get('/administration/roles/');
      const data = response.data?.results || response.data || [];
      setRoles(data);
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      enqueueSnackbar('Error al cargar los roles', { variant: 'error' });
      setRoles([]);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  // Abrir modal para crear
  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormValues(initialFormValues);
    setOpen(true);
  };

  // Abrir modal para editar
  const handleOpenEdit = (user: IUser) => {
    setEditingUser(user);
    setFormValues({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      password: '', // No mostramos la contraseña actual
      role: user.role || '',
    });
    setOpen(true);
  };

  // Cerrar modal
  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
    setFormValues(initialFormValues);
  };

  // Manejar cambios en el formulario
  const handleFormChange = (field: keyof ICreateUser, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Guardar usuario (crear o editar)
  const handleSaveUser = async () => {
    try {
      if (!formValues.username || !formValues.email || !formValues.first_name || !formValues.last_name || !formValues.role) {
        enqueueSnackbar('Por favor complete todos los campos obligatorios', { variant: 'error' });
        return;
      }

      if (!editingUser && !formValues.password) {
        enqueueSnackbar('La contraseña es obligatoria para crear un nuevo usuario', { variant: 'error' });
        return;
      }

      const userData: ICreateUser | IUpdateUser = {
        username: formValues.username,
        email: formValues.email,
        first_name: formValues.first_name,
        last_name: formValues.last_name,
        role: Number(formValues.role),
      };

      if (editingUser) {
        // Editar usuario existente - usar PATCH para actualización parcial
        if (formValues.password) {
          (userData as IUpdateUser).password = formValues.password;
        }
        // Usar PATCH en lugar de PUT para permitir actualizaciones parciales
        await endpoints.patch(`/administration/users/${editingUser.id}/`, userData);
        enqueueSnackbar('Usuario actualizado correctamente', { variant: 'success' });
      } else {
        // Crear nuevo usuario
        (userData as ICreateUser).password = formValues.password;
        await endpoints.post('/administration/users/', userData);
        enqueueSnackbar('Usuario creado correctamente', { variant: 'success' });
      }

      handleClose();
      fetchUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Manejar errores específicos del backend
          Object.keys(errorData).forEach(field => {
            const messages = errorData[field];
            if (Array.isArray(messages)) {
              messages.forEach(message => {
                enqueueSnackbar(`${field}: ${message}`, { variant: 'error' });
              });
            }
          });
        } else {
          enqueueSnackbar(`Error: ${errorData}`, { variant: 'error' });
        }
      } else {
        enqueueSnackbar('Error al guardar el usuario', { variant: 'error' });
      }
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      return;
    }

    try {
      await endpoints.delete(`/administration/users/${id}/`);
      enqueueSnackbar('Usuario eliminado correctamente', { variant: 'success' });
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      if (error.response?.status === 401) {
        enqueueSnackbar('Sesión expirada, por favor vuelva a iniciar sesión', { variant: 'error' });
      } else {
        enqueueSnackbar('Error al eliminar el usuario', { variant: 'error' });
      }
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Título Principal */}
      <Typography variant="h4" sx={{ mb: 3 }}>
        Gestión de Usuarios y Roles
      </Typography>

      {/* Pestañas */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(event, newValue) => setCurrentTab(newValue)}>
          <Tab label="Usuarios" value="users" />
          <Tab label="Roles" value="roles" />
        </Tabs>
      </Box>

      {/* Contenido de la Pestaña de Usuarios */}
      {currentTab === 'users' && (
        <>
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h5">Gestión de Usuarios</Typography>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={handleOpenCreate}
            >
              Nuevo Usuario
            </Button>
          </Box>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.first_name} {user.last_name}
                </TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role_name || 'Sin rol'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleOpenEdit(user)}
                    title="Editar"
                  >
                    <Iconify icon="solar:pen-bold" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteUser(user.id)}
                    color="error"
                    title="Eliminar"
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {users.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal para crear/editar usuario */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
            <TextField
              label="Nombre"
              value={formValues.first_name}
              onChange={(e) => handleFormChange('first_name', e.target.value)}
              fullWidth
              required
            />
            
            <TextField
              label="Apellido"
              value={formValues.last_name}
              onChange={(e) => handleFormChange('last_name', e.target.value)}
              fullWidth
              required
            />
            
            <TextField
              label="Nombre de Usuario"
              value={formValues.username}
              onChange={(e) => handleFormChange('username', e.target.value)}
              fullWidth
              required
              helperText="Nombre único para identificar al usuario en el sistema"
            />
            
            <TextField
              label="Email"
              type="email"
              value={formValues.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              fullWidth
              required
            />
            
            {(!editingUser || formValues.password !== '') && (
              <TextField
                label={editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                type="password"
                value={formValues.password}
                onChange={(e) => handleFormChange('password', e.target.value)}
                fullWidth
                required={!editingUser}
                helperText={editingUser ? 'Dejar vacío para mantener la contraseña actual' : undefined}
              />
            )}
            
            <FormControl fullWidth required>
              <InputLabel>Rol</InputLabel>
              <Select
                value={formValues.role}
                onChange={(e) => handleFormChange('role', e.target.value)}
                label="Rol"
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
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
          <Button onClick={handleSaveUser} variant="contained">
            {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
          </Button>
        </DialogActions>
      </Dialog>
        </>
      )}

      {/* Contenido de la Pestaña de Roles */}
      {currentTab === 'roles' && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Gestión de Roles
          </Typography>
          <RoleManagement onRolesChange={fetchRoles} />
        </Box>
      )}
    </Container>
  );
}