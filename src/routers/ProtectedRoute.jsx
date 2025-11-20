/**
 * Componente para proteger rutas
 * Requiere autenticación y opcionalmente roles específicos
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, rolesPermitidos = [] }) => {
  const { isAuthenticated, usuario, loading } = useAuth();

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <h2>Cargando...</h2>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si se especifican roles permitidos, verificar
  if (rolesPermitidos.length > 0) {
    const tienePermiso = rolesPermitidos.includes(usuario?.rol?.id_roles);
    
    if (!tienePermiso) {
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para acceder a esta página</p>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;