'use client';

import {Dialog as DialogPrimitive} from '@base-ui/react/dialog';
import {cva, type VariantProps} from 'class-variance-authority';
import {Close, Icon} from '../icon';
import {useLimePortal} from '../lib/portal';
import {cn} from '../lib/utils';
import {Button} from './button';

// A focused task that takes over the screen: rename a goal, pick a plan, send money. The page stays
// behind a scrim and cannot be reached until the dialog closes. Escape and the close button dismiss it,
// and focus returns to the trigger. For a decision that must not be dismissed by accident use AlertDialog;
// for a panel that keeps the page visible use Sheet.
// The title is required: it names the dialog for screen readers. Buttons name the action ("Save name").

const backdropClass = cn(
  'fixed inset-0 z-50 bg-scrim transition-opacity duration-(--dur-base) ease-(--ease-out)',
  'data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-(--dur-fast)',
);

const dialogVariants = cva(
  [
    'fixed start-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-sheet bg-raised p-6 text-fg shadow-overlay outline-none',
    'rtl:translate-x-1/2',
    'transition-[opacity,scale] duration-(--dur-slow) ease-(--ease-out)',
    'data-starting-style:scale-(--scale-enter) data-starting-style:opacity-0 data-ending-style:scale-(--scale-enter) data-ending-style:opacity-0 data-ending-style:duration-(--dur-fast) data-ending-style:ease-(--ease-in)',
  ],
  {
    variants: {
      size: {
        sm: 'max-w-overlay-sm',
        md: 'max-w-overlay',
        lg: 'max-w-overlay-lg',
      },
    },
    defaultVariants: {size: 'md'},
  },
);

function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props}/>;
}

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props}/>;
}

type DialogContentProps = DialogPrimitive.Popup.Props & VariantProps<typeof dialogVariants> & {
  /** The corner close button. On by default; turn it off when the footer already has a Close action. */
  showClose?: boolean;
};

function DialogContent({className, size, showClose = true, children, ...props}: DialogContentProps) {
  const container = useLimePortal();
  return (
    <DialogPrimitive.Portal container={container}>
      <DialogPrimitive.Backdrop data-slot="dialog-backdrop" className={backdropClass}/>
      <DialogPrimitive.Popup data-slot="dialog-content" className={typeof className === 'function' ? className : cn(dialogVariants({size}), className)} {...props}>
        {children}
        {showClose && (
          <DialogPrimitive.Close render={<Button variant="ghost" size="icon-sm" aria-label="Close" className="absolute end-3 top-3"/>}>
            <Icon icon={Close} size={20}/>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({className, ...props}: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-header" className={cn('flex flex-col gap-1.5 pe-8', className)} {...props}/>;
}

function DialogFooter({className, ...props}: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-footer" className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props}/>;
}

function DialogTitle({className, ...props}: DialogPrimitive.Title.Props) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={typeof className === 'function' ? className : cn('text-xl leading-tight font-semibold tracking-tight', className)} {...props}/>;
}

function DialogDescription({className, ...props}: DialogPrimitive.Description.Props) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={typeof className === 'function' ? className : cn('text-sm text-fg-2', className)} {...props}/>;
}

function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props}/>;
}

export {Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose, backdropClass, dialogVariants};
