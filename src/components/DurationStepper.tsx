interface DurationStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  color: string;
}

export function DurationStepper({
  label,
  value,
  onChange,
  min = 0,
  max = 20,
  color,
}: DurationStepperProps) {
  return (
    <div className="stepper-container" style={{ borderLeft: `3px solid ${color}` }}>
      <span className="stepper-label">{label}</span>
      <div className="stepper-controls">
        <button
          className="stepper-btn"
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          −
        </button>
        <span className="stepper-value">{value}s</span>
        <button
          className="stepper-btn"
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          +
        </button>
      </div>
    </div>
  );
}
