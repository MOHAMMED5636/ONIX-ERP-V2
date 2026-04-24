require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const policiesRouter = require('./routes/policies');

const app = express();
const PORT = process.env.PORT || 3010;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { service: 'company-policies', ok: true } });
});

app.use('/api/policies', policiesRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Company Policy API listening on http://localhost:${PORT}`);
  console.log(`  GET/POST  /api/policies`);
  console.log(`  PUT/DELETE /api/policies/:id`);
  console.log(`  POST      /api/policies/:id/acknowledge`);
});
