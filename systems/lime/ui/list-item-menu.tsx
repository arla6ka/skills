'use client';

import type {ReactNode} from 'react';
import {Icon, OverflowMenuHorizontal} from '../icon';
import {Button} from './button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuTrigger} from './dropdown-menu';

// A row's other actions behind a more button, passed to ListItem's `menu`. It sits beside the row, so a row
// that opens something can still have Rename or Remove without a control inside a control. The trigger is a
// 32px ghost icon button named by `label`; the menu opens under it, aligned to its end. Children are
// DropdownMenuItems.

type ListItemMenuProps = {
  /** The trigger's accessible name. Name the row: "More for Corner Coffee". */
  label: string;
  children: ReactNode;
  disabled?: boolean;
};

function ListItemMenu({label, children, disabled}: ListItemMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        render={<Button data-slot="list-item-menu" variant="ghost" size="icon-sm" aria-label={label}/>}
      >
        <Icon icon={OverflowMenuHorizontal} size={16}/>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}

export {ListItemMenu, type ListItemMenuProps};
