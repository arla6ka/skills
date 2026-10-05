import {clsx, type ClassValue} from 'clsx';
import {extendTailwindMerge} from 'tailwind-merge';

// Lime's own radius and shadow names, registered so tailwind-merge resolves conflicts between them:
// rounded-panel replaces rounded-md, shadow-menu replaces shadow-card.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ['field', 'panel', 'sheet', 'control'],
      shadow: ['card', 'menu', 'overlay'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Lime's classes and the caller's, for a Base UI part whose className may be a function of its state (data-checked,
 * open, disabled ...). A function is composed, not passed through, so Lime's classes stay either way.
 */
export function mergeClass<State>(base: ClassValue, className: string | ((state: State) => string | undefined) | undefined): string | ((state: State) => string) {
  return typeof className === 'function' ? (state: State) => cn(base, className(state)) : cn(base, className);
}
