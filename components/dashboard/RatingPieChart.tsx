"use client";

import { useEffect, useRef, useState } from "react";

interface RatingDistItem {
  rating: number;
  count: number;
}

interface RatingPieChartProps {
  data: RatingDistItem[];
  height?: number;
}

const RATING_COLORS = [
  "#ef4444", // 1 star - red
  "#f97316", // 2 stars - orange
  "#f59e0b", // 3 stars - amber
  "#3b82f6", // 4 stars - blue
  "#10b981", // 5 stars - emerald
];

const RATING_LABELS: Record<number, string> = {
  1: "ບໍ່ເພິ່ງພໍໃຈຢ່າງຍິ່ງ",
  2: "ບໍ່ເພິ່ງພໍໃຈ",
  3: "ປານກາງ",
  4: "ເພິ່ງພໍໃຈ",
  5: "ເພິ່ງພໍໃຈຢ່າງຍິ່ງ",
};

interface HoverState {
  index: number;
  x: number;
  y: number;
}

export default function RatingPieChart({ data, height = 280 }: RatingPieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const geomRef = useRef<{
    cx: number;
    cy: number;
    radius: number;
    innerRadius: number;
    slices: { start: number; end: number; rating: number }[];
  } | null>(null);
  const [hover, setHover] = useState<HoverState | null>(null);

  // Sort data by rating ascending
  const sorted = [...data].sort((a, b) => a.rating - b.rating);
  const total = sorted.reduce((sum, d) => sum + d.count, 0);

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
    const innerRadius = radius * 0.58;

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

    let startAngle = -0.5 * Math.PI;
    const slices: { start: number; end: number; rating: number }[] = [];
    const GAP = 0.02 * Math.PI;

    sorted.forEach((item) => {
      const frac = item.count / total;
      const sliceAngle = frac * 2 * Math.PI;
      const end = startAngle + sliceAngle;
      slices.push({ start: startAngle, end, rating: item.rating });

      const color = RATING_COLORS[item.rating - 1] || "#6b7280";

      const a0 = startAngle + GAP / 2;
      const a1 = end - GAP / 2;

      if (a1 > a0) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, a0, a1);
        ctx.arc(cx, cy, innerRadius, a1, a0, true);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      }

      startAngle = end;
    });

    // Center text
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 24px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${total}`, cx, cy - 8);

    ctx.fillStyle = "#64748b";
    ctx.font = "11px Inter, sans-serif";
    ctx.fillText("ຄຳຕອບທັງໝົດ", cx, cy + 12);

    geomRef.current = { cx, cy, radius, innerRadius, slices };
  }, [data, total, sorted]);

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

    if (dist > geom.radius || dist < geom.innerRadius) {
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
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
      {/* Pie Canvas */}
      <div className="md:col-span-6 relative flex items-center justify-center" style={{ height }}>
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{ width: "100%", height: "100%" }}
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
        />

        {hover && sorted[hover.index] && (
          <div
            className="pointer-events-none absolute z-10 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-xl"
            style={{
              left: Math.min(hover.x + 10, 180),
              top: Math.max(hover.y - 40, 10),
            }}
          >
            <div className="flex items-center gap-1.5 font-bold text-gray-800">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: RATING_COLORS[sorted[hover.index].rating - 1] }}
              />
              {sorted[hover.index].rating} ⭐ — {RATING_LABELS[sorted[hover.index].rating]}
            </div>
            <div className="mt-1 font-semibold text-indigo-600">
              {sorted[hover.index].count} ຄັ້ງ ({total > 0 ? ((sorted[hover.index].count / total) * 100).toFixed(1) : 0}%)
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="md:col-span-6 space-y-2">
        {sorted.map((item) => {
          const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : "0";
          const color = RATING_COLORS[item.rating - 1] || "#6b7280";
          return (
            <div
              key={item.rating}
              className="flex items-center justify-between p-2 rounded-xl border border-gray-100 hover:bg-gray-50/80 transition-colors text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="font-semibold text-gray-800">
                  {item.rating} ⭐ {RATING_LABELS[item.rating]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{item.count} ຄັ້ງ</span>
                <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
