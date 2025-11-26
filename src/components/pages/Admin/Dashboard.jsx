/**
 * Dashboard del Administrador
 * Muestra estadísticas generales, gráficos y lista de tickets
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ticketsService } from '../../../api/ticketsService';
import StatsCard from '../../molecules/StatsCard/StatsCard';
import EstadosChart from '../../molecules/Charts/EstadosChart';
import PrioridadesChart from '../../molecules/Charts/PrioridadesChart';
import CategoriasChart from '../../molecules/Charts/CategoriasChart';
import TicketsTable from '../../molecules/TicketsTable/TicketsTable';
import SatisfaccionChart from '../../molecules/Charts/SatisfaccionChart';
import PanelIA from './IA/PanelIA';
import style from './Dashboard.module.css';

const AdminDashboard = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar estadísticas y tickets en paralelo
      const [statsResponse, ticketsResponse] = await Promise.all([
        ticketsService.getEstadisticas(),
        ticketsService.listarTickets(),
      ]);

      if (statsResponse.success) {
        setEstadisticas(statsResponse.estadisticas);
      }

      if (ticketsResponse.success) {
        setTickets(ticketsResponse.tickets);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos del dashboard');
      setLoading(false);
    }
  };

  const cargarTickets = useCallback(async () => {
    try {
      const filtros = {};
      if (filtroEstado) {
        filtros.estado = filtroEstado;
      }

      const response = await ticketsService.listarTickets(filtros);

      if (response.success) {
        setTickets(response.tickets);
      }
    } catch (err) {
      console.error('Error al cargar tickets:', err);
    }
  }, [filtroEstado]);

  // Recargar tickets cuando cambia el filtro
  useEffect(() => {
    if (!loading) {
      cargarTickets();
    }
  }, [loading, cargarTickets]);

  const handleRefresh = () => {
    cargarDatos();
  };

  if (loading) {
    return (
      <div className={style.loadingContainer}>
        <div className={style.spinner}></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={style.errorContainer}>
        <p>{error}</p>
        <button onClick={handleRefresh} className={style.btnRetry}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={style.dashboard}>
      {/* Header */}
      <div className={style.header}>
        <div>
          <h1 className={style.title}>Dashboard de Administrador</h1>
          <p className={style.subtitle}>
            Bienvenido, {usuario?.persona?.nombre_completo}
          </p>
        </div>
        <button onClick={handleRefresh} className={style.btnRefresh}>
          🔄 Actualizar
        </button>
      </div>

      {/* Tarjetas de estadísticas */}
      
      {estadisticas && (
        <div className={style.statsGrid}>
          <StatsCard
            title="Total de Tickets"
            value={estadisticas.total}
            icon="📋"
            color="#667eea"
            subtitle="Todos los tickets del sistema"
          />
          <StatsCard
            title="Tickets Abiertos"
            value={estadisticas.por_estado.abiertos}
            icon="🆕"
            color="#3498db"
            subtitle="Pendientes de asignación"
          />
          <StatsCard
            title="En Proceso"
            value={estadisticas.por_estado.en_proceso}
            icon="⚙️"
            color="#f39c12"
            subtitle="Siendo atendidos"
          />
          <StatsCard
            title="Completados"
            value={(estadisticas.por_estado.resueltos || 0) + (estadisticas.por_estado.cerrados || 0)}
            icon="✅"
            color="#2ecc71"
            subtitle={`Resueltos sin calificar (${estadisticas.por_estado.resueltos || 0}) + Cerrados calificados (${estadisticas.por_estado.cerrados || 0})`}
          />
          <StatsCard
            title="Cancelados"
            value={estadisticas.por_estado.cancelados || 0}
            icon="🚫"
            color="#e74c3c"
            subtitle="Tickets no completados"
          />
        </div>
      )}

      {/* Gráficos */}
      {/* Gráficos */}
      {estadisticas && (
        <div className={style.chartsGrid}>
          <div className={style.chartItem}>
            <EstadosChart estadisticas={estadisticas} />
          </div>
          <div className={style.chartItem}>
            <PrioridadesChart estadisticas={estadisticas} />
          </div>
          <div className={style.chartItem}>
            <CategoriasChart estadisticas={estadisticas} />
          </div>
        </div>
      )}

      {/* Gráfico de Satisfacción */}
      {estadisticas && (
        <div className={style.satisfaccionSection}>
          <SatisfaccionChart estadisticas={estadisticas} />
        </div>
      )}

      {/* Tabla de tickets */}
      <div className={style.ticketsSection}>
        <div className={style.ticketsSectionHeader}>
          <h2 className={style.sectionTitle}>Tickets Recientes</h2>
          <div className={style.filters}>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className={style.filterSelect}
            >
              <option value="">Todos los estados</option>
              <option value="1">Abiertos</option>
              <option value="2">En Proceso</option>
              <option value="3">Resueltos</option>
              <option value="4">Cerrados</option>
            </select>
          </div>
        </div>
        <TicketsTable tickets={tickets} loading={false} />
      </div>

      {/* Panel de IA */}
      <div className={style.iaSection}>
        <h2 className={style.sectionTitle}>🤖 Inteligencia Artificial</h2>
        <PanelIA />
      </div>

      {/* Panel de Reclamos */}
      <div className={style.reclamosSection}>
        <h2 className={style.sectionTitle}>📢 Sistema de Reclamos</h2>
        <p className={style.reclamosDescripcion}>
          Gestiona y responde los reclamos de usuarios sobre tickets y técnicos
        </p>
        <button 
          className={style.btnVerReclamos}
          onClick={() => navigate('/admin/reclamos')}
        >
          Ver Panel de Reclamos →
        </button>
      </div>

      {/* Resumen por categoría */}
      {estadisticas && (
        <div className={style.summarySection}>
          <h2 className={style.sectionTitle}>Resumen por Categoría</h2>
          <div className={style.categoryCards}>
            {Object.entries(estadisticas.por_categoria).map(
              ([categoria, cantidad]) => (
                <div key={categoria} className={style.categoryCard}>
                  <div className={style.categoryIcon}>
                    {getCategoryIcon(categoria)}
                  </div>
                  <div className={style.categoryInfo}>
                    <h3>{categoria}</h3>
                    <p className={style.categoryCount}>{cantidad} tickets</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Función auxiliar para iconos de categorías
const getCategoryIcon = (categoria) => {
  const icons = {
    Hardware: '💻',
    Software: '⚡',
    Red: '🌐',
    Impresoras: '🖨️',
    Otro: '📦',
  };
  return icons[categoria] || '📋';
};

export default AdminDashboard;