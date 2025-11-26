import axiosInstance from './axios';

export const reclamosService = {
  // Listar reclamos
  listarReclamos: async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros).toString();
      const response = await axiosInstance.get(`/tickets/reclamos/?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error al listar reclamos:', error);
      throw error;
    }
  },

  // Obtener reclamo por ID
  obtenerReclamo: async (idReclamo) => {
    try {
      const response = await axiosInstance.get(`/tickets/reclamos/${idReclamo}/`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener reclamo:', error);
      throw error;
    }
  },

  // Crear reclamo
  crearReclamo: async (data) => {
    try {
      const response = await axiosInstance.post('/tickets/reclamos/crear/', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear reclamo:', error);
      throw error;
    }
  },

  // Actualizar reclamo (admin)
  actualizarReclamo: async (idReclamo, data) => {
    try {
      const response = await axiosInstance.put(`/tickets/reclamos/${idReclamo}/actualizar/`, data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar reclamo:', error);
      throw error;
    }
  },

  // Estadísticas
  getEstadisticas: async () => {
    try {
      const response = await axiosInstance.get('/tickets/reclamos/estadisticas/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },
};