/**
 * Menú para usuarios con rol Técnico
 */
import React from 'react';
import { Link } from 'react-router-dom';
import style from './MenuTecnico.module.css';

const MenuTecnico = ({ usuario, onLogout }) => {
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
        <Link to="/tecnico/dashboard" className={style.navLink}>
          Dashboard
        </Link>
        <Link to="/tecnico/tickets-asignados" className={style.navLink}>
          Tickets Asignados
        </Link>
        <Link to="/tecnico/historial" className={style.navLink}>
          Historial
        </Link>
      </nav>
      
      <button onClick={onLogout} className={style.btnLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default MenuTecnico;