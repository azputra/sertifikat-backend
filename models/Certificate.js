const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  programName: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endUserName: {
    type: String,
    required: true
  },
  endUserId: {
    type: String,
    required: true
  },
  shipToId: {
    type: String
  },
  address: {
    type: String,
    required: true
  },
  component: {
    type: String,
    required: true
  },
  skuNumber: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  licenseNumber: {
    type: String,
    required: true
  },
  barcode: {
    type: String,
    required: true,
    unique: true
  },
  isValid: {
    type: Boolean,
    default: true
  },
  certificateNumber: {
    type: String,
    unique: true,
    default: function() {
      return `CERT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
  },

}, { timestamps: true });

const Certificate = mongoose.model('Certificate', certificateSchema);
module.exports = Certificate;