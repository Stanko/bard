import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import './index.css';

type DialogProps = React.DialogHTMLAttributes<HTMLDialogElement> & {
  children?: React.ReactNode;
  className?: string;
  isOpen?: boolean;
};

const ANIMATION_DURATION = 400;

const Dialog = ({
  className = '',
  children,
  isOpen = false,
  ...props
}: DialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (dialogRef.current) {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }

      if (isOpen) {
        dialogRef.current.showModal();
        timeoutId.current = setTimeout(() => {
          document.documentElement.classList.add('no-scroll');
        }, ANIMATION_DURATION);
      } else {
        dialogRef.current.close();
        timeoutId.current = setTimeout(() => {
          document.documentElement.classList.remove('no-scroll');
        }, ANIMATION_DURATION);
      }
    }

    return () => {
      dialogRef.current?.close();
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [isOpen]);

  return (
    <dialog {...props} ref={dialogRef} className={clsx('dialog', className)}>
      <div className="dialog__content px-border">
        <form className="dialog__close-form" method="dialog">
          <button className="dialog__close-button">
            Close
            <svg viewBox="0 0 5 5" fill="currentColor">
              <rect x="0" y="0" width="1" height="1" />
              <rect x="1" y="1" width="1" height="1" />
              <rect x="2" y="2" width="1" height="1" />
              <rect x="3" y="3" width="1" height="1" />
              <rect x="4" y="4" width="1" height="1" />
              <rect x="4" y="0" width="1" height="1" />
              <rect x="3" y="1" width="1" height="1" />
              <rect x="1" y="3" width="1" height="1" />
              <rect x="0" y="4" width="1" height="1" />
            </svg>
          </button>
        </form>
        {children}
      </div>

      <button
        tabIndex={-1}
        className="dialog__backdrop"
        onClick={() => dialogRef.current?.close()}
      />
    </dialog>
  );
};

export default Dialog;
