export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Booking & Visits' | 'Services & Barbers' | 'Pricing & Membership' | 'Hygiene & Retail';
}

export const barberFAQItems: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I book an appointment?',
    answer: 'You can reserve your chair in under 60 seconds through our website by selecting your preferred treatment, master barber, and date/time. You can also message our dedicated WhatsApp concierge at +91 98290 12345.',
    category: 'Booking & Visits'
  },
  {
    id: 'faq-2',
    question: 'Do you accept walk-ins or are appointments required?',
    answer: 'While we warmly welcome walk-ins whenever chair space allows, we strongly recommend booking in advance. Our master barbers maintain strict 45-minute to 75-minute dedicated slots per gentleman to ensure unhurried precision.',
    category: 'Booking & Visits'
  },
  {
    id: 'faq-3',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards (Visa, Mastercard, Amex), UPI (Google Pay, PhonePe, Paytm), Apple Pay, Net Banking, and cash at the front reception desk.',
    category: 'Pricing & Membership'
  },
  {
    id: 'faq-4',
    question: 'What is your cancellation and rescheduling policy?',
    answer: 'We understand schedules change. We ask for at least 2 hours advance notice for cancellations or time changes so another gentleman may claim the chair. There are zero cancellation penalties when rescheduled via WhatsApp or your online confirmation slip.',
    category: 'Booking & Visits'
  },
  {
    id: 'faq-5',
    question: 'What grooming services are available at The Gent\'s Den?',
    answer: 'We provide precision haircuts, skin fades, hot towel straight-razor shaves, beard architecture, grey blending color, scalp detox therapies, Ayurvedic head massages, and full groom wedding packages.',
    category: 'Services & Barbers'
  },
  {
    id: 'faq-6',
    question: 'Can I request a specific barber for my appointment?',
    answer: 'Yes, absolutely. During booking you can select Vikram "Blade", Marcus, Kabir, or Arjun, or choose "First Available" if you are flexible on team assignment.',
    category: 'Services & Barbers'
  },
  {
    id: 'faq-7',
    question: 'How does membership validity and monthly rollover work?',
    answer: 'Memberships (Essential, Gentleman, and Elite) operate on a flexible 30-day manual pass cycle. There are no surprise automated recurring charges. Services must be redeemed within the active 30-day window.',
    category: 'Pricing & Membership'
  },
  {
    id: 'faq-8',
    question: 'Can I purchase digital or physical Gift Cards?',
    answer: 'Yes. We offer beautifully presented physical embossed gift cards packaged in black-and-gold presentation boxes at our Civil Lines atelier, as well as digital gift certificates delivered instantly via SMS and email.',
    category: 'Pricing & Membership'
  },
  {
    id: 'faq-9',
    question: 'What is your policy regarding grooming product returns?',
    answer: 'Unopened grooming pomades, clays, beard oils, and boxed tools in original sealed packaging can be exchanged or refunded within 14 days of purchase with proof of receipt.',
    category: 'Hygiene & Retail'
  },
  {
    id: 'faq-10',
    question: 'What hygiene and tool sanitation practices do you enforce?',
    answer: 'We adhere to medical-grade hygiene protocols. Every metal clipper blade and straight razor holder undergoes ultrasonic cleaning and hospital-grade autoclave sterilization between clients. Fresh single-use disposable razors, sanitized neck strips, and laundered hot towels are used exclusively.',
    category: 'Hygiene & Retail'
  }
];
