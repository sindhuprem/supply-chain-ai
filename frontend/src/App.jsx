import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login/Login';

import ManufacturerDashboard from './pages/ManufacturerDashboard';
import DistributorDashboard from './pages/DistributorDashboard';
import TransporterDashboard from './pages/TransporterDashboard';
import RetailerDashboard from './pages/RetailerDashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<Login />} />

          {/* Role-Protected Private Routes */}
          <Route element={<PrivateRoute allowedRoles={['manufacturer']} />}>
            <Route path="/manufacturer" element={<ManufacturerDashboard />} />
          </Route>

          <Route element={<PrivateRoute allowedRoles={['distributor']} />}>
            <Route path="/distributor" element={<DistributorDashboard />} />
          </Route>

          <Route element={<PrivateRoute allowedRoles={['transporter']} />}>
            <Route path="/transporter" element={<TransporterDashboard />} />
          </Route>

          <Route element={<PrivateRoute allowedRoles={['retailer']} />}>
            <Route path="/retailer" element={<RetailerDashboard />} />
          </Route>

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}