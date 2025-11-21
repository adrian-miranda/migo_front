/**
 * Componente de filtros avanzados para tickets
 */
import React, { useState, useEffect } from 'react';
import { ticketsService } from '../../../../api/ticketsService';
import { authService } from '../../../../api/authService';
import style from './TicketFilters.module.css';

const TicketFilters = ({ onFilterChange, onClearFilters }) => {
  // Estados para los catálogos
  const [categorias, setCategorias] = useState([]);
  const [estados, setEstados] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  // Estados para los filtros seleccionados
  const [filtros, setFiltros] = useState({
    categoria: '',
    estado: '',
    prioridad: '',
    tecnico_asignado: '',
    usuario_creador: '',
    fecha_desde: '',
    fecha_hasta: '',
    busqueda: ''
  });

  // Cargar catálogos al montar el componente
  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = async () => {
    try {
      const [categoriasRes, estadosRes, prioridadesRes, tecnicosRes, usuariosRes] = await Promise.all([
        ticketsService.getCategorias(),
        ticketsService.getEstados(),
        ticketsService.getPrioridades(),
        authService.listarTodosTecnicos(),
        authService.listarUsuarios()
      ]);

      setCategorias(categoriasRes.categorias || []);
      setEstados(estadosRes.estados || []);
      setPrioridades(prioridadesRes.prioridades || []);
      setTecnicos(tecnicosRes.tecnicos || []);
      setUsuarios(usuariosRes.usuarios || []);
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nuevosFiltros = {
      ...filtros,
      [name]: value
    };
    setFiltros(nuevosFiltros);
    onFilterChange(nuevosFiltros);
  };

  const handleClear = () => {
    const filtrosVacios = {
      categoria: '',
      estado: '',
      prioridad: '',
      tecnico_asignado: '',
      usuario_creador: '',
      fecha_desde: '',
      fecha_hasta: '',
      busqueda: ''
    };
    setFiltros(filtrosVacios);
    onClearFilters();
  };

  return (
    <div className={style.filtersContainer}>
      <div className={style.filtersHeader}>
        <h3>Filtros</h3>
        <button onClick={handleClear} className={style.btnClear}>
          Limpiar filtros
        </button>
      </div>

      <div className={style.filtersGrid}>
        {/* Búsqueda por texto */}
        <div className={style.filterGroup}>
          <label>Buscar</label>
          <input
            type="text"
            name="busqueda"
            value={filtros.busqueda}
            onChange={handleChange}
            placeholder="Buscar por título o descripción..."
            className={style.input}
          />
        </div>

        {/* Filtro por Estado */}
        <div className={style.filterGroup}>
          <label>Estado</label>
          <select
            name="estado"
            value={filtros.estado}
            onChange={handleChange}
            className={style.select}
          >
            <option value="">Todos los estados</option>
            {estados.map((estado) => (
              <option key={estado.id_estado_ticket} value={estado.nombre_estado}>
                {estado.nombre_estado}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Prioridad */}
        <div className={style.filterGroup}>
          <label>Prioridad</label>
          <select
            name="prioridad"
            value={filtros.prioridad}
            onChange={handleChange}
            className={style.select}
          >
            <option value="">Todas las prioridades</option>
            {prioridades.map((prioridad) => (
              <option key={prioridad.id_prioridad_ticket} value={prioridad.nombre_prioridad}>
                {prioridad.nombre_prioridad}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Categoría */}
        <div className={style.filterGroup}>
          <label>Categoría</label>
          <select
            name="categoria"
            value={filtros.categoria}
            onChange={handleChange}
            className={style.select}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.id_categoria_ticket} value={categoria.nombre_categoria}>
                {categoria.nombre_categoria}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Técnico */}
        <div className={style.filterGroup}>
          <label>Técnico asignado</label>
          <select
            name="tecnico_asignado"
            value={filtros.tecnico_asignado}
            onChange={handleChange}
            className={style.select}
          >
            <option value="">Todos los técnicos</option>
            <option value="sin_asignar">Sin asignar</option>
            {tecnicos.map((tecnico) => (
              <option key={tecnico.id_usuarios} value={tecnico.id_usuarios}>
                {tecnico.nombre_completo || tecnico.correo}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Usuario creador */}
        <div className={style.filterGroup}>
          <label>Creado por</label>
          <select
            name="usuario_creador"
            value={filtros.usuario_creador}
            onChange={handleChange}
            className={style.select}
          >
            <option value="">Todos los usuarios</option>
            {usuarios.filter(u => u.nombre_rol === 'Trabajador').map((usuario) => (
              <option key={usuario.id_usuarios} value={usuario.id_usuarios}>
                {usuario.nombre_completo || usuario.correo}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Fecha desde */}
        <div className={style.filterGroup}>
          <label>Desde</label>
          <input
            type="date"
            name="fecha_desde"
            value={filtros.fecha_desde}
            onChange={handleChange}
            className={style.input}
          />
        </div>

        {/* Filtro por Fecha hasta */}
        <div className={style.filterGroup}>
          <label>Hasta</label>
          <input
            type="date"
            name="fecha_hasta"
            value={filtros.fecha_hasta}
            onChange={handleChange}
            className={style.input}
          />
        </div>
      </div>
    </div>
  );
};

export default TicketFilters;