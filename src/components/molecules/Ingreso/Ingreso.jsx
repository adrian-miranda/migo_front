/**
 * Componente Ingreso
 * Botón para ir a la página de login
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import style from './Ingreso.module.css';

const Ingreso = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/login');
  };

  return (
    <button className={style.btnIngreso} onClick={handleClick}>
      Iniciar Sesión
    </button>
  );
};

export default Ingreso;