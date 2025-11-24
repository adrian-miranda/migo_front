/**
 * Panel de IA para Administrador
 * Muestra métricas, análisis de patrones e insights
 */
import React, { useState, useEffect } from 'react';
import iaService from '../../../../api/iaService';
import style from './PanelIA.module.css';

const PanelIA = () => {
  const [activeTab, setActiveTab] = useState('metricas');
  const [metricas, setMetricas] = useState([]);
  const [insights, setInsights] = useState(null);
  const [analisis, setAnalisis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filtros para métricas
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroOrden, setFiltroOrden] = useState('tasa_resolucion_desc');
  const [filtroTecnico, setFiltroTecnico] = useState('');
  const [filtroTiempoMetricas, setFiltroTiempoMetricas] = useState('todos');

  // Filtros para análisis
  const [diasAnalisis, setDiasAnalisis] = useState(30);
  const [categoriaAnalisis, setCategoriaAnalisis] = useState('');
  const [prioridadAnalisis, setPrioridadAnalisis] = useState('');

  // Filtros para alertas
  const [filtroTiempoAlertas, setFiltroTiempoAlertas] = useState('todos');
  const [filtroCategoriaAlertas, setFiltroCategoriaAlertas] = useState('');

  // Categorías y prioridades disponibles
  const categorias = ['Hardware', 'Software', 'Red', 'Impresoras', 'Otro'];
  const prioridades = ['Baja', 'Media', 'Alta', 'Urgente'];
  const opcionesTiempo = [
    { value: 'hoy', label: 'Hoy' },
    { value: '7', label: 'Últimos 7 días' },
    { value: '15', label: 'Últimos 15 días' },
    { value: '30', label: 'Últimos 30 días' },
    { value: 'todos', label: 'Todo el tiempo' }
  ];

  // Lista de técnicos únicos
  const tecnicosUnicos = [...new Set(metricas.map(m => m.tecnico_nombre))];

  useEffect(() => {
    cargarMetricas();
    cargarInsights();
  }, []);

  const cargarMetricas = async () => {
    try {
      const data = await iaService.getMetricasTecnicos();
      setMetricas(data);
    } catch (err) {
      console.error('Error al cargar métricas:', err);
    }
  };

  const cargarInsights = async () => {
    try {
      const data = await iaService.getInsightsCapacitacion();
      setInsights(data);
    } catch (err) {
      console.error('Error al cargar insights:', err);
    }
  };

  const analizarPatrones = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await iaService.analizarPatrones(diasAnalisis, categoriaAnalisis, prioridadAnalisis);
      if (data.success) {
        setAnalisis(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Error al analizar patrones:', err);
      setError('Error al conectar con el servicio de IA');
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltrosMetricas = () => {
    setFiltroCategoria('');
    setFiltroOrden('tasa_resolucion_desc');
    setFiltroTecnico('');
    setFiltroTiempoMetricas('todos');
  };

  const limpiarFiltrosAnalisis = () => {
    setDiasAnalisis(30);
    setCategoriaAnalisis('');
    setPrioridadAnalisis('');
  };

  const limpiarFiltrosAlertas = () => {
    setFiltroTiempoAlertas('todos');
    setFiltroCategoriaAlertas('');
  };

  // Función para filtrar por tiempo
  const filtrarPorTiempo = (fechaCalculo, filtroTiempo) => {
    if (filtroTiempo === 'todos') return true;
    
    const fecha = new Date(fechaCalculo);
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    
    if (filtroTiempo === 'hoy') {
      return fecha >= hoy;
    }
    
    const diasAtras = parseInt(filtroTiempo);
    const fechaLimite = new Date(ahora.getTime() - (diasAtras * 24 * 60 * 60 * 1000));
    return fecha >= fechaLimite;
  };

  // Filtrar y ordenar métricas
  const metricasFiltradas = metricas
    .filter(m => !filtroCategoria || m.categoria_nombre === filtroCategoria)
    .filter(m => !filtroTecnico || m.tecnico_nombre === filtroTecnico)
    .filter(m => filtrarPorTiempo(m.fecha_calculo, filtroTiempoMetricas))
    .sort((a, b) => {
      switch (filtroOrden) {
        case 'tasa_resolucion_desc':
          return parseFloat(b.tasa_resolucion) - parseFloat(a.tasa_resolucion);
        case 'tasa_resolucion_asc':
          return parseFloat(a.tasa_resolucion) - parseFloat(b.tasa_resolucion);
        case 'tiempo_promedio_asc':
          return parseFloat(a.tiempo_promedio_resolucion) - parseFloat(b.tiempo_promedio_resolucion);
        case 'tiempo_promedio_desc':
          return parseFloat(b.tiempo_promedio_resolucion) - parseFloat(a.tiempo_promedio_resolucion);
        case 'tickets_resueltos_desc':
          return b.tickets_resueltos - a.tickets_resueltos;
        case 'tickets_resueltos_asc':
          return a.tickets_resueltos - b.tickets_resueltos;
        case 'feedback_desc':
          return parseFloat(b.tasa_feedback_positivo) - parseFloat(a.tasa_feedback_positivo);
        case 'feedback_asc':
          return parseFloat(a.tasa_feedback_positivo) - parseFloat(b.tasa_feedback_positivo);
        default:
          return 0;
      }
    });

  // Técnicos que necesitan capacitación (tasa < 80%) con filtros
  const tecnicosNecesitanCapacitacion = metricas
    .filter(m => parseFloat(m.tasa_resolucion) < 80)
    .filter(m => !filtroCategoriaAlertas || m.categoria_nombre === filtroCategoriaAlertas)
    .filter(m => filtrarPorTiempo(m.fecha_calculo, filtroTiempoAlertas))
    .sort((a, b) => parseFloat(a.tasa_resolucion) - parseFloat(b.tasa_resolucion));

  const renderMetricas = () => (
    <div className={style.metricasContainer}>
      <div className={style.seccionHeader}>
        <div>
          <h3>📊 Rendimiento de Técnicos por Categoría</h3>
          <p className={style.seccionDesc}>
            Métricas de desempeño de cada técnico según la categoría de tickets que atienden
          </p>
        </div>
      </div>

      <div className={style.filtrosBar}>
        <div className={style.filtroGroup}>
          <label>Período:</label>
          <select 
            value={filtroTiempoMetricas} 
            onChange={(e) => setFiltroTiempoMetricas(e.target.value)}
            className={style.filtroSelect}
          >
            {opcionesTiempo.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className={style.filtroGroup}>
          <label>Técnico:</label>
          <select 
            value={filtroTecnico} 
            onChange={(e) => setFiltroTecnico(e.target.value)}
            className={style.filtroSelect}
          >
            <option value="">Todos</option>
            {tecnicosUnicos.map(tec => (
              <option key={tec} value={tec}>{tec}</option>
            ))}
          </select>
        </div>

        <div className={style.filtroGroup}>
          <label>Categoría:</label>
          <select 
            value={filtroCategoria} 
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className={style.filtroSelect}
          >
            <option value="">Todas</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className={style.filtroGroup}>
          <label>Ordenar por:</label>
          <select 
            value={filtroOrden} 
            onChange={(e) => setFiltroOrden(e.target.value)}
            className={style.filtroSelect}
          >
            <optgroup label="Tasa de Resolución">
              <option value="tasa_resolucion_desc">Mayor tasa de resolución</option>
              <option value="tasa_resolucion_asc">Menor tasa de resolución</option>
            </optgroup>
            <optgroup label="Tiempo Promedio">
              <option value="tiempo_promedio_asc">Menor tiempo promedio</option>
              <option value="tiempo_promedio_desc">Mayor tiempo promedio</option>
            </optgroup>
            <optgroup label="Tickets Resueltos">
              <option value="tickets_resueltos_desc">Más tickets resueltos</option>
              <option value="tickets_resueltos_asc">Menos tickets resueltos</option>
            </optgroup>
            <optgroup label="Feedback">
              <option value="feedback_desc">Mejor feedback</option>
              <option value="feedback_asc">Peor feedback</option>
            </optgroup>
          </select>
        </div>

        <button onClick={limpiarFiltrosMetricas} className={style.btnLimpiar}>
          🗑️ Limpiar
        </button>
      </div>

      <p className={style.resultCount}>
        Mostrando {metricasFiltradas.length} de {metricas.length} registros
      </p>

      {metricasFiltradas.length === 0 ? (
        <p className={style.noData}>No hay métricas disponibles para los filtros seleccionados</p>
      ) : (
        <div className={style.metricasGrid}>
          {metricasFiltradas.map((m) => (
            <div key={m.id_metrica} className={style.metricaCard}>
              <div className={style.metricaHeader}>
                <span className={style.tecnicoNombre}>{m.tecnico_nombre}</span>
                <span className={style.categoriaBadge}>{m.categoria_nombre}</span>
              </div>
              <div className={style.metricaStats}>
                <div className={style.stat}>
                  <span className={style.statLabel}>Resueltos</span>
                  <span className={style.statValue}>{m.tickets_resueltos}/{m.tickets_totales}</span>
                </div>
                <div className={style.stat}>
                  <span className={style.statLabel}>Tasa Resolución</span>
                  <span className={`${style.statValue} ${parseFloat(m.tasa_resolucion) < 80 ? style.statWarning : ''}`}>
                    {parseFloat(m.tasa_resolucion).toFixed(1)}%
                  </span>
                </div>
                <div className={style.stat}>
                  <span className={style.statLabel}>Tiempo Prom.</span>
                  <span className={style.statValue}>{parseFloat(m.tiempo_promedio_resolucion).toFixed(1)}h</span>
                </div>
                <div className={style.stat}>
                  <span className={style.statLabel}>Feedback +</span>
                  <span className={`${style.statValue} ${parseFloat(m.tasa_feedback_positivo) < 70 ? style.statWarning : ''}`}>
                    {parseFloat(m.tasa_feedback_positivo).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className={style.progressBar}>
                <div 
                  className={`${style.progressFill} ${parseFloat(m.tasa_resolucion) < 80 ? style.progressWarning : ''}`}
                  style={{ width: `${m.tasa_resolucion}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAnalisis = () => (
    <div className={style.analisisContainer}>
      <div className={style.seccionHeader}>
        <div>
          <h3>🤖 Análisis de Patrones con IA</h3>
          <p className={style.seccionDesc}>
            La inteligencia artificial analiza tendencias, detecta problemas y sugiere mejoras
          </p>
        </div>
      </div>

      <div className={style.filtrosBar}>
        <div className={style.filtroGroup}>
          <label>Período:</label>
          <select 
            value={diasAnalisis} 
            onChange={(e) => setDiasAnalisis(parseInt(e.target.value))}
            className={style.filtroSelect}
          >
            <option value={1}>Hoy</option>
            <option value={7}>Últimos 7 días</option>
            <option value={15}>Últimos 15 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={60}>Últimos 60 días</option>
            <option value={90}>Últimos 90 días</option>
          </select>
        </div>

        <div className={style.filtroGroup}>
          <label>Categoría:</label>
          <select 
            value={categoriaAnalisis} 
            onChange={(e) => setCategoriaAnalisis(e.target.value)}
            className={style.filtroSelect}
          >
            <option value="">Todas</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className={style.filtroGroup}>
          <label>Prioridad:</label>
          <select 
            value={prioridadAnalisis} 
            onChange={(e) => setPrioridadAnalisis(e.target.value)}
            className={style.filtroSelect}
          >
            <option value="">Todas</option>
            {prioridades.map(pri => (
              <option key={pri} value={pri}>{pri}</option>
            ))}
          </select>
        </div>

        <button onClick={limpiarFiltrosAnalisis} className={style.btnLimpiar}>
          🗑️ Limpiar
        </button>

        <button 
          onClick={analizarPatrones} 
          disabled={loading}
          className={style.btnAnalizar}
        >
          {loading ? '⏳ Analizando...' : '🔍 Ejecutar Análisis'}
        </button>
      </div>

      {error && (
        <div className={style.errorMsg}>
          <p>❌ {error}</p>
        </div>
      )}

      {loading && (
        <div className={style.loadingIA}>
          <div className={style.spinner}></div>
          <p>Analizando patrones con inteligencia artificial...</p>
        </div>
      )}

      {analisis && !loading && (
        <div className={style.analisisResultado}>
          <div className={style.estadisticasResumen}>
            <div className={style.statCard}>
              <span className={style.statIcon}>📋</span>
              <span className={style.statNum}>{analisis.estadisticas.total_tickets}</span>
              <span className={style.statDesc}>Total Tickets</span>
            </div>
            <div className={style.statCard}>
              <span className={style.statIcon}>⏳</span>
              <span className={style.statNum}>{analisis.estadisticas.sin_resolver}</span>
              <span className={style.statDesc}>Sin Resolver</span>
            </div>
            <div className={style.statCard}>
              <span className={style.statIcon}>✅</span>
              <span className={style.statNum}>{analisis.estadisticas.tasa_resolucion}%</span>
              <span className={style.statDesc}>Tasa Resolución</span>
            </div>
          </div>

          <div className={style.iaRespuesta}>
            <h4>💡 Análisis de la IA:</h4>
            <div className={style.iaTexto}>{analisis.respuesta}</div>
          </div>
        </div>
      )}

      {!analisis && !loading && !error && (
        <div className={style.noAnalisis}>
          <span className={style.noAnalisisIcon}>🔍</span>
          <p>Configura los filtros y presiona "Ejecutar Análisis" para obtener insights de la IA</p>
        </div>
      )}
    </div>
  );

  const renderInsights = () => (
    <div className={style.insightsContainer}>
      <div className={style.seccionHeader}>
        <div>
          <h3>🎯 Alertas y Recomendaciones</h3>
          <p className={style.seccionDesc}>
            Identificación de áreas de mejora y técnicos que necesitan apoyo
          </p>
        </div>
      </div>

      <div className={style.filtrosBar}>
        <div className={style.filtroGroup}>
          <label>Período:</label>
          <select 
            value={filtroTiempoAlertas} 
            onChange={(e) => setFiltroTiempoAlertas(e.target.value)}
            className={style.filtroSelect}
          >
            {opcionesTiempo.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className={style.filtroGroup}>
          <label>Categoría:</label>
          <select 
            value={filtroCategoriaAlertas} 
            onChange={(e) => setFiltroCategoriaAlertas(e.target.value)}
            className={style.filtroSelect}
          >
            <option value="">Todas</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <button onClick={limpiarFiltrosAlertas} className={style.btnLimpiar}>
          🗑️ Limpiar
        </button>
      </div>

      {insights ? (
        <div className={style.insightsGrid}>
          {/* Técnicos que necesitan capacitación basado en métricas */}
          {tecnicosNecesitanCapacitacion.length > 0 && (
            <div className={style.insightSection}>
              <h4>📚 Técnicos que necesitan capacitación</h4>
              <p className={style.insightSubtitle}>Basado en tasa de resolución menor al 80%</p>
              <div className={style.cardsGrid}>
                {tecnicosNecesitanCapacitacion.map((m, idx) => (
                  <div key={idx} className={`${style.insightCard} ${style.cardWarning}`}>
                    <div className={style.cardIcon}>👤</div>
                    <div className={style.cardBody}>
                      <h5>{m.tecnico_nombre}</h5>
                      <p className={style.cardCategoria}>Categoría: {m.categoria_nombre}</p>
                      <div className={style.cardStats}>
                        <span>📊 Tasa: {parseFloat(m.tasa_resolucion).toFixed(1)}%</span>
                        <span>🎫 Tickets: {m.tickets_resueltos}/{m.tickets_totales}</span>
                      </div>
                      <p className={style.cardProblema}>
                        Solo resuelve el {parseFloat(m.tasa_resolucion).toFixed(1)}% de sus tickets asignados en {m.categoria_nombre}
                      </p>
                      <span className={style.cardRecomendacion}>
                        💡 Reforzar conocimientos en {m.categoria_nombre}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Capacitaciones Sugeridas por el sistema */}
          {insights.capacitaciones_sugeridas && insights.capacitaciones_sugeridas.length > 0 && (
            <div className={style.insightSection}>
              <h4>🔔 Alertas del Sistema</h4>
              <div className={style.cardsGrid}>
                {insights.capacitaciones_sugeridas
                  .filter(c => !filtroCategoriaAlertas || c.categoria === filtroCategoriaAlertas)
                  .map((c, idx) => (
                  <div key={idx} className={style.insightCard}>
                    <div className={style.cardIcon}>⚠️</div>
                    <div className={style.cardBody}>
                      <h5>{c.tecnico_nombre}</h5>
                      <p className={style.cardCategoria}>Categoría: {c.categoria}</p>
                      <p className={style.cardProblema}>{c.sugerencia}</p>
                      <div className={style.cardStats}>
                        <span>📊 Tasa: {c.tasa_resolucion}%</span>
                        <span>🎫 Tickets: {c.tickets_totales}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categorías Problemáticas */}
          {insights.categorias_problematicas && insights.categorias_problematicas.length > 0 && (
            <div className={style.insightSection}>
              <h4>⚠️ Categorías con acumulación de tickets</h4>
              <div className={style.cardsGrid}>
                {insights.categorias_problematicas
                  .filter(c => !filtroCategoriaAlertas || c.categoria_id__nombre_categoria === filtroCategoriaAlertas)
                  .map((c, idx) => (
                  <div key={idx} className={`${style.insightCard} ${style.cardDanger}`}>
                    <div className={style.cardIcon}>📁</div>
                    <div className={style.cardBody}>
                      <h5>{c.categoria_id__nombre_categoria}</h5>
                      <p className={style.cardProblema}>
                        <strong>{c.sin_resolver}</strong> tickets sin resolver
                      </p>
                      <span className={style.cardRecomendacion}>
                        💡 Considerar asignar más técnicos a esta área
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback Negativo */}
          {insights.tecnicos_con_feedback_negativo && insights.tecnicos_con_feedback_negativo.length > 0 && (
            <div className={style.insightSection}>
              <h4>👎 Técnicos con feedback negativo frecuente</h4>
              <div className={style.cardsGrid}>
                {insights.tecnicos_con_feedback_negativo.map((t, idx) => {
                  const tecnico = metricas.find(m => m.tecnico === t.tecnico_id);
                  const nombreTecnico = tecnico ? tecnico.tecnico_nombre : `Técnico #${t.tecnico_id}`;
                  return (
                    <div key={idx} className={`${style.insightCard} ${style.cardDanger}`}>
                      <div className={style.cardIcon}>⚡</div>
                      <div className={style.cardBody}>
                        <h5>{nombreTecnico}</h5>
                        <p className={style.cardProblema}>
                          {t.total_negativo} respuestas de IA marcadas como no útiles
                        </p>
                        <span className={style.cardRecomendacion}>
                          💡 Revisar casos y brindar acompañamiento personalizado
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sin alertas */}
          {tecnicosNecesitanCapacitacion.length === 0 &&
           (!insights.capacitaciones_sugeridas || insights.capacitaciones_sugeridas.length === 0) && 
           (!insights.categorias_problematicas || insights.categorias_problematicas.length === 0) && 
           (!insights.tecnicos_con_feedback_negativo || insights.tecnicos_con_feedback_negativo.length === 0) && (
            <div className={style.noAlertas}>
              <span className={style.noAlertasIcon}>✅</span>
              <h4>Todo en orden</h4>
              <p>No se detectaron alertas ni recomendaciones en este momento</p>
            </div>
          )}
        </div>
      ) : (
        <div className={style.loadingIA}>
          <div className={style.spinner}></div>
          <p>Cargando insights...</p>
        </div>
      )}
    </div>
  );

  return (
    <div className={style.container}>
      <div className={style.tabs}>
        <button 
          className={`${style.tab} ${activeTab === 'metricas' ? style.tabActive : ''}`}
          onClick={() => setActiveTab('metricas')}
        >
          📊 Métricas
        </button>
        <button 
          className={`${style.tab} ${activeTab === 'analisis' ? style.tabActive : ''}`}
          onClick={() => setActiveTab('analisis')}
        >
          🤖 Análisis IA
        </button>
        <button 
          className={`${style.tab} ${activeTab === 'insights' ? style.tabActive : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          🎯 Alertas
        </button>
      </div>

      <div className={style.tabContent}>
        {activeTab === 'metricas' && renderMetricas()}
        {activeTab === 'analisis' && renderAnalisis()}
        {activeTab === 'insights' && renderInsights()}
      </div>
    </div>
  );
};

export default PanelIA;