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
      <div className="viz-list">
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
            <div className="viz-content">
              <div className="viz-name">{viz.name}</div>
              <div className="viz-desc">{viz.desc}</div>
            </div>
            {currentVisualization === viz.id && (
              <span className="viz-check">✓</span>
            )}
          </button>
        ))}
      </div>
    </Modal>
  );
}
