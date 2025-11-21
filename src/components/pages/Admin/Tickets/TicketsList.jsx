/**
 * Vista principal de Tickets para Administrador
 * Incluye tabla con todos los tickets y filtros avanzados
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsService } from '../../../../api/ticketsService';
import TicketFilters from './TicketFilters';
import style from './TicketsList.module.css';

const TicketsList = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [ticketsFiltrados, setTicketsFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ordenamiento, setOrdenamiento] = useState({
    campo: 'fecha_creacion',
    direccion: 'desc'
  });

  // Cargar todos los tickets al montar
  useEffect(() => {
    cargarTickets();
  }, []);

  const cargarTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ticketsService.listarTickets();
      
      if (response.success) {
        setTickets(response.tickets || []);
        setTicketsFiltrados(response.tickets || []);
      }
    } catch (err) {
      console.error('Error al cargar tickets:', err);
      setError('Error al cargar los tickets');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const handleFilterChange = (filtros) => {
    let resultado = [...tickets];

    // Filtro por búsqueda de texto
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(ticket =>
        ticket.titulo?.toLowerCase().includes(busqueda) ||
        ticket.descripcion?.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por estado
    if (filtros.estado) {
      resultado = resultado.filter(ticket => 
        ticket.estado === filtros.estado || 
        ticket.estado_id?.id_estado_ticket === parseInt(filtros.estado)
      );
    }

    // Filtro por prioridad
    if (filtros.prioridad) {
      resultado = resultado.filter(ticket => 
        ticket.prioridad === filtros.prioridad ||
        ticket.prioridad_id?.id_prioridad_ticket === parseInt(filtros.prioridad)
      );
    }

    // Filtro por categoría
    if (filtros.categoria) {
      resultado = resultado.filter(ticket => 
        ticket.categoria === filtros.categoria ||
        ticket.categoria_id?.id_categoria_ticket === parseInt(filtros.categoria)
      );
    }

    // Filtro por técnico
    if (filtros.tecnico_asignado) {
      if (filtros.tecnico_asignado === 'sin_asignar') {
        resultado = resultado.filter(ticket => !ticket.tecnico_asignado);
      } else {
        resultado = resultado.filter(ticket => 
          ticket.tecnico_asignado?.id === parseInt(filtros.tecnico_asignado)
        );
      }
    }

    // Filtro por usuario creador
    if (filtros.usuario_creador) {
      resultado = resultado.filter(ticket => 
        ticket.usuario_creador?.id === parseInt(filtros.usuario_creador)
      );
    }

    // Filtro por fecha desde
    if (filtros.fecha_desde) {
      const fechaDesde = new Date(filtros.fecha_desde);
      resultado = resultado.filter(ticket => {
        const fechaTicket = new Date(ticket.fecha_creacion);
        return fechaTicket >= fechaDesde;
      });
    }

    // Filtro por fecha hasta
    if (filtros.fecha_hasta) {
      const fechaHasta = new Date(filtros.fecha_hasta);
      fechaHasta.setHours(23, 59, 59, 999); // Incluir todo el día
      resultado = resultado.filter(ticket => {
        const fechaTicket = new Date(ticket.fecha_creacion);
        return fechaTicket <= fechaHasta;
      });
    }

    setTicketsFiltrados(resultado);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setTicketsFiltrados(tickets);
  };

  // Ordenar tickets
  const handleSort = (campo) => {
    const nuevaDireccion = 
      ordenamiento.campo === campo && ordenamiento.direccion === 'asc' 
        ? 'desc' 
        : 'asc';

    const ticketsOrdenados = [...ticketsFiltrados].sort((a, b) => {
      let valorA, valorB;

      switch (campo) {
        case 'fecha_creacion':
          valorA = new Date(a.fecha_creacion);
          valorB = new Date(b.fecha_creacion);
          break;
        case 'prioridad':
          valorA = a.prioridad_nivel || 0;
          valorB = b.prioridad_nivel || 0;
          break;
        case 'estado':
          valorA = a.estado || '';
          valorB = b.estado || '';
          break;
        case 'titulo':
          valorA = a.titulo || '';
          valorB = b.titulo || '';
          break;
        default:
          return 0;
      }

      if (valorA < valorB) return nuevaDireccion === 'asc' ? -1 : 1;
      if (valorA > valorB) return nuevaDireccion === 'asc' ? 1 : -1;
      return 0;
    });

    setTicketsFiltrados(ticketsOrdenados);
    setOrdenamiento({ campo, direccion: nuevaDireccion });
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Ver detalle del ticket
  const verDetalle = (idTicket) => {
    navigate(`/admin/tickets/${idTicket}`);
  };

  if (loading) {
    return (
      <div className={style.container}>
        <div className={style.loading}>Cargando tickets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={style.container}>
        <div className={style.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={style.container}>
      <div className={style.header}>
        <h1>Gestión de Tickets</h1>
        <div className={style.stats}>
          <span className={style.statItem}>
            Total: <strong>{tickets.length}</strong>
          </span>
          <span className={style.statItem}>
            Filtrados: <strong>{ticketsFiltrados.length}</strong>
          </span>
        </div>
      </div>

      <TicketFilters 
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <div className={style.tableContainer}>
        {ticketsFiltrados.length === 0 ? (
          <div className={style.noResults}>
            No se encontraron tickets con los filtros aplicados
          </div>
        ) : (
          <table className={style.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort('id_ticket')}>
                  ID {ordenamiento.campo === 'id_ticket' && (
                    <span>{ordenamiento.direccion === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('titulo')}>
                  Título {ordenamiento.campo === 'titulo' && (
                    <span>{ordenamiento.direccion === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th>Categoría</th>
                <th onClick={() => handleSort('estado')}>
                  Estado {ordenamiento.campo === 'estado' && (
                    <span>{ordenamiento.direccion === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th onClick={() => handleSort('prioridad')}>
                  Prioridad {ordenamiento.campo === 'prioridad' && (
                    <span>{ordenamiento.direccion === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th>Creado por</th>
                <th>Técnico</th>
                <th onClick={() => handleSort('fecha_creacion')}>
                  Fecha {ordenamiento.campo === 'fecha_creacion' && (
                    <span>{ordenamiento.direccion === 'asc' ? '↑' : '↓'}</span>
                  )}
                </th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ticketsFiltrados.map((ticket) => (
                <tr key={ticket.id_ticket}>
                  <td>#{ticket.id_ticket}</td>
                  <td className={style.tituloCell}>
                    <div className={style.titulo}>{ticket.titulo}</div>
                    <div className={style.descripcion}>
                      {ticket.descripcion?.substring(0, 50)}...
                    </div>
                  </td>
                  <td>
                    <span className={style.badge}>
                      {ticket.categoria}
                    </span>
                  </td>
                  <td>
                    <span 
                      className={style.estadoBadge}
                      style={{ 
                        backgroundColor: ticket.estado_color || '#ccc',
                        color: 'white'
                      }}
                    >
                      {ticket.estado}
                    </span>
                  </td>
                  <td>
                    <span 
                      className={style.prioridadBadge}
                      style={{ 
                        backgroundColor: ticket.prioridad_color || '#ccc',
                        color: 'white'
                      }}
                    >
                      {ticket.prioridad}
                    </span>
                  </td>
                  <td>
                    <div className={style.usuario}>
                      {ticket.usuario_creador?.nombre || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className={style.tecnico}>
                      {ticket.tecnico_asignado?.nombre || 'Sin asignar'}
                    </div>
                  </td>
                  <td>{formatearFecha(ticket.fecha_creacion)}</td>
                  <td>
                    <button
                      onClick={() => verDetalle(ticket.id_ticket)}
                      className={style.btnVer}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TicketsList;