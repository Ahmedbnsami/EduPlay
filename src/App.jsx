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
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [currentStep, setCurrentStep] = useState(1); // 1=Upload, 2=Processing, 3=Results
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");

  // Backend Integration States
  const [analysisResult, setAnalysisResult] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Authentication & Navigation States
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("eduplay-user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [currentView, setCurrentView] = useState(() => {
    const savedUser = localStorage.getItem("eduplay-user");
    return savedUser ? "home" : "auth";
  }); // 'home', 'auth', or 'history'

  // Sync dark class on <html> element
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

  const handleStartAnalyzing = useCallback(async () => {
    if (!file) return;
    setCurrentStep(2);
    setProgress(0);
    setStatusText("Uploading document to server...");

    try {
      // Step 1: Upload the file matching Documents DB table
      const documentRecord = await api.documents.upload(file);
      setProgress(20);
      setStatusText("Queueing document for analysis...");

      // Step 1.5: Trigger the AI analysis background job (essential for .NET background worker)
      try {
        await api.documents.analyze(documentRecord.documentId);
      } catch (analysisErr) {
        console.error("Analyze error:", analysisErr);
        setStatusText(
          `Analysis failed: ${analysisErr.message || "Server error."}`,
        );
        return;
      }

      setProgress(40);
      setStatusText("Analyzing document structure...");

      // Step 2: Poll document status matching DB ProcessingStatus values
      let attempts = 0;
      const intervalId = setInterval(async () => {
        attempts++;
        try {
          const statusRecord = await api.documents.getStatus(
            documentRecord.documentId,
          );
          const status = statusRecord.processingStatus;

          if (status === "Processing") {
            setStatusText(
              "Analyzing document structure and extracting concepts...",
            );
            setProgress(60);
          } else if (status === "Completed") {
            clearInterval(intervalId);
            setProgress(100);
            setStatusText("Finalizing game setup...");

            // Step 3: Fetch the generated analysis matching DocumentAnalyses DB table
            setTimeout(async () => {
              try {
                const analysis = await api.analyses.getAnalysis(
                  documentRecord.documentId,
                );
                const responseJson = JSON.parse(
                  analysis.aiResponseJson || "{}",
                );
                setAnalysisResult({
                  keyConcepts: responseJson.keyConcepts || [],
                  sampleQuestions: responseJson.sampleQuestions || [],
                });
                setCurrentStep(3);
              } catch (e) {
                console.error(e);
                setStatusText("Error fetching analysis details.");
              }
            }, 500);
          } else if (status === "Failed" || attempts > 25) {
            clearInterval(intervalId);
            setStatusText("Analysis failed on the server. Please try again.");
          }
        } catch (pollErr) {
          console.error("Polling error:", pollErr);
        }
      }, 1500);
    } catch (err) {
      console.error("Upload error:", err);
      setStatusText(`Upload failed: ${err.message || "Server error."}`);
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
    if (!user) {
      setCurrentView("auth");
    } else {
      setCurrentView("home");
      setCurrentStep(1);
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    if (currentView === "history") {
      const loadHistory = async () => {
        setLoadingHistory(true);
        try {
          const list = await api.documents.getHistory();
          if (active) setHistoryList(list);
        } catch (e) {
          console.error("Failed to load history", e);
        } finally {
          if (active) setLoadingHistory(false);
        }
      };
      loadHistory();
    }
    return () => {
      active = false;
    };
  }, [currentView]);

  const handleNavigateHistory = useCallback(() => {
    if (!user) {
      setCurrentView("auth");
    } else {
      setCurrentView("history");
    }
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
        {/* Stepper — shown on step 2 and 3 */}
        {currentView === "home" && currentStep > 1 && (
          <div className="mb-10">
            <ProgressStepper currentStep={currentStep} />
          </div>
        )}

        {/* ====== Step 1: Upload ====== */}
        {currentView === "home" && currentStep === 1 && (
          <div className="max-w-2xl mx-auto w-full">
            {/* Hero heading */}
            <div className="text-center mb-8 animate-fade-in-up">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight">
                Upload Your Study Material
              </h1>
              <p className="text-text-muted mt-3 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Upload notes, PDFs, or any study material and let AI turn it
                into a game.
              </p>
            </div>

            {/* Upload zone + file card */}
            <FileUploadDropzone
              file={file}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
            />

            {/* Prompt */}
            <div className="mt-6">
              <PromptBox value={prompt} onChange={setPrompt} />
            </div>

            {/* CTA */}
            <div className="mt-8">
              <StartButton disabled={!file} onClick={handleStartAnalyzing} />
            </div>
          </div>
        )}

        {/* ====== Step 2: Processing ====== */}
        {currentView === "home" && currentStep === 2 && (
          <div className="max-w-2xl mx-auto w-full">
            <ProcessingView progress={progress} statusText={statusText} />
          </div>
        )}

        {/* ====== Step 3: Results ====== */}
        {currentView === "home" && currentStep === 3 && (
          <div className="max-w-4xl mx-auto w-full">
            <ResultsView
              onReset={handleReset}
              analysisResult={analysisResult}
            />
          </div>
        )}

        {/* ====== Authentication View ====== */}
        {currentView === "auth" && (
          <div className="w-full flex justify-center">
            <AuthView
              onAuthSuccess={handleAuthSuccess}
              onCancel={user ? () => setCurrentView("home") : null}
            />
          </div>
        )}

        {/* ====== History View ====== */}
        {currentView === "history" && (
          <div className="max-w-2xl mx-auto w-full animate-fade-in-up space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black text-text-main uppercase tracking-tight">
                Your History
              </h2>
              <p className="text-text-muted mt-2 text-sm max-w-xs mx-auto leading-relaxed">
                Here are the study games you've built on EduPlay.
              </p>
            </div>

            <div className="bg-surface-container comic-border comic-shadow-lg p-6 space-y-4">
              {loadingHistory ? (
                <div className="text-center py-8 font-black uppercase text-text-muted">
                  Loading History...
                </div>
              ) : historyList.length === 0 ? (
                <div className="text-center py-8 font-black uppercase text-text-muted">
                  No history found. Create a game first!
                </div>
              ) : (
                historyList.map((item) => (
                  <div
                    key={item.documentId}
                    className="flex items-center justify-between p-4 comic-border bg-surface hover:bg-outline-variant/10 transition-colors duration-150"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-text-main truncate max-w-[200px] sm:max-w-md">
                        {item.fileName}
                      </h4>
                      <p className="text-xs text-text-muted mt-0.5 font-semibold">
                        {item.contentType} •{" "}
                        {Math.round(item.fileSizeInBytes / 1024)} KB • Created{" "}
                        {new Date(item.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          setLoadingHistory(true);
                          const analysis = await api.analyses.getAnalysis(
                            item.documentId,
                          );
                          const responseJson = JSON.parse(
                            analysis.aiResponseJson || "{}",
                          );
                          setAnalysisResult({
                            keyConcepts: responseJson.keyConcepts || [],
                            sampleQuestions: responseJson.sampleQuestions || [],
                          });
                          setCurrentStep(3);
                          setCurrentView("home");
                        } catch (e) {
                          console.error(e);
                        } finally {
                          setLoadingHistory(false);
                        }
                      }}
                      className="bg-accent text-black font-bold px-3 py-1.5 text-xs comic-border comic-shadow-sm hover:translate-[1px] hover:shadow-none transition-all duration-100 cursor-pointer uppercase"
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
