import { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import FileUploadDropzone from './components/FileUploadDropzone';
import PromptBox from './components/PromptBox';
import StartButton from './components/StartButton';
import ProgressStepper from './components/ProgressStepper';
import ProcessingView from './components/ProcessingView';
import ResultsView from './components/ResultsView';

const PROCESSING_STEPS = [
  { text: 'Reading document structure...', targetProgress: 25 },
  { text: 'Extracting key concepts...', targetProgress: 50 },
  { text: 'Generating study questions...', targetProgress: 75 },
  { text: 'Building your game...', targetProgress: 95 },
  { text: 'Finalizing results...', targetProgress: 100 },
];

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('eduplay-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1=Upload, 2=Processing, 3=Results
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  // Sync dark class on <html> element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('eduplay-theme', darkMode ? 'dark' : 'light');
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

  const handleStartAnalyzing = useCallback(() => {
    if (!file) return;
    setCurrentStep(2);
    setProgress(0);

    // Simulate AI processing
    let stepIndex = 0;

    const advanceStep = () => {
      if (stepIndex >= PROCESSING_STEPS.length) {
        // Done — move to results
        setTimeout(() => setCurrentStep(3), 400);
        return;
      }

      const step = PROCESSING_STEPS[stepIndex];
      setStatusText(step.text);

      // Animate progress to target
      const startProgress = stepIndex === 0 ? 0 : PROCESSING_STEPS[stepIndex - 1].targetProgress;
      const endProgress = step.targetProgress;
      const duration = 800 + Math.random() * 600;
      const startTime = Date.now();

      const tick = () => {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        // Ease-out curve
        const eased = 1 - Math.pow(1 - t, 3);
        setProgress(Math.round(startProgress + (endProgress - startProgress) * eased));

        if (t < 1) {
          requestAnimationFrame(tick);
        } else {
          stepIndex++;
          setTimeout(advanceStep, 300);
        }
      };

      requestAnimationFrame(tick);
    };

    setTimeout(advanceStep, 500);
  }, [file]);

  const handleReset = useCallback(() => {
    setFile(null);
    setPrompt('');
    setCurrentStep(1);
    setProgress(0);
    setStatusText('');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans">
      <Header darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Stepper — shown on step 2 and 3 */}
        {currentStep > 1 && (
          <div className="mb-10">
            <ProgressStepper currentStep={currentStep} />
          </div>
        )}

        {/* ====== Step 1: Upload ====== */}
        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto">
            {/* Hero heading */}
            <div className="text-center mb-8 animate-fade-in-up">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight">
                Upload Your Study Material
              </h1>
              <p className="text-text-muted mt-3 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Upload notes, PDFs, or any study material and let AI turn it into a game.
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
        {currentStep === 2 && (
          <div className="max-w-2xl mx-auto">
            <ProcessingView progress={progress} statusText={statusText} />
          </div>
        )}

        {/* ====== Step 3: Results ====== */}
        {currentStep === 3 && (
          <div className="max-w-4xl mx-auto">
            <ResultsView onReset={handleReset} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
