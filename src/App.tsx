import { AppProvider, useApp } from '@/context/AppContext';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import ReportsPage from '@/pages/ReportsPage';
import AboutPage from '@/pages/AboutPage';
import AcademicsPage from '@/pages/AcademicsPage';
import Navbar from '@/components/Navbar';

function Router() {
  const { isLoggedIn, page } = useApp();

  if (!isLoggedIn) return <LoginPage />;

  return (
    <div className="min-h-screen bg-[#080d16]">
      <Navbar />
      <main>
        {page === 'dashboard' && <DashboardPage />}
        {page === 'reports'   && <ReportsPage />}
        {page === 'academics' && <AcademicsPage />}
        {page === 'about'     && <AboutPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
