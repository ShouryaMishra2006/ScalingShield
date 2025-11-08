import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import LocalCredentialsDashboard from "./components/Dashboard/localCredentialsAnalytics.jsx";
import EmployeeMonitoringDashboard from "./components/Dashboard/liveMonitoringAnalytics.jsx";
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
        <Route path="/Dashboard/localCredentialsAnalytics" element={<LocalCredentialsDashboard/>}/>
        <Route path="/Dashboard/liveMonitoringAnalytics" element={<EmployeeMonitoringDashboard/>}/>
        <Route path="/main" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
