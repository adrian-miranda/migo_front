/**
 * Lista de tickets asignados al técnico
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import style from './TicketsAsignados.module.css';

const TicketsAsignados = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    cargarTickets();
  }, [filtroEstado]);

  const cargarTickets = async () => {
  try {
    setLoading(true);
    const userData = JSON.parse(localStorage.getItem('migo_usuario'));
    
    if (!userData || !userData.id_usuarios) {
      navigate('/login');
      return;
    }

    let url = `http://localhost:8000/api/tickets/tecnico/mis-tickets/?tecnico_id=${userData.id_usuarios}`;
    
    // Si hay filtro específico, agregarlo
    // Si es "todos", agregar todos los estados para que no aplique el filtro por defecto
    if (filtroEstado) {
      url += `&estado=${filtroEstado}`;
    } else {
      // Todos los tickets (En Proceso, Resueltos, Cerrados)
      url += `&estado=2,3,4`;
    }

    const response = await axios.get(url);

    if (response.data.success) {
      setTickets(response.data.tickets);
    }

    setLoading(false);
  } catch (error) {
    console.error('Error al cargar tickets:', error);
    setLoading(false);
  }
};

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearTiempo = (fecha) => {
    const ahora = new Date();
    const fechaTicket = new Date(fecha);
    const diferencia = Math.floor((ahora - fechaTicket) / 1000 / 60);

    if (diferencia < 60) return `Hace ${diferencia} min`;
    if (diferencia < 1440) return `Hace ${Math.floor(diferencia / 60)} horas`;
    return `Hace ${Math.floor(diferencia / 1440)} días`;
  };

  const getPrioridadClass = (prioridad) => {
    switch (prioridad) {
      case 'Urgente': return style.prioridadUrgente;
      case 'Alta': return style.prioridadAlta;
      case 'Media': return style.prioridadMedia;
      case 'Baja': return style.prioridadBaja;
      default: return '';
    }
  };

  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'Abierto': return style.estadoAbierto;
      case 'En Proceso': return style.estadoEnProceso;
      case 'Resuelto': return style.estadoResuelto;
      case 'Cerrado': return style.estadoCerrado;
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className={style.loading}>
        <div className={style.spinner}></div>
        <p>Cargando tickets...</p>
      </div>
    );
  }

  return (
    <div className={style.container}>
      {/* Header */}
      <div className={style.header}>
        <div>
          <button onClick={() => navigate('/tecnico/dashboard')} className={style.btnVolver}>
            ← Volver
          </button>
          <h1>🎫 Mis Tickets Asignados</h1>
          <p>{tickets.length} ticket{tickets.length !== 1 ? 's' : ''} encontrado{tickets.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className={style.filtrosCard}>
        <div className={style.filtrosGrid}>
          <div className={style.filtroItem}>
            <label>Estado:</label>
            <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className={style.select}
                >
                <option value="">Todos mis tickets</option>
                <option value="2">En Proceso</option>
                <option value="3">Resueltos</option>
                <option value="4">Cerrados</option>
            </select>
          </div>
          <button onClick={cargarTickets} className={style.btnRefresh}>
            🔄 Actualizar
          </button>
        </div>
      </div>

      {/* Lista de tickets */}
      {tickets.length > 0 ? (
        <div className={style.ticketsList}>
          {tickets.map((ticket) => (
            <div 
              key={ticket.id_ticket} 
              className={`${style.ticketCard} ${ticket.prioridad === 'Urgente' ? style.ticketUrgente : ''}`}
              onClick={() => navigate(`/tecnico/ticket/${ticket.id_ticket}`)}
            >
              <div className={style.ticketHeader}>
                <div className={style.ticketId}>#{ticket.id_ticket}</div>
                <div className={style.badges}>
                  <span className={`${style.estadoBadge} ${getEstadoClass(ticket.estado)}`}>
                    {ticket.estado}
                  </span>
                  <span className={`${style.prioridadBadge} ${getPrioridadClass(ticket.prioridad)}`}>
                    {ticket.prioridad}
                  </span>
                </div>
              </div>
              
              <h3 className={style.ticketTitulo}>{ticket.titulo}</h3>
              <p className={style.ticketDescripcion}>{ticket.descripcion}</p>
              
              <div className={style.ticketInfo}>
                <div className={style.infoItem}>
                  <span className={style.infoLabel}>Categoría</span>
                  <span className={style.infoValue}>{ticket.categoria}</span>
                </div>
                <div className={style.infoItem}>
                  <span className={style.infoLabel}>Usuario</span>
                  <span className={style.infoValue}>{ticket.usuario_creador?.nombre}</span>
                </div>
                <div className={style.infoItem}>
                  <span className={style.infoLabel}>Asignado</span>
                  <span className={style.infoValue}>{formatearTiempo(ticket.fecha_asignacion)}</span>
                </div>
              </div>

              <div className={style.ticketFooter}>
                <span className={style.fechaCreacion}>
                  Creado: {formatearFecha(ticket.fecha_creacion)}
                </span>
                <button className={style.btnVerDetalle}>
                  Ver detalle →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={style.sinTickets}>
          <div className={style.sinTicketsIcono}>✅</div>
          <h3>No tienes tickets asignados</h3>
          <p>Cuando te asignen un ticket aparecerá aquí</p>
        </div>
      )}
    </div>
  );
};

export default TicketsAsignados;