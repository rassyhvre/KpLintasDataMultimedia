import React from 'react';

function TodayPaymentSummary({ value = 0, loading }) {
  var formatUang = function(val) {
    return 'Rp ' + Number(val).toLocaleString('id-ID');
  };

  var todayFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="card animate-fadeIn" style={{
      background: 'var(--primary)',
      border: 'none',
      color: 'white',
      padding: '24px',
      minHeight: '200px',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadow-md)'
    }}>
      {/* Wave SVG Background Decoration */}
      <svg
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '60px',
          pointerEvents: 'none',
          opacity: 0.15
        }}
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill="#ffffff"
          d="M0,224L60,208C120,192,240,160,360,165.3C480,171,600,213,720,213.3C840,213,960,171,1080,149.3C1200,128,1320,128,1380,128L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
        />
      </svg>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <h4 style={{
          fontSize: '0.85rem',
          fontWeight: '700',
          color: 'var(--md-primary-fixed)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '4px',
          fontFamily: "'Hanken Grotesk', sans-serif"
        }}>
          Pembayaran Hari Ini
        </h4>
        <span style={{
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.75)',
          fontFamily: "'Hanken Grotesk', sans-serif"
        }}>
          {todayFormatted}
        </span>
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <h2 style={{
          fontSize: '2.1rem',
          fontWeight: '800',
          letterSpacing: '-0.02em',
          fontFamily: "'Hanken Grotesk', sans-serif",
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.15)'
        }}>
          {loading ? '...' : formatUang(value)}
        </h2>
        <span style={{
          fontSize: '0.74rem',
          color: 'rgba(255, 255, 255, 0.7)',
          display: 'block',
          marginTop: '6px',
          fontFamily: "'Hanken Grotesk', sans-serif"
        }}>
          Diperbarui secara real-time
        </span>
      </div>
    </div>
  );
}

export default TodayPaymentSummary;
