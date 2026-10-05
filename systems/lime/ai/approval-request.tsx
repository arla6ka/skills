'use client';

import {Edit, Icon} from '../icon';
import {cn} from '../lib/utils';
import {Amount} from '../ui/amount';
import {Button} from '../ui/button';
import {Card} from '../ui/card';
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '../ui/collapsible';
import {Status} from '../ui/status';

// The assistant asking before it moves money: what it wants to do, the amount, one line of reason, then
// Approve, Edit and Decline. Approve is the lime primary and should be the one glow on the screen. Edit is a
// pencil so the row fits a phone. Decline is quiet, never red, since saying no is safe. After a choice the
// buttons give way to a status line in the same height, so nothing below jumps. The footer is a polite live
// region, so the outcome is announced.
//
// reasons adds a small "Why?" under the reason line that opens two or three reasons, each naming where it came
// from (a rule you set, past activity), so the person can check it rather than trust it. Closed by default.

type ApprovalRequestState = 'waiting' | 'approved' | 'declined';

type ApprovalReason = {
  /** The reason as a plain sentence, such as "Same as last month". */
  text: string;
  /** Where it came from, such as "Your rent rule" or "3 past payments". */
  source: string;
  /** Opens the source. */
  href?: string;
};

type ApprovalRequestProps = Omit<React.ComponentProps<'div'>, 'title'> & {
  /** The action as a verb and its object, such as "Pay Lena for rent". */
  title: string;
  /** Signed: negative is money out. */
  amount: number;
  /** The money in the account, so the amount warns when it is tight. */
  available?: number;
  /** One line on why the assistant is asking. */
  reason: string;
  /** More reasons behind a "Why?" under the reason line, each with its source. */
  reasons?: ApprovalReason[];
  state?: ApprovalRequestState;
  /** Approve is pressed and the assistant is working. */
  pending?: boolean;
  onApprove?: () => void;
  onEdit?: () => void;
  onDecline?: () => void;
};

function ApprovalRequest({title, amount, available, reason, reasons, state = 'waiting', pending, onApprove, onEdit, onDecline, className, children, ...props}: ApprovalRequestProps) {
  return (
    <Card data-slot="approval-request" data-state={state} role="group" aria-label={title} className={cn('w-full min-w-0 gap-3 p-4', className)} {...props}>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <p className="min-w-0 truncate font-medium">{title}</p>
          <Amount value={amount} available={available} size="lg"/>
        </div>
        <p className="truncate text-sm text-fg-2">{reason}</p>
        {reasons?.length ? <Reasons reasons={reasons}/> : null}
      </div>
      {children}
      <div aria-live="polite" className="flex min-h-(--control-md) items-center gap-2">
        {state === 'waiting' && <>
          <Button className="min-w-0 flex-1" pending={!!pending} onClick={onApprove}>Approve</Button>
          <Button variant="secondary" size="icon" aria-label="Edit" disabled={pending} onClick={onEdit}><Icon icon={Edit} size={16}/></Button>
          <Button variant="ghost" disabled={pending} onClick={onDecline}>Decline</Button>
        </>}
        {state === 'approved' && <Status status="done" label="Approved"/>}
        {state === 'declined' && <Status status="canceled" label="Declined"/>}
      </div>
    </Card>
  );
}

function Reasons({reasons}: {reasons: ApprovalReason[]}) {
  return (
    <Collapsible data-slot="approval-reasons" className="flex min-w-0 flex-col">
      <CollapsibleTrigger className="w-fit justify-start gap-1 py-1 text-sm text-fg-2">Why?</CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="flex flex-col gap-2.5 pt-1.5 pb-1">
          {reasons.map(item => (
            <li key={item.text} className="flex min-w-0 flex-col gap-0.5 text-sm">
              <span className="text-fg">{item.text}</span>
              {item.href
                ? <a href={item.href} className="w-fit max-w-full truncate text-xs text-fg-3 underline underline-offset-2 hover:text-fg-2">{item.source}</a>
                : <span className="truncate text-xs text-fg-3">{item.source}</span>}
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

export {ApprovalRequest, type ApprovalRequestProps, type ApprovalRequestState, type ApprovalReason};
