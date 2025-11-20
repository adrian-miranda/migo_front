import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/organisms/NavBar/Navbar';
import Login from './components/pages/Login/Login';
import ProtectedRoute from './routers/ProtectedRoute';
import AdminDashboard from './components/pages/Admin/Dashboard';
import TrabajadorDashboard from './components/pages/Trabajador/Dashboard';
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