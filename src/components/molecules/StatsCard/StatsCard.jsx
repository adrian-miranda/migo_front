/**
 * Tarjeta de estadísticas
 */
import React from 'react';
import style from './StatsCard.module.css';

const StatsCard = ({ title, value, icon, color, subtitle }) => {
  return (
    <div className={style.card} style={{ borderLeftColor: color }}>
      <div className={style.cardHeader}>
        <div className={style.cardInfo}>
          <h3 className={style.cardTitle}>{title}</h3>
          <p className={style.cardValue}>{value}</p>
          {subtitle && <p className={style.cardSubtitle}>{subtitle}</p>}
        </div>
        {icon && (
          <div className={style.cardIcon} style={{ backgroundColor: color }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;