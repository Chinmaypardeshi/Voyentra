const crypto = require('crypto');
const { query, isLive, getMockDb } = require('../config/voyentraDb');

// Flight Search Inventory
const flightInventory = [
  {
    id: 'fl-001',
    airline: 'British Airways',
    flight_number: 'BA 178',
    origin: 'JFK',
    destination: 'LHR',
    origin_city: 'New York',
    destination_city: 'London',
    departure_time: '19:30',
    arrival_time: '07:45 (+1d)',
    duration: '7h 15m',
    stops: 'Non-stop',
    cabin: 'Economy',
    price: 880,
    currency: 'USD',
    baggage: '1 Check-in (23kg) + 1 Carry-on',
    refundable: true
  },
  {
    id: 'fl-002',
    airline: 'Delta Air Lines',
    flight_number: 'DL 003',
    origin: 'JFK',
    destination: 'LHR',
    origin_city: 'New York',
    destination_city: 'London',
    departure_time: '21:15',
    arrival_time: '09:30 (+1d)',
    duration: '7h 15m',
    stops: 'Non-stop',
    cabin: 'Premium Economy',
    price: 1350,
    currency: 'USD',
    baggage: '2 Check-in (23kg each) + 1 Carry-on',
    refundable: true
  },
  {
    id: 'fl-003',
    airline: 'Air France',
    flight_number: 'AF 023',
    origin: 'JFK',
    destination: 'CDG',
    origin_city: 'New York',
    destination_city: 'Paris',
    departure_time: '18:00',
    arrival_time: '07:15 (+1d)',
    duration: '7h 15m',
    stops: 'Non-stop',
    cabin: 'Economy',
    price: 790,
    currency: 'USD',
    baggage: '1 Check-in + 1 Carry-on',
    refundable: false
  },
  {
    id: 'fl-004',
    airline: 'Singapore Airlines',
    flight_number: 'SQ 025',
    origin: 'JFK',
    destination: 'SIN',
    origin_city: 'New York',
    destination_city: 'Singapore',
    departure_time: '20:30',
    arrival_time: '06:10 (+2d)',
    duration: '18h 40m',
    stops: 'Non-stop',
    cabin: 'Economy',
    price: 1250,
    currency: 'USD',
    baggage: '2 Check-in (23kg) + 1 Cabin',
    refundable: true
  },
  {
    id: 'fl-005',
    airline: 'Lufthansa',
    flight_number: 'LH 401',
    origin: 'JFK',
    destination: 'FRA',
    origin_city: 'New York',
    destination_city: 'Frankfurt',
    departure_time: '16:00',
    arrival_time: '05:30 (+1d)',
    duration: '7h 30m',
    stops: 'Non-stop',
    cabin: 'Business Class',
    price: 2850,
    currency: 'USD',
    baggage: '2 Check-in (32kg) + Lounge Access',
    refundable: true
  }
];

// Hotel Search Inventory
const hotelInventory = [
  {
    id: 'ht-001',
    name: 'The Westin London City',
    chain: 'Marriott',
    city: 'London',
    neighborhood: 'City of London / Financial District',
    rating: 4.8,
    stars: 5,
    nightly_rate: 194,
    currency: 'USD',
    amenities: ['High-speed WiFi', 'Fitness Center', 'Executive Lounge', 'Breakfast Included'],
    room_type: 'Deluxe King City View',
    cancellation: 'Free cancellation until 48h prior',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ht-002',
    name: 'Hilton London Tower Bridge',
    chain: 'Hilton',
    city: 'London',
    neighborhood: 'Southwark / London Bridge',
    rating: 4.6,
    stars: 4,
    nightly_rate: 185,
    currency: 'USD',
    amenities: ['High-speed WiFi', 'Business Center', 'Meeting Rooms'],
    room_type: 'Queen Guest Room',
    cancellation: 'Free cancellation until 24h prior',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ht-003',
    name: 'The Savoy London Luxury Suites',
    chain: 'Fairmont',
    city: 'London',
    neighborhood: 'Strand / Covent Garden',
    rating: 4.9,
    stars: 5,
    nightly_rate: 450,
    currency: 'USD',
    amenities: ['Butler Service', 'Spa', 'Historic Bar', 'River Thames View'],
    room_type: 'Luxury Suite',
    cancellation: 'Non-refundable',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80'
  },
  {
    id: 'ht-004',
    name: 'Marina Bay Sands Singapore',
    chain: 'Independent Luxury',
    city: 'Singapore',
    neighborhood: 'Marina Bay',
    rating: 4.9,
    stars: 5,
    nightly_rate: 340,
    currency: 'USD',
    amenities: ['Rooftop Infinity Pool', 'Banqueting', 'Convention Center'],
    room_type: 'Deluxe Harbour View',
    cancellation: 'Free cancellation up to 3 days prior',
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&auto=format&fit=crop&q=80'
  }
];

// Helper: Evaluate Policy for a flight or hotel
function checkPolicy(item, type, rules) {
  const warnings = [];
  let inPolicy = true;

  if (type === 'flight') {
    if (rules.permitted_cabin_classes && !rules.permitted_cabin_classes.includes(item.cabin)) {
      warnings.push(`Cabin Class (${item.cabin}) is out of policy. Permitted: ${rules.permitted_cabin_classes.join(', ')}.`);
      inPolicy = false;
    }
    if (item.price > rules.max_international_flight_amount) {
      warnings.push(`Price ($${item.price}) exceeds international flight cap of $${rules.max_international_flight_amount}.`);
      inPolicy = false;
    }
  } else if (type === 'hotel') {
    if (item.nightly_rate > rules.max_hotel_nightly_rate) {
      warnings.push(`Nightly rate ($${item.nightly_rate}) exceeds corporate hotel cap of $${rules.max_hotel_nightly_rate}/night.`);
      inPolicy = false;
    }
  }

  return { inPolicy, warnings };
}

// ==========================================
// 1. ORGANIZATIONS & PROFILES
// ==========================================
exports.getOrganizationData = async (req, res) => {
  try {
    const liveOrgs = await query('SELECT * FROM organizations');
    const liveProfiles = await query('SELECT * FROM user_profiles');
    const livePolicies = await query('SELECT * FROM travel_policies WHERE is_active = true');

    const db = getMockDb();
    res.json({
      status: 'success',
      data: {
        organization: liveOrgs?.rows?.[0] || db.organizations[0],
        profiles: liveProfiles?.rows?.length > 0 ? liveProfiles.rows : db.user_profiles,
        departments: db.departments,
        cost_centers: db.cost_centers,
        policy: livePolicies?.rows?.[0] || db.travel_policies[0]
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ==========================================
// 2. TRAVEL SEARCH (FLIGHTS & HOTELS)
// ==========================================
exports.searchFlights = (req, res) => {
  const { destination, cabin } = req.query;
  const policy = getMockDb().travel_policies[0].rules_json;

  let results = flightInventory;
  if (destination) {
    results = results.filter(f =>
      f.destination.toLowerCase().includes(destination.toLowerCase()) ||
      f.destination_city.toLowerCase().includes(destination.toLowerCase())
    );
  }
  if (cabin) {
    results = results.filter(f => f.cabin.toLowerCase() === cabin.toLowerCase());
  }

  const enriched = results.map(flight => {
    const { inPolicy, warnings } = checkPolicy(flight, 'flight', policy);
    return { ...flight, in_policy: inPolicy, policy_warnings: warnings };
  });

  res.json({ status: 'success', data: enriched });
};

exports.searchHotels = (req, res) => {
  const { city } = req.query;
  const policy = getMockDb().travel_policies[0].rules_json;

  let results = hotelInventory;
  if (city) {
    results = results.filter(h => h.city.toLowerCase().includes(city.toLowerCase()));
  }

  const enriched = results.map(hotel => {
    const { inPolicy, warnings } = checkPolicy(hotel, 'hotel', policy);
    return { ...hotel, in_policy: inPolicy, policy_warnings: warnings };
  });

  res.json({ status: 'success', data: enriched });
};

// ==========================================
// 3. TRAVEL REQUESTS & APPROVALS
// ==========================================
exports.getTravelRequests = async (req, res) => {
  try {
    const user = req.user;
    let list = getMockDb().travel_requests;
    
    // Strict RBAC: Travelers only receive their personal travel requests
    if (user && user.role === 'traveler') {
      list = list.filter(tr => tr.traveler_id === user.id);
    }

    const requests = list.map(tr => {
      const traveler = getMockDb().user_profiles.find(u => u.id === tr.traveler_id) || {};
      return {
        ...tr,
        traveler_name: `${traveler.first_name || 'Traveler'} ${traveler.last_name || ''}`,
        traveler_email: traveler.email
      };
    });
    res.json({ status: 'success', data: requests });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.createTravelRequest = async (req, res) => {
  const travelerId = req.user?.id || req.body.traveler_id || getMockDb().user_profiles[0].id;
  const { organization_id, destination, start_date, end_date, estimated_budget, currency, purpose } = req.body;
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();

  const newReq = {
    id,
    organization_id: organization_id || getMockDb().organizations[0].id,
    traveler_id: travelerId,
    destination: destination || 'London (LHR), UK',
    start_date: start_date || '2026-11-10',
    end_date: end_date || '2026-11-16',
    estimated_budget: Number(estimated_budget) || 1500,
    currency: currency || 'USD',
    status: 'pending_approval',
    purpose: purpose || 'Business Trip & Client Reviews',
    created_at
  };

  const approvalId = crypto.randomUUID();
  const newApproval = {
    id: approvalId,
    organization_id: newReq.organization_id,
    request_type: 'travel_request',
    request_id: id,
    approver_id: getMockDb().user_profiles[1].id, // Manager David Miller
    decision: 'pending',
    reason: null,
    decided_at: null
  };

  try {
    await query(
      `INSERT INTO travel_requests (id, organization_id, traveler_id, destination, start_date, end_date, estimated_budget, currency, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [newReq.id, newReq.organization_id, newReq.traveler_id, newReq.destination, newReq.start_date, newReq.end_date, newReq.estimated_budget, newReq.currency, newReq.status, created_at]
    );

    await query(
      `INSERT INTO approvals (id, organization_id, request_type, request_id, approver_id, decision)
       VALUES ($1, $2, $3, $4, $5, 'pending')`,
      [approvalId, newReq.organization_id, 'travel_request', id, newApproval.approver_id]
    );
  } catch (e) {
    console.warn('DB write note:', e.message);
  }

  getMockDb().travel_requests.unshift(newReq);
  getMockDb().approvals.unshift(newApproval);

  res.status(201).json({
    status: 'success',
    message: 'Travel request submitted for manager approval!',
    data: newReq
  });
};

exports.getApprovals = async (req, res) => {
  try {
    const list = getMockDb().approvals.map(ap => {
      const reqInfo = getMockDb().travel_requests.find(r => r.id === ap.request_id) || {};
      const traveler = getMockDb().user_profiles.find(u => u.id === reqInfo.traveler_id) || {};
      return {
        ...ap,
        destination: reqInfo.destination,
        estimated_budget: reqInfo.estimated_budget,
        currency: reqInfo.currency,
        start_date: reqInfo.start_date,
        end_date: reqInfo.end_date,
        purpose: reqInfo.purpose,
        traveler_name: `${traveler.first_name || 'Alex'} ${traveler.last_name || 'Morgan'}`,
        traveler_email: traveler.email
      };
    });
    res.json({ status: 'success', data: list });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.decideApproval = async (req, res) => {
  const { id } = req.params;
  const { decision, reason } = req.body;
  const decided_at = new Date().toISOString();

  try {
    await query(
      'UPDATE approvals SET decision = $1, reason = $2, decided_at = $3 WHERE id = $4',
      [decision, reason || null, decided_at, id]
    );
  } catch (e) {
    // note
  }

  const approval = getMockDb().approvals.find(a => a.id === id);
  if (approval) {
    approval.decision = decision;
    approval.reason = reason;
    approval.decided_at = decided_at;

    // Update travel request status
    const reqItem = getMockDb().travel_requests.find(r => r.id === approval.request_id);
    if (reqItem) {
      reqItem.status = decision === 'approved' ? 'approved' : 'rejected';

      // If approved, create confirmed Trip AND its booking segments & expenses
      if (decision === 'approved') {
        const tripId = crypto.randomUUID();
        const newTrip = {
          id: tripId,
          organization_id: reqItem.organization_id,
          primary_traveler_id: reqItem.traveler_id,
          start_date: reqItem.start_date,
          end_date: reqItem.end_date,
          status: 'upcoming',
          destination: reqItem.destination,
          purpose: reqItem.purpose
        };
        getMockDb().trips.unshift(newTrip);

        // Automatically create the confirmed booking for this approved trip
        const supplierRef = `APPR-${Math.floor(100000 + Math.random() * 900000)}`;
        const bookingId = crypto.randomUUID();
        const approvedAmount = Number(reqItem.estimated_budget) || 1200;
        const newBooking = {
          id: bookingId,
          organization_id: reqItem.organization_id,
          trip_id: tripId,
          booking_type: reqItem.destination.toLowerCase().includes('hotel') ? 'hotel' : 'flight',
          supplier_name: 'Approved Airline Partner',
          supplier_reference: supplierRef,
          status: 'confirmed',
          total_amount: approvedAmount,
          currency: reqItem.currency || 'USD',
          supplier_payload: { destination: reqItem.destination, approved: true },
          created_at: decided_at
        };
        getMockDb().bookings.unshift(newBooking);

        // Automatically log the corporate expense
        const expId = `exp-appr-${Date.now()}`;
        getMockDb().expenses.unshift({
          id: expId,
          organization_id: reqItem.organization_id,
          employee_id: reqItem.traveler_id,
          trip_id: tripId,
          merchant: `${newBooking.supplier_name} - ${reqItem.destination}`,
          amount: approvedAmount,
          currency: reqItem.currency || 'USD',
          category: 'flight',
          expense_date: reqItem.start_date,
          status: 'approved',
          receipt: {
            id: crypto.randomUUID(),
            expense_id: expId,
            ocr_extracted_data: {
              merchant_name: newBooking.supplier_name,
              transaction_date: decided_at.split('T')[0],
              total_amount: approvedAmount,
              tax_amount: Math.round(approvedAmount * 0.10 * 100) / 100,
              payment_method: 'Corporate Card Visa ending 4012'
            }
          }
        });

        // Deduct from Cost Center budget
        if (getMockDb().cost_centers[0]) {
          getMockDb().cost_centers[0].spent = (Number(getMockDb().cost_centers[0].spent) || 0) + approvedAmount;
        }
      }
    }
  }

  res.json({ status: 'success', message: `Trip request has been ${decision}! Itinerary, booking, and budget updated.` });
};

// ==========================================
// 4. TRIPS & BOOKING CHECKOUT
// ==========================================
exports.getTrips = (req, res) => {
  const user = req.user;
  let allTrips = getMockDb().trips;

  // Strict RBAC: Travelers only receive their personal trips & itineraries
  if (user && user.role === 'traveler') {
    allTrips = allTrips.filter(t => t.primary_traveler_id === user.id);
  }

  const trips = allTrips.map(t => {
    const bks = getMockDb().bookings.filter(b => b.trip_id === t.id);
    const traveler = getMockDb().user_profiles.find(u => u.id === t.primary_traveler_id) || {};
    return {
      ...t,
      traveler_name: `${traveler.first_name || 'Traveler'} ${traveler.last_name || ''}`,
      bookings: bks
    };
  });
  res.json({ status: 'success', data: trips });
};

exports.getTicketDetails = (req, res) => {
  const { id } = req.params;
  const db = getMockDb();

  // Find booking by id or supplier_reference
  const booking = db.bookings.find(b => b.id === id || b.supplier_reference === id);
  if (!booking) {
    return res.status(404).json({ status: 'error', message: 'Booking not found' });
  }

  const trip = db.trips.find(t => t.id === booking.trip_id) || {};
  const traveler = db.user_profiles.find(u => u.id === trip.primary_traveler_id) || db.user_profiles[0];
  const org = db.organizations.find(o => o.id === booking.organization_id) || db.organizations[0];

  const isFlight = booking.booking_type === 'flight';

  const ticketData = {
    booking_id: booking.id,
    booking_type: booking.booking_type,
    supplier_name: booking.supplier_name,
    supplier_reference: booking.supplier_reference, // PNR
    ticket_number: isFlight ? `084-${Math.floor(1000000000 + Math.random() * 9000000000)}` : `HTL-${booking.supplier_reference}`,
    traveler: {
      name: `${traveler.first_name || 'Alex'} ${traveler.last_name || 'Morgan'}`,
      email: traveler.email,
      phone: traveler.phone_number || '+1-555-0199',
      frequent_flyer: isFlight ? 'BA-EC-8829104' : 'MAR-REWARDS-10928'
    },
    organization: {
      name: org.legal_name || 'Voyentra Technologies Inc.',
      cost_center: 'CC-ENG-101'
    },
    payment: {
      method: 'Corporate Visa ending •••• 4012',
      status: 'PAID & CONFIRMED',
      total_amount: booking.total_amount,
      currency: booking.currency || 'USD'
    },
    flight_details: isFlight ? {
      flight_number: booking.supplier_payload?.flight_number || 'BA 178',
      cabin: booking.supplier_payload?.cabin || 'Economy (In-Policy)',
      origin_code: booking.supplier_payload?.origin || 'JFK',
      origin_city: 'New York (JFK)',
      origin_terminal: 'Terminal 7',
      destination_code: booking.supplier_payload?.destination || 'LHR',
      destination_city: 'London Heathrow (LHR)',
      destination_terminal: 'Terminal 5',
      departure_time: booking.supplier_payload?.departure || '2026-11-10 19:30',
      boarding_time: '18:45',
      arrival_time: '2026-11-11 07:15',
      gate: 'B24',
      seat: '14A (Window)',
      zone: 'Group 3',
      baggage: '2 Checked (23kg each) + 1 Cabin Carry-on',
      barcode_raw: `M1MORGAN/ALEX       E${booking.supplier_reference} JFKLHRBA 0178 314Y014A0028 147>2180WW6314BBA`
    } : null,
    hotel_details: !isFlight ? {
      hotel_name: booking.supplier_name || 'The Langham London',
      address: '1C Portland Pl, London W1B 1JA, United Kingdom',
      check_in_date: trip.start_date || '2026-11-10',
      check_in_time: 'From 15:00',
      check_out_date: trip.end_date || '2026-11-15',
      check_out_time: 'Until 11:00',
      nights: 5,
      room_type: 'Executive Deluxe King Room (Non-Smoking)',
      amenities: ['Breakfast Buffet Included', 'Complimentary High-Speed Wi-Fi', 'Executive Lounge Access'],
      guest_count: '1 Adult'
    } : null,
    emergency_contact: {
      duty_of_care_hotline: '+1-800-869-7233 (+1-800-VOY-SAFE)',
      concierge_email: 'dutyofcare@voyentra.com',
      policy_id: 'VOY-ENT-GL-2026-99'
    }
  };

  res.json({
    status: 'success',
    data: ticketData
  });
};

exports.bookTravelOption = async (req, res) => {
  const travelerId = req.user?.id || getMockDb().user_profiles[0].id;
  const { trip_id, booking_type, supplier_name, total_amount, currency, payload, cost_center_id } = req.body;
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();

  // 1. Identify or Create the Trip
  let targetTripId = trip_id;
  const destName = payload?.destination_city 
    ? `${payload.destination_city} (${payload.destination})`
    : (payload?.city ? `${payload.city}, ${payload.country || ''}` : 'Corporate Business Destination');

  let existingTrip = targetTripId ? getMockDb().trips.find(t => t.id === targetTripId) : null;
  if (!existingTrip) {
    existingTrip = getMockDb().trips.find(t => t.destination.toLowerCase().includes((payload?.destination_city || payload?.city || '').toLowerCase()));
  }

  if (!existingTrip) {
    targetTripId = crypto.randomUUID();
    const newTrip = {
      id: targetTripId,
      organization_id: getMockDb().organizations[0].id,
      primary_traveler_id: travelerId,
      start_date: payload?.departure_date || '2026-11-10',
      end_date: payload?.return_date || '2026-11-16',
      status: 'upcoming',
      destination: destName,
      purpose: payload?.purpose || 'Client Onsite & Strategic Business Review'
    };
    getMockDb().trips.unshift(newTrip);
  } else {
    targetTripId = existingTrip.id;
  }

  // 2. Create the Confirmed Booking
  const supplierRef = `${(supplier_name || 'VOY').substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const bookingAmount = Number(total_amount) || 850;

  const newBooking = {
    id,
    organization_id: getMockDb().organizations[0].id,
    trip_id: targetTripId,
    booking_type: booking_type || 'flight',
    supplier_name: supplier_name || 'Partner Travel Provider',
    supplier_reference: supplierRef,
    status: 'confirmed',
    total_amount: bookingAmount,
    currency: currency || 'USD',
    supplier_payload: payload || {},
    created_at
  };

  const paymentRecord = {
    id: crypto.randomUUID(),
    organization_id: newBooking.organization_id,
    booking_id: id,
    provider_reference: `ch_${crypto.randomUUID().substring(0, 16)}`,
    amount: newBooking.total_amount,
    currency: newBooking.currency,
    status: 'succeeded'
  };

  getMockDb().bookings.unshift(newBooking);
  getMockDb().payments.unshift(paymentRecord);

  // 3. Automatically Log Corporate Card Expense
  const expId = `exp-corp-${Date.now()}`;
  const newExpense = {
    id: expId,
    organization_id: newBooking.organization_id,
    employee_id: travelerId,
    trip_id: targetTripId,
    merchant: `${newBooking.supplier_name} (${newBooking.booking_type.toUpperCase()})`,
    amount: bookingAmount,
    currency: newBooking.currency,
    category: newBooking.booking_type === 'hotel' ? 'lodging' : 'flight',
    expense_date: new Date().toISOString().split('T')[0],
    status: 'approved',
    receipt: {
      id: crypto.randomUUID(),
      expense_id: expId,
      storage_path: `receipts/${Date.now()}_ticket.pdf`,
      ocr_extracted_data: {
        merchant_name: newBooking.supplier_name,
        transaction_date: new Date().toISOString().split('T')[0],
        total_amount: bookingAmount,
        currency: 'USD',
        tax_amount: Math.round(bookingAmount * 0.10 * 100) / 100,
        payment_method: 'Corporate Card Visa ending 4012',
        booking_reference: supplierRef
      }
    }
  };
  getMockDb().expenses.unshift(newExpense);

  // 4. Update Cost Center Spend (Engineering CC-ENG-101 or chosen)
  const cc = getMockDb().cost_centers.find(c => c.id === cost_center_id) || getMockDb().cost_centers[0];
  if (cc) {
    cc.spent = (Number(cc.spent) || 0) + bookingAmount;
  }

  res.status(201).json({
    status: 'success',
    message: `Reservation confirmed on Corporate Card! PNR: ${supplierRef}. Trip, Expense, and Cost Center updated.`,
    data: newBooking
  });
};

// ==========================================
// 5. EXPENSES & RECEIPT OCR
// ==========================================
exports.getExpenses = (req, res) => {
  const user = req.user;
  let allExpenses = getMockDb().expenses;

  // Strict RBAC: Travelers only receive their personal expense submissions
  if (user && user.role === 'traveler') {
    allExpenses = allExpenses.filter(e => e.employee_id === user.id);
  }

  const list = allExpenses.map(exp => {
    const rc = getMockDb().receipts.find(r => r.expense_id === exp.id);
    const emp = getMockDb().user_profiles.find(u => u.id === exp.employee_id) || {};
    return {
      ...exp,
      employee_name: `${emp.first_name || 'Employee'} ${emp.last_name || ''}`,
      receipt: rc || null
    };
  });
  res.json({ status: 'success', data: list });
};

exports.createExpense = async (req, res) => {
  const employeeId = req.user?.id || req.body.employee_id || getMockDb().user_profiles[0].id;
  const { trip_id, merchant, amount, currency, category, expense_date, receipt_ocr, receipt_image } = req.body;
  const id = crypto.randomUUID();

  const newExpense = {
    id,
    organization_id: getMockDb().organizations[0].id,
    employee_id: employeeId,
    trip_id: trip_id || getMockDb().trips[0]?.id || null,
    merchant: merchant || 'Business Expense',
    amount: Number(amount) || 50,
    currency: currency || 'USD',
    category: category || 'meals',
    expense_date: expense_date || new Date().toISOString().split('T')[0],
    status: 'pending_approval'
  };

  const newReceipt = {
    id: crypto.randomUUID(),
    expense_id: id,
    storage_path: `receipts/${Date.now()}_receipt.pdf`,
    image_url: receipt_image || null,
    file_type: 'image/jpeg',
    processing_status: 'completed',
    ocr_extracted_data: receipt_ocr || {
      merchant_name: newExpense.merchant,
      transaction_date: newExpense.expense_date,
      total_amount: newExpense.amount,
      currency: newExpense.currency,
      tax_amount: Math.round(newExpense.amount * 0.12 * 100) / 100,
      confidence_score: 0.98
    }
  };

  try {
    await query(
      `INSERT INTO expenses (id, organization_id, employee_id, trip_id, merchant, amount, currency, category, expense_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending_approval')`,
      [id, newExpense.organization_id, newExpense.employee_id, newExpense.trip_id, newExpense.merchant, newExpense.amount, newExpense.currency, newExpense.category, newExpense.expense_date]
    );
  } catch (e) {
    // note
  }

  getMockDb().expenses.unshift(newExpense);
  getMockDb().receipts.unshift(newReceipt);

  res.status(201).json({
    status: 'success',
    message: 'Expense submitted with OCR receipt data!',
    data: newExpense
  });
};

exports.approveExpense = async (req, res) => {
  const { id } = req.params;
  const exp = getMockDb().expenses.find(e => e.id === id);
  if (exp) exp.status = 'approved';
  res.json({ status: 'success', message: 'Expense approved for reimbursement!' });
};

// ==========================================
// 6. POLICY CONFIGURATION & STATS
// ==========================================
exports.getPolicy = (req, res) => {
  res.json({ status: 'success', data: getMockDb().travel_policies[0] });
};

exports.updatePolicy = (req, res) => {
  const { rules_json } = req.body;
  const policy = getMockDb().travel_policies[0];
  if (rules_json) {
    policy.rules_json = { ...policy.rules_json, ...rules_json };
    policy.version += 1;
  }
  res.json({ status: 'success', message: 'Travel policy updated!', data: policy });
};

exports.getStats = (req, res) => {
  const db = getMockDb();
  const totalBookingsAmount = db.bookings.reduce((sum, b) => sum + Number(b.total_amount), 0);
  const totalExpensesAmount = db.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const pendingApprovalsCount = db.approvals.filter(a => a.decision === 'pending').length;

  res.json({
    status: 'success',
    data: {
      total_trips: db.trips.length,
      active_bookings: db.bookings.length,
      total_travel_spend: totalBookingsAmount + totalExpensesAmount,
      pending_approvals: pendingApprovalsCount,
      total_expenses: db.expenses.length,
      cost_centers: db.cost_centers
    }
  });
};

// ==========================================
// 7. DUTY OF CARE & TRAVELER SAFETY TRACKING
// ==========================================

// Global City Coordinates & Travel Advisories
const CITY_ADVISORIES = {
  'London': {
    city: 'London',
    country: 'United Kingdom',
    airport: 'LHR',
    coords: { x: 49.5, y: 31.0 }, // Percentage positioning for responsive SVG world map
    riskLevel: 'low',
    riskLabel: 'Level 1: Low Risk (Standard Precaution)',
    weather: '13°C • Overcast',
    localEmergencyNumber: '999 / 112',
    advisoryNote: 'All transit systems operating normally. Heathrow Terminals 2-5 clear.'
  },
  'Paris': {
    city: 'Paris',
    country: 'France',
    airport: 'CDG',
    coords: { x: 50.8, y: 33.5 },
    riskLevel: 'medium',
    riskLabel: 'Level 2: Travel Advisory (Air Traffic Delay Watch)',
    weather: '11°C • Light Rain',
    localEmergencyNumber: '112 / 15',
    advisoryNote: 'Possible 20-30m European airspace flow management delays at Charles de Gaulle.'
  },
  'Singapore': {
    city: 'Singapore',
    country: 'Singapore',
    airport: 'SIN',
    coords: { x: 79.5, y: 58.5 },
    riskLevel: 'low',
    riskLabel: 'Level 1: Low Risk (Normal Precaution)',
    weather: '29°C • Tropical Humidity',
    localEmergencyNumber: '999',
    advisoryNote: 'Changi Airport operations on schedule. High transit reliability.'
  },
  'New York': {
    city: 'New York',
    country: 'USA',
    airport: 'JFK',
    coords: { x: 28.5, y: 35.5 },
    riskLevel: 'low',
    riskLabel: 'Level 1: Low Risk (Normal Precaution)',
    weather: '16°C • Clear Sky',
    localEmergencyNumber: '911',
    advisoryNote: 'JFK and EWR ground transportation normal.'
  },
  'Frankfurt': {
    city: 'Frankfurt',
    country: 'Germany',
    airport: 'FRA',
    coords: { x: 52.8, y: 32.2 },
    riskLevel: 'low',
    riskLabel: 'Level 1: Low Risk (Normal Precaution)',
    weather: '12°C • Partly Cloudy',
    localEmergencyNumber: '112',
    advisoryNote: 'Lufthansa hub operating standard flight bank schedules.'
  }
};

let safetyAlerts = [
  {
    id: 'alert-001',
    title: 'London Heathrow Weather Advisory (Mild Delays)',
    destination: 'London (LHR), United Kingdom',
    city: 'London',
    severity: 'advisory',
    message: 'Fog advisory at LHR Terminal 5 this morning. All Voyentra travelers are advised to verify gate assignments and confirm check-in.',
    broadcast_by: 'David Miller (VP of Engineering)',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    responses: [
      {
        traveler_id: '22222222-aaaa-bbbb-cccc-000000000002',
        traveler_name: 'Alex Morgan',
        status: 'safe',
        note: 'Checked in at The Langham London. All clear.',
        responded_at: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]
  }
];

exports.getDutyOfCare = (req, res) => {
  const db = getMockDb();
  
  // Synthesize active traveler profiles with their trips and location telemetry
  const travelersOnDuty = [
    {
      id: '22222222-aaaa-bbbb-cccc-000000000002',
      name: 'Alex Morgan',
      role: 'Senior Software Engineer',
      email: 'alex.morgan@voyentra.com',
      phone: '+1-555-0199',
      department: 'Engineering (CC-ENG-101)',
      destination: 'London, United Kingdom',
      city: 'London',
      hotel: 'The Langham London (Room 412)',
      flight_number: 'BA 178',
      pnr: 'BA-849201',
      start_date: '2026-11-10',
      end_date: '2026-11-16',
      status: 'in_destination', // 'in_destination' | 'en_route' | 'upcoming'
      status_label: 'In Destination • Active Onsite',
      safety_status: 'safe',
      last_check_in: new Date(Date.now() - 3600000 * 2).toISOString(),
      emergency_contact: {
        name: 'Sarah Morgan',
        relation: 'Spouse',
        phone: '+1-555-0198'
      },
      passport: {
        number: 'USA-9982****',
        expiry: '2028-09-15',
        status: 'valid'
      },
      advisory: CITY_ADVISORIES['London']
    },
    {
      id: '33333333-aaaa-bbbb-cccc-000000000003',
      name: 'David Miller',
      role: 'VP of Engineering',
      email: 'david.miller@voyentra.com',
      phone: '+1-555-0188',
      department: 'Engineering Management',
      destination: 'Paris, France',
      city: 'Paris',
      hotel: 'Le Meurice Paris',
      flight_number: 'AF 023',
      pnr: 'AF-551092',
      start_date: '2026-12-01',
      end_date: '2026-12-05',
      status: 'upcoming',
      status_label: 'Upcoming (Departs in 5 days)',
      safety_status: 'standby',
      last_check_in: null,
      emergency_contact: {
        name: 'Emily Miller',
        relation: 'Spouse',
        phone: '+1-555-0187'
      },
      passport: {
        number: 'USA-4412****',
        expiry: '2029-04-10',
        status: 'valid'
      },
      advisory: CITY_ADVISORIES['Paris']
    },
    {
      id: '44444444-aaaa-bbbb-cccc-000000000004',
      name: 'Elena Vance',
      role: 'Finance Controller',
      email: 'elena.vance@voyentra.com',
      phone: '+1-555-0177',
      department: 'Finance & Treasury',
      destination: 'Singapore',
      city: 'Singapore',
      hotel: 'Marina Bay Sands',
      flight_number: 'SQ 025',
      pnr: 'SQ-992144',
      start_date: '2026-12-10',
      end_date: '2026-12-16',
      status: 'upcoming',
      status_label: 'Scheduled Q4 Treasury Review',
      safety_status: 'standby',
      last_check_in: null,
      emergency_contact: {
        name: 'Marcus Vance',
        relation: 'Brother',
        phone: '+1-555-0176'
      },
      passport: {
        number: 'USA-8120****',
        expiry: '2027-11-20',
        status: 'valid'
      },
      advisory: CITY_ADVISORIES['Singapore']
    }
  ];

  res.json({
    status: 'success',
    data: {
      travelers: travelersOnDuty,
      advisories: CITY_ADVISORIES,
      active_alerts: safetyAlerts,
      stats: {
        travelers_in_destination: 1,
        upcoming_travelers: 2,
        safe_check_in_rate: '100%',
        active_risk_alerts: safetyAlerts.length
      }
    }
  });
};

exports.broadcastSafetyAlert = (req, res) => {
  const { title, destination, city, severity, message } = req.body;
  const broadcast_by = req.user?.name || 'David Miller (VP of Engineering)';

  const newAlert = {
    id: `alert-${Date.now()}`,
    title: title || 'Duty of Care Travel Advisory',
    destination: destination || 'All Corporate Travelers',
    city: city || 'Global',
    severity: severity || 'warning',
    message: message || 'Please confirm your safety status and hotel check-in with Voyentra Duty of Care.',
    broadcast_by,
    created_at: new Date().toISOString(),
    responses: []
  };

  safetyAlerts.unshift(newAlert);

  res.status(201).json({
    status: 'success',
    message: `Duty of Care alert broadcast to all travelers in ${newAlert.destination}!`,
    data: newAlert
  });
};

exports.submitSafetyCheckin = (req, res) => {
  const travelerId = req.user?.id || '22222222-aaaa-bbbb-cccc-000000000002';
  const { alert_id, status, note } = req.body;

  const targetAlert = safetyAlerts.find(a => a.id === alert_id) || safetyAlerts[0];
  if (targetAlert) {
    const existingIndex = targetAlert.responses.findIndex(r => r.traveler_id === travelerId);
    const checkinRecord = {
      traveler_id: travelerId,
      traveler_name: req.user?.role === 'manager' ? 'David Miller' : 'Alex Morgan',
      status: status || 'safe',
      note: note || 'All safe and accounted for.',
      responded_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      targetAlert.responses[existingIndex] = checkinRecord;
    } else {
      targetAlert.responses.push(checkinRecord);
    }
  }

  res.json({
    status: 'success',
    message: 'Safety check-in recorded! Your manager has been notified.',
    data: { status: 'safe', timestamp: new Date().toISOString() }
  });
};

// ==========================================
// 8. ACCOUNTING EXPORTS & MULTI-CURRENCY
// ==========================================

const FX_RATES = {
  USD: { symbol: '$', rate: 1.0, name: 'US Dollar', base: true },
  EUR: { symbol: '€', rate: 0.92, name: 'Euro' },
  GBP: { symbol: '£', rate: 0.79, name: 'British Pound' },
  INR: { symbol: '₹', rate: 84.50, name: 'Indian Rupee' },
  SGD: { symbol: 'S$', rate: 1.34, name: 'Singapore Dollar' },
  CAD: { symbol: 'C$', rate: 1.39, name: 'Canadian Dollar' }
};

const GL_ACCOUNT_MAPPINGS = {
  flight: { code: '6200', name: 'Air Travel - Commercial Airlines' },
  lodging: { code: '6230', name: 'Corporate Hotel & Lodging' },
  ground_transportation: { code: '6210', name: 'Ground Transit, Taxi & Rail' },
  meals: { code: '6220', name: 'Business Meals & Client Entertainment' },
  miscellaneous: { code: '6290', name: 'Travel Sundries & Incidental Fees' }
};

exports.getCurrencies = (req, res) => {
  res.json({
    status: 'success',
    data: {
      base_currency: 'USD',
      rates: FX_RATES,
      last_updated: new Date().toISOString()
    }
  });
};

exports.getAccountingExport = (req, res) => {
  const { format = 'csv', currency = 'USD', cost_center, status = 'approved' } = req.query;
  const db = getMockDb();

  const targetFx = FX_RATES[currency.toUpperCase()] || FX_RATES.USD;
  const multiplier = targetFx.rate;

  let exportItems = [];

  // 1. Process Expenses
  db.expenses.forEach(exp => {
    if (status && exp.status !== status && status !== 'all') return;
    const gl = GL_ACCOUNT_MAPPINGS[exp.category] || GL_ACCOUNT_MAPPINGS.miscellaneous;
    const emp = db.user_profiles.find(u => u.id === exp.employee_id) || {};
    const trip = db.trips.find(t => t.id === exp.trip_id) || {};
    const originalAmount = Number(exp.amount) || 0;
    const convertedAmount = Math.round(originalAmount * multiplier * 100) / 100;
    const taxAmount = exp.receipt?.ocr_extracted_data?.tax_amount || Math.round(originalAmount * 0.15 * 100) / 100;
    const convertedTax = Math.round(taxAmount * multiplier * 100) / 100;

    exportItems.push({
      transaction_id: `EXP-${exp.id.substring(0, 8).toUpperCase()}`,
      entry_type: 'Expense Reimbursement',
      date: exp.expense_date,
      employee_id: emp.id || exp.employee_id,
      employee_name: `${emp.first_name || 'Alex'} ${emp.last_name || 'Morgan'}`,
      payee_merchant: exp.merchant,
      gl_account_code: gl.code,
      gl_account_name: gl.name,
      cost_center: 'CC-ENG-101',
      department: 'Engineering & Technology',
      original_amount: originalAmount,
      original_currency: exp.currency || 'USD',
      converted_amount: convertedAmount,
      export_currency: currency.toUpperCase(),
      tax_vat_amount: convertedTax,
      payment_method: exp.receipt?.ocr_extracted_data?.payment_method || 'Corporate Visa ending 4012',
      approval_status: exp.status.toUpperCase(),
      receipt_ocr_reference: exp.receipt?.ocr_extracted_data ? 'OCR_VERIFIED_99%' : 'MANUAL_CLAIM',
      memo: `Trip: ${trip.destination || 'London Business Summit'}`
    });
  });

  // 2. Process Bookings (Air & Hotel corporate card settlements)
  db.bookings.forEach(bk => {
    const gl = bk.booking_type === 'hotel' ? GL_ACCOUNT_MAPPINGS.lodging : GL_ACCOUNT_MAPPINGS.flight;
    const trip = db.trips.find(t => t.id === bk.trip_id) || {};
    const emp = db.user_profiles.find(u => u.id === trip.primary_traveler_id) || {};
    const originalAmount = Number(bk.total_amount) || 0;
    const convertedAmount = Math.round(originalAmount * multiplier * 100) / 100;
    const convertedTax = Math.round(convertedAmount * 0.10 * 100) / 100;

    exportItems.push({
      transaction_id: `BK-${bk.supplier_reference || bk.id.substring(0, 8).toUpperCase()}`,
      entry_type: 'Corporate Travel Booking',
      date: bk.created_at ? bk.created_at.split('T')[0] : '2026-11-10',
      employee_id: emp.id || '22222222-aaaa-bbbb-cccc-000000000002',
      employee_name: `${emp.first_name || 'Alex'} ${emp.last_name || 'Morgan'}`,
      payee_merchant: bk.supplier_name,
      gl_account_code: gl.code,
      gl_account_name: gl.name,
      cost_center: 'CC-ENG-101',
      department: 'Engineering & Technology',
      original_amount: originalAmount,
      original_currency: bk.currency || 'USD',
      converted_amount: convertedAmount,
      export_currency: currency.toUpperCase(),
      tax_vat_amount: convertedTax,
      payment_method: 'Corporate Visa ending 4012 (Direct Settlement)',
      approval_status: 'CONFIRMED',
      receipt_ocr_reference: `PNR_${bk.supplier_reference}`,
      memo: `Corporate ${bk.booking_type.toUpperCase()} Booking: ${trip.destination || 'London'}`
    });
  });

  if (cost_center) {
    exportItems = exportItems.filter(i => i.cost_center.toLowerCase() === cost_center.toLowerCase());
  }

  res.json({
    status: 'success',
    data: {
      total_records: exportItems.length,
      export_currency: currency.toUpperCase(),
      fx_rate_applied: multiplier,
      records: exportItems,
      available_formats: ['csv', 'quickbooks', 'xero', 'json']
    }
  });
};

exports.toggleCostCenterLock = (req, res) => {
  const { id } = req.params;
  const db = getMockDb();
  const cc = db.cost_centers.find(c => c.id === id || c.code === id) || db.cost_centers[0];

  if (cc) {
    cc.is_locked = !cc.is_locked;
    return res.json({
      status: 'success',
      message: `Cost Center ${cc.code} budget enforcement is now ${cc.is_locked ? 'LOCKED (Hard Budget Cap Enforced)' : 'UNLOCKED'}!`,
      data: cc
    });
  }

  res.status(404).json({ status: 'error', message: 'Cost center not found' });
};

// =========================================================================
// Super Admin Multi-Tenant Provisioning & Onboarding (SRS Section 17 & 21)
// =========================================================================

exports.getTenants = (req, res) => {
  try {
    const db = getMockDb();
    const tenants = db.organizations.map(org => {
      const activeTravelers = org.monthly_active_travelers || Math.floor(Math.random() * 50) + 10;
      const maxSeats = org.max_seats || (org.plan_tier === 'Enterprise' ? 500 : 100);
      return {
        ...org,
        monthly_active_travelers: activeTravelers,
        max_seats: maxSeats,
        seat_utilization_pct: Math.min(Math.round((activeTravelers / maxSeats) * 100), 100)
      };
    });

    res.json({
      status: 'success',
      data: {
        total_tenants: tenants.length,
        active_tenants: tenants.filter(t => t.subscription_status === 'active').length,
        tenants
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.provisionTenant = (req, res) => {
  try {
    const {
      legal_name,
      display_name,
      subdomain,
      country = 'USA',
      base_currency = 'USD',
      time_zone = 'America/New_York',
      plan_tier = 'Growth',
      max_seats = 100,
      admin_name,
      admin_email,
      feature_flags
    } = req.body;

    if (!legal_name || !subdomain) {
      return res.status(400).json({
        status: 'error',
        message: 'Legal company name and tenant subdomain are required.'
      });
    }

    const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const cleanDomain = cleanSubdomain.includes('.') ? cleanSubdomain : `${cleanSubdomain}.voyentra.com`;

    const db = getMockDb();

    // Check if subdomain already exists
    const existing = db.organizations.find(o => o.subdomain === cleanDomain);
    if (existing) {
      return res.status(409).json({
        status: 'error',
        message: `Tenant subdomain ${cleanDomain} is already registered.`
      });
    }

    const newOrgId = `org-${cleanSubdomain}-${Date.now().toString(36)}`;
    const newOrg = {
      id: newOrgId,
      legal_name: legal_name.trim(),
      display_name: (display_name || legal_name).trim(),
      subdomain: cleanDomain,
      plan_tier,
      country,
      base_currency,
      time_zone,
      monthly_active_travelers: 1,
      max_seats: Number(max_seats) || 100,
      feature_flags: feature_flags || {
        rail_booking_enabled: true,
        hotel_direct_billing: true,
        strict_budget_locks: false,
        flight_auto_approve: false
      },
      subscription_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.organizations.push(newOrg);

    // If an initial admin was provided, provision their user profile
    if (admin_email) {
      const adminNames = (admin_name || 'Admin User').trim().split(' ');
      const newAdminId = crypto.randomUUID();
      db.user_profiles.push({
        id: newAdminId,
        first_name: adminNames[0] || 'Organization',
        last_name: adminNames.slice(1).join(' ') || 'Admin',
        email: admin_email.trim().toLowerCase(),
        role: 'admin',
        organization_id: newOrgId,
        created_at: new Date().toISOString()
      });
    }

    res.status(201).json({
      status: 'success',
      message: `Tenant ${newOrg.display_name} (${newOrg.subdomain}) successfully provisioned!`,
      data: newOrg
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.updateTenantStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' | 'suspended' | 'provisioning'
    const db = getMockDb();
    const org = db.organizations.find(o => o.id === id || o.subdomain === id);

    if (!org) {
      return res.status(404).json({ status: 'error', message: 'Tenant not found.' });
    }

    org.subscription_status = status || (org.subscription_status === 'active' ? 'suspended' : 'active');
    org.updated_at = new Date().toISOString();

    res.json({
      status: 'success',
      message: `Tenant ${org.display_name} status updated to ${org.subscription_status.toUpperCase()}.`,
      data: org
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.updateTenantFeatureFlags = (req, res) => {
  try {
    const { id } = req.params;
    const { feature_flags } = req.body;
    const db = getMockDb();
    const org = db.organizations.find(o => o.id === id || o.subdomain === id);

    if (!org) {
      return res.status(404).json({ status: 'error', message: 'Tenant not found.' });
    }

    org.feature_flags = {
      ...(org.feature_flags || {}),
      ...(feature_flags || {})
    };
    org.updated_at = new Date().toISOString();

    res.json({
      status: 'success',
      message: `Feature flags updated for ${org.display_name}.`,
      data: org
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.getAdminEmployees = (req, res) => {
  try {
    const db = getMockDb();
    const employees = db.user_profiles.map(u => {
      const dept = db.departments.find(d => d.id === u.department_id) || db.departments[0];
      const cc = db.cost_centers.find(c => c.id === u.cost_center_id) || db.cost_centers[0];
      return {
        ...u,
        department_name: dept?.name || 'Engineering & Technology',
        cost_center_code: cc?.code || 'CC-ENG-101',
        cost_center_name: cc?.name || 'Software Engineering',
        status: 'active'
      };
    });

    res.json({
      status: 'success',
      data: {
        total_employees: employees.length,
        employees
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.bulkInviteEmployees = (req, res) => {
  try {
    const { employees } = req.body; // array of { first_name, last_name, email, role, department, cost_center }
    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Provide an array of employee roster records to invite.'
      });
    }

    const db = getMockDb();
    const addedList = [];

    employees.forEach(emp => {
      const existing = db.user_profiles.find(u => u.email.toLowerCase() === (emp.email || '').toLowerCase().trim());
      if (existing) {
        addedList.push({ ...existing, invited: false, note: 'Already registered' });
      } else {
        const newProfile = {
          id: crypto.randomUUID(),
          first_name: emp.first_name || 'Team',
          last_name: emp.last_name || 'Member',
          email: emp.email.toLowerCase().trim(),
          phone_number: emp.phone_number || '+1-555-0100',
          role: ['traveler', 'manager', 'finance_manager', 'admin'].includes(emp.role) ? emp.role : 'traveler',
          created_at: new Date().toISOString(),
          invited: true
        };
        db.user_profiles.push(newProfile);
        addedList.push(newProfile);
      }
    });

    res.status(201).json({
      status: 'success',
      message: `Successfully provisioned ${addedList.filter(e => e.invited).length} new corporate employees!`,
      data: {
        invited_count: addedList.filter(e => e.invited).length,
        total_processed: addedList.length,
        employees: addedList
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
