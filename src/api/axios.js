/**
 * Configuración de Axios para el proyecto MIGO
 * Incluye interceptores para manejo de tokens y errores
 */
import axios from 'axios';

// URL base del backend
const API_BASE_URL = 'http://localhost:8000/api';

// Crear instancia de axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para agregar el token en cada petición
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('migo_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el token es inválido o expiró
    if (error.response?.status === 401) {
      localStorage.removeItem('migo_token');
      localStorage.removeItem('migo_usuario');
      
      // Redirigir al login solo si no estamos ya en login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Si es un error de red
    if (!error.response) {
      console.error('Error de red:', error);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;