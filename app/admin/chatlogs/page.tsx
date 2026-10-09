"use client";

import { useState, useEffect } from "react";
import DataTable, { Column } from "@/components/admin/DataTable";
import { Eye, Bot, User, X } from "lucide-react";
import { toast } from "react-toastify";
import BreadcrumbsWithSlashSeparator from "@/components/admin/Breadcrumb";
import { api } from "@/lib/axios";
import { format } from "date-fns";
import { getDiffHighlightFuzzy } from "@/lib/diffHighlight";

/**
 * Coerce a chat log's `retrievedChunks` into an array for rendering.
 * Older rows were saved as a JSON *string* (double-encoded), while new rows are
 * proper JSON arrays — accept both, and fall back to [] for null/garbage so the
 * detail view can never crash on `.map()`.
 */
function normalizeDetail(detail: any) {
  if (!detail) return detail;

  let chunks = detail.retrievedChunks;
  if (typeof chunks === "string") {
    try {
      chunks = JSON.parse(chunks);
    } catch {
      chunks = [];
    }
  }

  return {
    ...detail,
    retrievedChunks: Array.isArray(chunks) ? chunks : [],
    // GET /chatlogs/:id includes `feedbacks` (plural); the UI reads `feedback`.
    feedback: detail.feedback ?? detail.feedbacks ?? [],
  };
}

/**
 * How well a logged answer is backed by the knowledge base. A missing canonical
 * answer has two very different causes that must not look alike:
 *
 *  - "none"     → retrieval found nothing at all (confidenceScore 0). The reply is
 *                 ungrounded; the bot should have declined.
 *  - "low"      → retrieval DID find context and the bot answered from it, but the
 *                 best similarity fell under the backend's CANONICAL_ANSWER_THRESHOLD,
 *                 so no single chunk was authoritative enough to diff against.
 *  - "grounded" → a canonical database answer exists to compare word-by-word.
 *
 * Derived from confidenceScore rather than a stored matchType so no schema change is
 * needed, and deliberately tested as `> 0` rather than against a hardcoded 0.70 — the
 * threshold lives in chat.service.ts and must not be duplicated here.
 */
type Grounding = "none" | "low" | "grounded";

function groundingOf(canonical?: string, confidenceScore?: number | null): Grounding {
  if (canonical) return "grounded";
  return (confidenceScore ?? 0) > 0 ? "low" : "none";
}

/**
 * Renders a bot answer with grounding highlights:
 *
 *  - RED (whole answer)    → no data found; nothing here is backed by the database.
 *  - ORANGE (whole answer) → answered from database context, but low confidence.
 *  - YELLOW (per word)     → a database answer exists; only drifted words are marked.
 *
 * Every highlight carries its own background, so the shades stay legible on the light
 * table and the dark detail drawer alike. `title` (not colour alone) carries the
 * meaning for anyone who can't tell the three apart.
 */
function GroundedAnswer({
  answer,
  canonical,
  confidenceScore,
}: {
  answer: string;
  canonical?: string;
  confidenceScore?: number | null;
}) {
  const grounding = groundingOf(canonical, confidenceScore);

  if (grounding !== "grounded") {
    const style =
      grounding === "none"
        ? {
            className: "rounded bg-red-200 px-0.5 text-gray-900",
            title: "ບໍ່ພົບຂໍ້ມູນທີ່ກ່ຽວຂ້ອງໃນຖານຂໍ້ມູນ — ຄຳຕອບນີ້ບໍ່ໄດ້ອ້າງອີງຖານຂໍ້ມູນ",
          }
        : {
            className: "rounded bg-orange-200 px-0.5 text-gray-900",
            title:
              "ຕອບຈາກຂໍ້ມູນໃນຖານຂໍ້ມູນ ແຕ່ຄວາມໝັ້ນໃຈຕ່ຳ — ບໍ່ມີຄຳຕອບຫຼັກທີ່ຊັດເຈນພໍໃຫ້ປຽບທຽບ",
          };

    return (
      <span className={style.className} title={style.title}>
        {answer}
      </span>
    );
  }

  return (
    <>
      {getDiffHighlightFuzzy(answer, canonical!).map((token, idx) => (
        <span
          key={idx}
          className={token.isDifferent ? "rounded bg-yellow-200 px-0.5 text-gray-900" : ""}
          title={token.isDifferent ? "ຕ່າງຈາກຄຳຕອບໃນຖານຂໍ້ມູນ" : undefined}
        >
          {token.text}
        </span>
      ))}
    </>
  );
}

export default function ChatLogsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ sessionId: "" });

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      query.append("limit", "200");
      if (filters.sessionId) query.append("sessionId", filters.sessionId);

      const { data: resData } = await api.get(`/chatlogs?${query.toString()}`);
      setData(resData.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  const viewDetail = async (id: string) => {
    setIsDetailOpen(true);
    setDetailLoading(true);

    try {
      const { data: resData } = await api.get(`/chatlogs/${id}`);
      setDetailData(normalizeDetail(resData.data));
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message);
      setIsDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return format(new Date(time), "yyyy-MM-dd HH:mm:ss");
  };

  const columns: Column<any>[] = [
    {
      key: "question",
      label: "Question",
      className: "w-[300px] min-w-[300px]",
      render: (row) => (
        <div className="line-clamp-2 whitespace-normal">{row.question}</div>
      ),
    },
    {
      key: "answer",
      label: "Answer (vs Database)",
      className: "w-[500px] min-w-[500px]",
      render: (row) => (
        <div className="line-clamp-2 whitespace-normal">
          <GroundedAnswer
            answer={row.answer}
            canonical={row.canonicalAnswer}
            confidenceScore={row.confidenceScore}
          />
        </div>
      ),
    },
    {
      key: "canonicalAnswer",
      label: "Database Answer",
      className: "w-[400px] min-w-[400px]",
      render: (row) =>
        row.canonicalAnswer ? (
          <div className="line-clamp-2 whitespace-normal text-gray-500">{row.canonicalAnswer}</div>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      key: "confidenceScore",
      label: "Confidence",
      render: (row) =>
        row.confidenceScore != null
          ? `${(row.confidenceScore * 100).toFixed(0)}%`
          : "—",
    },
    {
      key: "createdAt",
      label: "Time",
      render: (row) => formatTime(row.createdAt),
    },
  ];

  const actions = (row: any) => (
    <div className="flex items-center justify-end gap-2">
      <button
        onClick={() => viewDetail(row.id)}
        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white/10 hover:text-indigo-400"
      >
        <Eye className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="w-full border-b border-gray-200 bg-white px-4 py-6 rounded-md">
          <BreadcrumbsWithSlashSeparator
            items={[
              { label: "Dashboard", href: "/admin" },
              { label: "Chatlogs", href: "/admin/chatlogs" },
            ]}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        searchKeys={["question", "answer"]}
        actions={actions}
      />

      {/* DETAIL MODAL */}
      {isDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsDetailOpen(false)}
          />

          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-md border border-white/[0.08] bg-[#1c1933] shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Conversation Detail
                </h2>
                <p className="text-sm text-gray-400">
                  Session ID: {detailData?.sessionId ?? "—"}
                </p>
              </div>

              <button
                onClick={() => setIsDetailOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailLoading ? (
                <div className="text-center text-gray-500 py-10">
                  Loading conversation history...
                </div>
              ) : (
                <>
                  {/* CONVERSATION */}
                  <div className="space-y-4">
                    {(() => {
                      // 1. ດຶງຂໍ້ມູນ Array ອອກມາໃຫ້ໄດ້ກ່ອນ (ຮອງຮັບທັງແບບ Array ໂດຍກົງ ແລະ ແບບ Object)
                      const messages = Array.isArray(detailData)
                        ? detailData
                        : detailData?.conversationContext ||
                          detailData?.history ||
                          // The detail endpoint returns a single chat log with
                          // its own question/answer — render it as one turn.
                          (detailData?.question || detailData?.answer
                            ? [detailData]
                            : []);

                      // 2. ເປີດກວດສອບໂຄງສ້າງແທ້ໆຢູ່ໃນ Browser Console (F12)
                      console.log("ໂຄງສ້າງຂໍ້ມູນ Chat ທີ່ດຶງມາໄດ້:", messages);

                      if (!messages || messages.length === 0) {
                        return (
                          <div className="text-center text-gray-500 py-6 text-sm">
                            ບໍ່ພົບປະຫວັດການສົນທະນາ.
                          </div>
                        );
                      }

                      return messages.map((msg: any, index: number) => {
                        // 👉 ຮູບແບບທີ 1: ຖ້າ Backend ສົ່ງມາເປັນ Object ທີ່ມີທັງ question ແລະ answer ຢູ່ຮ່ວມກັນ
                        if (msg.question || msg.answer) {
                          return (
                            <div
                              key={msg.id ?? index}
                              className="space-y-3 border-b border-white/5 pb-3 last:border-0"
                            >
                              {/* ຂໍ້ຄວາມຂອງ USER */}
                              {msg.question && (
                                <div className="flex justify-end">
                                  <div className="flex items-start gap-3 max-w-[85%]">
                                    <div className="rounded-md rounded-tr-sm bg-indigo-600 px-4 py-2.5 text-sm text-white">
                                      {msg.question}
                                    </div>
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 mt-1">
                                      <User className="h-4 w-4 text-gray-300" />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* ຂໍ້ຄວາມຂອງ BOT */}
                              {msg.answer && (
                                <div className="flex justify-start">
                                  <div className="flex items-start gap-3 max-w-[85%]">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mt-1">
                                      <Bot className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="rounded-md rounded-tl-sm border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white">
                                      <GroundedAnswer
                                        answer={msg.answer}
                                        canonical={msg.canonicalAnswer}
                                        confidenceScore={msg.confidenceScore}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* CANONICAL ANSWER (Database) */}
                              {msg.canonicalAnswer && (
                                <div className="flex justify-start mt-2">
                                  <div className="text-xs text-gray-400 italic ml-11">
                                    📚 Database: {msg.canonicalAnswer}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        }

                        // 👉 ຮູບແບບທີ 2: ຖ້າ Backend ສົ່ງມາເປັນແບບແຍກລາຍການ Role (ຮູບແບບມາດຕະຖານ AI)
                        const role =
                          msg.role?.toLowerCase() ||
                          msg.sender?.toLowerCase() ||
                          "";
                        const isUser = role === "user" || role === "customer";

                        // ຮອງຮັບການເກັບຂໍ້ຄວາມແບບ Gemini (msg.parts[0].text) ຫຼື ແບບທົ່ວໄປ (msg.content / msg.text)
                        const content =
                          msg.content ||
                          msg.text ||
                          (msg.parts && msg.parts[0]?.text) ||
                          "";

                        return (
                          <div
                            key={msg.id ?? index}
                            className="flex flex-col gap-1"
                          >
                            {isUser ? (
                              /* USER (ຂວາ) */
                              <div className="flex justify-end">
                                <div className="flex items-start gap-3 max-w-[85%]">
                                  <div className="rounded-md rounded-tr-sm bg-indigo-600 px-4 py-2.5 text-sm text-white">
                                    {content}
                                  </div>
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 mt-1">
                                    <User className="h-4 w-4 text-gray-300" />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* BOT (ຊ້າຍ) */
                              <div className="flex justify-start">
                                <div className="flex items-start gap-3 max-w-[85%]">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mt-1">
                                    <Bot className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="rounded-md rounded-tl-sm border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-200">
                                    <GroundedAnswer
                                      answer={content}
                                      canonical={msg.canonicalAnswer}
                                      confidenceScore={msg.confidenceScore}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* FEEDBACK */}
                  {detailData?.feedback?.length > 0 && (
                    <div className="mt-4 rounded-xl border border-white/10 bg-amber-500/5 p-4">
                      <h3 className="text-sm font-semibold text-amber-500/80 mb-2">
                        User Feedback
                      </h3>

                      {detailData.feedback.map((f: any, i: number) => (
                        <div key={f.id ?? i} className="text-sm">
                          <span className="text-gray-300">
                            Rating: {f.rating}/5
                          </span>
                          {f.comment && (
                            <p className="text-gray-400 mt-1 italic">
                              &quot;{f.comment}&quot;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
