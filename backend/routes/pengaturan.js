var express = require('express');
var router = express.Router();
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var verifyToken = require('../middleware/auth');

// Ensure uploads/logo directory exists
var logoDir = path.join(__dirname, '../public/uploads/logo');
if (!fs.existsSync(logoDir)) {
  fs.mkdirSync(logoDir, { recursive: true });
}

// Multer configuration for logo upload
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, logoDir);
  },
  filename: function (req, file, cb) {
    // Always save as 'company_logo' + extension to overwrite previous
    var ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'company_logo' + ext);
  }
});

var upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    var allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.indexOf(file.mimetype) === -1) {
      return cb(new Error('Format file tidak didukung. Gunakan PNG atau JPG.'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 2 * 1024 * 1024 // Max 2MB sesuai UI
  }
});

/* GET /api/pengaturan/logo - Public endpoint (no auth required) */
/* All pages (landing, portal, login, sidebar) need to read the current logo */
router.get('/logo', function (req, res) {
  // Check for existing logo files in the uploads/logo directory
  var logoFiles = [];
  try {
    logoFiles = fs.readdirSync(logoDir).filter(function (f) {
      return f.startsWith('company_logo');
    });
  } catch (err) {
    // directory might not exist yet
  }

  if (logoFiles.length > 0) {
    var logoFile = logoFiles[0];
    return res.json({
      success: true,
      data: {
        logo_url: '/uploads/logo/' + logoFile,
        updated_at: fs.statSync(path.join(logoDir, logoFile)).mtime
      }
    });
  }

  // Fallback: check for default logo in public root
  var defaultLogo = path.join(__dirname, '../public/logo_ldm.png');
  if (fs.existsSync(defaultLogo)) {
    return res.json({
      success: true,
      data: {
        logo_url: '/logo_ldm.png',
        is_default: true,
        updated_at: fs.statSync(defaultLogo).mtime
      }
    });
  }

  res.json({
    success: true,
    data: null
  });
});

// Protect POST/DELETE routes with admin JWT
router.use(verifyToken);

/* POST /api/pengaturan/logo - Upload new company logo */
router.post('/logo', function (req, res) {
  // Remove old logo files before uploading new one
  try {
    var existingFiles = fs.readdirSync(logoDir).filter(function (f) {
      return f.startsWith('company_logo');
    });
    existingFiles.forEach(function (f) {
      fs.unlinkSync(path.join(logoDir, f));
    });
  } catch (err) {
    // ignore cleanup errors
  }

  upload.single('logo')(req, res, function (err) {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Ukuran file melebihi batas maksimal 2MB.'
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Gagal mengunggah logo.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File logo wajib diunggah.'
      });
    }

    var relativePath = '/uploads/logo/' + req.file.filename;
    console.log('[Pengaturan] Logo perusahaan berhasil diperbarui:', relativePath);

    res.json({
      success: true,
      message: 'Logo perusahaan berhasil diperbarui!',
      data: {
        logo_url: relativePath,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  });
});

/* DELETE /api/pengaturan/logo - Reset logo to default */
router.delete('/logo', function (req, res) {
  try {
    var existingFiles = fs.readdirSync(logoDir).filter(function (f) {
      return f.startsWith('company_logo');
    });
    existingFiles.forEach(function (f) {
      fs.unlinkSync(path.join(logoDir, f));
    });
  } catch (err) {
    // ignore
  }

  console.log('[Pengaturan] Logo perusahaan di-reset ke default.');
  res.json({
    success: true,
    message: 'Logo berhasil di-reset ke default.'
  });
});

module.exports = router;
