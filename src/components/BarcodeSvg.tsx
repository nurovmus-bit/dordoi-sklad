import React from 'react';

// Standard Code 39 character table (9 elements per char: alternating bar/space, W = wide(3), N = narrow(1))
const CODE39_MAP: Record<string, string> = {
  '0': 'NNNWWNNWN',
  '1': 'WNNWNNNNW',
  '2': 'NNWWNNNNW',
  '3': 'WNWWNNNNN',
  '4': 'NNNWWNNNW',
  '5': 'WNNWWNNNN',
  '6': 'NNWWWNNNN',
  '7': 'NNNWNNWNW',
  '8': 'WNNWNNWNN',
  '9': 'NNWWNNWNN',
  'A': 'WNNNNWNNW',
  'B': 'NNWNNWNNW',
  'C': 'WNWNNWNNN',
  'D': 'NNNNWWNNW',
  'E': 'WNNNWWNNN',
  'F': 'NNWNWWNNN',
  'G': 'NNNNNWWNW',
  'H': 'WNNNNWWNN',
  'I': 'NNWNNWWNN',
  'J': 'NNNNWWWNN',
  'K': 'WNNNNNNWW',
  'L': 'NNWNNNNWW',
  'M': 'WNWNNNNWN',
  'N': 'NNNNWNNWW',
  'O': 'WNNNWNNWN',
  'P': 'NNWNWNNWN',
  'Q': 'NNNNNNWWW',
  'R': 'WNNNNNWWN',
  'S': 'NNWNNNWWN',
  'T': 'NNNNWNWWN',
  'U': 'WWNNNNNNW',
  'V': 'NWWNNNNNW',
  'W': 'WWWNNNNNN',
  'X': 'NWNNWNNNW',
  'Y': 'WWNNWNNNN',
  'Z': 'NWWNWNNNN',
  '-': 'NWNNNNWNW',
  '.': 'WWNNNNWNN',
  ' ': 'NWWNNNWNN',
  '*': 'NWNNWNWNN',
};

function encodeCode39(raw: string): { x: number; width: number }[] {
  const sanitized = raw
    .toUpperCase()
    .replace(/[^0-9A-Z\-. ]/g, '-');
  const full = `*${sanitized}*`;
  const bars: { x: number; width: number }[] = [];
  let cursor = 0;

  for (let i = 0; i < full.length; i++) {
    const ch = full[i];
    const pattern = CODE39_MAP[ch] ?? CODE39_MAP['-'];
    for (let j = 0; j < pattern.length; j++) {
      const w = pattern[j] === 'W' ? 3 : 1;
      const isBar = j % 2 === 0;
      if (isBar) {
        bars.push({ x: cursor, width: w });
      }
      cursor += w;
    }
    // Inter-character narrow space
    cursor += 1;
  }

  return bars;
}

interface BarcodeSvgProps {
  value: string;
  height?: number;
  className?: string;
  showText?: boolean;
}

export const BarcodeSvg: React.FC<BarcodeSvgProps> = ({
  value,
  height = 48,
  className = '',
  showText = true,
}) => {
  const safeVal = value.trim() || 'DRD-000000';
  const bars = encodeCode39(safeVal);
  const lastBar = bars[bars.length - 1];
  const totalWidth = lastBar ? lastBar.x + lastBar.width : 120;

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="w-full h-auto max-w-[240px]"
        role="img"
        aria-label={`Штрих-код ${safeVal}`}
      >
        <rect x="0" y="0" width={totalWidth} height={height} fill="#FFFFFF" />
        {bars.map((bar, idx) => (
          <rect
            key={idx}
            x={bar.x}
            y={0}
            width={bar.width}
            height={height}
            fill="#0F172A"
          />
        ))}
      </svg>
      {showText && (
        <span className="mt-1 font-mono text-[11px] font-medium tracking-[0.18em] text-slate-800 tabular-nums">
          {safeVal}
        </span>
      )}
    </div>
  );
};

export function downloadBarcodeLabelPng(params: {
  barcode: string;
  name: string;
  modelCode: string;
  color: string;
  sizeRange: string;
}) {
  const { barcode, name, modelCode, color, sizeRange } = params;
  const bars = encodeCode39(barcode);
  const lastBar = bars[bars.length - 1];
  const rawW = lastBar ? lastBar.x + lastBar.width : 120;

  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 280;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // White label card background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle border
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);

  // Title & details
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`${name} (${modelCode})`, 28, 48);

  ctx.fillStyle = '#475569';
  ctx.font = '16px sans-serif';
  ctx.fillText(`Түсү: ${color}  ·  Размер: ${sizeRange}`, 28, 78);

  // Draw barcode bars centered
  const targetW = 400;
  const scale = targetW / rawW;
  const startX = (canvas.width - targetW) / 2;
  const startY = 104;
  const barH = 110;

  ctx.fillStyle = '#0F172A';
  for (const bar of bars) {
    ctx.fillRect(startX + bar.x * scale, startY, bar.width * scale, barH);
  }

  // Barcode human-readable text
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(barcode, canvas.width / 2, startY + barH + 30);

  const link = document.createElement('a');
  link.download = `shtrih-kod-${barcode}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
