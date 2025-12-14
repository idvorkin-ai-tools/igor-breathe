import { Modal } from "./Modal";
import { Pattern } from "../types";

interface DeleteConfirmModalProps {
  pattern: Pattern | null;
  canDelete: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  pattern,
  canDelete,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      isOpen={!!pattern}
      onClose={onCancel}
      maxWidth={340}
      showHeader={false}
      centered
    >
      <div className={`confirm-icon ${!canDelete ? "confirm-icon--warning" : "confirm-icon--danger"}`}>
        {!canDelete ? "⚠️" : "🗑️"}
      </div>
      <h3 className="confirm-title">
        {!canDelete ? "Cannot Delete" : "Delete Pattern?"}
      </h3>
      <p className="confirm-description">
        {!canDelete ? (
          "You need at least one pattern. Create a new pattern before deleting this one."
        ) : (
          <>
            Are you sure you want to delete "
            <span style={{ color: "var(--text-primary)" }}>{pattern?.name}</span>
            "? This action cannot be undone.
          </>
        )}
      </p>
      <div className="confirm-actions">
        {!canDelete ? (
          <button className="modal-btn modal-btn--primary" onClick={onCancel}>
            Got It
          </button>
        ) : (
          <>
            <button className="modal-btn modal-btn--secondary" onClick={onCancel}>
              Cancel
            </button>
            <button className="modal-btn modal-btn--danger" onClick={onConfirm}>
              Delete
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}
