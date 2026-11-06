import React from 'react';
import { createRoot } from 'react-dom/client';
import { ProductHeader, ProductNavigation, ProductTabs, ProductFooter, ServiceCard } from '@ordarc/experience-shell';
import '@ordarc/experience-shell/styles.css';

createRoot(document.getElementById('root')!).render(<>
  <ProductHeader><a href="#content">Example product</a><ProductNavigation navigationLabel="Product navigation" toggleLabel="Menu"><a href="#services">Services</a><a href="#help">Help</a></ProductNavigation></ProductHeader>
  <main id="content"><h1>Independent consumer</h1><section id="services" aria-labelledby="service-heading"><h2 id="service-heading">Services</h2>
    <ProductTabs ariaLabel="Service views" items={[
      {id:'details',label:'Details',panel:<ServiceCard headingAs="h3" title="Example service" description="Presentation-only package consumption."><a href="#help">Read the guide</a></ServiceCard>},
      {id:'notes',label:'Notes',panel:<label>Working note<textarea maxLength={2000} rows={4} /></label>},
    ]} />
    <p id="help">No product API or user data is used.</p>
  </section></main>
  <ProductFooter name="Example product" description="Consumer fixture" navigationLabel="Help navigation"><a href="#help">Help</a></ProductFooter>
</>);
