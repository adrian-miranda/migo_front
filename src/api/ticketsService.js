/**
 * Servicio para gestión de tickets
 */
import axiosInstance from './axios';

export const ticketsService = {
  // ============================================
  // CATÁLOGOS
  // ============================================
  
  /**
   * Obtener todas las categorías
   */
  getCategorias: async () => {
    try {
      const response = await axiosInstance.get('/tickets/categorias/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los estados
   */
  getEstados: async () => {
    try {
      const response = await axiosInstance.get('/tickets/estados/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estados:', error);
      throw error;
    }
  },

  /**
   * Obtener todas las prioridades
   */
  getPrioridades: async () => {
    try {
      const response = await axiosInstance.get('/tickets/prioridades/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener prioridades:', error);
      throw error;
    }
  },

  // ============================================
  // TICKETS
  // ============================================

  /**
   * Listar todos los tickets
   * @param {object} filtros - Filtros opcionales (user_id, estado, prioridad, categoria)
   */
  listarTickets: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros).toString();
      const response = await axiosInstance.get(`/tickets/?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error al listar tickets:', error);
      throw error;
    }
  },

  /**
   * Obtener ticket por ID
   * @param {number} idTicket - ID del ticket
   */
  obtenerTicket: async (idTicket) => {
    try {
      const response = await axiosInstance.get(`/tickets/${idTicket}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener ticket:', error);
      throw error;
    }
  },

  /**
   * Crear nuevo ticket
   * @param {object} data - Datos del ticket
   */
  crearTicket: async (data) => {
    try {
      const response = await axiosInstance.post('/tickets/crear/', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear ticket:', error);
      throw error;
    }
  },

  /**
   * Actualizar ticket
   * @param {number} idTicket - ID del ticket
   * @param {object} data - Datos a actualizar
   */
  actualizarTicket: async (idTicket, data) => {
    try {
      const response = await axiosInstance.put(
        `/tickets/${idTicket}/actualizar/`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error al actualizar ticket:', error);
      throw error;
    }
  },

  /**
   * Eliminar ticket
   * @param {number} idTicket - ID del ticket
   */
  eliminarTicket: async (idTicket) => {
    try {
      const response = await axiosInstance.delete(
        `/tickets/${idTicket}/eliminar/`
      );
      return response.data;
    } catch (error) {
      console.error('Error al eliminar ticket:', error);
      throw error;
    }
  },

  /**
   * Obtener historial del ticket
   * @param {number} idTicket - ID del ticket
   */
  obtenerHistorial: async (idTicket) => {
    try {
      const response = await axiosInstance.get(
        `/tickets/${idTicket}/historial/`
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener historial:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas
   */
  getEstadisticas: async () => {
    try {
      const response = await axiosInstance.get('/tickets/estadisticas/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },
};