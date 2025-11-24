/**
 * Generador de Reportes para Administrador
 * Permite generar reportes personalizados con filtros y exportación
 */
import React, { useState, useEffect } from 'react';
import { ticketsService } from '../../../../api/ticketsService';
import { authService } from '../../../../api/authService';
import style from './ReportesGenerator.module.css';

const ReportesGenerator = () => {
  const [tickets, setTickets] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generandoReporte, setGenerandoReporte] = useState(false);

  // Filtros del reporte
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    estado: '',
    prioridad: '',
    categoria: '',
    tecnico: '',
    usuario: ''
  });

  // Datos del reporte generado
  const [reporte, setReporte] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [ticketsRes, tecnicosRes, usuariosRes] = await Promise.all([
        ticketsService.listarTickets(),
        authService.listarTodosTecnicos(),
        authService.listarUsuarios()
      ]);

      if (ticketsRes.success && tecnicosRes.success && usuariosRes.success) {
        setTickets(ticketsRes.tickets || []);
        setTecnicos(tecnicosRes.tecnicos || []);
        setUsuarios(usuariosRes.usuarios || []);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value
    });
  };

  const aplicarPreset = (preset) => {
  const hoy = new Date();
  let fechaInicio, fechaFin;

  // Función para formatear fecha en formato YYYY-MM-DD en zona horaria local
  const formatearFechaLocal = (fecha) => {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

  switch (preset) {
    case 'hoy':
      fechaInicio = fechaFin = formatearFechaLocal(hoy);
      break;
    case 'semana':
      const hace7Dias = new Date();
      hace7Dias.setDate(hace7Dias.getDate() - 7);
      fechaInicio = formatearFechaLocal(hace7Dias);
      fechaFin = formatearFechaLocal(hoy);
      break;
    case 'mes':
      fechaInicio = formatearFechaLocal(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
      fechaFin = formatearFechaLocal(hoy);
      break;
    case 'trimestre':
      const mesActual = hoy.getMonth();
      const mesTrimestre = Math.floor(mesActual / 3) * 3;
      fechaInicio = formatearFechaLocal(new Date(hoy.getFullYear(), mesTrimestre, 1));
      fechaFin = formatearFechaLocal(hoy);
      break;
    case 'año':
      fechaInicio = formatearFechaLocal(new Date(hoy.getFullYear(), 0, 1));
      fechaFin = formatearFechaLocal(hoy);
      break;
    default:
      return;
  }

  setFiltros({
    ...filtros,
    fechaInicio,
    fechaFin
  });
};

  const generarReporte = () => {
    setGenerandoReporte(true);

    // Filtrar tickets según criterios
    let ticketsFiltrados = [...tickets];

    // Filtro por fecha
    if (filtros.fechaInicio) {
      const fechaInicio = new Date(filtros.fechaInicio);
      ticketsFiltrados = ticketsFiltrados.filter(t => {
        const fechaTicket = new Date(t.fecha_creacion);
        return fechaTicket >= fechaInicio;
      });
    }

    if (filtros.fechaFin) {
      const fechaFin = new Date(filtros.fechaFin + 'T23:59:59.999');
      ticketsFiltrados = ticketsFiltrados.filter(t => {
        const fechaTicket = new Date(t.fecha_creacion);
        return fechaTicket <= fechaFin;
      });
    }

    // Filtro por estado
    if (filtros.estado) {
      ticketsFiltrados = ticketsFiltrados.filter(t => t.estado === filtros.estado);
    }

    // Filtro por prioridad
    if (filtros.prioridad) {
      ticketsFiltrados = ticketsFiltrados.filter(t => t.prioridad === filtros.prioridad);
    }

    // Filtro por categoría
    if (filtros.categoria) {
      ticketsFiltrados = ticketsFiltrados.filter(t => t.categoria === filtros.categoria);
    }

    // Filtro por técnico
    if (filtros.tecnico) {
      if (filtros.tecnico === 'sin_asignar') {
        ticketsFiltrados = ticketsFiltrados.filter(t => !t.tecnico_asignado);
      } else {
        ticketsFiltrados = ticketsFiltrados.filter(
          t => t.tecnico_asignado?.id === parseInt(filtros.tecnico)
        );
      }
    }

    // Filtro por usuario
    if (filtros.usuario) {
      ticketsFiltrados = ticketsFiltrados.filter(
        t => t.usuario_creador?.id === parseInt(filtros.usuario)
      );
    }

    // Calcular métricas
    const metricas = calcularMetricas(ticketsFiltrados);

    setReporte({
      tickets: ticketsFiltrados,
      metricas: metricas,
      filtrosAplicados: { ...filtros }
    });

    setGenerandoReporte(false);
  };

  const calcularMetricas = (ticketsFiltrados) => {
  const total = ticketsFiltrados.length;

  // Por estado (incluyendo cancelados)
  const porEstado = {
    abiertos: ticketsFiltrados.filter(t => t.estado === 'Abierto').length,
    enProceso: ticketsFiltrados.filter(t => t.estado === 'En Proceso').length,
    resueltos: ticketsFiltrados.filter(t => t.estado === 'Resuelto').length,
    cerrados: ticketsFiltrados.filter(t => t.estado === 'Cerrado').length,
    cancelados: ticketsFiltrados.filter(t => t.estado === 'Cancelado').length
  };

  // Por prioridad
  const porPrioridad = {
    baja: ticketsFiltrados.filter(t => t.prioridad === 'Baja').length,
    media: ticketsFiltrados.filter(t => t.prioridad === 'Media').length,
    alta: ticketsFiltrados.filter(t => t.prioridad === 'Alta').length,
    urgente: ticketsFiltrados.filter(t => t.prioridad === 'Urgente').length
  };

  // Por categoría
  const categorias = [...new Set(ticketsFiltrados.map(t => t.categoria))];
  const porCategoria = {};
  categorias.forEach(cat => {
    porCategoria[cat] = ticketsFiltrados.filter(t => t.categoria === cat).length;
  });

  // Tiempo promedio de resolución (incluir cerrados también)
  // Tiempo promedio de resolución
const ticketsCompletados = ticketsFiltrados.filter(
  t => (t.estado === 'Resuelto' || t.estado === 'Cerrado') && t.fecha_creacion && (t.fecha_resolucion || t.fecha_cierre)
);

let tiempoPromedio = 0;
if (ticketsCompletados.length > 0) {
  const tiempoTotal = ticketsCompletados.reduce((acc, ticket) => {
    const creacion = new Date(ticket.fecha_creacion);
    const fechaFin = new Date(ticket.fecha_resolucion || ticket.fecha_cierre);
    const diferencia = (fechaFin - creacion) / (1000 * 60 * 60);
    return acc + diferencia;
  }, 0);
  tiempoPromedio = (tiempoTotal / ticketsCompletados.length).toFixed(1);
}

// Tasa de resolución
const tasaResolucion = total > 0 
  ? ((porEstado.resueltos + porEstado.cerrados) / total * 100).toFixed(1) 
  : 0;

// Top técnicos
const ticketsPorTecnico = {};
ticketsFiltrados.forEach(ticket => {
  if (ticket.tecnico_asignado) {
    const tecnicoId = ticket.tecnico_asignado.id;
    const tecnicoNombre = ticket.tecnico_asignado.nombre;
    if (!ticketsPorTecnico[tecnicoId]) {
      ticketsPorTecnico[tecnicoId] = {
        nombre: tecnicoNombre,
        total: 0,
        resueltos: 0
      };
    }
    ticketsPorTecnico[tecnicoId].total++;
    if (ticket.estado === 'Resuelto' || ticket.estado === 'Cerrado') {
      ticketsPorTecnico[tecnicoId].resueltos++;
    }
  }
});

  const topTecnicos = Object.values(ticketsPorTecnico)
    .sort((a, b) => b.resueltos - a.resueltos)
    .slice(0, 5);

  // Top usuarios con más tickets
  const ticketsPorUsuario = {};
  ticketsFiltrados.forEach(ticket => {
    if (ticket.usuario_creador) {
      const userId = ticket.usuario_creador.id;
      const userName = ticket.usuario_creador.nombre;
      if (!ticketsPorUsuario[userId]) {
        ticketsPorUsuario[userId] = {
          nombre: userName,
          total: 0
        };
      }
      ticketsPorUsuario[userId].total++;
    }
  });

  const topUsuarios = Object.values(ticketsPorUsuario)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return {
    total,
    porEstado,
    porPrioridad,
    porCategoria,
    tiempoPromedio,
    tasaResolucion,
    topTecnicos,
    topUsuarios
  };
};

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      estado: '',
      prioridad: '',
      categoria: '',
      tecnico: '',
      usuario: ''
    });
    setReporte(null);
  };

  const exportarPDF = () => {
    if (!reporte) return;

    // Importar html2pdf dinámicamente
    import('html2pdf.js').then((html2pdf) => {
      const html2pdfModule = html2pdf.default || html2pdf;

      // Crear el contenido HTML del reporte
      const contenidoPDF = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #4CAF50; font-size: 24px; margin-bottom: 10px; }
            h2 { color: #333; font-size: 18px; margin-top: 20px; margin-bottom: 10px; }
            h3 { color: #555; font-size: 16px; margin-top: 15px; margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th { background-color: #4CAF50; color: white; padding: 10px; text-align: left; font-size: 12px; }
            td { padding: 8px; border: 1px solid #ddd; font-size: 11px; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .metrica { display: inline-block; margin: 10px 20px 10px 0; }
            .metrica-label { font-size: 12px; color: #666; }
            .metrica-valor { font-size: 18px; font-weight: bold; color: #4CAF50; }
            .periodo { font-size: 12px; color: #666; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <h1>Reporte de Tickets - MIGO</h1>
          <p class="periodo">
            Periodo: ${reporte.filtrosAplicados.fechaInicio || 'Inicio'} - ${reporte.filtrosAplicados.fechaFin || 'Actual'}<br>
            Fecha de generación: ${new Date().toLocaleDateString('es-CL')}
          </p>

          <h2>Métricas Principales</h2>
          <div>
            <div class="metrica">
              <div class="metrica-label">Total de Tickets</div>
              <div class="metrica-valor">${reporte.metricas.total}</div>
            </div>
            <div class="metrica">
              <div class="metrica-label">Tasa de Resolución</div>
              <div class="metrica-valor">${reporte.metricas.tasaResolucion}%</div>
            </div>
            <div class="metrica">
              <div class="metrica-label">Tiempo Promedio</div>
              <div class="metrica-valor">${reporte.metricas.tiempoPromedio !== 0 ? reporte.metricas.tiempoPromedio + 'h' : 'N/A'}</div>
            </div>
            <div class="metrica">
              <div class="metrica-label">Tickets Abiertos</div>
              <div class="metrica-valor">${reporte.metricas.porEstado.abiertos}</div>
            </div>
          </div>

          <h2>Tickets por Estado</h2>
          <table>
            <thead>
              <tr>
                <th>Estado</th>
                <th>Cantidad</th>
                <th>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Abiertos</td>
                <td>${reporte.metricas.porEstado.abiertos}</td>
                <td>${((reporte.metricas.porEstado.abiertos / reporte.metricas.total) * 100 || 0).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>En Proceso</td>
                <td>${reporte.metricas.porEstado.enProceso}</td>
                <td>${((reporte.metricas.porEstado.enProceso / reporte.metricas.total) * 100 || 0).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Resueltos</td>
                <td>${reporte.metricas.porEstado.resueltos}</td>
                <td>${((reporte.metricas.porEstado.resueltos / reporte.metricas.total) * 100 || 0).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Cerrados</td>
                <td>${reporte.metricas.porEstado.cerrados}</td>
                <td>${((reporte.metricas.porEstado.cerrados / reporte.metricas.total) * 100 || 0).toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>

          <h2>Tickets por Prioridad</h2>
          <table>
            <thead>
              <tr>
                <th>Prioridad</th>
                <th>Cantidad</th>
                <th>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Baja</td>
                <td>${reporte.metricas.porPrioridad.baja}</td>
                <td>${((reporte.metricas.porPrioridad.baja / reporte.metricas.total) * 100 || 0).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Media</td>
                <td>${reporte.metricas.porPrioridad.media}</td>
                <td>${((reporte.metricas.porPrioridad.media / reporte.metricas.total) * 100 || 0).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Alta</td>
                <td>${reporte.metricas.porPrioridad.alta}</td>
                <td>${((reporte.metricas.porPrioridad.alta / reporte.metricas.total) * 100 || 0).toFixed(1)}%</td>
              </tr>
              <tr>
                <td>Urgente</td>
                <td>${reporte.metricas.porPrioridad.urgente}</td>
                <td>${((reporte.metricas.porPrioridad.urgente / reporte.metricas.total) * 100 || 0).toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>

          <h2>Detalle de Tickets (${reporte.tickets.length})</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Usuario</th>
                <th>Técnico</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              ${reporte.tickets.map(ticket => `
                <tr>
                  <td>#${ticket.id_ticket}</td>
                  <td>${ticket.titulo.substring(0, 40)}${ticket.titulo.length > 40 ? '...' : ''}</td>
                  <td>${ticket.categoria}</td>
                  <td>${ticket.estado}</td>
                  <td>${ticket.prioridad}</td>
                  <td>${ticket.usuario_creador?.nombre?.substring(0, 20) || 'N/A'}</td>
                  <td>${ticket.tecnico_asignado?.nombre?.substring(0, 20) || 'Sin asignar'}</td>
                  <td>${new Date(ticket.fecha_creacion).toLocaleDateString('es-CL')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      // Crear elemento temporal
      const element = document.createElement('div');
      element.innerHTML = contenidoPDF;

      // Opciones de html2pdf
      const options = {
        margin: 10,
        filename: `reporte_tickets_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Generar PDF
      html2pdfModule().set(options).from(element).save();
    }).catch(error => {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Verifica que la librería esté instalada correctamente.');
    });
  };

  const exportarExcel = () => {
    if (!reporte) return;

    // Importar XLSX dinámicamente
    import('xlsx').then((XLSX) => {
      // Crear un nuevo libro de trabajo
      const wb = XLSX.utils.book_new();

      // Hoja 1: Resumen
      const resumenData = [
        ['REPORTE DE TICKETS'],
        [''],
        ['Fecha de generación:', new Date().toLocaleDateString('es-CL')],
        ['Periodo:', `${reporte.filtrosAplicados.fechaInicio || 'Inicio'} - ${reporte.filtrosAplicados.fechaFin || 'Actual'}`],
        [''],
        ['MÉTRICAS PRINCIPALES'],
        ['Total de Tickets:', reporte.metricas.total],
        ['Tasa de Resolución:', `${reporte.metricas.tasaResolucion}%`],
        ['Tiempo Promedio:', reporte.metricas.tiempoPromedio !== 0 ? `${reporte.metricas.tiempoPromedio}h` : 'N/A'],
        ['Tickets Abiertos:', reporte.metricas.porEstado.abiertos],
        [''],
        ['TICKETS POR ESTADO'],
        ['Estado', 'Cantidad', 'Porcentaje'],
        ['Abiertos', reporte.metricas.porEstado.abiertos, `${(reporte.metricas.porEstado.abiertos / reporte.metricas.total * 100).toFixed(1)}%`],
        ['En Proceso', reporte.metricas.porEstado.enProceso, `${(reporte.metricas.porEstado.enProceso / reporte.metricas.total * 100).toFixed(1)}%`],
        ['Resueltos', reporte.metricas.porEstado.resueltos, `${(reporte.metricas.porEstado.resueltos / reporte.metricas.total * 100).toFixed(1)}%`],
        ['Cerrados', reporte.metricas.porEstado.cerrados, `${(reporte.metricas.porEstado.cerrados / reporte.metricas.total * 100).toFixed(1)}%`],
        [''],
        ['TICKETS POR PRIORIDAD'],
        ['Prioridad', 'Cantidad', 'Porcentaje'],
        ['Baja', reporte.metricas.porPrioridad.baja, `${(reporte.metricas.porPrioridad.baja / reporte.metricas.total * 100).toFixed(1)}%`],
        ['Media', reporte.metricas.porPrioridad.media, `${(reporte.metricas.porPrioridad.media / reporte.metricas.total * 100).toFixed(1)}%`],
        ['Alta', reporte.metricas.porPrioridad.alta, `${(reporte.metricas.porPrioridad.alta / reporte.metricas.total * 100).toFixed(1)}%`],
        ['Urgente', reporte.metricas.porPrioridad.urgente, `${(reporte.metricas.porPrioridad.urgente / reporte.metricas.total * 100).toFixed(1)}%`],
      ];

      const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

      // Hoja 2: Detalle de Tickets
      const ticketsData = [
        ['ID', 'Título', 'Descripción', 'Categoría', 'Estado', 'Prioridad', 'Usuario', 'Técnico', 'Fecha Creación', 'Fecha Resolución']
      ];

      reporte.tickets.forEach(ticket => {
        ticketsData.push([
          ticket.id_ticket,
          ticket.titulo,
          ticket.descripcion,
          ticket.categoria,
          ticket.estado,
          ticket.prioridad,
          ticket.usuario_creador?.nombre || 'N/A',
          ticket.tecnico_asignado?.nombre || 'Sin asignar',
          new Date(ticket.fecha_creacion).toLocaleString('es-CL'),
          ticket.fecha_resolucion ? new Date(ticket.fecha_resolucion).toLocaleString('es-CL') : 'N/A'
        ]);
      });

      const wsTickets = XLSX.utils.aoa_to_sheet(ticketsData);
      XLSX.utils.book_append_sheet(wb, wsTickets, 'Tickets');

      // Hoja 3: Top Técnicos
      if (reporte.metricas.topTecnicos.length > 0) {
        const tecnicosData = [
          ['Ranking', 'Técnico', 'Total Asignados', 'Resueltos', 'Tasa de Resolución']
        ];

        reporte.metricas.topTecnicos.forEach((tecnico, index) => {
          tecnicosData.push([
            index + 1,
            tecnico.nombre,
            tecnico.total,
            tecnico.resueltos,
            `${(tecnico.resueltos / tecnico.total * 100).toFixed(1)}%`
          ]);
        });

        const wsTecnicos = XLSX.utils.aoa_to_sheet(tecnicosData);
        XLSX.utils.book_append_sheet(wb, wsTecnicos, 'Top Técnicos');
      }

      // Hoja 4: Top Usuarios
      if (reporte.metricas.topUsuarios.length > 0) {
        const usuariosData = [
          ['Ranking', 'Usuario', 'Total Tickets']
        ];

        reporte.metricas.topUsuarios.forEach((usuario, index) => {
          usuariosData.push([
            index + 1,
            usuario.nombre,
            usuario.total
          ]);
        });

        const wsUsuarios = XLSX.utils.aoa_to_sheet(usuariosData);
        XLSX.utils.book_append_sheet(wb, wsUsuarios, 'Top Usuarios');
      }

      // Descargar el archivo
      XLSX.writeFile(wb, `reporte_tickets_${new Date().toISOString().split('T')[0]}.xlsx`);
    });
  };

  const exportarCSV = () => {
    if (!reporte) return;

    // Preparar datos para CSV
    let csv = 'ID,Título,Descripción,Categoría,Estado,Prioridad,Usuario,Técnico,Fecha Creación,Fecha Resolución\n';
    
    reporte.tickets.forEach(ticket => {
      csv += `${ticket.id_ticket},"${ticket.titulo}","${ticket.descripcion?.replace(/"/g, '""')}","${ticket.categoria}","${ticket.estado}","${ticket.prioridad}","${ticket.usuario_creador?.nombre || 'N/A'}","${ticket.tecnico_asignado?.nombre || 'Sin asignar'}","${new Date(ticket.fecha_creacion).toLocaleString('es-CL')}","${ticket.fecha_resolucion ? new Date(ticket.fecha_resolucion).toLocaleString('es-CL') : 'N/A'}"\n`;
    });

    // Crear blob y descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_tickets_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className={style.container}>
        <div className={style.loading}>Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className={style.container}>
      <div className={style.header}>
        <h1>Generador de Reportes</h1>
        <p className={style.subtitle}>
          Configura los filtros y genera reportes personalizados de tickets
        </p>
      </div>

      {/* Configuración de filtros */}
      <div className={style.filtrosCard}>
        <h2>Configuración del Reporte</h2>

        {/* Presets de periodo */}
        <div className={style.presetsContainer}>
          <label>Periodos rápidos:</label>
          <div className={style.presets}>
            <button onClick={() => aplicarPreset('hoy')} className={style.presetBtn}>
              Hoy
            </button>
            <button onClick={() => aplicarPreset('semana')} className={style.presetBtn}>
              Última semana
            </button>
            <button onClick={() => aplicarPreset('mes')} className={style.presetBtn}>
              Este mes
            </button>
            <button onClick={() => aplicarPreset('trimestre')} className={style.presetBtn}>
              Trimestre
            </button>
            <button onClick={() => aplicarPreset('año')} className={style.presetBtn}>
              Este año
            </button>
          </div>
        </div>

        {/* Filtros personalizados */}
        <div className={style.filtrosGrid}>
          <div className={style.filtroGroup}>
            <label>Fecha inicio</label>
            <input
              type="date"
              name="fechaInicio"
              value={filtros.fechaInicio}
              onChange={handleFiltroChange}
              className={style.input}
            />
          </div>

          <div className={style.filtroGroup}>
            <label>Fecha fin</label>
            <input
              type="date"
              name="fechaFin"
              value={filtros.fechaFin}
              onChange={handleFiltroChange}
              className={style.input}
            />
          </div>

          <div className={style.filtroGroup}>
            <label>Estado</label>
            <select
              name="estado"
              value={filtros.estado}
              onChange={handleFiltroChange}
              className={style.select}
            >
              <option value="">Todos</option>
              <option value="Abierto">Abierto</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Resuelto">Resuelto</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>

          <div className={style.filtroGroup}>
            <label>Prioridad</label>
            <select
              name="prioridad"
              value={filtros.prioridad}
              onChange={handleFiltroChange}
              className={style.select}
            >
              <option value="">Todas</option>
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>

          <div className={style.filtroGroup}>
            <label>Categoría</label>
            <select
              name="categoria"
              value={filtros.categoria}
              onChange={handleFiltroChange}
              className={style.select}
            >
              <option value="">Todas</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Red">Red</option>
              <option value="Impresoras">Impresoras</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div className={style.filtroGroup}>
            <label>Técnico</label>
            <select
              name="tecnico"
              value={filtros.tecnico}
              onChange={handleFiltroChange}
              className={style.select}
            >
              <option value="">Todos</option>
              <option value="sin_asignar">Sin asignar</option>
              {tecnicos.map(tecnico => (
                <option key={tecnico.id_usuarios} value={tecnico.id_usuarios}>
                  {tecnico.nombre_completo}
                </option>
              ))}
            </select>
          </div>

          <div className={style.filtroGroup}>
            <label>Usuario</label>
            <select
              name="usuario"
              value={filtros.usuario}
              onChange={handleFiltroChange}
              className={style.select}
            >
              <option value="">Todos</option>
              {usuarios.filter(u => u.nombre_rol === 'Trabajador').map(usuario => (
                <option key={usuario.id_usuarios} value={usuario.id_usuarios}>
                  {usuario.nombre_completo}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botones de acción */}
        <div className={style.actionsContainer}>
          <button 
            onClick={generarReporte} 
            className={style.btnGenerar}
            disabled={generandoReporte}
          >
            {generandoReporte ? 'Generando...' : 'Generar Reporte'}
          </button>
          <button onClick={limpiarFiltros} className={style.btnLimpiar}>
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Reporte generado */}
      {reporte && (
        <div className={style.reporteContainer}>
          <div className={style.reporteHeader}>
            <h2>Reporte Generado</h2>
            <div className={style.exportButtons}>
              <button onClick={exportarPDF} className={style.btnExport}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Exportar PDF
              </button>
              <button onClick={exportarExcel} className={style.btnExport}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <path d="M9 15h6M9 18h6"></path>
                </svg>
                Exportar Excel
              </button>
              <button onClick={exportarCSV} className={style.btnExport}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <rect x="8" y="12" width="8" height="6"></rect>
                </svg>
                Exportar CSV
              </button>
            </div>
          </div>

          {/* Métricas principales */}
          {/* Métricas principales */}
{/* Métricas principales */}
<div className={style.metricasGrid}>
  <div className={style.metricaCard}>
    <div className={style.metricaNumero}>{reporte.metricas.total}</div>
    <div className={style.metricaLabel}>Total Tickets</div>
  </div>
  <div className={style.metricaCard}>
    <div className={style.metricaNumero}>
      {(reporte.metricas.porEstado.resueltos || 0) + (reporte.metricas.porEstado.cerrados || 0)}
    </div>
    <div className={style.metricaLabel}>Completados</div>
    <div className={style.metricaSub}>
      Resueltos ({reporte.metricas.porEstado.resueltos || 0}) + Cerrados ({reporte.metricas.porEstado.cerrados || 0})
    </div>
  </div>
  <div className={style.metricaCard}>
    <div className={style.metricaNumero}>{reporte.metricas.tasaResolucion}%</div>
    <div className={style.metricaLabel}>Tasa de Resolución</div>
  </div>
  <div className={style.metricaCard}>
    <div className={style.metricaNumero}>
      {reporte.metricas.tiempoPromedio && reporte.metricas.tiempoPromedio !== '0' && reporte.metricas.tiempoPromedio !== 0
        ? `${reporte.metricas.tiempoPromedio}h` 
        : 'N/A'}
    </div>
    <div className={style.metricaLabel}>Tiempo Promedio</div>
  </div>
  <div className={style.metricaCard}>
    <div className={style.metricaNumero}>{reporte.metricas.porEstado.cancelados || 0}</div>
    <div className={style.metricaLabel}>Cancelados</div>
    <div className={style.metricaSub}>
      {reporte.metricas.total > 0 
        ? ((reporte.metricas.porEstado.cancelados || 0) / reporte.metricas.total * 100).toFixed(1) 
        : 0}%
    </div>
  </div>
</div>

          {/* Gráficos y tablas */}
          <div className={style.chartsContainer}>
            {/* Por Estado */}
            <div className={style.chartCard}>
              <h3>Tickets por Estado</h3>
              <div className={style.chartBars}>
                <div className={style.barItem}>
                  <span className={style.barLabel}>Abiertos</span>
                  <div className={style.barContainer}>
                    <div 
                      className={style.barFill}
                      style={{ 
                        width: `${(reporte.metricas.porEstado.abiertos / reporte.metricas.total * 100) || 0}%`,
                        background: '#3498db'
                      }}
                    />
                  </div>
                  <span className={style.barValue}>{reporte.metricas.porEstado.abiertos}</span>
                </div>
                <div className={style.barItem}>
                  <span className={style.barLabel}>En Proceso</span>
                  <div className={style.barContainer}>
                    <div 
                      className={style.barFill}
                      style={{ 
                        width: `${(reporte.metricas.porEstado.enProceso / reporte.metricas.total * 100) || 0}%`,
                        background: '#f39c12'
                      }}
                    />
                  </div>
                  <span className={style.barValue}>{reporte.metricas.porEstado.enProceso}</span>
                </div>
                <div className={style.barItem}>
                  <span className={style.barLabel}>Resueltos</span>
                  <div className={style.barContainer}>
                    <div 
                      className={style.barFill}
                      style={{ 
                        width: `${(reporte.metricas.porEstado.resueltos / reporte.metricas.total * 100) || 0}%`,
                        background: '#2ecc71'
                      }}
                    />
                  </div>
                  <span className={style.barValue}>{reporte.metricas.porEstado.resueltos}</span>
                </div>
                <div className={style.barItem}>
                  <span className={style.barLabel}>Cerrados</span>
                  <div className={style.barContainer}>
                    <div 
                      className={style.barFill}
                      style={{ 
                        width: `${(reporte.metricas.porEstado.cerrados / reporte.metricas.total * 100) || 0}%`,
                        background: '#95a5a6'
                      }}
                    />
                  </div>
                  <span className={style.barValue}>{reporte.metricas.porEstado.cerrados}</span>
                </div>
              </div>
            </div>

            {/* Por Prioridad */}
            <div className={style.chartCard}>
              <h3>Tickets por Prioridad</h3>
              <div className={style.chartBars}>
                <div className={style.barItem}>
                  <span className={style.barLabel}>Baja</span>
                  <div className={style.barContainer}>
                    <div 
                      className={style.barFill}
                      style={{ 
                        width: `${(reporte.metricas.porPrioridad.baja / reporte.metricas.total * 100) || 0}%`,
                        background: '#95a5a6'
                      }}
                    />
                  </div>
                  <span className={style.barValue}>{reporte.metricas.porPrioridad.baja}</span>
                </div>
                <div className={style.barItem}>
                  <span className={style.barLabel}>Media</span>
                  <div className={style.barContainer}>
                    <div 
                      className={style.barFill}
                      style={{ 
                        width: `${(reporte.metricas.porPrioridad.media / reporte.metricas.total * 100) || 0}%`,
                        background: '#f39c12'
                      }}
                    />
                  </div>
                  <span className={style.barValue}>{reporte.metricas.porPrioridad.media}</span>
                </div>
                <div className={style.barItem}>
                  <span className={style.barLabel}>Alta</span>
                  <div className={style.barContainer}>
                    <div 
                      className={style.barFill}
                      style={{ 
                        width: `${(reporte.metricas.porPrioridad.alta / reporte.metricas.total * 100) || 0}%`,
                        background: '#e67e22'
                      }}
                    />
                  </div>
                  <span className={style.barValue}>{reporte.metricas.porPrioridad.alta}</span>
                </div>
                <div className={style.barItem}>
                  <span className={style.barLabel}>Urgente</span>
                  <div className={style.barContainer}>
                    <div 
                      className={style.barFill}
                      style={{ 
                        width: `${(reporte.metricas.porPrioridad.urgente / reporte.metricas.total * 100) || 0}%`,
                        background: '#e74c3c'
                      }}
                    />
                  </div>
                  <span className={style.barValue}>{reporte.metricas.porPrioridad.urgente}</span>
                </div>
              </div>
            </div>

            {/* Por Categoría */}
            <div className={style.chartCard}>
              <h3>Tickets por Categoría</h3>
              <div className={style.chartBars}>
                {Object.entries(reporte.metricas.porCategoria).map(([categoria, cantidad]) => (
                  <div key={categoria} className={style.barItem}>
                    <span className={style.barLabel}>{categoria}</span>
                    <div className={style.barContainer}>
                      <div 
                        className={style.barFill}
                        style={{ 
                          width: `${(cantidad / reporte.metricas.total * 100) || 0}%`,
                          background: '#3498db'
                        }}
                      />
                    </div>
                    <span className={style.barValue}>{cantidad}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Técnicos */}
            <div className={style.chartCard}>
              <h3>Top 5 Técnicos</h3>
              {reporte.metricas.topTecnicos.length > 0 ? (
                <div className={style.topList}>
                  {reporte.metricas.topTecnicos.map((tecnico, index) => (
                    <div key={index} className={style.topItem}>
                      <span className={style.topRank}>#{index + 1}</span>
                      <span className={style.topNombre}>{tecnico.nombre}</span>
                      <span className={style.topStats}>
                        {tecnico.resueltos} / {tecnico.total} resueltos
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={style.noData}>No hay datos disponibles</p>
              )}
            </div>

            {/* Top Usuarios */}
            <div className={style.chartCard}>
              <h3>Top 5 Usuarios con más tickets</h3>
              {reporte.metricas.topUsuarios.length > 0 ? (
                <div className={style.topList}>
                  {reporte.metricas.topUsuarios.map((usuario, index) => (
                    <div key={index} className={style.topItem}>
                      <span className={style.topRank}>#{index + 1}</span>
                      <span className={style.topNombre}>{usuario.nombre}</span>
                      <span className={style.topStats}>{usuario.total} tickets</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={style.noData}>No hay datos disponibles</p>
              )}
            </div>
          </div>

          {/* Tabla de tickets */}
          <div className={style.ticketsTable}>
            <h3>Detalle de Tickets ({reporte.tickets.length})</h3>
            <div className={style.tableWrapper}>
              <table className={style.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Categoría</th>
                    <th>Estado</th>
                    <th>Prioridad</th>
                    <th>Usuario</th>
                    <th>Técnico</th>
                    <th>Fecha Creación</th>
                  </tr>
                </thead>
                <tbody>
                  {reporte.tickets.map(ticket => (
                    <tr key={ticket.id_ticket}>
                      <td>#{ticket.id_ticket}</td>
                      <td>{ticket.titulo}</td>
                      <td>{ticket.categoria}</td>
                      <td>
                        <span 
                          className={style.estadoBadge}
                          style={{ backgroundColor: ticket.estado_color }}
                        >
                          {ticket.estado}
                        </span>
                      </td>
                      <td>
                        <span 
                          className={style.prioridadBadge}
                          style={{ backgroundColor: ticket.prioridad_color }}
                        >
                          {ticket.prioridad}
                        </span>
                      </td>
                      <td>{ticket.usuario_creador?.nombre || 'N/A'}</td>
                      <td>{ticket.tecnico_asignado?.nombre || 'Sin asignar'}</td>
                      <td>{new Date(ticket.fecha_creacion).toLocaleDateString('es-CL')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportesGenerator;