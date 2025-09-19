import type { IRole } from 'src/types/user';

import { useSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { endpoints } from 'src/utils/axios';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface RoleManagementProps {
  onRolesChange?: () => void; // Callback para actualizar roles en el componente padre
}

interface IRoleForm {
  name: string;
}

const initialFormValues: IRoleForm = {
  name: '',
};

export function RoleManagement({ onRolesChange }: RoleManagementProps) {
  const { enqueueSnackbar } = useSnackbar();
  
  // Estados principales
  const [roles, setRoles] = useState<IRole[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estados del modal
  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<IRole | null>(null);
  const [formValues, setFormValues] = useState<IRoleForm>(initialFormValues);

  // Cargar roles desde el backend
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await endpoints.get('/administration/roles/');
      
      // Manejar respuesta paginada del backend Django REST Framework
      let rolesData = response.data;
      
      // Si la respuesta tiene el formato paginado de DRF
      if (rolesData && typeof rolesData === 'object' && 'results' in rolesData) {
        rolesData = rolesData.results;
      }
      
      // Validar que los datos finales sean un array
      if (Array.isArray(rolesData)) {
        setRoles(rolesData);
      } else {
        console.error('Roles data is not an array:', rolesData);
        setRoles([]); // Establecer array vacío como fallback
        enqueueSnackbar('Error: Formato de respuesta inválido', { variant: 'error' });
      }
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      setRoles([]); // Establecer array vacío en caso de error
      
      if (error.response?.status === 401) {
        enqueueSnackbar('Sesión expirada, por favor vuelva a iniciar sesión', { variant: 'error' });
      } else {
        enqueueSnackbar('Error al cargar los roles', { variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Abrir modal para crear rol
  const handleOpenCreate = () => {
    setEditingRole(null);
    setFormValues(initialFormValues);
    setOpen(true);
  };

  // Abrir modal para editar rol
  const handleOpenEdit = (role: IRole) => {
    setEditingRole(role);
    setFormValues({
      name: role.name,
    });
    setOpen(true);
  };

  // Cerrar modal
  const handleClose = () => {
    setOpen(false);
    setEditingRole(null);
    setFormValues(initialFormValues);
  };

  // Manejar cambios en el formulario
  const handleFormChange = (field: keyof IRoleForm, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Guardar rol (crear o editar)
  const handleSaveRole = async () => {
    try {
      if (!formValues.name.trim()) {
        enqueueSnackbar('El nombre del rol es obligatorio', { variant: 'error' });
        return;
      }

      const roleData = {
        name: formValues.name.trim(),
      };

      if (editingRole) {
        // Editar rol existente
        await endpoints.put(`/administration/roles/${editingRole.id}/`, roleData);
        enqueueSnackbar('Rol actualizado correctamente', { variant: 'success' });
      } else {
        // Crear nuevo rol
        await endpoints.post('/administration/roles/', roleData);
        enqueueSnackbar('Rol creado correctamente', { variant: 'success' });
      }

      handleClose();
      fetchRoles();
      
      // Notificar al componente padre que los roles han cambiado
      if (onRolesChange) {
        onRolesChange();
      }
    } catch (error: any) {
      console.error('Error saving role:', error);
      
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
        enqueueSnackbar('Error al guardar el rol', { variant: 'error' });
      }
    }
  };

  // Eliminar rol
  const handleDeleteRole = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este rol?')) {
      return;
    }

    try {
      await endpoints.delete(`/administration/roles/${id}/`);
      enqueueSnackbar('Rol eliminado correctamente', { variant: 'success' });
      fetchRoles();
      
      // Notificar al componente padre que los roles han cambiado
      if (onRolesChange) {
        onRolesChange();
      }
    } catch (error: any) {
      console.error('Error deleting role:', error);
      if (error.response?.status === 401) {
        enqueueSnackbar('Sesión expirada, por favor vuelva a iniciar sesión', { variant: 'error' });
      } else {
        enqueueSnackbar('Error al eliminar el rol', { variant: 'error' });
      }
    }
  };

  return (
    <>
      {/* Botón para crear nuevo rol */}
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box /> {/* Espaciador */}
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenCreate}
        >
          Nuevo Rol
        </Button>
      </Box>

      {/* Tabla de roles */}
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre del Rol</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {Array.isArray(roles) && roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.name}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleOpenEdit(role)}
                    color="primary"
                  >
                    <Iconify icon="solar:pen-bold" />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDeleteRole(role.id)}
                    color="error"
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {(!Array.isArray(roles) || roles.length === 0) && !loading && (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  No hay roles disponibles
                </TableCell>
              </TableRow>
            )}

            {loading && (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  Cargando roles...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal para crear/editar rol */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Nombre del Rol"
              value={formValues.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              fullWidth
              required
              placeholder="Ej: Administrador, Residente, Conserje"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSaveRole} variant="contained">
            {editingRole ? 'Guardar Cambios' : 'Crear Rol'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}