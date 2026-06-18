import { ArrowRight } from 'lucide-react';

export default function StartButton({ disabled, onClick }) {
  return (
    <div className="animate-fade-in-up-delay-3">
      <button
        id="start-analyzing-button"
        disabled={disabled}
        onClick={onClick}
        className={`
          w-full comic-border font-black text-lg uppercase
          py-4 px-8 flex items-center justify-center gap-3
          transition-all duration-100 cursor-pointer
          ${disabled
            ? 'bg-outline-variant text-text-muted cursor-not-allowed'
            : 'bg-primary text-white comic-shadow active:comic-shadow-pressed hover:bg-primary-hover'
          }
        `}
      >
        Start Analyzing
        <ArrowRight className="w-5 h-5" strokeWidth={3} />
      </button>
    </div>
  );
}
