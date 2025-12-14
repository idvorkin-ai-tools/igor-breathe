import { Modal } from "./Modal";
import { VISUALIZATIONS } from "../types";

interface VisualizationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentVisualization: string;
  onSelect: (vizId: string) => void;
}

export function VisualizationPicker({
  isOpen,
  onClose,
  currentVisualization,
  onSelect,
}: VisualizationPickerProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose Visualization">
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {VISUALIZATIONS.map((viz) => (
          <button
            key={viz.id}
            className={`viz-option ${currentVisualization === viz.id ? "active" : ""}`}
            onClick={() => {
              onSelect(viz.id);
              onClose();
            }}
          >
            <div className="viz-icon">{viz.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, marginBottom: 2 }}>{viz.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                {viz.desc}
              </div>
            </div>
            {currentVisualization === viz.id && (
              <span style={{ color: "#7dd3c0" }}>\u2713</span>
            )}
          </button>
        ))}
      </div>
    </Modal>
  );
}
