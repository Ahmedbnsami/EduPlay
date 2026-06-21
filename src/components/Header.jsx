import { Sun, Moon, LogIn, LogOut, User } from 'lucide-react';

export default function Header({
  darkMode,
  onToggleDarkMode,
  user,
  onLogout,
  onNavigateAuth,
  onNavigateHome,
  onNavigateHistory,
  currentView,
}) {
  return (
    <header id="header" className="w-full border-b-2 border-outline bg-surface-container sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <span
          onClick={onNavigateHome}
          className="text-xl font-black text-primary uppercase tracking-tight cursor-pointer select-none hover:opacity-80 transition-opacity"
        >
          EduPlay
        </span>

        {/* Right side nav */}
        <div className="flex items-center gap-4 sm:gap-6">
          <a
            href="#"
            id="nav-upload"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome();
            }}
            className={`text-xs sm:text-sm font-black uppercase transition-colors duration-150 ${
              currentView === 'home'
                ? 'text-primary underline underline-offset-4 decoration-2'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            Upload
          </a>
          <a
            href="#"
            id="nav-history"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHistory();
            }}
            className={`text-xs sm:text-sm font-black uppercase transition-colors duration-150 ${
              currentView === 'history'
                ? 'text-primary underline underline-offset-4 decoration-2'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            History
          </a>

          {/* Theme toggle */}
          <button
            id="theme-toggle-button"
            onClick={onToggleDarkMode}
            className="w-8 h-8 comic-border flex items-center justify-center text-text-muted hover:text-text-main hover:bg-outline-variant/30 transition-all duration-150 cursor-pointer"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Authentication Section */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 comic-border bg-primary/10 text-primary text-xs font-black uppercase">
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[100px] truncate">{user.name}</span>
              </div>
              <button
                id="logout-button"
                onClick={onLogout}
                className="px-3 py-1.5 text-xs font-black uppercase comic-border bg-surface text-text-main comic-shadow-sm hover:translate-[1px] hover:shadow-none active:translate-[2px] transition-all duration-100 cursor-pointer flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              id="signin-button"
              onClick={onNavigateAuth}
              className={`px-3 py-1.5 text-xs font-black uppercase comic-border comic-shadow-sm hover:translate-[1px] hover:shadow-none active:translate-[2px] transition-all duration-100 cursor-pointer flex items-center gap-1 ${
                currentView === 'auth' ? 'bg-primary text-white' : 'bg-accent text-black hover:bg-accent-hover'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

