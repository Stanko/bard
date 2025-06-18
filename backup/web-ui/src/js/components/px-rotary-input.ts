import './px-rotary-input.css';

const MAXIMUM_VALUE = 12;

class PixelRotaryInput extends HTMLElement {
  static observedAttributes = ['value'];

  private value = 0;
  private offset = 0;
  private isDragging = false;
  private min = 0;
  private max = MAXIMUM_VALUE - 1;

  constructor() {
    super();
    this.addEventListener('mousedown', this.dragStart);
    this.addEventListener('touchstart', this.touchStart);

    this.min = this.parseAttribute('min');
    this.max = this.parseAttribute('max', (MAXIMUM_VALUE - 1).toString());
    this.value = this.parseAttribute('value');
    this.offset = this.parseAttribute('offset');

    this.updateValue(this.value);
  }

  // ----- TOUCH EVENTS ----- //

  touchStart = (event: TouchEvent) => {
    if (event.touches.length > 1) {
      return; // Ignore multi-touch events
    }

    this.isDragging = true;
    document.body.classList.add('px-dragging');
    const touch = event.touches[0];

    window.addEventListener('touchmove', this.touchMove, { passive: false });
    window.addEventListener('blur', this.touchEnd);
    window.addEventListener('touchend', this.touchEnd, { once: true });

    this.dragMove(
      new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      })
    );
  };

  touchMove = (event: TouchEvent) => {
    if (!this.isDragging || event.touches.length > 1) {
      return; // Ignore multi-touch events
    }

    event.preventDefault();

    const touch = event.touches[0];

    this.dragMove(
      new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      })
    );
  };

  touchEnd = () => {
    this.updateValue(this.capRadialValue(this.value));

    this.isDragging = false;
    document.body.classList.remove('px-dragging');
    window.removeEventListener('blur', this.touchEnd);
    window.removeEventListener('touchmove', this.touchMove);
  };

  // ----- MOUSE EVENTS ----- //

  dragStart = () => {
    this.isDragging = true;
    document.body.classList.add('px-dragging');

    window.addEventListener('mousemove', this.dragMove);
    window.addEventListener('blur', this.dragEnd);
    window.addEventListener('mouseup', this.dragEnd, { once: true });
  };

  dragMove = (event: MouseEvent) => {
    if (!this.isDragging) {
      return;
    }

    const rect = this.getBoundingClientRect();
    const angleSegment = (2 * Math.PI) / MAXIMUM_VALUE;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle =
      Math.atan2(event.clientY - centerY, event.clientX - centerX) -
      this.offset * angleSegment;

    const normalizedAngle = (angle + 3 * Math.PI) / (2 * Math.PI);
    let newValue = Math.round(normalizedAngle * MAXIMUM_VALUE) % MAXIMUM_VALUE;

    this.updateValue(newValue);
  };

  dragEnd = () => {
    this.updateValue(this.capRadialValue(this.value));

    this.isDragging = false;
    document.body.classList.remove('px-dragging');
    window.removeEventListener('blur', this.dragEnd);
    window.removeEventListener('mousemove', this.dragMove);
  };

  updateValue(newValue: number) {
    // Update the value visually to rotate the knob, even if it is out of range.
    this.style.setProperty(
      '--value',
      ((newValue + this.offset) % MAXIMUM_VALUE).toString()
    );

    if (newValue === this.value) {
      return;
    }

    // Ensure the value is within the defined min and max range.
    const capped = this.capRadialValue(newValue);

    if (capped !== this.value) {
      // Update the internal value and rotate the knob to the new position.
      this.value = capped;

      if (!this.isDragging) {
        this.style.setProperty(
          '--value',
          ((capped + this.offset) % MAXIMUM_VALUE).toString()
        );
      }

      this.dispatchEvent(
        new CustomEvent('change', {
          detail: { value: this.value },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  parseAttribute = (attribute: string, defaultString: string = '0'): number => {
    const value = parseInt(this.getAttribute(attribute) || defaultString, 10);

    return value % MAXIMUM_VALUE;
  };

  capRadialValue = (value: number): number => {
    const { min, max } = this;

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
  };

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (name === 'value') {
      this.updateValue(
        this.capRadialValue(parseInt(newValue, 10) % MAXIMUM_VALUE)
      );
    }
  }
}

customElements.define('px-rotary-input', PixelRotaryInput);

document.addEventListener('DOMContentLoaded', () => {
  const input = document.querySelector('px-rotary-input') as PixelRotaryInput;
  const radios = [
    ...document.querySelectorAll('.datasets__radios input'),
  ] as HTMLInputElement[];

  // const valueDiv = input.nextElementSibling as HTMLDivElement;

  // valueDiv.innerHTML = `Value: ${input.getAttribute('value') || '0'}`;

  radios[input.getAttribute('value') || 0].checked = true;

  input.addEventListener('change', (event: Event) => {
    const value = (event as CustomEvent).detail.value;

    radios[value].checked = true;

    // valueDiv.innerHTML = `Value: ${value}`;
  });
});
