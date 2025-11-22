import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import style from './TicketsPendientes.module.css';

const TicketsPendientes = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarTickets();
  }, []);

  const cargarTickets = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('migo_usuario'));
      const response = await axios.get(
        `http://localhost:8000/api/tickets/tickets-pendientes/?user_id=${userData.id_usuarios}`
      );

      if (response.data.success) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      console.error('Error al cargar tickets pendientes:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return <div className={style.loading}>Cargando tickets pendientes...</div>;
  }

  return (
    <div className={style.container}>
      {/* Header */}
      <div className={style.header}>
        <div>
          <button className={style.btnBack} onClick={() => navigate('/trabajador/dashboard')}>
            ← Volver
          </button>
          <h1>Tickets Pendientes</h1>
          <p>Tickets en estado Abierto o En Proceso que esperan solución</p>
        </div>
        <button className={style.btnNuevo} onClick={() => navigate('/trabajador/nuevo-ticket')}>
          + Nuevo Ticket
        </button>
      </div>

      {/* Contador de tickets */}
      <div className={style.contador}>
        <span className={style.numero}>{tickets.length}</span>
        <span className={style.texto}>tickets pendientes</span>
      </div>

      {/* Tabla */}
      {tickets.length === 0 ? (
        <div className={style.sinResultados}>
          <div className={style.emoji}>🎉</div>
          <h2>¡No tienes tickets pendientes!</h2>
          <p>Todos tus tickets han sido resueltos, cerrados o cancelados.</p>
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
                <th>Fecha Creación</th>
                <th>Técnico Asignado</th>
                <th style={{ width: '150px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
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
                  <td>
                    {ticket.tecnico_asignado?.nombre || (
                      <span className={style.sinAsignar}>Sin asignar</span>
                    )}
                  </td>
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

export default TicketsPendientes;