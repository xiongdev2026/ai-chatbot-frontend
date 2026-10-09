'use client';

import { useEffect, useRef } from 'react';

interface DonutChartProps {
  data: { label: string; value: number; color?: string }[];
  title?: string;
  height?: number;
}

const defaultColors = ['#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#0ea5e9'];

export default function DonutChart({ data, title, height = 300 }: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) * 0.75;
    const innerRadius = radius * 0.6; // Creates the donut hole

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) {
      // Empty state
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = radius - innerRadius;
      ctx.stroke();
      
      ctx.fillStyle = '#6b7280';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No Data', centerX, centerY);
      return;
    }

    let startAngle = -0.5 * Math.PI; // Start at top

    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      const color = item.color || defaultColors[index % defaultColors.length];

      // Draw slice
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.strokeStyle = color;
      ctx.lineWidth = radius - innerRadius;
      ctx.stroke();

      startAngle += sliceAngle;
    });

    // Draw center total
    ctx.fillStyle = '#f3f4f6';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toString(), centerX, centerY - 5);
    
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Total', centerX, centerY + 15);

  }, [data, height]);

  return (
    <div className="flex h-full flex-col">
      {title && <h3 className="mb-4 text-sm font-semibold text-gray-300">{title}</h3>}
      <div className="relative flex-1" style={{ minHeight: height }}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {data.map((item, i) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color || defaultColors[i % defaultColors.length] }}
            />
            {item.label} ({item.value})
          </div>
        ))}
      </div>
    </div>
  );
}
