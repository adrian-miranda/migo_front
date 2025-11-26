import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reclamosService } from '../../../api/reclamosService';
import style from './MisReclamos.module.css';

const MisReclamos = () => {
  const navigate = useNavigate();
  const [reclamos, setReclamos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarReclamos();
  }, []);

  const cargarReclamos = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('migo_usuario'));
      const response = await reclamosService.listarReclamos({
        tecnico_id: userData.id_usuarios
      });

      if (response.success) {
        setReclamos(response.reclamos);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
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

  return (
    <div className={style.container}>
      <div className={style.header}>
        <button className={style.btnBack} onClick={() => navigate('/tecnico/dashboard')}>
          ← Volver al Dashboard
        </button>
        <h1>📢 Mis Reclamos Recibidos</h1>
      </div>

      <div className={style.stats}>
        <div className={style.statCard}>
          <h3>{reclamos.length}</h3>
          <p>Total de Reclamos</p>
        </div>
        <div className={style.statCard}>
          <h3>{reclamos.filter(r => r.estado === 'pendiente').length}</h3>
          <p>Pendientes</p>
        </div>
        <div className={style.statCard}>
          <h3>{reclamos.filter(r => r.estado === 'resuelto').length}</h3>
          <p>Resueltos</p>
        </div>
      </div>

      <div className={style.reclamosList}>
        {reclamos.length === 0 ? (
          <div className={style.sinReclamos}>
            <p>✅ No tienes reclamos recibidos</p>
          </div>
        ) : (
          reclamos.map((reclamo) => (
            <div key={reclamo.id_reclamo} className={style.reclamoCard}>
              <div className={style.reclamoHeader}>
                <div className={style.headerLeft}>
                  <span className={style.reclamoId}>Reclamo #{reclamo.id_reclamo}</span>
                  <span className={style.ticketId}>Ticket #{reclamo.ticket_id_value}</span>
                </div>
                <span className={`${style.badge} ${style[reclamo.estado]}`}>
                  {reclamo.estado_label}
                </span>
              </div>

              <h3>{reclamo.ticket_titulo}</h3>

              <div className={style.reclamoInfo}>
                <div className={style.infoRow}>
                  <span className={style.label}>Usuario:</span>
                  <span className={style.value}>{reclamo.usuario_nombre}</span>
                </div>
                <div className={style.infoRow}>
                  <span className={style.label}>Categoría:</span>
                  <span className={style.value}>{reclamo.categoria_label}</span>
                </div>
                <div className={style.infoRow}>
                  <span className={style.label}>Prioridad:</span>
                  <span className={`${style.prioridad} ${style[reclamo.prioridad]}`}>
                    {reclamo.prioridad_label}
                  </span>
                </div>
                <div className={style.infoRow}>
                  <span className={style.label}>Fecha:</span>
                  <span className={style.value}>{formatearFecha(reclamo.fecha_creacion)}</span>
                </div>
              </div>
              <div className={style.descripcionReclamo}>
                <span className={style.label}>Descripción:</span>
                <p className={style.descripcionTexto}>{reclamo.descripcion}</p>
            </div>

              {reclamo.estado === 'resuelto' && reclamo.fecha_resolucion && (
                <div className={style.resolucion}>
                  <p className={style.resolucionLabel}>✅ Resuelto por administración el: {formatearFecha(reclamo.fecha_resolucion)}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MisReclamos;