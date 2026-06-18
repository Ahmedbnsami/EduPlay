export default function Footer() {
  return (
    <footer id="footer" className="w-full border-t border-outline-variant bg-surface-container mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">E</span>
          </div>
          <span className="text-sm font-bold text-text-main">EduPlay</span>
        </div>

        <p className="text-xs text-text-muted">
          © {new Date().getFullYear()} EduPlay AI. Precision learning for students.
        </p>

        <div className="flex items-center gap-5">
          <a href="#" id="footer-terms" className="text-xs text-text-muted hover:text-primary transition-colors duration-200">
            Terms
          </a>
          <a href="#" id="footer-privacy" className="text-xs text-text-muted hover:text-primary transition-colors duration-200">
            Privacy
          </a>
          <a href="#" id="footer-support" className="text-xs text-text-muted hover:text-primary transition-colors duration-200">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}
