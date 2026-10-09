"use client";

import { useEffect, useRef, useState } from "react";

export interface QuestionStatItem {
  id: string;
  label: string;
  avg: number;
}

interface QuestionPieChartProps {
  data: QuestionStatItem[];
  height?: number;
}

const PALETTE = [
  "#6366f1", // indigo
  "#3b82f6", // blue
  "#10b981", // emerald
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#14b8a6", // teal
  "#ec4899", // pink
  "#a855f7", // violet
  "#06b6d4", // cyan
  "#84cc16", // lime
];

interface HoverState {
  index: number;
  x: number;
  y: number;
}

export default function QuestionPieChart({ data, height = 320 }: QuestionPieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const geomRef = useRef<{
    cx: number;
    cy: number;
    radius: number;
    slices: { start: number; end: number }[];
  } | null>(null);
  const [hover, setHover] = useState<HoverState | null>(null);

  const total = data.reduce((sum, d) => sum + d.avg, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const W = rect.width;
    const H = rect.height;
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(cx, cy) * 0.82;
    const innerRadius = radius * 0.55; // Donut style

    ctx.clearRect(0, 0, W, H);

    if (total === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#6b7280";
      ctx.font = "14px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("ບໍ່ມີຂໍ້ມູນ", cx, cy);
      geomRef.current = null;
      return;
    }

    let startAngle = -0.5 * Math.PI; // Top start
    const slices: { start: number; end: number }[] = [];
    const GAP = 0.01 * Math.PI;

    data.forEach((item, i) => {
      const frac = item.avg / total;
      const sliceAngle = frac * 2 * Math.PI;
      const end = startAngle + sliceAngle;
      slices.push({ start: startAngle, end });

      const color = PALETTE[i % PALETTE.length];

      const a0 = startAngle + GAP / 2;
      const a1 = end - GAP / 2;

      ctx.beginPath();
      ctx.arc(cx, cy, radius, a0, a1);
      ctx.arc(cx, cy, innerRadius, a1, a0, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      startAngle = end;
    });

    // Draw overall average in the center
    const overallAvg = Number((total / (data.length || 1)).toFixed(2));

    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 22px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${overallAvg}`, cx, cy - 8);

    ctx.fillStyle = "#64748b";
    ctx.font = "11px Inter, sans-serif";
    ctx.fillText("ຄະແນນສະເລ່ຍ / 5.0", cx, cy + 12);

    geomRef.current = { cx, cy, radius, slices };
  }, [data, total]);

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const geom = geomRef.current;
    const canvas = canvasRef.current;
    if (!geom || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - geom.cx;
    const dy = y - geom.cy;
    const dist = Math.hypot(dx, dy);

    if (dist > geom.radius || dist < geom.radius * 0.4) {
      setHover(null);
      return;
    }

    let ang = Math.atan2(dy, dx);
    if (ang < -0.5 * Math.PI) ang += 2 * Math.PI;

    const idx = geom.slices.findIndex((s) => ang >= s.start && ang < s.end);
    if (idx === -1) {
      setHover(null);
      return;
    }
    setHover({ index: idx, x, y });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      {/* Pie Canvas */}
      <div className="md:col-span-6 relative flex items-center justify-center" style={{ height }}>
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{ width: "100%", height: "100%" }}
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
        />

        {hover && (
          <div
            className="pointer-events-none absolute z-10 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-xl"
            style={{
              left: Math.min(hover.x + 10, 200),
              top: Math.max(hover.y - 40, 10),
            }}
          >
            <div className="flex items-center gap-1.5 font-bold text-gray-800">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: PALETTE[hover.index % PALETTE.length] }}
              />
              {data[hover.index].label}
            </div>
            <div className="mt-1 font-semibold text-indigo-600">
              ຄະແນນ: {data[hover.index].avg} / 5.0
            </div>
          </div>
        )}
      </div>

      {/* Legend / Question Details */}
      <div className="md:col-span-6 space-y-2 max-h-[300px] overflow-y-auto pr-2">
        {data.map((item, idx) => {
          const color = PALETTE[idx % PALETTE.length];
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 rounded-xl border border-gray-100 hover:bg-gray-50/80 transition-colors text-xs"
            >
              <div className="flex items-center gap-2 truncate max-w-[220px]">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="font-semibold text-gray-800 truncate" title={item.label}>
                  {item.label}
                </span>
              </div>
              <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                {item.avg} / 5.0
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
