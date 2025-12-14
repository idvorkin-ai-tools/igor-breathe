import { Modal } from "./Modal";
import { BoxSlider } from "./BoxSlider";
import { DurationStepper } from "./DurationStepper";
import { EditablePattern, COLORS } from "../types";

interface PatternEditorProps {
  isOpen: boolean;
  onClose: () => void;
  pattern: EditablePattern | null;
  onChange: (pattern: EditablePattern) => void;
  onSave: () => void;
}

export function PatternEditor({
  isOpen,
  onClose,
  pattern,
  onChange,
  onSave,
}: PatternEditorProps) {
  if (!pattern) return null;

  const handleDurationChange = (index: number, value: number) => {
    const newDurations = [...pattern.durations];
    newDurations[index] = value;
    onChange({ ...pattern, durations: newDurations });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={pattern.type === "box" ? "◻ New Box Pattern" : "△ New Trapezoid Pattern"}
    >
      {/* Pattern Name */}
      <div style={{ marginBottom: 20 }}>
        <label className="editor-label">Pattern Name</label>
        <input
          type="text"
          className="input-field"
          placeholder="e.g., My Calm Pattern"
          value={pattern.name}
          onChange={(e) => onChange({ ...pattern, name: e.target.value })}
        />
      </div>

      {/* Box Pattern: Single Slider */}
      {pattern.type === "box" && (
        <div style={{ marginBottom: 24 }}>
          <label className="editor-label">Duration per Side</label>
          <BoxSlider
            value={pattern.boxDuration ?? 4}
            onChange={(val) =>
              onChange({
                ...pattern,
                boxDuration: val,
                durations: [val, val, val, val],
              })
            }
          />
        </div>
      )}

      {/* Trapezoid Pattern: 4 Steppers */}
      {pattern.type === "trapezoid" && (
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <label className="editor-label" style={{ marginBottom: 4 }}>
            Phase Durations
          </label>
          <DurationStepper
            label="Breathe In"
            value={pattern.durations[0]}
            onChange={(val) => handleDurationChange(0, val)}
            min={1}
            color={COLORS[0]}
          />
          <DurationStepper
            label="Hold 1"
            value={pattern.durations[1]}
            onChange={(val) => handleDurationChange(1, val)}
            min={0}
            color={COLORS[1]}
          />
          <DurationStepper
            label="Breathe Out"
            value={pattern.durations[2]}
            onChange={(val) => handleDurationChange(2, val)}
            min={1}
            color={COLORS[2]}
          />
          <DurationStepper
            label="Hold 2"
            value={pattern.durations[3]}
            onChange={(val) => handleDurationChange(3, val)}
            min={0}
            color={COLORS[3]}
          />
        </div>
      )}

      {/* Preview */}
      <div
        style={{
          padding: 16,
          background: "var(--bg-card)",
          borderRadius: 12,
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        <div
          style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}
        >
          Preview
        </div>
        <div style={{ fontSize: 14, color: "var(--text-primary)" }}>
          {pattern.durations.join(" - ")} seconds
        </div>
        <div
          style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}
        >
          Total cycle: {pattern.durations.reduce((a, b) => a + b, 0)}s
        </div>
      </div>

      {/* Save Button */}
      <button className="save-btn" onClick={onSave}>
        Save Pattern
      </button>
    </Modal>
  );
}
