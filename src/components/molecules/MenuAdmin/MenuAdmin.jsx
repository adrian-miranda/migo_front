/**
 * Menú para usuarios con rol Administrador
 */
import React from 'react';
import { Link } from 'react-router-dom';
import style from './MenuAdmin.module.css';

const MenuAdmin = ({ usuario, onLogout }) => {
  return (
    <div className={style.menu}>
      <div className={style.userInfo}>
        <span className={style.userName}>
          {usuario?.persona?.nombre_completo || 'Usuario'}
        </span>
        <span className={style.userRole}>
          {usuario?.rol?.nombre_rol || 'Rol'}
        </span>
      </div>

      <nav className={style.nav}>
        <Link to="/admin/dashboard" className={style.navLink}>
          Dashboard
        </Link>
        <Link to="/admin/usuarios" className={style.navLink}>
          Usuarios
        </Link>
        <Link to="/admin/tickets" className={style.navLink}>
          Tickets
        </Link>
        <Link to="/admin/tecnicos" className={style.navLink}>
          Técnicos
        </Link>
        <Link to="/admin/reportes" className={style.navLink}>
          Reportes
        </Link>
        
        {/* Separador visual */}
        <div className={style.separator}></div>
        
        {/* Enlace al Django Admin */}
        <a 
          href="http://localhost:8000/admin/" 
          target="_blank" 
          rel="noopener noreferrer"
          className={style.navLinkExternal}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"></path>
            <path d="M12 8v8M8 12h8"></path>
          </svg>
          Gestión Avanzada
        </a>
      </nav>

      <button onClick={onLogout} className={style.btnLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default MenuAdmin;