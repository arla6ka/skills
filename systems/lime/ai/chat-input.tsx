'use client';

import {useId, useLayoutEffect, useRef, useState} from 'react';
import {ArrowUp, Icon} from '../icon';
import {cn} from '../lib/utils';
import {Button} from '../ui/button';
import {Amount, amountAffordability} from '../ui/amount';

// The box a person writes a request in, laid out like a phone composer: one row, 44px tall, with the extra
// controls at the start, the text in the middle and a 32px Send at the end. The text grows up to 8 lines and
// the controls stay on the last line. Enter sends, Shift+Enter breaks the line. The field clears when it
// sends, so to keep the draft when a request fails, control `value` and put the text back yourself. Send is
// the only lime in the row. Show the amount it will move beside Send with `amount`, before the person
// presses it.

type ChatInputProps = Omit<React.ComponentProps<'form'>, 'onSubmit' | 'onChange'> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called with the trimmed text when the person sends. */
  onSubmit: (text: string) => void;
  placeholder?: string;
  /** The money this request will move, and what is available. Negative is money out. */
  amount?: number;
  available?: number;
  currency?: string;
  /** A request is running. Send turns into Stop, which calls onStop. */
  running?: boolean;
  onStop?: () => void;
  disabled?: boolean;
  /** One or two 32px ghost icon buttons before the text, such as attach. */
  actions?: React.ReactNode;
};

// 8 lines of 24px, plus the field's 4px top and bottom padding.
const MAX_HEIGHT = 200;

function ChatInput({value, defaultValue = '', onValueChange, onSubmit, placeholder = 'Ask about your money', amount, available, currency, running, onStop, disabled, actions, className, ...props}: ChatInputProps) {
  const [inner, setInner] = useState(defaultValue);
  const text = value ?? inner;
  const field = useRef<HTMLTextAreaElement>(null);
  const id = useId();
  const canSend = !disabled && !running && text.trim().length > 0 && (amount === undefined || available === undefined || amountAffordability(amount, available) !== 'insufficient');

  // Fit the field to its text on every change, typed or set from outside.
  useLayoutEffect(() => {
    const el = field.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [text]);

  function set(next: string) {
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  }

  function send() {
    if (!canSend) return;
    onSubmit(text.trim());
    set('');
  }

  return (
    <form
      data-slot="chat-input"
      data-disabled={disabled || undefined}
      onSubmit={e => { e.preventDefault(); send(); }}
      onPointerDown={e => { if (e.target === e.currentTarget) { e.preventDefault(); field.current?.focus(); } }}
      className={cn(
        'flex w-full cursor-text items-end gap-1 rounded-sheet border border-line-strong bg-field p-1.5 transition-[border-color] duration-(--dur-instant)',
        'focus-within:border-accent-line has-focus:border-accent-line data-disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {actions && <div data-slot="chat-input-actions" className="flex shrink-0 items-center">{actions}</div>}
      <label htmlFor={id} className="sr-only">Message</label>
      <textarea
        ref={field}
        id={id}
        data-slot="chat-input-field"
        rows={1}
        value={text}
        disabled={disabled}
        placeholder={placeholder}
        onChange={e => set(e.currentTarget.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); }
        }}
        // The box shows focus on its border (focus-within), so the field draws no ring of its own; Lime's base
        // focus-visible ring would otherwise sit inside the box as a square.
        className={cn(
          'block h-8 max-h-50 min-w-0 flex-1 resize-none bg-transparent py-1 text-base leading-6 text-fg outline-none focus-visible:outline-none placeholder:text-fg-3 disabled:cursor-not-allowed disabled:text-fg-disabled',
          !actions && 'ps-2.5',
        )}
      />
      {amount !== undefined && <Amount value={amount} currency={currency} available={available} className="mb-1 shrink-0"/>}
      {running ? (
        <Button type="button" variant="solid" size="icon-sm" aria-label="Stop" onClick={onStop}>
          <span aria-hidden="true" className="size-2.5 bg-current"/>
        </Button>
      ) : (
        <Button type="submit" size="icon-sm" aria-label="Send" disabled={!canSend}>
          <Icon icon={ArrowUp} size={16}/>
        </Button>
      )}
    </form>
  );
}

export {ChatInput, type ChatInputProps};
