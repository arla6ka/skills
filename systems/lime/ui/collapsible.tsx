'use client';

import {Collapsible as CollapsiblePrimitive} from '@base-ui/react/collapsible';
import {ChevronDown, Icon} from '../icon';
import {cn} from '../lib/utils';

// One section that opens and closes: advanced settings, a long description, a receipt's details. The
// trigger is a real button with aria-expanded, and the panel animates its height over 200ms. For a stack
// of sections where one opens at a time use Accordion.

function Collapsible(props: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props}/>;
}

type CollapsibleTriggerProps = CollapsiblePrimitive.Trigger.Props & {
  /** Hides the caret, for a trigger that draws its own. */
  hideIcon?: boolean;
};

function CollapsibleTrigger({className, children, hideIcon, ...props}: CollapsibleTriggerProps) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={typeof className === 'function' ? className : cn('group/collapsible-trigger flex w-full items-center justify-between gap-2 rounded-md py-2 text-start text-sm font-medium underline-offset-4 hover:not-data-disabled:underline data-disabled:cursor-not-allowed data-disabled:text-fg-disabled', className)}
      {...props}
    >
      {children}
      {!hideIcon && <Icon icon={ChevronDown} size={16} className="text-fg-3 transition-transform duration-(--dur-fast) group-data-panel-open/collapsible-trigger:rotate-180 group-data-disabled/collapsible-trigger:text-fg-disabled"/>}
    </CollapsiblePrimitive.Trigger>
  );
}

function CollapsibleContent({className, ...props}: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className={typeof className === 'function' ? className : cn('h-(--collapsible-panel-height) overflow-hidden text-sm text-fg-2 transition-[height] duration-(--dur-base) ease-(--ease-out) data-ending-style:h-0 data-starting-style:h-0', className)}
      {...props}
    />
  );
}

export {Collapsible, CollapsibleTrigger, CollapsibleContent};
