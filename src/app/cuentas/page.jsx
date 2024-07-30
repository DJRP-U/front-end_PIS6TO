// pages/user-management.jsx
'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import axios from 'axios';
import { API_URL } from '@/constants';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
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
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/account`);
      setUsers(response.data.allAccounts);
    } catch (error) {
      console.error('Error al obtener los usuarios', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (selectedUser) {
        data.id = selectedUser.id;
        await axios.put(`${API_URL}/account/${selectedUser.id}`, data);
      }
      fetchUsers();
      setSelectedUser(null);
      resetForm();
    } catch (error) {
      console.error('Error al guardar el usuario', error);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
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
          <input
            {...register('role')}
            type="text"
            className={`form-control ${errors.role ? 'is-invalid' : ''}`}
          />
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
            users.map((user) => (
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
