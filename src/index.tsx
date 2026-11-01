import React, { type ReactNode } from 'react';

export function ProductHeader({ children }: { children: ReactNode }) {
  return <header className="site-header"><div className="header-inner">{children}</div></header>;
}

export function ProductFooter({ name, description, children }: { name: string; description: string; children: ReactNode }) {
  return <footer className="site-footer"><span><span translate="no">{name}</span><small>{description}</small></span><nav aria-label="页脚导航">{children}</nav></footer>;
}

export function ServiceCard({ title, description, children }: { title: string; description: string; children?: ReactNode }) {
  return <article className="service-card"><h2>{title}</h2><p>{description}</p>{children}</article>;
}
