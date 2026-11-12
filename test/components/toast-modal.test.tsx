import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToastProvider, useToast } from '../../src/components/common/Toast';
import { Modal } from '../../src/components/common/Modal';

// Helper component to trigger toast
const ToastTrigger: React.FC = () => {
  const { notify } = useToast();
  return (
    <button onClick={() => notify('Test message')} data-testid="toast-trigger">
      Show Toast
    </button>
  );
};

describe('Toast system', () => {
  test('#unit toast displays message and auto dismisses', () => {
    jest.useFakeTimers();
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByTestId('toast-trigger'));
    expect(screen.getByText('Test message')).toBeInTheDocument();
    // advance time default 4000ms
    act(() => {
      jest.advanceTimersByTime(4000);
    });
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    jest.useRealTimers();
  });

  test('#unit sticky toast stays until dismissed', () => {
    jest.useFakeTimers();
    const StickyTrigger: React.FC = () => {
      const { notify } = useToast();
      return (
        <button onClick={() => notify('Sticky', { duration: 0 })} data-testid="sticky-trigger">
          Sticky
        </button>
      );
    };
    render(
      <ToastProvider>
        <StickyTrigger />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByTestId('sticky-trigger'));
    // There are two elements with text 'Sticky' (button and toast). Find the toast inside the status region.
    const toastElems = screen.getAllByText('Sticky');
    const toast = toastElems.find((el) => el.closest('[role="status"]'));
    expect(toast).toBeInTheDocument();
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    // Still present after time advance
    const stillElems = screen.getAllByText('Sticky');
    const stillToast = stillElems.find((el) => el.closest('[role="status"]'));
    expect(stillToast).toBeInTheDocument();
    // dismiss via button
    fireEvent.click(screen.getByLabelText('Fechar'));
    // Ensure the toast (not the trigger button) is gone
    const remaining = screen.queryAllByText('Sticky');
    const toastRemaining = remaining.find((el) => el.closest('[role="status"]'));
    expect(toastRemaining).toBeUndefined();
    jest.useRealTimers();
  });

  test('#unit toast queue evicts oldest when exceeding limit', () => {
    jest.useFakeTimers();
    const MultiTrigger: React.FC = () => {
      const { notify } = useToast();
      return (
        <div>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => notify(`Msg ${n}`)} data-testid={`trigger-${n}`}>
              Show {n}
            </button>
          ))}
        </div>
      );
    };
    render(
      <ToastProvider>
        <MultiTrigger />
      </ToastProvider>,
    );
    // fire 5 toasts quickly
    for (let i = 1; i <= 5; i++) {
      fireEvent.click(screen.getByTestId(`trigger-${i}`));
    }
    // only last 4 should be present
    expect(screen.queryByText('Msg 1')).not.toBeInTheDocument();
    for (let i = 2; i <= 5; i++) {
      expect(screen.getByText(`Msg ${i}`)).toBeInTheDocument();
    }
    jest.useRealTimers();
  });

  test('#unit useToast outside provider throws', () => {
    const BadComponent: React.FC = () => {
      const { notify } = useToast();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _ = () => notify('X');
      return null;
    };
    const consoleError = console.error;
    console.error = jest.fn(); // suppress error output
    expect(() => render(<BadComponent />)).toThrow();
    console.error = consoleError;
  });
});

describe('Modal component', () => {
  test('#unit modal renders when open and focuses panel', () => {
    const onClose = jest.fn();
    const { rerender } = render(
      <Modal open={false} onClose={onClose} title="My Modal">
        <button>Inside</button>
      </Modal>,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(
      <Modal open={true} onClose={onClose} title="My Modal">
        <button>Inside</button>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const titleEl = screen.getByText('My Modal');
    expect(titleEl).toBeInTheDocument();
    // panel should receive focus
    expect(document.activeElement).toBe(dialog);
  });

  test('#unit modal escape key triggers onClose', () => {
    const onClose = jest.fn();
    render(
      <Modal open={true} onClose={onClose} title="Esc Test">
        <button>Inside</button>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('#unit modal backdrop click triggers onClose', () => {
    const onClose = jest.fn();
    render(
      <Modal open={true} onClose={onClose} title="Backdrop Test">
        <button>Inside</button>
      </Modal>,
    );
    // click on overlay background (the element wrapping the dialog)
    const dialog = screen.getByRole('dialog');
    const overlay = dialog.parentElement as HTMLElement;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  test('#unit tab wraps to the first focusable at the end of the panel', () => {
    const onClose = jest.fn();
    render(
      <Modal open={true} onClose={onClose} title="Tab Trap">
        <button data-testid="first">First</button>
        <button data-testid="second">Second</button>
      </Modal>,
    );
    const first = screen.getByTestId('first');
    const second = screen.getByTestId('second');
    second.focus();
    fireEvent.keyDown(second, { key: 'Tab' });
    expect(document.activeElement).toBe(first);
  });

  test('#unit shift+tab wraps to the last focusable at the start of the panel', () => {
    const onClose = jest.fn();
    render(
      <Modal open={true} onClose={onClose} title="Tab Trap">
        <button data-testid="first">First</button>
        <button data-testid="second">Second</button>
      </Modal>,
    );
    const first = screen.getByTestId('first');
    const second = screen.getByTestId('second');
    first.focus();
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(second);
  });

  test('#unit aria-labelledby points at the title element', () => {
    const onClose = jest.fn();
    render(
      <Modal open={true} onClose={onClose} title="Labelled">
        <button>Inside</button>
      </Modal>,
    );
    const dialog = screen.getByRole('dialog');
    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy as string)).toHaveTextContent('Labelled');
  });

  test('#unit re-rendering with a fresh onClose does not steal focus from inside the dialog', () => {
    const Wrapper: React.FC<{ onClose: () => void }> = ({ onClose }) => (
      <Modal open={true} onClose={onClose} title="Churn">
        <button data-testid="inside">Inside</button>
      </Modal>
    );
    const { rerender } = render(<Wrapper onClose={jest.fn()} />);
    const inside = screen.getByTestId('inside');
    inside.focus();
    rerender(<Wrapper onClose={jest.fn()} />);
    expect(document.activeElement).toBe(inside);
  });

  test('#unit unmounting while open returns focus to the opener', () => {
    const Wrapper: React.FC<{ showModal: boolean }> = ({ showModal }) => (
      <div>
        <button data-testid="opener">Opener</button>
        {showModal && (
          <Modal open={true} onClose={jest.fn()} title="Unmount">
            <button>Inside</button>
          </Modal>
        )}
      </div>
    );
    render(<Wrapper showModal={false} />);
    const opener = screen.getByTestId('opener');
    opener.focus();
    const { rerender } = render(<Wrapper showModal={true} />);
    expect(document.activeElement).toBe(screen.getByRole('dialog'));
    rerender(<Wrapper showModal={false} />);
    expect(document.activeElement).toBe(opener);
  });

  test('#unit modal restores focus after close', () => {
    const Wrapper: React.FC = () => {
      const [open, setOpen] = React.useState(false);
      return (
        <div>
          <button data-testid="outside">Outside</button>
          <button data-testid="openBtn" onClick={() => setOpen(true)}>
            Open Modal
          </button>
          <Modal open={open} onClose={() => setOpen(false)} title="Restore">
            <button>Inside</button>
          </Modal>
        </div>
      );
    };
    render(<Wrapper />);
    const outside = screen.getByTestId('outside');
    outside.focus();
    const openBtn = screen.getByTestId('openBtn');
    fireEvent.click(openBtn);
    const dialog = screen.getByRole('dialog');
    // focus should have moved to dialog automatically
    expect(document.activeElement).toBe(dialog);
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    // after close, focus should return to outside button
    expect(document.activeElement).toBe(outside);
  });
});
