import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Cat, User, Users, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login, loginAsGuest } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Please enter your username');
      return;
    }

    setIsLoading(true);

    try {
      await login(username, password);
      toast.success(`Welcome back, ${username}! 🐱`);
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      await loginAsGuest();
      toast.success('Welcome, friend! 🐱');
    } catch (error: any) {
      toast.error(error.message || 'Guest login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-kaleo-sand flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-kaleo-terracotta/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-kaleo-cream/50 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Main card */}
        <div className="bg-kaleo-cream rounded-2xl shadow-xl border border-kaleo-terracotta/20 overflow-hidden">
          {/* Header */}
          <div className="bg-kaleo-terracotta/10 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-kaleo-terracotta/20 rounded-full mb-4">
              <Cat className="w-10 h-10 text-kaleo-terracotta" />
            </div>
            <h1 className="font-serif text-3xl text-kaleo-charcoal mb-2">
              Meow! Who's there?
            </h1>
            <p className="text-kaleo-earth/70 font-sans text-sm tracking-wide">
              Kapil's Progress Tracker
            </p>
          </div>

          {/* Login options */}
          <div className="p-8 space-y-6">
            {/* Kapil Login */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-kaleo-terracotta/60" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Are you Kapil?"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-kaleo-terracotta/20 rounded-xl text-kaleo-charcoal placeholder:text-kaleo-earth/50 focus:outline-none focus:ring-2 focus:ring-kaleo-terracotta/30 transition-all"
                  />
                </div>
                
                {showPassword && (
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-kaleo-terracotta/60" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password..."
                      className="w-full pl-12 pr-4 py-3 bg-white border border-kaleo-terracotta/20 rounded-xl text-kaleo-charcoal placeholder:text-kaleo-earth/50 focus:outline-none focus:ring-2 focus:ring-kaleo-terracotta/30 transition-all"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-kaleo-terracotta text-white rounded-xl font-sans font-medium tracking-wide hover:bg-kaleo-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="animate-pulse">Logging in...</span>
                ) : (
                  <>
                    <span>I'm Kapil!</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {!showPassword && username.toLowerCase() === 'kapil' && (
                <button
                  type="button"
                  onClick={() => setShowPassword(true)}
                  className="w-full text-center text-sm text-kaleo-terracotta hover:underline"
                >
                  Enter password
                </button>
              )}
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-kaleo-terracotta/20" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-kaleo-cream text-sm text-kaleo-earth/60 font-sans">
                  or
                </span>
              </div>
            </div>

            {/* Friend/Guest Login */}
            <button
              onClick={handleGuestLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-white border-2 border-kaleo-terracotta/30 text-kaleo-charcoal rounded-xl font-sans font-medium tracking-wide hover:bg-kaleo-terracotta/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Users className="w-5 h-5 text-kaleo-terracotta" />
              <span>I'm a friend! 🐱</span>
            </button>

            {/* Info */}
            <div className="pt-4 text-center">
              <p className="text-xs text-kaleo-earth/60 font-sans">
                <Sparkles className="inline w-3 h-3 mr-1" />
                Friends get read-only access to view progress
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-kaleo-earth/50 font-sans">
          Built with FastAPI + React + 🐱
        </p>
      </div>
    </div>
  );
}
