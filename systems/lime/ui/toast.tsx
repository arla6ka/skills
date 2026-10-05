'use client';

import {Toast as ToastPrimitive} from '@base-ui/react/toast';
import {useMemo, type ReactNode} from 'react';
import {Close, Icon} from '../icon';
import {useLimePortal} from '../lib/portal';
import {cn} from '../lib/utils';

// A short note after the person did something: "Moved $50 to Vacation fund". Ink on the page, one line, at
// the bottom centre, with at most one action (usually Undo) and a close button. Base UI Toast underneath.
//
// One at a time: a new toast replaces the one showing. It closes itself after 5 seconds, or 8 with an action
// so there is time to reach Undo. Hovering, focusing or touching it pauses the timer, and F6 jumps to it from
// anywhere. The region is polite, so a screen reader reads it after what it is saying now.
//
// It confirms; it never carries an error the person has to act on, and it is never the only place a result
// shows. A failed payment stays on the screen it failed on.
//
// Mount ToastProvider once inside the Lime scope, then call useToast().show() from any component under it.
// contained keeps the toast inside the nearest positioned parent, for a phone frame or a preview.

const DEFAULT_TIMEOUT = 5000;
const ACTION_TIMEOUT = 8000;

type ToastOptions = {
  /** What happened, past tense, with the amount: "Moved $50 to Vacation fund". */
  title: string;
  /** A second line, only when the title cannot carry it. */
  description?: string;
  /** One action, usually Undo. Pressing it runs onClick and closes the toast. */
  action?: {label: string; onClick: () => void};
  /** Milliseconds before it closes itself. 0 keeps it until it is closed. */
  timeout?: number;
  /** Replaces the toast with this id instead of adding a new one. */
  id?: string;
};

type ToastProviderProps = {
  children?: ReactNode;
  /** Milliseconds before a toast with no action closes itself. */
  timeout?: number;
  /** Shows toasts in the nearest positioned parent instead of the window. */
  contained?: boolean;
  /** A manager from createToastManager(), to show a toast from outside React. */
  toastManager?: ToastPrimitive.Provider.Props['toastManager'];
};

function ToastProvider({children, timeout = DEFAULT_TIMEOUT, contained, toastManager}: ToastProviderProps) {
  return (
    <ToastPrimitive.Provider limit={1} timeout={timeout} toastManager={toastManager}>
      {children}
      {contained ? <ToastViewport contained/> : <PortalledViewport/>}
    </ToastPrimitive.Provider>
  );
}

function PortalledViewport() {
  const container = useLimePortal();
  return <ToastPrimitive.Portal container={container}><ToastViewport/></ToastPrimitive.Portal>;
}

function ToastViewport({contained}: {contained?: boolean}) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn('inset-x-4 bottom-4 z-(--z-toast) mx-auto max-w-sm outline-none', contained ? 'absolute' : 'fixed sm:bottom-6')}
    >
      <ToastList/>
    </ToastPrimitive.Viewport>
  );
}

const inkButton = 'inline-flex h-(--control-sm) shrink-0 items-center justify-center rounded-control text-fg-inverse outline-none transition-colors duration-(--dur-instant) hover:bg-ink-hover active:bg-ink-active focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-fg-inverse';

function ToastList() {
  const {toasts} = ToastPrimitive.useToastManager();
  return toasts.map(toast => (
    <ToastPrimitive.Root
      key={toast.id}
      toast={toast}
      swipeDirection="down"
      data-slot="toast"
      className={cn(
        'absolute inset-x-0 bottom-0 flex min-h-(--control-lg) items-center rounded-panel bg-ink py-2 ps-4 pe-2 text-fg-inverse shadow-overlay select-none',
        'translate-y-(--toast-swipe-movement-y) transition-[opacity,translate] duration-(--dur-base) ease-(--ease-out)',
        'data-starting-style:translate-y-2 data-starting-style:opacity-0',
        'data-ending-style:opacity-0 data-ending-style:duration-(--dur-fast) data-ending-style:ease-(--ease-in) data-limited:invisible',
      )}
    >
      <ToastPrimitive.Content className="flex min-w-0 flex-1 items-center gap-1">
        <div className="flex min-w-0 flex-1 flex-col py-1 pe-2">
          <ToastPrimitive.Title data-slot="toast-title" className="label"/>
          <ToastPrimitive.Description data-slot="toast-description" className="body opacity-80"/>
        </div>
        <ToastPrimitive.Action data-slot="toast-action" className={cn(inkButton, 'label px-3 font-semibold')}/>
        <ToastPrimitive.Close data-slot="toast-close" aria-label="Dismiss" className={cn(inkButton, 'w-(--control-sm)')}>
          <Icon icon={Close} size={16}/>
        </ToastPrimitive.Close>
      </ToastPrimitive.Content>
    </ToastPrimitive.Root>
  ));
}

/** Shows and closes toasts. Call it in a component under ToastProvider. */
function useToast() {
  const manager = ToastPrimitive.useToastManager();
  return useMemo(() => ({
    /** Shows a toast and returns its id. A toast already showing gives way to it. */
    show({title, description, action, timeout, id}: ToastOptions) {
      const toastId: string = manager.add({
        id,
        title,
        description,
        timeout: timeout ?? (action ? ACTION_TIMEOUT : undefined),
        actionProps: action ? {children: action.label, onClick: () => { action.onClick(); manager.close(toastId); }} : undefined,
      });
      return toastId;
    },
    close: (id?: string) => manager.close(id),
  }), [manager]);
}

const createToastManager = ToastPrimitive.createToastManager;

export {ToastProvider, useToast, createToastManager, type ToastOptions, type ToastProviderProps};
