/**
 * Contexto de Autenticación
 * Maneja el estado global de autenticación de la aplicación
 */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const cargarUsuario = () => {
      try {
        const usuarioGuardado = localStorage.getItem('migo_usuario');
        const tokenGuardado = localStorage.getItem('migo_token');

        if (usuarioGuardado && tokenGuardado) {
          setUsuario(JSON.parse(usuarioGuardado));
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        localStorage.removeItem('migo_usuario');
        localStorage.removeItem('migo_token');
      } finally {
        setLoading(false);
      }
    };

    cargarUsuario();
  }, []);

  /**
   * Iniciar sesión
   */
  const login = async (correo, contraseña) => {
    try {
      setError(null);
      setLoading(true);

      const data = await authService.login(correo, contraseña);

      if (data.success) {
        // Guardar en estado y localStorage
        setUsuario(data.usuario);
        localStorage.setItem('migo_usuario', JSON.stringify(data.usuario));
        localStorage.setItem('migo_token', data.token);

        return { success: true, data };
      } else {
        const errorMessage = data.error || 'Error al iniciar sesión';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Error al iniciar sesión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setUsuario(null);
      localStorage.removeItem('migo_usuario');
      localStorage.removeItem('migo_token');
    }
  };

  /**
   * Verificar si el usuario tiene un rol específico
   */
  const tieneRol = (idRol) => {
    return usuario?.rol?.id_roles === idRol;
  };

  /**
   * Verificar si es administrador
   */
  const esAdmin = () => tieneRol(3);

  /**
   * Verificar si es técnico
   */
  const esTecnico = () => tieneRol(1);

  /**
   * Verificar si es trabajador
   */
  const esTrabajador = () => tieneRol(2);

  /**
   * Obtener nombre del rol
   */
  const getNombreRol = () => {
    return usuario?.rol?.nombre_rol || '';
  };

  /**
   * Obtener nombre del cargo
   */
  const getNombreCargo = () => {
    return usuario?.cargo?.nombre_cargo || '';
  };

  const value = {
    usuario,
    loading,
    error,
    login,
    logout,
    tieneRol,
    esAdmin,
    esTecnico,
    esTrabajador,
    getNombreRol,
    getNombreCargo,
    isAuthenticated: !!usuario,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook personalizado para usar el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};