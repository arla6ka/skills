'use client';

import {useState} from 'react';
import {ApprovalRequest, type ApprovalRequestState} from '../ai/approval-request';
import {Message} from '../ai/message';

// A block: the assistant asking before it pays a bill. Wire onApprove and onDecline to the real payment.

const balance = 2481.2;

/** You ask, the assistant answers in plain text and asks before it pays. Approve is the glow; it works for a
 * moment, then settles to a status line. */
export function PayingABill() {
  const [state, setState] = useState<ApprovalRequestState>('waiting');
  const [pending, setPending] = useState(false);
  const approve = () => {
    setPending(true);
    setTimeout(() => { setPending(false); setState('approved'); }, 900);
  };
  return (
    <section aria-label="Assistant" className="flex w-full max-w-sm flex-col gap-4">
      <Message from="user">Pay my phone bill</Message>
      <Message name="Lime">It matches last month. Want me to pay it?</Message>
      <ApprovalRequest title="Pay phone bill" amount={-45} available={balance} reason="Due Thursday, from Checking" state={state} pending={pending} onApprove={approve} onDecline={() => setState('declined')}/>
    </section>
  );
}
