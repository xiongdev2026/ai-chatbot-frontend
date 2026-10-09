"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/axios";
import BreadcrumbsWithSlashSeparator from "@/components/admin/Breadcrumb";
import QuestionPieChart from "@/components/dashboard/QuestionPieChart";
import RatingPieChart from "@/components/dashboard/RatingPieChart";
import {
  Users,
  Star,
  ThumbsUp,
  ThumbsDown,
  Percent,
  MessageSquare,
  Sparkles,
  Eye,
  X,
  TrendingUp,
  BarChart2,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface QuestionStat {
  id: string;
  key: string;
  label: string;
  avg: number;
}

interface RatingDist {
  rating: number;
  label: string;
  count: number;
}

interface FeedbackItem {
  id: string;
  text: string;
  createdAt: string;
  user: string;
}

interface SurveyItem {
  id: string;
  sessionId: string | null;
  userId: string | null;
  q1Overall: number;
  q2EaseOfUse: number;
  q3Speed: number;
  q4Accuracy: number;
  q5Understanding: number;
  q6Clarity: number;
  q7Helpfulness: number;
  q8Utility: number;
  q9ReuseIntent: number;
  q10Nps: number;
  likedMost: string | null;
  improvement: string | null;
  createdAt: string;
  averageScore?: number;
  user?: {
    id: string;
    fullName?: string;
    email?: string;
  };
}

interface SurveyStats {
  totalEvaluations: number;
  averageScore: number;
  satisfactionRate: number;
  positiveResponses: number;
  neutralResponses: number;
  negativeResponses: number;
  ratingDistribution: RatingDist[];
  questionAverages: QuestionStat[];
  recentEvaluations: SurveyItem[];
  userFeedback: {
    likedMost: FeedbackItem[];
    improvement: FeedbackItem[];
  };
}

const RATING_LABELS: Record<number, { text: string; color: string }> = {
  1: { text: "ບໍ່ເພິ່ງພໍໃຈຢ່າງຍິ່ງ", color: "text-red-600 bg-red-50" },
  2: { text: "ບໍ່ເພິ່ງພໍໃຈ", color: "text-orange-600 bg-orange-50" },
  3: { text: "ປານກາງ", color: "text-amber-600 bg-amber-50" },
  4: { text: "ເພິ່ງພໍໃຈ", color: "text-blue-600 bg-blue-50" },
  5: { text: "ເພິ່ງພໍໃຈຢ່າງຍິ່ງ", color: "text-emerald-600 bg-emerald-50" },
};

type PresetRange = "all" | "today" | "7days" | "30days" | "custom";

export default function AdminSurveysPage() {
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [preset, setPreset] = useState<PresetRange>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedSurvey, setSelectedSurvey] = useState<SurveyItem | null>(null);
  const [activeFeedbackTab, setActiveFeedbackTab] = useState<"liked" | "improvement">("liked");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (startDate) params.startDate = new Date(startDate).toISOString();
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        params.endDate = end.toISOString();
      }

      const res = await api.get("/surveys/stats", { params });
      const data = res.data?.data ?? res.data;
      setStats(data);
    } catch (err: any) {
      if (err?.response?.status !== 401 && err?.response?.status !== 403) {
        toast.error("Failed to load survey dashboard data");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handlePresetChange = (selected: PresetRange) => {
    setPreset(selected);
    const now = new Date();

    if (selected === "all") {
      setStartDate("");
      setEndDate("");
    } else if (selected === "today") {
      const todayStr = now.toISOString().split("T")[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (selected === "7days") {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setStartDate(past.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
    } else if (selected === "30days") {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      setStartDate(past.toISOString().split("T")[0]);
      setEndDate(now.toISOString().split("T")[0]);
    }
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 4.5) return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (score >= 4.0) return "bg-blue-100 text-blue-800 border-blue-300";
    if (score >= 3.0) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const totalRatingCount = stats
    ? stats.ratingDistribution.reduce((acc, curr) => acc + curr.count, 0)
    : 0;

  return (
    <>
      <div className="space-y-8 pb-12">
        {/* Header & Breadcrumb */}
        <div>
          <BreadcrumbsWithSlashSeparator
            items={[
              { label: "Dashboard", href: "/admin" },
              { label: "Satisfaction Surveys", href: "/admin/surveys" },
            ]}
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-md">
                  <Sparkles className="w-6 h-6" />
                </div>
                ແຜງຄວບຄຸມການປະເມິນຄວາມເພິ່ງພໍໃຈ (Satisfaction Survey Dashboard)
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                ສະຫຼຸບຜົນການປະເມິນຄວາມເພິ່ງພໍໃຈ ແລະ ຄຳຕິຊົມຂອງຜູ້ໃຊ້ AI Chatbot
              </p>
            </div>

          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">

            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: "all", label: "ທັງໝົດ (All Time)" },
                { key: "today", label: "ມື້ນີ້ (Today)" },
                { key: "7days", label: "7 ວັນຜ່ານມາ" },
                { key: "30days", label: "30 ວັນຜ່ານມາ" },
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => handlePresetChange(p.key as PresetRange)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${preset === p.key
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Top Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Total Evaluations */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                ຈຳນວນການປະເມິນ
              </p>
              <h3 className="text-2xl font-extrabold text-gray-900 mt-1">
                {stats?.totalEvaluations?.toLocaleString() ?? 0}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Total Evaluations</p>
            </div>
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Average Rating */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                ຄະແນນສະເລ່ຍ
              </p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <h3 className="text-2xl font-extrabold text-gray-900">
                  {stats?.averageScore ?? 0}
                </h3>
                <span className="text-xs text-gray-400 font-bold">/ 5.0</span>
              </div>
              <div className="flex items-center gap-0.5 mt-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${s <= Math.round(stats?.averageScore || 0)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-200 fill-gray-100"
                      }`}
                  />
                ))}
              </div>
            </div>
            <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
              <Star className="w-6 h-6" />
            </div>
          </div>

          {/* Satisfaction Rate */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                ອັດຕາຄວາມເພິ່ງພໍໃຈ
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
                {stats?.satisfactionRate ?? 0}%
              </h3>
              <p className="text-xs text-gray-500 mt-1">Satisfaction Rate</p>
            </div>
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Percent className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Rating Distribution Pie Chart */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-gray-800">
                ເປີເຊັນການກະຈາຍຄະແນນ (Rating Percentage)
              </h3>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Pie Chart
            </span>
          </div>

          <RatingPieChart data={stats?.ratingDistribution || []} height={280} />
        </div>

        {/* Recent Evaluations Table */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900">
                ລາຍການປະເມິນລ່າສຸດ (Recent User Evaluations)
              </h3>
            </div>
            <span className="text-xs text-gray-500 font-semibold">
              {stats?.recentEvaluations.length ?? 0} Latest Submissions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider text-[10px] border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">ວັນທີ (Date)</th>
                  <th className="px-4 py-3">ຜູ້ໃຊ້ / Session</th>
                  <th className="px-4 py-3">ຄະແນນສະເລ່ຍ</th>
                  <th className="px-4 py-3">ສະຖານະ</th>
                  <th className="px-4 py-3">ຄຳຕິຊົມ</th>
                  <th className="px-4 py-3 text-right">ລາຍລະອຽດ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {stats?.recentEvaluations.map((item) => {
                  const dateStr = new Date(item.createdAt).toLocaleString("lo-LA", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  });
                  const avg = item.averageScore || 0;
                  const hasFeedback = !!(item.likedMost || item.improvement);

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap text-gray-500 font-medium">
                        {dateStr}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-gray-800">
                        {item.user?.fullName || item.user?.email || item.sessionId || "Anonymous User"}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-bold text-gray-900">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{avg}</span>
                          <span className="text-[10px] text-gray-400">/ 5</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getScoreBadgeColor(
                            avg
                          )}`}
                        >
                          {avg >= 4.0 ? "ເພິ່ງພໍໃຈ" : avg >= 3.0 ? "ປານກາງ" : "ບໍ່ເພິ່ງພໍໃຈ"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 max-w-[200px] truncate text-gray-500">
                        {hasFeedback ? (
                          <span className="text-indigo-600 font-medium flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            ມີຄຳຕິຊົມ
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedSurvey(item)}
                          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-lg transition-colors flex items-center gap-1 ml-auto text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>ເບິ່ງ</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Qualitative Feedback Tabs */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900">
                ຄຳຕິຊົມ ແລະ ຂໍ້ສະເໜີແນະຈາກຜູ້ໃຊ້ (User Qualitative Feedback)
              </h3>
            </div>

            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveFeedbackTab("liked")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeFeedbackTab === "liked"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                ສິ່ງທີ່ມັກຫຼາຍທີ່ສຸດ ({stats?.userFeedback.likedMost.length || 0})
              </button>
              <button
                onClick={() => setActiveFeedbackTab("improvement")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeFeedbackTab === "improvement"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                ສິ່ງທີ່ຄວນປັບປຸງ ({stats?.userFeedback.improvement.length || 0})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {activeFeedbackTab === "liked" ? (
              stats?.userFeedback.likedMost.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">ຍັງບໍ່ມີຂໍ້ມູນຄຳຕິຊົມ</p>
              ) : (
                stats?.userFeedback.likedMost.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span className="font-bold text-emerald-900">{item.user}</span>
                      <span>
                        {new Date(item.createdAt).toLocaleDateString("lo-LA")}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-800">"{item.text}"</p>
                  </div>
                ))
              )
            ) : stats?.userFeedback.improvement.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">ຍັງບໍ່ມີຂໍ້ສະເໜີແນະໃນການປັບປຸງ</p>
            ) : (
              stats?.userFeedback.improvement.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-amber-50/40 border border-amber-100 space-y-1.5"
                >
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="font-bold text-amber-900">{item.user}</span>
                    <span>
                      {new Date(item.createdAt).toLocaleDateString("lo-LA")}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">"{item.text}"</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Survey Detail Modal */}
      {selectedSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h3 className="text-base font-bold">ລາຍລະອຽດການປະເມິນ (Evaluation Details)</h3>
              <button
                onClick={() => setSelectedSurvey(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="bg-gray-50 p-3.5 rounded-xl space-y-1 text-xs text-gray-600">
                <p>
                  <strong className="text-gray-800">ຜູ້ໃຊ້:</strong>{" "}
                  {selectedSurvey.user?.fullName || selectedSurvey.user?.email || "Anonymous"}
                </p>
                <p>
                  <strong className="text-gray-800">Session ID:</strong>{" "}
                  {selectedSurvey.sessionId || "N/A"}
                </p>
                <p>
                  <strong className="text-gray-800">ວັນທີ:</strong>{" "}
                  {new Date(selectedSurvey.createdAt).toLocaleString("lo-LA")}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  ຄະແນນ 10 ຄຳຖາມ
                </h4>
                {[
                  { label: "1. ຄວາມເພິ່ງພໍໃຈໂດຍລວມ", score: selectedSurvey.q1Overall },
                  { label: "2. ຄວາມງ່າຍໃນການໃຊ້ງານ", score: selectedSurvey.q2EaseOfUse },
                  { label: "3. ຄວາມໄວໃນການຕອບ", score: selectedSurvey.q3Speed },
                  { label: "4. ຄວາມຖືກຕ້ອງຂອງຄຳຕອບ", score: selectedSurvey.q4Accuracy },
                  { label: "5. ຄວາມເຂົ້າໃຈຄຳຖາມ", score: selectedSurvey.q5Understanding },
                  { label: "6. ຄວາມຈະແຈ້ງຂອງຄຳຕອບ", score: selectedSurvey.q6Clarity },
                  { label: "7. ຄວາມມີປະໂຫຍດໃນການແກ້ໄຂບັນຫາ", score: selectedSurvey.q7Helpfulness },
                  { label: "8. ຄວາມມີປະໂຫຍດຂອງຂໍ້ມູນ", score: selectedSurvey.q8Utility },
                  { label: "9. ການກັບມາໃຊ້ງານອີກ", score: selectedSurvey.q9ReuseIntent },
                  { label: "10. ການແນະນຳໃຫ້ຜູ້ໃຊ້ອື່ນ", score: selectedSurvey.q10Nps },
                ].map((q, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-gray-100">
                    <span className="text-gray-700 font-medium">{q.label}</span>
                    <div className="flex items-center gap-1 font-bold text-gray-900">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{q.score} / 5</span>
                    </div>
                  </div>
                ))}
              </div>

              {(selectedSurvey.likedMost || selectedSurvey.improvement) && (
                <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
                  {selectedSurvey.likedMost && (
                    <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                      <p className="font-bold text-emerald-900">ສິ່ງທີ່ມັກຫຼາຍທີ່ສຸດ:</p>
                      <p className="text-gray-800 mt-1">"{selectedSurvey.likedMost}"</p>
                    </div>
                  )}
                  {selectedSurvey.improvement && (
                    <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                      <p className="font-bold text-amber-900">ສິ່ງທີ່ຄວນປັບປຸງ:</p>
                      <p className="text-gray-800 mt-1">"{selectedSurvey.improvement}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedSurvey(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs"
              >
                ປິດ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
