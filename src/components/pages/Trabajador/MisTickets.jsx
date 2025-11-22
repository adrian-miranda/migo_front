import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import style from './MisTickets.module.css';

const MisTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [ticketsFiltrados, setTicketsFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    estado: '',
    prioridad: '',
    categoria: '',
    busqueda: ''
  });

  useEffect(() => {
    cargarTickets();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtros, tickets]);

  const cargarTickets = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('migo_usuario'));
      const response = await axios.get(
        `http://localhost:8000/api/tickets/mis-tickets/?user_id=${userData.id_usuarios}`
      );

      if (response.data.success) {
        setTickets(response.data.tickets);
        setTicketsFiltrados(response.data.tickets);
      }
    } catch (error) {
      console.error('Error al cargar tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...tickets];

    // Filtro por estado
    if (filtros.estado) {
      resultado = resultado.filter(t => t.estado === filtros.estado);
    }

    // Filtro por prioridad
    if (filtros.prioridad) {
      resultado = resultado.filter(t => t.prioridad === filtros.prioridad);
    }

    // Filtro por categoría
    if (filtros.categoria) {
      resultado = resultado.filter(t => t.categoria === filtros.categoria);
    }

    // Búsqueda por texto
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(t => 
        t.titulo.toLowerCase().includes(busqueda) ||
        t.descripcion.toLowerCase().includes(busqueda)
      );
    }

    setTicketsFiltrados(resultado);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      prioridad: '',
      categoria: '',
      busqueda: ''
    });
  };

  const cancelarTicket = async (idTicket, titulo) => {
    if (!window.confirm(`¿Está seguro de cancelar el ticket "${titulo}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('migo_usuario'));
      
      const response = await axios.post(
        `http://localhost:8000/api/tickets/${idTicket}/cancelar/`,
        { usuario_id: userData.id_usuarios }
      );

      if (response.data.success) {
        alert('Ticket cancelado exitosamente');
        cargarTickets();
      }
    } catch (error) {
      console.error('Error al cancelar ticket:', error);
      if (error.response?.data?.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert('Error al cancelar el ticket');
      }
    }
  };

  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'Abierto': return style.estadoAbierto;
      case 'En Proceso': return style.estadoEnProceso;
      case 'Resuelto': return style.estadoResuelto;
      case 'Cerrado': return style.estadoCerrado;
      case 'Cancelado': return style.estadoCancelado;
      default: return '';
    }
  };

  const getPrioridadClass = (prioridad) => {
    switch (prioridad) {
      case 'Baja': return style.prioridadBaja;
      case 'Media': return style.prioridadMedia;
      case 'Alta': return style.prioridadAlta;
      case 'Urgente': return style.prioridadUrgente;
      default: return '';
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener valores únicos para filtros
  const estadosUnicos = [...new Set(tickets.map(t => t.estado))];
  const prioridadesUnicas = [...new Set(tickets.map(t => t.prioridad))];
  const categoriasUnicas = [...new Set(tickets.map(t => t.categoria))];

  if (loading) {
    return <div className={style.loading}>Cargando tickets...</div>;
  }

  return (
    <div className={style.container}>
      {/* Header */}
      <div className={style.header}>
        <div>
          <button className={style.btnBack} onClick={() => navigate('/trabajador/dashboard')}>
            ← Volver
          </button>
          <h1>Mis Tickets</h1>
          <p>Total: {ticketsFiltrados.length} de {tickets.length} tickets</p>
        </div>
        <button className={style.btnNuevo} onClick={() => navigate('/trabajador/nuevo-ticket')}>
          + Nuevo Ticket
        </button>
      </div>

      {/* Filtros */}
      <div className={style.filtros}>
        <input
          type="text"
          placeholder="🔍 Buscar por título o descripción..."
          value={filtros.busqueda}
          onChange={(e) => handleFiltroChange('busqueda', e.target.value)}
          className={style.inputBusqueda}
        />

        <select
          value={filtros.estado}
          onChange={(e) => handleFiltroChange('estado', e.target.value)}
          className={style.select}
        >
          <option value="">Todos los estados</option>
          {estadosUnicos.map(estado => (
            <option key={estado} value={estado}>{estado}</option>
          ))}
        </select>

        <select
          value={filtros.prioridad}
          onChange={(e) => handleFiltroChange('prioridad', e.target.value)}
          className={style.select}
        >
          <option value="">Todas las prioridades</option>
          {prioridadesUnicas.map(prioridad => (
            <option key={prioridad} value={prioridad}>{prioridad}</option>
          ))}
        </select>

        <select
          value={filtros.categoria}
          onChange={(e) => handleFiltroChange('categoria', e.target.value)}
          className={style.select}
        >
          <option value="">Todas las categorías</option>
          {categoriasUnicas.map(categoria => (
            <option key={categoria} value={categoria}>{categoria}</option>
          ))}
        </select>

        <button className={style.btnLimpiar} onClick={limpiarFiltros}>
          Limpiar filtros
        </button>
      </div>

      {/* Tabla */}
      {ticketsFiltrados.length === 0 ? (
        <div className={style.sinResultados}>
          <p>No se encontraron tickets con los filtros seleccionados</p>
        </div>
      ) : (
        <div className={style.tablaContainer}>
          <table className={style.tabla}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Categoría</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Técnico</th>
                <th style={{ width: '150px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ticketsFiltrados.map((ticket) => (
                <tr key={ticket.id_ticket}>
                  <td>#{ticket.id_ticket}</td>
                  <td className={style.titulo}>{ticket.titulo}</td>
                  <td>
                    <span className={style.categoriaTag}>{ticket.categoria}</span>
                  </td>
                  <td>
                    <span className={`${style.prioridadTag} ${getPrioridadClass(ticket.prioridad)}`}>
                      {ticket.prioridad}
                    </span>
                  </td>
                  <td>
                    <span className={`${style.estadoTag} ${getEstadoClass(ticket.estado)}`}>
                      {ticket.estado}
                    </span>
                  </td>
                  <td>{formatearFecha(ticket.fecha_creacion)}</td>
                  <td>{ticket.tecnico_asignado?.nombre || 'Sin asignar'}</td>
                  <td>
                    <div className={style.acciones}>
                      <button 
                        className={style.btnVer}
                        onClick={() => navigate(`/trabajador/tickets/${ticket.id_ticket}`)}
                      >
                        Ver
                      </button>
                      <button 
                        className={`${style.btnCancelar} ${ticket.estado !== 'Abierto' ? style.btnCancelarDisabled : ''}`}
                        onClick={() => ticket.estado === 'Abierto' && cancelarTicket(ticket.id_ticket, ticket.titulo)}
                        disabled={ticket.estado !== 'Abierto'}
                        title={ticket.estado !== 'Abierto' ? 'Solo se pueden cancelar tickets en estado Abierto' : 'Cancelar ticket'}
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MisTickets;