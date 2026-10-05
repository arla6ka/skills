'use client';

import {useId} from 'react';
import {Edit, Icon} from '../icon';
import {useFocusWhenReplaced} from '../lib/use-focus-when-replaced';
import {cn} from '../lib/utils';
import {Amount, amountAffordability} from '../ui/amount';
import {Button} from '../ui/button';
import {Card} from '../ui/card';
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '../ui/collapsible';
import {Status} from '../ui/status';

// The assistant asking before it moves money: what it wants to do, the amount, one line of reason, then
// Approve, Edit and Decline. Approve is the lime primary and should be the one glow on the screen. Edit is a
// pencil so the row fits a phone. When `available` cannot cover the amount, Approve is off and a line under the
// reason says why, so Edit and Decline are the ways on. Decline is quiet, never red, since saying no is safe. After a choice the
// buttons give way to a status line in the same height, so nothing below jumps. The footer is a polite live
// region, so the outcome is announced. The status line takes focus when it replaces the button that had it, so
// keyboard and screen reader users are not dropped to the top of the page.
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

type ApprovalRequestLabels = {
  approve?: string;
  decline?: string;
  /** The name of the pencil button. */
  edit?: string;
  why?: string;
  approved?: string;
  declined?: string;
  /** Why Approve is off when the amount is more than available. */
  insufficient?: string;
};

const defaultLabels: Required<ApprovalRequestLabels> = {approve: 'Approve', decline: 'Decline', edit: 'Edit', why: 'Why?', approved: 'Approved', declined: 'Declined', insufficient: 'More than you have available'};

type ApprovalRequestProps = Omit<React.ComponentProps<'div'>, 'title'> & {
  /** The action as a verb and its object, such as "Pay Lena for rent". */
  title: string;
  /** Signed: negative is money out. */
  amount: number;
  /** The money in the account, so the amount warns when it is tight and Approve is off when it is short. */
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
  /** The words on the buttons and the status line, for another language or tone. */
  labels?: ApprovalRequestLabels;
};

function ApprovalRequest({title, amount, available, reason, reasons, state = 'waiting', pending, onApprove, onEdit, onDecline, labels, className, children, ...props}: ApprovalRequestProps) {
  const words = {...defaultLabels, ...labels};
  // Like ChatInput's Send, Approve is off when the account cannot cover the amount, and the line under the reason says why.
  const short = amountAffordability(amount, available) === 'insufficient';
  const shortId = useId();
  // The button that had focus is gone once the outcome shows; focus moves to the outcome.
  const {region: footer, target: outcome} = useFocusWhenReplaced(state !== 'waiting');
  return (
    <Card data-slot="approval-request" data-state={state} role="group" aria-label={title} className={cn('w-full min-w-0 gap-3 p-4', className)} {...props}>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <p className="min-w-0 truncate font-medium">{title}</p>
          <Amount value={amount} available={available} size="lg"/>
        </div>
        <p className="truncate text-sm text-fg-2">{reason}</p>
        {short && state === 'waiting' && <p id={shortId} data-slot="approval-short" className="text-sm text-danger-text">{words.insufficient}</p>}
        {reasons?.length ? <Reasons reasons={reasons} label={words.why}/> : null}
      </div>
      {children}
      <div ref={footer} aria-live="polite" className="flex min-h-(--control-md) items-center gap-2">
        {state === 'waiting' && <>
          <Button className="min-w-0 flex-1" pending={!!pending} disabled={short} aria-describedby={short ? shortId : undefined} onClick={onApprove}>{words.approve}</Button>
          <Button variant="secondary" size="icon" aria-label={words.edit} disabled={pending} onClick={onEdit}><Icon icon={Edit} size={16}/></Button>
          <Button variant="ghost" disabled={pending} onClick={onDecline}>{words.decline}</Button>
        </>}
        {state === 'approved' && <Status ref={outcome} focusable status="done" label={words.approved}/>}
        {state === 'declined' && <Status ref={outcome} focusable status="canceled" label={words.declined}/>}
      </div>
    </Card>
  );
}

function Reasons({reasons, label}: {reasons: ApprovalReason[]; label: string}) {
  return (
    <Collapsible data-slot="approval-reasons" className="flex min-w-0 flex-col">
      <CollapsibleTrigger className="w-fit justify-start gap-1 py-1 text-sm text-fg-2">{label}</CollapsibleTrigger>
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

export {ApprovalRequest, type ApprovalRequestProps, type ApprovalRequestLabels, type ApprovalRequestState, type ApprovalReason};
