var db = require('../config/db');

var LaporanBulanan = {
  // Ambil riwayat log laporan bulanan (diurutkan dari yang terbaru)
  getAll: function(limit, callback) {
    if (typeof limit === 'function') {
      callback = limit;
      limit = 50;
    }
    var sql = `
      SELECT l.*, a.nama as nama_admin, a.email as email_admin 
      FROM laporan_bulanan l 
      LEFT JOIN admin a ON l.id_admin = a.id_admin 
      ORDER BY l.generated_at DESC 
      LIMIT ?
    `;
    db.query(sql, [Number(limit) || 50], function(err, results) {
      if (err) return callback(err, null);
      callback(null, results);
    });
  },

  // Catat riwayat unduhan/generate laporan baru
  create: function(data, callback) {
    var sql = `
      INSERT INTO laporan_bulanan (id_admin, periode, total_pemasukan, total_pengeluaran, file_path, tipe_generate, generated_at) 
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    var values = [
      data.id_admin,
      data.periode,
      data.total_pemasukan || 0,
      data.total_pengeluaran || 0,
      data.file_path || null,
      data.tipe_generate || 'manual'
    ];
    db.query(sql, values, function(err, result) {
      if (err) return callback(err, null);
      callback(null, result);
    });
  },

  // Hapus log tertentu jika dibutuhkan
  delete: function(id, callback) {
    var sql = 'DELETE FROM laporan_bulanan WHERE id_laporan = ?';
    db.query(sql, [id], function(err, result) {
      if (err) return callback(err, null);
      callback(null, result);
    });
  }
};

module.exports = LaporanBulanan;
