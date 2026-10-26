# Voyentra Frontend Client (React 19 + Vite)

> **Document Reference:** Voyentra SRS Specification v1.0 (Heloix)  
> **Framework:** React 19 • Vite • Lucide React • Tesseract.js Client OCR

---

## 🏗️ Component Architecture & Hierarchy

```
App.jsx (Root State & RBAC Persona Switcher)
├── Navigation Bar (Persona selector, active role badge, Supabase status pill)
├── DutyOfCareCenter.jsx (Global traveler GPS map, city threat advisories, emergency alerts)
├── TravelerDashboard.jsx (Alex Morgan / Employee View)
│   ├── Flight & Hotel Policy Search
│   ├── My Trips & Confirmed Itineraries
│   │   └── DigitalPassModal.jsx (Airline Boarding Pass & Hotel Check-in Voucher with Aztec/QR codes)
│   └── My Expenses & OCR Claims
│       ├── ReceiptScanner.jsx (Client Tesseract.js OCR Image Worker)
│       └── ReceiptInspectionModal.jsx (Optical bounding box & attribute audit)
├── ManagerDashboard.jsx (David Miller / VP View)
│   ├── Pending Travel Authorizations Queue
│   └── Team Spend & Department Budget Tracker
├── FinanceDashboard.jsx (Elena Vance / Finance Controller View)
│   ├── Multi-Currency Dynamic Switcher (USD, EUR, GBP, INR, CAD, SGD)
│   ├── Expense Claims & OCR Audit Table
│   ├── Departmental Cost Centers & Hard Budget Locks (FR-209)
│   ├── Spend Ledger & GL Accounts (6200, 6210, 6220, 6230)
│   └── AccountingExportModal.jsx (1-Click QuickBooks / Xero / Audit CSV Exporter)
└── AdminDashboard.jsx (Chinmay Pardeshi / Super Admin View)
    ├── Multi-Tenant SaaS Workspaces (MAT meter, feature flags, status toggles)
    │   └── TenantProvisionModal.jsx (New workspace wizard & custom subdomain setup)
    ├── Employee Directory & CSV Onboarding
    │   └── EmployeeRosterImporter.jsx (Bulk CSV parser & invitation dispatcher)
    ├── Global Travel Policy Rules Engine (Flight & hotel caps, advance booking days)
    ├── Cost Center Allocations
    └── Supabase Cloud Database Inspector (13 PostgreSQL Tables)
```

---

## 🛠️ Key Utilities

- **`src/utils/ocrService.js`**:
  - Initializes a client-side Tesseract.js OCR worker.
  - Pre-processes image contrast and extracts raw optical text strings.
  - Regex parsers automatically extract merchant name, gross total, VAT tax, transaction date, payment method, and category.
- **`src/utils/accountingExporter.js`**:
  - Formats transaction records into standard **QuickBooks** General Journal CSV.
  - Formats records into multi-line **Xero** Invoice/Journal CSV.
  - Formats records into comprehensive **Voyentra Corporate Audit CSV**.
  - Triggers direct browser file download without third-party server dependencies.

---

## 🚀 Running the Frontend

### Development Mode (with API Proxy)
```bash
npm run dev
```
*Starts Vite development server on `http://localhost:5173` with proxying to Express on `http://localhost:5000`.*

### Production Build
```bash
npm run build
```
*Outputs optimized client bundle into `dist/`.*
