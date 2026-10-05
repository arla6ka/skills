import type {CarbonIconType} from '@carbon/icons-react';
import {cn} from './lib/utils';

// The one place Lime imports icons from. Components import from here, never from the icon package, so
// the set can be swapped in one file.
//
// IBM Carbon (@carbon/icons-react). One weight, so there is nothing to
// pick: pass a size. 16 and 20 in UI, 24 and 32 for empty states. Carbon draws at 16, 20, 24 and 32;
// 12 shows the 16 artwork scaled down.
// To use another glyph, add its Carbon name to this list.
export {
  Add, ArrowDown, ArrowRight, ArrowUp, Attachment, Checkmark, CheckmarkFilled, ChevronDown, ChevronRight,
  ChevronSort, ChevronUp, Close, Copy, ErrorFilled, Image, Information, Menu, Play, Receipt, Renew, Search,
  Send, Subtract, Time, Upload, Wallet, PiggyBank, Warning, WarningFilled, ChevronLeft, ArrowLeft, Pause,
  OverflowMenuHorizontal, Folder, Star, Add as Plus, Delete, Cafe, ShoppingBag, Notification, Locked, Undo, Edit, CircleDash
} from '@carbon/icons-react';

export type LimeIcon = CarbonIconType;

type IconProps = Omit<React.ComponentProps<CarbonIconType>, 'size'> & {
  /** The Carbon icon, imported from this file. */
  icon: LimeIcon;
  /** px. 12, 16, 20, 24 or 32. 12 shows the 16 artwork. */
  size?: 12 | 16 | 20 | 24 | 32;
  /** Accessible name. Without one the icon is decorative and hidden from assistive tech. */
  label?: string;
};

export function Icon({icon: Glyph, size = 16, label, className, ...props}: IconProps) {
  return <Glyph
    size={size}
    aria-hidden={label ? undefined : true}
    aria-label={label}
    role={label ? 'img' : undefined}
    className={cn('shrink-0', className)}
    {...props}
  />;
}
