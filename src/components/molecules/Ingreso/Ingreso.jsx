import React from 'react'
import style from './Ingreso.module.css'


const Ingreso = () => {
  return (
    <form className={style.formulario}>
      <input type="email" name="" id="" placeholder='Correo' className={style.input}/>
      <input type="password" name="" id="" placeholder='Contraseña' className={style.input}/>
      <button type="submit" className={style.boton}>Entrar</button>
    </form>
  )
}

export default Ingreso
