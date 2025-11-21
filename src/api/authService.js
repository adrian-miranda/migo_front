/**
 * Servicio de autenticación
 * Maneja todas las peticiones relacionadas con autenticación
 */
import axiosInstance from './axios';

export const authService = {
  /**
   * Verificar conexión con el backend
   */
  verificarConexion: async () => {
    try {
      const response = await axiosInstance.get('/auth/verificar/');
      return response.data;
    } catch (error) {
      console.error('Error al verificar conexión:', error);
      throw error;
    }
  },

  /**
   * Iniciar sesión
   * @param {string} correo - Correo del usuario
   * @param {string} contraseña - Contraseña del usuario
   */
  login: async (correo, contraseña) => {
    try {
      const response = await axiosInstance.post('/auth/login/', {
        correo,
        contraseña,
      });
      return response.data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  /**
   * Cerrar sesión
   */
  logout: async () => {
    try {
      const response = await axiosInstance.post('/auth/logout/');
      return response.data;
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  },

  /**
   * Obtener perfil del usuario autenticado
   */
  getPerfil: async () => {
    try {
      const response = await axiosInstance.get('/auth/perfil/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }
  },

  /**
   * Listar todos los usuarios
   */
  listarUsuarios: async () => {
    try {
      const response = await axiosInstance.get('/auth/usuarios/');
      return response.data;
    } catch (error) {
      console.error('Error al listar usuarios:', error);
      throw error;
    }
  },

  /**
   * Obtener usuario específico por ID
   * @param {number} idUsuario - ID del usuario
   */
  obtenerUsuario: async (idUsuario) => {
    try {
      const response = await axiosInstance.get(`/auth/usuarios/${idUsuario}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  },

  /**
   * Listar técnicos disponibles (no asignados a tickets activos)
   */
  listarTecnicosDisponibles: async () => {
    try {
      const response = await axiosInstance.get('/auth/tecnicos/disponibles/');
      return response.data;
    } catch (error) {
      console.error('Error al listar técnicos disponibles:', error);
      throw error;
    }
  },

  /**
   * Listar todos los técnicos con su estado
   */
  listarTodosTecnicos: async () => {
    try {
      const response = await axiosInstance.get('/auth/tecnicos/todos/');
      return response.data;
    } catch (error) {
      console.error('Error al listar todos los técnicos:', error);
      throw error;
    }
  },
};