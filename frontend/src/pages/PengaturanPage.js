import React, { useState } from 'react';
import TemplateIcon from '../components/TemplateIcon';

function PengaturanPage() {
  var [activeTab, setActiveTab] = useState('umum'); // 'umum', 'mikrotik', 'midtrans', 'reminder'
  var [saving, setSaving] = useState(false);
  var [successMsg, setSuccessMsg] = useState('');

  // General settings state
  var [umum, setUmum] = useState({
    namaIsp: 'Lintas Data Multimedia',
    emailCs: 'cs@lintasdata.net',
    telpCs: '+62 851-8200-1676',
    alamat: 'Jl. Raya Saronggi No. 45, Sumenep, Jawa Timur',
    logo: null
  });

  // Mikrotik settings state
  var [mikrotik, setMikrotik] = useState({
    host: '103.150.90.12',
    port: '8728',
    username: 'admin_billing',
    password: '••••••••••••'
  });
  var [checkingRouter, setCheckingRouter] = useState(false);
  var [routerStatus, setRouterStatus] = useState('connected'); // 'connected', 'error', 'idle'

  // Midtrans settings state
  var [midtrans, setMidtrans] = useState({
    env: 'sandbox', // 'sandbox' or 'production'
    merchantId: 'M1094827',
    clientKey: 'SB-Mid-client-J8z19qPkNl9sD7w',
    serverKey: 'SB-Mid-server-8K9qX1zWp9LmD6vO8'
  });

  // Reminder settings state
  var [reminder, setReminder] = useState({
    dueDays: '3',
    waTemplate: 'Halo [Nama],\n\nIni adalah pengingat otomatis dari Lintas Data Multimedia.\nTagihan internet Anda untuk periode [Periode] sebesar Rp [Nominal] akan jatuh tempo pada [JatuhTempo].\n\nSilakan lakukan pembayaran agar layanan tidak terputus. Terima kasih.',
    autoSend: true
  });

  var handleSave = function (e) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    setTimeout(function () {
      setSaving(false);
      setSuccessMsg('Pengaturan berhasil disimpan!');
      setTimeout(function () {
        setSuccessMsg('');
      }, 4000);
    }, 1200);
  };

  var handleCheckRouter = function () {
    setCheckingRouter(true);
    setTimeout(function () {
      setCheckingRouter(false);
      setRouterStatus('connected');
      alert('Koneksi ke Mikrotik Router sukses! (Board: Cloud Core Router)');
    }, 1500);
  };

  return (
    <div style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <div className="page-header">
        <div>
          <h1>Pengaturan Sistem</h1>
          <p>Konfigurasi profil perusahaan, integrasi gateway pembayaran, koneksi router Mikrotik, dan template pengingat otomatis.</p>
        </div>
      </div>

      {successMsg && (
        <div className="status-badge hijau animate-fadeIn" style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <TemplateIcon name="check" size={16} style={{ marginRight: '8px' }} /> {successMsg}
        </div>
      )}

      {/* Settings Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        gap: '30px',
        alignItems: 'start'
      }}>
        {/* Left Side Sidebar Tabs */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '12px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {[
            { id: 'umum', label: 'Profil & Umum', icon: 'info' },
            { id: 'mikrotik', label: 'Router Mikrotik', icon: 'router' },
            { id: 'midtrans', label: 'Midtrans Gateway', icon: 'shield' },
            { id: 'reminder', label: 'Pengingat WhatsApp', icon: 'mail' }
          ].map(function (tab) {
            var isActive = activeTab === tab.id;
            return (
              <div
                key={tab.id}
                onClick={function () { setActiveTab(tab.id); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--primary-glow)' : 'transparent',
                  marginBottom: '4px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={function (e) {
                  if (!isActive) e.currentTarget.style.background = 'var(--bg-secondary)';
                }}
                onMouseLeave={function (e) {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span className="material-symbols-outlined" style={{
                  fontSize: '1.25rem',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)'
                }}>
                  {tab.icon}
                </span>
                {tab.label}
              </div>
            );
          })}
        </div>

        {/* Right Side Content Panel */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: 'var(--shadow-sm)'
        }} className="animate-fadeIn">
          
          <form onSubmit={handleSave}>
            
            {/* 1. UMUM & PROFIL TAB */}
            {activeTab === 'umum' && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '6px' }}>Profil Perusahaan & Umum</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '24px' }}>
                  Konfigurasi identitas layanan ISP untuk invoice tagihan pelanggan.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label>Nama Layanan ISP *</label>
                    <input
                      type="text"
                      value={umum.namaIsp}
                      onChange={function (e) { setUmum({ ...umum, namaIsp: e.target.value }); }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Layanan *</label>
                    <input
                      type="email"
                      value={umum.emailCs}
                      onChange={function (e) { setUmum({ ...umum, emailCs: e.target.value }); }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label>Nomor Telepon Customer Service *</label>
                  <input
                    type="text"
                    value={umum.telpCs}
                    onChange={function (e) { setUmum({ ...umum, telpCs: e.target.value }); }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label>Alamat Kantor Utama</label>
                  <textarea
                    rows="3"
                    value={umum.alamat}
                    onChange={function (e) { setUmum({ ...umum, alamat: e.target.value }); }}
                  />
                </div>

                <div style={{
                  border: '1.5px dashed var(--border-color)',
                  borderRadius: '8px',
                  padding: '24px',
                  textAlign: 'center',
                  background: 'var(--bg-secondary)',
                  cursor: 'pointer'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    cloud_upload
                  </span>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700' }}>Unggah Logo Baru</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>Format PNG/JPG maksimal 2MB</div>
                </div>
              </div>
            )}

            {/* 2. MIKROTIK ROUTER TAB */}
            {activeTab === 'mikrotik' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Koneksi Mikrotik Router</h3>
                  <span className={'status-badge ' + (routerStatus === 'connected' ? 'hijau' : 'merah')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: routerStatus === 'connected' ? 'var(--status-hijau)' : 'var(--status-merah)',
                      display: 'inline-block'
                    }} />
                    {routerStatus === 'connected' ? 'Router Terhubung' : 'Terputus'}
                  </span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '24px' }}>
                  Hubungkan server penagihan ini dengan router Mikrotik untuk sinkronisasi rahasia PPPoE secara real-time.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label>IP Address / Hostname Router *</label>
                    <input
                      type="text"
                      value={mikrotik.host}
                      placeholder="e.g. 192.168.100.1"
                      onChange={function (e) { setMikrotik({ ...mikrotik, host: e.target.value }); }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>API Port *</label>
                    <input
                      type="text"
                      value={mikrotik.port}
                      placeholder="e.g. 8728"
                      onChange={function (e) { setMikrotik({ ...mikrotik, port: e.target.value }); }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  <div className="form-group">
                    <label>Username API Mikrotik *</label>
                    <input
                      type="text"
                      value={mikrotik.username}
                      onChange={function (e) { setMikrotik({ ...mikrotik, username: e.target.value }); }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Password API *</label>
                    <input
                      type="password"
                      value={mikrotik.password}
                      onChange={function (e) { setMikrotik({ ...mikrotik, password: e.target.value }); }}
                      required
                    />
                  </div>
                </div>

                <div style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Uji Sambungan API</span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Pastikan API Service di Mikrotik Anda aktif (default port 8728).</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleCheckRouter}
                    disabled={checkingRouter}
                  >
                    {checkingRouter ? 'Menghubungkan...' : 'Tes Koneksi'}
                  </button>
                </div>
              </div>
            )}

            {/* 3. MIDTRANS TAB */}
            {activeTab === 'midtrans' && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '6px' }}>Midtrans Payment Gateway</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '24px' }}>
                  Konfigurasi kredensial API Midtrans untuk memproses pembayaran online instan (QRIS, E-Wallet, VA).
                </p>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label>Environment Mode</label>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, fontWeight: '600' }}>
                      <input
                        type="radio"
                        name="midtransEnv"
                        checked={midtrans.env === 'sandbox'}
                        onChange={function () { setMidtrans({ ...midtrans, env: 'sandbox' }); }}
                        style={{ width: 'auto', cursor: 'pointer' }}
                      /> Sandbox (Simulasi/Tes)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, fontWeight: '600' }}>
                      <input
                        type="radio"
                        name="midtransEnv"
                        checked={midtrans.env === 'production'}
                        onChange={function () { setMidtrans({ ...midtrans, env: 'production' }); }}
                        style={{ width: 'auto', cursor: 'pointer' }}
                      /> Production (Live / Asli)
                    </label>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label>Merchant ID *</label>
                  <input
                    type="text"
                    value={midtrans.merchantId}
                    onChange={function (e) { setMidtrans({ ...midtrans, merchantId: e.target.value }); }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label>Client Key *</label>
                  <input
                    type="text"
                    value={midtrans.clientKey}
                    onChange={function (e) { setMidtrans({ ...midtrans, clientKey: e.target.value }); }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label>Server Key *</label>
                  <input
                    type="password"
                    value={midtrans.serverKey}
                    onChange={function (e) { setMidtrans({ ...midtrans, serverKey: e.target.value }); }}
                    required
                  />
                </div>
              </div>
            )}

            {/* 4. REMINDER & TEMPLATE TAB */}
            {activeTab === 'reminder' && (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '6px' }}>Reminder & Pengingat Tagihan</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '24px' }}>
                  Konfigurasi waktu jatuh tempo dan template pesan penagihan otomatis via Email/WhatsApp.
                </p>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label>Batas Kirim Reminder (Hari sebelum jatuh tempo) *</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="number"
                      value={reminder.dueDays}
                      style={{ width: '100px' }}
                      onChange={function (e) { setReminder({ ...reminder, dueDays: e.target.value }); }}
                      min="1"
                      max="10"
                      required
                    />
                    <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>Hari sebelum tanggal jatuh tempo</span>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label>Pesan Reminder Otomatis</label>
                  <textarea
                    rows="6"
                    value={reminder.waTemplate}
                    onChange={function (e) { setReminder({ ...reminder, waTemplate: e.target.value }); }}
                    placeholder="Tulis format template pesan..."
                  />
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Gunakan placeholder: <code>[Nama]</code> (Nama pelanggan), <code>[Periode]</code> (Bulan tagihan), <code>[Nominal]</code> (Jumlah tagihan), <code>[JatuhTempo]</code> (Tanggal jatuh tempo).
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Pengiriman Otomatis Harian</span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Aktifkan sistem cron untuk mengirim reminder secara otomatis setiap jam 08:00 pagi.</span>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={reminder.autoSend}
                      onChange={function (e) { setReminder({ ...reminder, autoSend: e.target.checked }); }}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0, left: 0, right: 0, bottom: 0,
                      backgroundColor: reminder.autoSend ? 'var(--primary)' : '#ccc',
                      transition: '.3s',
                      borderRadius: '24px'
                    }}>
                      <span style={{
                        position: 'absolute',
                        content: '""',
                        height: '18px', width: '18px',
                        left: reminder.autoSend ? '26px' : '3px',
                        bottom: '3px',
                        backgroundColor: 'white',
                        transition: '.3s',
                        borderRadius: '50%'
                      }} />
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Form Footer Action */}
            <div style={{
              marginTop: '30px',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '20px',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ minWidth: '150px' }}
              >
                {saving ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TemplateIcon name="loading" size={16} /> Menyimpan...
                  </div>
                ) : 'Simpan Perubahan'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default PengaturanPage;
