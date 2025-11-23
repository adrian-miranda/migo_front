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
    labels: ['Abiertos', 'En Proceso', 'Resueltos no calificados', 'Cerrados calificados', 'Cancelados'],
    datasets: [
      {
        label: 'Tickets',
        data: [
          estadisticas.por_estado.abiertos || 0,
          estadisticas.por_estado.en_proceso || 0,
          estadisticas.por_estado.resueltos || 0,
          estadisticas.por_estado.cerrados || 0,
          estadisticas.por_estado.cancelados || 0,
        ],
        backgroundColor: [
          '#3498db', // Azul - Abierto
          '#f39c12', // Naranja - En Proceso
          '#2ecc71', // Verde - Resuelto
          '#9b59b6', // Morado - Cerrado
          '#e74c3c', // Rojo - Cancelado
        ],
        borderColor: [
          '#2980b9',
          '#e67e22',
          '#27ae60',
          '#8e44ad',
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
        position: 'bottom',
        align: 'center',
        labels: {
          padding: 12,
          font: {
            size: 11,
          },
          boxWidth: 14,
          boxHeight: 14,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            
            // Mostrar nombre completo en tooltip
            const nombresCompletos = {
              'Abiertos': 'Abiertos',
              'En Proceso': 'En Proceso',
              'Resueltos': 'Resueltos - No Calificado',
              'Cerrados': 'Cerrados - Calificados',
              'Cancelados': 'Cancelados'
            };
            
            const nombreCompleto = nombresCompletos[label] || label;
            return `${nombreCompleto}: ${value} (${percentage}%)`;
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