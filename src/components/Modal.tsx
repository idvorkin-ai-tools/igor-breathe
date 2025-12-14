import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: number;
  showHeader?: boolean;
  centered?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 400,
  showHeader = true,
  centered = false,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth, textAlign: centered ? "center" : undefined }}
      >
        {showHeader && title && (
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button className="modal-close" onClick={onClose}>
              ×
            </button>
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
