import { BOX_DURATIONS } from "../types";

interface BoxSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function BoxSlider({ value, onChange }: BoxSliderProps) {
  const index = BOX_DURATIONS.indexOf(value);

  return (
    <div className="box-slider">
      <div className="box-slider-labels">
        {BOX_DURATIONS.map((d) => (
          <span
            key={d}
            className={`box-slider-label${d === value ? " box-slider-label--active" : ""}`}
          >
            {d}s
          </span>
        ))}
      </div>
      <div className="box-slider-track-wrapper">
        {/* Track */}
        <div className="box-slider-track" />
        {/* Active track */}
        <div
          className="box-slider-track-active"
          style={{ width: `${(index / (BOX_DURATIONS.length - 1)) * 100}%` }}
        />
        {/* Tick marks */}
        {BOX_DURATIONS.map((d, i) => (
          <button
            key={d}
            className="box-slider-tick"
            onClick={() => onChange(d)}
            style={{
              left: `${(i / (BOX_DURATIONS.length - 1)) * 100}%`,
              width: d === value ? 24 : 12,
              height: d === value ? 24 : 12,
              background: i <= index ? "var(--color-inhale)" : "var(--overlay-light)",
              border: d === value ? "3px solid var(--text-primary)" : "none",
              boxShadow: d === value ? "0 2px 8px rgba(125,211,192,0.4)" : "none",
            }}
          />
        ))}
      </div>
      <div className="box-slider-summary">
        All sides: <span className="box-slider-value">{value} seconds</span>
      </div>
    </div>
  );
}
