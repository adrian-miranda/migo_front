/**
 * Dashboard del Administrador
 */
import React from 'react';
import { useAuth } from '../../../context/AuthContext';

const AdminDashboard = () => {
  const { usuario } = useAuth();

  return (
    <div style={{ padding: '40px' }}>
      <h1>Dashboard de Administrador</h1>
      <p>Bienvenido, {usuario?.persona?.nombre_completo}</p>
      <p>Rol: {usuario?.rol?.nombre_rol}</p>
      <p>Cargo: {usuario?.cargo?.nombre_cargo}</p>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Funcionalidades disponibles:</h2>
        <ul>
          <li>Gestión de usuarios</li>
          <li>Gestión de tickets</li>
          <li>Reportes y estadísticas</li>
          <li>Configuración del sistema</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;