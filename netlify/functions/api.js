const express = require('express');
const serverless = require('serverless-http');

// Import aplikasi Express Anda
const app = require('../../server'); // Sesuaikan path ke file server.js Anda

module.exports.handler = serverless(app);