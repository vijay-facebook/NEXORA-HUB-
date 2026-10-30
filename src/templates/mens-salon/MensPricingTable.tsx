import React from 'react';
import { TemplatePricingTable } from '../common/TemplatePricingTable';

const pricingData = [
  { name: 'Modern Fades', price: 650, duration: 40 },
  { name: 'Beard Sculpting', price: 450, duration: 30 },
  { name: 'Hot Towel Shaves', price: 550, duration: 35 },
  { name: 'Executive Haircuts', price: 850, duration: 45 },
  { name: 'Scalp Treatments', price: 1100, duration: 50 },
];

export function MensPricingTable() {
  return (
    <TemplatePricingTable 
      title="Executive Pricing Table"
      items={pricingData}
      themeColor="amber"
    />
  );
}
