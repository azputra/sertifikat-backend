const express = require('express');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());

// Route sederhana
app.get('/', (req, res) => {
  res.json({ message: 'API is running with lambda...' });
});

app.post('/login', (req, res) => {
  res.json({ message: 'Login endpoint works!', body: req.body });
});

// Export handler
module.exports.handler = serverless(app);