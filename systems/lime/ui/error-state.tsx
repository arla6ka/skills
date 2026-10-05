'use client';

import {Icon, Renew, WarningFilled} from '../icon';
import {cn} from '../lib/utils';
import {Button} from './button';

// What shows in place of content that failed to load: what failed, what to do, and Try again. It takes the
// place the content would have had, so the rest of the screen still works. block fills an emptied region
// (a list, a card) and centres like Empty; inline is one row, for a part of a screen such as a balance or a
// chart; in a narrow column its button wraps under the text. A form error belongs to its Field, and a failed payment to its own Status.
//
// It is a polite live region, so the failure is read out when it replaces a loading state, without cutting
// off what the screen reader was saying. Try again shows its spinner while the retry runs and keeps focus.

type ErrorStateProps = Omit<React.ComponentProps<'div'>, 'title'> & {
  /** What failed, plainly: "Couldn't load your activity". */
  title: string;
  /** What to do, or what still works. One sentence. */
  description?: string;
  /** Runs the load again. Without it there is no button. */
  onRetry?: () => void;
  /** The retry is running. */
  retrying?: boolean;
  retryLabel?: string;
  layout?: 'block' | 'inline';
};

function ErrorState({title, description, onRetry, retrying, retryLabel = 'Try again', layout = 'block', className, ...props}: ErrorStateProps) {
  const retry = onRetry && (
    <Button variant="secondary" size="sm" pending={!!retrying} icon={<Icon icon={Renew} size={16}/>} onClick={onRetry} className={layout === 'inline' ? 'shrink-0' : 'mt-1'}>
      {retryLabel}
    </Button>
  );
  if (layout === 'inline') {
    return (
      <div data-slot="error-state" data-layout="inline" role="status" className={cn('flex min-h-(--control-lg) w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-2 py-2', className)} {...props}>
        <Icon icon={WarningFilled} size={16} className="shrink-0 text-danger-text"/>
        {/* Below about 128px of text the button wraps under it instead of crowding it. */}
        <div className="flex min-w-32 flex-1 flex-col">
          <p className="label text-fg">{title}</p>
          {description && <p className="text-sm text-fg-2">{description}</p>}
        </div>
        {retry}
      </div>
    );
  }
  return (
    <div data-slot="error-state" data-layout="block" role="status" className={cn('flex flex-col items-center gap-3 px-6 py-10 text-center', className)} {...props}>
      <div aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-danger-tint text-danger-text">
        <Icon icon={WarningFilled} size={20}/>
      </div>
      <p className="text-lg leading-tight font-semibold">{title}</p>
      {description && <p className="max-w-sm text-sm text-fg-2">{description}</p>}
      {retry}
    </div>
  );
}

export {ErrorState, type ErrorStateProps};
