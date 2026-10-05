'use client';

import {Radio as RadioPrimitive} from '@base-ui/react/radio';
import {RadioGroup as RadioGroupPrimitive} from '@base-ui/react/radio-group';
import {cn} from '../lib/utils';

// One choice from a short list, all options visible. Chosen fills with the lime, an olive edge and a
// near-black dot. For more than about six options use Select. For a view switch use Segmented.

function RadioGroup({className, ...props}: RadioGroupPrimitive.Props) {
  return <RadioGroupPrimitive data-slot="radio-group" className={typeof className === 'function' ? className : cn('flex flex-col gap-3', className)} {...props}/>;
}

function Radio({className, ...props}: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio"
      className={typeof className === 'function' ? className : cn(
        'inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-control bg-page outline-none',
        'transition-[background-color,border-color] duration-(--dur-fast) ease-out',
        'hover:not-data-disabled:border-fg-2',
        'focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-(--focus-offset) focus-visible:outline-ring',
        'data-checked:border-accent-line data-checked:bg-accent',
        'data-disabled:cursor-not-allowed data-disabled:border-line-strong data-disabled:bg-surface-2',
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator data-slot="radio-indicator" className="size-2 rounded-full bg-on-accent data-disabled:bg-fg-disabled"/>
    </RadioPrimitive.Root>
  );
}

export {RadioGroup, Radio};
