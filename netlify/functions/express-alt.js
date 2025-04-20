// netlify/functions/express-alt.js
const express = require('express');

// Buat app Express
const app = express();
app.use(express.json());

// Route sederhana
app.get('/', (req, res) => {
  res.json({ message: 'Express works!' });
});

// Handler untuk Netlify
exports.handler = async (event, context) => {
  // Emulasi request ke Express
  return new Promise((resolve, reject) => {
    const req = {
      method: event.httpMethod,
      url: event.path.replace('/.netlify/functions/express-alt', '') || '/',
      headers: event.headers,
      body: event.body ? JSON.parse(event.body) : {}
    };
    
    const res = {
      statusCode: 200,
      headers: {},
      body: '',
      setHeader: (key, value) => {
        res.headers[key] = value;
      },
      status: (statusCode) => {
        res.statusCode = statusCode;
        return res;
      },
      json: (body) => {
        res.body = JSON.stringify(body);
        res.headers['Content-Type'] = 'application/json';
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: res.body
        });
      },
      send: (body) => {
        res.body = body;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: res.body
        });
      }
    };
    
    // Route the request
    app(req, res);
  });
};