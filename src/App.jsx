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

// Componentes Trabajador
import TrabajadorDashboard from './components/pages/Trabajador/Dashboard';
import NuevoTicket from './components/pages/Trabajador/NuevoTicket';
import TicketDetalle from './components/pages/Trabajador/TicketDetalle';
import MisTickets from './components/pages/Trabajador/MisTickets';
import TicketsPendientes from './components/pages/Trabajador/TicketsPendientes'; 

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

              {/* Rutas protegidas - Técnico */}
              <Route
                path="/tecnico/dashboard"
                element={
                  <ProtectedRoute rolesPermitidos={[1]}>
                    <div style={{ padding: '40px' }}>
                      <h1>Dashboard de Técnico</h1>
                      <p>En desarrollo...</p>
                    </div>
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
                    <TicketsPendientes />  {/* ← CORRECTO */}
                  </ProtectedRoute>
                }
              />
              {/* ↑ RUTA AGREGADA */}

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