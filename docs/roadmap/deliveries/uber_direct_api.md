can i save on uber fees by implementing a custom ordering website that integrates with the offical uber API?

Quick Answer
Yes, implementing a custom ordering website via the Uber Direct API can significantly reduce delivery fees compared to third-party marketplaces. 

Cost Reduction: Orders placed directly through your own website or app incur lower fulfillment costs than those originating from third-party platforms like the Uber Eats marketplace. This allows businesses to maintain convenience for customers while improving profit margins. 

Integration Methods: Merchants can connect to the platform in three ways:

Activate through an existing point-of-sale (POS) system.
Integrate with the Uber Direct API for automated order processing.
Use the Uber Direct dashboard for manual fulfillment requests. 
Customer Experience: This approach enables you to keep customers on your brand’s platform, offering customized delivery updates and fees that align with your specific business model, rather than relying on third-party app interfaces. 


Copy

🌐
🌐
🌐
🌐
+16
how does manual fulfillment work for uber?


Finished
Manual fulfillment via the Uber Direct dashboard allows merchants to request delivery for orders received through their own channels (phone, custom website, or in-person) without using the Uber Eats marketplace.

How It Works
Access Dashboard: Log in to the Uber Direct merchant portal using credentials provided during signup. 
Initiate Order: Click "+ New delivery" on the dashboard. 
Enter Details:
Pickup: Select your store location and add specific instructions for the driver (e.g., "meet at register").
Dropoff: Input the customer’s full address, name, and contact number. You can add notes for the driver (e.g., "use buzzer").
Package: Specify weight and description to ensure the correct vehicle type (bike vs. car) is assigned.
Preferences: Choose proof-of-delivery methods (PIN, signature, photo, ID check) and decide if the package should be returned if the customer is unavailable.
Submit & Tip: Review the quote, add a tip for the driver (optional but recommended), and click "Request now" or schedule for later.
Cost Structure
Unlike marketplace orders that charge a percentage commission (20–30%), manual fulfillment via Uber Direct uses a flat-rate pricing model:

Base Fee: Approximately $7.99 – $10.00 per delivery (varies by region). 
Distance Fee: An additional ~$1.10 per kilometer (or mile equivalent) between pickup and dropoff. 
No Commission: You retain 100% of the order revenue collected from your customer, paying Uber only for the logistics. 
This method is ideal for businesses that already have their own ordering system but need reliable, on-demand logistics without the high fees of third-party marketplaces. 


Uber Direct merchant dashboard login

View all

Copy


does doordash have an equivalent to uber direct? and how hard is it to fully test & be approved for uber direct?


Finished
Yes, DoorDash offers a direct equivalent called DoorDash Drive.

DoorDash Drive vs. Uber Direct
DoorDash Drive functions identically to Uber Direct, providing white-label, on-demand delivery for orders placed on your own website or app.

Integration: Like Uber, it offers an API for automated dispatch and a merchant portal for manual order entry.
Pricing: It utilizes a flat-fee model per delivery rather than the high commission rates charged on the DoorDash marketplace, allowing you to retain customer data and branding. 
POS Partners: Many Point-of-Sale systems (e.g., Toast, Square) have native integrations for DoorDash Drive, similar to their Uber counterparts. 

DoorDash Drive API pricing and features

View all
Uber Direct Testing & Approval Difficulty
The process to get approved and fully test Uber Direct is moderately technical but straightforward, typically taking 24–48 hours for account verification once documents are submitted. 

1. Testing Environment (Sandbox)
Testing is easy and immediate once you register as a developer.

Sandbox Access: Uber provides a fully functional Sandbox environment accessible via Postman or direct API calls.  This allows you to simulate orders, driver assignments, and webhooks without generating real deliveries or costs.
Credentials: You generate test client_id and client_secret keys instantly in the developer dashboard. 
Limitations: The sandbox is for functional testing only; it does not support load or stress testing. 
2. Production Approval
Moving from Sandbox to live production requires a validation review.

Requirements: You must submit business details, including a valid food/business license, menu, and hours of operation. 
Review Time: Document verification typically takes 24 to 48 hours.  In some cases, depending on background checks or local regulations, it may take up to a week.
Validation: Uber reviews your integration to ensure compliance with their API standards before granting production tokens. Unlike driver sign-ups, merchant API approval is generally faster if documentation is complete. 

Uber Direct API production approval requirements

View all

Copy


can i use the native uber/doordash integration of Square POS, instead of implementing my own custom API integration?


Finished
Yes, you can use the native Square integrations for both Uber Direct and DoorDash Drive to avoid custom API development.

How It Works
Instead of building a custom website integration, you install the official Uber Direct and DoorDash Drive apps from the Square App Marketplace.

Automatic Sync: Orders placed on your own website (via Square Online) or entered manually in the Square POS register can be routed directly to these services with a single tap.
Unified Dashboard: Delivery status, driver tracking, and receipts appear directly within the Square POS interface, eliminating the need to manage a separate Uber or DoorDash merchant portal.
Pricing: You still benefit from the flat-rate delivery fees of Uber Direct and DoorDash Drive rather than marketplace commissions, provided you select the "Direct/Drive" service within the app settings.
Implementation Difficulty
Setup Time: Minutes. It requires downloading the app, logging into your Uber/DoorDash account (or creating one), and mapping your menu items.
Technical Skill: None. No coding or API knowledge is required.
Testing: You can perform a live test immediately by placing a real order through your POS; there is no separate sandbox environment needed for the native integration.
This approach is ideal for businesses that want the cost savings of direct delivery without the engineering resources required for a custom API build.


Square POS Uber Direct integration setup guide

View all

Square POS DoorDash Drive integration setup guide

View all

Copy


what if i want to accept orders from my own website, but route them through square POS to uber?


Finished
Yes, this is the most efficient workflow. You can accept orders on your Square Online website and have them automatically route to Uber Direct for delivery via the Square POS integration. 

How the Workflow Operates
Customer Orders: A customer places an order on your Square Online website (powered by Square).
POS Ingestion: The order instantly appears in your Square POS dashboard or kitchen display system, just like an in-person sale. 
One-Tap Dispatch:
Locate the order in the Square POS interface.
Tap the “+” icon or the Uber Direct button associated with the order.
The customer’s address and item details auto-populate.
Confirm the delivery request to dispatch a driver immediately. 
Key Advantages
No Double Entry: You avoid manually typing website orders into a separate Uber portal; the data flows directly from your website to the POS to the driver. 
Unified Management: All orders (in-store, website, and delivery) are tracked in a single Square timeline. 
Flat-Rate Pricing: As long as you dispatch via the Uber Direct button within Square (and not via the Uber Eats marketplace tab), you pay the lower flat delivery fee rather than a commission.
Setup Requirements
Activate Integration: Go to Square Dashboard > Account & Settings > Online Sales Channels, find Uber Direct, and click Activate. 
Eligibility: Available to most US merchants on the Square platform. 
Menu Sync: Your Square menu automatically syncs to ensure item accuracy during dispatch. 

Square Online Uber Direct automatic dispatch setup

View all

Copy


not square online, but a custom-built website


Finished
Yes, you can route orders from a custom-built website to Square POS and then to Uber Direct, but it requires a custom API integration. 

Unlike the native Square Online workflow, a custom website does not automatically push orders to the POS. You must build a bridge using the Square Orders API. 

The Custom Workflow
Customer Orders: A customer places an order on your custom website and pays (using Square Payments API or another processor). 
API Injection: Your website’s backend sends a CreateOrder request to the Square Orders API.
Critical Step: You must include the fulfillments parameter in the API request (specifying "DELIVERY" or "PICKUP"). Without this, the order will appear in the dashboard but will not pop up on the POS terminal for the kitchen/staff to see.
Payment Status: The order must be marked as paid (or have a payment attached via the Payments API) to automatically appear in the POS workflow. 
POS Appearance: The order instantly appears in the Square POS "Orders" tab with a modal notification. 
Dispatch: Your staff taps the order in Square POS, selects the Uber Direct button, and dispatches the driver just like a native online order. 
Technical Requirements
Development Effort: Moderate. You need a developer to handle the API authentication, map your website’s menu items to Square Catalog IDs, and handle error logging.
Menu Sync: You are responsible for keeping your custom website’s menu in sync with Square. If an item is out of stock in Square, your website won’t know unless you build a sync feature using the Square Catalog API.
Testing: You can test this entire flow in the Square Sandbox environment before going live, simulating orders and payments without real costs. 
This approach gives you the branding freedom of a custom site with the operational simplicity of Square POS and Uber Direct, but shifts the maintenance burden from Square to your development team.


Square Orders API create order with fulfillment example

View all





Square POS API custom website order integration

View all

Copy


would doing it this way let me avoid the uber fees that customers have to pay if using the uber app/website directly?



Finished
Yes, routing orders this way allows you to completely avoid the high "service fees" and "delivery fees" that customers pay on the Uber Eats app.

When a customer orders directly from the Uber Eats marketplace app, they typically pay:

Delivery Fee: Often $5.99 – $9.99+ (dynamic based on demand/distance). 
Service Fee: A percentage of the order (often 15%+) or a flat fee, which Uber keeps for platform operations. 
Regulatory Recovery Fee: Additional surcharges in some cities.
Total Customer Markup: On a $40 order, a customer might pay $12–$15 in extra fees on top of the food cost. 
How Your Custom Setup Changes the Fees
By using your custom website + Square POS + Uber Direct:

You Control the Customer Price: Since the transaction happens on your website, you decide what to charge the customer for delivery.
You can charge a flat $4.99 (or even offer free delivery) regardless of what Uber charges you.
You do not pass the Uber "Service Fee" or dynamic surge pricing to the customer. 
You Pay the Logistics Cost: You pay Uber Direct the wholesale flat rate (e.g., ~$9.00 – $12.00 total depending on distance).
This is a business expense, not a customer surcharge.
The Savings:
Marketplace Scenario: Customer pays $40 food + $14 fees = $54 total. (You receive ~$28 after commissions).
Custom Website Scenario: You charge customer $40 food + $5 delivery = $45 total. (You receive ~$35 after paying Uber's ~$10 logistics fee). 
Strategic Advantage
Lower Prices for Customers: Your total checkout price can be 20–30% lower than the Uber Eats app, making your custom site more attractive.
Higher Margins for You: You retain the difference between what you charge the customer and the flat Uber Direct cost.
No "Small Order" Fees: You avoid the punitive small-order fees often applied to marketplace users. 