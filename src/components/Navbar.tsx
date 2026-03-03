import { useAuth } from '../contexts/AuthContext';
import { Cat, LayoutDashboard, Code, Settings, LogOut } from 'lucide-react';

interface NavbarProps {
  currentPage: 'dashboard' | 'leetcode' | 'admin';
  onPageChange: (page: 'dashboard' | 'leetcode' | 'admin') => void;
}

export default function Navbar({ currentPage, onPageChange }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-kaleo-cream/95 backdrop-blur-sm border-b border-kaleo-terracotta/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-kaleo-terracotta/10 rounded-xl flex items-center justify-center">
              <Cat className="w-5 h-5 text-kaleo-terracotta" />
            </div>
            <span className="font-serif text-xl text-kaleo-charcoal hidden sm:block">
              Progress Tracker
            </span>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-sans text-sm transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-kaleo-terracotta/10 text-kaleo-terracotta'
                  : 'text-kaleo-earth hover:bg-kaleo-sand'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <button
              onClick={() => onPageChange('leetcode')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-sans text-sm transition-colors ${
                currentPage === 'leetcode'
                  ? 'bg-kaleo-terracotta/10 text-kaleo-terracotta'
                  : 'text-kaleo-earth hover:bg-kaleo-sand'
              }`}
            >
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">LeetCode</span>
            </button>

            {user?.is_admin && (
              <button
                onClick={() => onPageChange('admin')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-sans text-sm transition-colors ${
                  currentPage === 'admin'
                    ? 'bg-kaleo-terracotta/10 text-kaleo-terracotta'
                    : 'text-kaleo-earth hover:bg-kaleo-sand'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
          </div>

          {/* User */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-kaleo-earth/70 font-sans hidden sm:block">
              {user?.username}
            </span>
            <button
              onClick={logout}
              className="p-2 hover:bg-kaleo-sand rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-kaleo-earth" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
