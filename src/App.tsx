import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Tenants } from './pages/Tenants';
import { Properties } from './pages/Properties';
import { Landlords } from './pages/Landlords';
import { Leases } from './pages/Leases';
import { Invoices } from './pages/Invoices';
import { Payments } from './pages/Payments';
import { Maintenance } from './pages/Maintenance';
import { AccountManagement } from './pages/AccountManagement';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <DashboardLayout />
                </ProtectedRoute>
            }>
                <Route index element={<Dashboard />} />
                <Route path="tenants" element={<Tenants />} />
                <Route path="properties" element={<Properties />} />
                <Route path="landlords" element={<Landlords />} />
                <Route path="leases" element={<Leases />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="payments" element={<Payments />} />
                <Route path="maintenance" element={<Maintenance />} />
                <Route path="account-management" element={<AccountManagement />} />
            </Route>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
