import React, { useEffect, useId, useRef, useState, type ReactNode } from 'react';

export function ProductHeader({ children }: { children: ReactNode }) {
  return <header className="site-header"><div className="header-inner">{children}</div></header>;
}

export function ProductNavigation({ children, navigationLabel = '主要导航', toggleLabel = '菜单' }: {
  children: ReactNode; navigationLabel?: string; toggleLabel?: string;
}) {
  const navigationId = useId();
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 720px)');
    const update = () => { setCompact(mobile.matches); if (!mobile.matches) setOpen(false); };
    update();
    mobile.addEventListener('change', update);
    return () => mobile.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!open) return;
    const document = root.current!.ownerDocument;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  return <div ref={root} className="product-navigation" data-open={open ? '' : undefined} onKeyDown={event => {
    if (event.key === 'Escape' && open) { event.preventDefault(); setOpen(false); button.current?.focus(); }
  }}>
    <button ref={button} className="product-navigation-toggle" type="button" hidden={!compact}
      aria-expanded={open} aria-controls={navigationId} onClick={() => setOpen(value => !value)}>{toggleLabel}</button>
    <nav id={navigationId} className="product-navigation-links" hidden={compact && !open}
      aria-label={navigationLabel} onClick={event => {
        if (event.target instanceof Element && event.target.closest('a[href]')) setOpen(false);
      }}>{children}</nav>
  </div>;
}

export function ProductFooter({ name, description, children, navigationLabel = '页脚导航' }: { name: string; description: string; children: ReactNode; navigationLabel?: string }) {
  return <footer className="site-footer"><span><span translate="no">{name}</span><small>{description}</small></span><nav aria-label={navigationLabel}>{children}</nav></footer>;
}

export function ServiceCard({ title, description, children, headingAs: Heading = 'h2' }: { title: string; description: string; children?: ReactNode; headingAs?: 'h2' | 'h3' | 'h4' }) {
  return <article className="service-card"><Heading>{title}</Heading><p>{description}</p>{children}</article>;
}
