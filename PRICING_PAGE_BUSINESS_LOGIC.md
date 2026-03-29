# Torqvio Pricing Page - Business Logic & UI Breakdown

## Overview
The pricing page at `http://localhost:7243/pricing` is a sophisticated customer acquisition funnel designed to convert visitors into paying subscribers through a multi-tiered pricing strategy with clear value progression.

## Business Logic Architecture

### 1. Pricing Strategy - "Hook Them Forever" Funnel

#### Tier Structure (5 Tiers):
1. **Free ($0)** - "Hook Them Forever" - Entry point with limitations
2. **Starter ($25)** - "Indie Builders" - Small SaaS sweet spot  
3. **Pro ($99)** - "Real Businesses" - Money printer tier
4. **Business ($399)** - "Critical Infrastructure" - Enterprise-lite
5. **Enterprise (Custom)** - "We Run Your Company" - High-margin consulting

#### Psychological Pricing Elements:
- **Free tier exists** to eliminate friction and get users started
- **Starter at $25** - Impulse purchase territory for indie devs
- **Pro at $99** - Under $100 psychological barrier, premium feel
- **Business at $399** - Just under $400, serious business commitment
- **Enterprise** - "Contact us" creates sales pipeline and qualification

### 2. Limit & Overage Engineering

#### Smart Limit Design:
```typescript
limits: {
  projects: number | -1 (unlimited)
  workflows: number | -1  
  executionsPerMonth: number | -1
  concurrency: number | -1
  logsRetentionDays: number | -1
  retryPolicies: 'basic' | 'standard' | 'advanced'
  support: 'community' | 'email' | 'priority' | 'dedicated'
  features: string[]
}
```

#### Overage Rates (Usage-Based Growth):
- **Free/Started**: $0.001 per execution (encourages upgrade)
- **Pro**: $0.0008 per execution (reward for commitment)
- **Business**: $0.0006 per execution (volume discount)
- **Enterprise**: $0.0004 per execution + step-run billing

### 3. Feature Gating & Upsell Triggers

#### Feature Progression:
- **Basic features** available on all tiers (webhooks, scheduler)
- **Advanced features** gated by tier (priority queue, monitoring)
- **Enterprise features** create FOMO (dedicated infrastructure, compliance)

#### Add-on Strategy (5 Add-ons):
1. **Observability+ ($49)** - Advanced debugging
2. **High Priority Execution ($99)** - Queue skipping
3. **Replay & Time Travel ($29)** - Debugging superpowers
4. **Webhook Reliability ($19)** - Delivery guarantees
5. **Agent/Skills Pack ($19)** - AI integration

## UI/UX Flow Analysis

### 1. Page Structure & Visual Hierarchy

#### Layout Components:
```typescript
PricingPage
├── PricingNavbar (Login/Signup CTAs)
├── Hero Section ("Predictable pricing, designed to scale")
├── PricingPlans (Main pricing cards)
├── PricingFeatures (Add-ons section)
├── Contact Section (Sales team CTA)
└── PricingFooter
```

#### Visual Design System:
- **Dark theme** (`#0B0F14` background) - Premium/technical feel
- **Green accent** for CTAs and "Most Popular" badge
- **Card-based layout** with hover states
- **Motion animations** using Framer Motion for engagement

### 2. Pricing Cards - Conversion Psychology

#### Card Elements:
```typescript
PlanCard {
  // Visual Hierarchy
  Badge: "Most Popular" | "Current Plan"
  Plan Name: monospace, uppercase, tracking-widest
  Price: Large monospace font
  Description: Value proposition
  
  // Social Proof
  CTA Button: Dynamic text based on state
  Limits Grid: 2x2 layout showing key metrics
  Features List: Checkmarks with green accent
  
  // Scarcity/Urgency
  Overage Rates: "Then $X/execution"
}
```

#### Button State Logic:
```typescript
buttonText = {
  isSubscribingToPlan: "Processing..."
  isCurrentPlan: "Current Plan"  
  isEnterprise: "Contact Us"
  isFree: "Start for Free"
  default: "Get Started"
}
```

### 3. Interactive Cost Calculator

#### Purpose: Reduce price shock through transparency
```typescript
showCalculator: boolean
calculatorExecutions: number (1000 - 1,000,000)

// Dynamic pricing display
estimatedCost = basePrice + Math.max(0, executions - limit) * overageRate
```

#### User Experience:
- **Hidden by default** - "Estimate cost" toggle
- **Slider input** - Immediate visual feedback
- **Real-time calculation** - Shows true cost with usage
- **Reduces friction** - Users see actual expected cost

### 4. Subscription Modal - Conversion Optimization

#### Modal Structure:
```typescript
SubscriptionModal {
  // Trust Building
  Header: "Subscribe to {Plan Name}"
  Plan Summary: Selected plan details
  Payment Notice: Security disclaimer
  
  // Form Fields
  Email: Required, validation
  Name: Required, validation  
  Company: Optional (B2B signal)
  
  // Conversion Elements
  Submit Button: "Continue to Payment" | "Contact Sales"
  Cancel Button: Easy exit path
}
```

#### Form Validation Logic:
```typescript
validateForm = {
  email: required + regex validation
  name: required field
  company: optional (business intelligence)
}
```

#### Payment Flow:
1. **Form submission** → Validation
2. **Processing state** → Loading spinner
3. **Redirect to Stripe** → Secure payment
4. **Success/Cancellation** → Return to app

### 5. Add-on Section - Revenue Maximization

#### Add-on Card Design:
```typescript
AddOnCard {
  Header: Add-on name + "Active" badge
  Price: Large monospace + "/month"
  Description: Value proposition
  Features: Checkmark list
  CTA: "Add to Plan" | "Subscribed"
}
```

#### Strategic Placement:
- **Below main pricing** - After plan decision
- **Grid layout** - Visual comparison
- **Optional upgrades** - No pressure, clear value

## Customer Journey & Conversion Funnel

### 1. Awareness → Interest
- **Landing on pricing page** - Usually from homepage CTA
- **Hero section** - Sets value proposition
- **Plan comparison** - Visual tier differentiation

### 2. Interest → Consideration  
- **Calculator usage** - Users estimate real costs
- **Feature comparison** - Understanding value gaps
- **Current plan detection** - Personalized experience

### 3. Consideration → Action
- **Plan selection** - Clicking "Get Started"
- **Modal form** - Lead capture
- **Payment processing** - Stripe integration

### 4. Action → Retention
- **Plan activation** - Immediate access
- **Add-on discovery** - Secondary revenue
- **Usage tracking** - Limit enforcement

## Technical Implementation Details

### 1. State Management
```typescript
// Page-level state
const [plans, setPlans] = useState<PricingPlan[]>([])
const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null)
const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
const [showModal, setShowModal] = useState(false)
const [subscribing, setSubscribing] = useState(false)

// Calculator state  
const [showCalculator, setShowCalculator] = useState(false)
const [calculatorExecutions, setCalculatorExecutions] = useState(10000)
```

### 2. API Integration
```typescript
// Data fetching
fetchPlans() → GET /api/v1/billing/plans
fetchCurrentPlan() → GET /api/v1/billing/current  
fetchAddOns() → GET /api/v1/billing/addons

// Actions
handleSubscribe() → Modal → Stripe checkout
```

### 3. Authentication Flow
```typescript
// Unauthenticated users
- See pricing normally
- Login/Signup prompts in navbar
- Modal captures email for lead generation

// Authenticated users  
- See current plan highlighted
- Usage data displayed
- Direct upgrade flow
```

## Business Intelligence & Analytics

### 1. Lead Generation
- **Email capture** in subscription modal
- **Company field** for B2B segmentation
- **Plan interest** tracking

### 2. Conversion Tracking
- **Plan view time** - Interest level
- **Calculator usage** - Price sensitivity
- **Modal abandonment** - Friction points

### 3. Revenue Optimization
- **A/B testing** on pricing tiers
- **Add-on adoption** rates
- **Upgrade path** analysis

## Growth Hacking Elements

### 1. Viral Loops
- **Free tier** - Users become advocates
- **Team collaboration** - Network effects
- **Webhook integrations** - Ecosystem building

### 2. Retention Mechanics  
- **Usage tracking** - Stickiness through data
- **Feature gating** - Upgrade incentives
- **Add-on ecosystem** - Expanding value

### 3. Expansion Revenue
- **Usage-based pricing** - Grows with customer success
- **Add-on marketplace** - Incremental revenue
- **Enterprise pipeline** - High-value deals

## Mobile Responsiveness

### 1. Layout Adaptation
- **Desktop**: 4-column grid (xl:grid-cols-4)
- **Tablet**: 2-column grid (md:grid-cols-2)  
- **Mobile**: Single column (grid-cols-1)

### 2. Touch Optimization
- **Large tap targets** - Minimum 44px
- **Simplified navigation** - Collapsible menu
- **Modal optimization** - Full-screen on mobile

## Performance Considerations

### 1. Loading Strategy
- **Progressive loading** - Skeleton states
- **API caching** - Plan data rarely changes
- **Image optimization** - Background effects

### 2. Animation Performance
- **Framer Motion** - Hardware acceleration
- **Reduced motion** - Accessibility support
- **Viewport optimization** - Animate on scroll

## Security & Compliance

### 1. Payment Security
- **Stripe integration** - PCI compliance
- **No card storage** - Reduced liability
- **HTTPS enforcement** - Data protection

### 2. Data Privacy
- **Minimal data collection** - Only necessary fields
- **GDPR consideration** - Clear data usage
- **Cookie compliance** - Tracking disclosure

## Future Enhancement Opportunities

### 1. Personalization
- **Industry-based pricing** - Vertical specific
- **Usage-based recommendations** - Smart suggestions
- **Team size pricing** - Per-seat models

### 2. Advanced Features
- **Annual billing discounts** - Cash flow optimization
- **Custom plan builder** - Flexible configurations
- **Usage alerts** - Proactive notifications

### 3. International Expansion
- **Multi-currency support** - Global markets
- **Regional pricing** - Purchasing power parity
- **Localized payment methods** - Market adaptation

---

This pricing page represents a sophisticated customer acquisition machine that balances conversion optimization with user experience, implementing proven SaaS pricing psychology while maintaining technical excellence and scalability.
