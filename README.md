# VOYENTRA — Corporate Travel, Expense & Spend Management Platform
> **Reference Product:** Perk / Navan / TravelPerk  
> **Document Reference:** Voyentra SRS Specification v1.0 (Heloix)  
> **Architecture:** React 19 (Frontend) + Node.js Express (Backend) + Tesseract.js (Client OCR Engine) + Supabase Cloud PostgreSQL (ap-southeast-1)

---

## 📋 Project Overview & SRS Alignment

Voyentra is an enterprise multi-tenant corporate travel, expense, and spend management platform that streamlines the end-to-end business travel lifecycle from search to accounting reconciliation:

```
Employee Travel Search & Request 
       │
       ▼
Real-Time Corporate Policy Validation (In-Policy vs Out-of-Policy)
       │
       ▼
Manager Approval Workflow (Multi-Tier Approval Engine with Audit Reasons)
       │
       ▼
Ticket & Reservation Management (PNR Issuance & Corporate Card Settlement)
       │
       ▼
Digital Boarding Pass & Itinerary Voucher Generator (Aztec/QR Codes & PDF)
       │
       ▼
Duty of Care & Traveler Safety (Live Geo-Tracking, Risk Intel, Emergency SOS)
       │
       ▼
Real Optical OCR Receipt Scanning (Tesseract.js Client Extraction & Audit Inspection)
       │
       ▼
Multi-Currency Financial Ledger & Hard Cost Center Budget Enforcement (FR-209)
       │
       ▼
1-Click Accounting Export Engine (QuickBooks, Xero, NetSuite, GL Journal CSVs)
       │
       ▼
Super Admin Multi-Tenant Governance & CSV Employee Onboarding (SRS Sec 17 & 21)
```

---

## 🌟 Comprehensive Feature Matrix (Built & Live)

### 1. 🔍 Real-Time Optical OCR Receipt Scanner (SRS Section 10 / FR-080 to FR-102)
- **Client-Side Optical Character Recognition (Tesseract.js)**: Runs high-accuracy OCR directly on uploaded receipt images (JPG, PNG, WebP) without sending images to third-party paid APIs.
- **Intelligent Attribute Parsing**: Automatically extracts:
  - Merchant Name (e.g. British Airways, Langham London, Heathrow Express, Uber)
  - Gross Transaction Amount & Currency
  - Tax / VAT breakdown (e.g. 15% - 20% VAT detection)
  - Transaction Date
  - Payment Method (e.g. Corporate Visa •••• 4012)
  - Category Mapping (Lodging, Flights, Rail, Business Dining, Incidentals)
  - OCR Confidence Score (%)
- **Receipt Inspection Modal (`ReceiptInspectionModal.jsx`)**: Side-by-side optical inspection window showing the raw receipt scan, bounding box indicators, extracted attributes, and 1-click Finance Reimbursement Authorization.
- **High-Capacity Express Upload**: Configured with 25MB request entity payload support.

### 2. 🌍 Duty of Care & Traveler Tracking Live Map (SRS Section 12.4 & Section 18)
- **Interactive Global Traveler Tracking**: Real-time visualization of traveling employees worldwide with live GPS coordinate mapping.
- **City-Level Safety Threat Advisories**: Integrated threat monitoring across active business hubs:
  - **London, UK**: LOW RISK (Normal Precaution)
  - **Singapore**: LOW RISK (Normal Precaution)
  - **New York, USA**: LOW RISK (Normal Precaution)
  - **Frankfurt, Germany**: MODERATE RISK (Transit Union Strike Alert)
  - **Paris, France**: MODERATE RISK (Demonstration Advisory)
- **Emergency Mass Alert Broadcast (`POST /api/voyentra/duty-of-care/broadcast`)**: 1-click broadcast tool dispatching high-priority SMS/Email alerts (Evacuation, Shelter-in-Place, Flight Cancellation) to all travelers currently active in impacted cities.
- **Traveler Safety Check-In (`POST /api/voyentra/duty-of-care/checkin`)**: Enables traveling employees to instantly report "Safe" or "Need Assistance" with live GPS location confirmation.

### 3. 💱 Multi-Currency Engine (SRS Section 16 & Section 20)
- **Dynamic Currency Switcher**: 1-click real-time conversion bar in the Finance view supporting:
  - **USD ($)** — Base Corporate Currency (Rate: 1.0)
  - **EUR (€)** — European Euro (Rate: 0.92)
  - **GBP (£)** — British Pound (Rate: 0.79)
  - **INR (₹)** — Indian Rupee (Rate: 84.50)
  - **CAD (C$)** — Canadian Dollar (Rate: 1.39)
  - **SGD (S$)** — Singapore Dollar (Rate: 1.34)
- **Live Re-calculation**: Dynamically recalculates Total Corporate Spend, Expense Reimbursement claims, Departmental Cost Center allocations, and Gross Settlements with native currency symbols and formatting.

### 4. 📊 1-Click Accounting Export Engine (QuickBooks / Xero / NetSuite / CSV) (SRS Section 13.6 & Section 19.4)
- **General Ledger (GL) Chart of Accounts Mapping**:
  - `6200`: Air Travel - Commercial Airlines
  - `6210`: Ground Transit, Taxi & Rail
  - `6220`: Business Meals & Client Entertainment
  - `6230`: Corporate Hotel & Lodging
  - `6290`: Travel Sundries & Incidental Fees
- **Export Standards**:
  - **QuickBooks (Desktop & Online)**: General Journal CSV formatted with `Date`, `Transaction Type`, `Num`, `Name`, `Memo`, `Account`, `Split`, `Amount`, and `Currency`.
  - **Xero**: Multi-line Journal CSV formatted with `*ContactName`, `*InvoiceNumber`, `*InvoiceDate`, `*DueDate`, `*Description`, `*Quantity`, `*UnitAmount`, `*AccountCode`, and `*TaxType`.
  - **Standard Voyentra Corporate Audit CSV**: Comprehensive export including transaction IDs, employee IDs, cost centers, original vs converted currencies, tax/VAT breakdowns, and OCR verification tags.
- **Export Preview Modal (`AccountingExportModal.jsx`)**: Filter by cost center and currency, preview audit lines before export, and trigger direct browser file downloads.

### 5. 🔒 Hard Cost Center Budget Enforcement (SRS Section 15.2 / FR-209)
- **Departmental Budget Allocation**: Track real-time spend across `CC-ENG-101` (Engineering), `CC-SALES-201` (Sales), and `CC-OPS-301` (Operations).
- **Strict Budget Ceiling Toggle**:
  - `🔒 Enforce Hard Lock`: Activates a hard budget cap blocking any booking or expense claim that exceeds the department's remaining allocation.
  - `🔓 Soft Budget Cap`: Standard notifications without blocking transactions.

### 6. ✈️ Travel Search, Policy Enforcement & Manager Approvals
- **Live Flight & Hotel Search**: Search flights and hotels with automatic real-time policy evaluation.
- **Policy Engine**: In-Policy (green) vs Out-of-Policy (amber) classification based on corporate flight caps ($1,200), hotel night limits ($250), and permitted cabin classes.
- **Manager Approval Pipeline**: Out-of-policy bookings trigger multi-tier approval flows with justification capture, approval counters, and 1-click decision modals.
- **Corporate Card Settlement**: Instant corporate card checkout issuing real PNR references (e.g. `BA-849201`).

### 7. 🏢 Super Admin Multi-Tenant Provisioning & Employee Onboarding (SRS Section 17 & 21)
- **Multi-Tenant SaaS Governance**:
  - Full visibility across provisioned corporate tenants (*Voyentra Global*, *Acme Aerospace*, *Nexus BioPharma*, *Starlight Logistics*).
  - Track Monthly Active Travelers (MAT), seat utilization meters, and subscription plan tiers (*Enterprise*, *Growth*, *Starter*).
  - Dynamic Feature Flag controls per tenant (`🚄 Rail Booking`, `🏨 Hotel Direct Card Billing`, `🔒 Hard Budget Locks`, `⚡ Auto-Approve <$500`).
  - Tenant status lifecycle (`Active`, `Suspended`, `Provisioning`).
- **Interactive Tenant Provisioning Wizard (`TenantProvisionModal.jsx`)**:
  - Provisions new corporate workspaces with dedicated subdomains (e.g. `acme.voyentra.com`), operating currencies, seat ceilings, and feature flags (`POST /api/voyentra/admin/tenants`).
- **CSV Employee Roster Importer (`EmployeeRosterImporter.jsx`)**:
  - Drag-and-drop or load sample 5-employee corporate rosters.
  - Interactive validation preview showing valid email checks, recognized RBAC roles (`traveler`, `manager`, `finance_manager`, `admin`), and cost center linking.
  - 1-click batch provisioning and invitation dispatch (`POST /api/voyentra/admin/employees/bulk-invite`).

### 8. 🎫 Digital Airline Boarding Pass & Hotel Voucher Generator (SRS Section 8 & 18)
- **High-Fidelity Airline Boarding Pass (`DigitalPassModal.jsx`)**:
  - Two-part perforated boarding pass card displaying carrier (*British Airways*), flight number (`BA 178`), e-ticket number, origin and destination terminals, departure and boarding times, gate (`B24`), seat (`14A Window`), and zone.
  - Dynamic 2D Aztec / QR barcode encoding PNR reference for airport security and e-gate scanning.
  - Frequent flyer number, checked baggage allowance, and 24/7 Duty of Care emergency hotline.
- **Corporate Hotel Stay Voucher**:
  - Check-in voucher for confirmed accommodations (*The Langham London*), check-in / check-out times, room type, corporate policy inclusions (breakfast, Wi-Fi, executive lounge), and direct corporate billing confirmation.
- **Print & PDF Export**:
  - Formatted `@media print` CSS stylesheet enabling 1-click clean printing / PDF saving directly from the browser without dashboard navigation chrome.
  - Passbook JSON export for offline mobile access.

---

## 🏗️ Codebase & Component Architecture

```
Voyentra-main/
├── README.md                                 # Complete project specification & guide
├── voyentra-backend/                         # Node.js + Express API server
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                         # Supabase cloud pooler client
│   │   │   └── voyentraDb.js                 # High-fidelity 13-table schema store
│   │   ├── controllers/
│   │   │   └── voyentraController.js         # Core controllers & business logic
│   │   ├── middleware/
│   │   │   └── authMiddleware.js             # RBAC role authentication
│   │   ├── routes/
│   │   │   └── voyentraRoutes.js             # 19 REST endpoints
│   │   └── index.js                          # Express entrypoint & static server
│   └── package.json
└── voyentra-frontend/                        # React 19 + Vite client
    ├── src/
    │   ├── components/
    │   │   ├── TravelerDashboard.jsx         # Search, my trips, expenses
    │   │   ├── ManagerDashboard.jsx          # Team approvals & budget tracking
    │   │   ├── FinanceDashboard.jsx          # Audit, multi-currency, GL exports
    │   │   ├── AdminDashboard.jsx            # Multi-tenant provisioner & policy
    │   │   ├── DutyOfCareCenter.jsx          # World map tracking & SOS alerts
    │   │   ├── ReceiptScanner.jsx            # Tesseract OCR image scanner
    │   │   ├── ReceiptInspectionModal.jsx    # Optical audit verification
    │   │   ├── AccountingExportModal.jsx     # QuickBooks & Xero export modal
    │   │   ├── TenantProvisionModal.jsx      # New corporate workspace wizard
    │   │   ├── EmployeeRosterImporter.jsx    # CSV bulk onboarding tool
    │   │   └── DigitalPassModal.jsx          # Boarding pass & printable voucher
    │   ├── utils/
    │   │   ├── ocrService.js                 # Client-side Tesseract.js worker
    │   │   └── accountingExporter.js         # CSV export generator utilities
    │   ├── App.jsx                           # Persona switching & state provider
    │   ├── App.css                           # Enterprise layout & print styles
    │   └── index.css                         # Core color palette & components
    ├── dist/                                 # Production static build bundle
    └── package.json
```

---

## 👥 Personas & Role-Based Access Control (RBAC)

The application simulates 4 distinct corporate personas to test strict RBAC boundaries:

| Persona Name | Title / Organization Role | Primary Capabilities | Mock Auth Headers |
| :--- | :--- | :--- | :--- |
| **Alex Morgan** | Software Engineer (`traveler`) | Search travel, book in-policy flights, request manager sign-offs, submit OCR claims, view boarding passes | `x-user-id: 2222...0002`<br>`x-user-role: traveler` |
| **David Miller** | VP of Engineering (`manager`) | Review pending travel requests, approve/reject with audit reason, monitor team budget spend | `x-user-id: 3333...0003`<br>`x-user-role: manager` |
| **Elena Vance** | Financial Controller (`finance_manager`) | Inspect OCR receipt parameters, authorize reimbursements, switch currencies, export to QuickBooks/Xero, enforce hard budget locks | `x-user-id: 4444...0004`<br>`x-user-role: finance` |
| **Chinmay Pardeshi** | Super Administrator (`admin`) | Configure policy rules, provision new tenant workspaces, manage feature flags, bulk invite employee rosters via CSV | `x-user-id: 5555...0005`<br>`x-user-role: admin` |

---

## 🗄️ Database Schema (13/13 Tables Connected)

The backend and frontend are architected directly around your Supabase Cloud Database schema:

| Table Name | Primary Purpose in the SRS | Frontend Interface & Workflow |
| :--- | :--- | :--- |
| **`organizations`** | Multi-tenant organization profile, legal name, currency (USD), time zone | Multi-tenant header & settings |
| **`user_profiles`** | Employee accounts, roles, departmental assignments, emails | Persona switcher (Alex Morgan, David Miller, Elena Vance, Chinmay Pardeshi) |
| **`departments`** | Departmental hierarchy (Engineering, Sales & Growth, Executive Suite) | Cost center attribution and organizational tree |
| **`cost_centers`** | Financial codes (`CC-ENG-101`, `CC-SALES-201`) with budget limits & hard locks | **Cost Centers & Hard Locks** spend meters & lock enforcement |
| **`organization_memberships`**| Role-based access control and organizational memberships | Persona and role-based permissions matrix |
| **`travel_policies`** | Flight amount caps, hotel nightly rates, permitted cabin classes | **Policy Engine** with active rules editor and real-time rule enforcement |
| **`travel_requests`** | Pre-trip authorization requests, destinations, dates, budgets | **Travel Requests** submission and approval pipeline |
| **`approvals`** | Multi-tier manager decisions (`pending`, `approved`, `rejected`) + feedback | **Travel Approvals Queue** with 1-click Approve / Reject with reason |
| **`trips`** | Confirmed corporate itineraries and purpose of travel | **My Trips & Itineraries** dashboard |
| **`bookings`** | Booked flights and hotel stays with supplier reference / PNR | E-ticket and reservation confirmation cards |
| **`payments`** | Corporate card settlement and provider references | Corporate payment receipt confirmation badges |
| **`expenses`** | Out-of-pocket employee claims, categories, and amounts | **Expenses & Receipts** table with approval workflow |
| **`receipts`** | Receipt attachment with **OCR JSONB Data** (Merchant, Tax, Confidence) | **Receipt Scanner & Optical Inspection Modal** |

---

## 🌐 Complete REST API Endpoints Reference

### Core & Metadata
- `GET /api/health` — Platform health check & Supabase connection status.
- `GET /api/voyentra/meta` — Tenant metadata, departments, cost centers, and user profiles.

### Travel Search & Bookings
- `GET /api/voyentra/flights` — Search flights with in-policy / out-of-policy tag calculation.
- `GET /api/voyentra/hotels` — Search hotels with nightly cap policy validation.
- `GET /api/voyentra/trips` — Retrieve confirmed employee and organization trips.
- `POST /api/voyentra/bookings` — Book travel and issue PNR reservations via corporate card settlement.
- `GET /api/voyentra/bookings/:id/ticket` — Retrieve digital boarding pass, QR codes, seat assignments, and hotel voucher details.

### Policy & Approvals
- `GET /api/voyentra/policy` — Get active organization travel policy rules.
- `PUT /api/voyentra/policy` — *(Admin only)* Update flight caps, hotel caps, and cabin restrictions.
- `GET /api/voyentra/requests` — Retrieve travel pre-authorization requests.
- `POST /api/voyentra/requests` — Submit travel authorization request for manager review.
- `GET /api/voyentra/approvals` — *(Manager/Admin)* View pending approvals queue.
- `POST /api/voyentra/approvals/:id/decide` — *(Manager/Admin)* Approve or reject request with audit reason.

### Expenses & Real OCR Receipts
- `GET /api/voyentra/expenses` — View employee expense claims and receipts.
- `POST /api/voyentra/expenses` — Submit expense claim with Tesseract OCR extracted receipt data.
- `POST /api/voyentra/expenses/:id/approve` — *(Finance/Admin)* Authorize reimbursement payout.

### Duty of Care & Traveler Safety (SRS Section 12.4 & 18)
- `GET /api/voyentra/duty-of-care` — Retrieve live traveler GPS tracking and city threat advisories.
- `POST /api/voyentra/duty-of-care/broadcast` — *(Manager/Admin)* Broadcast emergency mass notifications.
- `POST /api/voyentra/duty-of-care/checkin` — Submit traveler emergency safety check-in.

### Multi-Currency & Accounting Exports (SRS Sections 13 & 16)
- `GET /api/voyentra/currencies` — Retrieve live foreign exchange rates (USD, EUR, GBP, INR, CAD, SGD).
- `GET /api/voyentra/accounting/export` — *(Finance/Admin)* Fetch general ledger records mapped to standard GL codes (`6200`, `6210`, `6220`, `6230`) in requested currency.
- `POST /api/voyentra/cost-centers/:id/toggle-lock` — *(Finance/Admin)* Toggle Hard Budget Ceiling enforcement on cost center.

### Super Admin & Multi-Tenant SaaS Governance (SRS Sections 17 & 21)
- `GET /api/voyentra/admin/tenants` — *(Admin only)* List corporate tenants with MAT, seats, utilization %, and feature flags.
- `POST /api/voyentra/admin/tenants` — *(Admin only)* Provision new corporate tenant workspace with custom subdomain.
- `PUT /api/voyentra/admin/tenants/:id/status` — *(Admin only)* Toggle tenant status (`active` vs `suspended`).
- `PUT /api/voyentra/admin/tenants/:id/feature-flags` — *(Admin only)* Configure tenant feature flags (`rail`, `hotel_direct_bill`, `strict_locks`, `auto_approve`).
- `GET /api/voyentra/admin/employees` — *(Admin only)* Retrieve employee directory with roles and cost centers.
- `POST /api/voyentra/admin/employees/bulk-invite` — *(Admin only)* Bulk invite employees from CSV roster.

---

## 🚀 How to Run and Test the Application

### Option A: Complete Full-Stack in One Command (Recommended)

1. Build the production React frontend:
   ```bash
   cd voyentra-frontend
   npm run build
   cd ..
   ```

2. Start the unified Node.js API and React static server:
   ```bash
   node voyentra-backend/src/index.js
   ```

3. Open your browser:
   ```
   http://localhost:5000
   ```

---

### Option B: Run in Development Mode (Hot Reload)

1. **Terminal 1 — Backend API:**
   ```bash
   cd voyentra-backend
   npm run dev:backend
   ```
   *Runs on `http://localhost:5000`*

2. **Terminal 2 — React Frontend (Vite):**
   ```bash
   cd voyentra-frontend
   npm run dev:frontend
   ```
   *Runs on `http://localhost:5173` with automatic API proxying to port 5000*

---

## 🧪 Step-by-Step Test Scenarios (Testing the SRS Features)

### 1. Test Real OCR Receipt Scanning & Extraction
1. Switch persona to **Alex Morgan (Employee / Traveler)** in the top bar.
2. Click **Expenses & OCR Receipts** $\rightarrow$ click **Submit Expense Claim**.
3. In the modal, drag and drop any receipt image or click **"Scan & Extract with OCR"**:
   - Notice the Tesseract.js progress bar initialize and scan the optical text.
   - Merchant, Amount, Tax/VAT breakdown, and Category are automatically extracted and populated into the form.
4. Click **Submit Claim for Reimbursement**.
5. Switch to **Elena Vance (Finance)** $\rightarrow$ In the Expense table, click **Inspect**:
   - The **Receipt Inspection Modal** opens displaying the receipt image side-by-side with verified OCR bounding parameters.
   - Click **Authorize Reimbursement** to settle the claim.

### 2. Test Duty of Care & Traveler Safety Tracking
1. Click **Duty of Care & Traveler Safety** in the top navigation bar.
2. Review the live traveler GPS map showing employees currently in **London**, **Singapore**, and **Frankfurt**.
3. Inspect the city threat advisories (e.g. Frankfurt rail union strike alert).
4. Click **Broadcast Safety Alert**:
   - Select Frankfurt, set Alert Level to **CRITICAL**, enter instructions (e.g. *"Transit strike active. Shelter in place at hotel"*), and click **Broadcast Mass Alert**.
   - Notice the advisory counter and notification banner update immediately.
5. Click **Check-In as Safe**:
   - Submits employee GPS check-in to confirm safety status.

### 3. Test Multi-Currency Engine & Accounting Export
1. Switch persona to **Elena Vance (Finance)**.
2. **Multi-Currency**:
   - In the top bar, click **EUR (€)**, **GBP (£)**, or **INR (₹)**.
   - Observe the Total Spend KPI, Expense Audit table, and Cost Center allocations re-calculate dynamically.
3. **Accounting Export**:
   - Click the green **"Export to QuickBooks / Xero"** button.
   - Review the live GL journal preview table showing account codes `6200` (Flights), `6210` (Transit), `6220` (Meals), and `6230` (Hotels).
   - Click **Download QuickBooks CSV** or **Download Xero CSV** to receive the formatted file.
4. **Hard Cost Center Budget Enforcement (FR-209)**:
   - Click the **Departmental Cost Centers & Hard Locks** tab.
   - Click **"Enforce Hard Lock"** on **CC-ENG-101**:
     - The card displays a red `🔒 HARD BUDGET LOCKED` badge and activates strict cap enforcement preventing out-of-budget transactions.

### 4. Test Policy Enforcement & Manager Approvals
1. Switch to **Alex Morgan** $\rightarrow$ navigate to **Book Travel**.
2. British Airways ($880) is tagged with a green **IN POLICY** badge. Click **Book (Corporate Card)** to confirm instantly with PNR.
3. Lufthansa ($2,850) is tagged with an amber **OUT OF POLICY** badge (exceeds $1,200 flight cap).
4. Click **Request Approval** $\rightarrow$ enter justification *"Urgent executive client summit"* and submit.
5. Switch persona to **David Miller (VP / Approver)** $\rightarrow$ go to **Travel Approvals** $\rightarrow$ click **Approve** to authorize the trip.

### 5. Test Super Admin Multi-Tenant Provisioning & CSV Employee Onboarding
1. Switch persona to **Chinmay Pardeshi (Admin)** in the top bar.
2. In the Admin view, select **Multi-Tenant SaaS Workspaces**:
   - Inspect active tenant cards (*Voyentra Global*, *Acme Aerospace*, *Nexus BioPharma*, *Starlight Logistics*).
   - Test toggle buttons for feature flags: click **🚄 Rail & Transit Booking** or **⚡ Auto-Approve Flights < $500** to toggle them live.
   - Click **Suspend** on any active tenant to see the card update to red suspended state; click **Activate** to re-enable.
3. **Provision a New Tenant**:
   - Click the blue **"Provision New Corporate Tenant"** button.
   - Enter Company Name: *"Apex Capital"*, Subdomain: *"apex"*, Plan: *Enterprise*, Currency: *GBP (£)*.
   - Click **Provision Tenant Workspace** $\rightarrow$ the tenant is instantly registered with dedicated URL `apex.voyentra.com` and appended to the workspace grid.
4. **CSV Bulk Employee Onboarding**:
   - Click the **Employee Directory & CSV Onboarding** tab.
   - Click **"Load Sample Roster (5 Employees)"** or drag and drop a CSV.
   - Review the parsed preview table with role and cost center validations.
   - Click **"Dispatch 5 Invitations"** $\rightarrow$ accounts are provisioned and added directly into the employee directory!

### 6. Test Digital Airline Boarding Pass & Hotel Voucher Generator
1. Switch persona to **Alex Morgan (Employee / Traveler)** in the top bar.
2. Click **My Trips & Itineraries**:
   - Locate the confirmed trip (*London, United Kingdom*).
   - Click the blue **"E-Ticket & Pass"** button in the trip header or click **"Boarding Pass"** on the British Airways reservation.
3. **Inspect Airline Boarding Pass**:
   - A digital boarding pass card opens with carrier (*British Airways*), flight number (*BA 178*), seat (*14A Window*), gate (*B24*), departure terminal (*Terminal 7*), arrival terminal (*Terminal 5*), e-ticket number, and scannable 2D Aztec QR barcode.
   - Click the copy button next to the PNR reference (`BA-849201`) to copy it to clipboard.
4. **Inspect Hotel Stay Voucher**:
   - On the Langham London hotel reservation, click **"Stay Voucher"**:
   - The voucher displays hotel address (*1C Portland Place*), check-in / check-out dates, room type (*Executive King*), included amenities, corporate direct billing badge, and check-in QR code.
5. **Print or Save as PDF**:
   - Click **"Print / Save PDF"** $\rightarrow$ browser print preview opens with clean 1-page paper styling without dashboard sidebars.
   - Click **"Passbook"** $\rightarrow$ downloads offline structured travel JSON passbook.

---

## 🔒 Supabase Connection Configuration

In `voyentra-backend/.env`:
```env
PORT=5000
SUPABASE_URL=https://xzbmsbayggiazhwnlxri.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
DATABASE_URL=postgresql://postgres.xzbmsbayggiazhwnlxri:123%40Zxcvbnm%40123@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

The app features a **zero-downtime dual-readiness engine**:
- When the live Supabase PostgreSQL connection is active, queries execute directly against your cloud tables.
- If network connectivity is offline or credentials are being configured, the engine operates on a high-fidelity local store pre-seeded with all 13 tables from your schema so you can demonstrate every feature of the SRS without interruption.
