/**
 * Servicio de IA para MIGO
 * Conexión con los endpoints de inteligencia artificial
 */
import axiosInstance from './axios';

const iaService = {
  /**
   * Obtener estado del servicio de IA
   */
  getStatus: async () => {
    const response = await axiosInstance.get('/ia/status/');
    return response.data;
  },

  /**
   * Obtener consultas restantes del usuario
   */
  getConsultasRestantes: async () => {
    const response = await axiosInstance.get('/ia/consultas-restantes/');
    return response.data;
  },

  /**
     * Generar guía de solución para un ticket
     * @param {number} ticketId - ID del ticket
     * @param {boolean} forzarNueva - Si true, ignora el caché
  */
    generarGuia: async (ticketId, forzarNueva = false) => {
      const response = await axiosInstance.post('/ia/guia-solucion/', {
        ticket_id: ticketId,
        forzar_nueva: forzarNueva
      });
      return response.data;
    },

  /**
   * Obtener tickets similares resueltos
   * @param {number} ticketId - ID del ticket
   */
  getTicketsSimilares: async (ticketId) => {
    const response = await axiosInstance.get(`/ia/tickets-similares/${ticketId}/`);
    return response.data;
  },

  /**
   * Enviar feedback sobre la ayuda de IA
   * @param {number} ticketId - ID del ticket
   * @param {boolean} fueUtil - Si la ayuda fue útil
   * @param {string} comentario - Comentario opcional
   */
  enviarFeedback: async (ticketId, fueUtil, comentario = '') => {
    const response = await axiosInstance.post('/ia/feedback/', {
      ticket_id: ticketId,
      fue_util: fueUtil,
      comentario: comentario,
      tipo_consulta: 'guia_solucion'
    });
    return response.data;
  },

  /**
   * Sugerir prioridad para un ticket
   * @param {number} ticketId - ID del ticket
   */
  sugerirPrioridad: async (ticketId) => {
    const response = await axiosInstance.post('/ia/priorizar-ticket/', {
      ticket_id: ticketId
    });
    return response.data;
  },

  /**
   * Recomendar técnico para un ticket (solo admin)
   * @param {number} ticketId - ID del ticket
   */
  recomendarTecnico: async (ticketId) => {
    const response = await axiosInstance.post('/ia/recomendar-tecnico/', {
      ticket_id: ticketId
    });
    return response.data;
  },

  /**
   * Analizar patrones en tickets (solo admin)
   * @param {number} dias - Días a analizar
   * @param {string} categoria - Categoría a filtrar (opcional)
   * @param {string} prioridad - Prioridad a filtrar (opcional)
   */
  analizarPatrones: async (dias = 30, categoria = '', prioridad = '') => {
    const response = await axiosInstance.post('/ia/analizar-patrones/', {
      dias: dias,
      categoria: categoria,
      prioridad: prioridad
    });
    return response.data;
  },

  /**
   * Obtener métricas de técnicos (solo admin)
   */
  getMetricasTecnicos: async () => {
    const response = await axiosInstance.get('/ia/metricas-tecnicos/');
    return response.data;
  },

  /**
   * Obtener insights de capacitación (solo admin)
   */
  getInsightsCapacitacion: async () => {
    const response = await axiosInstance.get('/ia/insights-capacitacion/');
    return response.data;
  }
};

export default iaService;