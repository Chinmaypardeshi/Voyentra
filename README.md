# VOYENTRA — Corporate Travel, Expense & Spend Management Platform
> **Reference Product:** Perk / Navan / TravelPerk  
> **Document Reference:** Voyentra SRS Specification v1.0 (Heloix)  
> **Architecture:** React 19 (Frontend) + Node.js Express (Backend) + Tesseract.js (Client OCR Engine) + Supabase Cloud PostgreSQL (ap-southeast-1)

---

## 📋 Project Overview & SRS Alignment

Voyentra is an enterprise multi-tenant corporate travel, expense, and spend management platform that streamlines the end-to-end business travel lifecycle from request to accounting reconciliation:

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
  - **USD ($)** — Base Corporate Currency
  - **EUR (€)** — 0.92 FX Rate
  - **GBP (£)** — 0.79 FX Rate
  - **INR (₹)** — 84.50 FX Rate
  - **CAD (C$)** — 1.39 FX Rate
  - **SGD (S$)** — 1.34 FX Rate
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
