"use client";

import { useState, useEffect } from "react";
import StatCard from "@/components/dashboard/StatCard";
import RecentDataTable from "@/components/dashboard/RecentDataTable";

import {
  FileText,
  MessageSquare,
  HelpCircle,
  Database,
  Loader2,
} from "lucide-react";

import { api } from "@/lib/axios";
import BreadcrumbsWithSlashSeparator from "@/components/admin/Breadcrumb";
import BarChart from "@/components/dashboard/BarChart";
import AccuracyPieChart from "@/components/dashboard/AccuracyPieChart";

interface ChatLog {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  user?: {
    fullName?: string;
    email?: string;
  };
}
interface DashboardData {
  counts: {
    users?: number;
    posts: number;
    chatLogs: number;
    faqs: number;
    knowledgeSources: number;
  };

  currentMonth: {
    users?: number;
    posts: number;
    chatLogs: number;
    faqs: number;
    knowledgeSources: number;
  };

  previousMonth: {
    users?: number;
    posts: number;
    chatLogs: number;
    faqs: number;
    knowledgeSources: number;
  };

  charts: {
    chatActivity: {
      date: string;
      count: number;
    }[];
    speedDistribution?: {
      label: string;
      value: number;
    }[];
  };
}

type AccuracyPeriod = "day" | "week" | "month";

interface AccuracyData {
  period: AccuracyPeriod;
  total: number;
  answered: number;
  answeredRate: number;
  accuracy: { key: string; label: string; value: number }[];
  bySource: { sourceType: string; value: number }[];
}

// Status palette for the accuracy tiers. Meaning is never carried by color alone —
// every tier is paired with its label and percentage in the legend below the pie.
//
// Validated with the dataviz palette validator (light surface, adjacent pairs):
// worst CVD ΔE 9.1 (deutan, low↔fallback), worst normal-vision ΔE 18.9 — both pass.
//
// `low` uses the status "critical" red rather than the "serious" orange it maps to
// in the chat-log table: orange (#ec835a) against the existing warning amber
// (#fab219) measures ΔE 13.6 for NORMAL vision — under the 15 floor, i.e. two pie
// slices most people could not tell apart. Red is the nearest reserved status step
// that stays legible next to amber.
const ACCURACY_COLORS: Record<string, string> = {
  matched: "#0ca30c", // good     → answered from the knowledge base (incl. FAQ)
  closest: "#fab219", // warning  → answered from a strong semantic match
  low: "#d03b3b", // critical → answered with weak backing; worth auditing
  fallback: "#898781", // muted    → no data found, bot declined (correct behaviour)
};

const PERIOD_OPTIONS: { key: AccuracyPeriod; label: string }[] = [
  { key: "day", label: "ລາຍວັນ" },
  { key: "week", label: "ລາຍອາທິດ" },
  { key: "month", label: "ລາຍເດືອນ" },
];

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [accuracy, setAccuracy] = useState<AccuracyData | null>(null);
  const [period, setPeriod] = useState<AccuracyPeriod>("month");
  const [accuracyLoading, setAccuracyLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [dashboardRes, chatlogsRes] = await Promise.all([
          api.get("/dashboard"),
          api.get("/chatlogs"),
        ]);

        setData(dashboardRes.data);
        setChatLogs(chatlogsRes.data.data);
      } catch (error: any) {
        if (error?.response?.status !== 401 && error?.response?.status !== 403) {
          console.error("Dashboard Error:", error);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  // Accuracy re-fetches whenever the time-range filter changes.
  useEffect(() => {
    let cancelled = false;

    async function fetchAccuracy() {
      setAccuracyLoading(true);
      try {
        const res = await api.get("/dashboard/accuracy", {
          params: { period },
        });

        if (!cancelled) {
          const payload = res.data?.data ?? res.data;
          setAccuracy(payload);
        }
      } catch (error: any) {
        if (!cancelled && error?.response?.status !== 401 && error?.response?.status !== 403) {
          console.error("Accuracy Error:", error);
        }
        if (!cancelled) setAccuracy(null);
      } finally {
        if (!cancelled) setAccuracyLoading(false);
      }
    }

    fetchAccuracy();
    return () => {
      cancelled = true;
    };
  }, [period]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-red-500">Failed to load dashboard data</p>
      </div>
    );
  }

  const recentData = chatLogs.map((log) => ({
    question:
      log.question.length > 40
        ? `${log.question.slice(0, 40)}...`
        : log.question,
    answer:
      log.answer.length > 40 ? `${log.answer.slice(0, 40)}...` : log.answer,
    time: new Date(log.createdAt).toLocaleString(),
  }));

  function calcTrend(current: number = 0, previous: number = 0) {
    if (!previous || previous === 0) {
      return { value: "100%", positive: true };
    }

    const diff = current - previous;
    const percent = (diff / previous) * 100;

    return {
      value: `${Math.abs(percent).toFixed(0)}%`,
      positive: percent >= 0,
    };
  }

  const stats = data
    ? [
        {
          title: "Blog Posts",
          value: data.counts.posts,
          previous: data.previousMonth.posts,
          icon: FileText,
          color: "emerald",
          gradient: "bg-emerald-500",
          iconBg: "bg-emerald-500",
        },
        {
          title: "Chat Logs",
          value: data.counts.chatLogs,
          previous: data.previousMonth.chatLogs,
          icon: MessageSquare,
          color: "purple",
          gradient: "bg-purple-500",
          iconBg: "bg-purple-500",
        },
        {
          title: "FAQs",
          value: data.counts.faqs,
          previous: data.previousMonth.faqs,
          icon: HelpCircle,
          color: "amber",
          gradient: "bg-amber-500",
          iconBg: "bg-amber-500",
        },
        {
          title: "Knowledge Sources",
          value: data.counts.knowledgeSources,
          previous: data.previousMonth.knowledgeSources,
          icon: Database,
          color: "blue",
          gradient: "bg-blue-500",
          iconBg: "bg-blue-500",
        },
      ]
    : [];

  const pieData = accuracy
    ? accuracy.accuracy.map((a) => ({
        label: a.label,
        value: a.value,
        color: ACCURACY_COLORS[a.key] ?? "#94a3b8",
      }))
    : [];

  const accuracyTotal = accuracy?.total ?? 0;
  const faqAnswered =
    accuracy?.bySource.find((s) => s.sourceType === "FAQ")?.value ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-6 rounded-md">
        <BreadcrumbsWithSlashSeparator
          items={[{ label: "Dashboard", href: "/admin" }]}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            icon={item.icon}
            color={item.color}
            gradient={item.gradient}
            iconBg={item.iconBg}
            trend={calcTrend(item.value, item.previous)}
          />
        ))}
      </div>

      {/* Accuracy Pie Chart + time-range filter */}
      <div className="rounded-md border bg-white p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              ຄວາມເໝັນຍຳໃນການຕອບ
            </h3>
            <p className="text-xs text-gray-500">
              ອັດຕາສ່ວນຄຳຕອບທີ່ດຶງຈາກຖານຂໍ້ມູນ (FAQ/ຂໍ້ມູນຈິງ) ທຽບກັບທີ່ຕອບບໍ່ໄດ້
            </p>
          </div>

          {/* Period filter: ລາຍວັນ / ອາທິດ / ເດືອນ */}
          <div className="inline-flex rounded-md border border-gray-200 bg-gray-50 p-0.5">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setPeriod(opt.key)}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  period === opt.key
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {accuracyLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2">
            {/* Pie */}
            <div className="h-[300px]">
              <AccuracyPieChart
                data={pieData}
                centerLabel={`${accuracy?.answeredRate ?? 0}%`}
                centerSubLabel="ຕອບໄດ້"
              />
            </div>

            {/* Legend + source breakdown */}
            <div className="space-y-4">
              <div className="space-y-2">
                {pieData.map((slice) => {
                  const pct =
                    accuracyTotal > 0
                      ? Math.round((slice.value / accuracyTotal) * 100)
                      : 0;
                  return (
                    <div
                      key={slice.label}
                      className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2"
                    >
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: slice.color }}
                        />
                        {slice.label}
                      </div>
                      <div className="text-sm font-semibold text-gray-800">
                        {slice.value.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-gray-400">
                          ({pct}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
                ຈາກຄຳຖາມທັງໝົດ{" "}
                <span className="font-semibold text-gray-800">
                  {accuracyTotal.toLocaleString()}
                </span>{" "}
                ຄັ້ງ ຕອບຈາກ FAQ ໂດຍກົງ{" "}
                <span className="font-semibold text-emerald-600">
                  {faqAnswered.toLocaleString()}
                </span>{" "}
                ຄັ້ງ
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart + Recent Data */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Chart */}
        <div className="h-[470px] rounded-md border bg-white text-center p-6">
          <h3 className="mb-4 text-lg font-semibold">
            Speed - 1 Message Chatbot
          </h3>

          <BarChart data={data.charts.speedDistribution ?? []} />
        </div>

        {/* Recent Chat Logs */}
        <div className="rounded-md border bg-white">
          <RecentDataTable data={recentData} pageSize={5} />
        </div>
      </div>
    </div>
  );
}
