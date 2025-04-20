const express = require('express');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());

// Rute GET sederhana
app.get('/', (req, res) => {
  res.json({ message: 'Simple function works!' });
});

// Rute POST sederhana
app.post('/test', (req, res) => {
  res.json({ message: 'POST request works!' });
});

module.exports.handler = serverless(app);