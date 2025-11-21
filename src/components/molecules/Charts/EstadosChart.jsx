/**
 * Gráfico de torta para estados de tickets
 */
import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import style from './Charts.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const EstadosChart = ({ estadisticas }) => {
  if (!estadisticas?.por_estado) {
    return <div>Cargando...</div>;
  }

  const data = {
    labels: ['Abiertos', 'En Proceso', 'Resueltos', 'Cerrados'],
    datasets: [
      {
        label: 'Tickets',
        data: [
          estadisticas.por_estado.abiertos,
          estadisticas.por_estado.en_proceso,
          estadisticas.por_estado.resueltos,
          estadisticas.por_estado.cerrados,
        ],
        backgroundColor: [
          '#3498db', // Azul - Abierto
          '#f39c12', // Naranja - En Proceso
          '#2ecc71', // Verde - Resuelto
          '#95a5a6', // Gris - Cerrado
        ],
        borderColor: [
          '#2980b9',
          '#e67e22',
          '#27ae60',
          '#7f8c8d',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className={style.chartContainer}>
      <h3 className={style.chartTitle}>Tickets por Estado</h3>
      <div className={style.chartWrapper}>
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default EstadosChart;