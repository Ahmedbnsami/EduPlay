import { BookOpen, HelpCircle, Play, RotateCcw } from "lucide-react";

export default function ResultsView({ onReset, analysisResult }) {
  const concepts =
    analysisResult &&
    analysisResult.keyConcepts &&
    analysisResult.keyConcepts.length > 0
      ? analysisResult.keyConcepts
      : [];

  const questions =
    analysisResult &&
    analysisResult.sampleQuestions &&
    analysisResult.sampleQuestions.length > 0
      ? analysisResult.sampleQuestions
      : [];

  return (
    <div id="results-view" className="animate-fade-in-up space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-success/10 text-success comic-border px-4 py-1.5 text-sm font-semibold mb-4">
          <span className="w-2 h-2 rounded-full bg-success" />
          Analysis Complete
        </div>

        <h2 className="text-2xl font-black text-text-main uppercase">
          Your study game is ready!
        </h2>

        <p className="text-sm text-text-muted mt-1">
          Here's what the AI extracted from your material.
        </p>
      </div>

      {/* AI Summary fallback */}
      {analysisResult && analysisResult.aiSummary && (
        <div className="max-w-4xl mx-auto bg-surface-container comic-border p-4 text-sm text-text-main">
          {analysisResult.aiSummary}
        </div>
      )}

      {/* Two-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Concepts */}
        <div className="bg-surface-container comic-border comic-shadow-lg p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-primary flex items-center justify-center comic-border comic-shadow-sm">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-text-main">Key Concepts</h3>
          </div>

          <div className="space-y-4">
            {concepts.length === 0 ? (
              <div className="text-center py-6 text-text-muted font-semibold">
                No key concepts available.
              </div>
            ) : (
              concepts.map((concept, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 comic-border bg-surface hover:bg-outline-variant/20 transition-colors duration-150"
                >
                  <div className="w-6 h-6 comic-border bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-text-main">
                      {concept.title}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {concept.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sample Questions */}
        <div className="bg-surface-container comic-border comic-shadow-lg p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-accent flex items-center justify-center comic-border comic-shadow-sm">
              <HelpCircle className="w-4 h-4 text-black" />
            </div>
            <h3 className="text-lg font-bold text-text-main">
              Sample Questions
            </h3>
          </div>

          <div className="space-y-3">
            {questions.length === 0 ? (
              <div className="text-center py-6 text-text-muted font-semibold">
                No sample questions available.
              </div>
            ) : (
              questions.map((q, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 comic-border bg-surface hover:bg-outline-variant/20 transition-colors duration-150"
                >
                  <div className="w-6 h-6 comic-border bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-accent">Q</span>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-text-main">{q.question}</p>

                    <span className="inline-block mt-1.5 text-[10px] font-bold uppercase text-text-muted comic-border px-2 py-0.5">
                      {q.type}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-4">
        <button
          id="play-game-button"
          className="bg-primary text-white font-bold px-8 py-3 comic-border comic-shadow-sm hover:translate-[2px] hover:shadow-none transition-all duration-150 flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Play Game
        </button>

        <button
          id="start-over-button"
          onClick={onReset}
          className="bg-surface text-text-main font-bold px-8 py-3 comic-border comic-shadow-sm hover:translate-[2px] hover:shadow-none transition-all duration-150 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Start Over
        </button>
      </div>
    </div>
  );
}
