/**
 * Dashboard del Trabajador
 */
import React from 'react';
import { useAuth } from '../../../context/AuthContext';

const TrabajadorDashboard = () => {
  const { usuario } = useAuth();

  return (
    <div style={{ padding: '40px' }}>
      <h1>Dashboard de Trabajador</h1>
      <p>Bienvenido, {usuario?.persona?.nombre_completo}</p>
      <p>Rol: {usuario?.rol?.nombre_rol}</p>
      <p>Cargo: {usuario?.cargo?.nombre_cargo}</p>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Funcionalidades disponibles:</h2>
        <ul>
          <li>Ver mis tickets</li>
          <li>Crear nuevo ticket</li>
          <li>Seguimiento de tickets</li>
        </ul>
      </div>
    </div>
  );
};

export default TrabajadorDashboard;