'use client';

import {Input as InputPrimitive} from '@base-ui/react/input';
import {mergeProps} from '@base-ui/react/merge-props';
import type {VariantProps} from 'class-variance-authority';
import {useCallback, useLayoutEffect, useRef} from 'react';
import {mergeClass} from '../lib/utils';
import {fieldControl} from './input';

// A multi-line field, Input's sibling: the same fill, edge, ring and invalid and disabled looks, from the same
// fieldControl, and the same size prop for its type (sm and md are 14px, lg 16px). It is at least 80px tall. It
// grows with its content when `autoGrow` is set, up to the max height, then scrolls. It is sized on mount and when
// `value` changes from outside, not only on typing.

type TextareaProps = Omit<React.ComponentProps<'textarea'>, 'className'> & VariantProps<typeof fieldControl> & {
  /** A string, or a function of the field's state (dirty, touched, valid ...) like every Base UI part. */
  className?: InputPrimitive.Props['className'];
  /** Grow with the text up to max-h-60 (240px). */
  autoGrow?: boolean;
};

function Textarea({className, size, autoGrow, onInput, value, defaultValue, ref, ...props}: TextareaProps) {
  const own = useRef<HTMLTextAreaElement | null>(null);
  const grow = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);
  // Ours for autoGrow, and the caller's.
  const setRef = useCallback((el: HTMLElement | null) => {
    const area = el as HTMLTextAreaElement | null;
    own.current = area;
    if (typeof ref === 'function') ref(area);
    else if (ref) ref.current = area;
  }, [ref]);
  // Size once on mount, and again when the value is set from outside.
  useLayoutEffect(() => { if (autoGrow) grow(own.current); }, [autoGrow, value, grow]);
  return (
    <InputPrimitive
      ref={setRef}
      data-slot="textarea"
      value={value}
      defaultValue={defaultValue}
      className={mergeClass([fieldControl({size}), 'block h-auto min-h-20 resize-y py-2', autoGrow && 'max-h-60 resize-none'], className)}
      // The textarea's own props join Base UI's here, typed for a textarea; mergeProps chains the handlers, so
      // Field still sees every change.
      render={inputProps => <textarea {...mergeProps<'textarea'>(inputProps, props, {
        onInput: e => { if (autoGrow) grow(e.currentTarget); onInput?.(e); },
      })}/>}
    />
  );
}

export {Textarea, type TextareaProps};
