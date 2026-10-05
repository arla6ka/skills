'use client';

import {Separator as SeparatorPrimitive} from '@base-ui/react/separator';
import {mergeClass} from '../lib/utils';

// A hairline between groups. By default it is a separator in the accessibility tree. Pass `decorative`
// when the line only adds look and the grouping is already clear from the content: it then takes
// role="none" and is hidden from assistive tech. Prefer space to a line when the grouping is already clear.

type SeparatorProps = SeparatorPrimitive.Props & {
  /** The line is only visual: role none, no separator announced. */
  decorative?: boolean;
};

function Separator({className, orientation = 'horizontal', decorative, ...props}: SeparatorProps) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      role={decorative ? 'none' : undefined}
      // role none allows no aria-orientation, which Base UI always sets; a decorative line drops it.
      render={decorative ? ({'aria-orientation': _, ...rest}: React.HTMLAttributes<HTMLDivElement>) => <div {...rest}/> : undefined}
      className={mergeClass('shrink-0 bg-line data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px', className)}
      {...props}
    />
  );
}

export {Separator, type SeparatorProps};
