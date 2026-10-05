'use client';

import {Input as InputPrimitive} from '@base-ui/react/input';
import {useCallback, useLayoutEffect, useRef} from 'react';
import {cn} from '../lib/utils';

// A multi-line field. It grows with its content when `autoGrow` is set, up to the max height, then scrolls.
// It is sized on mount and when `value` changes from outside, not only on typing.

type TextareaProps = Omit<React.ComponentProps<'textarea'>, 'className'> & {
  className?: string;
  /** Grow with the text up to max-h-60 (240px). */
  autoGrow?: boolean;
};

function Textarea({className, autoGrow, onInput, value, ...props}: TextareaProps) {
  const ref = useRef<HTMLInputElement>(null);
  const grow = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);
  // Size once on mount, and again when the value is set from outside.
  useLayoutEffect(() => { if (autoGrow) grow(ref.current); }, [autoGrow, value, grow]);
  return (
    <InputPrimitive
      ref={ref}
      data-slot="textarea"
      render={<textarea/>}
      value={value}
      onInput={(e: React.FormEvent<HTMLInputElement>) => {
        if (autoGrow) grow(e.currentTarget);
        (onInput as React.FormEventHandler<HTMLInputElement> | undefined)?.(e);
      }}
      className={cn(
        'block min-h-20 w-full min-w-0 resize-y rounded-field border border-line-strong bg-field px-3 py-2 text-sm text-fg outline-none',
        'placeholder:text-fg-3 hover:not-disabled:not-aria-invalid:border-control',
        'focus-visible:border-accent-line focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-0 focus-visible:outline-ring',
        'aria-invalid:border-danger disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-fg-disabled',
        autoGrow && 'max-h-60 resize-none',
        className,
      )}
      {...(props as Record<string, unknown>)}
    />
  );
}

export {Textarea, type TextareaProps};
