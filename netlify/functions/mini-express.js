const express = require('express');
const serverless = require('serverless-http');

const app = express();

// Rute sederhana
app.get('/', (req, res) => {
  res.json({ message: 'Express minimal works!' });
});

// Export handler
module.exports.handler = serverless(app);