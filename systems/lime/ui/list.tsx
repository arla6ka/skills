import {cva, type VariantProps} from 'class-variance-authority';
import {ChevronRight, Icon, type LimeIcon} from '../icon';
import {cn} from '../lib/utils';

// Rows on a phone screen: transactions, settings, accounts. Each row has an optional leading mark (a
// ListIcon or an Avatar), a title, an optional line under it, and a trailing value (an amount, a switch,
// a badge) or a chevron. A row with href is a link, with onClick a button, otherwise plain. grouped puts
// the rows on a warm-grey card with inset hairlines; plain leaves them on the page.
//
// One action per row: a row that is a link or button holds no other control. A settings row with a
// Switch is a plain row, and the Switch is the control.

const listVariants = cva('flex flex-col', {
  variants: {
    variant: {
      plain: '',
      grouped: 'overflow-hidden rounded-panel bg-surface',
    },
  },
  defaultVariants: {variant: 'plain'},
});

type ListProps = React.ComponentProps<'ul'> & VariantProps<typeof listVariants>;

function List({className, variant, ...props}: ListProps) {
  return <ul data-slot="list" data-variant={variant ?? 'plain'} role="list" className={cn(listVariants({variant}), 'group/list', className)} {...props}/>;
}

type ListItemProps = Omit<React.ComponentProps<'li'>, 'title' | 'onClick'> & {
  title: React.ReactNode;
  /** A second line: a date, a category, a setting's current value. */
  description?: React.ReactNode;
  /** A ListIcon or an Avatar. */
  leading?: React.ReactNode;
  /** A value at the end: an amount, a Switch, a Badge. */
  trailing?: React.ReactNode;
  /** A chevron at the end, for a row that opens something. On by default when the row has href. */
  chevron?: boolean;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

const rowClass = cn(
  'relative flex w-full min-h-14 items-center gap-3 p-4 text-start outline-none',
  'focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
  // The hairline sits under the text, not the leading mark, and the last row has none.
  'after:absolute after:inset-x-4 after:bottom-0 after:h-px after:bg-line group-last/item:after:hidden',
);

const pressable = 'cursor-pointer transition-colors duration-(--dur-instant) hover:bg-surface-2 active:bg-surface-3 group-data-[variant=grouped]/list:hover:bg-surface-2';

function ListItem({title, description, leading, trailing, chevron, href, onClick, disabled, className, ...props}: ListItemProps) {
  const showChevron = chevron ?? Boolean(href);
  const body = <>
    {leading && <span data-slot="list-leading" className="flex shrink-0">{leading}</span>}
    <span className="flex min-w-0 flex-1 flex-col">
      <span data-slot="list-title" className="truncate text-base leading-snug font-medium text-fg">{title}</span>
      {description && <span data-slot="list-description" className="truncate text-sm text-fg-3">{description}</span>}
    </span>
    {trailing && <span data-slot="list-trailing" className="flex shrink-0 items-center text-base text-fg tabular-nums">{trailing}</span>}
    {showChevron && <Icon icon={ChevronRight} size={16} className="-me-1 text-fg-3 rtl:-scale-x-100"/>}
  </>;
  return (
    <li data-slot="list-item" className={cn('group/item', className)} {...props}>
      {href && !disabled
        ? <a data-slot="list-row" href={href} className={cn(rowClass, pressable, leading && 'after:start-17')}>{body}</a>
        : onClick
          ? <button data-slot="list-row" type="button" onClick={onClick} disabled={disabled} className={cn(rowClass, pressable, leading && 'after:start-17', 'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent')}>{body}</button>
          : <div data-slot="list-row" className={cn(rowClass, leading && 'after:start-17', disabled && 'opacity-50')}>{body}</div>}
    </li>
  );
}

const listIconVariants = cva('inline-flex size-10 shrink-0 items-center justify-center rounded-full', {
  variants: {
    tone: {
      neutral: 'bg-surface-2 text-fg',
      accent: 'bg-accent-wash text-fg',
      success: 'bg-success-tint text-success-text',
      danger: 'bg-danger-tint text-danger-text',
    },
  },
  defaultVariants: {tone: 'neutral'},
});

type ListIconProps = Omit<React.ComponentProps<'span'>, 'children'> & VariantProps<typeof listIconVariants> & {icon: LimeIcon};

/** The round 40px mark at the start of a row, such as a merchant's category. */
function ListIcon({icon, tone, className, ...props}: ListIconProps) {
  return <span data-slot="list-icon" aria-hidden="true" className={cn(listIconVariants({tone}), className)} {...props}><Icon icon={icon} size={20}/></span>;
}

export {List, ListItem, ListIcon, listVariants, type ListProps, type ListItemProps, type ListIconProps};
