'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { obtenerR } from '../hooks/Conexion'; // Asegúrate de que la ruta a api-utils sea correcta
import mongoose from 'mongoose'; 
import mensajes from "../components/Mensajes";
import mensajeConfirmacion from "../components/MensajeConfirmacion";
import { API_URL } from '@/constants';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]); // Estado para los roles, inicializado como un arreglo vacío
  const [selectedUser, setSelectedUser] = useState(null);
  const router = useRouter();

  // Esquema de validación con Yup
  const validationSchema = Yup.object().shape({
    id: Yup.string().nullable(),
    name: Yup.string().min(3, 'El campo nombre es requerido y debe tener entre 3 y 25 caracteres').max(25, 'El campo nombre es requerido y debe tener entre 3 y 25 caracteres').nullable(),
    lastname: Yup.string().min(3, 'El campo apellido es requerido y debe tener entre 3 y 25 caracteres').max(25, 'El campo apellido es requerido y debe tener entre 3 y 25 caracteres').nullable(),
    email: Yup.string().email('El campo email debe ser un email válido').nullable(),
    password: Yup.string().min(8, 'El campo contraseña es requerido y debe tener entre 8 y 30 caracteres alfanuméricos').max(30, 'El campo contraseña es requerido y debe tener entre 8 y 30 caracteres alfanuméricos').nullable(),
    role: Yup.string().nullable(),
    state: Yup.string().oneOf(['ACTIVA', 'BLOQUEADA', 'INACTIVA'], "El campo estado es requerido y debe ser uno de: 'ACTIVA', 'BLOQUEADA', 'INACTIVA'").nullable(),
  });

  const formOptions = { resolver: yupResolver(validationSchema) };
  const { register, handleSubmit, setValue, formState, reset } = useForm(formOptions);
  const { errors } = formState;

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/account`);
      setUsers(response.data.allAccounts);
    } catch (error) {
      console.error('Error al obtener los usuarios', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await obtenerR('role'); // Ajusta la ruta según sea necesario
      console.log(response);
      setRoles(response.results);
    } catch (error) {
      console.error('Error al obtener los roles', error);
      setRoles([]); // En caso de error, asegúrate de que roles sea un arreglo vacío
    }
  };

  const onSubmit = async (data) => {
    try {
      if (selectedUser) {
        console.log(selectedUser.id);
        data.id = selectedUser.id;
        data.role = selectedUser.role;
        // Verificar si el campo role es un ObjectId válido, de lo contrario convertirlo
        if (!mongoose.Types.ObjectId.isValid(data.role)) {
          data.role = new mongoose.Types.ObjectId(data.role);
        }
        await axios.put(`${API_URL}/account/${localStorage.getItem('external')}`, data);
        mensajes("Usuario modificado exitosamente", "usuario modificado", "success");
      }
      fetchUsers();
      setSelectedUser(null);
      resetForm();
    } catch (error) {
      console.error('Error al guardar el usuario', error);
      mensajes("Error al guardar el usuario", "usuario no modificado", "error");
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    console.log(user.id);
    localStorage.setItem('external', user.id);
    setValue('id', user.id);
    setValue('name', user.name);
    setValue('lastname', user.lastname);
    setValue('email', user.email);
    setValue('role', user.role);
    setValue('state', user.state);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/account/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Error al eliminar el usuario', error);
      mensajes(error.body, "usuario no eliminado", "error");
    }
  };

  const resetForm = () => {
    reset();
    setSelectedUser(null);
  };

  return (
    <div className="container">
      <h1>Gestión de Usuarios</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type="hidden" {...register('id')} />
        <div>
          <label>Nombre</label>
          <input
            {...register('name')}
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
          />
          <div className="invalid-feedback">{errors.name?.message}</div>
        </div>
        <div>
          <label>Apellido</label>
          <input
            {...register('lastname')}
            type="text"
            className={`form-control ${errors.lastname ? 'is-invalid' : ''}`}
          />
          <div className="invalid-feedback">{errors.lastname?.message}</div>
        </div>
        <div>
          <label>Email</label>
          <input
            {...register('email')}
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
          />
          <div className="invalid-feedback">{errors.email?.message}</div>
        </div>
        <div>
          <label>Contraseña</label>
          <input
            {...register('password')}
            type="password"
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
          />
          <div className="invalid-feedback">{errors.password?.message}</div>
        </div>
        <div>
          <label>Rol</label>
          <select
            {...register('role')}
            className={`form-control ${errors.role ? 'is-invalid' : ''}`}
          >
            <option value="">Seleccionar...</option>
            {Array.isArray(roles) && roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <div className="invalid-feedback">{errors.role?.message}</div>
        </div>
        <div>
          <label>Estado</label>
          <select {...register('state')} className={`form-control ${errors.state ? 'is-invalid' : ''}`}>
            <option value="">Seleccionar...</option>
            <option value="ACTIVA">ACTIVA</option>
            <option value="BLOQUEADA">BLOQUEADA</option>
            <option value="INACTIVA">INACTIVA</option>
          </select>
          <div className="invalid-feedback">{errors.state?.message}</div>
        </div>
        <button type="submit" className="btn btn-primary">Actualizar</button>
        {selectedUser && (
          <button type="button" className="btn btn-secondary" onClick={resetForm}>
            Cancelar
          </button>
        )}
      </form>
      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users
              .filter((user) => user.state !== 'INACTIVA')
              .map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.lastname}</td>
                  <td>{user.email}</td>
                  <td>
                    <button className="btn btn-warning" onClick={() => handleEdit(user)}>
                      Editar
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(user.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No hay usuarios disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
