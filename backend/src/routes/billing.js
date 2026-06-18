// src/routes/billing.js
// ============================================
// نظام الفوترة والدفع - HyperPay (السوق السعودي)
// ============================================
const router = require('express').Router();
const axios = require('axios');
const db = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

const HYPERPAY_BASE = process.env.NODE_ENV === 'production'
  ? 'https://eu-prod.oppwa.com'
  : 'https://eu-test.oppwa.com';

const PLANS = {
  starter: { price: 299, operations: 500,  workflows: 5,  name: 'ستارتر' },
  pro:     { price: 799, operations: 5000, workflows: 20, name: 'برو' },
};

router.use(authenticate);

// ===== GET CURRENT SUBSCRIPTION =====
router.get('/subscription', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT plan, plan_expires_at, monthly_operations_used, monthly_operations_limit
       FROM tenants WHERE id = $1`,
      [req.tenantId]
    );
    res.json({ subscription: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في جلب بيانات الاشتراك' });
  }
});

// ===== GET INVOICE HISTORY =====
router.get('/invoices', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM billing_transactions WHERE tenant_id = $1 ORDER BY created_at DESC`,
      [req.tenantId]
    );
    res.json({ invoices: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'خطأ' });
  }
});

// ===== INITIATE PAYMENT - HyperPay =====
router.post('/checkout', requireRole('owner', 'admin'), async (req, res) => {
  const { plan, payment_brand } = req.body; // payment_brand: VISA, MASTER, MADA
  if (!PLANS[plan]) return res.status(400).json({ error: 'خطة غير صالحة' });

  const planData = PLANS[plan];

  // Choose entity based on payment method
  const entityId = payment_brand === 'MADA'
    ? process.env.HYPERPAY_ENTITY_ID_MADA
    : process.env.HYPERPAY_ENTITY_ID_VISA;

  try {
    const tenant = await db.query('SELECT * FROM tenants WHERE id = $1', [req.tenantId]);
    const t = tenant.rows[0];

    // Create checkout session with HyperPay
    const params = new URLSearchParams({
      entityId,
      amount: planData.price.toFixed(2),
      currency: 'SAR',
      paymentType: 'DB',
      'customer.email': t.email,
      'customer.givenName': t.name,
      'billing.country': 'SA',
      'merchant.name': 'أوتوفلو',
      'customParameters[plan]': plan,
      'customParameters[tenant_id]': req.tenantId,
    });

    const response = await axios.post(
      `${HYPERPAY_BASE}/v1/checkouts`,
      params.toString(),
      {
        headers: {
          Authorization: `Bearer ${process.env.HYPERPAY_ACCESS_TOKEN}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    const checkoutId = response.data.id;

    // Store pending transaction
    await db.query(
      `INSERT INTO billing_transactions
         (tenant_id, checkout_id, plan, amount, currency, status, payment_brand)
       VALUES ($1,$2,$3,$4,'SAR','pending',$5)
       ON CONFLICT (checkout_id) DO NOTHING`,
      [req.tenantId, checkoutId, plan, planData.price, payment_brand]
    );

    res.json({
      checkoutId,
      plan: planData,
      script_url: `${HYPERPAY_BASE}/v1/paymentWidgets.js?checkoutId=${checkoutId}`,
    });
  } catch (err) {
    console.error('HyperPay checkout error:', err.response?.data || err.message);
    res.status(500).json({ error: 'خطأ في بدء عملية الدفع' });
  }
});

// ===== PAYMENT RESULT (redirect from HyperPay) =====
router.get('/result', async (req, res) => {
  const { id: checkoutId, resourcePath } = req.query;
  if (!checkoutId || !resourcePath) {
    return res.redirect(`${process.env.FRONTEND_URL}/billing?status=error`);
  }

  try {
    // Determine entity id from transaction
    const txn = await db.query(
      'SELECT * FROM billing_transactions WHERE checkout_id = $1',
      [checkoutId]
    );
    if (!txn.rows.length) {
      return res.redirect(`${process.env.FRONTEND_URL}/billing?status=error`);
    }

    const transaction = txn.rows[0];
    const entityId = transaction.payment_brand === 'MADA'
      ? process.env.HYPERPAY_ENTITY_ID_MADA
      : process.env.HYPERPAY_ENTITY_ID_VISA;

    // Verify payment with HyperPay
    const response = await axios.get(
      `${HYPERPAY_BASE}${resourcePath}?entityId=${entityId}`,
      { headers: { Authorization: `Bearer ${process.env.HYPERPAY_ACCESS_TOKEN}` } }
    );

    const result = response.data;
    const isSuccess = /^(000\.000\.|000\.100\.1|000\.[36])/.test(result.result?.code);

    if (isSuccess) {
      const plan = PLANS[transaction.plan];
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      // Activate subscription
      await db.query(
        `UPDATE tenants SET
           plan = $1,
           plan_expires_at = $2,
           monthly_operations_limit = $3
         WHERE id = $4`,
        [transaction.plan, expiresAt, plan.operations, transaction.tenant_id]
      );

      // Update transaction
      await db.query(
        `UPDATE billing_transactions SET
           status = 'success',
           payment_id = $1,
           completed_at = NOW()
         WHERE checkout_id = $2`,
        [result.id, checkoutId]
      );

      return res.redirect(`${process.env.FRONTEND_URL}/billing?status=success&plan=${transaction.plan}`);
    } else {
      await db.query(
        `UPDATE billing_transactions SET status = 'failed', error_code = $1
         WHERE checkout_id = $2`,
        [result.result?.code, checkoutId]
      );
      return res.redirect(`${process.env.FRONTEND_URL}/billing?status=failed`);
    }
  } catch (err) {
    console.error('Payment result error:', err.message);
    return res.redirect(`${process.env.FRONTEND_URL}/billing?status=error`);
  }
});

// ===== WEBHOOK FROM HYPERPAY (recurring) =====
router.post('/webhook/hyperpay', async (req, res) => {
  const { payload } = req.body;
  // Verify and process recurring payment
  res.json({ received: true });
});

module.exports = router;
