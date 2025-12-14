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
  if (!pattern) return null;

  return (
    <div className="modal" onClick={onCancel}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 340, textAlign: "center" }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            margin: "0 auto 16px",
            background: !canDelete
              ? "rgba(168, 212, 230, 0.15)"
              : "rgba(232, 196, 184, 0.15)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
          }}
        >
          {!canDelete ? "⚠️" : "🗑️"}
        </div>
        <h3
          style={{
            fontFamily: '"Fraunces", serif',
            fontSize: 20,
            fontWeight: 400,
            marginBottom: 8,
          }}
        >
          {!canDelete ? "Cannot Delete" : "Delete Pattern?"}
        </h3>
        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 14,
            marginBottom: 24,
            lineHeight: 1.5,
          }}
        >
          {!canDelete ? (
            "You need at least one pattern. Create a new pattern before deleting this one."
          ) : (
            <>
              Are you sure you want to delete "
              <span style={{ color: "#fff" }}>{pattern.name}</span>"? This
              action cannot be undone.
            </>
          )}
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          {!canDelete ? (
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: "12px 16px",
                background: "linear-gradient(135deg, #7dd3c0, #5fb8a5)",
                borderRadius: 12,
                color: "#1a1a2e",
                fontSize: 14,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Got It
            </button>
          ) : (
            <>
              <button
                onClick={onCancel}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  background: "linear-gradient(135deg, #e8c4b8, #d4a69a)",
                  borderRadius: 12,
                  color: "#1a1a2e",
                  fontSize: 14,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
