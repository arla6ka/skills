import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '../lib/utils';

// A money amount: a sign, a currency and tabular figures, so a column of them lines up. Negative is money
// out and reads "−$12.40"; `signed` adds a plus to money in. Pass `available` and an outgoing amount tones
// itself: amber when the payment leaves under 20% of it in the account, red when it cannot be covered. The
// spoken amount is real text (sr-only), so it is read in order and found by page search, not an aria-label
// on a role-less span.

type Affordability = 'unknown' | 'insufficient' | 'tight' | 'comfortable';

type FormatOptions = {currency?: string; compact?: boolean; signed?: boolean};

const MINUS = '−';

/** The amount as text: "$12.40", "−$12.40", or "+$12.40" with `signed`. Compact drops the cents. */
function formatAmount(value: number, {currency = 'USD', compact, signed}: FormatOptions = {}) {
  const digits = compact ? {minimumFractionDigits: 0, maximumFractionDigits: 0} : {};
  const number = new Intl.NumberFormat('en-US', {style: 'currency', currency, ...digits}).format(Math.abs(value));
  if (value < 0) return `${MINUS}${number}`;
  return signed && value > 0 ? `+${number}` : number;
}

/** The amount in words for a screen reader: "minus 12.40 US dollars". */
function spokenAmount(value: number, {currency = 'USD', signed}: Pick<FormatOptions, 'currency' | 'signed'> = {}) {
  const words = new Intl.NumberFormat('en-US', {style: 'currency', currency, currencyDisplay: 'name'}).format(Math.abs(value));
  if (value < 0) return `minus ${words}`;
  return signed && value > 0 ? `plus ${words}` : words;
}

/** Whether `available` covers an outgoing `value`. Tight is under 20% of the payment left after paying. */
function amountAffordability(value: number, available: number | null | undefined): Affordability {
  if (available === null || available === undefined || !Number.isFinite(available)) return 'unknown';
  const spend = value < 0 ? -value : 0;
  if (spend > available) return 'insufficient';
  if (spend > 0 && available - spend < spend * 0.2) return 'tight';
  return 'comfortable';
}

const amountVariants = cva('inline-flex shrink-0 items-center rounded-control font-medium whitespace-nowrap tabular-nums', {
  variants: {
    tone: {
      neutral: 'bg-surface-2 text-fg-2',
      accent: 'bg-accent-wash text-fg',
      warn: 'bg-warn-tint text-warn-text',
      danger: 'bg-danger-tint text-danger-text',
    },
    size: {
      sm: 'h-5 px-2 text-xs',
      md: 'h-6 px-2.5 text-xs',
      lg: 'h-7 px-3 text-sm',
    },
  },
  defaultVariants: {tone: 'neutral', size: 'md'},
});

type AmountProps = Omit<React.ComponentProps<'span'>, 'children'> & VariantProps<typeof amountVariants> & {
  /** Signed. Negative is money out. */
  value: number;
  /** An ISO 4217 code. */
  currency?: string;
  /** The money in the account. Sets the tone of an outgoing amount by affordability. */
  available?: number | null;
  /** Show a plus on money in. */
  signed?: boolean;
  /** Whole units, without the cents. */
  compact?: boolean;
  /** An estimate: renders a tilde before the amount. */
  approximate?: boolean;
  /** The least it can be: renders "$12+". An estimate wins if both are set. */
  atLeast?: boolean;
};

function Amount({value, currency = 'USD', available, signed, compact, approximate, atLeast, tone, size, className, ...props}: AmountProps) {
  const afford = amountAffordability(value, available);
  const resolved = tone ?? (afford === 'insufficient' ? 'danger' : afford === 'tight' ? 'warn' : 'neutral');
  const base = formatAmount(value, {currency, compact, signed});
  const text = approximate ? `~${base}` : atLeast ? `${base}+` : base;
  const spoken = `${approximate ? 'about ' : atLeast ? 'at least ' : ''}${spokenAmount(value, {currency, signed})}${afford === 'insufficient' ? ', more than you have available' : ''}`;
  return (
    <span data-slot="amount" data-affordability={afford} className={cn(amountVariants({tone: resolved, size}), className)} {...props}>
      <span dir="ltr" aria-hidden="true">{text}</span>
      <span className="sr-only">{spoken}</span>
    </span>
  );
}

export {Amount, amountAffordability, formatAmount, spokenAmount, amountVariants, type AmountProps, type Affordability};
