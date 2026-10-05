'use client';

import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';

// Where Lime's overlays portal to. Base UI portals to document.body by default, which sits outside the
// .lime scope, so the tokens, the theme and the font never reach a popup. LimePortalProvider renders an
// empty element as the last child of the scope and hands it down; every overlay passes it to its Base UI
// Portal:
//
//   const container = useLimePortal();
//   <PopoverPrimitive.Portal container={container}>...</PopoverPrimitive.Portal>
//
// Without a provider the hook falls back to one shared .lime element on document.body (light theme), so an
// overlay never renders unstyled. The hook returns null until the element exists, which Base UI waits on.

const LimePortalContext = createContext<HTMLElement | null | undefined>(undefined);

export function LimePortalProvider({children}: {children: ReactNode}) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  return (
    <LimePortalContext.Provider value={container}>
      {children}
      <div ref={setContainer} data-lime-portal=""/>
    </LimePortalContext.Provider>
  );
}

let fallback: HTMLElement | null = null;

function fallbackContainer() {
  if (fallback && fallback.isConnected) return fallback;
  fallback = document.createElement('div');
  fallback.className = 'lime';
  fallback.setAttribute('data-system', 'lime');
  fallback.setAttribute('data-lime-portal', 'fallback');
  document.body.appendChild(fallback);
  return fallback;
}

export function useLimePortal() {
  const scoped = useContext(LimePortalContext);
  const [own, setOwn] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (scoped === undefined) setOwn(fallbackContainer());
  }, [scoped]);
  return scoped === undefined ? own : scoped;
}
