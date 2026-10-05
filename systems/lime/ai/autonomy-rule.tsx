'use client';

import {cn} from '../lib/utils';
import {Input} from '../ui/input';

// How far the assistant may go on its own, written as one sentence with the limit inside it: "Ask me before
// paying over [$50]". The sentence is the label, so the person reads the rule and the number
// together and never has to map a slider to a meaning. The field is small and sits in the line; the whole
// sentence is its accessible name. kind="amount" puts a dollar sign in the field; kind="number" leaves it
// bare for a count of days or payments.
//
// size="inline" sets the field into a line of other text, such as a list row's second line: the field is one
// line tall, takes that line's type and grows with its value, sized in ch so it fits whatever size the text is
// (touch screens set fields to 16px). Its ring sits inside its edge, so a row that clips its overflow keeps it.

type AutonomyRuleProps = Omit<React.ComponentProps<'div'>, 'children' | 'onChange'> & {
  /** The words before the field, such as "Ask me before paying over". */
  before?: string;
  /** The words after the field, such as "days before it's due". */
  after?: string;
  /** The limit as the person typed it. Empty is allowed and reads as no limit set. */
  value: string;
  onValueChange?: (value: string) => void;
  /** amount shows a dollar sign; number is a bare count. */
  kind?: 'amount' | 'number';
  /** sm is a 32px field; inline is one line of the surrounding text. */
  size?: 'sm' | 'inline';
  disabled?: boolean;
};

function AutonomyRule({before, after, value, onValueChange, kind = 'amount', size = 'sm', disabled, className, style, ...props}: AutonomyRuleProps) {
  const amount = kind === 'amount';
  const inline = size === 'inline';
  const label = [before, amount ? `$${value || '…'}` : value || '…', after].filter(Boolean).join(' ');
  return (
    <div
      data-slot="autonomy-rule"
      data-kind={kind}
      data-size={size}
      // An inline field is as wide as its characters, the dollar sign included.
      style={inline ? {'--autonomy-chars': Math.max(value.length, 1) + (amount ? 1 : 0), ...style} as React.CSSProperties : style}
      className={cn('flex min-w-0 items-center', inline ? 'gap-1.5' : 'gap-2 text-sm', disabled ? 'text-fg-disabled' : !inline && 'text-fg', className)}
      {...props}
    >
      {before && <span className="min-w-0 truncate">{before}</span>}
      <span className="relative flex shrink-0">
        {amount && <span aria-hidden="true" className={cn('pointer-events-none absolute inset-y-0 flex items-center', inline ? 'start-1.5' : 'start-2.5', disabled ? 'text-fg-disabled' : 'text-fg-3')}>$</span>}
        <Input
          size="sm"
          inputMode={amount ? 'decimal' : 'numeric'}
          aria-label={label}
          value={value}
          disabled={disabled}
          onValueChange={v => onValueChange?.(v.replace(amount ? /[^\d.]/g : /\D/g, ''))}
          className={cn(
            'font-medium tabular-nums',
            inline
              ? 'h-lh w-[calc(var(--autonomy-chars)*1ch+--spacing(3)+2px)] rounded-sm px-1.5 text-start text-[length:inherit] leading-[inherit] focus-visible:-outline-offset-2'
              : cn('text-center', amount ? 'w-16 ps-5' : 'w-12 px-2'),
            inline && amount && 'ps-[calc(1ch+--spacing(1.5))]',
          )}
        />
      </span>
      {after && <span className="shrink-0 whitespace-nowrap">{after}</span>}
    </div>
  );
}

export {AutonomyRule, type AutonomyRuleProps};
