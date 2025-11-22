/**
 * Vista de Técnicos para Administrador
 * Muestra listado de técnicos con sus métricas de desempeño
 */
import React, { useState, useEffect } from 'react';
import { authService } from '../../../../api/authService';
import { ticketsService } from '../../../../api/ticketsService';
import TecnicoDetail from './TecnicoDetail';
import style from './TecnicosList.module.css';

const TecnicosList = () => {
  const [tecnicos, setTecnicos] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const [tecnicosRes, ticketsRes] = await Promise.all([
        authService.listarTodosTecnicos(),
        ticketsService.listarTickets()
      ]);

      if (tecnicosRes.success && ticketsRes.success) {
        setTecnicos(tecnicosRes.tecnicos || []);
        setTickets(ticketsRes.tickets || []);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los técnicos');
    } finally {
      setLoading(false);
    }
  };

  // Calcular métricas del técnico
  const calcularMetricas = (tecnicoId) => {
    const ticketsTecnico = tickets.filter(
      t => t.tecnico_asignado?.id === tecnicoId
    );

    const ticketsActivos = ticketsTecnico.filter(
      t => t.estado === 'Abierto' || t.estado === 'En Proceso'
    ).length;

    const ticketsResueltos = ticketsTecnico.filter(
      t => t.estado === 'Resuelto' || t.estado === 'Cerrado'
    ).length;

    // Calcular tiempo promedio de resolución (solo tickets resueltos con fecha)
    const ticketsConTiempo = ticketsTecnico.filter(
      t => t.fecha_resolucion && t.fecha_creacion
    );

    let tiempoPromedio = 0;
    if (ticketsConTiempo.length > 0) {
      const tiempoTotal = ticketsConTiempo.reduce((acc, ticket) => {
        const creacion = new Date(ticket.fecha_creacion);
        const resolucion = new Date(ticket.fecha_resolucion);
        const diferencia = (resolucion - creacion) / (1000 * 60 * 60); // horas
        return acc + diferencia;
      }, 0);
      tiempoPromedio = (tiempoTotal / ticketsConTiempo.length).toFixed(1);
    }

    return {
      total: ticketsTecnico.length,
      activos: ticketsActivos,
      resueltos: ticketsResueltos,
      tiempoPromedio: tiempoPromedio || 'N/A'
    };
  };

  // Filtrar técnicos por búsqueda
  const tecnicosFiltrados = tecnicos.filter(tecnico =>
    tecnico.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    tecnico.correo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Ver detalle del técnico
  const verDetalle = (tecnico) => {
    const ticketsTecnico = tickets.filter(
      t => t.tecnico_asignado?.id === tecnico.id_usuarios
    );
    const metricas = calcularMetricas(tecnico.id_usuarios);
    setTecnicoSeleccionado({ 
      ...tecnico, 
      tickets: ticketsTecnico,
      metricas: metricas
    });
  };

  // Cerrar modal de detalle
  const cerrarDetalle = () => {
    setTecnicoSeleccionado(null);
  };

  if (loading) {
    return (
      <div className={style.container}>
        <div className={style.loading}>Cargando técnicos...</div>
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
        <h1>Gestión de Técnicos</h1>
        <div className={style.stats}>
          <span className={style.statItem}>
            Total técnicos: <strong>{tecnicos.length}</strong>
          </span>
          <span className={style.statItem}>
            Disponibles: <strong>{tecnicos.filter(t => t.disponible).length}</strong>
          </span>
          <span className={style.statItem}>
            Ocupados: <strong>{tecnicos.filter(t => !t.disponible).length}</strong>
          </span>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className={style.searchBar}>
        <input
          type="text"
          placeholder="Buscar técnico por nombre o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className={style.searchInput}
        />
      </div>

      {/* Grid de técnicos */}
      <div className={style.gridContainer}>
        {tecnicosFiltrados.length === 0 ? (
          <div className={style.noResults}>
            No se encontraron técnicos
          </div>
        ) : (
          <div className={style.tecnicosGrid}>
            {tecnicosFiltrados.map((tecnico) => {
              const metricas = calcularMetricas(tecnico.id_usuarios);

              return (
                <div key={tecnico.id_usuarios} className={style.tecnicoCard}>
                  {/* Header del card */}
                  <div className={style.cardHeader}>
                    <div className={style.tecnicoInfo}>
                      <h3 className={style.tecnicoNombre}>
                        {tecnico.nombre_completo}
                      </h3>
                      <p className={style.tecnicoCorreo}>{tecnico.correo}</p>
                    </div>
                    <div className={style.estadoContainer}>
                      <span 
                        className={`${style.estadoBadge} ${
                          tecnico.disponible ? style.disponible : style.ocupado
                        }`}
                      >
                        {tecnico.disponible ? 'Disponible' : 'Ocupado'}
                      </span>
                    </div>
                  </div>

                  {/* Métricas */}
                  <div className={style.metricas}>
                    <div className={style.metricaItem}>
                      <span className={style.metricaLabel}>Total asignados</span>
                      <span className={style.metricaValor}>{metricas.total}</span>
                    </div>
                    <div className={style.metricaItem}>
                      <span className={style.metricaLabel}>Activos</span>
                      <span className={`${style.metricaValor} ${style.activos}`}>
                        {metricas.activos}
                      </span>
                    </div>
                    <div className={style.metricaItem}>
                      <span className={style.metricaLabel}>Resueltos</span>
                      <span className={`${style.metricaValor} ${style.resueltos}`}>
                        {metricas.resueltos}
                      </span>
                    </div>
                    <div className={style.metricaItem}>
                      <span className={style.metricaLabel}>Tiempo promedio</span>
                      <span className={style.metricaValor}>
                        {metricas.tiempoPromedio !== 'N/A' 
                          ? `${metricas.tiempoPromedio}h` 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  {metricas.total > 0 && (
                    <div className={style.progressContainer}>
                      <div className={style.progressLabel}>
                        <span>Tasa de resolución</span>
                        <span className={style.progressPercentage}>
                          {((metricas.resueltos / metricas.total) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className={style.progressBar}>
                        <div 
                          className={style.progressFill}
                          style={{ 
                            width: `${(metricas.resueltos / metricas.total) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Botón ver detalle */}
                  <button
                    onClick={() => verDetalle(tecnico)}
                    className={style.btnVerDetalle}
                  >
                    Ver detalle completo
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {tecnicoSeleccionado && (
        <TecnicoDetail
          tecnico={tecnicoSeleccionado}
          onClose={cerrarDetalle}
        />
      )}
    </div>
  );
};

export default TecnicosList;