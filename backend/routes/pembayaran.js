var express = require('express');
var router = express.Router();
var Pembayaran = require('../models/Pembayaran');
var Tagihan = require('../models/Tagihan');
var Pelanggan = require('../models/Pelanggan');
var MikrotikService = require('../services/mikrotik');
var WhatsAppService = require('../services/whatsapp');
var SocketService = require('../services/socket');
var verifyToken = require('../middleware/auth');

// Protect all payment verification routes with Admin JWT
router.use(verifyToken);

/* GET /api/pembayaran/pending - Get all pending payment approvals */
router.get('/pending', function(req, res) {
  Pembayaran.getAllPending(function(err, results) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
    res.json({ success: true, data: results });
  });
});

/* POST /api/pembayaran/:id/approve - Approve payment proof */
router.post('/:id/approve', function(req, res) {
  var id_pembayaran = req.params.id;
  var id_admin = req.adminId; // extracted from verifyToken middleware

  Pembayaran.getById(id_pembayaran, function(err, payment) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Data konfirmasi pembayaran tidak ditemukan.' });
    }

    // 1. Set pembayaran status to 'diterima'
    Pembayaran.verify(id_pembayaran, {
      status: 'diterima',
      alasan_tolak: null,
      id_admin: id_admin
    }, function(verifyErr) {
      if (verifyErr) {
        return res.status(500).json({ success: false, message: 'Gagal memverifikasi pembayaran.' });
      }

      // 2. Set tagihan status to 'lunas'
      Tagihan.updateStatus(payment.id_tagihan, 'lunas', function(tagihanErr) {
        if (tagihanErr) {
          return res.status(500).json({ success: false, message: 'Gagal memperbarui status tagihan.' });
        }

        // 3. Update pelanggan: set status to 'hijau' and extend due_date by 30 days
        var currentDueDate = new Date(payment.due_date);
        var newDueDate = new Date(currentDueDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        var newDueDateString = newDueDate.toISOString().split('T')[0];

        Pelanggan.update(payment.id_pelanggan, { 
          status_tagihan: 'hijau',
          due_date: newDueDateString
        }, function(pelangganErr) {
          if (pelangganErr) {
            console.error('Gagal memperbarui status pelanggan:', pelangganErr.message);
          }

          // 4. Generate next month's bill in tagihan table
          var parts = payment.periode.split('-');
          var year = parseInt(parts[0], 10);
          var month = parseInt(parts[1], 10);
          if (month === 12) {
            month = 1;
            year += 1;
          } else {
            month += 1;
          }
          var nextPeriod = year + '-' + (month < 10 ? '0' + month : month);

          Tagihan.create({
            id_pelanggan: payment.id_pelanggan,
            periode: nextPeriod,
            nominal: payment.nominal,
            status: 'belum_bayar',
            due_date: newDueDateString
          }, async function(nextBillErr) {
            if (nextBillErr) {
              console.error('Gagal membuat tagihan periode berikutnya:', nextBillErr.message);
            } else {
              console.log(`Tagihan periode berikutnya (${nextPeriod}) berhasil dibuat untuk pelanggan ID ${payment.id_pelanggan}`);
            }

            // 5. Activate PPPoE in Mikrotik if username is present
            var pppoeStatus = 'unknown';
            if (payment.pppoe_username) {
              try {
                var mRes = await MikrotikService.enableSecret(payment.pppoe_username);
                if (mRes) pppoeStatus = 'active';
              } catch (mikrotikErr) {
                console.error(`Gagal mengaktifkan PPPoE ${payment.pppoe_username} di router:`, mikrotikErr.message);
              }
            }

            // 6. Send WhatsApp confirmation of approval
            var dueDateFormatted = newDueDate.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });
            var message = `Halo ${payment.nama},\n\n` +
              `Pembayaran tagihan internet Anda sebesar Rp ${Number(payment.nominal).toLocaleString('id-ID')} untuk periode ${payment.periode} telah *DISETUJUI* oleh Admin.\n\n` +
              `Layanan internet Anda telah aktif kembali. Batas jatuh tempo tagihan Anda berikutnya diperpanjang hingga:\n` +
              `*${dueDateFormatted}*\n\n` +
              `Terima kasih telah berlangganan di ESP Lintas Data Multimedia.`;

            await WhatsAppService.sendWhatsApp(payment.no_hp, message);

            // 7. Broadcast websocket updates to all clients
            SocketService.broadcast('pelanggan_updated', {
              id_pelanggan: payment.id_pelanggan,
              status_tagihan: 'hijau',
              pppoe_status: pppoeStatus
            });

            res.json({
              success: true,
              message: 'Pembayaran disetujui! Status pelanggan lunas, masa aktif diperpanjang, dan akun internet diaktifkan.'
            });
          });
        });
      });
    });
  });
});

/* POST /api/pembayaran/:id/reject - Reject payment proof */
router.post('/:id/reject', function(req, res) {
  var id_pembayaran = req.params.id;
  var id_admin = req.adminId;
  var { alasan_tolak } = req.body;

  if (!alasan_tolak) {
    return res.status(400).json({ success: false, message: 'Alasan penolakan wajib diisi.' });
  }

  Pembayaran.getById(id_pembayaran, function(err, payment) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Data konfirmasi pembayaran tidak ditemukan.' });
    }

    // 1. Set pembayaran status to 'ditolak'
    Pembayaran.verify(id_pembayaran, {
      status: 'ditolak',
      alasan_tolak: alasan_tolak,
      id_admin: id_admin
    }, function(verifyErr) {
      if (verifyErr) {
        return res.status(500).json({ success: false, message: 'Gagal memperbarui status verifikasi.' });
      }

      // Calculate if the bill is late or just unpaid
      var today = new Date();
      var dueDate = new Date(payment.due_date);
      var isLate = today >= dueDate;
      var targetBillStatus = isLate ? 'terlambat' : 'belum_bayar';
      var targetCustomerStatus = isLate ? 'merah' : 'kuning';

      // 2. Revert tagihan status
      Tagihan.updateStatus(payment.id_tagihan, targetBillStatus, function(tagihanErr) {
        if (tagihanErr) {
          return res.status(500).json({ success: false, message: 'Gagal memperbarui status tagihan.' });
        }

        // 3. Revert pelanggan billing status
        Pelanggan.update(payment.id_pelanggan, { status_tagihan: targetCustomerStatus }, async function(pelangganErr) {
          if (pelangganErr) {
            console.error('Gagal memperbarui status pelanggan:', pelangganErr.message);
          }

          // 4. Send WhatsApp notification to customer with rejection reason
          var nominal = Number(payment.nominal).toLocaleString('id-ID');
          var message = `Halo ${payment.nama},\n\n` +
            `Bukti transfer pembayaran internet Anda sebesar Rp ${nominal} untuk periode ${payment.periode} *DITOLAK* oleh Admin.\n\n` +
            `*Alasan Penolakan*:\n` +
            `_"${alasan_tolak}"_\n\n` +
            `Silakan login kembali ke portal pembayaran dan upload bukti transfer yang benar:\n` +
            `${process.env.PAYMENT_PORTAL_URL || 'http://localhost:3001/bayar'}/${payment.no_hp}\n\n` +
            `Terima kasih.`;

          await WhatsAppService.sendWhatsApp(payment.no_hp, message);

          // 5. Broadcast status updates
          SocketService.broadcast('pelanggan_updated', {
            id_pelanggan: payment.id_pelanggan,
            status_tagihan: targetCustomerStatus
          });

          res.json({
            success: true,
            message: 'Pembayaran ditolak. Notifikasi penolakan telah dikirim ke WhatsApp pelanggan.'
          });
        });
      });
    });
  });
});

module.exports = router;
