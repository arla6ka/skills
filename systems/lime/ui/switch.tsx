'use client';

import {Switch as SwitchPrimitive} from '@base-ui/react/switch';
import {cn} from '../lib/utils';

// An on or off setting that takes effect at once. Off is a white knob on a grey track, on a white knob on the
// lime, in both themes. The knob is lifted like a phone's switch (a soft drop, a contact shadow, a hairline edge),
// a little deeper on a dark page so it still reads on the lime. The track has no outline. For a choice that waits for a Save button use Checkbox.

function Switch({className, ...props}: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={typeof className === 'function' ? className : cn(
        'group/switch inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-transparent bg-surface-3 p-0.5 outline-none',
        'transition-[background-color] duration-(--dur-fast) ease-out',
        'hover:not-data-disabled:not-data-checked:bg-line-strong',
        'data-checked:bg-(--switch-on)',
        'data-disabled:cursor-not-allowed data-disabled:bg-surface-2',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="block size-4 rounded-full bg-(--thumb) shadow-(--shadow-thumb) transition-[translate,background-color] duration-(--dur-fast) ease-out data-checked:translate-x-4 data-checked:bg-(--switch-on-thumb) group-data-disabled/switch:shadow-none group-data-disabled/switch:bg-surface"
      />
    </SwitchPrimitive.Root>
  );
}

export {Switch};
