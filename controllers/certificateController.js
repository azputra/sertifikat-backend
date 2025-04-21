const Certificate = require('../models/Certificate');
const { v4: uuidv4 } = require('uuid');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');

const templateSource = `
  <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SECUONE AIOT Certificate</title>
      <style>
        @page {
          size: A4;
          margin: 0;
        }
        
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background-color: #f8fff8;
          width: 210mm;
          height: 297mm;
          position: relative;
        }
        
        /* Grid Background */
        .background-grid {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(#dfefd0 1px, transparent 1px),
            linear-gradient(90deg, #dfefd0 1px, transparent 1px);
          background-size: 15mm 15mm;
          opacity: 0.5;
          z-index: 0;
        }
        
        /* Watermark */
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 70%;
          height: 70%;
          background-image: url('/path/to/secuone-watermark.png');
          background-size: contain;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0.1;
          z-index: 0;
        }
        
        .container {
          position: relative;
          z-index: 1;
          padding: 20mm;
        }
        
        .logo {
          text-align: center;
          margin-bottom: 10mm;
        }
        
        .logo h1 {
          font-size: 36px;
          font-weight: bold;
          margin: 10mm 0;
          font-family: "Times New Roman", serif;
        }
        
        .title {
          text-align: center;
          margin-bottom: 15mm;
        }
        
        .title h1 {
          font-size: 24px;
          font-weight: bold;
          color: #005000;
        }
        
        .info-row {
          display: flex;
          margin-bottom: 8mm;
          font-size: 12px;
        }
        
        .info-row.short {
          margin-bottom: 4mm;
        }
        
        .label {
          width: 120px;
          font-weight: bold;
        }
        
        .separator {
          width: 20px;
          text-align: center;
        }
        
        .value {
          flex: 1;
        }
        
        .table {
          margin-top: 15mm;
          margin-bottom: 15mm;
          font-size: 12px;
        }
        
        .table-header {
          display: flex;
          font-weight: bold;
          border-bottom: 1px solid #000;
          padding-bottom: 3mm;
          margin-bottom: 5mm;
        }
        
        .table-row {
          display: flex;
        }
        
        .table-cell {
          padding: 2mm 0;
        }
        
        .col-description {
          width: 40%;
        }
        
        .col-sku {
          width: 25%;
        }
        
        .col-quantity {
          width: 15%;
        }
        
        .col-license {
          width: 20%;
        }
        
        .notes {
          margin-top: 10mm;
          font-size: 11px;
        }
        
        .note-title {
          font-weight: bold;
          margin-bottom: 3mm;
        }
        
        .note-item {
          margin-bottom: 2mm;
        }
        
        .qr-container {
          position: absolute;
          bottom: 18mm;
          right: 20mm;
          text-align: center;
        }
        
        .qr-code {
          width: 100px;
          height: 100px;
        }
        
        .qr-text {
          font-size: 8px;
          margin-top: 3mm;
        }
        
        .qr-url {
          font-size: 7px;
        }
      </style>
    </head>
    <body>
      <div class="background-grid"></div>
      <div class="watermark"></div>
      
      <div class="container">
        <div class="logo">
          <h1>SECUONE</h1>
        </div>
        
        <div class="title">
          <h1>AIOT LICENSE CERTIFICATE</h1>
        </div>
        
        <div class="info-row short">
          <div class="label">Progam Name</div>
          <div class="separator">:</div>
          <div class="value">{{programName}}</div>
        </div>
        
        <div class="info-row short">
          <div class="label">Issue Date</div>
          <div class="separator">:</div>
          <div class="value">{{formattedDate}}</div>
        </div>
        
        <div class="info-row short">
          <div class="label">End User Name</div>
          <div class="separator">:</div>
          <div class="value">{{endUserName}}</div>
        </div>
        
        <div class="info-row short">
          <div class="label">End User ID</div>
          <div class="separator">:</div>
          <div class="value">{{endUserId}}</div>
        </div>
        
        <div class="info-row short">
          <div class="label">Ship-to ID</div>
          <div class="separator">:</div>
          <div class="value">{{shipToId}}</div>
        </div>
        
        <div class="info-row">
          <div class="label">Address</div>
          <div class="separator">:</div>
          <div class="value">{{address}}</div>
        </div>
        
        <div class="table">
          <div class="table-header">
            <div class="table-cell col-description">COMPONENT DESCRIPTION</div>
            <div class="table-cell col-sku">SKU NUMBER</div>
            <div class="table-cell col-quantity">QUANTITY</div>
            <div class="table-cell col-license">License Number</div>
          </div>
          
          <div class="table-row">
            <div class="table-cell col-description">{{component}}</div>
            <div class="table-cell col-sku">{{skuNumber}}</div>
            <div class="table-cell col-quantity">{{quantity}}</div>
            <div class="table-cell col-license">{{licenseNumber}}</div>
          </div>
        </div>
        
        <div class="notes">
          <div class="note-title">Note:</div>
          <div class="note-item">- OS Version: Cobuntu 1.8.8, Ubuntu 18.8</div>
          <div class="note-item">- This license is valid for {{validityYears}} years starting from the date of BAST</div>
        </div>
        
        <div class="qr-container">
          <img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data={{verifyUrl}}" alt="QR Code">
          <div class="qr-text">Scan to verify certificate</div>
        </div>
      </div>
    </body>
    </html>
`
const template = handlebars.compile(templateSource);
// Create certificate
const createCertificate = async (req, res) => {
  try {
    const { 
      programName, 
      issueDate, 
      endUserName, 
      endUserId,
      shipToId,
      address,
      component,
      skuNumber,
      quantity
    } = req.body;
    
    // Generate unique license number
    const licenseNumber = `SC-AI${Date.now().toString().slice(-2)}-${Math.floor(10000 + Math.random() * 90000).toString().substring(0, 5)}`;
    
    // Generate unique barcode
    const barcode = uuidv4();
    
    // Generate a unique certificate number
    const certificateNumber = `CERT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const certificate = await Certificate.create({
      programName,
      issueDate: issueDate || Date.now(),
      endUserName,
      endUserId,
      shipToId,
      address,
      component,
      skuNumber,
      quantity: quantity || 1,
      licenseNumber,
      certificateNumber, // Add this line
      barcode,
      isValid: true
    });
    
    res.status(201).json(certificate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all certificates
const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({}).sort({ createdAt: -1 });
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get certificate by ID
const getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    
    if (certificate) {
      res.json(certificate);
    } else {
      res.status(404).json({ message: 'Certificate not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify certificate by barcode
const verifyCertificate = async (req, res) => {
  try {
    const { barcode } = req.params;
    
    const certificate = await Certificate.findOne({ barcode });
    
    if (certificate) {
      res.json({
        isValid: certificate.isValid,
        certificateData: certificate
      });
    } else {
      res.json({
        isValid: false,
        message: 'Certificate not found'
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update certificate
const updateCertificate = async (req, res) => {
  try {
    const { 
      programName, 
      issueDate, 
      endUserName, 
      endUserId,
      shipToId,
      address,
      component,
      skuNumber,
      quantity,
      isValid
    } = req.body;
    
    const certificate = await Certificate.findById(req.params.id);
    
    if (certificate) {
      certificate.programName = programName || certificate.programName;
      certificate.issueDate = issueDate || certificate.issueDate;
      certificate.endUserName = endUserName || certificate.endUserName;
      certificate.endUserId = endUserId || certificate.endUserId;
      certificate.shipToId = shipToId || certificate.shipToId;
      certificate.address = address || certificate.address;
      certificate.component = component || certificate.component;
      certificate.skuNumber = skuNumber || certificate.skuNumber;
      certificate.quantity = quantity || certificate.quantity;
      certificate.isValid = isValid !== undefined ? isValid : certificate.isValid;
      
      const updatedCertificate = await certificate.save();
      res.json(updatedCertificate);
    } else {
      res.status(404).json({ message: 'Certificate not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete certificate
const deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id);
    
    if (certificate) {
      await Certificate.deleteOne({ _id: req.params.id });
      res.json({ message: 'Certificate removed' });
    } else {
      res.status(404).json({ message: 'Certificate not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateCertificatePDF = async (req, res) => {
  try {
    const { certificateData, barcode } = req.body;
    
    if (!certificateData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Certificate data is required' 
      });
    }
    
    // Format tanggal
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };
    
    // Data untuk template
    const data = {
      ...certificateData,
      formattedDate: formatDate(certificateData.issueDate),
      verifyUrl: `${req.protocol}://${req.get('host')}/verify/${barcode}`,
      validityYears: certificateData.validityYears || 2
    };
    
    // Render HTML dari template
    const html = template(data);
    
    // Buat PDF dengan Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new'
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Set ukuran halaman untuk A4
    await page.setViewport({
      width: 1240,
      height: 1754,
      deviceScaleFactor: 2
    });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      },
      pageRanges: '1'
    });
    
    await browser.close();
    
    // Set header untuk PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=SECUONE_AIOT_Certificate_${certificateData.licenseNumber}.pdf`);
    
    // Kirim PDF ke client
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate certificate'
    });
  }
};


module.exports = {
  createCertificate,
  getCertificates,
  getCertificateById,
  verifyCertificate,
  updateCertificate,
  deleteCertificate,
  generateCertificatePDF
};