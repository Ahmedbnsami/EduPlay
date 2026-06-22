import { BookOpen, HelpCircle, Play, RotateCcw } from "lucide-react";

export default function ResultsView({ onReset, analysisResult }) {
  const safeParse = (value) => {
    if (!value) return null;
    if (typeof value === "object") return value;

    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }

    return null;
  };

  const parseAnalysis = (analysisResult) => {
    const aiSummaryRaw = analysisResult?.aiSummary;
    const parsed = safeParse(aiSummaryRaw);

    const embedded = parsed && typeof parsed === "object" ? parsed : {};

    return {
      summary:
        embedded.aiSummary ||
        (typeof aiSummaryRaw === "string" ? aiSummaryRaw : ""),

      keyConcepts: analysisResult?.keyConcepts?.length
        ? analysisResult.keyConcepts
        : embedded.keyConcepts || [],

      sampleQuestions: analysisResult?.sampleQuestions?.length
        ? analysisResult.sampleQuestions
        : embedded.sampleQuestions || [],
    };
  };

  const normalizeConcept = (c) => {
    if (!c) return { title: "Untitled", description: "" };

    if (typeof c === "string") {
      try {
        return normalizeConcept(JSON.parse(c));
      } catch {
        return {
          title: c.length > 120 ? c.slice(0, 117) + "..." : c,
          description: "",
        };
      }
    }

    if (typeof c === "object") {
      const title = c.title ?? c.name ?? c.heading ?? "";
      const description = c.description ?? c.desc ?? c.text ?? c.content ?? "";

      const finalTitle =
        title || (description.split(/\r?\n/)[0] || "Concept").slice(0, 80);

      return { title: finalTitle, description };
    }

    return { title: String(c), description: "" };
  };

  const normalizeQuestion = (q) => {
    if (!q) return { question: "", type: "" };

    if (typeof q === "string") {
      return { question: q, type: "" };
    }

    if (typeof q === "object") {
      return {
        question: q.question ?? q.prompt ?? q.text ?? "",
        type: q.type ?? "",
        difficulty: q.difficulty ?? "",
        choices: q.choices ?? q.options ?? null,
      };
    }

    return { question: String(q), type: "" };
  };

  const normalized = parseAnalysis(analysisResult);

  const summaryText = normalized.summary;
  const displayConcepts = normalized.keyConcepts.map(normalizeConcept);
  const displayQuestions = normalized.sampleQuestions.map(normalizeQuestion);

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

      {/* Summary */}
      {summaryText && (
        <div className="max-w-4xl mx-auto bg-surface-container comic-border p-4 text-sm text-text-main">
          {summaryText}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Concepts */}
        <div className="bg-surface-container comic-border comic-shadow-lg p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-primary flex items-center justify-center comic-border comic-shadow-sm">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-text-main">Key Concepts</h3>
          </div>

          <div className="space-y-4">
            {displayConcepts.length === 0 ? (
              <div className="text-center py-6 text-text-muted font-semibold">
                No key concepts available.
              </div>
            ) : (
              displayConcepts.map((concept, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 comic-border bg-surface hover:bg-outline-variant/20 transition-colors"
                >
                  <div className="w-6 h-6 comic-border bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-text-main">
                      {concept.title}
                    </p>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      {concept.description}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="bg-surface-container comic-border comic-shadow-lg p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-accent flex items-center justify-center comic-border comic-shadow-sm">
              <HelpCircle className="w-4 h-4 text-black" />
            </div>
            <h3 className="text-lg font-bold text-text-main">
              Sample Questions
            </h3>
          </div>

          <div className="space-y-4">
            {displayQuestions.length === 0 ? (
              <div className="text-center py-6 text-text-muted font-semibold">
                No sample questions available.
              </div>
            ) : (
              displayQuestions.map((q, index) => (
                <div
                  key={index}
                  className="p-3 comic-border bg-surface hover:bg-outline-variant/20 transition-colors"
                >
                  <p className="text-sm text-text-main font-medium">
                    {q.question}
                  </p>

                  {q.choices && (
                    <ul className="mt-2 text-xs list-disc list-inside text-text-muted">
                      {q.choices.map((c, i) => (
                        <li key={i}>
                          {typeof c === "string" ? c : (c.label ?? c)}
                        </li>
                      ))}
                    </ul>
                  )}

                  <span className="inline-block mt-2 text-[10px] font-bold uppercase text-text-muted comic-border px-2 py-0.5">
                    {q.type} {q.difficulty ? `• ${q.difficulty}` : ""}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <button className="bg-primary text-white font-bold px-8 py-3 comic-border comic-shadow-sm flex items-center gap-2">
          <Play className="w-4 h-4" />
          Play Game
        </button>

        <button
          onClick={onReset}
          className="bg-surface text-text-main font-bold px-8 py-3 comic-border comic-shadow-sm flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Start Over
        </button>
      </div>
    </div>
  );
}
