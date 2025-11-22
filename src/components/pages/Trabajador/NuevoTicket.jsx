import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import style from './NuevoTicket.module.css';

const NuevoTicket = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria_id: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/tickets/categorias/');
      setCategorias(response.data.categorias || []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validarFormulario = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    } else if (formData.titulo.length < 5) {
      newErrors.titulo = 'El título debe tener al menos 5 caracteres';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es obligatoria';
    } else if (formData.descripcion.length < 10) {
      newErrors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }

    if (!formData.categoria_id) {
      newErrors.categoria_id = 'Seleccione una categoría';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const userData = JSON.parse(localStorage.getItem('migo_usuario'));
      
      const ticketData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        categoria_id: formData.categoria_id,
        usuario_creador_id: userData.id_usuarios
      };

      const response = await axios.post(
        'http://localhost:8000/api/tickets/crear/',
        ticketData
      );

      if (response.data.success) {
        alert('¡Ticket creado exitosamente! La prioridad se asignó automáticamente según la categoría y su cargo.');
        navigate('/trabajador/dashboard');
      }
    } catch (error) {
      console.error('Error al crear ticket:', error);
      alert('Error al crear el ticket. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('¿Está seguro de cancelar? Los datos no guardados se perderán.')) {
      navigate('/trabajador/dashboard');
    }
  };

  return (
    <div className={style.container}>
      <div className={style.header}>
        <button className={style.btnBack} onClick={() => navigate('/trabajador/dashboard')}>
          ← Volver
        </button>
        <h1>Crear Nuevo Ticket</h1>
        <p>Complete el formulario para reportar un problema o solicitud</p>
      </div>

      <form onSubmit={handleSubmit} className={style.form}>
        {/* Título */}
        <div className={style.formGroup}>
          <label htmlFor="titulo" className={style.label}>
            Título <span className={style.required}>*</span>
          </label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            className={`${style.input} ${errors.titulo ? style.inputError : ''}`}
            placeholder="Ej: No puedo acceder al sistema de ventas"
            maxLength={100}
          />
          {errors.titulo && <span className={style.error}>{errors.titulo}</span>}
        </div>

        {/* Categoría */}
        <div className={style.formGroup}>
          <label htmlFor="categoria_id" className={style.label}>
            Categoría del problema <span className={style.required}>*</span>
          </label>
          <select
            id="categoria_id"
            name="categoria_id"
            value={formData.categoria_id}
            onChange={handleChange}
            className={`${style.select} ${errors.categoria_id ? style.inputError : ''}`}
          >
            <option value="">Seleccione una categoría</option>
            {categorias.map(cat => (
              <option key={cat.id_categoria_ticket} value={cat.id_categoria_ticket}>
                {cat.nombre_categoria}
              </option>
            ))}
          </select>
          {errors.categoria_id && <span className={style.error}>{errors.categoria_id}</span>}
          <span className={style.hint}>
            ℹ️ La prioridad se asignará automáticamente según la categoría y su cargo
          </span>
        </div>

        {/* Descripción */}
        <div className={style.formGroup}>
          <label htmlFor="descripcion" className={style.label}>
            Descripción del problema <span className={style.required}>*</span>
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className={`${style.textarea} ${errors.descripcion ? style.inputError : ''}`}
            placeholder="Describa detalladamente el problema o solicitud. Incluya toda la información relevante que pueda ayudar al técnico a resolver el caso."
            rows={6}
            maxLength={1000}
          />
          <div className={style.charCount}>
            {formData.descripcion.length}/1000 caracteres
          </div>
          {errors.descripcion && <span className={style.error}>{errors.descripcion}</span>}
        </div>

        {/* Botones */}
        <div className={style.actions}>
          <button
            type="button"
            onClick={handleCancel}
            className={style.btnCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={style.btnSubmit}
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NuevoTicket;