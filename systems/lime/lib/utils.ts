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
