'use client';

import {Meter as MeterPrimitive} from '@base-ui/react/meter';
import {cn, mergeClass} from '../lib/utils';

// How far something has come toward a known end: a savings goal, a budget spent, a card's limit. A bar
// for a row or a card, a ring for a goal tile with the figure inside. The lime fill is one flat color on the
// grey track, with no edge. It is a meter (role meter) because it measures an amount; work that is running uses
// Status or a Button's pending state instead.
//
// label names it for a screen reader, and valueText says the amount in words, such as "$640 of $1,000".
// The visible figure is the caller's: a bar is bare, so put the words above it.

type ProgressProps = Omit<MeterPrimitive.Root.Props, 'children' | 'aria-label'> & {
  value: number;
  max?: number;
  /** The accessible name, such as "Saved toward Vacation fund". */
  label: string;
  /** The value in words, such as "$640 of $1,000". Without it a reader hears a percentage. */
  valueText?: string;
  shape?: 'bar' | 'ring';
  /** The ring's diameter: 40, 64 or 96px. Bars ignore it. */
  size?: 'sm' | 'md' | 'lg';
  /** Shown in the middle of a ring, such as the percentage. */
  children?: React.ReactNode;
};

const RING = {sm: {box: 40, stroke: 4}, md: {box: 64, stroke: 6}, lg: {box: 96, stroke: 8}} as const;

function Progress({value, max = 100, min = 0, label, valueText, shape = 'bar', size = 'md', children, className, ...props}: ProgressProps) {
  const clamped = Math.min(Math.max(value, min), max);
  const share = max > min ? (clamped - min) / (max - min) : 0;
  const root = {value: clamped, min, max, 'aria-label': label, 'aria-valuetext': valueText, ...props};

  if (shape === 'ring') {
    const {box, stroke} = RING[size];
    const r = (box - stroke) / 2;
    const length = 2 * Math.PI * r;
    return (
      <MeterPrimitive.Root data-slot="progress" data-shape="ring" {...root} className={mergeClass('relative inline-grid shrink-0 place-items-center', className)} style={{width: box, height: box}}>
        <svg aria-hidden="true" width={box} height={box} viewBox={`0 0 ${box} ${box}`} className="absolute inset-0 -rotate-90 rtl:-scale-y-100">
          <circle cx={box / 2} cy={box / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-surface-3"/>
          {share > 0 && <>
            <circle data-slot="progress-indicator" cx={box / 2} cy={box / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={length} strokeDashoffset={length * (1 - share)} className="stroke-accent transition-[stroke-dashoffset] duration-(--dur-base) ease-(--ease-out)"/>
          </>}
        </svg>
        {children !== undefined && <span data-slot="progress-value" className={cn('relative font-medium text-fg tabular-nums', size === 'lg' ? 'text-lg' : size === 'md' ? 'text-sm' : 'text-xs')}>{children}</span>}
      </MeterPrimitive.Root>
    );
  }

  return (
    <MeterPrimitive.Root data-slot="progress" data-shape="bar" {...root} className={mergeClass('w-full', className)}>
      <MeterPrimitive.Track data-slot="progress-track" className="block h-2 w-full overflow-hidden rounded-full bg-surface-3">
        <MeterPrimitive.Indicator data-slot="progress-indicator" className={cn('block h-full rounded-full bg-accent transition-[width] duration-(--dur-base) ease-(--ease-out)', share === 0 && 'hidden')}/>
      </MeterPrimitive.Track>
    </MeterPrimitive.Root>
  );
}

export {Progress, type ProgressProps};
