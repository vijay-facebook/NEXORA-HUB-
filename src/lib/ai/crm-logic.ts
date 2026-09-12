export interface CustomerInteraction {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  last_visit_date: string;
  total_visits: number;
  total_spend: number;
  past_services: string[];
}

export interface AtRiskCustomer extends CustomerInteraction {
  risk_level: 'High' | 'Medium' | 'Low';
  days_since_last_visit: number;
  suggested_action: string;
}

export interface CampaignDraft {
  customer_id: string;
  customer_name: string;
  campaign_title: string;
  message_body: string;
  offer_code: string;
  discount_percentage: number;
}

/**
 * Analyzes customer interaction history to identify 'at-risk' returning customers.
 * A customer is considered at-risk if they haven't visited in over 60 days.
 */
export function identifyAtRiskCustomers(interactions: CustomerInteraction[]): AtRiskCustomer[] {
  const today = new Date();
  
  return interactions
    .map(customer => {
      const lastVisit = new Date(customer.last_visit_date);
      const daysSinceLastVisit = Math.floor((today.getTime() - lastVisit.getTime()) / (1000 * 3600 * 24));
      
      let risk_level: 'High' | 'Medium' | 'Low' = 'Low';
      let suggested_action = 'Regular follow-up';

      if (daysSinceLastVisit > 90) {
        risk_level = 'High';
        suggested_action = 'Send immediate aggressive offer';
      } else if (daysSinceLastVisit > 60) {
        risk_level = 'Medium';
        suggested_action = 'Send reminder with small discount';
      }

      return {
        ...customer,
        risk_level,
        days_since_last_visit: daysSinceLastVisit,
        suggested_action
      };
    })
    .filter(customer => customer.risk_level === 'High' || customer.risk_level === 'Medium')
    .sort((a, b) => b.days_since_last_visit - a.days_since_last_visit);
}

/**
 * Generates personalized retention campaign drafts based on past service preferences.
 */
export function generateRetentionCampaign(customer: AtRiskCustomer): CampaignDraft {
  const primaryService = customer.past_services[0] || 'appointment';
  const discount = customer.risk_level === 'High' ? 20 : 10;
  const offerCode = `COMEBACK${discount}`;

  // This is a programmatic generation, but in a full "AI" setup, you could call an LLM here.
  const messageBody = `Hi ${customer.customer_name}, we miss you! It's been a while since your last ${primaryService}. Book your next visit now and get ${discount}% off with code ${offerCode}.`;

  return {
    customer_id: customer.customer_id,
    customer_name: customer.customer_name,
    campaign_title: `${customer.risk_level} Risk Retention - ${customer.customer_name}`,
    message_body: messageBody,
    offer_code: offerCode,
    discount_percentage: discount
  };
}

/**
 * Complete analysis pipeline to get insights and generated campaigns for all at-risk customers.
 */
export function analyzeCustomerHistory(interactions: CustomerInteraction[]) {
  const atRisk = identifyAtRiskCustomers(interactions);
  const campaigns = atRisk.map(generateRetentionCampaign);

  return {
    total_customers_analyzed: interactions.length,
    at_risk_count: atRisk.length,
    at_risk_customers: atRisk,
    generated_campaigns: campaigns
  };
}
