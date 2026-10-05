'use client';

import {useEffect, useRef} from 'react';

/**
 * Moves focus to an outcome when the controls that had it are replaced, such as a status line taking the place of
 * Approve and Decline. Without it the pressed button leaves the page and focus falls to the body, so a keyboard or
 * screen reader user starts again from the top.
 *
 * `replaced` turns true when the controls go. Put `region` on the element that held them and `target` on the outcome,
 * which needs tabIndex={-1} (Status has `focusable`). Focus moves only if it fell to the body or is still in the
 * region; a person who has already gone somewhere else is left there.
 */
function useFocusWhenReplaced<Target extends HTMLElement = HTMLSpanElement, Region extends HTMLElement = HTMLDivElement>(replaced: boolean) {
  const region = useRef<Region>(null);
  const target = useRef<Target>(null);
  const was = useRef(replaced);
  useEffect(() => {
    const before = was.current;
    was.current = replaced;
    if (before || !replaced) return;
    const active = document.activeElement;
    if (!active || active === document.body || region.current?.contains(active)) target.current?.focus();
  }, [replaced]);
  return {region, target};
}

export {useFocusWhenReplaced};
