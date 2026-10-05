import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '../lib/utils';

// One turn in a conversation. The person's message is a grey bubble at the end edge; the assistant's
// reads as plain text on the page, with no avatar; its name is read out to screen readers only. No rail,
// no timestamp by default. Pass `actions` for the row under an assistant message (copy, retry). Prose is
// 16px so long answers read well.

const messageVariants = cva('flex w-full gap-3', {
  variants: {
    from: {
      user: 'justify-end',
      assistant: 'justify-start',
    },
  },
  defaultVariants: {from: 'assistant'},
});

type MessageProps = React.ComponentProps<'div'> & VariantProps<typeof messageVariants> & {
  /** The assistant's name, read out before its answer by screen readers. */
  name?: string;
  actions?: React.ReactNode;
};

function Message({from, name = 'Assistant', actions, className, children, ...props}: MessageProps) {
  return (
    <div data-slot="message" data-from={from ?? 'assistant'} className={cn(messageVariants({from}), className)} {...props}>
      <div className={cn('flex min-w-0 flex-col gap-2', from === 'user' ? 'max-w-[85%] items-end' : 'max-w-prose flex-1')}>
        <div className={cn('text-base leading-normal break-words', from === 'user' && 'rounded-panel rounded-ee-sm bg-surface-2 px-4 py-2.5 text-fg')}>
          {from !== 'user' && <span className="sr-only">{name}: </span>}
          {children}
        </div>
        {/* Pulled in by the icon buttons' own padding, so the icons line up with the text above. */}
        {actions && from !== 'user' && <div className="-ms-2 flex items-center gap-1 text-fg-3">{actions}</div>}
      </div>
    </div>
  );
}

export {Message, messageVariants, type MessageProps};
