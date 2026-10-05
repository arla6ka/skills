'use client';

import {useEffect, useRef, useState} from 'react';
import {Message} from '../ai/message';
import {Icon, Locked, Play, ShoppingBag} from '../icon';
import {Amount, formatAmount} from '../ui/amount';
import {Button} from '../ui/button';
import {List, ListIcon, ListItem} from '../ui/list';
import {Status} from '../ui/status';

// A block: the assistant flagging something with one row and the answers to it. UnusualCharge is a charge to
// confirm, CancelSubscription a subscription nobody opens.

/** A charge that doesn't look like you, with the two answers. Freezing is solid, not a glow: it is a choice, not the push. */
export function UnusualCharge() {
  return (
    <section aria-label="Unusual charge" className="flex w-full max-w-sm flex-col gap-4">
      <Message name="Lime">This one doesn't look like you. Was it?</Message>
      <List className="-mx-4">
        <ListItem leading={<ListIcon icon={ShoppingBag} tone="danger"/>} title="Kestrel Shop" description="Lisbon, 2:14 am" trailing={<Amount value={-129} tone="danger"/>}/>
      </List>
      <div className="flex gap-2">
        <Button variant="solid" className="flex-1" icon={<Icon icon={Locked} size={16}/>}>Freeze card</Button>
        <Button variant="secondary" className="flex-1">It was me</Button>
      </div>
    </section>
  );
}

/** A subscription nobody opens, found by the assistant: one row and one action, which holds the glow. Cancel it
 * works for a moment, then the buttons give way to a status line in the same height. */
export function CancelSubscription() {
  const [state, setState] = useState<'open' | 'pending' | 'canceled' | 'kept'>('open');
  const outcome = useRef<HTMLSpanElement>(null);
  // The pressed button is gone once the status shows, so focus moves to the status instead of the page top.
  useEffect(() => {
    if ((state === 'canceled' || state === 'kept') && document.activeElement === document.body) outcome.current?.focus();
  }, [state]);
  const cancel = () => {
    setState('pending');
    setTimeout(() => setState('canceled'), 900);
  };
  return (
    <section aria-label="Subscription" className="flex w-full max-w-sm flex-col gap-4">
      <Message name="Lime">You haven't opened Streamly since July.</Message>
      <List className="-mx-4">
        <ListItem leading={<ListIcon icon={Play}/>} title="Streamly" description="Renews Oct 12" trailing={formatAmount(-15.99)}/>
      </List>
      <div aria-live="polite" className="flex min-h-(--control-md) items-center gap-2">
        {state === 'canceled' ? <Status ref={outcome} tabIndex={-1} status="canceled" label="Canceled. No more charges" className="rounded-sm"/>
          : state === 'kept' ? <Status ref={outcome} tabIndex={-1} status="done" label="Kept" className="rounded-sm"/>
          : <>
            <Button className="flex-1" pending={state === 'pending'} onClick={cancel}>Cancel it</Button>
            <Button variant="ghost" disabled={state === 'pending'} onClick={() => setState('kept')}>Keep</Button>
          </>}
      </div>
    </section>
  );
}
