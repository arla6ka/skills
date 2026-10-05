'use client';

import {ScrollArea as ScrollAreaPrimitive} from '@base-ui/react/scroll-area';
import {cn} from '../lib/utils';

// A scrolling region with a slim thumb that appears while the pointer is over it or the region scrolls.
// Give it a height. The viewport is focusable, so keyboard users can scroll it with the arrow keys.

type ScrollAreaProps = ScrollAreaPrimitive.Root.Props & {
  orientation?: 'vertical' | 'horizontal' | 'both';
};

function ScrollArea({className, children, orientation = 'vertical', ...props}: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root data-slot="scroll-area" className={typeof className === 'function' ? className : cn('relative overflow-hidden', className)} {...props}>
      <ScrollAreaPrimitive.Viewport data-slot="scroll-area-viewport" className="size-full rounded-[inherit] outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
        {children}
      </ScrollAreaPrimitive.Viewport>
      {orientation !== 'horizontal' && <ScrollBar orientation="vertical"/>}
      {orientation !== 'vertical' && <ScrollBar orientation="horizontal"/>}
      <ScrollAreaPrimitive.Corner/>
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({orientation}: {orientation: 'vertical' | 'horizontal'}) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        'flex touch-none p-0.5 opacity-0 transition-opacity duration-(--dur-fast) select-none data-hovering:opacity-100 data-scrolling:opacity-100',
        orientation === 'vertical' ? 'w-2.5 flex-col' : 'h-2.5 flex-row',
      )}
    >
      <ScrollAreaPrimitive.Thumb data-slot="scroll-area-thumb" className="relative shrink-0 rounded-full bg-line-strong hover:bg-control"/>
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export {ScrollArea, type ScrollAreaProps};
