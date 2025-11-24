/**
 * Tabla de tickets con paginación
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import style from './TicketsTable.module.css';

const TicketsTable = ({ tickets, loading, ticketsPorPagina = 10 }) => {
  const navigate = useNavigate();
  const [paginaActual, setPaginaActual] = useState(1);
  const [paginaInput, setPaginaInput] = useState('');

  if (loading) {
    return <div className={style.loading}>Cargando tickets...</div>;
  }

  if (!tickets || tickets.length === 0) {
    return <div className={style.empty}>No hay tickets disponibles</div>;
  }

  // Calcular paginación
  const totalTickets = tickets.length;
  const totalPaginas = Math.ceil(totalTickets / ticketsPorPagina);
  const indiceInicio = (paginaActual - 1) * ticketsPorPagina;
  const indiceFin = indiceInicio + ticketsPorPagina;
  const ticketsPaginados = tickets.slice(indiceInicio, indiceFin);

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

  const irAPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };

  const irAPaginaInput = () => {
    const pagina = parseInt(paginaInput);
    if (!isNaN(pagina) && pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
      setPaginaInput('');
    } else {
      alert(`Ingresa un número entre 1 y ${totalPaginas}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      irAPaginaInput();
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
          {ticketsPaginados.map((ticket) => (
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

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className={style.paginacion}>
          <div className={style.paginacionNavegacion}>
            <button
              className={style.paginacionFlecha}
              onClick={() => irAPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
            >
              ←
            </button>
            
            <span className={style.paginacionInfo}>
              Página {paginaActual} de {totalPaginas}
            </span>
            
            <button
              className={style.paginacionFlecha}
              onClick={() => irAPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
            >
              →
            </button>
          </div>
          
          <div className={style.paginacionIr}>
            <input
              type="number"
              min="1"
              max={totalPaginas}
              value={paginaInput}
              onChange={(e) => setPaginaInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className={style.paginacionInput}
              placeholder="🔍 Ingresa número de página"
            />
            <button
              className={style.paginacionBtnIr}
              onClick={irAPaginaInput}
            >
              Ir a página
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsTable;