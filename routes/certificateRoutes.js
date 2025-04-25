const express = require('express');
const router = express.Router();
const {
  createCertificate,
  getCertificates,
  getCertificateById,
  verifyCertificate,
  updateCertificate,
  deleteCertificate,
  generateCertificatePDF
} = require('../controllers/certificateController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, admin, createCertificate)
  .get(protect, getCertificates);

router.route('/:id')
  .get(protect, getCertificateById)
  .put(protect, admin, updateCertificate)
  .delete(protect, deleteCertificate);

router.get('/verify/:barcode', verifyCertificate);
router.post('/generate-pdf', generateCertificatePDF);

module.exports = router;