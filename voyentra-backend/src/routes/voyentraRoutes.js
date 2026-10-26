const express = require('express');
const router = express.Router();
const voyentraController = require('../controllers/voyentraController');
const { authenticateUser, requireRole } = require('../middleware/authMiddleware');

// Apply user identity & role authentication to all Voyentra routes
router.use(authenticateUser);

// Meta & Organization
router.get('/meta', voyentraController.getOrganizationData);

// Flights & Hotels Search (with in-policy checking)
router.get('/flights', voyentraController.searchFlights);
router.get('/hotels', voyentraController.searchHotels);

// Travel Requests (Traveler submits & views personal; Manager/Admin view team)
router.get('/requests', voyentraController.getTravelRequests);
router.post('/requests', voyentraController.createTravelRequest);

// Manager Approvals (Protected: Manager & Admin only)
router.get('/approvals', requireRole('manager', 'admin'), voyentraController.getApprovals);
router.post('/approvals/:id/decide', requireRole('manager', 'admin'), voyentraController.decideApproval);

// Trips & Bookings (Traveler views personal; Manager/Finance/Admin view all)
router.get('/trips', voyentraController.getTrips);
router.post('/bookings', voyentraController.bookTravelOption);
router.get('/bookings/:id/ticket', voyentraController.getTicketDetails);

// Expenses & Receipts (Traveler views personal; Finance audits & approves)
router.get('/expenses', voyentraController.getExpenses);
router.post('/expenses', voyentraController.createExpense);
router.post('/expenses/:id/approve', requireRole('finance', 'admin'), voyentraController.approveExpense);

// Policies & Budgets (Protected: Policy modifications require Admin)
router.get('/policy', voyentraController.getPolicy);
router.put('/policy', requireRole('admin'), voyentraController.updatePolicy);

// Corporate Spend & Stats (Protected: Manager, Finance, Admin)
router.get('/stats', requireRole('manager', 'finance', 'admin'), voyentraController.getStats);

// Duty of Care & Traveler Safety Tracking
router.get('/duty-of-care', voyentraController.getDutyOfCare);
router.post('/duty-of-care/broadcast', requireRole('manager', 'admin'), voyentraController.broadcastSafetyAlert);
router.post('/duty-of-care/checkin', voyentraController.submitSafetyCheckin);

// Accounting Exports & Multi-Currency Engine
router.get('/currencies', voyentraController.getCurrencies);
router.get('/accounting/export', requireRole('finance', 'admin'), voyentraController.getAccountingExport);
router.post('/cost-centers/:id/toggle-lock', requireRole('finance', 'admin'), voyentraController.toggleCostCenterLock);

// Super Admin Multi-Tenant Provisioning & Organization Onboarding (SRS Section 17 & 21)
router.get('/admin/tenants', requireRole('admin'), voyentraController.getTenants);
router.post('/admin/tenants', requireRole('admin'), voyentraController.provisionTenant);
router.put('/admin/tenants/:id/status', requireRole('admin'), voyentraController.updateTenantStatus);
router.put('/admin/tenants/:id/feature-flags', requireRole('admin'), voyentraController.updateTenantFeatureFlags);
router.get('/admin/employees', requireRole('admin'), voyentraController.getAdminEmployees);
router.post('/admin/employees/bulk-invite', requireRole('admin'), voyentraController.bulkInviteEmployees);

module.exports = router;
