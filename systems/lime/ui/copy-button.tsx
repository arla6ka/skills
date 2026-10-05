'use client';

import {useEffect, useRef, useState} from 'react';
import {Checkmark, Copy, Icon, WarningFilled} from '../icon';
import {Button, type ButtonProps} from './button';

// Copies a string and says so: the icon turns to a check for a moment and a polite live region announces
// "Copied". If the clipboard write is refused, the icon turns to a warning and the region says "Copy
// failed". The region is a sibling of the button, so the button's name stays "Copy". Icon only by default,
// so it needs `label`; with `children` it becomes a labelled button.

type CopyButtonProps = Omit<ButtonProps, 'onClick' | 'icon'> & {
  /** The text to put on the clipboard. */
  value: string;
  /** The accessible name when there are no children, such as "Copy invite link". */
  label?: string;
  /** How long the check stays, in ms. */
  resetAfter?: number;
};

function CopyButton({value, label = 'Copy', resetAfter = 1600, variant = 'ghost', size, children, ...props}: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    let next: 'copied' | 'failed' = 'copied';
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      next = 'failed';
    }
    setState(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), resetAfter);
  }

  return (
    <>
      <Button
        data-slot="copy-button"
        data-state={state === 'idle' ? undefined : state}
        variant={variant}
        size={size ?? (children ? 'md' : 'icon-sm')}
        aria-label={children ? undefined : label}
        onClick={copy}
        icon={<Icon icon={state === 'copied' ? Checkmark : state === 'failed' ? WarningFilled : Copy} size={16} className={state === 'failed' ? 'text-danger-text' : undefined}/>}
        {...props}
      >
        {children}
      </Button>
      <span role="status" className="sr-only">{state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed' : ''}</span>
    </>
  );
}

export {CopyButton, type CopyButtonProps};
