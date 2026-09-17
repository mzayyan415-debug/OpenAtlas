const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const plans = {
  starter: { name: 'Starter', amount: 0, cadence: 'free', description: 'Browse and save resources' },
  pro: { name: 'Pro', amount: 5, cadence: 'monthly', description: 'Unlimited collections and weekly digest' },
  team: { name: 'Team', amount: 19, cadence: 'monthly', description: 'For research teams and operators' },
  publisher: { name: 'Publisher', amount: 79, cadence: 'monthly', description: 'Verified profile + featured placement' }
};

const makeInvoice = (provider, planKey) => {
  const plan = plans[planKey] || plans.pro;
  const ref = `OA-${Date.now().toString().slice(-8)}`;
  return {
    invoiceId: ref,
    provider,
    plan: plan.name,
    amount: plan.amount,
    currency: 'USD',
    status: 'pending',
    checkoutUrl: provider === 'paypal'
      ? `https://www.paypal.com/checkoutnow?token=${ref}`
      : `https://uat.momodeveloper.mtn.com/checkout/${ref}`,
    createdAt: new Date().toISOString()
  };
};

app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: 'OpenAtlas', mode: process.env.PAYMENT_MODE || 'demo' });
});

app.post('/api/checkout', (req, res) => {
  const { provider = 'paypal', plan = 'pro' } = req.body || {};

  if (!['paypal', 'mtn_momo'].includes(provider)) {
    return res.status(400).json({ ok: false, message: 'Unsupported payment provider.' });
  }

  const payment = makeInvoice(provider, plan);

  if (process.env.PAYMENT_MODE === 'live') {
    return res.json({
      ok: true,
      message: 'Live gateway integration is enabled only when provider credentials are configured.',
      payment
    });
  }

  return res.json({
    ok: true,
    message: `${provider === 'paypal' ? 'PayPal' : 'MTN MoMo'} checkout created in demo mode. Replace with real credentials in production.`,
    payment
  });
});

app.post('/api/newsletter', (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ ok: false, message: 'Email is required.' });
  return res.json({ ok: true, message: 'Newsletter subscription captured successfully.' });
});

app.post('/api/submit-resource', (req, res) => {
  const { name, url, category, reason } = req.body || {};
  if (!name || !url || !category || !reason) {
    return res.status(400).json({ ok: false, message: 'Please complete all required fields.' });
  }
  return res.json({ ok: true, message: 'Resource submitted for moderation and review.' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`OpenAtlas is running on http://localhost:${PORT}`);
});
