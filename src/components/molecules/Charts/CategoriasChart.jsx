/**
 * Gráfico de dona para categorías de tickets
 */
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import style from './Charts.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoriasChart = ({ estadisticas }) => {
  if (!estadisticas?.por_categoria) {
    return <div>Cargando...</div>;
  }

  const categorias = estadisticas.por_categoria;

  const data = {
    labels: Object.keys(categorias),
    datasets: [
      {
        label: 'Tickets',
        data: Object.values(categorias),
        backgroundColor: [
          '#e74c3c', // Rojo - Hardware
          '#3498db', // Azul - Software
          '#9b59b6', // Morado - Red
          '#f39c12', // Naranja - Impresoras
          '#95a5a6', // Gris - Otro
        ],
        borderColor: [
          '#c0392b',
          '#2980b9',
          '#8e44ad',
          '#e67e22',
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
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className={style.chartContainer}>
      <h3 className={style.chartTitle}>Tickets por Categoría</h3>
      <div className={style.chartWrapper}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default CategoriasChart;