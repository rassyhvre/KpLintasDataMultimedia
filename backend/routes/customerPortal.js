var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var db = require('../config/db');
var verifyCustomerToken = require('../middleware/customerAuth');
var SocketService = require('../services/socket');

// Protect all portal routes with customer JWT token
router.use(verifyCustomerToken);

// Multer Upload Configuration
var uploadDir = path.join(__dirname, '../public/uploads/bukti');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    var uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bukti-' + uniqueSuffix + path.extname(file.originalname));
  }
});

var upload = multer({
  storage: storage,
  fileFilter: function(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // Max 5MB
  }
});

/* GET /api/customer/portal/billing - Get active bill for customer */
router.get('/billing', function(req, res) {
  var id_pelanggan = req.customerId;

  var sql = `
    SELECT t.*, p.nama, p.paket, p.status_tagihan 
    FROM tagihan t 
    JOIN pelanggan p ON t.id_pelanggan = p.id_pelanggan 
    WHERE t.id_pelanggan = ? AND t.status != 'lunas'
    ORDER BY t.due_date ASC 
    LIMIT 1
  `;

  db.query(sql, [id_pelanggan], function(err, results) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }

    if (results.length === 0) {
      // No active/unpaid bills
      return res.json({
        success: true,
        data: null,
        message: 'Semua tagihan Anda lunas. Terima kasih!'
      });
    }

    res.json({
      success: true,
      data: results[0]
    });
  });
});

/* POST /api/customer/portal/pay - Upload payment proof */
router.post('/pay', function(req, res) {
  upload.single('bukti')(req, res, function(err) {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    var { id_tagihan } = req.body;
    var customerId = req.customerId;

    if (!id_tagihan) {
      return res.status(400).json({ success: false, message: 'ID Tagihan wajib disertakan.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Bukti transfer wajib diunggah.' });
    }

    // Verify that the bill belongs to the logged-in customer
    var verifySql = 'SELECT * FROM tagihan WHERE id_tagihan = ? AND id_pelanggan = ?';
    db.query(verifySql, [id_tagihan, customerId], function(err, results) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(403).json({ success: false, message: 'Akses ditolak. Tagihan bukan milik Anda.' });
      }

      var relativePath = '/uploads/bukti/' + req.file.filename;

      // 1. Insert into pembayaran table
      var insertSql = `
        INSERT INTO pembayaran (id_tagihan, bukti_file, status, tanggal_upload) 
        VALUES (?, ?, 'pending', NOW())
      `;
      db.query(insertSql, [id_tagihan, relativePath], function(err, paymentResult) {
        if (err) {
          return res.status(500).json({ success: false, message: 'Gagal mencatat pembayaran.', error: err.message });
        }

        // 2. Update tagihan status to 'menunggu_verifikasi'
        var updateSql = "UPDATE tagihan SET status = 'menunggu_verifikasi' WHERE id_tagihan = ?";
        db.query(updateSql, [id_tagihan], function(err) {
          if (err) {
            return res.status(500).json({ success: false, message: 'Gagal memperbarui status tagihan.' });
          }

          // Broadcast notification to Admin dashboard (Tahap 6)
          SocketService.broadcast('pembayaran_masuk', {
            id_pembayaran: paymentResult.insertId,
            id_tagihan: id_tagihan,
            nama_pelanggan: results[0].nama,
            tanggal_upload: new Date()
          });

          res.json({
            success: true,
            message: 'Bukti transfer berhasil diunggah! Pembayaran Anda sedang menunggu verifikasi admin.',
            data: {
              id_pembayaran: paymentResult.insertId,
              bukti_file: relativePath
            }
          });
        });
      });
    });
  });
});

module.exports = router;
