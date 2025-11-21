/**
 * Página de Login
 * Maneja la autenticación de usuarios
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from "../../../context/AuthContext";
import {useAuth} from '../../../context/AuthContext';
import style from './Login.module.css';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated, usuario } = useAuth();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && usuario) {
      redirigirPorRol(usuario.rol.id_roles);
    }
  }, [isAuthenticated, usuario]);

  const redirigirPorRol = (idRol) => {
    switch (idRol) {
      case 3: // Administrador
        navigate('/admin/dashboard', { replace: true });
        break;
      case 1: // Técnico
        navigate('/tecnico/dashboard', { replace: true });
        break;
      case 2: // Trabajador
        navigate('/trabajador/dashboard', { replace: true });
        break;
      default:
        navigate('/', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validaciones básicas
    if (!correo || !contraseña) {
      setError('Por favor, completa todos los campos');
      setLoading(false);
      return;
    }

    const result = await login(correo, contraseña);

    if (result.success) {
      // La redirección se maneja en el useEffect
      redirigirPorRol(result.data.usuario.rol.id_roles);
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }

    setLoading(false);
  };

  return (
    <div className={style.loginContainer}>
      <div className={style.loginBox}>
        <div className={style.loginHeader}>
          <h2>Iniciar Sesión</h2>
          <p>Ingresa tus credenciales para acceder al sistema</p>
        </div>

        <form onSubmit={handleSubmit} className={style.loginForm}>
          <div className={style.formGroup}>
            <label htmlFor="correo">Correo Electrónico:</label>
            <input
              type="email"
              id="correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="usuario@migo.cl"
              className={style.input}
              disabled={loading}
            />
          </div>

          <div className={style.formGroup}>
            <label htmlFor="contraseña">Contraseña:</label>
            <input
              type="password"
              id="contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              placeholder="••••••••"
              className={style.input}
              disabled={loading}
            />
          </div>

          {error && <div className={style.error}>{error}</div>}

          <button 
            type="submit" 
            disabled={loading} 
            className={style.btnLogin}
          >
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className={style.loginFooter}>
          <p>Usuarios de prueba:</p>
          <ul>
            <li>Admin: adrian@migo.cl / admin</li>
            <li>Técnico: pedro@migo.cl / admin</li>
            <li>Trabajador: andrea@empresa.cl / trabajador</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;