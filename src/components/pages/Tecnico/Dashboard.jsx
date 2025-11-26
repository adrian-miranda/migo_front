/**
 * Dashboard del Técnico
 * Muestra ticket actual, KPIs personales, alertas e historial
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import style from './Dashboard.module.css';

const TecnicoDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [estadisticas, setEstadisticas] = useState(null);
  const [ticketActual, setTicketActual] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombreUsuario, setNombreUsuario] = useState('Técnico');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('migo_usuario'));
      
      if (!userData || !userData.id_usuarios) {
        navigate('/login');
        return;
      }

      const tecnicoId = userData.id_usuarios;
        setNombreUsuario(userData.persona?.nombre_completo || 'Técnico');

      const [statsRes, ticketsRes, alertasRes, historialRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/tickets/tecnico/estadisticas/?tecnico_id=${tecnicoId}`),
        axios.get(`http://localhost:8000/api/tickets/tecnico/mis-tickets/?tecnico_id=${tecnicoId}`),
        axios.get(`http://localhost:8000/api/tickets/tecnico/alertas/?tecnico_id=${tecnicoId}`),
        axios.get(`http://localhost:8000/api/tickets/tecnico/historial/?tecnico_id=${tecnicoId}`)
      ]);

      if (statsRes.data.success) {
        setEstadisticas(statsRes.data.estadisticas);
      }

      if (ticketsRes.data.success && ticketsRes.data.tickets.length > 0) {
        setTicketActual(ticketsRes.data.tickets[0]);
      }

      if (alertasRes.data.success) {
        setAlertas(alertasRes.data.alertas);
      }

      if (historialRes.data.success) {
        setHistorial(historialRes.data.tickets.slice(0, 5));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setLoading(false);
    }
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

  const renderEstrellas = (valor) => {
    return '⭐'.repeat(valor) + '☆'.repeat(5 - valor);
  };

  if (loading) {
    return (
      <div className={style.loading}>
        <div className={style.spinner}></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className={style.dashboard}>
      {/* Header */}
      <div className={style.header}>
        <div>
          <h1>Dashboard Técnico</h1>
          <p>Bienvenido, {nombreUsuario}</p>
        </div>
        <button onClick={cargarDatos} className={style.btnRefresh}>
          🔄 Actualizar
        </button>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className={style.alertasContainer}>
          {alertas.map((alerta, index) => (
            <div key={index} className={`${style.alerta} ${style[`alerta${alerta.tipo}`]}`}>
              <span className={style.alertaIcono}>{alerta.icono}</span>
              <span className={style.alertaMensaje}>{alerta.mensaje}</span>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Actual */}
      <div className={style.ticketActualSection}>
        <h2>🎫 Ticket Actual</h2>
        
        {ticketActual ? (
          <div className={style.ticketActualCard}>
            <div className={style.ticketHeader}>
              <span className={style.ticketId}>#{ticketActual.id_ticket}</span>
              <span className={`${style.prioridadBadge} ${getPrioridadClass(ticketActual.prioridad)}`}>
                {ticketActual.prioridad}
              </span>
            </div>
            
            <h3 className={style.ticketTitulo}>{ticketActual.titulo}</h3>
            <p className={style.ticketDescripcion}>{ticketActual.descripcion}</p>
            
            <div className={style.ticketInfo}>
              <div className={style.infoItem}>
                <span className={style.infoLabel}>Categoría:</span>
                <span className={style.infoValue}>{ticketActual.categoria}</span>
              </div>
              <div className={style.infoItem}>
                <span className={style.infoLabel}>Usuario:</span>
                <span className={style.infoValue}>{ticketActual.usuario_creador?.nombre}</span>
              </div>
              <div className={style.infoItem}>
                <span className={style.infoLabel}>Asignado:</span>
                <span className={style.infoValue}>{formatearTiempo(ticketActual.fecha_asignacion)}</span>
              </div>
            </div>
            
            <div className={style.ticketAcciones}>
              <button 
                className={style.btnVerDetalle}
                onClick={() => navigate(`/tecnico/ticket/${ticketActual.id_ticket}`)}
              >
                📋 Ver Detalle
              </button>
              <button 
                className={style.btnResolver}
                onClick={() => navigate(`/tecnico/ticket/${ticketActual.id_ticket}`)}
              >
                ✅ Marcar Resuelto
              </button>
              <button 
                className={style.btnAyudaIA}
                onClick={() => navigate(`/tecnico/ticket/${ticketActual.id_ticket}?ayuda=true`)}
              >
                💡 Ayuda IA
              </button>
            </div>
          </div>
        ) : (
          <div className={style.sinTicket}>
            <div className={style.sinTicketIcono}>✅</div>
            <h3>¡No tienes tickets pendientes!</h3>
            <p>Estás al día con tu trabajo. Espera a que te asignen un nuevo ticket.</p>
          </div>
        )}
      </div>

      {/* KPIs */}
      {estadisticas && (
        <div className={style.kpisSection}>
          <h2>📊 Mis Estadísticas</h2>
          <div className={style.kpisGrid}>
            <div className={style.kpiCard}>
              <div className={style.kpiIcono}>✅</div>
              <div className={style.kpiValor}>{estadisticas.completados}</div>
              <div className={style.kpiLabel}>Completados</div>
            </div>
            <div className={style.kpiCard}>
              <div className={style.kpiIcono}>⭐</div>
              <div className={style.kpiValor}>{estadisticas.calificacion_promedio || 'N/A'}</div>
              <div className={style.kpiLabel}>Calificación</div>
              <div className={style.kpiSub}>{estadisticas.total_calificaciones} valoraciones</div>
            </div>
            <div className={style.kpiCard}>
              <div className={style.kpiIcono}>⏱️</div>
              <div className={style.kpiValor}>{estadisticas.tiempo_promedio_horas}h</div>
              <div className={style.kpiLabel}>Tiempo Promedio</div>
            </div>
            <div className={style.kpiCard}>
              <div className={style.kpiIcono}>📅</div>
              <div className={style.kpiValor}>{estadisticas.resueltos_mes}</div>
              <div className={style.kpiLabel}>Este Mes</div>
            </div>
          </div>
        </div>
      )}

      {/* Sección de Reclamos */}
      <div className={style.reclamosSection}>
        <div className={style.reclamosHeader}>
          <h2>📢 Mis Reclamos</h2>
          <button 
            className={style.btnVerReclamos}
            onClick={() => navigate('/tecnico/reclamos')}
          >
            Ver todos →
          </button>
        </div>
        <p className={style.reclamosTexto}>Revisa los reclamos que los usuarios han hecho sobre tu trabajo</p>
      </div>

      {/* Historial Reciente */}
      <div className={style.historialSection}>
        <div className={style.historialHeader}>
          <h2>📜 Historial Reciente</h2>
          <button 
            className={style.btnVerTodo}
            onClick={() => navigate('/tecnico/historial')}
          >
            Ver todo →
          </button>
        </div>
        
        {historial.length > 0 ? (
          <div className={style.historialList}>
            {historial.map((ticket) => (
              <div key={ticket.id_ticket} className={style.historialItem}>
                <div className={style.historialInfo}>
                  <span className={style.historialId}>#{ticket.id_ticket}</span>
                  <span className={style.historialTitulo}>{ticket.titulo}</span>
                  <span className={style.historialCategoria}>{ticket.categoria}</span>
                </div>
                <div className={style.historialCalificacion}>
                  {ticket.calificacion ? (
                    <span className={style.estrellas}>
                      {renderEstrellas(ticket.calificacion.valor)}
                    </span>
                  ) : (
                    <span className={style.sinCalificar}>Sin calificar</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={style.sinHistorial}>No hay historial disponible</p>
        )}
      </div>
    </div>
  );
};

export default TecnicoDashboard;