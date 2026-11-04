import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ProductHeader, ProductFooter, ServiceCard } from './src/index';
import './src/styles.css';
import './demo.css';

function Demo() {
  const [menuOpen, setMenuOpen] = useState(false);
  const header = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) setMenuOpen(false);
    };
    const desktop = window.matchMedia('(min-width: 721px)');
    const closeOnResize = () => { if (desktop.matches) setMenuOpen(false); };
    document.addEventListener('pointerdown', closeOutside);
    desktop.addEventListener('change', closeOnResize);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      desktop.removeEventListener('change', closeOnResize);
    };
  }, [menuOpen]);

  return <>
  <a className="skip-link" href="#content">跳到主要内容</a>
  <div ref={header} onKeyDown={event => {
    if (event.key === 'Escape' && menuOpen) {
      setMenuOpen(false);
      menuButton.current?.focus();
    }
  }}>
    <ProductHeader>
      <a className="brand" href="#content">Ordarc</a>
      <button ref={menuButton} className="menu-toggle" type="button" aria-expanded={menuOpen}
        aria-controls="primary-navigation" onClick={() => setMenuOpen(open => !open)}>菜单</button>
      <nav id="primary-navigation" className={menuOpen ? 'primary-navigation is-open' : 'primary-navigation'}
        aria-label="主要导航" onClick={event => {
          if (event.target instanceof Element && event.target.closest('a[href]')) setMenuOpen(false);
        }}><a href="#services">浏览栏目</a><a href="#help">使用说明</a></nav>
    </ProductHeader>
  </div>
  <main id="content" tabIndex={-1}>
    <p className="eyebrow">Ordarc / 界面样例</p><h1>命盘、问事与研习</h1>
    <p className="intro">三个栏目的布局示例。查看资料如何排列、说明放在哪里，以及记录如何组织。</p>
    <section id="services" className="service-grid" aria-label="界面示例" tabIndex={-1}>
      <ServiceCard title="命盘" description="出生资料与盘面分区排列，阅读时可对照查看。"><span className="tag">01 / 资料与盘面</span></ServiceCard>
      <ServiceCard title="问事" description="问题、观察和备注各有位置，便于回看一次问事的过程。"><span className="tag">02 / 问题与记录</span></ServiceCard>
      <ServiceCard title="研习" description="材料、模板和草稿放在同一栏目，便于整理学习记录。"><span className="tag">03 / 材料与草稿</span></ServiceCard>
    </section>
    <section id="help" className="help" tabIndex={-1}><h2>界面展示说明</h2><p>这里仅演示界面布局，不收集出生资料，不执行排盘，不连接业务服务。</p></section>
  </main>
  <ProductFooter name="Ordarc" description="命盘、问事与研习"><a href="#help">使用说明</a></ProductFooter>
  </>;
}

createRoot(document.getElementById('root')!).render(<Demo />);
