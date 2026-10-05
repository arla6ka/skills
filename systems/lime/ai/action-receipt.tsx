'use client';

import {CheckmarkFilled, Icon, Undo, WarningFilled} from '../icon';
import {cn} from '../lib/utils';
import {Button} from '../ui/button';
import {Status} from '../ui/status';
import {Message} from './message';

// What the assistant just did, as one message: a short summary, then one line per action, then Undo. It is
// the record that comes after the money moved, so every action is past tense and names the amount. A line
// that failed keeps its reason, and the receipt reads as partial. Undo shows only with `onUndo`. After Undo
// the lines go grey and Undo gives way to the word Undone.

type ActionReceiptLine = {
  /** Past tense with the amount, such as "Moved $50 to Vacation fund". */
  label: string;
  /** A count, a date, or why it failed. */
  detail?: string;
  failed?: boolean;
};

type ActionReceiptLabels = {
  undo?: string;
  undone?: string;
  /** Read before each line by screen readers. */
  done?: string;
  failed?: string;
};

const defaultLabels: Required<ActionReceiptLabels> = {undo: 'Undo', undone: 'Undone', done: 'Done', failed: 'Failed'};

type ActionReceiptProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  lines: ActionReceiptLine[];
  /** One sentence above the lines, such as "Done. Here is what changed." */
  summary?: string;
  /** The actions were reversed. */
  undone?: boolean;
  onUndo?: () => void;
  /** The assistant's name, read out by screen readers. */
  name?: string;
  /** The words on Undo, the status after it and the words screen readers hear per line, for another language. */
  labels?: ActionReceiptLabels;
};

function ActionReceipt({lines, summary, undone, onUndo, name, labels, className, ...props}: ActionReceiptProps) {
  const words = {...defaultLabels, ...labels};
  const state = undone ? 'undone' : lines.some(l => l.failed) ? 'partial' : 'complete';
  return (
    <Message
      data-slot="action-receipt"
      data-state={state}
      name={name}
      className={className}
      // Message pulls its actions row in 8px for icon buttons. Undo is a text button with 12px of padding, so it
      // takes 4px more to put its icon under the line icons; the Undone status has no padding, so it gives the 8px back.
      actions={(undone || onUndo) && <div aria-live="polite" className={cn('flex min-h-(--control-sm) items-center', undone ? 'ms-2' : '-ms-1')}>
        {undone
          ? <Status status="canceled" label={words.undone}/>
          : <Button variant="ghost" size="sm" icon={<Icon icon={Undo} size={16}/>} onClick={onUndo}>{words.undo}</Button>}
      </div>}
      {...props}
    >
      {summary && <p>{summary}</p>}
      <ul className={cn('flex flex-col gap-2 text-sm', summary && 'mt-2')}>
        {lines.map(line => (
          <li key={line.label} className="flex min-w-0 items-center gap-2.5">
            <Icon
              icon={line.failed ? WarningFilled : CheckmarkFilled}
              size={16}
              className={undone ? 'text-fg-3' : line.failed ? 'text-danger-text' : 'text-success-text'}
            />
            <span className="sr-only">{line.failed ? words.failed : undone ? words.undone : words.done}: </span>
            <span className={cn('min-w-0 truncate', undone ? 'text-fg-3' : line.failed ? 'text-danger-text' : 'text-fg')}>{line.label}</span>
            {line.detail && <span className="min-w-0 flex-1 truncate text-end text-fg-3">{line.detail}</span>}
          </li>
        ))}
      </ul>
    </Message>
  );
}

export {ActionReceipt, type ActionReceiptProps, type ActionReceiptLine, type ActionReceiptLabels};
