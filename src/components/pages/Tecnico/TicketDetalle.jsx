/**
 * Detalle de Ticket para Técnico
 * Permite ver información, agregar solución, marcar como resuelto y usar IA
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import iaService from '../../../api/iaService';
import style from './TicketDetalle.module.css';

const TicketDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [solucion, setSolucion] = useState('');
  const [error, setError] = useState(null);

  // Estados para IA
  const [mostrarPanelIA, setMostrarPanelIA] = useState(false);
  const [cargandoIA, setCargandoIA] = useState(false);
  const [respuestaIA, setRespuestaIA] = useState(null);
  const [ticketsSimilares, setTicketsSimilares] = useState([]);
  const [consultasRestantes, setConsultasRestantes] = useState(null);
  const [feedbackEnviado, setFeedbackEnviado] = useState(false);
  const [mensajeCarga, setMensajeCarga] = useState('');

  useEffect(() => {
    cargarTicket();
    cargarConsultasRestantes();
  }, [id]);

  const cargarTicket = async () => {
    try {
      setLoading(true);
      setError(null);

      const [ticketRes, historialRes] = await Promise.all([
        axios.get(`http://localhost:8000/api/tickets/${id}/`),
        axios.get(`http://localhost:8000/api/tickets/${id}/historial/`)
      ]);

      if (ticketRes.data.success) {
        setTicket(ticketRes.data.ticket);
        setSolucion(ticketRes.data.ticket.solucion || '');
      }

      if (historialRes.data.success) {
        setHistorial(historialRes.data.historial);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error al cargar ticket:', err);
      setError('Error al cargar el ticket');
      setLoading(false);
    }
  };

  const cargarConsultasRestantes = async () => {
    try {
      const data = await iaService.getConsultasRestantes();
      setConsultasRestantes(data.consultas_restantes);
    } catch (err) {
      console.error('Error al cargar consultas restantes:', err);
    }
  };

  const guardarSolucion = async () => {
    if (!solucion.trim()) {
      alert('Debes ingresar una solución');
      return;
    }

    try {
      setGuardando(true);
      
      await axios.put(`http://localhost:8000/api/tickets/${id}/actualizar/`, {
        solucion: solucion
      });

      alert('Solución guardada correctamente');
      cargarTicket();
    } catch (err) {
      console.error('Error al guardar:', err);
      alert('Error al guardar la solución');
    } finally {
      setGuardando(false);
    }
  };

  const marcarResuelto = async () => {
    if (!solucion.trim() || solucion.trim().length < 10) {
      alert('Debes ingresar una solución de al menos 10 caracteres antes de marcar como resuelto');
      return;
    }

    if (!window.confirm('¿Estás seguro de marcar este ticket como resuelto?')) {
      return;
    }

    try {
      setGuardando(true);
      
      await axios.put(`http://localhost:8000/api/tickets/${id}/actualizar/`, {
        estado_id: 3,
        solucion: solucion
      });

      alert('Ticket marcado como resuelto exitosamente');
      navigate('/tecnico/dashboard');
    } catch (err) {
      console.error('Error:', err);
      alert(err.response?.data?.error || 'Error al actualizar el ticket');
    } finally {
      setGuardando(false);
    }
  };

  // Funciones de IA
  const solicitarAyudaIA = async () => {
    if (consultasRestantes !== null && consultasRestantes <= 0) {
      alert('Has alcanzado el límite de consultas diarias');
      return;
    }

    try {
      setCargandoIA(true);
      setMostrarPanelIA(true);
      setRespuestaIA(null);
      setFeedbackEnviado(false);

      setMensajeCarga('Analizando el ticket...');
      
      const similaresPromise = iaService.getTicketsSimilares(id);
      
      setTimeout(() => setMensajeCarga('Buscando casos similares...'), 1500);
      setTimeout(() => setMensajeCarga('Generando recomendaciones...'), 3000);
      setTimeout(() => setMensajeCarga('Casi listo...'), 5000);

      const [guiaRes, similaresRes] = await Promise.all([
        iaService.generarGuia(id, false),
        similaresPromise
      ]);

      if (guiaRes.success) {
        setRespuestaIA(guiaRes);
      } else {
        setRespuestaIA({ error: guiaRes.error });
      }

      if (similaresRes.tickets_similares) {
        setTicketsSimilares(similaresRes.tickets_similares);
      }
      
      // Siempre actualizar consultas restantes
      cargarConsultasRestantes();

    } catch (err) {
      console.error('Error al solicitar ayuda IA:', err);
      setRespuestaIA({ error: 'Error al conectar con el servicio de IA' });
    } finally {
      setCargandoIA(false);
      setMensajeCarga('');
    }
  };

  const regenerarAyudaIA = async () => {
    if (consultasRestantes !== null && consultasRestantes <= 0) {
      alert('Has alcanzado el límite de consultas diarias');
      return;
    }

    try {
      setCargandoIA(true);
      setRespuestaIA(null);
      setFeedbackEnviado(false);

      setMensajeCarga('Generando nueva respuesta...');
      setTimeout(() => setMensajeCarga('Analizando desde otra perspectiva...'), 2000);
      setTimeout(() => setMensajeCarga('Casi listo...'), 4000);

      const guiaRes = await iaService.generarGuia(id, true);

      if (guiaRes.success) {
        setRespuestaIA(guiaRes);
      } else {
        setRespuestaIA({ error: guiaRes.error });
      }
      
      // Siempre actualizar consultas restantes
      cargarConsultasRestantes();

    } catch (err) {
      console.error('Error al regenerar ayuda IA:', err);
      setRespuestaIA({ error: 'Error al conectar con el servicio de IA' });
    } finally {
      setCargandoIA(false);
      setMensajeCarga('');
    }
  };

  const enviarFeedbackIA = async (fueUtil) => {
    try {
      await iaService.enviarFeedback(id, fueUtil);
      setFeedbackEnviado(true);
    } catch (err) {
      console.error('Error al enviar feedback:', err);
    }
  };

  const aplicarSugerenciaIA = () => {
    if (respuestaIA?.respuesta) {
      const sugerencia = `[Sugerencia IA]\n${respuestaIA.respuesta}`;
      setSolucion(prev => prev ? `${prev}\n\n${sugerencia}` : sugerencia);
      setMostrarPanelIA(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <p>Cargando ticket...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className={style.error}>
        <p>{error || 'Ticket no encontrado'}</p>
        <button onClick={() => navigate('/tecnico/dashboard')} className={style.btnVolver}>
          ← Volver al Dashboard
        </button>
      </div>
    );
  }

  const isResuelto = ticket.estado === 'Resuelto' || ticket.estado === 'Cerrado';

  return (
    <div className={style.container}>
      {/* Header */}
      <div className={style.header}>
        <button onClick={() => navigate('/tecnico/dashboard')} className={style.btnVolver}>
          ← Volver
        </button>
        <h1>Ticket #{ticket.id_ticket}</h1>
      </div>

      <div className={style.content}>
        {/* Columna izquierda - Info del ticket */}
        <div className={style.infoColumn}>
          {/* Info principal */}
          <div className={style.card}>
            <div className={style.cardHeader}>
              <h2>{ticket.titulo}</h2>
              <span className={`${style.prioridadBadge} ${getPrioridadClass(ticket.prioridad)}`}>
                {ticket.prioridad}
              </span>
            </div>

            <div className={style.estadoBadge} style={{ backgroundColor: ticket.estado_color }}>
              {ticket.estado}
            </div>

            <div className={style.descripcion}>
              <h3>Descripción del problema:</h3>
              <p>{ticket.descripcion}</p>
            </div>

            <div className={style.detalles}>
              <div className={style.detalleItem}>
                <span className={style.detalleLabel}>Categoría:</span>
                <span className={style.detalleValue}>{ticket.categoria}</span>
              </div>
              <div className={style.detalleItem}>
                <span className={style.detalleLabel}>Usuario:</span>
                <span className={style.detalleValue}>{ticket.usuario_creador?.nombre}</span>
              </div>
              <div className={style.detalleItem}>
                <span className={style.detalleLabel}>Correo:</span>
                <span className={style.detalleValue}>{ticket.usuario_creador?.correo}</span>
              </div>
              <div className={style.detalleItem}>
                <span className={style.detalleLabel}>Creado:</span>
                <span className={style.detalleValue}>{formatearFecha(ticket.fecha_creacion)}</span>
              </div>
              <div className={style.detalleItem}>
                <span className={style.detalleLabel}>Asignado:</span>
                <span className={style.detalleValue}>{formatearFecha(ticket.fecha_asignacion)}</span>
              </div>
            </div>
          </div>

          {/* Panel de IA */}
          {mostrarPanelIA && (
            <div className={style.card}>
              <div className={style.iaHeader}>
                <h3>🤖 Asistente IA</h3>
                <button 
                  onClick={() => setMostrarPanelIA(false)} 
                  className={style.btnCerrar}
                >
                  ✕
                </button>
              </div>

              {cargandoIA ? (
                <div className={style.iaLoading}>
                  <div className={style.spinner}></div>
                  <p>{mensajeCarga || 'Analizando ticket...'}</p>
                </div>
              ) : respuestaIA?.error ? (
                <div className={style.iaError}>
                  <p>❌ {respuestaIA.error}</p>
                </div>
              ) : respuestaIA?.respuesta ? (
                <>
                  <div className={style.iaRespuesta}>
                    <div className={style.iaTexto}>{respuestaIA.respuesta}</div>
                  </div>

                  {respuestaIA.desde_cache && (
                    <p className={style.iaCache}>📦 Respuesta desde caché</p>
                  )}

                  <div className={style.iaAcciones}>
                    <button 
                      onClick={aplicarSugerenciaIA}
                      className={style.btnAplicar}
                    >
                      📋 Copiar a Solución
                    </button>
                    <button 
                      onClick={regenerarAyudaIA}
                      className={style.btnRegenerar}
                    >
                      🔄 Regenerar
                    </button>
                  </div>
                  {!feedbackEnviado ? (
                    <div className={style.iaFeedback}>
                      <p>¿Te fue útil esta sugerencia?</p>
                      <div className={style.feedbackBotones}>
                        <button 
                          onClick={() => enviarFeedbackIA(true)}
                          className={style.btnFeedbackSi}
                        >
                          👍 Sí
                        </button>
                        <button 
                          onClick={() => enviarFeedbackIA(false)}
                          className={style.btnFeedbackNo}
                        >
                          👎 No
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={style.feedbackGracias}>✅ ¡Gracias por tu feedback!</p>
                  )}

                  {/* Tickets similares */}
                  {ticketsSimilares.length > 0 && (
                    <div className={style.ticketsSimilares}>
                      <h4>📁 Tickets similares resueltos:</h4>
                      {ticketsSimilares.slice(0, 3).map((t) => (
                        <div key={t.id_ticket} className={style.ticketSimilar}>
                          <strong>#{t.id_ticket}</strong> - {t.titulo}
                          <p className={style.solucionSimilar}>{t.solucion}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}

          {/* Historial */}
          <div className={style.card}>
            <h3>Historial de Cambios</h3>
            {historial.length > 0 ? (
              <div className={style.timeline}>
                {historial.map((item) => (
                  <div key={item.id_historial} className={style.timelineItem}>
                    <div className={style.timelineDot}></div>
                    <div className={style.timelineContent}>
                      <p className={style.timelineFecha}>{formatearFecha(item.fecha_cambio)}</p>
                      <p className={style.timelineAccion}>
                        {item.estado_anterior && <span>{item.estado_anterior} → </span>}
                        <strong>{item.estado_nuevo}</strong>
                      </p>
                      {item.comentario && (
                        <p className={style.timelineComentario}>{item.comentario}</p>
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

        {/* Columna derecha - Acciones */}
        <div className={style.accionesColumn}>
          {/* Solución */}
          <div className={style.card}>
            <h3>💡 Solución</h3>
            
            {isResuelto ? (
              <div className={style.solucionFinal}>
                <p>{ticket.solucion || 'Sin solución registrada'}</p>
              </div>
            ) : (
              <>
                <textarea
                  value={solucion}
                  onChange={(e) => setSolucion(e.target.value)}
                  placeholder="Describe la solución aplicada al problema..."
                  className={style.textarea}
                  rows={6}
                />
                <p className={style.hint}>
                  Mínimo 10 caracteres para marcar como resuelto
                </p>
              </>
            )}
          </div>

          {/* Botones de acción */}
          {!isResuelto && (
            <div className={style.card}>
              <h3>Acciones</h3>
              <div className={style.botonesAccion}>
                <button 
                  onClick={guardarSolucion}
                  disabled={guardando}
                  className={style.btnGuardar}
                >
                  {guardando ? 'Guardando...' : '💾 Guardar Solución'}
                </button>
                <button 
                  onClick={marcarResuelto}
                  disabled={guardando || solucion.trim().length < 10}
                  className={style.btnResolver}
                >
                  {guardando ? 'Procesando...' : '✅ Marcar como Resuelto'}
                </button>
                <button 
                  onClick={solicitarAyudaIA}
                  disabled={cargandoIA}
                  className={style.btnIA}
                >
                  {cargandoIA ? '⏳ Consultando...' : '🤖 Ayuda IA'}
                </button>
                {consultasRestantes !== null && (
                  <p className={style.consultasRestantes}>
                    Consultas restantes hoy: {consultasRestantes}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Mensaje si está resuelto */}
          {isResuelto && (
            <div className={style.cardResuelto}>
              <div className={style.iconoResuelto}>✅</div>
              <h3>Ticket {ticket.estado}</h3>
              <p>Este ticket ya ha sido completado</p>
              {ticket.fecha_resolucion && (
                <p className={style.fechaResolucion}>
                  Resuelto el: {formatearFecha(ticket.fecha_resolucion)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetalle;