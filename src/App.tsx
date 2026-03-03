import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import LeetCodeSection from './pages/LeetCodeSection';
import AdminPanel from './pages/AdminPanel';

// Components
import Navbar from './components/Navbar';
import { Loader2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// API base URL - environment-based configuration
const isDevelopment = import.meta.env.DEV;
const apiUrl = isDevelopment
  ? 'http://localhost:8000/api'
  : import.meta.env.VITE_API_URL || 'https://myprogress-api.onrender.com/api';
export const API_BASE_URL = apiUrl;

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<
    'dashboard' | 'leetcode' | 'admin'
  >('dashboard');

  if (isLoading) {
    return (
      <div className='min-h-screen bg-kaleo-sand flex items-center justify-center'>
        <Loader2 className='w-12 h-12 text-kaleo-terracotta animate-spin' />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className='min-h-screen bg-kaleo-sand'>
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />

      <main className='pt-20'>
        {currentPage === 'dashboard' && (
          <Dashboard
            onTopicClick={(slug) => {
              if (slug === 'leetcode') {
                setCurrentPage('leetcode');
              }
            }}
          />
        )}
        {currentPage === 'leetcode' && (
          <LeetCodeSection onBack={() => setCurrentPage('dashboard')} />
        )}
        {currentPage === 'admin' && user.is_admin && (
          <AdminPanel onBack={() => setCurrentPage('dashboard')} />
        )}
      </main>
    </div>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.lang = 'en';

    const handleLoad = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener('load', handleLoad);
    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimeout(refreshTimeout);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster
          position='top-right'
          toastOptions={{
            style: {
              background: '#F3F0EB',
              border: '1px solid #8C7B6B',
              color: '#1C1C1C',
            },
          }}
        />
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
