const Certificate = require('../models/Certificate');
const { v4: uuidv4 } = require('uuid');
const puppeteer = require('puppeteer');
const chromium = require('@sparticuz/chromium');
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');

// Read the HTML template from the file
const templatePath = path.join(__dirname, '../templates/certificate.html');
const templateSource = fs.readFileSync(templatePath, 'utf-8');
const template = handlebars.compile(templateSource);

// Read logo file and convert to base64
const logoPath = path.join(__dirname, '../templates/logo-secuone.png');
const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });

// Read background file and convert to base64
const bgPath = path.join(__dirname, '../templates/licence-bg.png');
const bgBase64 = fs.readFileSync(bgPath, { encoding: 'base64' });

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
      verifyUrl: `https://secuone.netlify.app/verify/${barcode}`,
      validityYears: certificateData.validityYears || 2,
      logoBase64: logoBase64,  // Add the base64 encoded logo
      bgBase64: bgBase64       // Add the base64 encoded background
    };
    
    // Render HTML dari template
    const html = template(data);
    
    // Buat PDF dengan Puppeteer
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Set ukuran halaman untuk A4 Landscape
    await page.setViewport({
      width: 1754,
      height: 1240,
      deviceScaleFactor: 2
    });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
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
      message: 'Failed to generate certificate',
      error: error.message
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