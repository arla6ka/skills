'use client';

import {cn} from '../lib/utils';

// Suggested next requests under an answer. Each is a full sentence the person could have typed, so one
// press sends it as written. Three at most. They wrap on a narrow screen and never scroll sideways.

type FollowUpsProps = Omit<React.ComponentProps<'div'>, 'onSelect'> & {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
};

function FollowUps({suggestions, onSelect, className, ...props}: FollowUpsProps) {
  if (!suggestions.length) return null;
  return (
    <div data-slot="follow-ups" role="group" aria-label="Suggested follow ups" className={cn('flex flex-wrap gap-2', className)} {...props}>
      {suggestions.slice(0, 3).map(text => (
        <button
          key={text}
          type="button"
          data-slot="follow-up"
          onClick={() => onSelect(text)}
          className="inline-flex min-h-(--control-sm) max-w-full items-center rounded-panel border border-line-strong bg-page px-3 py-1 text-start text-sm text-fg outline-none transition-colors duration-(--dur-instant) hover:bg-surface focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-(--focus-offset) focus-visible:outline-ring"
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export {FollowUps, type FollowUpsProps};
