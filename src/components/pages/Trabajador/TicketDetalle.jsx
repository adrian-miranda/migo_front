import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import style from './TicketDetalle.module.css';
import CalificarTicket, { CalificacionExistente } from './CalificarTicket';

const TicketDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calificacion, setCalificacion] = useState(null);
  const [puedeCalificar, setPuedeCalificar] = useState(false);

  useEffect(() => {
    cargarTicket();
    cargarHistorial();
  }, [id]);

  const cargarTicket = async () => {
  try {
    const response = await axios.get(`http://localhost:8000/api/tickets/${id}/`);
    if (response.data.success) {
      setTicket(response.data.ticket);
      
      // Verificar si puede calificar (ticket RESUELTO y sin calificación)
      const userData = JSON.parse(localStorage.getItem('migo_usuario'));
      const esResuelto = response.data.ticket.estado === 'Resuelto';
      const esCreador = response.data.ticket.usuario_creador.id === userData.id_usuarios;
      const tieneCalificacion = response.data.ticket.calificacion_ticket !== null;
      
      setPuedeCalificar(esResuelto && esCreador && !tieneCalificacion);
      setCalificacion(response.data.ticket.calificacion_ticket);
    }
  } catch (error) {
    console.error('Error al cargar ticket:', error);
    alert('Error al cargar el ticket');
    navigate('/trabajador/dashboard');
  } finally {
    setLoading(false);
  }
};

  const cargarHistorial = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/tickets/${id}/historial/`);
      if (response.data.success) {
        setHistorial(response.data.historial);
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  };

  const handleCalificado = () => {
    cargarTicket(); // Recargar el ticket para actualizar la calificación
  };

  const cancelarTicket = async () => {
    if (!window.confirm(`¿Está seguro de cancelar este ticket?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('migo_usuario'));
      
      const response = await axios.post(
        `http://localhost:8000/api/tickets/${id}/cancelar/`,
        { usuario_id: userData.id_usuarios }
      );

      if (response.data.success) {
        alert('Ticket cancelado exitosamente');
        navigate('/trabajador/dashboard');
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
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className={style.loading}>Cargando...</div>;
  }

  if (!ticket) {
    return <div className={style.error}>Ticket no encontrado</div>;
  }

  return (
    <div className={style.container}>
      {/* Header */}
      <div className={style.header}>
        <button className={style.btnBack} onClick={() => navigate('/trabajador/dashboard')}>
          ← Volver al Dashboard
        </button>
        <div className={style.headerInfo}>
          <h1>Ticket #{ticket.id_ticket}</h1>
          <div className={style.badges}>
            <span className={`${style.estadoBadge} ${getEstadoClass(ticket.estado)}`}>
              {ticket.estado}
            </span>
            <span className={`${style.prioridadBadge} ${getPrioridadClass(ticket.prioridad)}`}>
              {ticket.prioridad}
            </span>
          </div>
        </div>
        {ticket.estado === 'Abierto' && (
          <button className={style.btnCancelar} onClick={cancelarTicket}>
            🚫 Cancelar Ticket
          </button>
        )}
      </div>

      {/* Información del Ticket */}
      <div className={style.ticketInfo}>
        <div className={style.section}>
          <h2>Información General</h2>
          <div className={style.infoGrid}>
            <div className={style.infoItem}>
              <span className={style.label}>Título:</span>
              <span className={style.value}>{ticket.titulo}</span>
            </div>
            <div className={style.infoItem}>
              <span className={style.label}>Categoría:</span>
              <span className={style.value}>{ticket.categoria}</span>
            </div>
            <div className={style.infoItem}>
              <span className={style.label}>Fecha de Creación:</span>
              <span className={style.value}>{formatearFecha(ticket.fecha_creacion)}</span>
            </div>
            <div className={style.infoItem}>
              <span className={style.label}>Técnico Asignado:</span>
              <span className={style.value}>
                {ticket.tecnico_asignado?.nombre || 'Sin asignar'}
              </span>
            </div>
          </div>
        </div>

        <div className={style.section}>
          <h2>Descripción del Problema</h2>
          <div className={style.descripcion}>
            {ticket.descripcion}
          </div>
        </div>

        {ticket.solucion && (
          <div className={style.section}>
            <h2>Solución</h2>
            <div className={style.solucion}>
              {ticket.solucion}
            </div>
            {ticket.fecha_resolucion && (
              <p className={style.fechaSolucion}>
                Resuelto el: {formatearFecha(ticket.fecha_resolucion)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Calificación */}
      {puedeCalificar && (
        <CalificarTicket 
          ticketId={ticket.id_ticket} 
          onCalificado={handleCalificado}
        />
      )}

      {calificacion && (
        <CalificacionExistente calificacion={calificacion} />
      )}

      {/* Historial */}
      {historial.length > 0 && (
        <div className={style.historial}>
          <h2>Historial de Cambios</h2>
          <div className={style.timeline}>
            {historial.map((item, index) => (
              <div key={index} className={style.timelineItem}>
                <div className={style.timelineDot}></div>
                <div className={style.timelineContent}>
                  <div className={style.timelineHeader}>
                    <span className={style.timelineEstado}>
                      {item.estado_anterior} → {item.estado_nuevo}
                    </span>
                    <span className={style.timelineFecha}>
                      {formatearFecha(item.fecha_cambio)}
                    </span>
                  </div>
                  {item.comentario && (
                    <p className={style.timelineComentario}>{item.comentario}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetalle;