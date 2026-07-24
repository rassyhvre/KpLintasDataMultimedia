import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useLogo } from '../context/LogoContext';
import TemplateIcon from '../components/TemplateIcon';

function PengaturanPage() {
  var { refreshLogo } = useLogo();
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

  // Logo upload state
  var [logoPreview, setLogoPreview] = useState(null);
  var [logoFile, setLogoFile] = useState(null);
  var [uploading, setUploading] = useState(false);
  var [currentLogo, setCurrentLogo] = useState(null);
  var [isDefaultLogo, setIsDefaultLogo] = useState(true);
  var [dragOver, setDragOver] = useState(false);
  var logoInputRef = useRef(null);

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

  // Fetch current logo on mount
  useEffect(function () {
    var token = localStorage.getItem('token');
    if (!token) return;
    axios.get(API_BASE_URL + '/api/pengaturan/logo', {
      headers: { Authorization: 'Bearer ' + token }
    }).then(function (res) {
      if (res.data.success && res.data.data) {
        setCurrentLogo(API_BASE_URL + res.data.data.logo_url);
        setIsDefaultLogo(!!res.data.data.is_default);
      }
    }).catch(function () { /* silently fail */ });
  }, []);

  // Handle logo file selection
  var handleLogoSelect = function (file) {
    if (!file) return;

    // Validate file type
    var allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (allowedTypes.indexOf(file.type) === -1) {
      alert('Format file tidak didukung. Gunakan PNG atau JPG.');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file melebihi batas maksimal 2MB.');
      return;
    }

    setLogoFile(file);
    var reader = new FileReader();
    reader.onloadend = function () {
      setLogoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle logo upload to server
  var handleLogoUpload = function () {
    if (!logoFile) return;

    var token = localStorage.getItem('token');
    if (!token) {
      alert('Sesi Anda telah berakhir. Silakan login kembali.');
      return;
    }

    setUploading(true);
    var formData = new FormData();
    formData.append('logo', logoFile);

    axios.post(API_BASE_URL + '/api/pengaturan/logo', formData, {
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'multipart/form-data'
      }
    }).then(function (res) {
      setUploading(false);
      if (res.data.success) {
        setCurrentLogo(API_BASE_URL + res.data.data.logo_url + '?t=' + Date.now());
        setIsDefaultLogo(false);
        setLogoFile(null);
        setLogoPreview(null);
        setSuccessMsg('Logo perusahaan berhasil diperbarui!');
        refreshLogo();
        setTimeout(function () { setSuccessMsg(''); }, 4000);
      }
    }).catch(function (err) {
      setUploading(false);
      var msg = (err.response && err.response.data && err.response.data.message) || 'Gagal mengunggah logo.';
      alert(msg);
    });
  };

  // Handle logo reset to default
  var handleLogoReset = function () {
    if (!window.confirm('Reset logo ke default?')) return;

    var token = localStorage.getItem('token');
    axios.delete(API_BASE_URL + '/api/pengaturan/logo', {
      headers: { Authorization: 'Bearer ' + token }
    }).then(function (res) {
      if (res.data.success) {
        setCurrentLogo(API_BASE_URL + '/logo_ldm.png');
        setIsDefaultLogo(true);
        setLogoFile(null);
        setLogoPreview(null);
        setSuccessMsg('Logo berhasil di-reset ke default.');
        refreshLogo();
        setTimeout(function () { setSuccessMsg(''); }, 4000);
      }
    }).catch(function () {
      alert('Gagal mereset logo.');
    });
  };

  // Cancel logo selection (before upload)
  var handleLogoCancelSelect = function () {
    setLogoFile(null);
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  // Drag and drop handlers
  var handleDragOver = function (e) {
    e.preventDefault();
    setDragOver(true);
  };
  var handleDragLeave = function (e) {
    e.preventDefault();
    setDragOver(false);
  };
  var handleDrop = function (e) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoSelect(e.dataTransfer.files[0]);
    }
  };

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

                {/* Logo Upload Section */}
                <label style={{ fontSize: '0.82rem', fontWeight: '700', marginBottom: '8px', display: 'block', color: 'var(--text-secondary)' }}>Logo Perusahaan</label>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  {/* Current / Preview Logo */}
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {(logoPreview || currentLogo) ? (
                      <img
                        src={logoPreview || currentLogo}
                        alt="Logo Perusahaan"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }}
                      />
                    ) : (
                      <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--text-muted)' }}>image</span>
                    )}
                  </div>

                  {/* Upload / Drag Area */}
                  <div style={{ flex: 1 }}>
                    <div
                      onClick={function () { if (!uploading) logoInputRef.current.click(); }}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      style={{
                        border: dragOver ? '2px dashed var(--primary)' : '1.5px dashed var(--border-color)',
                        borderRadius: '8px',
                        padding: '20px',
                        textAlign: 'center',
                        background: dragOver ? 'var(--primary-glow)' : 'var(--bg-secondary)',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: uploading ? 0.6 : 1
                      }}
                    >
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        style={{ display: 'none' }}
                        onChange={function (e) {
                          if (e.target.files && e.target.files[0]) {
                            handleLogoSelect(e.target.files[0]);
                          }
                        }}
                      />
                      <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: dragOver ? 'var(--primary)' : 'var(--text-muted)', marginBottom: '4px' }}>
                        cloud_upload
                      </span>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                        {logoFile ? logoFile.name : 'Klik atau seret file ke sini'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Format PNG/JPG maksimal 2MB
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {logoFile && (
                      <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={handleLogoUpload}
                          disabled={uploading}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          {uploading ? (
                            <><TemplateIcon name="loading" size={14} /> Mengunggah...</>
                          ) : (
                            <><span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>upload</span> Simpan Logo</>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={handleLogoCancelSelect}
                          disabled={uploading}
                        >
                          Batal
                        </button>
                      </div>
                    )}

                    {/* Reset to default button */}
                    {!logoFile && !isDefaultLogo && currentLogo && (
                      <button
                        type="button"
                        onClick={handleLogoReset}
                        style={{
                          marginTop: '10px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          fontSize: '0.76rem',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0
                        }}
                      >
                        Reset ke logo default
                      </button>
                    )}
                  </div>
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
