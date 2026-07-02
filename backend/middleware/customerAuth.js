var jwt = require('jsonwebtoken');

// Middleware untuk verifikasi JWT token milik Pelanggan
function verifyCustomerToken(req, res, next) {
  var authHeader = req.headers['authorization'];
  var token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Sesi habis. Silakan login kembali.' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
    if (err || decoded.role !== 'customer') {
      return res.status(403).json({ 
        success: false, 
        message: 'Akses ditolak. Token tidak valid.' 
      });
    }
    
    req.customerId = decoded.id_pelanggan;
    req.customerPhone = decoded.no_hp;
    next();
  });
}

module.exports = verifyCustomerToken;
