/**
 * Historial de tickets resueltos por el técnico
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import style from './Historial.module.css';

const Historial = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: ''
  });

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('migo_usuario'));
      
      if (!userData || !userData.id_usuarios) {
        navigate('/login');
        return;
      }

      let url = `http://localhost:8000/api/tickets/tecnico/historial/?tecnico_id=${userData.id_usuarios}`;
      
      if (filtros.fechaInicio) {
        url += `&fecha_inicio=${filtros.fechaInicio}`;
      }
      if (filtros.fechaFin) {
        url += `&fecha_fin=${filtros.fechaFin}`;
      }

      const response = await axios.get(url);

      if (response.data.success) {
        setTickets(response.data.tickets);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    cargarHistorial();
  };

  const limpiarFiltros = () => {
    setFiltros({ fechaInicio: '', fechaFin: '' });
    setTimeout(() => cargarHistorial(), 100);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderEstrellas = (valor) => {
    return '⭐'.repeat(valor) + '☆'.repeat(5 - valor);
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

  if (loading) {
    return (
      <div className={style.loading}>
        <div className={style.spinner}></div>
        <p>Cargando historial...</p>
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
          <h1>📜 Mi Historial de Tickets</h1>
          <p>{tickets.length} tickets resueltos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className={style.filtrosCard}>
        <div className={style.filtrosGrid}>
          <div className={style.filtroItem}>
            <label>Desde:</label>
            <input
              type="date"
              value={filtros.fechaInicio}
              onChange={(e) => setFiltros({ ...filtros, fechaInicio: e.target.value })}
              className={style.inputDate}
            />
          </div>
          <div className={style.filtroItem}>
            <label>Hasta:</label>
            <input
              type="date"
              value={filtros.fechaFin}
              onChange={(e) => setFiltros({ ...filtros, fechaFin: e.target.value })}
              className={style.inputDate}
            />
          </div>
          <div className={style.filtroBotones}>
            <button onClick={aplicarFiltros} className={style.btnFiltrar}>
              🔍 Filtrar
            </button>
            <button onClick={limpiarFiltros} className={style.btnLimpiar}>
              ✕ Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de tickets */}
      {tickets.length > 0 ? (
        <div className={style.ticketsList}>
          {tickets.map((ticket) => (
            <div key={ticket.id_ticket} className={style.ticketCard}>
              <div className={style.ticketHeader}>
                <div className={style.ticketId}>#{ticket.id_ticket}</div>
                <span className={`${style.prioridadBadge} ${getPrioridadClass(ticket.prioridad)}`}>
                  {ticket.prioridad}
                </span>
              </div>
              
              <h3 className={style.ticketTitulo}>{ticket.titulo}</h3>
              
              <div className={style.ticketInfo}>
                <div className={style.infoItem}>
                  <span className={style.infoLabel}>Categoría:</span>
                  <span className={style.infoValue}>{ticket.categoria}</span>
                </div>
                <div className={style.infoItem}>
                  <span className={style.infoLabel}>Usuario:</span>
                  <span className={style.infoValue}>{ticket.usuario_creador?.nombre}</span>
                </div>
                <div className={style.infoItem}>
                  <span className={style.infoLabel}>Resuelto:</span>
                  <span className={style.infoValue}>{formatearFecha(ticket.fecha_resolucion || ticket.fecha_cierre)}</span>
                </div>
              </div>

              <div className={style.ticketFooter}>
                <div className={style.calificacion}>
                  {ticket.calificacion ? (
                    <>
                      <span className={style.estrellas}>{renderEstrellas(ticket.calificacion.valor)}</span>
                      {ticket.calificacion.comentario && (
                        <span className={style.comentario}>"{ticket.calificacion.comentario}"</span>
                      )}
                    </>
                  ) : (
                    <span className={style.sinCalificar}>Pendiente de calificación</span>
                  )}
                </div>
                <button 
                  onClick={() => navigate(`/tecnico/ticket/${ticket.id_ticket}`)}
                  className={style.btnVerDetalle}
                >
                  Ver detalle
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={style.sinTickets}>
          <div className={style.sinTicketsIcono}>📭</div>
          <h3>No hay tickets en el historial</h3>
          <p>Los tickets que resuelvas aparecerán aquí</p>
        </div>
      )}
    </div>
  );
};

export default Historial;