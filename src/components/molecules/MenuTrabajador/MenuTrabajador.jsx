/**
 * Menú para usuarios con rol Trabajador
 */
import React from 'react';
import { Link } from 'react-router-dom';
import style from './MenuTrabajador.module.css';

const MenuTrabajador = ({ usuario, onLogout }) => {
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
        <Link to="/trabajador/dashboard" className={style.navLink}>
          Dashboard
        </Link>
        <Link to="/trabajador/mis-tickets" className={style.navLink}>
          Mis Tickets
        </Link>
        <Link to="/trabajador/nuevo-ticket" className={style.navLink}>
          Crear Ticket
        </Link>
      </nav>
      
      <button onClick={onLogout} className={style.btnLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default MenuTrabajador;