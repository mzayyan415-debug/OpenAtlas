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
  launch: { name: 'Launch', amount: 299, description: 'One channel, trained FAQ bot, lead capture' },
  growth: { name: 'Growth', amount: 699, description: 'Multi-channel qualification and CRM handoff' },
  scale: { name: 'Scale', amount: 1499, description: 'Multiple brands, optimization, and priority support' }
};

app.get('/api/health', (req, res) => res.json({ ok: true, app: 'OpenAtlas DM Revenue Systems', mode: process.env.PAYMENT_MODE || 'demo' }));

app.post('/api/strategy-call', (req, res) => {
  const { name, email, handle, monthlyLeads, offer } = req.body || {};
  if (!name || !email || !handle || !monthlyLeads || !offer) {
    return res.status(400).json({ ok: false, message: 'Please complete every field.' });
  }
  return res.json({ ok: true, message: 'Your request is in the queue. We will reply with a tailored automation plan.' });
});

app.post('/api/demo-chat', (req, res) => {
  const message = String(req.body?.message || '').toLowerCase();
  let reply = 'Thanks for reaching out. What are you hoping to achieve, and what is your approximate budget?';
  if (message.includes('price') || message.includes('cost')) reply = 'Our systems start at $299/month. A strategist can recommend the right plan after learning about your offer.';
  if (message.includes('book') || message.includes('call')) reply = 'Absolutely. Share your email and preferred time, and our team will confirm a strategy call.';
  if (message.includes('how')) reply = 'We train a disclosed AI assistant on your approved offer, FAQs, and qualification rules, then hand high-intent leads to you or your CRM.';
  res.json({ ok: true, reply });
});

app.post('/api/checkout', (req, res) => {
  const { provider = 'paypal', plan = 'growth' } = req.body || {};
  if (!['paypal', 'mtn_momo'].includes(provider) || !plans[plan]) return res.status(400).json({ ok: false, message: 'Unsupported provider or plan.' });
  const reference = `OA-DM-${Date.now().toString().slice(-8)}`;
  res.json({ ok: true, mode: process.env.PAYMENT_MODE || 'demo', message: 'Demo checkout created. Connect verified merchant credentials before accepting live payments.', payment: { reference, provider, plan: plans[plan], status: 'pending' } });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`OpenAtlas DM Systems running at http://localhost:${PORT}`));
