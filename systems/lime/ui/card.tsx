'use client';

import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '../lib/utils';

// A grouped block of content. The default sits on the warm-grey surface with no edge, so a page of
// cards reads as quiet. outline is white with a hairline for a card on a grey area; raised adds the one
// card shadow for a card that floats. Radius is 16px.
//
// glow is the one featured surface of a screen, such as an upgrade card or the plan to pick: the lime body lit
// from inside, with near-black text. It powers up on hover only when interactive. One per view.
//
// interactive makes the whole card one control. With `href` it renders a link. Without, it is a button
// role on the div: focusable, Enter and Space run onClick, and a ring shows on keyboard focus. Do not put
// a button or link inside an interactive card (a control inside a control); use a plain card with one
// stretched link for that.

const cardVariants = cva('flex flex-col gap-4 rounded-panel p-5 text-fg', {
  variants: {
    variant: {
      surface: 'bg-surface',
      outline: 'border border-line bg-page',
      raised: 'bg-raised shadow-card',
      glow: 'glow glow-accent bg-accent text-on-accent **:data-[slot=card-description]:text-on-accent',
    },
    interactive: {
      true: 'cursor-pointer transition-[background-color,border-color] duration-(--dur-instant) ease-out hover:bg-surface-2 active:bg-surface-3',
      false: '',
    },
  },
  defaultVariants: {variant: 'surface', interactive: false},
});

type CardProps = React.ComponentProps<'div'> & VariantProps<typeof cardVariants> & {
  /** With interactive: render a link to this address instead of a button. */
  href?: string;
};

function Card({className, variant, interactive, href, onKeyDown, ...props}: CardProps) {
  const classes = cn(cardVariants({variant, interactive}), interactive && variant === 'outline' && 'hover:bg-surface active:bg-surface-2', variant === 'glow' && (interactive ? 'hover:bg-accent active:bg-accent' : 'glow-still'), className);
  if (interactive && href) {
    return <a data-slot="card" href={href} className={cn(classes, 'no-underline')} {...(props as React.ComponentProps<'a'>)}/>;
  }
  if (interactive) {
    return (
      <div
        data-slot="card"
        role="button"
        tabIndex={0}
        className={classes}
        onKeyDown={e => {
          onKeyDown?.(e);
          if (e.defaultPrevented || e.target !== e.currentTarget) return;
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); }
        }}
        {...props}
      />
    );
  }
  return <div data-slot="card" className={classes} onKeyDown={onKeyDown} {...props}/>;
}

function CardHeader({className, ...props}: React.ComponentProps<'div'>) {
  return <div data-slot="card-header" className={cn('flex flex-col gap-1', className)} {...props}/>;
}

function CardTitle({className, ...props}: React.ComponentProps<'h3'>) {
  return <h3 data-slot="card-title" className={cn('text-lg leading-tight font-semibold', className)} {...props}/>;
}

function CardDescription({className, ...props}: React.ComponentProps<'p'>) {
  return <p data-slot="card-description" className={cn('text-sm text-fg-2', className)} {...props}/>;
}

function CardContent({className, ...props}: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('flex flex-col gap-3', className)} {...props}/>;
}

function CardFooter({className, ...props}: React.ComponentProps<'div'>) {
  return <div data-slot="card-footer" className={cn('flex items-center gap-2', className)} {...props}/>;
}

export {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants, type CardProps};
