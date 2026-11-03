import React, { type ReactNode } from 'react';

export function ProductHeader({ children }: { children: ReactNode }) {
  return <header className="site-header"><div className="header-inner">{children}</div></header>;
}

export function ProductFooter({ name, description, children, navigationLabel = '页脚导航' }: { name: string; description: string; children: ReactNode; navigationLabel?: string }) {
  return <footer className="site-footer"><span><span translate="no">{name}</span><small>{description}</small></span><nav aria-label={navigationLabel}>{children}</nav></footer>;
}

export function ServiceCard({ title, description, children, headingAs: Heading = 'h2' }: { title: string; description: string; children?: ReactNode; headingAs?: 'h2' | 'h3' | 'h4' }) {
  return <article className="service-card"><Heading>{title}</Heading><p>{description}</p>{children}</article>;
}
