import { Sun, Moon } from 'lucide-react';

export default function Header({ darkMode, onToggleDarkMode }) {
  return (
    <header id="header" className="w-full border-b-2 border-outline bg-surface-container sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <span className="text-xl font-black text-primary uppercase tracking-tight">
          EduPlay
        </span>

        {/* Right side nav */}
        <div className="flex items-center gap-5">
          <a
            href="#"
            id="nav-upload"
            className="text-sm font-bold text-text-muted hover:text-text-main underline underline-offset-4 decoration-1 transition-colors duration-150"
          >
            Upload
          </a>
          <a
            href="#"
            id="nav-history"
            className="text-sm font-bold text-text-muted hover:text-text-main underline underline-offset-4 decoration-1 transition-colors duration-150"
          >
            History
          </a>

          <button
            id="theme-toggle-button"
            onClick={onToggleDarkMode}
            className="w-9 h-9 comic-border flex items-center justify-center text-text-muted hover:text-text-main hover:bg-outline-variant/30 transition-all duration-150 cursor-pointer"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
