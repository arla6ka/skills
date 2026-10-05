'use client';

import {Toggle as TogglePrimitive} from '@base-ui/react/toggle';
import {Toolbar as ToolbarPrimitive} from '@base-ui/react/toolbar';
import {cn} from '../lib/utils';

// A row of related controls that act on one thing, such as formatting or playback. It is one tab stop;
// arrow keys move between the controls inside. Icon buttons need an aria-label. A pressed toggle takes the
// soft lime wash.
// Items never wrap. A toolbar wider than its container scrolls sideways, and keeps its 32px pill.

function Toolbar({className, ...props}: ToolbarPrimitive.Root.Props) {
  return <ToolbarPrimitive.Root data-slot="toolbar" className={typeof className === 'function' ? className : cn('inline-flex w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-control bg-surface p-1', className)} {...props}/>;
}

function ToolbarGroup({className, ...props}: ToolbarPrimitive.Group.Props) {
  return <ToolbarPrimitive.Group data-slot="toolbar-group" className={typeof className === 'function' ? className : cn('flex items-center gap-0.5', className)} {...props}/>;
}

const itemClass = cn(
  'inline-flex h-(--control-sm) min-w-(--control-sm) shrink-0 items-center justify-center gap-1.5 rounded-control px-2 text-sm font-medium whitespace-nowrap text-fg-2 select-none',
  'transition-[background-color,color] duration-(--dur-instant) hover:not-data-disabled:bg-surface-2 hover:not-data-disabled:text-fg',
  'data-disabled:cursor-not-allowed data-disabled:text-fg-disabled [&_svg]:shrink-0',
);

function ToolbarButton({className, ...props}: ToolbarPrimitive.Button.Props) {
  return <ToolbarPrimitive.Button data-slot="toolbar-button" className={typeof className === 'function' ? className : cn(itemClass, className)} {...props}/>;
}

function ToolbarToggle({className, ...props}: TogglePrimitive.Props) {
  return (
    <ToolbarPrimitive.Button
      data-slot="toolbar-toggle"
      render={<TogglePrimitive className={typeof className === 'function' ? className : cn(itemClass, 'data-pressed:bg-accent-wash data-pressed:text-fg data-pressed:hover:not-data-disabled:bg-accent-wash', className)} {...props}/>}
    />
  );
}

function ToolbarSeparator({className, ...props}: ToolbarPrimitive.Separator.Props) {
  return <ToolbarPrimitive.Separator data-slot="toolbar-separator" className={typeof className === 'function' ? className : cn('mx-1 h-5 w-px bg-line-strong', className)} {...props}/>;
}

export {Toolbar, ToolbarGroup, ToolbarButton, ToolbarToggle, ToolbarSeparator};
