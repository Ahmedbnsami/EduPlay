import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FileUploadDropzone from "./components/FileUploadDropzone";
import PromptBox from "./components/PromptBox";
import StartButton from "./components/StartButton";
import ProgressStepper from "./components/ProgressStepper";
import ProcessingView from "./components/ProcessingView";
import ResultsView from "./components/ResultsView";
import AuthView from "./components/AuthView";
import api from "./services/api";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("eduplay-theme");
    return saved ? saved === "dark" : false;
  });

  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  const [analysisResult, setAnalysisResult] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("eduplay-user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentView, setCurrentView] = useState(() =>
    localStorage.getItem("eduplay-user") ? "home" : "auth",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("eduplay-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((p) => !p);
  }, []);

  const handleFileSelect = useCallback((f) => setFile(f), []);
  const handleFileRemove = useCallback(() => setFile(null), []);

  // ---------------------------
  // SAFE PARSER (UNCHANGED LOGIC, STABLE)
  // ---------------------------
  const parseAiResponse = (analysis) => {
    try {
      if (!analysis) return {};

      const doc =
        analysis.analysis && typeof analysis.analysis === "object"
          ? analysis.analysis
          : analysis;

      const rawField = doc.aiResponseJson ?? doc.aiResponse ?? null;
      if (!rawField) return doc || {};

      const raw =
        typeof rawField === "string" ? JSON.parse(rawField) : rawField;

      const nested = raw?.choices?.[0]?.message?.content;

      if (nested) {
        try {
          return JSON.parse(nested);
        } catch {
          return { extractedText: nested };
        }
      }

      return raw || {};
    } catch {
      return {};
    }
  };

  const handleStartAnalyzing = useCallback(async () => {
    if (!file) return;

    setCurrentStep(2);
    setProgress(0);
    setStatusText("Uploading document...");

    try {
      const documentRecord = await api.documents.upload(file);

      const documentId =
        documentRecord.documentId ??
        documentRecord.id ??
        documentRecord.documentID ??
        documentRecord.document_id;

      if (!documentId) throw new Error("Missing document ID");

      setProgress(20);
      setStatusText("Starting analysis...");

      await api.documents.analyze(documentId);

      setProgress(40);
      setStatusText("Processing...");

      let attempts = 0;

      const intervalId = setInterval(async () => {
        attempts++;

        try {
          const status = await api.documents.getStatus(documentId);

          if (status.processingStatus === "Completed") {
            clearInterval(intervalId);

            const analysis = await api.analyses.getAnalysis(documentId);
            const contentObj = parseAiResponse(analysis);

            const keyConcepts = Array.isArray(contentObj.keyConcepts)
              ? contentObj.keyConcepts
              : [];

            const sampleQuestions = Array.isArray(contentObj.sampleQuestions)
              ? contentObj.sampleQuestions
              : [];

            setAnalysisResult({
              keyConcepts,
              sampleQuestions,
              aiSummary: contentObj.aiSummary ?? analysis.aiSummary ?? "",
              raw: contentObj,
            });

            setCurrentStep(3);
          }

          if (attempts > 25) {
            clearInterval(intervalId);
            setStatusText("Timeout");
          }
        } catch (e) {
          console.error(e);
        }
      }, 1500);
    } catch (e) {
      console.error(e);
      setStatusText("Upload failed");
    }
  }, [file]);

  const handleReset = useCallback(() => {
    setFile(null);
    setPrompt("");
    setCurrentStep(1);
    setProgress(0);
    setStatusText("");
    setAnalysisResult(null);
  }, []);

  const handleAuthSuccess = useCallback((userData) => {
    const formatted = {
      id: userData.userId,
      name: userData.userName || userData.name || userData.email.split("@")[0],
      email: userData.email,
      role: userData.userRole,
    };

    setUser(formatted);
    localStorage.setItem("eduplay-user", JSON.stringify(formatted));
    setCurrentView("home");
  }, []);

  const handleLogout = useCallback(() => {
    api.auth.logout(user?.id);
    setUser(null);
    localStorage.removeItem("eduplay-user");
    setCurrentView("auth");
  }, [user]);

  const handleNavigateHome = useCallback(() => {
    setCurrentView(user ? "home" : "auth");
    setCurrentStep(1);
  }, [user]);

  useEffect(() => {
    let active = true;

    if (currentView === "history") {
      (async () => {
        setLoadingHistory(true);
        try {
          const list = await api.documents.getHistory();
          if (active) setHistoryList(list);
        } finally {
          if (active) setLoadingHistory(false);
        }
      })();
    }

    return () => {
      active = false;
    };
  }, [currentView]);

  const handleNavigateHistory = useCallback(() => {
    setCurrentView(user ? "history" : "auth");
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans">
      <Header
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        user={user}
        onLogout={handleLogout}
        onNavigateAuth={() => setCurrentView("auth")}
        onNavigateHome={handleNavigateHome}
        onNavigateHistory={handleNavigateHistory}
        currentView={currentView}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {currentView === "home" && currentStep > 1 && (
          <div className="mb-10">
            <ProgressStepper currentStep={currentStep} />
          </div>
        )}

        {currentView === "home" && currentStep === 1 && (
          <div className="max-w-2xl mx-auto w-full">
            <FileUploadDropzone
              file={file}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
            />

            <div className="mt-6">
              <PromptBox value={prompt} onChange={setPrompt} />
            </div>

            <div className="mt-8">
              <StartButton disabled={!file} onClick={handleStartAnalyzing} />
            </div>
          </div>
        )}

        {currentView === "home" && currentStep === 2 && (
          <ProcessingView progress={progress} statusText={statusText} />
        )}

        {currentView === "home" && currentStep === 3 && (
          <ResultsView onReset={handleReset} analysisResult={analysisResult} />
        )}

        {currentView === "auth" && (
          <AuthView onAuthSuccess={handleAuthSuccess} />
        )}

        {/* ---------------------------
            RESTORED HISTORY UI (FULL)
        --------------------------- */}
        {currentView === "history" && (
          <div className="max-w-2xl mx-auto w-full animate-fade-in-up space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black text-text-main uppercase tracking-tight">
                Your History
              </h2>
              <p className="text-text-muted mt-2 text-sm">
                Your previous study games
              </p>
            </div>

            <div className="bg-surface-container comic-border comic-shadow-lg p-6 space-y-4">
              {loadingHistory ? (
                <div className="text-center py-8 font-black uppercase text-text-muted">
                  Loading History...
                </div>
              ) : historyList.length === 0 ? (
                <div className="text-center py-8 font-black uppercase text-text-muted">
                  No history found
                </div>
              ) : (
                historyList.map((item) => (
                  <div
                    key={item.documentId}
                    className="flex items-center justify-between p-4 comic-border bg-surface hover:bg-outline-variant/10 transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-text-main truncate max-w-[200px]">
                        {item.fileName}
                      </h4>
                      <p className="text-xs text-text-muted mt-1">
                        {item.contentType} •{" "}
                        {Math.round(item.fileSizeInBytes / 1024)} KB •{" "}
                        {new Date(item.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          setLoadingHistory(true);

                          const id =
                            item.documentId ??
                            item.id ??
                            item.documentID ??
                            item.document_id;

                          const analysis = await api.analyses.getAnalysis(id);

                          const contentObj = parseAiResponse(analysis);

                          setAnalysisResult({
                            keyConcepts: Array.isArray(contentObj.keyConcepts)
                              ? contentObj.keyConcepts
                              : [],

                            sampleQuestions: Array.isArray(
                              contentObj.sampleQuestions,
                            )
                              ? contentObj.sampleQuestions
                              : [],

                            aiSummary:
                              contentObj.aiSummary || analysis.aiSummary || "",

                            raw: contentObj,
                          });

                          setCurrentStep(3);
                          setCurrentView("home");
                        } catch (e) {
                          console.error(e);
                        } finally {
                          setLoadingHistory(false);
                        }
                      }}
                      className="bg-accent text-black font-bold px-3 py-1.5 text-xs comic-border comic-shadow-sm hover:translate-[1px] hover:shadow-none transition-all uppercase"
                    >
                      Play
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
