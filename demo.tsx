import React from 'react';
import { createRoot } from 'react-dom/client';
import { ProductHeader, ProductFooter, ServiceCard } from './src/index';
import './demo.css';

createRoot(document.getElementById('root')!).render(<>
  <a className="skip-link" href="#content">跳到主要内容</a>
  <ProductHeader><a className="brand" href="#content">Ordarc</a><nav aria-label="主要导航"><a href="#services">产品体验</a><a href="#help">帮助中心</a></nav></ProductHeader>
  <main id="content" tabIndex={-1}>
    <p className="eyebrow">命盘 · 问事 · 研习</p><h1>让每一次探索，<br />都有脉络可循。</h1>
    <p className="intro">从一份资料开始，整理盘面、阅读依据，留住值得回看的思考。</p>
    <section id="services" className="service-grid" aria-label="界面示例">
      <ServiceCard title="命盘" description="清楚呈现资料、盘面与阅读层次。"><span className="tag">出生资料 → 结果 → 回看</span></ServiceCard>
      <ServiceCard title="问事" description="围绕一个问题，保留过程与自己的理解。"><span className="tag">问题 → 观察 → 笔记</span></ServiceCard>
      <ServiceCard title="研习" description="将材料与记录整理成有条理的工作空间。"><span className="tag">资料 → 模板 → 草稿</span></ServiceCard>
    </section>
    <section id="help" className="help"><h2>界面展示说明</h2><p>这里仅演示界面布局，不收集出生资料，不执行排盘，不连接业务服务。</p></section>
  </main>
  <ProductFooter name="Ordarc" description="命盘、问事与研习"><a href="#help">使用说明</a></ProductFooter>
</>);
