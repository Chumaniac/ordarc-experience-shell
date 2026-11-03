import React from 'react';
import { createRoot } from 'react-dom/client';
import { ProductHeader, ProductFooter, ServiceCard } from '@ordarc/experience-shell';

createRoot(document.getElementById('root')!).render(<>
  <ProductHeader><a href="#content">Example product</a><nav aria-label="Product navigation"><a href="#services">Services</a></nav></ProductHeader>
  <main id="content"><h1>Independent consumer</h1><section id="services" aria-label="Services">
    <ServiceCard title="Example service" description="Presentation-only package consumption."><a href="#help">Read the guide</a></ServiceCard>
    <p id="help">No product API or user data is used.</p>
  </section></main>
  <ProductFooter name="Example product" description="Consumer fixture"><a href="#help">Help</a></ProductFooter>
</>);
