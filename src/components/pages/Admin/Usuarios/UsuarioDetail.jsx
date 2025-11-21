/**
 * Modal de detalle de usuario
 * Muestra el historial completo de tickets del usuario
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import style from './UsuarioDetail.module.css';

const UsuarioDetail = ({ usuario, onClose }) => {
  const navigate = useNavigate();
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // Filtrar tickets
  const ticketsFiltrados = usuario.tickets.filter(ticket => {
    const cumpleFiltroEstado = filtroEstado === 'todos' || ticket.estado === filtroEstado;
    const cumpleFiltroTipo = filtroTipo === 'todos' || ticket.categoria === filtroTipo;
    return cumpleFiltroEstado && cumpleFiltroTipo;
  });

  // Obtener estados únicos
  const estadosUnicos = [...new Set(usuario.tickets.map(t => t.estado))];
  
  // Obtener tipos únicos
  const tiposUnicos = [...new Set(usuario.tickets.map(t => t.categoria))];

  // Estadísticas del usuario
  const totalTickets = usuario.tickets.length;
  const ticketsPorEstado = {
    abiertos: usuario.tickets.filter(t => t.estado === 'Abierto').length,
    enProceso: usuario.tickets.filter(t => t.estado === 'En Proceso').length,
    resueltos: usuario.tickets.filter(t => t.estado === 'Resuelto').length,
    cerrados: usuario.tickets.filter(t => t.estado === 'Cerrado').length,
  };

  const ticketsPorTipo = {};
  tiposUnicos.forEach(tipo => {
    ticketsPorTipo[tipo] = usuario.tickets.filter(t => t.categoria === tipo).length;
  });

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Ver detalle del ticket
  const verTicket = (idTicket) => {
    navigate(`/admin/tickets/${idTicket}`);
    onClose();
  };

  return (
    <div className={style.overlay} onClick={onClose}>
      <div className={style.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header del modal */}
        <div className={style.header}>
          <div>
            <h2>{usuario.nombre_completo || 'Usuario'}</h2>
            <p className={style.correo}>{usuario.correo}</p>
          </div>
          <button onClick={onClose} className={style.btnClose}>
            ✕
          </button>
        </div>

        {/* Información del usuario */}
        <div className={style.infoUsuario}>
          <div className={style.infoItem}>
            <span className={style.label}>Cargo:</span>
            <span className={style.value}>{usuario.nombre_cargo || 'N/A'}</span>
          </div>
          <div className={style.infoItem}>
            <span className={style.label}>Total de tickets:</span>
            <span className={style.value}>{totalTickets}</span>
          </div>
        </div>

        {/* Estadísticas */}
        <div className={style.estadisticas}>
          <h3>Estadísticas</h3>
          <div className={style.statsGrid}>
            <div className={style.statCard}>
              <div className={style.statNumero}>{ticketsPorEstado.abiertos}</div>
              <div className={style.statLabel}>Abiertos</div>
            </div>
            <div className={style.statCard}>
              <div className={style.statNumero}>{ticketsPorEstado.enProceso}</div>
              <div className={style.statLabel}>En Proceso</div>
            </div>
            <div className={style.statCard}>
              <div className={style.statNumero}>{ticketsPorEstado.resueltos}</div>
              <div className={style.statLabel}>Resueltos</div>
            </div>
            <div className={style.statCard}>
              <div className={style.statNumero}>{ticketsPorEstado.cerrados}</div>
              <div className={style.statLabel}>Cerrados</div>
            </div>
          </div>

          <div className={style.tiposContainer}>
            <h4>Tickets por tipo:</h4>
            <div className={style.tiposGrid}>
              {Object.entries(ticketsPorTipo).map(([tipo, cantidad]) => (
                <div key={tipo} className={style.tipoItem}>
                  <span className={style.tipoNombre}>{tipo}:</span>
                  <span className={style.tipoCantidad}>{cantidad}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className={style.filtros}>
          <div className={style.filtroGroup}>
            <label>Estado:</label>
            <select 
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value)}
              className={style.select}
            >
              <option value="todos">Todos los estados</option>
              {estadosUnicos.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>

          <div className={style.filtroGroup}>
            <label>Tipo:</label>
            <select 
              value={filtroTipo} 
              onChange={(e) => setFiltroTipo(e.target.value)}
              className={style.select}
            >
              <option value="todos">Todos los tipos</option>
              {tiposUnicos.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Historial de tickets */}
        <div className={style.historialContainer}>
          <h3>Historial de Tickets ({ticketsFiltrados.length})</h3>
          
          {ticketsFiltrados.length === 0 ? (
            <div className={style.noTickets}>
              No hay tickets con los filtros seleccionados
            </div>
          ) : (
            <div className={style.ticketsList}>
              {ticketsFiltrados.map(ticket => (
                <div key={ticket.id_ticket} className={style.ticketCard}>
                  <div className={style.ticketHeader}>
                    <span className={style.ticketId}>#{ticket.id_ticket}</span>
                    <span 
                      className={style.ticketEstado}
                      style={{ 
                        backgroundColor: ticket.estado_color || '#ccc',
                        color: 'white'
                      }}
                    >
                      {ticket.estado}
                    </span>
                  </div>

                  <div className={style.ticketBody}>
                    <h4 className={style.ticketTitulo}>{ticket.titulo}</h4>
                    <p className={style.ticketDescripcion}>
                      {ticket.descripcion?.substring(0, 100)}
                      {ticket.descripcion?.length > 100 && '...'}
                    </p>

                    <div className={style.ticketInfo}>
                      <div className={style.ticketInfoItem}>
                        <span className={style.ticketLabel}>Tipo:</span>
                        <span className={style.ticketBadge}>{ticket.categoria}</span>
                      </div>
                      <div className={style.ticketInfoItem}>
                        <span className={style.ticketLabel}>Prioridad:</span>
                        <span 
                          className={style.ticketBadge}
                          style={{ 
                            backgroundColor: ticket.prioridad_color || '#ccc',
                            color: 'white'
                          }}
                        >
                          {ticket.prioridad}
                        </span>
                      </div>
                      <div className={style.ticketInfoItem}>
                        <span className={style.ticketLabel}>Técnico:</span>
                        <span>{ticket.tecnico_asignado?.nombre || 'Sin asignar'}</span>
                      </div>
                    </div>

                    <div className={style.ticketFooter}>
                      <span className={style.ticketFecha}>
                        Creado: {formatearFecha(ticket.fecha_creacion)}
                      </span>
                      {ticket.fecha_resolucion && (
                        <span className={style.ticketFecha}>
                          Resuelto: {formatearFecha(ticket.fecha_resolucion)}
                        </span>
                      )}
                      <button
                        onClick={() => verTicket(ticket.id_ticket)}
                        className={style.btnVerTicket}
                      >
                        Ver detalle
                      </button>
                    </div>

                    {ticket.solucion && (
                      <div className={style.solucion}>
                        <strong>Solución:</strong> {ticket.solucion}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsuarioDetail;