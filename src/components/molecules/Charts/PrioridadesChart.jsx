/**
 * Gráfico de barras para prioridades de tickets
 */
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import style from './Charts.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PrioridadesChart = ({ estadisticas }) => {
  if (!estadisticas?.por_prioridad) {
    return <div>Cargando...</div>;
  }

  const prioridades = estadisticas.por_prioridad;

  const data = {
    labels: Object.keys(prioridades),
    datasets: [
      {
        label: 'Cantidad de Tickets',
        data: Object.values(prioridades),
        backgroundColor: [
          '#95a5a6', // Gris - Baja
          '#3498db', // Azul - Media
          '#f39c12', // Naranja - Alta
          '#e74c3c', // Rojo - Urgente
        ],
        borderColor: [
          '#7f8c8d',
          '#2980b9',
          '#e67e22',
          '#c0392b',
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
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Tickets: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className={style.chartContainer}>
      <h3 className={style.chartTitle}>Tickets por Prioridad</h3>
      <div className={style.chartWrapper}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default PrioridadesChart;