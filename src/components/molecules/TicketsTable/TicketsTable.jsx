/**
 * Tabla de tickets
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import style from './TicketsTable.module.css';

const TicketsTable = ({ tickets, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return <div className={style.loading}>Cargando tickets...</div>;
  }

  if (!tickets || tickets.length === 0) {
    return <div className={style.empty}>No hay tickets disponibles</div>;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPrioridadClass = (nivel) => {
    switch (nivel) {
      case 1:
        return style.prioridadBaja;
      case 2:
        return style.prioridadMedia;
      case 3:
        return style.prioridadAlta;
      case 4:
        return style.prioridadUrgente;
      default:
        return '';
    }
  };

  return (
    <div className={style.tableContainer}>
      <table className={style.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Categoría</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Creador</th>
            <th>Técnico</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id_ticket}>
              <td>#{ticket.id_ticket}</td>
              <td className={style.titulo}>{ticket.titulo}</td>
              <td>{ticket.categoria}</td>
              <td>
                <span
                  className={style.badge}
                  style={{ backgroundColor: ticket.estado_color }}
                >
                  {ticket.estado}
                </span>
              </td>
              <td>
                <span
                  className={`${style.badge} ${getPrioridadClass(
                    ticket.prioridad_nivel
                  )}`}
                >
                  {ticket.prioridad}
                </span>
              </td>
              <td>{ticket.usuario_creador?.nombre || 'N/A'}</td>
              <td>
                {ticket.tecnico_asignado?.nombre || (
                  <span className={style.sinAsignar}>Sin asignar</span>
                )}
              </td>
              <td>{formatDate(ticket.fecha_creacion)}</td>
              <td>
                <button
                  className={style.btnVer}
                  onClick={() => navigate(`/admin/tickets/${ticket.id_ticket}`)}
                >
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketsTable;