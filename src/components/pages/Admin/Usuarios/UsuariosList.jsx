/**
 * Vista de Usuarios para Administrador
 * Muestra listado de usuarios con sus tickets
 */
import React, { useState, useEffect } from 'react';
import { authService } from '../../../../api/authService';
import { ticketsService } from '../../../../api/ticketsService';
import UsuarioDetail from './UsuarioDetail';
import style from './UsuariosList.module.css';

const UsuariosList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usuariosRes, ticketsRes] = await Promise.all([
        authService.listarUsuarios(),
        ticketsService.listarTickets()
      ]);

      if (usuariosRes.success && ticketsRes.success) {
        // Filtrar solo trabajadores (nombre_rol = "Trabajador")
        const trabajadores = usuariosRes.usuarios.filter(
          u => u.nombre_rol === 'Trabajador'
        );
        
        setUsuarios(trabajadores);
        setTickets(ticketsRes.tickets || []);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Contar tickets por usuario
  const contarTicketsPorUsuario = (userId) => {
    return tickets.filter(t => t.usuario_creador?.id === userId).length;
  };

  // Contar tickets activos por usuario
  const contarTicketsActivos = (userId) => {
    return tickets.filter(
      t => t.usuario_creador?.id === userId && 
           (t.estado === 'Abierto' || t.estado === 'En Proceso')
    ).length;
  };

  // Obtener último ticket del usuario
  const obtenerUltimoTicket = (userId) => {
    const ticketsUsuario = tickets
      .filter(t => t.usuario_creador?.id === userId)
      .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
    
    return ticketsUsuario[0] || null;
  };

  // Filtrar usuarios por búsqueda
  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.correo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Ver detalle del usuario
  const verDetalle = (usuario) => {
    const ticketsUsuario = tickets.filter(
      t => t.usuario_creador?.id === usuario.id_usuarios
    );
    setUsuarioSeleccionado({ ...usuario, tickets: ticketsUsuario });
  };

  // Cerrar modal de detalle
  const cerrarDetalle = () => {
    setUsuarioSeleccionado(null);
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={style.container}>
        <div className={style.loading}>Cargando usuarios...</div>
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
        <h1>Gestión de Usuarios</h1>
        <div className={style.stats}>
          <span className={style.statItem}>
            Total usuarios: <strong>{usuarios.length}</strong>
          </span>
          <span className={style.statItem}>
            Filtrados: <strong>{usuariosFiltrados.length}</strong>
          </span>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className={style.searchBar}>
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className={style.searchInput}
        />
      </div>

      {/* Tabla de usuarios */}
      <div className={style.tableContainer}>
        {usuariosFiltrados.length === 0 ? (
          <div className={style.noResults}>
            No se encontraron usuarios
          </div>
        ) : (
          <table className={style.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Departamento</th>
                <th>Total Tickets</th>
                <th>Tickets Activos</th>
                <th>Último Ticket</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => {
                const totalTickets = contarTicketsPorUsuario(usuario.id_usuarios);
                const ticketsActivos = contarTicketsActivos(usuario.id_usuarios);
                const ultimoTicket = obtenerUltimoTicket(usuario.id_usuarios);

                return (
                  <tr key={usuario.id_usuarios}>
                    <td>
                      <div className={style.nombreUsuario}>
                        {usuario.nombre_completo || 'N/A'}
                      </div>
                    </td>
                    <td>{usuario.correo}</td>
                    <td>
                      <span className={style.badge}>
                        {usuario.nombre_cargo || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={style.numero}>{totalTickets}</span>
                    </td>
                    <td>
                      <span className={style.numeroActivo}>{ticketsActivos}</span>
                    </td>
                    <td>
                      {ultimoTicket ? (
                        <div className={style.ultimoTicket}>
                          <div className={style.tituloTicket}>
                            {ultimoTicket.titulo}
                          </div>
                          <div className={style.fechaTicket}>
                            {formatearFecha(ultimoTicket.fecha_creacion)}
                          </div>
                        </div>
                      ) : (
                        <span className={style.sinTickets}>Sin tickets</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => verDetalle(usuario)}
                        className={style.btnVer}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de detalle */}
      {usuarioSeleccionado && (
        <UsuarioDetail
          usuario={usuarioSeleccionado}
          onClose={cerrarDetalle}
        />
      )}
    </div>
  );
};

export default UsuariosList;