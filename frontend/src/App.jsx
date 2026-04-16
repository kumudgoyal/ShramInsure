import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import PoliciesPage from './pages/PoliciesPage';
import ClaimsPage from './pages/ClaimsPage';
import AdminPage from './pages/AdminPage';
import SimulationPage from './pages/SimulationPage';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-0 font-body relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      </div>
      <div className="flex flex-col items-center gap-8 relative z-10">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xl shadow-primary/20 animate-bounce">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="font-display text-2xl font-black text-white tracking-tighter mb-2">GigShield</p>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-primary font-black uppercase tracking-[0.3em]">Neural Link Syncing</span>
            <span className="flex gap-1">
              <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1 h-1 bg-primary rounded-full animate-bounce" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.is_admin ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="dashboard"   element={<Dashboard />} />
        <Route path="policies"    element={<PoliciesPage />} />
        <Route path="claims"      element={<ClaimsPage />} />
        <Route path="simulate"    element={<SimulationPage />} />
        <Route path="admin"       element={<AdminRoute><AdminPage /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
