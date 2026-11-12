import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

type ModalProps = React.HTMLAttributes<HTMLDivElement> & {
  open: boolean;
  onClose: () => void;
  title: string;
};

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog: portal to body, focus moves into the panel on open and
 * back to the opener on close, Tab is trapped inside, Escape and a backdrop
 * click call onClose. There is no built-in close button — callers supply
 * actions, Esc/backdrop are the documented close paths.
 */
export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, ...rest }) => {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // Latest onClose without re-running the open effect: callers typically pass
  // an inline arrow, and re-running on every parent render would steal focus
  // back to the panel and lose the remembered opener.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const target = e.target as HTMLElement;
      if (!e.shiftKey && (target === last || !panel.contains(target))) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && (target === first || !panel.contains(target))) {
        e.preventDefault();
        last.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/50" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={panelRef}
        tabIndex={-1}
        className="relative rounded-t-[var(--radius-sheet)] rounded-b-none sm:rounded-[var(--radius-sheet)] bg-surface-raised text-ink shadow-card p-6 w-full sm:max-w-md"
        onClick={(e) => e.stopPropagation()}
        {...rest}
      >
        <h2 id={titleId} className="type-display text-lg mb-4">
          {title}
        </h2>
        {children}
      </div>
    </div>,
    document.body,
  );
};
