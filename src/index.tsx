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

export interface ProductTabItem { id: string; label: string; panel: ReactNode }

export function ProductTabs({ items, defaultTabId, ariaLabel = '内容分区', onTabChange }: {
  items: readonly ProductTabItem[]; defaultTabId?: string; ariaLabel?: string; onTabChange?: (id: string) => void;
}) {
  const prefix = useId();
  const [selected, setSelected] = useState(() => items.find(item => item.id === defaultTabId)?.id ?? items[0]?.id ?? '');
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  if (items.some(item => !item.id.trim() || !item.label.trim()) || new Set(items.map(item => item.id)).size !== items.length) {
    throw new Error('ProductTabs requires non-empty labels and unique non-empty IDs.');
  }
  const active = items.some(item => item.id === selected) ? selected : items[0]?.id ?? '';
  // Reconcile before committing: a removed item must not reactivate when re-added.
  if (selected !== active) setSelected(active);
  if (!items.length) return null;
  return <div className="product-tabs">
    <div className="product-tablist" role="tablist" aria-label={ariaLabel} aria-orientation="horizontal">
      {items.map((item, index) => <button type="button" role="tab" className="product-tab" key={item.id}
        id={prefix + '-tab-' + index} aria-controls={prefix + '-panel-' + index}
        aria-selected={active === item.id} tabIndex={active === item.id ? 0 : -1}
        ref={element => { if (element) buttons.current.set(item.id, element); else buttons.current.delete(item.id); }}
        onClick={() => { if (active !== item.id) { setSelected(item.id); onTabChange?.(item.id); } }}
        onKeyDown={event => {
          const next = event.key === 'ArrowRight' ? (index + 1) % items.length : event.key === 'ArrowLeft' ? (index - 1 + items.length) % items.length : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : null;
          if (next === null) return;
          event.preventDefault(); buttons.current.get(items[next].id)?.focus();
        }}>{item.label}</button>)}
    </div>
    {items.map((item, index) => <div role="tabpanel" className="product-tabpanel" key={item.id}
      id={prefix + '-panel-' + index} aria-labelledby={prefix + '-tab-' + index}
      hidden={active !== item.id} tabIndex={0}>{item.panel}</div>)}
  </div>;
}

export function ProductFooter({ name, description, children, navigationLabel = '页脚导航' }: { name: string; description: string; children: ReactNode; navigationLabel?: string }) {
  return <footer className="site-footer"><span><span translate="no">{name}</span><small>{description}</small></span><nav aria-label={navigationLabel}>{children}</nav></footer>;
}

export function ServiceCard({ title, description, children, headingAs: Heading = 'h2' }: { title: string; description: string; children?: ReactNode; headingAs?: 'h2' | 'h3' | 'h4' }) {
  return <article className="service-card"><Heading>{title}</Heading><p>{description}</p>{children}</article>;
}


/** Client render fallback only. Callers own persistence and async error handling. */
export class ProductBoundary extends React.Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { /* Never forward product data or errors to a telemetry sink. */ }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
