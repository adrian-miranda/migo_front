import React from 'react'
import style from './navbar.module.css'
import Logo from '../../atoms/Logo/Logo.jsx'
import Ingreso from '../../molecules/Ingreso/Ingreso.jsx'

const Navbar = () => {
  return (
    <div className={style.navbar}>
        <Logo />
        <div>
            <h1>MIGO</h1>
            <h2>Sistema de tickets con IA</h2>
        </div>
        <Ingreso />
    </div>
  )
}

export default Navbar
