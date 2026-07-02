var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var Pelanggan = require('../models/Pelanggan');
var Otp = require('../models/Otp');
var WhatsAppService = require('../services/whatsapp');

// Helper to format/clean phone numbers for flexible matching
function getPhoneFormats(phone) {
  var cleaned = phone.replace(/[^0-9]/g, '');
  var formats = [phone, cleaned];
  
  if (cleaned.startsWith('0')) {
    formats.push('62' + cleaned.substring(1));
    formats.push('+' + cleaned);
    formats.push('+62' + cleaned.substring(1));
  } else if (cleaned.startsWith('62')) {
    formats.push('0' + cleaned.substring(2));
    formats.push('+' + cleaned);
    formats.push('+' + '0' + cleaned.substring(2));
  }
  
  return [...new Set(formats)];
}

/* POST /api/customer/auth/request-otp - Request OTP via WhatsApp */
router.post('/request-otp', function(req, res) {
  var { no_hp } = req.body;

  if (!no_hp) {
    return res.status(400).json({ success: false, message: 'Nomor HP wajib diisi.' });
  }

  // Get various representations of the phone number to match whatever is in DB
  var formats = getPhoneFormats(no_hp);
  
  // Search in database
  var placeholders = formats.map(() => '?').join(', ');
  var sql = `SELECT * FROM pelanggan WHERE no_hp IN (${placeholders}) LIMIT 1`;

  var db = require('../config/db');
  db.query(sql, formats, function(err, results) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Nomor HP tidak terdaftar. Silakan hubungi admin ESP Lintas Data.' 
      });
    }

    var customer = results[0];
    // Generate random 6 digit OTP
    var otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database
    Otp.createOtp(customer.no_hp, otpCode, async function(otpErr) {
      if (otpErr) {
        return res.status(500).json({ success: false, message: 'Gagal membuat kode verifikasi.' });
      }

      // Send OTP via WhatsApp
      var message = `Halo ${customer.nama},\n\n` +
        `Kode OTP Anda untuk masuk ke Portal ESP Lintas Data adalah:\n` +
        `*${otpCode}*\n\n` +
        `Kode ini berlaku selama 5 menit. Jangan bagikan kode ini kepada siapapun.`;

      var sendRes = await WhatsAppService.sendWhatsApp(customer.no_hp, message);

      if (sendRes.success) {
        res.json({ 
          success: true, 
          message: 'Kode OTP telah dikirim melalui WhatsApp!', 
          phone: customer.no_hp 
        });
      } else {
        // Fallback info in response if WA fails
        res.status(500).json({ 
          success: false, 
          message: 'Gagal mengirim WhatsApp. Cek log server jika menggunakan sandbox mode.' 
        });
      }
    });
  });
});

/* POST /api/customer/auth/verify-otp - Verify OTP and login */
router.post('/verify-otp', function(req, res) {
  var { no_hp, otp } = req.body;

  if (!no_hp || !otp) {
    return res.status(400).json({ success: false, message: 'Nomor HP dan OTP wajib diisi.' });
  }

  var formats = getPhoneFormats(no_hp);
  
  // Find customer
  var placeholders = formats.map(() => '?').join(', ');
  var sql = `SELECT * FROM pelanggan WHERE no_hp IN (${placeholders}) LIMIT 1`;

  var db = require('../config/db');
  db.query(sql, formats, function(err, results) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Pelanggan tidak ditemukan.' });
    }

    var customer = results[0];

    // Verify OTP
    Otp.verifyOtp(customer.no_hp, otp, function(verifyErr, otpRecord) {
      if (verifyErr) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (!otpRecord) {
        return res.status(400).json({ success: false, message: 'Kode OTP tidak valid atau sudah kedaluwarsa.' });
      }

      // Generate JWT Customer Token
      var token = jwt.sign(
        { 
          id_pelanggan: customer.id_pelanggan, 
          no_hp: customer.no_hp,
          role: 'customer' 
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' } // Customer stays logged in longer (30 days)
      );

      res.json({
        success: true,
        message: 'Login berhasil!',
        data: {
          token: token,
          customer: {
            id_pelanggan: customer.id_pelanggan,
            nama: customer.nama,
            no_hp: customer.no_hp,
            paket: customer.paket
          }
        }
      });
    });
  });
});

module.exports = router;
