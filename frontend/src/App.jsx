import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import CursorGlow from './components/CursorGlow.jsx';
import RouteLoader from './components/RouteLoader.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProfessorPipeline from './pages/ProfessorPipeline.jsx';
import ProfessorDashboard from './pages/ProfessorDashboard.jsx';
import DocumentVault from './pages/DocumentVault.jsx';
import LorTracker from './pages/LorTracker.jsx';
import Financials from './pages/Financials.jsx';
import DraftStudio from './pages/DraftStudio.jsx';
import Coordinators from './pages/Coordinators.jsx';
import CalendarReminders from './pages/CalendarReminders.jsx';
import UniversityDetail from './pages/UniversityDetail.jsx';
import Requirements from './pages/Requirements.jsx';
import TimelineView from './pages/TimelineView.jsx';
import Auth from './pages/Auth.jsx';
import { getStoredUser } from './api/client.js';

function App() {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
    const timer = window.setTimeout(() => setBooting(false), 650);
    return () => window.clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('gradAdmissionsUser');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen text-slate-950 transition-colors">
        {booting ? <RouteLoader /> : null}
        <CursorGlow />
        {user ? (
          <>
            <Navbar user={user} onLogout={handleLogout} />
            <main className="mx-auto max-w-7xl animate-riseIn px-4 py-6 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/professors" element={<ProfessorPipeline />} />
                <Route path="/professors/:id" element={<ProfessorDashboard />} />
                <Route path="/universities/:id" element={<UniversityDetail />} />
                <Route path="/documents" element={<DocumentVault />} />
                <Route path="/drafts" element={<DraftStudio />} />
                <Route path="/coordinators" element={<Coordinators />} />
                <Route path="/requirements" element={<Requirements />} />
                <Route path="/timeline" element={<TimelineView />} />
                <Route path="/calendar" element={<CalendarReminders />} />
                <Route path="/lor-tracker" element={<LorTracker />} />
                <Route path="/financials" element={<Financials />} />
              </Routes>
            </main>
          </>
        ) : (
          <Auth onAuthenticated={setUser} />
        )}
        <ScrollToTop />
      </div>
    </BrowserRouter>
  );
}

export default App;
