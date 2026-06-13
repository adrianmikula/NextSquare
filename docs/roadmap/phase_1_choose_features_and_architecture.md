
# Phase 1: Choose website features and software architecture


The plan is to build a cafe or restaurant website, but first the most appropriate architecture must be chosen to match the requirements of both the business owner and the software developer.



## Business Assumptions
- Square POS
- Square KDS (Android) or Fresh KDS (iOS)
- Uber Eats deliveries
- Square Loyalty


## Business owner choices
- Do they want to take orders through their website? 
  Follow-up questions: Do they need orders to display in Square Point of Sale?

- Do they want customers to create a login/profile?
- Do they want to have a rewards system?
- Do they want to email customers deals/offers/promotions? 
- Do they want a dashboard where they can tweak the menu/prices themselves, or just ask me to do it for them?
- Do they want us to set up their social accounts as well?
- Do they want to have a chatbot assistant on the website?







## Architectural requirements
- The codebase must be easy to maintain via AI coding agents, with very little manual effort
- Maintain separation of concerns.  The text content and product/service pricing should be kept separate from visual layout and design.
- Security patches for dependencies should be easy to test, and should be deployable via an automatic script.
- Customer CRM/CMS/databases should be persistent, preserved during upgrades, and should have an easy upgrade/fallback path if anything goes wrong.
- The website and especially sensitive customer data should be protected using the latest 2026 AI-era security practices.
- The website should be mobile responsive
- The dependency tree should be kept as minimal as possible to reduce supply chain vulnerability exposure.
- A small test suite should be created to test mission-critical areas of the website like shopping carts, ordering, configuration, and admin dashboards.


## Architectural choices

### Language / Framework
- Next.js + React (TypeScript)
- Wasp (TypeScript)
- Reflex (Python)

### Styling
- Tailwind

### CMS
- Velit
- Outstatic
- Sanity
- Strapi
- Consenta

### CRM
- Twenty CRM
- Relaticle

### Ordering
- Zustand

### Deliveries
- Uber Eats

### Payments
- Square

### SMS
- Twilio
