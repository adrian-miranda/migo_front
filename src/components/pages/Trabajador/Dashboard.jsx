import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import style from './Dashboard.module.css';

const TrabajadorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    abiertos: 0,
    enProceso: 0,
    resueltos: 0,
    cerrados: 0
  });
  const [ultimosTickets, setUltimosTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

const cargarDatos = async () => {
  try {
    // Obtener usuario de localStorage (usa el nombre correcto: migo_usuario)
    const userData = JSON.parse(localStorage.getItem('migo_usuario'));
    
    if (!userData || !userData.id_usuarios) {
      console.error('No hay usuario autenticado');
      navigate('/login');
      return;
    }

    // Obtener tickets del usuario
    const response = await axios.get(
      `http://localhost:8000/api/tickets/mis-tickets/?user_id=${userData.id_usuarios}`
    );
    
    const tickets = response.data.tickets || [];

    // Calcular estadísticas
    setEstadisticas({
      total: tickets.length,
      abiertos: tickets.filter(t => t.estado === 'Abierto').length,
      enProceso: tickets.filter(t => t.estado === 'En Proceso').length,
      resueltos: tickets.filter(t => t.estado === 'Resuelto').length,
      cerrados: tickets.filter(t => t.estado === 'Cerrado').length
    });

    // Obtener últimos 5 tickets
    setUltimosTickets(tickets.slice(0, 5));
    setLoading(false);
  } catch (error) {
    console.error('Error al cargar datos:', error);
    setLoading(false);
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
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className={style.loading}>Cargando...</div>;
  }

  return (
    <div className={style.dashboard}>
      {/* Header */}
      <div className={style.header}>
        <div>
          <h1>Bienvenido, {user?.persona?.nombre_completo || user?.persona?.primer_nombre || 'Usuario'}</h1>
          <p>Panel de Control - Trabajador</p>
        </div>
        <button 
          className={style.btnNuevoTicket}
          onClick={() => navigate('/trabajador/nuevo-ticket')}
        >
          ➕ Crear Nuevo Ticket
        </button>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className={style.estadisticasGrid}>
        <div className={style.tarjeta}>
          <div className={style.tarjetaIcono} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            📊
          </div>
          <div className={style.tarjetaInfo}>
            <h3>{estadisticas.total}</h3>
            <p>Total Tickets</p>
          </div>
        </div>

        <div className={style.tarjeta}>
          <div className={style.tarjetaIcono} style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            📝
          </div>
          <div className={style.tarjetaInfo}>
            <h3>{estadisticas.abiertos}</h3>
            <p>Abiertos</p>
          </div>
        </div>

        <div className={style.tarjeta}>
          <div className={style.tarjetaIcono} style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            ⚙️
          </div>
          <div className={style.tarjetaInfo}>
            <h3>{estadisticas.enProceso}</h3>
            <p>En Proceso</p>
          </div>
        </div>

        <div className={style.tarjeta}>
          <div className={style.tarjetaIcono} style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            ✅
          </div>
          <div className={style.tarjetaInfo}>
            <h3>{estadisticas.resueltos}</h3>
            <p>Resueltos</p>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className={style.accionesRapidas}>
        <h2>Acciones Rápidas</h2>
        <div className={style.botonesAcciones}>
          <button 
            className={style.btnAccion}
            onClick={() => navigate('/trabajador/nuevo-ticket')}
          >
            <span className={style.iconoAccion}>➕</span>
            <div>
              <h3>Crear Ticket</h3>
              <p>Reportar un nuevo problema</p>
            </div>
          </button>

          <button 
            className={style.btnAccion}
            onClick={() => navigate('/trabajador/mis-tickets')}
          >
            <span className={style.iconoAccion}>📋</span>
            <div>
              <h3>Mis Tickets</h3>
              <p>Ver todos mis tickets</p>
            </div>
          </button>

          <button 
            className={style.btnAccion}
            onClick={() => navigate('/trabajador/mis-tickets?estado=Abierto')}
          >
            <span className={style.iconoAccion}>🔔</span>
            <div>
              <h3>Tickets Pendientes</h3>
              <p>Ver tickets sin atender</p>
            </div>
          </button>
        </div>
      </div>

      {/* Últimos Tickets */}
      <div className={style.ultimosTickets}>
        <div className={style.seccionHeader}>
          <h2>Últimos Tickets Creados</h2>
          <button 
            className={style.btnVerTodos}
            onClick={() => navigate('/trabajador/mis-tickets')}
          >
            Ver todos →
          </button>
        </div>

        {ultimosTickets.length === 0 ? (
          <div className={style.sinTickets}>
            <p>No has creado ningún ticket aún</p>
            <button 
              className={style.btnCrearPrimero}
              onClick={() => navigate('/trabajador/nuevo-ticket')}
            >
              Crear mi primer ticket
            </button>
          </div>
        ) : (
          <div className={style.tablaTickets}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Categoría</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ultimosTickets.map((ticket) => (
                  <tr key={ticket.id_ticket}>
                    <td>#{ticket.id_ticket}</td>
                    <td className={style.tituloTicket}>{ticket.titulo}</td>
                    <td>
                      <span className={style.categoriaTag}>
                        {ticket.categoria}
                      </span>
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
                      <button 
                        className={style.btnVer}
                        onClick={() => navigate(`/trabajador/tickets/${ticket.id_ticket}`)}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrabajadorDashboard;