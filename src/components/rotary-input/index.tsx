import clsx from 'clsx';
import { useCallback, useEffect, useRef, useState } from 'react';
import './index.css';

type RadialInputProps = {
  className?: string;
  offset?: number; // Offset in terms of segments (0-11)
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

const MAXIMUM_VALUE = 12;

const RotaryInput = ({
  className = '',
  offset = 0,
  value,
  onChange,
  min = 0,
  max = MAXIMUM_VALUE - 1,
  ...props
}: RadialInputProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(value);

  const element = useRef<HTMLDivElement>(null);

  const alignment = offset + 3;

  useEffect(() => {
    const capped = capRadialValue(value);
    if (capped !== value) {
      console.warn(`Value ${value} is out of bounds. Capping to ${capped}.`);
      onChange(capped);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const capped = capRadialValue(value);

    if (capped !== position) {
      onChange(capped);
    }

    setPosition(capped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!isDragging) {
      document.body.classList.remove('dragging');
      const cappedValue = capRadialValue(position);
      setPosition(cappedValue);
      onChange(cappedValue);
    } else {
      document.body.classList.add('dragging');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, position]);

  // ---- MOUSE EVENTS ---- //

  const mouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    // Only handle left mouse button
    if (event.button !== 0) {
      return;
    }

    setIsDragging(true);

    window.addEventListener('mousemove', dragMove);
    window.addEventListener('blur', dragEnd);
    window.addEventListener('mouseup', dragEnd, { once: true });
  };

  // ---- TOUCH EVENTS ---- //

  const touchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length > 1) {
      return; // Ignore multi-touch events
    }

    setIsDragging(true);
    const touch = event.touches[0];

    window.addEventListener('touchmove', touchMove, { passive: false });
    window.addEventListener('blur', dragEnd);
    window.addEventListener('touchend', dragEnd, { once: true });

    dragMove(
      new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      })
    );
  };

  const touchMove = (event: TouchEvent) => {
    if (event.touches.length > 1) {
      return; // Ignore multi-touch events
    }

    event.preventDefault();
    const touch = event.touches[0];

    dragMove(
      new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      })
    );
  };

  // ---- DRAGGING ---- //

  const dragMove = (event: MouseEvent) => {
    const rect = (element.current as HTMLDivElement).getBoundingClientRect();

    const angleSegment = (2 * Math.PI) / MAXIMUM_VALUE;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle =
      Math.atan2(event.clientY - centerY, event.clientX - centerX) -
      alignment * angleSegment;

    const normalizedAngle = (angle + 3 * Math.PI) / (2 * Math.PI);
    const newValue =
      Math.round(normalizedAngle * MAXIMUM_VALUE) % MAXIMUM_VALUE;

    setPosition(newValue);
  };

  const dragEnd = () => {
    setIsDragging(false);

    window.removeEventListener('blur', dragEnd);
    window.removeEventListener('touchmove', touchMove);
    window.removeEventListener('mousemove', dragMove);
  };

  // ----- VALUE HELPERS ----- //

  const capRadialValue = useCallback(
    (value: number): number => {
      if (value < min || value > max) {
        const distToMin = Math.min(
          (value - min + MAXIMUM_VALUE) % MAXIMUM_VALUE,
          (min - value + MAXIMUM_VALUE) % MAXIMUM_VALUE
        );

        const distToMax = Math.min(
          (value - max + MAXIMUM_VALUE) % MAXIMUM_VALUE,
          (max - value + MAXIMUM_VALUE) % MAXIMUM_VALUE
        );

        return distToMin <= distToMax ? min : max;
      }

      return value;
    },
    [min, max]
  );

  // ---- KEYBOARD EVENTS ---- //

  const keyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const newValue = capRadialValue(position - 1);
      setPosition(newValue);
      onChange(newValue);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const newValue = capRadialValue(position + 1);
      setPosition(newValue);
      onChange(newValue);
    }
  };

  return (
    <div
      {...props}
      className={clsx('rotary-input', className, {
        'rotary-input--shaking': position !== capRadialValue(position),
      })}
      onMouseDown={mouseDown}
      onTouchStart={touchStart}
      ref={element}
      style={
        {
          '--rotary-input-value': (position + alignment) % MAXIMUM_VALUE,
        } as React.CSSProperties
      }
      tabIndex={0}
      onKeyDown={keyDown}
    >
      <svg
        className="rotary-input__bg"
        shapeRendering="crispEdges"
        viewBox=" 0 -0.5 288 24"
      >
        <use href="#px-rotary-input-bg" />
      </svg>
    </div>
  );
};

export default RotaryInput;
