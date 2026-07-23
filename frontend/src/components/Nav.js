import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';

function Navbar({ admin, onLogout, socket, onToggleSidebar, collapsed }) {
  var [notifs, setNotifs] = useState([]);
  var [unreadCount, setUnreadCount] = useState(0);
  var [notifOpen, setNotifOpen] = useState(false);
  var [profileOpen, setProfileOpen] = useState(false);

  var notifRef = useRef(null);
  var profileRef = useRef(null);

  var token = localStorage.getItem('token');
  var headers = { Authorization: 'Bearer ' + token };

  var fetchNotifications = function() {
    if (!token) return;
    axios.get(API_BASE_URL + '/api/notifikasi', { headers: headers })
      .then(function(res) {
        if (res.data.success) {
          setNotifs(res.data.data);
          var unread = res.data.data.filter(function(n) { return n.status_baca === 0; }).length;
          setUnreadCount(unread);
        }
      })
      .catch(function(err) { console.error('Error fetching notifications in Nav:', err); });
  };

  useEffect(function() {
    fetchNotifications();

    // Close dropdowns if clicked outside
    var handleClickOutside = function(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return function() {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Listen to WebSocket triggers for notifications
  useEffect(function() {
    if (socket) {
      socket.on('pembayaran_masuk', function() {
        fetchNotifications();
      });
      socket.on('pelanggan_updated', function() {
        fetchNotifications();
      });
      return function() {
        socket.off('pembayaran_masuk');
        socket.off('pelanggan_updated');
      };
    }
  }, [socket]);

  var handleMarkRead = function(notif) {
    if (notif.status_baca === 1) return;
    axios.put(API_BASE_URL + '/api/notifikasi/' + notif.id_notifikasi + '/read', {}, { headers: headers })
      .then(function(res) {
        if (res.data.success) {
          fetchNotifications();
        }
      })
      .catch(function(err) { console.error(err); });
  };

  var handleMarkAllRead = function() {
    if (unreadCount === 0) return;
    axios.put(API_BASE_URL + '/api/notifikasi/read-all', {}, { headers: headers })
      .then(function(res) {
        if (res.data.success) {
          fetchNotifications();
        }
      })
      .catch(function(err) { console.error(err); });
  };

  function getInitials(nama) {
    if (!nama) return 'A';
    return nama.split(' ').map(function (n) { return n[0]; }).join('').toUpperCase().slice(0, 2);
  }

  function formatTanggal(dateStr) {
    var d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <header className="topbar" style={{
      position: 'fixed',
      top: 0,
      left: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
      right: 0,
      height: 'var(--topbar-height)',
      background: 'var(--primary-dark)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 90,
      transition: 'left var(--transition-normal)',
      fontFamily: "'Hanken Grotesk', sans-serif",
      color: '#ffffff'
    }}>
      {/* Left side: Hamburger and brand/info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={onToggleSidebar}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: 'white',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={function(e) { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}
          onMouseLeave={function(e) { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>
            {collapsed ? 'menu' : 'menu_open'}
          </span>
        </button>
        <span style={{ fontSize: '1.05rem', fontWeight: '700', letterSpacing: '-0.01em', opacity: 0.95 }}>
          Enhanced Service Platform
        </span>
      </div>

      {/* Middle: Search bar */}
      <div style={{ display: 'flex', flex: 1, maxWidth: '400px', margin: '0 20px', position: 'relative' }}>
        <span className="material-symbols-outlined" style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '1.2rem',
          pointerEvents: 'none'
        }}>
          search
        </span>
        <input
          type="text"
          placeholder="Cari pelanggan, tagihan, atau ID..."
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '30px',
            padding: '8px 16px 8px 40px',
            fontSize: '0.85rem',
            color: 'white',
            width: '100%',
            outline: 'none',
            transition: 'all 0.3s ease'
          }}
          onFocus={function(e) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.2)';
          }}
          onBlur={function(e) {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Right side actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Mail Icon */}
        <Link 
          to="/dashboard/reminder-logs" 
          style={{
            color: 'rgba(255, 255, 255, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={function(e) { e.currentTarget.style.color = '#ffffff'; }}
          onMouseLeave={function(e) { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)'; }}
          title="Reminder Log"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>
            mail
          </span>
        </Link>

        {/* Notifications Dropdown */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <div 
            onClick={function() { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            style={{
              color: 'rgba(255, 255, 255, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={function(e) { e.currentTarget.style.color = '#ffffff'; }}
            onMouseLeave={function(e) { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)'; }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>
              notifications
            </span>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--status-merah)',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: '700',
                borderRadius: '50%',
                width: '15px',
                height: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--primary-dark)'
              }}>
                {unreadCount}
              </span>
            )}
          </div>

          {/* Notifications Dropdown Panel */}
          {notifOpen && (
            <div className="animate-fadeIn" style={{
              position: 'absolute',
              top: '38px',
              right: '-10px',
              background: '#ffffff',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
              width: '320px',
              maxHeight: '400px',
              overflowY: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 110,
              color: 'var(--text-primary)'
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>Notifikasi ({unreadCount} baru)</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Tandai semua dibaca
                  </button>
                )}
              </div>

              <div style={{ overflowY: 'auto', flex: 1 }}>
                {notifs.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Tidak ada notifikasi baru.
                  </div>
                ) : (
                  notifs.map(function(n) {
                    var isUnread = n.status_baca === 0;
                    var isMidtrans = n.bukti_file && n.bukti_file.includes('Midtrans');
                    var title = isMidtrans ? 'Pembayaran Midtrans' : 'Verifikasi Pembayaran';
                    var icon = 'payments';
                    var iconBg = isMidtrans ? 'var(--status-hijau-bg)' : 'var(--status-kuning-bg)';
                    var iconColor = isMidtrans ? 'var(--status-hijau)' : 'var(--status-kuning)';
                    
                    var desc = isMidtrans 
                      ? `Pembayaran otomatis via Midtrans dari ${n.nama_pelanggan} (Periode ${n.periode})`
                      : `Pembayaran baru dari ${n.nama_pelanggan} (Periode ${n.periode})`;

                    var targetLink = isMidtrans 
                      ? `/dashboard/notifikasi?notifId=${n.id_notifikasi}`
                      : '/dashboard/pembayaran';

                    return (
                      <div 
                        key={n.id_notifikasi}
                        onClick={function() {
                          handleMarkRead(n);
                          setNotifOpen(false);
                        }}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--border-color)',
                          background: isUnread ? 'rgba(0, 104, 118, 0.03)' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '12px',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={function(e) { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                        onMouseLeave={function(e) { e.currentTarget.style.background = isUnread ? 'rgba(0, 104, 118, 0.03)' : 'transparent'; }}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: iconBg,
                          color: iconColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>{icon}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Link to={targetLink} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>{title}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px', lineBreak: 'anywhere' }}>{desc}</div>
                          </Link>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>{formatTanggal(n.tanggal)}</div>
                        </div>
                        {isUnread && (
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            display: 'inline-block',
                            marginTop: '4px',
                            flexShrink: 0
                          }} />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* View All Footer */}
              <div style={{
                padding: '10px 16px',
                borderTop: '1px solid var(--border-color)',
                textAlign: 'center',
                background: 'var(--bg-primary)',
                borderBottomLeftRadius: '8px',
                borderBottomRightRadius: '8px'
              }}>
                <Link 
                  to="/dashboard/notifikasi"
                  onClick={function() { setNotifOpen(false); }}
                  style={{
                    color: 'var(--primary)',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    textDecoration: 'none',
                    display: 'block'
                  }}
                >
                  Lihat Semua Notifikasi
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Grid / Menu Icon */}
        <Link 
          to="/dashboard/laporan" 
          style={{
            color: 'rgba(255, 255, 255, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={function(e) { e.currentTarget.style.color = '#ffffff'; }}
          onMouseLeave={function(e) { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)'; }}
          title="Laporan & Ringkasan"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>
            apps
          </span>
        </Link>

        {/* Vertical Separator */}
        <span style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />

        {/* Admin profile user dropdown */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <div 
            onClick={function() { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '30px',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={function(e) { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
            onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#ffffff',
              color: 'var(--primary)',
              fontWeight: '700',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {getInitials(admin ? admin.nama : 'Admin')}
            </div>
            <div style={{ display: 'none', flexDirection: 'column', textAlign: 'left' }} className="desktop-only-flex">
              <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>{admin ? admin.nama : 'Admin LDM'}</span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>{admin ? admin.role : 'Admin'}</span>
            </div>
          </div>

          {/* Profile Dropdown Panel */}
          {profileOpen && (
            <div className="animate-fadeIn" style={{
              position: 'absolute',
              top: '46px',
              right: 0,
              background: '#ffffff',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
              width: '200px',
              zIndex: 110,
              color: 'var(--text-primary)',
              padding: '6px'
            }}>
              <div style={{
                padding: '10px 12px',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '4px'
              }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '700' }}>{admin ? admin.nama : 'Admin LDM'}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>{admin ? admin.role : 'Administrator'}</div>
              </div>
              <Link 
                to="/dashboard/pelanggan"
                onClick={function() { setProfileOpen(false); }}
                style={{
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '6px',
                  textDecoration: 'none'
                }}
                onMouseEnter={function(e) { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>person</span>
                Profil Admin
              </Link>
              <div 
                onClick={onLogout}
                style={{
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                  color: 'var(--status-merah)',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onMouseEnter={function(e) { e.currentTarget.style.background = 'var(--status-merah-bg)'; }}
                onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>logout</span>
                Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;