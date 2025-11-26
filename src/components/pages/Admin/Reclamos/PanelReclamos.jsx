import React, { useState, useEffect } from 'react';
import { reclamosService } from '../../../../api/reclamosService';
import style from './PanelReclamos.module.css';

const PanelReclamos = () => {
  const [reclamos, setReclamos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reclamoSeleccionado, setReclamoSeleccionado] = useState(null);
  const [respuesta, setRespuesta] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [reclamosRes, statsRes] = await Promise.all([
        reclamosService.listarReclamos(),
        reclamosService.getEstadisticas()
      ]);

      if (reclamosRes.success) setReclamos(reclamosRes.reclamos);
      if (statsRes.success) setEstadisticas(statsRes.estadisticas);
      
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleResponder = async (id) => {
    try {
      const userData = JSON.parse(localStorage.getItem('migo_usuario'));
      
      const response = await reclamosService.actualizarReclamo(id, {
        admin_id: userData.id_usuarios,
        estado: 'resuelto',
        respuesta_admin: respuesta
      });

      if (response.success) {
        alert('Reclamo resuelto');
        setReclamoSeleccionado(null);
        setRespuesta('');
        cargarDatos();
      }
    } catch (error) {
      alert('Error al responder reclamo');
    }
  };

  if (loading) return <div className={style.loading}>Cargando...</div>;

  return (
    <div className={style.container}>
      <h1>📢 Panel de Reclamos</h1>

      {/* Estadísticas */}
      {estadisticas && (
        <div className={style.statsGrid}>
          <div className={style.statCard}>
            <h3>{estadisticas.total}</h3>
            <p>Total</p>
          </div>
          <div className={style.statCard}>
            <h3>{estadisticas.pendientes}</h3>
            <p>Pendientes</p>
          </div>
          <div className={style.statCard}>
            <h3>{estadisticas.resueltos}</h3>
            <p>Resueltos</p>
          </div>
        </div>
      )}

      {/* Lista de Reclamos */}
      <div className={style.reclamosList}>
        {reclamos.map((reclamo) => (
          <div key={reclamo.id_reclamo} className={style.reclamoCard}>
            <div className={style.reclamoHeader}>
              <span className={style.reclamoId}>#{reclamo.id_reclamo}</span>
              <span className={`${style.badge} ${style[reclamo.estado]}`}>
                {reclamo.estado_label}
              </span>
            </div>

            <h3>Ticket #{reclamo.ticket_id_value}: {reclamo.ticket_titulo}</h3>
            
            <div className={style.info}>
              <p><strong>Técnico:</strong> {reclamo.tecnico_nombre}</p>
              <p><strong>Usuario:</strong> {reclamo.usuario_nombre}</p>
              <p><strong>Categoría:</strong> {reclamo.categoria_label}</p>
              <p><strong>Prioridad:</strong> {reclamo.prioridad_label}</p>
            </div>

            {reclamo.estado === 'pendiente' && (
              <button 
                onClick={() => setReclamoSeleccionado(reclamo.id_reclamo)}
                className={style.btnResponder}
              >
                Responder
              </button>
            )}

            {reclamoSeleccionado === reclamo.id_reclamo && (
              <div className={style.formRespuesta}>
                <textarea
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  rows="4"
                />
                <div className={style.btnGroup}>
                  <button 
                    onClick={() => handleResponder(reclamo.id_reclamo)}
                    className={style.btnEnviar}
                  >
                    Enviar y Resolver
                  </button>
                  <button 
                    onClick={() => setReclamoSeleccionado(null)}
                    className={style.btnCancelar}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PanelReclamos;