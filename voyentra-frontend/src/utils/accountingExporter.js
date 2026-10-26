/**
 * Voyentra Accounting Exporter Engine
 * Exports corporate travel & expense records into QuickBooks, Xero, and Standard GL CSV formats.
 */

export function downloadCSV(csvContent, fileName) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Standard Corporate Spend Audit CSV
 */
export function exportStandardAuditCSV(records, currency = 'USD') {
  const headers = [
    'Transaction ID',
    'Entry Type',
    'Date',
    'Employee ID',
    'Employee Name',
    'Department',
    'Cost Center',
    'GL Account Code',
    'GL Account Name',
    'Payee / Merchant',
    `Amount (${currency})`,
    `Tax/VAT (${currency})`,
    'Payment Method',
    'Status',
    'OCR Verification',
    'Memo / Trip Purpose'
  ];

  const rows = records.map(r => [
    `"${r.transaction_id}"`,
    `"${r.entry_type}"`,
    `"${r.date}"`,
    `"${r.employee_id}"`,
    `"${r.employee_name}"`,
    `"${r.department}"`,
    `"${r.cost_center}"`,
    `"${r.gl_account_code}"`,
    `"${r.gl_account_name}"`,
    `"${r.payee_merchant.replace(/"/g, '""')}"`,
    r.converted_amount.toFixed(2),
    r.tax_vat_amount.toFixed(2),
    `"${r.payment_method}"`,
    `"${r.approval_status}"`,
    `"${r.receipt_ocr_reference}"`,
    `"${(r.memo || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const filename = `Voyentra_Spend_Audit_${currency}_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * QuickBooks Online / Desktop Journal Import CSV
 */
export function exportQuickBooksCSV(records, currency = 'USD') {
  const headers = [
    'Date',
    'RefNumber',
    'Account',
    'Payee',
    'Memo',
    'Amount',
    'TaxAmount',
    'Class',
    'PaymentMethod'
  ];

  const rows = records.map(r => [
    `"${r.date}"`,
    `"${r.transaction_id}"`,
    `"${r.gl_account_code} - ${r.gl_account_name}"`,
    `"${r.payee_merchant.replace(/"/g, '""')}"`,
    `"${(r.memo || '').replace(/"/g, '""')} | ${r.employee_name}"`,
    r.converted_amount.toFixed(2),
    r.tax_vat_amount.toFixed(2),
    `"${r.cost_center}"`,
    `"${r.payment_method}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const filename = `QuickBooks_Voyentra_Export_${currency}_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
}

/**
 * Xero General Ledger Invoice / Journal Import CSV
 */
export function exportXeroCSV(records, currency = 'USD') {
  const headers = [
    '*ContactName',
    '*InvoiceNumber',
    '*InvoiceDate',
    '*DueDate',
    '*Description',
    '*Quantity',
    '*UnitAmount',
    '*AccountCode',
    '*TaxType',
    'TrackingName1',
    'TrackingOption1',
    'Currency'
  ];

  const rows = records.map(r => [
    `"${r.payee_merchant.replace(/"/g, '""')}"`,
    `"${r.transaction_id}"`,
    `"${r.date}"`,
    `"${r.date}"`,
    `"${r.entry_type}: ${r.memo || ''} - Employee: ${r.employee_name}"`,
    1,
    r.converted_amount.toFixed(2),
    `"${r.gl_account_code}"`,
    r.tax_vat_amount > 0 ? '"Standard VAT 20%"' : '"Tax Exempt (0%)"',
    '"Department"',
    `"${r.cost_center}"`,
    `"${currency}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const filename = `Xero_Voyentra_Bills_${currency}_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csvContent, filename);
}
