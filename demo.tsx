import React from 'react';
import { createRoot } from 'react-dom/client';
import { ProductHeader, ProductNavigation, ProductTabs, ProductFooter, ServiceCard } from './src/index';
import './src/styles.css';
import './demo.css';

function Demo() {
  return <>
  <a className="skip-link" href="#content">跳到主要内容</a>
  <ProductHeader>
    <a className="brand" href="#content">Ordarc</a>
    <ProductNavigation><a href="#services">浏览栏目</a><a href="#help">使用说明</a></ProductNavigation>
  </ProductHeader>
  <main id="content" tabIndex={-1}>
    <p className="eyebrow">Ordarc / 界面样例</p><h1>命盘、问事与研习</h1>
    <p className="intro">三个栏目的布局示例。查看资料如何排列、说明放在哪里，以及记录如何组织。</p>
    <section id="services" className="service-browser" aria-label="界面示例" tabIndex={-1}>
      <ProductTabs ariaLabel="栏目内容" items={[
        {id:'chart',label:'命盘',panel:<ServiceCard title="命盘" description="出生资料与盘面分区排列，阅读时可对照查看。"><span className="tag">01 / 资料与盘面</span><label className="demo-note">阅读备注<textarea maxLength={2000} rows={3} /></label></ServiceCard>},
        {id:'question',label:'问事',panel:<ServiceCard title="问事" description="问题、观察和备注各有位置，便于回看一次问事的过程。"><span className="tag">02 / 问题与记录</span><label className="demo-note">阅读备注<textarea maxLength={2000} rows={3} /></label></ServiceCard>},
        {id:'study',label:'研习',panel:<ServiceCard title="研习" description="材料、模板和草稿放在同一栏目，便于整理学习记录。"><span className="tag">03 / 材料与草稿</span><label className="demo-note">阅读备注<textarea maxLength={2000} rows={3} /></label></ServiceCard>},
      ]}/>
    </section>
    <section id="help" className="help" tabIndex={-1}><h2>界面展示说明</h2><p>这里仅演示界面布局，不收集出生资料，不执行排盘，不连接业务服务。</p></section>
  </main>
  <ProductFooter name="Ordarc" description="命盘、问事与研习"><a href="#help">使用说明</a></ProductFooter>
  </>;
}

createRoot(document.getElementById('root')!).render(<Demo />);
