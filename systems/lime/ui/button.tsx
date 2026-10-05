'use client';

import {Button as ButtonPrimitive} from '@base-ui/react/button';
import {cva, type VariantProps} from 'class-variance-authority';
import type {ReactNode} from 'react';
import {cn, mergeClass} from '../lib/utils';

// Lime's button. Base UI Button underneath, cva variants on top, a pill by default.
// primary is the lime and is the one main action on a screen. solid is the ink fill for the action beside
// it. secondary, outline and ghost carry everything else. Text on the lime is always near-black.
//
// primary and destructive carry the glow (see styles.css): a solid body lit from inside that powers up on
// hover and darkens on press. Disabled drops it. Small sizes use the subtle glow.
//
// pending: the button started work and is waiting. It becomes disabled against repeat presses, keeps
// focus, sets aria-busy and shows a spinner before the label. The label never changes, so the accessible
// name stays put. Pass the prop (true or false) on any button that can be pending: the idle content and
// the pending content (spinner plus label) then share one grid cell, so the box is as wide as the pending
// layer from the first render and never changes size when pending starts. Without the prop there is no
// reserved room and a spinner added later grows the button.

const buttonVariants = cva(
  [
    'group/button relative inline-flex max-w-full shrink-0 items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap select-none',
    'transition-[background-color,color,border-color,scale] duration-(--dur-instant) ease-out [-webkit-tap-highlight-color:transparent]',
    'active:not-data-disabled:scale-(--scale-press)',
    'data-disabled:cursor-not-allowed aria-busy:cursor-progress',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: 'glow glow-accent bg-accent text-on-accent data-disabled:not-aria-busy:bg-surface-2 data-disabled:not-aria-busy:text-fg-disabled',
        solid: 'bg-ink text-fg-inverse hover:not-data-disabled:bg-ink-hover active:not-data-disabled:bg-ink-active data-disabled:not-aria-busy:bg-surface-2 data-disabled:not-aria-busy:text-fg-disabled',
        secondary: 'bg-surface-2 text-fg hover:not-data-disabled:bg-surface-3 data-disabled:not-aria-busy:text-fg-disabled',
        outline: 'border border-line-strong bg-transparent text-fg hover:not-data-disabled:bg-surface data-disabled:not-aria-busy:text-fg-disabled',
        ghost: 'bg-transparent text-fg hover:not-data-disabled:bg-surface-2 data-disabled:not-aria-busy:text-fg-disabled',
        destructive: 'glow glow-danger bg-danger text-on-danger data-disabled:not-aria-busy:bg-surface-2 data-disabled:not-aria-busy:text-fg-disabled',
        link: 'h-auto! min-h-6 gap-1 rounded-sm bg-transparent px-0! text-fg underline-offset-4 hover:not-data-disabled:underline data-disabled:text-fg-disabled',
      },
      size: {
        sm: 'h-(--control-sm) px-3 text-sm',
        md: 'h-(--control-md) px-4 text-sm',
        lg: 'h-(--control-lg) px-6 text-base',
        'icon-sm': 'size-(--control-sm) px-0',
        icon: 'size-(--control-md) px-0',
        'icon-lg': 'size-(--control-lg) px-0',
      },
    },
    compoundVariants: [
      {variant: ['primary', 'destructive'], size: ['sm', 'icon-sm'], className: 'glow-subtle'},
    ],
    defaultVariants: {variant: 'primary', size: 'md'},
  },
);

/** A three quarter arc turning once. The only looping motion in Lime. */
function Spinner({className, size = 16}: {className?: string; size?: number}) {
  return (
    <svg data-slot="spinner" viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden="true" className={cn('animate-spin', className)}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2"/>
      <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants> & {
  /** Waiting on the action this button started. Disables repeat presses and shows a spinner. */
  pending?: boolean;
  /** An icon before the label. */
  icon?: ReactNode;
};

// A text label never wraps. A button is never wider than its container, so a label too long for it ends in an
// ellipsis instead of running out of the column; the full label stays the accessible name.
function Button({className, variant, size, pending, icon, disabled, children: content, ...props}: ButtonProps) {
  const children = typeof content === 'string' ? <span data-slot="button-text" className="min-w-0 truncate">{content}</span> : content;
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant ?? 'primary'}
      className={mergeClass(buttonVariants({variant, size}), className)}
      disabled={disabled || pending}
      focusableWhenDisabled={pending ? true : props.focusableWhenDisabled}
      aria-busy={pending || undefined}
      {...props}
    >
      {pending === undefined ? <>{icon}{children}</> : (
        <span data-slot="button-stack" className="grid min-w-0 place-items-center gap-[inherit] [grid-template-areas:'stack']">
          <span data-slot="button-label" className={cn('inline-flex max-w-full min-w-0 items-center justify-center gap-[inherit] [grid-area:stack]', pending && 'opacity-0')}>{icon}{children}</span>
          <span data-slot="button-pending" aria-hidden="true" className={cn('inline-flex max-w-full min-w-0 items-center justify-center gap-[inherit] [grid-area:stack]', !pending && 'invisible')}><Spinner/>{size?.startsWith('icon') ? null : children}</span>
        </span>
      )}
    </ButtonPrimitive>
  );
}

export {Button, Spinner, buttonVariants, type ButtonProps};
