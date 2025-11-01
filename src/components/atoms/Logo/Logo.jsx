import React from 'react'
import logo from '../../../assets/img/logo_migo.png'
import style from './logo.module.css'

const Logo = () => {
  return (
    <div>
        <img src={logo} alt="logo_migo" srcset="" className={style.tamano}/>
    </div>
  )
}

export default Logo
