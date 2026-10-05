'use client';

import {Checkmark, Icon, WarningFilled} from '../icon';
import {cn} from '../lib/utils';
import {Spinner} from '../ui/button';

// One step the assistant took on the person's behalf, as a single quiet line: "Found 12 transactions", "Moving
// $50". It states the real step, never "Thinking". Running turns a spinner; done is a check; failed
// is a warning with the reason in `detail`, so the person knows what to do next. The state is also text
// for a screen reader ("Running", "Done", "Failed"), and each row is a polite live region, so a step that
// changes state is announced.

type ToolCallStatus = 'running' | 'done' | 'failed';

type ToolCallProps = Omit<React.ComponentProps<'div'>, 'children'> & {
  status: ToolCallStatus;
  /** The step in the present tense while running and the past tense after, such as "Trimmed to 30 seconds". */
  label: string;
  /** Extra detail: the number of items, or the reason a step failed. */
  detail?: string;
};

const STATE_WORD: Record<ToolCallStatus, string> = {running: 'Running', done: 'Done', failed: 'Failed'};

function ToolCall({status, label, detail, className, ...props}: ToolCallProps) {
  return (
    <div data-slot="tool-call" data-status={status} role="status" className={cn('flex min-h-9 items-center gap-2.5 rounded-field bg-surface px-3 py-1.5 text-sm', className)} {...props}>
      <span className="flex size-4 shrink-0 items-center justify-center">
        {status === 'running' && <Spinner size={14} className="text-fg-2"/>}
        {status === 'done' && <Icon icon={Checkmark} size={16} className="text-success-text"/>}
        {status === 'failed' && <Icon icon={WarningFilled} size={16} className="text-danger-text"/>}
      </span>
      <span className="sr-only">{STATE_WORD[status]}: </span>
      <span className={cn('min-w-0 truncate font-medium', status === 'failed' ? 'text-danger-text' : 'text-fg')}>{label}</span>
      {/* The detail starts from zero width and takes only the room the label leaves, so a label that fits
          stays whole and the detail truncates first. */}
      {detail && <span className="min-w-0 flex-1 truncate text-end text-fg-3">{detail}</span>}
    </div>
  );
}

export {ToolCall, type ToolCallProps, type ToolCallStatus};
