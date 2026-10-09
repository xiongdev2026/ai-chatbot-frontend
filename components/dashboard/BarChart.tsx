'use client';

import { useEffect, useRef } from 'react';

interface BarChartProps {
  data: { label: string; value: number; subLabels?: string[] }[];
  maxValue?: number;
  barColor?: string;
}

export default function BarChart({
  data,
  maxValue,
  barColor,
}: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ===== FIX DPI ISSUE =====
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const W = rect.width;
    const H = rect.height;

    const padTop = 24;
    const padBottom = 56;
    const padLeft = 44;
    const padRight = 20;

    const chartW = W - padLeft - padRight;
    const chartH = H - padTop - padBottom;

    const max =
      maxValue || Math.max(...data.map((d) => d.value), 0) * 1.2;

    ctx.clearRect(0, 0, W, H);

    // ===== Y GRID =====
    const ySteps = 4;

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = '11px Inter, system-ui, sans-serif';

    for (let i = 0; i <= ySteps; i++) {
      const y = padTop + (chartH / ySteps) * i;
      const val = Math.round(max - (max / ySteps) * i);

      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(W - padRight, y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillText(String(val), padLeft - 8, y);
    }

    // ===== BARS =====
    const barCount = data.length;
    const gap = 24;

    const totalGap = gap * (barCount + 1);
    const barW = (chartW - totalGap) / barCount;

    data.forEach((d, i) => {
      const x = padLeft + gap + i * (barW + gap);

      const barH = (d.value / max) * chartH;
      const y = padTop + chartH - barH;

      // gradient
      const grad = ctx.createLinearGradient(x, y, x, padTop + chartH);
      grad.addColorStop(0, barColor || 'rgba(129, 104, 255, 0.9)');
      grad.addColorStop(1, barColor || 'rgba(129, 104, 255, 0.3)');

      // bar
      const radius = Math.min(6, barW / 2);

      ctx.beginPath();
      ctx.moveTo(x, padTop + chartH);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.lineTo(x + barW - radius, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius);
      ctx.lineTo(x + barW, padTop + chartH);
      ctx.closePath();

      ctx.fillStyle = grad;
      ctx.fill();

      // value on top
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.font = 'bold 12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(d.value), x + barW / 2, y - 8);

      // ===== X-AXIS LABEL (use the real label passed in) =====
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.font = '12px Inter, system-ui, sans-serif';
      ctx.fillText(d.label, x + barW / 2, padTop + chartH + 18);

      // optional sub labels
      if (d.subLabels) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.font = '10px Inter, system-ui, sans-serif';

        d.subLabels.forEach((sub, si) => {
          ctx.fillText(
            sub,
            x + barW / 2,
            padTop + chartH + 32 + si * 12
          );
        });
      }
    });
  }, [data, maxValue, barColor]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ width: '100%', height: '100%' }}
    />
  );
}