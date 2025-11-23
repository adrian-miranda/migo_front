import React, { useState } from 'react';
import axios from 'axios';
import style from './CalificarTicket.module.css';

const CalificarTicket = ({ ticketId, onCalificado }) => {
  const [calificacion, setCalificacion] = useState(0);
  const [hover, setHover] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (calificacion === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }

    setLoading(true);

    try {
      const userData = JSON.parse(localStorage.getItem('migo_usuario'));
      
      const response = await axios.post(
        `http://localhost:8000/api/tickets/${ticketId}/calificar/`,
        {
          usuario_id: userData.id_usuarios,
          calificacion: calificacion,
          comentario: comentario
        }
      );

      if (response.data.success) {
        alert('¡Gracias por tu calificación!');
        if (onCalificado) {
          onCalificado();
        }
      }
    } catch (error) {
      console.error('Error al calificar:', error);
      if (error.response?.data?.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert('Error al enviar la calificación');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.container}>
      <div className={style.header}>
        <span className={style.icon}>⭐</span>
        <h3>Califica la atención recibida</h3>
      </div>

      <form onSubmit={handleSubmit} className={style.form}>
        <div className={style.estrellas}>
          {[1, 2, 3, 4, 5].map((estrella) => (
            <span
              key={estrella}
              className={`${style.estrella} ${
                estrella <= (hover || calificacion) ? style.llena : style.vacia
              }`}
              onClick={() => setCalificacion(estrella)}
              onMouseEnter={() => setHover(estrella)}
              onMouseLeave={() => setHover(0)}
            >
              ★
            </span>
          ))}
        </div>

        <div className={style.textoCalificacion}>
          {calificacion === 0 && 'Selecciona tu calificación'}
          {calificacion === 1 && '😞 Muy insatisfecho'}
          {calificacion === 2 && '😕 Insatisfecho'}
          {calificacion === 3 && '😐 Regular'}
          {calificacion === 4 && '😊 Satisfecho'}
          {calificacion === 5 && '😄 Muy satisfecho'}
        </div>

        <div className={style.formGroup}>
          <label htmlFor="comentario">Comentario (opcional)</label>
          <textarea
            id="comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Cuéntanos sobre tu experiencia..."
            rows={4}
            maxLength={500}
            className={style.textarea}
          />
          <span className={style.charCount}>{comentario.length}/500</span>
        </div>

        <button
          type="submit"
          className={style.btnEnviar}
          disabled={loading || calificacion === 0}
        >
          {loading ? 'Enviando...' : 'Enviar Calificación'}
        </button>
      </form>
    </div>
  );
};

export const CalificacionExistente = ({ calificacion }) => {
  if (!calificacion) return null;

  const renderEstrellas = () => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        className={`${style.estrella} ${
          index < calificacion.calificacion ? style.llena : style.vacia
        }`}
      >
        ★
      </span>
    ));
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={style.calificacionExistente}>
      <div className={style.headerExistente}>
        <span className={style.iconCheck}>✅</span>
        <h3>Ya calificaste este ticket</h3>
      </div>
      <div className={style.contenidoExistente}>
        <div className={style.estrellas}>
          {renderEstrellas()}
        </div>
        <div className={style.puntaje}>
          {calificacion.calificacion}/5
        </div>
        {calificacion.comentario && (
          <div className={style.comentarioExistente}>
            <p>"{calificacion.comentario}"</p>
          </div>
        )}
        <div className={style.fechaCalificacion}>
          Calificado el: {formatearFecha(calificacion.fecha_calificacion)}
        </div>
      </div>
    </div>
  );
};

export default CalificarTicket;