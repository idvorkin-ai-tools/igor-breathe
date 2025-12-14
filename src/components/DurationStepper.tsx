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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        background: "rgba(255,255,255,0.03)",
        borderRadius: 12,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: "pointer",
          }}
        >
          \u2212
        </button>
        <span
          style={{
            width: 40,
            textAlign: "center",
            fontSize: 18,
            fontWeight: 500,
            color: "#fff",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}s
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: "pointer",
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
