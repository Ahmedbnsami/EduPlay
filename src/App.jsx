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
    if (saved) return saved === "dark";
    return false;
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

  const [currentView, setCurrentView] = useState(() => {
    const savedUser = localStorage.getItem("eduplay-user");
    return savedUser ? "home" : "auth";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("eduplay-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  const handleFileSelect = useCallback((selectedFile) => {
    setFile(selectedFile);
  }, []);

  const handleFileRemove = useCallback(() => {
    setFile(null);
  }, []);

  // ---------------------------
  // SAFE AI PARSER (IMPORTANT FIX)
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

  // ONLY SAFE FALLBACK: DO NOT GENERATE FAKE QUESTIONS ANYMORE
  const deriveFromText = () => {
    return { keyConcepts: [], sampleQuestions: [] };
  };

  const handleStartAnalyzing = useCallback(async () => {
    if (!file) return;

    setCurrentStep(2);
    setProgress(0);
    setStatusText("Uploading document to server...");

    try {
      const documentRecord = await api.documents.upload(file);

      const documentId =
        documentRecord.documentId ??
        documentRecord.id ??
        documentRecord.documentID ??
        documentRecord.document_id;

      if (!documentId) throw new Error("No document ID returned");

      setProgress(20);
      setStatusText("Queueing document for analysis...");

      await api.documents.analyze(documentId);

      setProgress(40);
      setStatusText("Analyzing document...");

      let attempts = 0;

      const intervalId = setInterval(async () => {
        attempts++;

        try {
          const statusRecord = await api.documents.getStatus(documentId);

          if (statusRecord.processingStatus === "Completed") {
            clearInterval(intervalId);

            const analysis = await api.analyses.getAnalysis(documentId);
            const contentObj = parseAiResponse(analysis);

            const textCandidate =
              contentObj.extractedText ??
              analysis.extractedText ??
              contentObj.aiSummary ??
              analysis.aiSummary ??
              "";

            // ---------------------------
            // FIXED: NO FALLBACK OVERWRITE
            // ---------------------------
            const keyConcepts = Array.isArray(contentObj.keyConcepts)
              ? contentObj.keyConcepts
              : [];

            const sampleQuestions = Array.isArray(contentObj.sampleQuestions)
              ? contentObj.sampleQuestions
              : [];

            const fallback = deriveFromText(textCandidate);

            setAnalysisResult({
              keyConcepts:
                keyConcepts.length > 0 ? keyConcepts : fallback.keyConcepts,

              sampleQuestions:
                sampleQuestions.length > 0
                  ? sampleQuestions
                  : fallback.sampleQuestions,

              aiSummary:
                contentObj.aiSummary ?? analysis.aiSummary ?? textCandidate,

              raw: contentObj,
            });

            setCurrentStep(3);
          }

          if (attempts > 25) {
            clearInterval(intervalId);
            setStatusText("Analysis timeout");
          }
        } catch (e) {
          console.error(e);
        }
      }, 1500);
    } catch (err) {
      console.error(err);
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
    const formattedUser = {
      id: userData.userId,
      name: userData.userName || userData.name || userData.email.split("@")[0],
      email: userData.email,
      role: userData.userRole,
    };

    setUser(formattedUser);
    localStorage.setItem("eduplay-user", JSON.stringify(formattedUser));
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

        {currentView === "history" && (
          <div className="max-w-2xl mx-auto w-full">
            {historyList.map((item) => (
              <div key={item.documentId}>{item.fileName}</div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
