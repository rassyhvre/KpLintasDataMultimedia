import React from 'react';

function IncomeSpendCard({ totalIncome, totalSpend, dailyData = [], loading }) {
  var formatUang = function(value) {
    return 'Rp ' + Number(value).toLocaleString('id-ID');
  };

  var maxVal = Math.max(...dailyData.map(function(d) { return d.value; }), 1000);

  return (
    <div className="card glass-card animate-fadeIn" style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1.2fr',
      gap: '20px',
      alignItems: 'center',
      padding: '24px',
      minHeight: '200px'
    }}>
      {/* Left side: Metrics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            color: 'var(--status-hijau)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '4px',
            fontFamily: "'Hanken Grotesk', sans-serif"
          }}>
            Total Pemasukan
          </div>
          <div style={{
            fontSize: '1.6rem',
            fontWeight: '800',
            color: 'var(--status-hijau)',
            fontFamily: "'Hanken Grotesk', sans-serif",
            letterSpacing: '-0.02em'
          }}>
            {loading ? '...' : formatUang(totalIncome)}
          </div>
        </div>

        <div>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            color: 'var(--status-merah)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '4px',
            fontFamily: "'Hanken Grotesk', sans-serif"
          }}>
            Total Pengeluaran
          </div>
          <div style={{
            fontSize: '1.6rem',
            fontWeight: '800',
            color: 'var(--status-merah)',
            fontFamily: "'Hanken Grotesk', sans-serif",
            letterSpacing: '-0.02em'
          }}>
            {loading ? '...' : formatUang(totalSpend)}
          </div>
        </div>
      </div>

      {/* Right side: Mini Bar Chart */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
        <div style={{
          fontSize: '0.78rem',
          fontWeight: '700',
          color: 'var(--text-muted)',
          marginBottom: '12px',
          textAlign: 'right',
          fontFamily: "'Hanken Grotesk', sans-serif"
        }}>
          Pemasukan 10 Hari Terakhir
        </div>
        
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Memuat chart...
          </div>
        ) : dailyData.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Tidak ada transaksi
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            height: '100px',
            gap: '6px',
            paddingTop: '10px'
          }}>
            {dailyData.map(function(d, idx) {
              var barHeightPercentage = (d.value / maxVal) * 100;
              // Make sure there is a minimum height if value > 0 so it's visible
              if (d.value > 0 && barHeightPercentage < 8) {
                barHeightPercentage = 8;
              }
              return (
                <div key={idx} style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end'
                }}>
                  {/* Bar */}
                  <div 
                    title={`${new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}: ${formatUang(d.value)}`}
                    style={{
                      width: '100%',
                      height: barHeightPercentage + '%',
                      background: 'var(--primary)',
                      borderRadius: '3px 3px 0 0',
                      transition: 'all 0.4s ease',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0, 104, 118, 0.1)'
                    }}
                    onMouseEnter={function(e) {
                      e.target.style.filter = 'brightness(1.15)';
                    }}
                    onMouseLeave={function(e) {
                      e.target.style.filter = 'none';
                    }}
                  />
                  {/* Label */}
                  <span style={{
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                    fontWeight: '700',
                    marginTop: '6px',
                    textTransform: 'uppercase',
                    fontFamily: "'Hanken Grotesk', sans-serif"
                  }}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default IncomeSpendCard;
