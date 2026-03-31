/*
 * AI-SaaS Elite — Token & Plan Configuration
 * Customize pricing tiers and token quotas here.
 *
 * Tokens reset every 30 days (monthly) or 365 days (yearly).
 * To integrate real payments, call TokenSystem.activatePlan('pro', 'monthly')
 * after Stripe/PayPal checkout completes.
 */

window.PLAN_CONFIG = {

    plans: {
        starter: {
            name: 'Starter',
            monthly: {
                price: 29,
                tokens: 5000,
                label: '5,000',
                billingDays: 30
            },
            yearly: {
                price: 24,   // per month, billed annually
                tokens: 6000,
                label: '6,000',
                billingDays: 365
            },
            color: '#64748b',
            icon: 'fa-seedling'
        },
        pro: {
            name: 'Pro',
            monthly: {
                price: 79,
                tokens: 25000,
                label: '25,000',
                billingDays: 30
            },
            yearly: {
                price: 64,
                tokens: 30000,
                label: '30,000',
                billingDays: 365
            },
            color: '#2b5fe1',
            icon: 'fa-rocket'
        },
        enterprise: {
            name: 'Enterprise',
            monthly: {
                price: 299,
                tokens: 100000,
                label: '100,000',
                billingDays: 30
            },
            yearly: {
                price: 249,
                tokens: 120000,
                label: '120,000',
                billingDays: 365
            },
            color: '#8b5cf6',
            icon: 'fa-building'
        }
    },

    // Default plan for new / guest users (free trial)
    defaultPlan: 'starter',
    defaultBilling: 'monthly',

    // Free trial tokens given on first visit (before any payment)
    freeTrialTokens: 500,

    // Warning threshold: show amber warning bar when below this many tokens
    lowTokenWarning: 200,

    getPlan(planKey) {
        return this.plans[planKey] || this.plans.starter;
    },

    getBilling(planKey, billingCycle) {
        const plan = this.getPlan(planKey);
        return plan[billingCycle] || plan.monthly;
    }
};
