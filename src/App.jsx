import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/organisms/NavBar/Navbar';
import Login from './components/pages/Login/Login';
import ProtectedRoute from './routers/ProtectedRoute';

// Componentes Admin
import AdminDashboard from './components/pages/Admin/Dashboard';
import TicketDetail from './components/pages/Admin/Tickets/TicketDetail';
import TicketsList from './components/pages/Admin/Tickets/TicketsList';
import UsuariosList from './components/pages/Admin/Usuarios/UsuariosList';
import TecnicosList from './components/pages/Admin/Tecnicos/TecnicosList';
import ReportesGenerator from './components/pages/Admin/Reportes/ReportesGenerator';
import PanelReclamos from './components/pages/Admin/Reclamos/PanelReclamos';

// Componentes Trabajador
import TrabajadorDashboard from './components/pages/Trabajador/Dashboard';
import NuevoTicket from './components/pages/Trabajador/NuevoTicket';
import TicketDetalle from './components/pages/Trabajador/TicketDetalle';
import MisTickets from './components/pages/Trabajador/MisTickets';
import TicketsPendientes from './components/pages/Trabajador/TicketsPendientes'; 

// Componentes Técnico
import TecnicoDashboard from './components/pages/Tecnico/Dashboard';
import TicketDetalleTecnico from './components/pages/Tecnico/TicketDetalle';
import HistorialTecnico from './components/pages/Tecnico/Historial';
import TicketsAsignadosTecnico from './components/pages/Tecnico/TicketsAsignados';
import MisReclamos from './components/pages/Tecnico/MisReclamos';

//Reclamos
import MisReclamosCreados from './components/pages/Trabajador/MisReclamosCreados';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Ruta pública */}
              <Route path="/login" element={<Login />} />

              {/* Rutas protegidas - Administrador */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute rolesPermitidos={[3]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/usuarios"
                element={
                  <ProtectedRoute rolesPermitidos={[3]}>
                    <UsuariosList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tickets/:id"
                element={
                  <ProtectedRoute rolesPermitidos={[3]}>
                    <TicketDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tickets"
                element={
                  <ProtectedRoute rolesPermitidos={[3]}>
                    <TicketsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/tecnicos"
                element={
                  <ProtectedRoute rolesPermitidos={[3]}>
                    <TecnicosList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reportes"
                element={
                  <ProtectedRoute rolesPermitidos={[3]}>
                    <ReportesGenerator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reclamos"
                element={
                  <ProtectedRoute rolesPermitidos={[3]}>
                    <PanelReclamos />
                  </ProtectedRoute>
                }
              />

              {/* Rutas protegidas - Técnico */}
              <Route
                path="/tecnico/dashboard"
                element={
                  <ProtectedRoute rolesPermitidos={[1]}>
                    <TecnicoDashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/tecnico/ticket/:id"
                element={
                  <ProtectedRoute rolesPermitidos={[1]}>
                    <TicketDetalleTecnico />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tecnico/historial"
                element={
                  <ProtectedRoute rolesPermitidos={[1]}>
                    <HistorialTecnico />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tecnico/tickets-asignados"
                element={
                  <ProtectedRoute rolesPermitidos={[1]}>
                    <TicketsAsignadosTecnico />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tecnico/reclamos"
                element={
                  <ProtectedRoute rolesPermitidos={[1]}>
                    <MisReclamos />
                  </ProtectedRoute>
                }
              />

              {/* Rutas protegidas - Trabajador */}
              <Route
                path="/trabajador/dashboard"
                element={
                  <ProtectedRoute rolesPermitidos={[2]}>
                    <TrabajadorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trabajador/nuevo-ticket"
                element={
                  <ProtectedRoute rolesPermitidos={[2]}>
                    <NuevoTicket />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trabajador/tickets/:id"
                element={
                  <ProtectedRoute rolesPermitidos={[2]}>
                    <TicketDetalle />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/trabajador/mis-tickets"
                element={
                  <ProtectedRoute rolesPermitidos={[2]}>
                    <MisTickets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trabajador/tickets-pendientes"
                element={
                  <ProtectedRoute rolesPermitidos={[2]}>
                    <TicketsPendientes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trabajador/mis-reclamos"
                element={
                  <ProtectedRoute rolesPermitidos={[2]}>
                    <MisReclamosCreados />
                  </ProtectedRoute>
                }
              />

              {/* Redirección por defecto */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Ruta 404 */}
              <Route 
                path="*" 
                element={
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <h1>404 - Página no encontrada</h1>
                  </div>
                } 
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;