import { Sparkles, Loader2 } from 'lucide-react';

export default function ProcessingView({ progress, statusText }) {
  return (
    <div id="processing-view" className="flex flex-col items-center justify-center py-16 animate-fade-in-up">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center">
          <Sparkles className="w-9 h-9 text-primary animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-surface-container border-2 border-outline-variant flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-text-main mb-2">AI is analyzing your material</h2>
      <p className="text-sm text-text-muted mb-8">{statusText}</p>

      {/* Progress bar */}
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-text-muted">Processing</span>
          <span className="text-xs font-bold text-primary">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-outline-variant/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-primary to-indigo-400 rounded-full transition-all duration-500 ease-out animate-fill-progress"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
