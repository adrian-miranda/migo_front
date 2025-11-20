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
        <Link to="/admin/reportes" className={style.navLink}>
          Reportes
        </Link>
      </nav>
      
      <button onClick={onLogout} className={style.btnLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default MenuAdmin;