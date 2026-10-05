'use client';

import {cn} from '../lib/utils';
import {Input} from '../ui/input';

// How far the assistant may go on its own, written as one sentence with the limit inside it: "Ask me before
// paying over [$50]". The sentence is the label, so the person reads the rule and the number
// together and never has to map a slider to a meaning. The field is small and sits in the line; the whole
// sentence is its accessible name. kind="amount" puts a dollar sign in the field; kind="number" leaves it
// bare for a count of days or payments.

type AutonomyRuleProps = Omit<React.ComponentProps<'div'>, 'children' | 'onChange'> & {
  /** The words before the field, such as "Ask me before paying over". */
  before: string;
  /** The words after the field, such as "days before it's due". */
  after?: string;
  /** The limit as the person typed it. Empty is allowed and reads as no limit set. */
  value: string;
  onValueChange?: (value: string) => void;
  /** amount shows a dollar sign; number is a bare count. */
  kind?: 'amount' | 'number';
  disabled?: boolean;
};

function AutonomyRule({before, after, value, onValueChange, kind = 'amount', disabled, className, ...props}: AutonomyRuleProps) {
  const label = [before, kind === 'amount' ? `$${value || '…'}` : value || '…', after].filter(Boolean).join(' ');
  return (
    <div data-slot="autonomy-rule" data-kind={kind} className={cn('flex min-w-0 items-center gap-2 text-sm', disabled ? 'text-fg-disabled' : 'text-fg', className)} {...props}>
      <span className="min-w-0 truncate">{before}</span>
      <span className="relative shrink-0">
        {kind === 'amount' && <span aria-hidden="true" className={cn('pointer-events-none absolute inset-y-0 start-2.5 flex items-center', disabled ? 'text-fg-disabled' : 'text-fg-3')}>$</span>}
        <Input
          size="sm"
          inputMode={kind === 'amount' ? 'decimal' : 'numeric'}
          aria-label={label}
          value={value}
          disabled={disabled}
          onValueChange={v => onValueChange?.(v.replace(kind === 'amount' ? /[^\d.]/g : /\D/g, ''))}
          className={cn('text-center font-medium tabular-nums', kind === 'amount' ? 'w-16 ps-5' : 'w-12 px-2')}
        />
      </span>
      {after && <span className="shrink-0 whitespace-nowrap">{after}</span>}
    </div>
  );
}

export {AutonomyRule, type AutonomyRuleProps};
