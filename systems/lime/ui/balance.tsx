import {cva, type VariantProps} from 'class-variance-authority';
import {Icon, Wallet} from '../icon';
import {cn} from '../lib/utils';
import {formatAmount, spokenAmount} from './amount';

// The amount a person has left, kept in the header, lit with the subtle lime glow. Pass `low` under your
// own limit and it turns amber and says so in words. It is a button: onClick opens the add money flow, or
// `render` makes it a link.

const balanceVariants = cva([
  'inline-flex h-8 items-center gap-1.5 rounded-control px-3 text-sm font-medium whitespace-nowrap tabular-nums transition-[background-color,color,box-shadow,scale] duration-(--dur-instant)',
  'active:not-disabled:scale-[0.98] motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-fg-disabled',
], {
  variants: {
    low: {
      // Low is flat: hover draws the amber edge, since there is no glow to light.
      true: 'bg-warn-tint text-warn-text hover:not-disabled:inset-ring hover:not-disabled:inset-ring-warn',
      false: 'glow glow-accent glow-subtle bg-accent text-on-accent',
    },
  },
  defaultVariants: {low: false},
});

type BalanceProps = Omit<React.ComponentProps<'button'>, 'children'> & VariantProps<typeof balanceVariants> & {
  /** The amount left, in major units. */
  value: number;
  /** An ISO 4217 code. */
  currency?: string;
  /** What pressing it does, spoken after the amount. */
  actionLabel?: string;
};

function Balance({value, currency = 'USD', low, actionLabel = 'Add money', className, ...props}: BalanceProps) {
  return (
    <button type="button" data-slot="balance" aria-label={`${spokenAmount(value, {currency})}${low ? ', running low' : ''}. ${actionLabel}`} className={cn(balanceVariants({low}), className)} {...props}>
      <Icon icon={Wallet} size={16}/>
      <span aria-hidden="true">{formatAmount(value, {currency})}</span>
      {low && <span aria-hidden="true" className="font-normal">left</span>}
    </button>
  );
}

export {Balance, balanceVariants, type BalanceProps};
