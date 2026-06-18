export default function PromptBox({ value, onChange }) {
  const maxLength = 500;

  return (
    <div className="space-y-3 animate-fade-in-up-delay-2">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-black text-text-main uppercase">
          Add a Prompt{' '}
          <span className="font-medium normal-case text-text-muted text-base">(Optional)</span>
        </h3>
        <span className="text-xs font-bold text-text-muted">{value.length}/{maxLength}</span>
      </div>

      <p className="text-sm text-text-muted font-medium -mt-1">
        Tell the AI what to focus on or how to create the game.
      </p>

      <textarea
        id="prompt-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        rows={4}
        placeholder="Focus more on key concepts and create questions that test understanding, not just memorization."
        className="w-full comic-border px-4 py-3 text-sm font-medium text-text-main placeholder-text-muted/50 bg-surface-container resize-none focus:outline-none focus:border-primary transition-colors duration-150"
      />
    </div>
  );
}
