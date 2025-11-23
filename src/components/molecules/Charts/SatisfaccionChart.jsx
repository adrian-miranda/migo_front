/**
 * Gráfico combinado para nivel de satisfacción
 * Muestra promedio general + distribución de estrellas
 */
import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';
import style from './Charts.module.css';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const SatisfaccionChart = ({ estadisticas }) => {
  if (!estadisticas?.satisfaccion) {
    return (
      <div className={style.chartContainer}>
        <h3 className={style.chartTitle}>Nivel de Satisfacción</h3>
        <div className={style.noData}>
          <p>📊 No hay calificaciones disponibles aún</p>
          <small>Las calificaciones aparecerán cuando los usuarios evalúen tickets cerrados</small>
        </div>
      </div>
    );
  }

  const { promedio, total, distribucion } = estadisticas.satisfaccion;

  // Datos para el gauge (promedio general)
  const gaugeData = {
    labels: ['Promedio', 'Restante'],
    datasets: [
      {
        data: [promedio, 5 - promedio],
        backgroundColor: [
          getColorByRating(promedio),
          '#ecf0f1'
        ],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const gaugeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  // Datos para la distribución de estrellas
  const distribucionData = {
    labels: ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'],
    datasets: [
      {
        label: 'Calificaciones',
        data: [
          distribucion['1'] || 0,
          distribucion['2'] || 0,
          distribucion['3'] || 0,
          distribucion['4'] || 0,
          distribucion['5'] || 0,
        ],
        backgroundColor: [
          '#e74c3c', // Rojo - 1 estrella
          '#e67e22', // Naranja - 2 estrellas
          '#f39c12', // Amarillo - 3 estrellas
          '#2ecc71', // Verde claro - 4 estrellas
          '#27ae60', // Verde - 5 estrellas
        ],
        borderColor: [
          '#c0392b',
          '#d35400',
          '#e67e22',
          '#27ae60',
          '#229954',
        ],
        borderWidth: 2,
      },
    ],
  };

  const distribucionOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.x || 0;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${value} calificaciones (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className={style.satisfaccionContainer}>
      <h3 className={style.chartTitle}>Calidad del Servicio</h3>
      
      <div className={style.satisfaccionGrid}>
        {/* Gauge Chart - Promedio General */}
        <div className={style.gaugeSection}>
          <div className={style.gaugeWrapper}>
            <Doughnut data={gaugeData} options={gaugeOptions} />
            <div className={style.gaugeCenter}>
              <div className={style.gaugeValue}>{promedio.toFixed(1)}</div>
              <div className={style.gaugeLabel}>/ 5.0</div>
              <div className={style.gaugeEmoji}>{getEmojiByRating(promedio)}</div>
            </div>
          </div>
          <div className={style.gaugeStats}>
            <p className={style.totalCalificaciones}>
              {total} calificación{total !== 1 ? 'es' : ''}
            </p>
            <p className={style.nivelSatisfaccion}>
              {getNivelSatisfaccion(promedio)}
            </p>
          </div>
        </div>

        {/* Distribución de Estrellas */}
        <div className={style.distribucionSection}>
          <h4 className={style.distribucionTitle}>Distribución de Calificaciones</h4>
          <div className={style.distribucionWrapper}>
            <Bar data={distribucionData} options={distribucionOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Funciones auxiliares
const getColorByRating = (rating) => {
  if (rating >= 4.5) return '#27ae60'; // Verde oscuro - Excelente
  if (rating >= 4.0) return '#2ecc71'; // Verde - Muy bueno
  if (rating >= 3.0) return '#f39c12'; // Amarillo - Bueno
  if (rating >= 2.0) return '#e67e22'; // Naranja - Regular
  return '#e74c3c'; // Rojo - Malo
};

const getEmojiByRating = (rating) => {
  if (rating >= 4.5) return '🌟';
  if (rating >= 4.0) return '😄';
  if (rating >= 3.0) return '😊';
  if (rating >= 2.0) return '😐';
  return '😞';
};

const getNivelSatisfaccion = (rating) => {
  if (rating >= 4.5) return 'Excelente';
  if (rating >= 4.0) return 'Muy Bueno';
  if (rating >= 3.0) return 'Bueno';
  if (rating >= 2.0) return 'Regular';
  return 'Necesita Mejorar';
};

export default SatisfaccionChart;