'use client';

import {Toggle as TogglePrimitive} from '@base-ui/react/toggle';
import {Checkmark, Close, Icon} from '../icon';
import {cn} from '../lib/utils';

// Something the person acts on: a filter, a topic, a model to pick. Chosen takes the soft lime wash, an
// olive edge and a check that appears in front of the label (the chip grows by the check's width), so it reads without colour. Badge is the static one. With `onRemove` the chip
// grows a close button as a sibling control, so there are never two buttons inside one button.

const chipClass = cn(
  'group/chip inline-flex h-(--control-sm) items-center gap-1.5 rounded-control border border-line-strong bg-page px-3 text-sm font-medium whitespace-nowrap text-fg select-none',
  'transition-[background-color,border-color] duration-(--dur-instant) ease-out [-webkit-tap-highlight-color:transparent]',
  'hover:not-data-disabled:bg-surface data-pressed:border-accent-line data-pressed:bg-accent-wash data-pressed:hover:not-data-disabled:bg-accent-wash',
  'data-disabled:cursor-not-allowed data-disabled:text-fg-disabled [&_svg]:shrink-0',
);

type ChipProps = TogglePrimitive.Props & {
  /** Adds a close button after the label. Name the chip in `removeLabel`: "Remove Dining". */
  onRemove?: () => void;
  removeLabel?: string;
};

function Chip({className, onRemove, removeLabel = 'Remove', children, ...props}: ChipProps) {
  const toggle = (
    <TogglePrimitive
      data-slot="chip"
      className={typeof className === 'function' ? state => cn(chipClass, onRemove && 'rounded-e-none border-e-0 pe-2', className(state)) : cn(chipClass, onRemove && 'rounded-e-none border-e-0 pe-2', className)}
      {...props}
    >
      <Icon icon={Checkmark} size={16} data-slot="chip-check" className="hidden group-data-pressed/chip:block"/>
      {children}
    </TogglePrimitive>
  );
  if (!onRemove) return toggle;
  return (
    <span data-slot="chip-group" className="inline-flex">
      {toggle}
      <button
        type="button"
        data-slot="chip-remove"
        aria-label={removeLabel}
        onClick={onRemove}
        className="inline-flex h-(--control-sm) items-center rounded-e-control border border-s-0 border-line-strong bg-page ps-1 pe-2.5 text-fg-3 hover:bg-surface hover:text-fg focus-visible:-outline-offset-2"
      >
        <Icon icon={Close} size={16}/>
      </button>
    </span>
  );
}

export {Chip, chipClass, type ChipProps};
