const crypto = require('crypto');
const { query, logAudit } = require('../config/supabase');

// GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const result = await query('SELECT * FROM financial_products ORDER BY created_at DESC');
    return res.json({ status: 'success', data: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM financial_products WHERE id = $1', [id]);
    if (result.rows.length > 0) return res.json({ status: 'success', data: result.rows[0] });
    res.status(404).json({ status: 'error', message: 'Product not found' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/products
exports.createProduct = async (req, res) => {
  const { product_type, title, provider_name, interest_rate, processing_fee, max_amount, min_credit_score } = req.body;
  const id = crypto.randomUUID();

  try {
    const result = await query(
      `INSERT INTO financial_products (id, product_type, title, provider_name, interest_rate, processing_fee, max_amount, min_credit_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        id,
        product_type || 'Personal Loan',
        title || 'New Loan Facility',
        provider_name || 'Voyentra Lending Partner',
        Number(interest_rate) || 10.5,
        Number(processing_fee) || 1.0,
        Number(max_amount) || 1000000,
        min_credit_score ? Number(min_credit_score) : 650
      ]
    );

    // Also insert into products table for unified catalog
    try {
      await query(
        `INSERT INTO products (id, product_name, category, provider_name, interest_rate, processing_fee, max_amount, title, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Active')`,
        [id, title, product_type, provider_name, interest_rate, processing_fee, max_amount, title]
      );
    } catch (pErr) {
      console.warn('Products mirror table note:', pErr.message);
    }

    await logAudit(null, 'CREATE_PRODUCT', `financial_products:${id}`, req.ip);

    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};
