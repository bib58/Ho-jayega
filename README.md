# Cart-HUB

Cart-HUB is a multi-vendor e-commerce platform built with Next.js, MongoDB, and Tailwind CSS. It allows users to establish and manage their own storefronts independently while providing a centralized administrative dashboard for overall platform governance. The platform is designed with automated background processing for real-time synchronization, optimized media management, and secure checkout experiences.

### **Live Demo:** [https://haule-haule.vercel.app/](https://haule-haule.vercel.app/)

---

## Core Features

### 1. Multi-Vendor Storefronts
* **Merchant Onboarding:** Users can create independent storefronts, establish unique brand identities, and upload custom logos.
* **Seller Dashboards:** Real-time dashboards for sellers to add products, manage details, update stock inventory, and manage order fulfillment states.
* **Stock & Inventory Tracking:** Automated stock management that keeps count of available items and automatically flags products as out-of-stock when depleted.
* **Product Reviews:** After the product gets delivered, only then the user can rate that product which will be stored with productId under reviews collection.

### 2. Admin & Moderation Panel
* **Central Governance:** Centralized administration interface to monitor registered stores, approve or reject newly created storefronts, and manage overall platform integrity.
* **Role-Based Routing:** Secure authentication layout ensuring only verified administrators can access core configuration controls.

### 3. Automated Background Workflows (Inngest)
* **User Lifecycle Syncing:** Listens to Clerk webhooks to automatically create, update, or remove user profiles in MongoDB in response to authentication events.
* **Scheduled Cleanup Tasks:** Durable function executions that manage scheduled events, such as automatically deleting promotional coupons from the database once they reach their expiration time.

### 4. Payments & Billing (Stripe)
* **Secure Checkout Flow:** Integrated Stripe payment gateway supporting multi-item and multi-vendor checkouts.
* **Webhook Verification:** Listens to Stripe webhook events to verify transaction success and update database order records accordingly.
* **Dynamic Coupons:** A discount logic that validates user-applied coupon codes against criteria and applies discounts to the total price during checkout.

### 5. Media & Asset Management (ImageKit.io)
* **setting image to a cloud storage**:- for storing all images of products and sellers 

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | Next.js (v16), React (v19) |
| **State Management** | Redux Toolkit, React-Redux |
| **Database** | MongoDB |
| **Styling** | Tailwind CSS (v4) |
| **Authentication** | Clerk (with Clerk Webhooks) |
| **Background Processing** | Inngest |
| **Payment Gateway** | Stripe (with Webhook signature verification) |
| **Media Hosting** | ImageKit.io |
| **HTTP Client** | Axios |

### Automatic Coupon Expiry & Deletion
* When a coupon is created, a `coupon-created` event is triggered.
* The Inngest function `delete-expired-coupon` catches this event and immediately runs a durable `step.sleepUntil` step.
* Once the exact expiration timestamp is reached, the execution wakes up and executes a `step.run` to delete the coupon directly from MongoDB, eliminating the need for cron-polling.

