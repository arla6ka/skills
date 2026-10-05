import {cva, type VariantProps} from 'class-variance-authority';
import {cn} from '../lib/utils';

// A grey stand-in for content that is loading, drawn in the shape it will take: a line of text, a round
// mark, a block. It is still. Lime allows one looping motion, the spinner, so a skeleton never pulses or
// sweeps; the page reads as loading because the shapes are there and the words are not.
//
// Every skeleton is aria-hidden. The region that is loading says so once: aria-busy on it and a visually
// hidden "Loading activity" inside, which is what a screen reader hears. Swap the skeletons for the real
// content in place, at the same size, so nothing below moves.

const skeletonVariants = cva('block shrink-0 bg-surface-2', {
  variants: {
    shape: {
      // One line of text: as tall as the text's cap height inside its line, so a stack of them keeps the rhythm.
      text: 'h-3 w-full rounded-sm',
      circle: 'size-10 rounded-full',
      block: 'h-24 w-full rounded-panel',
    },
  },
  defaultVariants: {shape: 'text'},
});

type SkeletonProps = Omit<React.ComponentProps<'span'>, 'children'> & VariantProps<typeof skeletonVariants>;

/** Set the width (and for circle and block, the size) with className to match the content it stands for. */
function Skeleton({className, shape, ...props}: SkeletonProps) {
  return <span data-slot="skeleton" data-shape={shape ?? 'text'} aria-hidden="true" className={cn(skeletonVariants({shape}), className)} {...props}/>;
}

export {Skeleton, skeletonVariants, type SkeletonProps};
