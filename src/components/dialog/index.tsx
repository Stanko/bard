import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import './index.css';

type DialogProps = React.DialogHTMLAttributes<HTMLDialogElement> & {
  children?: React.ReactNode;
  className?: string;
  isOpen?: boolean;
};

const Dialog = ({
  className = '',
  children,
  isOpen = false,
  ...props
}: DialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (dialogRef.current) {
      if (isOpen) {
        dialogRef.current.showModal();
      } else {
        dialogRef.current.close();
      }
    }

    return () => {
      dialogRef.current?.close();
    };
  }, [isOpen]);

  return (
    <dialog {...props} ref={dialogRef} className={clsx('dialog', className)}>
      <button
        tabIndex={-1}
        className="dialog__backdrop"
        onClick={() => dialogRef.current?.close()}
      />
      <div className="dialog__content px-border">
        <form className="dialog__close-form" method="dialog">
          <button className="dialog__close-button">Close</button>
        </form>
        {children}
      </div>
    </dialog>
  );
};

export default Dialog;
