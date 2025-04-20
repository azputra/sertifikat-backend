const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

// Import aplikasi Express Anda
const app = require('../../server');

// Konfigurasi CORS khusus untuk serverless function
// Ini akan menimpa konfigurasi CORS yang ada di server.js
app.use(cors({
  origin: 'https://sertifikat-frontend.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Set environment variables jika diperlukan
// Untuk serverless function, lebih baik set di dashboard Netlify

module.exports.handler = serverless(app);