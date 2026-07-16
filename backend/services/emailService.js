var nodemailer = require('nodemailer');

// Create reusable transporter using Gmail SMTP if credentials are configured
var transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Verify transporter on startup
  transporter.verify(function (error) {
    if (error) {
      console.error('[Email Service] ⚠️  Gagal terhubung ke SMTP Gmail:', error.message);
      console.log('[Email Service] Email akan berjalan dalam mode SANDBOX (log ke console).');
    } else {
      console.log('[Email Service] ✅ SMTP Gmail terhubung dan siap mengirim email.');
    }
  });
} else {
  console.log('[Email Service] ⚠️  EMAIL_USER/EMAIL_PASS tidak terkonfigurasi. Email berjalan dalam mode SANDBOX (log ke console).');
}

var EmailService = {
  /**
   * Send a generic email
   * @param {string} toEmail - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} htmlContent - HTML body content
   */
  sendEmail: async function (toEmail, subject, htmlContent) {
    var fromName = process.env.EMAIL_FROM || 'ESP Lintas Data <24percobaan24@gmail.com>';

    console.log('[Email Service] Menyiapkan email ke ' + toEmail + ' | Subject: ' + subject);

    // Sandbox mode if credentials are missing
    if (!transporter) {
      console.log('========================================================');
      console.log('⚠️  EMAIL_USER/EMAIL_PASS tidak terkonfigurasi. Mode SANDBOX.');
      console.log('Tujuan: ' + toEmail);
      console.log('Subject: ' + subject);
      console.log('Body:\n' + htmlContent);
      console.log('========================================================');
      return { success: true, status: 'simulated', message: 'Simulated success (Sandbox)' };
    }

    try {
      var info = await transporter.sendMail({
        from: fromName,
        to: toEmail,
        subject: subject,
        html: htmlContent
      });

      console.log('[Email Service] Email berhasil dikirim ke ' + toEmail + ' | MessageId: ' + info.messageId);
      return { success: true, status: 'terkirim', messageId: info.messageId };
    } catch (err) {
      console.error('[Email Service] Gagal mengirim email ke ' + toEmail + ':', err.message);
      return { success: false, status: 'gagal', error: err.message };
    }
  },

  /**
   * Send OTP verification email for customer login
   */
  sendOtpEmail: async function (toEmail, data) {
    var subject = 'Kode OTP Login - ESP Lintas Data Multimedia';
    var appUrl = process.env.APP_URL || 'http://localhost:3000';
    var logoUrl = appUrl + '/logo_ldm.png';
    var html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kode OTP Login</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Segoe UI, Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6fb; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f6fb;">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!-- Logo -->
        <table role="presentation" width="440" cellpadding="0" cellspacing="0" border="0" style="max-width: 440px; width: 100%;">
          <tr>
            <td align="center" style="padding-bottom: 16px;">
              <img src="${logoUrl}" alt="PT. Lintas Data Multimedia" width="140" style="display: block; height: auto; max-width: 140px; border: 0;">
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <div style="width: 48px; height: 4px; background-color: #006190; border-radius: 2px;"></div>
            </td>
          </tr>
        </table>

        <!-- Card -->
        <table role="presentation" width="440" cellpadding="0" cellspacing="0" border="0" style="max-width: 440px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.04);">
          <tr>
            <td style="padding: 40px 32px 36px; text-align: center;">
              <h1 style="margin: 0 0 16px; font-family: 'Manrope', 'Segoe UI', Arial, sans-serif; font-size: 24px; font-weight: 700; color: #111c2d;">Kode OTP Login</h1>
              <p style="margin: 0 0 4px; font-size: 15px; color: #3f4850; line-height: 1.6;">Halo <strong>${data.nama}</strong>,</p>
              <p style="margin: 0 0 28px; font-size: 15px; color: #3f4850; line-height: 1.6;">Gunakan kode di bawah ini untuk masuk ke akun Anda. Jaga kerahasiaan kode ini.</p>

              <!-- OTP Code -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 28px;">
                <tr>
                  <td style="background-color: #f0f3ff; border-radius: 14px; padding: 22px 40px; border: 1px solid #dfe6f5;">
                    <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #006190;">${data.otp}</span>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; color: #6f7881;">Waktu kedaluwarsa kode: <strong style="color: #3f4850;">5 Menit</strong></p>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="440" cellpadding="0" cellspacing="0" border="0" style="max-width: 440px; width: 100%;">
          <tr>
            <td align="center" style="padding: 28px 0 0;">
              <p style="margin: 0; font-size: 13px; color: #9ca3af;">Butuh bantuan? Hubungi CS kami</p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
    `;
    return await this.sendEmail(toEmail, subject, html);
  },

  /**
   * Send billing reminder email (cron/manual trigger)
   */
  sendReminderEmail: async function (toEmail, data) {
    var appUrl = process.env.APP_URL || 'http://localhost:3000';
    var logoUrl = appUrl + '/logo_ldm.png';

    // Dynamic content based on daysDiff
    var daysDiff = data.daysDiff !== undefined ? data.daysDiff : 1;
    var badgeText = 'PENGINGAT PENTING';
    var headlineText = 'Pengingat Tagihan: <span style="color: #006190;">Hampir Jatuh Tempo</span>';
    var heroDesc = 'Halo <strong>' + data.nama + '</strong>, layanan internet Anda akan memasuki masa jatuh tempo. Segera lakukan pembayaran untuk menjaga koneksi Anda tetap lancar.';
    var statusText = 'Status Pembayaran: Menunggu';
    var statusColor = '#ba1a1a';
    var badgeBg = '#ffdad6';
    var badgeColor = '#93000a';
    var subject = 'Pengingat Tagihan Internet - Periode ' + data.periode;

    if (daysDiff < 0) {
      badgeText = '⚠️ TUNGGAKAN';
      headlineText = 'Pemberitahuan: <span style="color: #ba1a1a;">Tagihan Terlambat</span>';
      heroDesc = 'Halo <strong>' + data.nama + '</strong>, tagihan internet Anda telah <strong>melewati jatuh tempo</strong>. Mohon segera lakukan pembayaran agar koneksi internet Anda tidak terputus.';
      statusText = 'Status: Terlambat Bayar';
      subject = '⚠️ Tagihan Terlambat - Periode ' + data.periode;
    } else if (daysDiff === 0) {
      badgeText = '⏰ JATUH TEMPO HARI INI';
      headlineText = 'Tagihan Anda: <span style="color: #ba1a1a;">Jatuh Tempo Hari Ini</span>';
      heroDesc = 'Halo <strong>' + data.nama + '</strong>, tagihan internet Anda telah <strong>jatuh tempo hari ini</strong>. Segera lakukan pembayaran untuk menghindari pemutusan layanan.';
      statusText = 'Status: Jatuh Tempo Hari Ini';
      subject = '⏰ Jatuh Tempo Hari Ini - Periode ' + data.periode;
    }

    var html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pengingat Tagihan - PT. Lintas Data Multimedia</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Segoe UI, Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f0f3ff; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f3ff;">
    <tr>
      <td align="center" style="padding: 32px 16px;">

        <!-- Main Container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #bec7d2;">

          <!-- Header with Logo -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #bec7d2; background-color: #f9f9ff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <img src="${logoUrl}" alt="PT. Lintas Data Multimedia" width="120" style="display: block; height: auto; max-width: 120px; border: 0;">
                  </td>
                  <td align="right" valign="middle">
                    <p style="margin: 0; font-size: 12px; font-weight: 600; color: #3f4850; letter-spacing: 0.05em; text-transform: uppercase;">Portal Pelanggan</p>
                    <p style="margin: 2px 0 0; font-size: 14px; font-weight: 700; color: #006190;">LDM Connect</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Section -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <!-- Badge -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="background-color: ${badgeBg}; color: ${badgeColor}; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; padding: 6px 16px; border-radius: 20px;">
                    ${badgeText}
                  </td>
                </tr>
              </table>
              <!-- Headline -->
              <h1 style="margin: 0 0 16px; font-family: 'Manrope', 'Segoe UI', Arial, sans-serif; font-size: 24px; font-weight: 700; color: #111c2d; line-height: 32px;">
                ${headlineText}
              </h1>
              <!-- Description -->
              <p style="margin: 0; font-size: 16px; color: #3f4850; line-height: 26px;">
                ${heroDesc}
              </p>
            </td>
          </tr>

          <!-- Bento Grid: Customer Info + Amount -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Customer Info Card -->
                  <td width="58%" valign="top" style="padding-right: 8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f3ff; border-radius: 12px; border: 1px solid #bec7d2; overflow: hidden;">
                      <tr>
                        <td style="padding: 20px;">
                          <!-- Card Header with Icon -->
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
                            <tr>
                              <td width="40" valign="middle">
                                <div style="width: 36px; height: 36px; background-color: #007bb5; border-radius: 50%; text-align: center; line-height: 36px; color: #ffffff; font-size: 16px;">👤</div>
                              </td>
                              <td valign="middle" style="padding-left: 10px;">
                                <p style="margin: 0; font-size: 11px; font-weight: 600; color: #3f4850; letter-spacing: 0.05em; text-transform: uppercase;">Detail Pelanggan</p>
                                <p style="margin: 2px 0 0; font-size: 18px; font-weight: 600; color: #111c2d; font-family: 'Manrope', 'Segoe UI', Arial, sans-serif;">${data.nama}</p>
                              </td>
                            </tr>
                          </table>
                          <!-- Customer Details -->
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid rgba(190,199,210,0.3); color: #3f4850;">ID Pelanggan</td>
                              <td style="padding: 8px 0; border-bottom: 1px solid rgba(190,199,210,0.3); text-align: right; font-weight: 700; color: #111c2d;">${data.idPelanggan}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid rgba(190,199,210,0.3); color: #3f4850;">Paket Layanan</td>
                              <td style="padding: 8px 0; border-bottom: 1px solid rgba(190,199,210,0.3); text-align: right; font-weight: 700; color: #111c2d;">${data.paket}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #3f4850;">Periode Tagihan</td>
                              <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #111c2d;">${data.periode}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Amount Card -->
                  <td width="42%" valign="top" style="padding-left: 8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #cbe6ff; border-radius: 12px; border: 1px solid rgba(0,97,144,0.2); overflow: hidden; height: 100%;">
                      <tr>
                        <td style="padding: 20px;" valign="top">
                          <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; color: #004b71; letter-spacing: 0.05em; text-transform: uppercase;">Total Tagihan</p>
                          <p style="margin: 0; font-family: 'Manrope', 'Segoe UI', Arial, sans-serif; font-size: 32px; font-weight: 800; color: #006190; line-height: 40px;">Rp ${data.nominal}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 20px 20px;" valign="bottom">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td valign="middle" style="padding-right: 8px; font-size: 18px;">📅</td>
                              <td valign="middle">
                                <p style="margin: 0; font-size: 10px; font-weight: 700; color: #004b71; text-transform: uppercase; letter-spacing: 0.03em; opacity: 0.7;">Jatuh Tempo</p>
                                <p style="margin: 2px 0 0; font-size: 14px; font-weight: 700; color: #004b71;">${data.dueDateString}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Status Chip -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding: 8px 16px; background-color: rgba(186,26,26,0.08); border: 1px solid rgba(186,26,26,0.15); border-radius: 8px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="middle" style="padding-right: 8px;">
                          <div style="width: 10px; height: 10px; background-color: ${statusColor}; border-radius: 50%;"></div>
                        </td>
                        <td valign="middle">
                          <span style="font-size: 13px; font-weight: 600; color: ${statusColor}; letter-spacing: 0.03em;">${statusText}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 32px 12px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="background-color: #006190; border-radius: 12px;">
                    <a href="${data.paymentUrl}" target="_blank" style="display: block; padding: 18px 32px; color: #ffffff; font-family: 'Manrope', 'Segoe UI', Arial, sans-serif; font-size: 18px; font-weight: 600; text-decoration: none; text-align: center;">
                      Bayar Sekarang &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 32px 32px;">
              <p style="margin: 0; font-size: 12px; font-weight: 600; color: #3f4850; letter-spacing: 0.03em;">Tersedia via Transfer Bank Manual</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 28px 32px; background-color: #dee8ff; border-top: 1px solid #bec7d2;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="top" width="50%">
                    <p style="margin: 0 0 12px; font-size: 12px; font-weight: 600; color: #3f4850; letter-spacing: 0.05em; text-transform: uppercase;">Butuh Bantuan?</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <a href="mailto:cs@lintasdata.net.id" style="font-size: 14px; color: #111c2d; text-decoration: none;">✉️ cs@lintasdata.net.id</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td valign="top" width="50%" style="text-align: right;">
                    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #111c2d;">PT. Lintas Data Multimedia</p>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #3f4850; line-height: 18px;">ESP Lintas Data Multimedia</p>
                  </td>
                </tr>
              </table>
              <!-- Copyright -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #bec7d2;">
                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 11px; color: rgba(63,72,80,0.6); letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600;">© ${new Date().getFullYear()} PT. Lintas Data Multimedia. Seluruh Hak Cipta Dilindungi.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Disclaimer -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td align="center" style="padding: 20px 16px;">
              <p style="margin: 0; font-size: 12px; color: #6f7881; line-height: 18px;">Ini adalah email otomatis, mohon tidak membalas pesan ini. Jika Anda sudah melakukan pembayaran, silakan abaikan pengingat ini.</p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
    `;
    return await this.sendEmail(toEmail, subject, html);
  },

  /**
   * Send payment approved confirmation email
   */
  sendPaymentApprovedEmail: async function (toEmail, data) {
    var appUrl = process.env.APP_URL || 'http://localhost:3000';
    var logoUrl = appUrl + '/logo_ldm.png';
    var subject = '✅ Pembayaran Disetujui - Periode ' + data.periode;
    
    var html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pembayaran Disetujui</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f3ff; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f3ff;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #bec7d2;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #bec7d2; background-color: #f9f9ff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <img src="${logoUrl}" alt="PT. Lintas Data Multimedia" width="120" style="display: block; height: auto; max-width: 120px; border: 0;">
                  </td>
                  <td align="right" valign="middle">
                    <p style="margin: 0; font-size: 12px; font-weight: 600; color: #3f4850; letter-spacing: 0.05em; text-transform: uppercase;">Portal Pelanggan</p>
                    <p style="margin: 2px 0 0; font-size: 14px; font-weight: 700; color: #006190;">LDM Connect</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Section -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center;">
              <h2 style="margin: 0 0 8px; font-family: 'Manrope', 'Segoe UI', Arial, sans-serif; font-size: 24px; font-weight: 700; color: #111c2d;">Riwayat Persetujuan</h2>
              <p style="margin: 0; font-size: 16px; color: #3f4850; line-height: 24px;">Halo <strong>${data.nama}</strong>, berikut adalah status terbaru dari pengajuan pembayaran Anda.</p>
            </td>
          </tr>

          <!-- Approved Status Card -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #bec7d2; border-radius: 12px; padding: 24px;">
                <tr>
                  <td width="48" valign="top">
                    <div style="background-color: #dcfce7; width: 48px; height: 48px; border-radius: 50%; text-align: center; line-height: 48px; font-size: 24px;">✅</div>
                  </td>
                  <td valign="top" style="padding-left: 16px;">
                    <h3 style="margin: 0 0 4px; font-family: 'Manrope', 'Segoe UI', Arial, sans-serif; font-size: 20px; font-weight: 700; color: #166534;">Pembayaran Disetujui</h3>
                    <p style="margin: 0 0 16px; font-size: 12px; font-weight: 600; color: #15803d; text-transform: uppercase; letter-spacing: 0.05em;">Berhasil Diverifikasi Admin</p>
                    
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #dcfce7; border-radius: 8px; padding: 16px;">
                      <tr>
                        <td style="padding-bottom: 12px; border-bottom: 1px solid rgba(220,252,231,0.5); font-size: 14px; color: #3f4850; font-weight: 600;">Periode Tagihan</td>
                        <td style="padding-bottom: 12px; border-bottom: 1px solid rgba(220,252,231,0.5); font-size: 14px; color: #111c2d; font-weight: 700; text-align: right;">${data.periode}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(220,252,231,0.5); font-size: 14px; color: #3f4850; font-weight: 600;">Tanggal Bayar</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(220,252,231,0.5); font-size: 14px; color: #111c2d; font-weight: 700; text-align: right;">${data.tanggalBayar || '-'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(220,252,231,0.5); font-size: 14px; color: #3f4850; font-weight: 600;">Metode Pembayaran</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(220,252,231,0.5); font-size: 14px; color: #111c2d; font-weight: 700; text-align: right;">${data.metodePembayaran || '-'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(220,252,231,0.5); font-size: 14px; color: #3f4850; font-weight: 600;">Jatuh Tempo Berikutnya</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid rgba(220,252,231,0.5); font-size: 14px; color: #111c2d; font-weight: 700; text-align: right;">${data.dueDateFormatted}</td>
                      </tr>
                      <tr>
                        <td style="padding-top: 12px; font-size: 14px; color: #3f4850; font-weight: 600;">Total Dibayar</td>
                        <td style="padding-top: 12px; font-size: 16px; color: #006190; font-weight: 800; text-align: right; font-family: 'Manrope', 'Segoe UI', Arial, sans-serif;">Rp ${data.nominal}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 28px 32px; background-color: #dee8ff; border-top: 1px solid #bec7d2;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="top" width="50%">
                    <p style="margin: 0 0 12px; font-size: 12px; font-weight: 600; color: #3f4850; letter-spacing: 0.05em; text-transform: uppercase;">Butuh Bantuan?</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <a href="mailto:cs@lintasdata.net.id" style="font-size: 14px; color: #111c2d; text-decoration: none;">✉️ cs@lintasdata.net.id</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td valign="top" width="50%" style="text-align: right;">
                    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #111c2d;">PT. Lintas Data Multimedia</p>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #3f4850; line-height: 18px;">ESP Lintas Data Multimedia</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #bec7d2;">
                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 11px; color: rgba(63,72,80,0.6); letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600;">© ${new Date().getFullYear()} PT. Lintas Data Multimedia. Seluruh Hak Cipta Dilindungi.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    return await this.sendEmail(toEmail, subject, html);
  },

  /**
   * Send payment rejected notification email
   */
  sendPaymentRejectedEmail: async function (toEmail, data) {
    var appUrl = process.env.APP_URL || 'http://localhost:3000';
    var logoUrl = appUrl + '/logo_ldm.png';
    var subject = '❌ Pembayaran Ditolak - Periode ' + data.periode;
    
    var html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pembayaran Ditolak</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f3ff; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f3ff;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #bec7d2;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #bec7d2; background-color: #f9f9ff;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="left" valign="middle">
                    <img src="${logoUrl}" alt="PT. Lintas Data Multimedia" width="120" style="display: block; height: auto; max-width: 120px; border: 0;">
                  </td>
                  <td align="right" valign="middle">
                    <p style="margin: 0; font-size: 12px; font-weight: 600; color: #3f4850; letter-spacing: 0.05em; text-transform: uppercase;">Portal Pelanggan</p>
                    <p style="margin: 2px 0 0; font-size: 14px; font-weight: 700; color: #006190;">LDM Connect</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Section -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center;">
              <h2 style="margin: 0 0 8px; font-family: 'Manrope', 'Segoe UI', Arial, sans-serif; font-size: 24px; font-weight: 700; color: #111c2d;">Riwayat Persetujuan</h2>
              <p style="margin: 0; font-size: 16px; color: #3f4850; line-height: 24px;">Halo <strong>${data.nama}</strong>, berikut adalah status terbaru dari pengajuan pembayaran Anda.</p>
            </td>
          </tr>

          <!-- Rejected Status Card -->
          <tr>
            <td style="padding: 0 32px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #bec7d2; border-radius: 12px; padding: 24px;">
                <tr>
                  <td width="48" valign="top">
                    <div style="background-color: #fee2e2; width: 48px; height: 48px; border-radius: 50%; text-align: center; line-height: 48px; font-size: 24px;">❌</div>
                  </td>
                  <td valign="top" style="padding-left: 16px;">
                    <h3 style="margin: 0 0 4px; font-family: 'Manrope', 'Segoe UI', Arial, sans-serif; font-size: 20px; font-weight: 700; color: #93000a;">Pembayaran Ditolak</h3>
                    <p style="margin: 0 0 16px; font-size: 12px; font-weight: 600; color: #ba1a1a; text-transform: uppercase; letter-spacing: 0.05em;">Verifikasi Gagal</p>
                    
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #fef2f2; border: 1px solid #ffdad6; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                      <tr>
                        <td valign="top" width="24" style="font-size: 16px;">ℹ️</td>
                        <td valign="top">
                          <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #93000a;">Alasan Penolakan:</p>
                          <p style="margin: 0; font-size: 14px; font-style: italic; color: #93000a; opacity: 0.9;">"${data.alasan_tolak}"</p>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                      <tr>
                        <td style="font-size: 14px; color: #6f7881; font-weight: 600;">Periode Tagihan</td>
                        <td style="font-size: 14px; color: #3f4850; font-weight: 700; text-align: right;">${data.periode}</td>
                      </tr>
                      <tr>
                        <td style="padding-top: 8px; font-size: 14px; color: #6f7881; font-weight: 600;">Nominal</td>
                        <td style="padding-top: 8px; font-size: 14px; color: #3f4850; font-weight: 700; text-align: right;">Rp ${data.nominal}</td>
                      </tr>
                    </table>
                    
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="right">
                          <a href="${data.paymentUrl}" style="display: inline-block; padding: 12px 24px; background-color: #006190; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px; font-family: 'Manrope', 'Segoe UI', Arial, sans-serif;">Unggah Ulang Bukti</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 28px 32px; background-color: #dee8ff; border-top: 1px solid #bec7d2;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="top" width="50%">
                    <p style="margin: 0 0 12px; font-size: 12px; font-weight: 600; color: #3f4850; letter-spacing: 0.05em; text-transform: uppercase;">Butuh Bantuan?</p>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <a href="mailto:cs@lintasdata.net.id" style="font-size: 14px; color: #111c2d; text-decoration: none;">✉️ cs@lintasdata.net.id</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td valign="top" width="50%" style="text-align: right;">
                    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #111c2d;">PT. Lintas Data Multimedia</p>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #3f4850; line-height: 18px;">ESP Lintas Data Multimedia</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #bec7d2;">
                <tr>
                  <td align="center">
                    <p style="margin: 0; font-size: 11px; color: rgba(63,72,80,0.6); letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600;">© ${new Date().getFullYear()} PT. Lintas Data Multimedia. Seluruh Hak Cipta Dilindungi.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
    return await this.sendEmail(toEmail, subject, html);
  }
};

module.exports = EmailService;
