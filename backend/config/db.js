const mysql = require('mysql');

// Konfigurasi database dashboard_isp
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '', // Kosongkan jika menggunakan XAMPP default, isi jika ada password
  database: 'dashboard_isp'
});

// Test koneksi ke database saat aplikasi dijalankan
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error menghubungkan ke database dashboard_isp:', err.message);
  } else {
    console.log('Koneksi ke database dashboard_isp berhasil!');
    connection.release(); // Kembalikan koneksi ke pool
  }
});

module.exports = pool;
