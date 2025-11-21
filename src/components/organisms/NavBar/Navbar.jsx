/**
 * Navbar principal
 * Cambia según el estado de autenticación y rol del usuario
 */
import React from 'react';
//import { useAuth } from '../../../hooks/useAuth';
import {useAuth} from '../../../context/AuthContext';
import style from './navbar.module.css';
import Logo from '../../atoms/Logo/Logo.jsx';
import Ingreso from '../../molecules/Ingreso/Ingreso.jsx';
import MenuAdmin from '../../molecules/MenuAdmin/MenuAdmin.jsx';
import MenuTecnico from '../../molecules/MenuTecnico/MenuTecnico.jsx';
import MenuTrabajador from '../../molecules/MenuTrabajador/MenuTrabajador.jsx';

const Navbar = () => {
  const { usuario, isAuthenticated, logout } = useAuth();

  // Si no hay usuario autenticado, mostrar navbar de login
  if (!isAuthenticated) {
    return (
      <div className={style.navbar}>
        <Logo />
        <div className={style.title}>
          <h1>MIGO</h1>
          <h2>Sistema de tickets con IA</h2>
        </div>
        <Ingreso />
      </div>
    );
  }

  // Renderizar menú según rol
  const renderMenuPorRol = () => {
    const idRol = usuario?.rol?.id_roles;

    switch (idRol) {
      case 3: // Administrador
        return <MenuAdmin usuario={usuario} onLogout={logout} />;
      case 1: // Técnico
        return <MenuTecnico usuario={usuario} onLogout={logout} />;
      case 2: // Trabajador
        return <MenuTrabajador usuario={usuario} onLogout={logout} />;
      default:
        return <Ingreso />;
    }
  };

  return (
    <div className={style.navbar}>
      <Logo />
      <div className={style.title}>
        <h1>MIGO</h1>
        <h2>Sistema de tickets con IA</h2>
      </div>
      {renderMenuPorRol()}
    </div>
  );
};

export default Navbar;