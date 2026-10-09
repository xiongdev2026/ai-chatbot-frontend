"use client";

import { useEffect, useRef, useState } from "react";

export interface PieSlice {
  label: string;
  value: number;
  color: string;
}

interface AccuracyPieChartProps {
  data: PieSlice[];
  /** Optional big number shown under the chart (e.g. answered rate). */
  centerLabel?: string;
  centerSubLabel?: string;
}

interface HoverState {
  index: number;
  x: number;
  y: number;
}

// Text tokens (ink), kept off the slice colors so identity is carried by the
// marks and never by the label text — per the data-viz accessibility rule.
const INK_PRIMARY = "#0b0b0b";
const INK_SECONDARY = "#52514e";
const SURFACE = "#ffffff";

export default function AccuracyPieChart({
  data,
  centerLabel,
  centerSubLabel,
}: AccuracyPieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Slice geometry saved on each render so pointer moves can hit-test without a redraw.
  const geomRef = useRef<{
    cx: number;
    cy: number;
    radius: number;
    slices: { start: number; end: number }[];
  } | null>(null);
  const [hover, setHover] = useState<HoverState | null>(null);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fix DPI so the pie is crisp on high-density screens.
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

    ctx.clearRect(0, 0, W, H);

    if (total === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = INK_SECONDARY;
      ctx.font = "14px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("ບໍ່ມີຂໍ້ມູນ", cx, cy);
      geomRef.current = null;
      return;
    }

    let startAngle = -0.5 * Math.PI; // 12 o'clock
    const slices: { start: number; end: number }[] = [];
    const GAP = 0.002 * Math.PI; // small surface gap between slices

    data.forEach((slice, i) => {
      const frac = slice.value / total;
      const sliceAngle = frac * 2 * Math.PI;
      const end = startAngle + sliceAngle;
      slices.push({ start: startAngle, end });

      // Hover only surfaces the tooltip — the slice itself stays put (no pop-out
      // or scale), so ox/oy are always 0.
      const mid = startAngle + sliceAngle / 2;
      const ox = 0;
      const oy = 0;

      // Wedge, inset by a small gap on each side so slices read as separate marks.
      const a0 = slice.value > 0 ? startAngle + GAP / 2 : startAngle;
      const a1 = slice.value > 0 ? end - GAP / 2 : end;

      ctx.beginPath();
      ctx.moveTo(cx + ox, cy + oy);
      ctx.arc(cx + ox, cy + oy, radius, a0, a1);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();

      // 2px surface ring so touching wedges never blend.
      ctx.lineWidth = 2;
      ctx.strokeStyle = SURFACE;
      ctx.stroke();

      // Direct % label inside every non-trivial slice, so a small wedge (e.g. a
      // ~6% "ຕອບບໍ່ໄດ້") reads the same way as the big ones. Thin slices push the
      // label a little further out, where the wedge is wider, so it still fits.
      const pct = Math.round(frac * 100);
      if (pct >= 1) {
        const lr = radius * (frac < 0.08 ? 0.74 : 0.62);
        const lx = cx + ox + Math.cos(mid) * lr;
        const ly = cy + oy + Math.sin(mid) * lr;
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${pct}%`, lx, ly);
      }

      startAngle = end;
    });

    geomRef.current = { cx, cy, radius, slices };

    // Optional center headline (drawn over a punched-out hole for legibility).
    if (centerLabel) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 0.42, 0, 2 * Math.PI);
      ctx.fillStyle = SURFACE;
      ctx.fill();

      ctx.fillStyle = INK_PRIMARY;
      ctx.font = "bold 22px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(centerLabel, cx, cy - (centerSubLabel ? 8 : 0));

      if (centerSubLabel) {
        ctx.fillStyle = INK_SECONDARY;
        ctx.font = "11px Inter, system-ui, sans-serif";
        ctx.fillText(centerSubLabel, cx, cy + 12);
      }
    }
  }, [data, total, centerLabel, centerSubLabel]);

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

    if (dist > geom.radius) {
      setHover(null);
      return;
    }

    // Normalize angle into the same space slices were drawn in (start at -90°).
    let ang = Math.atan2(dy, dx);
    if (ang < -0.5 * Math.PI) ang += 2 * Math.PI;

    const idx = geom.slices.findIndex((s) => ang >= s.start && ang < s.end);
    if (idx === -1 || data[idx].value === 0) {
      setHover(null);
      return;
    }
    setHover({ index: idx, x, y });
  };

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ width: "100%", height: "100%" }}
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      />

      {hover && total > 0 && (
        <div
          className="pointer-events-none absolute z-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg"
          style={{
            left: hover.x + 12,
            top: hover.y + 12,
            transform: "translateZ(0)",
          }}
        >
          <div className="flex items-center gap-1.5 font-medium text-gray-800">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: data[hover.index].color }}
            />
            {data[hover.index].label}
          </div>
          <div className="mt-0.5 text-gray-500">
            {data[hover.index].value.toLocaleString()} ຄັ້ງ (
            {Math.round((data[hover.index].value / total) * 100)}%)
          </div>
        </div>
      )}
    </div>
  );
}
