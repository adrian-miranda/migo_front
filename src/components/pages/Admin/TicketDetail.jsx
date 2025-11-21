/**
 * Página de detalle de ticket
 * Permite ver información completa, asignar técnico y cambiar estado
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketsService } from '../../../api/ticketsService';
import { authService } from '../../../api/authService';
import style from './TicketDetail.module.css';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Formulario de actualización
  const [formData, setFormData] = useState({
    tecnico_asignado_id: '',
    estado_id: '',
    solucion: '',
  });

  const cargarDatos = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    // Cargar ticket, historial, técnicos y estados
    const [ticketRes, historialRes, tecnicosRes, estadosRes] =
      await Promise.all([
        ticketsService.obtenerTicket(id),
        ticketsService.obtenerHistorial(id),
        authService.listarTodosTecnicos(),
        ticketsService.getEstados(),
      ]);

    if (ticketRes.success) {
      setTicket(ticketRes.ticket);
      setFormData({
        tecnico_asignado_id: ticketRes.ticket.tecnico_asignado?.id || '',
        estado_id: ticketRes.ticket.estado.id_estado_ticket,
        solucion: ticketRes.ticket.solucion || '',
      });
    }

    if (historialRes.success) {
      setHistorial(historialRes.historial);
    }

    if (tecnicosRes.success) {
      setTecnicos(tecnicosRes.tecnicos);
    }

    if (estadosRes.success) {
      setEstados(estadosRes.estados);
    }

    setLoading(false);
  } catch (err) {
    console.error('Error al cargar datos:', err);
    setError('Error al cargar el ticket');
    setLoading(false);
  }
}, [id]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Recargar tickets cuando cambia el filtro
  useEffect(() => {
    if (!loading) {
      cargarDatos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleActualizar = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);

      const dataToUpdate = {};

      // Solo enviar campos que cambiaron
      if (
        formData.tecnico_asignado_id &&
        formData.tecnico_asignado_id !==
          (ticket.tecnico_asignado?.id || '').toString()
      ) {
        dataToUpdate.tecnico_asignado_id = parseInt(
          formData.tecnico_asignado_id
        );
      }

      if (formData.estado_id !== ticket.estado.id_estado_ticket.toString()) {
        dataToUpdate.estado_id = parseInt(formData.estado_id);
      }

      if (formData.solucion !== (ticket.solucion || '')) {
        dataToUpdate.solucion = formData.solucion;
      }

      if (Object.keys(dataToUpdate).length === 0) {
        alert('No hay cambios para guardar');
        setUpdating(false);
        return;
      }

      const response = await ticketsService.actualizarTicket(id, dataToUpdate);

      if (response.success) {
        alert('Ticket actualizado exitosamente');
        cargarDatos(); // Recargar datos
      } else {
        alert('Error al actualizar ticket: ' + response.error);
      }

      setUpdating(false);
    } catch (err) {
      console.error('Error al actualizar:', err);
      alert('Error al actualizar el ticket');
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className={style.loadingContainer}>
        <div className={style.spinner}></div>
        <p>Cargando ticket...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className={style.errorContainer}>
        <p>{error || 'Ticket no encontrado'}</p>
        <button onClick={() => navigate('/admin/dashboard')} className={style.btnBack}>
          Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className={style.container}>
      {/* Header */}
      <div className={style.header}>
        <button onClick={() => navigate('/admin/dashboard')} className={style.btnBack}>
          ← Volver
        </button>
        <h1 className={style.title}>Ticket #{ticket.id_ticket}</h1>
      </div>

      <div className={style.content}>
        {/* Columna izquierda - Información del ticket */}
        <div className={style.leftColumn}>
          {/* Información principal */}
          <div className={style.card}>
            <h2 className={style.cardTitle}>Información del Ticket</h2>

            <div className={style.infoGrid}>
              <div className={style.infoItem}>
                <label>Título:</label>
                <p className={style.ticketTitle}>{ticket.titulo}</p>
              </div>

              <div className={style.infoItem}>
                <label>Descripción:</label>
                <p className={style.description}>{ticket.descripcion}</p>
              </div>

              <div className={style.infoRow}>
                <div className={style.infoItem}>
                  <label>Estado:</label>
                  <span
                    className={style.badge}
                    style={{ backgroundColor: ticket.estado.color }}
                  >
                    {ticket.estado.nombre_estado}
                  </span>
                </div>

                <div className={style.infoItem}>
                  <label>Prioridad:</label>
                  <span
                    className={style.badge}
                    style={{ backgroundColor: ticket.prioridad.color }}
                  >
                    {ticket.prioridad.nombre_prioridad}
                  </span>
                </div>

                <div className={style.infoItem}>
                  <label>Categoría:</label>
                  <span className={style.badge} style={{ backgroundColor: '#9b59b6' }}>
                    {ticket.categoria.nombre_categoria}
                  </span>
                </div>
              </div>

              <div className={style.infoRow}>
                <div className={style.infoItem}>
                  <label>Creado por:</label>
                  <p>{ticket.usuario_creador.nombre_completo}</p>
                  <p className={style.small}>{ticket.usuario_creador.correo}</p>
                </div>

                <div className={style.infoItem}>
                  <label>Fecha de creación:</label>
                  <p>{formatDate(ticket.fecha_creacion)}</p>
                </div>
              </div>

              {ticket.tecnico_asignado && (
                <div className={style.infoRow}>
                  <div className={style.infoItem}>
                    <label>Técnico asignado:</label>
                    <p>{ticket.tecnico_asignado.nombre_completo}</p>
                    <p className={style.small}>{ticket.tecnico_asignado.correo}</p>
                  </div>

                  {ticket.fecha_asignacion && (
                    <div className={style.infoItem}>
                      <label>Fecha de asignación:</label>
                      <p>{formatDate(ticket.fecha_asignacion)}</p>
                    </div>
                  )}
                </div>
              )}

              {ticket.fecha_resolucion && (
                <div className={style.infoItem}>
                  <label>Fecha de resolución:</label>
                  <p>{formatDate(ticket.fecha_resolucion)}</p>
                </div>
              )}

              {ticket.fecha_cierre && (
                <div className={style.infoItem}>
                  <label>Fecha de cierre:</label>
                  <p>{formatDate(ticket.fecha_cierre)}</p>
                </div>
              )}

              {ticket.solucion && (
                <div className={style.infoItem}>
                  <label>Solución aplicada:</label>
                  <p className={style.description}>{ticket.solucion}</p>
                </div>
              )}
            </div>
          </div>

          {/* Historial */}
          <div className={style.card}>
            <h2 className={style.cardTitle}>Historial de Cambios</h2>
            {historial.length === 0 ? (
              <p className={style.empty}>No hay historial disponible</p>
            ) : (
              <div className={style.timeline}>
                {historial.map((item) => (
                  <div key={item.id_historial} className={style.timelineItem}>
                    <div className={style.timelineDot}></div>
                    <div className={style.timelineContent}>
                      <p className={style.timelineDate}>
                        {formatDate(item.fecha_cambio)}
                      </p>
                      <p className={style.timelineUser}>
                        {item.usuario.nombre}
                      </p>
                      <p className={style.timelineAction}>
                        {item.estado_anterior && (
                          <span>
                            <strong>{item.estado_anterior}</strong> →{' '}
                          </span>
                        )}
                        <strong>{item.estado_nuevo}</strong>
                      </p>
                      {item.comentario && (
                        <p className={style.timelineComment}>
                          {item.comentario}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha - Formulario de actualización */}
        <div className={style.rightColumn}>
          <div className={style.card}>
            <h2 className={style.cardTitle}>Actualizar Ticket</h2>

            <form onSubmit={handleActualizar} className={style.form}>
              {/* Asignar técnico */}
              {/* Asignar técnico */}
            <div className={style.formGroup}>
            <label htmlFor="tecnico_asignado_id">Asignar Técnico:</label>
            <select
                id="tecnico_asignado_id"
                name="tecnico_asignado_id"
                value={formData.tecnico_asignado_id}
                onChange={handleInputChange}
                className={style.select}
            >
                <option value="">Sin asignar</option>
                {tecnicos.map((tecnico) => (
                <option 
                    key={tecnico.id_usuarios} 
                    value={tecnico.id_usuarios}
                    disabled={!tecnico.disponible}
                >
                    {tecnico.nombre_completo} - {tecnico.nombre_cargo}
                    {!tecnico.disponible && ` (Ocupado - ${tecnico.tickets_activos} ticket${tecnico.tickets_activos > 1 ? 's' : ''})`}
                </option>
                ))}
            </select>
            <p className={style.hint}>
                {tecnicos.filter(t => t.disponible).length} técnicos disponibles de {tecnicos.length} totales
            </p>
            </div>

              {/* Cambiar estado */}
              <div className={style.formGroup}>
                <label htmlFor="estado_id">Estado:</label>
                <select
                  id="estado_id"
                  name="estado_id"
                  value={formData.estado_id}
                  onChange={handleInputChange}
                  className={style.select}
                >
                  {estados.map((estado) => (
                    <option
                      key={estado.id_estado_ticket}
                      value={estado.id_estado_ticket}
                    >
                      {estado.nombre_estado}
                    </option>
                  ))}
                </select>
              </div>

              {/* Solución */}
              <div className={style.formGroup}>
                <label htmlFor="solucion">Solución:</label>
                <textarea
                  id="solucion"
                  name="solucion"
                  value={formData.solucion}
                  onChange={handleInputChange}
                  className={style.textarea}
                  rows="6"
                  placeholder="Describe la solución aplicada..."
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className={style.btnSubmit}
              >
                {updating ? 'Actualizando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;