import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useReducedMotion } from './useReducedMotion';

type ModalProps = React.HTMLAttributes<HTMLDivElement> & {
  open: boolean;
  onClose: () => void;
  title: string;
};

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
// Must match the --animate-sheet-out duration in src/index.css.
const SHEET_EXIT_MS = 200;

/**
 * Accessible dialog: portal to body, focus moves into the panel on open and
 * back to the opener on close, Tab is trapped inside, Escape and a backdrop
 * click call onClose. There is no built-in close button — callers supply
 * actions, Esc/backdrop are the documented close paths. Slides in as a sheet
 * (bottom on phone, centered on desktop) and, unless motion is reduced,
 * stays mounted for the matching exit animation before unmounting.
 */
export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, ...rest }) => {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(open);
  // Latest onClose without re-running the open effect: callers typically pass
  // an inline arrow, and re-running on every parent render would steal focus
  // back to the panel and lose the remembered opener.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // An open request must paint the panel in the SAME commit (the focus effect
  // below expects it), so flip the mount flag during render — React restarts
  // the render immediately.
  if (open && !mounted) setMounted(true);
  // Reduced motion holds no mount to animate out: unmount in the same render.
  if (!open && mounted && reducedMotion) setMounted(false);

  // Closing holds the mount just long enough to play the exit animation; the
  // focus/overflow effects below are keyed on `open`, so the dialog releases
  // focus and scroll as soon as it closes.
  useEffect(() => {
    if (open || !mounted || reducedMotion) return;
    const exitTimer = setTimeout(() => setMounted(false), SHEET_EXIT_MS);
    return () => clearTimeout(exitTimer);
  }, [open, mounted, reducedMotion]);

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

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center ${open ? '' : 'pointer-events-none'}`}
      {...(open ? { onClick: onClose } : {})}
    >
      <div
        className={`absolute inset-0 bg-ink/50 ${open ? 'animate-fade-in' : 'animate-fade-out motion-reduce:animate-none'}`}
      />
      <div
        role="dialog"
        aria-modal={open ? true : undefined}
        aria-hidden={open ? undefined : true}
        aria-labelledby={titleId}
        ref={panelRef}
        tabIndex={-1}
        className={`relative rounded-t-[var(--radius-sheet)] rounded-b-none sm:rounded-[var(--radius-sheet)] bg-surface-raised text-ink shadow-card p-6 w-full sm:max-w-md ${
          open ? 'animate-sheet-in' : 'animate-sheet-out motion-reduce:animate-none'
        }`}
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
