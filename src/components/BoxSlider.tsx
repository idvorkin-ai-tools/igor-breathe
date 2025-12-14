import { BOX_DURATIONS } from "../types";

interface BoxSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function BoxSlider({ value, onChange }: BoxSliderProps) {
  const index = BOX_DURATIONS.indexOf(value);

  return (
    <div style={{ padding: "16px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
          padding: "0 4px",
        }}
      >
        {BOX_DURATIONS.map((d) => (
          <span
            key={d}
            style={{
              fontSize: 12,
              color: d === value ? "#7dd3c0" : "rgba(255,255,255,0.3)",
              fontWeight: d === value ? 600 : 400,
              transition: "all 0.2s",
            }}
          >
            {d}s
          </span>
        ))}
      </div>
      <div style={{ position: "relative", height: 40 }}>
        {/* Track */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 4,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 2,
            transform: "translateY(-50%)",
          }}
        />
        {/* Active track */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: `${(index / (BOX_DURATIONS.length - 1)) * 100}%`,
            height: 4,
            background: "#7dd3c0",
            borderRadius: 2,
            transform: "translateY(-50%)",
            transition: "width 0.2s",
          }}
        />
        {/* Tick marks */}
        {BOX_DURATIONS.map((d, i) => (
          <button
            key={d}
            onClick={() => onChange(d)}
            style={{
              position: "absolute",
              top: "50%",
              left: `${(i / (BOX_DURATIONS.length - 1)) * 100}%`,
              width: d === value ? 24 : 12,
              height: d === value ? 24 : 12,
              borderRadius: "50%",
              background: i <= index ? "#7dd3c0" : "rgba(255,255,255,0.2)",
              border: d === value ? "3px solid #fff" : "none",
              transform: "translate(-50%, -50%)",
              transition: "all 0.2s",
              boxShadow:
                d === value ? "0 2px 8px rgba(125,211,192,0.4)" : "none",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: 16,
          fontSize: 14,
          color: "rgba(255,255,255,0.5)",
        }}
      >
        All sides:{" "}
        <span style={{ color: "#7dd3c0", fontWeight: 600 }}>{value} seconds</span>
      </div>
    </div>
  );
}
