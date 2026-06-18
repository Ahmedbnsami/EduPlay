import { Check, Play } from 'lucide-react';

const steps = [
  { id: 1, label: 'Reading Document' },
  { id: 2, label: 'Extracting Concepts' },
  { id: 3, label: 'Generating Questions' },
  { id: 4, label: 'Building Game' },
  { id: 5, label: 'Finalizing Game' },
];

export default function ProgressStepper({ currentStep }) {
  return (
    <div id="progress-stepper" className="flex items-start w-full max-w-2xl mx-auto animate-fade-in-up">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-start flex-1 last:flex-none">
          {/* Step circle + label */}
          <div className="flex flex-col items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                border-2 border-outline font-black text-sm
                transition-all duration-300
                ${step.id < currentStep
                  ? 'bg-success text-white'
                  : step.id === currentStep
                    ? 'bg-primary text-white ring-4 ring-primary/20'
                    : 'bg-outline-variant/40 text-text-muted'
                }
              `}
            >
              {step.id < currentStep ? (
                <Check className="w-5 h-5" strokeWidth={3} />
              ) : step.id === currentStep ? (
                <Play className="w-4 h-4 ml-0.5" fill="white" />
              ) : (
                step.id
              )}
            </div>
            <span
              className={`text-[10px] sm:text-xs mt-2 font-bold text-center leading-tight max-w-80 transition-colors duration-200 ${
                step.id === currentStep
                  ? 'text-primary underline underline-offset-2'
                  : step.id < currentStep
                    ? 'text-success'
                    : 'text-text-muted'
              }`}
            >
              {step.label}
            </span>
          </div>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className="flex-1 mx-1 sm:mx-2 mt-5">
              <div
                className={`h-0.5 border-t-2 transition-colors duration-500 ${
                  step.id < currentStep ? 'border-success' : 'border-outline-variant'
                }`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
