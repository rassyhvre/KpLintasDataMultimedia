import React, { useState } from 'react';
import TemplateIcon from '../TemplateIcon';

function PaymentTrendChart({ data = [], loading, onExport, onPrint }) {
  var [hoveredIdx, setHoveredIdx] = useState(null);

  var formatUang = function(value) {
    return 'Rp ' + Number(value).toLocaleString('id-ID');
  };

  var formatShort = function(val) {
    if (val >= 1000000000) return 'Rp ' + (val / 1000000000).toFixed(1).replace('.0', '') + 'M';
    if (val >= 1000000) return 'Rp ' + (val / 1000000).toFixed(1).replace('.0', '') + 'Jt';
    if (val >= 1000) return 'Rp ' + (val / 1000).toFixed(0) + 'Rb';
    return 'Rp ' + val;
  };

  // Dimensions
  var svgWidth = 840;
  var svgHeight = 300;
  var paddingLeft = 75;
  var paddingRight = 20;
  var paddingTop = 30;
  var paddingBottom = 40;
  var chartWidth = svgWidth - paddingLeft - paddingRight;
  var chartHeight = svgHeight - paddingTop - paddingBottom;

  var maxVal = 1000000; // minimum scale
  if (data.length > 0) {
    var maxTagihan = Math.max(...data.map(function(d) { return d.tagihan; }));
    var maxPembayaran = Math.max(...data.map(function(d) { return d.pembayaran; }));
    maxVal = Math.max(maxTagihan, maxPembayaran, 100000);
  }
  
  // Round up maxVal to readable units
  var magnitude = Math.pow(10, Math.floor(Math.log10(maxVal)));
  if (magnitude === 0) magnitude = 1;
  var normalized = maxVal / magnitude;
  var rounded = Math.ceil(normalized * 2) / 2;
  maxVal = rounded * magnitude;

  var gridLines = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

  // Map coordinates
  var getCoordinates = function(key) {
    if (data.length === 0) return [];
    var totalDays = data.length;
    return data.map(function(d, i) {
      var x = paddingLeft + (i / (totalDays - 1)) * chartWidth;
      var y = paddingTop + chartHeight - (d[key] / maxVal) * chartHeight;
      return { x: x, y: y, val: d[key], day: d.day };
    });
  };

  var tagihanPoints = getCoordinates('tagihan');
  var pembayaranPoints = getCoordinates('pembayaran');

  var makePath = function(points) {
    if (points.length === 0) return '';
    return points.map(function(p, i) {
      return (i === 0 ? 'M' : 'L') + ' ' + p.x + ' ' + p.y;
    }).join(' ');
  };

  var makeAreaPath = function(points, linePath) {
    if (points.length === 0) return '';
    var lastIdx = points.length - 1;
    return linePath + ' L ' + points[lastIdx].x + ' ' + (paddingTop + chartHeight) + ' L ' + points[0].x + ' ' + (paddingTop + chartHeight) + ' Z';
  };

  var tagihanLine = makePath(tagihanPoints);
  var tagihanArea = makeAreaPath(tagihanPoints, tagihanLine);

  var pembayaranLine = makePath(pembayaranPoints);
  var pembayaranArea = makeAreaPath(pembayaranPoints, pembayaranLine);

  return (
    <div className="card glass-card animate-fadeIn" style={{ animationDelay: '0.1s', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: "'Hanken Grotesk', sans-serif" }}>
            Tren Tagihan & Pembayaran
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', fontFamily: "'Hanken Grotesk', sans-serif" }}>
            Perbandingan nominal tagihan yang diterbitkan vs pembayaran terverifikasi harian.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-secondary btn-sm" onClick={onExport} disabled={loading} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <TemplateIcon name="document" size={14} style={{ marginRight: '6px' }} /> Export
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onPrint} disabled={loading} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <TemplateIcon name="printer" size={14} style={{ marginRight: '6px' }} /> Cetak
          </button>
        </div>
      </div>

      {/* Legends */}
      <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', fontWeight: '600' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', background: 'var(--status-merah)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Tagihan Terbit</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', background: 'var(--primary)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>Pembayaran Masuk</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ position: 'relative', width: '100%', minHeight: '300px' }}>
        {loading ? (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <TemplateIcon name="loading" size={24} style={{ marginRight: '8px' }} /> Memuat tren data...
          </div>
        ) : data.length === 0 ? (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Tidak ada data transaksi untuk bulan ini.
          </div>
        ) : (
          <>
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height={svgHeight} style={{ overflow: 'visible' }}>
              {/* Horizontal Gridlines & Y-Axis Labels */}
              {gridLines.map(function(v, idx) {
                var y = paddingTop + chartHeight - (v / maxVal) * chartHeight;
                return (
                  <g key={idx}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke="var(--border-color)"
                      strokeDasharray="4 4"
                      strokeWidth="0.8"
                    />
                    <text
                      x={paddingLeft - 10}
                      y={y + 4}
                      fill="var(--text-muted)"
                      fontSize="0.75rem"
                      fontWeight="600"
                      textAnchor="end"
                      fontFamily="'Hanken Grotesk', sans-serif"
                    >
                      {formatShort(v)}
                    </text>
                  </g>
                );
              })}

              {/* X-Axis Date Marks (Every 5 Days to prevent text overlap) */}
              {data.map(function(d, i) {
                var isMarked = d.day === 1 || d.day === 5 || d.day === 10 || d.day === 15 || d.day === 20 || d.day === 25 || d.day === data.length;
                if (!isMarked) return null;
                var x = paddingLeft + (i / (data.length - 1)) * chartWidth;
                return (
                  <g key={i}>
                    <line
                      x1={x}
                      y1={paddingTop}
                      x2={x}
                      y2={paddingTop + chartHeight}
                      stroke="var(--border-color)"
                      strokeWidth="0.5"
                      opacity="0.3"
                    />
                    <text
                      x={x}
                      y={paddingTop + chartHeight + 16}
                      fill="var(--text-muted)"
                      fontSize="0.75rem"
                      fontWeight="700"
                      textAnchor="middle"
                      fontFamily="'Hanken Grotesk', sans-serif"
                    >
                      Tgl {d.day}
                    </text>
                  </g>
                );
              })}

              {/* Area Fills */}
              <path d={tagihanArea} fill="var(--status-merah)" fillOpacity="0.1" />
              <path d={pembayaranArea} fill="var(--primary)" fillOpacity="0.12" />

              {/* Line Paths */}
              <path
                d={tagihanLine}
                fill="none"
                stroke="var(--status-merah)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={pembayaranLine}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Interactive Vertical Guide Line */}
              {hoveredIdx !== null && (
                <line
                  x1={paddingLeft + (hoveredIdx / (data.length - 1)) * chartWidth}
                  y1={paddingTop}
                  x2={paddingLeft + (hoveredIdx / (data.length - 1)) * chartWidth}
                  y2={paddingTop + chartHeight}
                  stroke="var(--primary-light)"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />
              )}

              {/* Interactive Hover Circles */}
              {hoveredIdx !== null && (
                <>
                  <circle
                    cx={tagihanPoints[hoveredIdx].x}
                    cy={tagihanPoints[hoveredIdx].y}
                    r="5"
                    fill="var(--status-merah)"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <circle
                    cx={pembayaranPoints[hoveredIdx].x}
                    cy={pembayaranPoints[hoveredIdx].y}
                    r="5"
                    fill="var(--primary)"
                    stroke="white"
                    strokeWidth="2"
                  />
                </>
              )}

              {/* Invisible interactive zones */}
              {data.map(function(d, i) {
                var x = paddingLeft + (i / (data.length - 1)) * chartWidth;
                return (
                  <rect
                    key={i}
                    x={x - (chartWidth / (data.length * 2))}
                    y={paddingTop}
                    width={chartWidth / data.length}
                    height={chartHeight}
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={function() { setHoveredIdx(i); }}
                    onMouseLeave={function() { setHoveredIdx(null); }}
                  />
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredIdx !== null && data[hoveredIdx] && (
              <div
                className="chart-tooltip animate-fadeIn"
                style={{
                  left: `calc(${((paddingLeft + (hoveredIdx / (data.length - 1)) * chartWidth) / svgWidth) * 100}% - 90px)`,
                  top: '40px',
                  position: 'absolute',
                  background: 'rgba(15, 23, 42, 0.95)',
                  color: 'white',
                  padding: '10px 14px',
                  borderRadius: '5px',
                  fontSize: '0.78rem',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  zIndex: 20,
                  pointerEvents: 'none',
                  minWidth: '180px',
                  fontFamily: "'Hanken Grotesk', sans-serif"
                }}
              >
                <div style={{ fontWeight: '700', marginBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '4px' }}>
                  Tanggal {data[hoveredIdx].day}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span>Tagihan Terbit:</span>
                  <strong style={{ color: '#f87171' }}>{formatUang(data[hoveredIdx].tagihan)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Pembayaran:</span>
                  <strong style={{ color: 'var(--accent-cyan)' }}>{formatUang(data[hoveredIdx].pembayaran)}</strong>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentTrendChart;
