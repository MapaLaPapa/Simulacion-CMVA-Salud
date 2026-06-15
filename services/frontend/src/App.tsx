import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Inicio from './pages/inicio';
import AgendarPage from './pages/agendar';
import AdminLoginPage from './pages/admin/admin';
import AdminDashboardPage from './pages/admin/dashboard';
import DashboardStats from './pages/admin/stats';
import ConfirmacionPage from './pages/confirmacion';
import MisCitasPage from './pages/portalpaciente';
import Nosotros from './pages/nosotros';
import FAQ from './pages/faq';
import Chat from './components/chat';

const RedireccionExterna = () => {
  window.location.href = '/grafana/';
  return null; 
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/agendar" element={<AgendarPage />} />
        <Route path="/portal-paciente" element={<MisCitasPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/stats" element={<DashboardStats />} />
        <Route path="/confirmar/:idCita" element={<ConfirmacionPage />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/grafana/*" element={<RedireccionExterna />} />
       
        <Route path="*" element={<Navigate to="/" replace />} />
      
      </Routes>
    </Router>
  );
}

export default App;