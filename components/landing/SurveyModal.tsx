"use client";

import { useState } from "react";
import { X, Star, CheckCircle2, MessageSquare, Send, Sparkles } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
}

const QUESTIONS = [
  { id: "q1Overall", label: "1. ທ່ານມີຄວາມເພິ່ງພໍໃຈກັບ chatbot ໂດຍລວມຫຼາຍປານໃດ?" },
  { id: "q2EaseOfUse", label: "2. ການໃຊ້ງານ chatbot ມີຄວາມສະດວກສະບາຍຫຼາຍປານໃດ?" },
  { id: "q3Speed", label: "3. ທ່ານມີຄວາມເພິ່ງພໍໃຈກັບຄວາມໄວໃນການຕອບຂອງ chatbot ຫຼາຍປານໃດ?" },
  { id: "q4Accuracy", label: "4. ຄຳຕອບຂອງ chatbot ມີຄວາມຖືກຕ້ອງ ແລະ ກົງກັບຄວາມຕ້ອງການຫຼາຍປານໃດ?" },
  { id: "q5Understanding", label: "5. chatbot ເຂົ້າໃຈຄຳຖາມຂອງທ່ານໄດ້ດີຫຼາຍປານໃດ?" },
  { id: "q6Clarity", label: "6. ທ່ານມີຄວາມເພິ່ງພໍໃຈກັບຄວາມຈະແຈ້ງຂອງຄຳຕອບຈາກ chatbot ຫຼາຍປານໃດ?" },
  { id: "q7Helpfulness", label: "7. chatbot ມີປະໂຫຍດໃນການແກ້ໄຂບັນຫາ ຫຼື ຕອບຄຳຖາມຂອງທ່ານຫຼາຍປານໃດ?" },
  { id: "q8Utility", label: "8. ທ່ານມີຄວາມເພິ່ງພໍໃຈກັບຄວາມສາມາດຂອງ chatbot ໃນການໃຫ້ຂໍ້ມູນທີ່ມີປະໂຫຍດຫຼາຍປານໃດ?" },
  { id: "q9ReuseIntent", label: "9. ທ່ານຈະກັບມາໃຊ້ງານ chatbot ນີ້ອີກໃນອະນາຄົດບໍ?" },
  { id: "q10Nps", label: "10. ທ່ານມີແນວໂນ້ມທີ່ຈະແນະນຳ chatbot ນີ້ໃຫ້ກັບຜູ້ໃຊ້ອື່ນໆຫຼາຍປານໃດ?" },
];

const RATING_LABELS: Record<number, { text: string; color: string }> = {
  1: { text: "ບໍ່ເພິ່ງພໍໃຈຢ່າງຍິ່ງ", color: "text-red-600 bg-red-50" },
  2: { text: "ບໍ່ເພິ່ງພໍໃຈ", color: "text-orange-600 bg-orange-50" },
  3: { text: "ປານກາງ", color: "text-amber-600 bg-amber-50" },
  4: { text: "ເພິ່ງພໍໃຈ", color: "text-blue-600 bg-blue-50" },
  5: { text: "ເພິ່ງພໍໃຈຢ່າງຍິ່ງ", color: "text-emerald-600 bg-emerald-50" },
};

export default function SurveyModal({ isOpen, onClose, sessionId }: SurveyModalProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [likedMost, setLikedMost] = useState("");
  const [improvement, setImprovement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleRatingChange = (qId: string, value: number) => {
    setRatings((prev) => ({ ...prev, [qId]: value }));
  };

  const answeredCount = Object.keys(ratings).length;
  const isComplete = answeredCount === QUESTIONS.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isComplete) {
      toast.error("ກະລຸນາໃຫ້ຄະແນນຄຳຖາມທັງໝົດ 10 ຂໍ້ ກ່ອນສົ່ງ.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/surveys", {
        sessionId,
        q1Overall: ratings.q1Overall,
        q2EaseOfUse: ratings.q2EaseOfUse,
        q3Speed: ratings.q3Speed,
        q4Accuracy: ratings.q4Accuracy,
        q5Understanding: ratings.q5Understanding,
        q6Clarity: ratings.q6Clarity,
        q7Helpfulness: ratings.q7Helpfulness,
        q8Utility: ratings.q8Utility,
        q9ReuseIntent: ratings.q9ReuseIntent,
        q10Nps: ratings.q10Nps,
        likedMost: likedMost.trim() || undefined,
        improvement: improvement.trim() || undefined,
      });

      setIsSubmitted(true);
      toast.success("ຂໍຂອບໃຈສຳລັບຄຳຕິຊົມຂອງທ່ານ!");
    } catch (err: any) {
      const msg = err.response?.data?.message || "ສົ່ງແບບສຳຫຼວດບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່ອີກຄັ້ງ.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setRatings({});
    setLikedMost("");
    setImprovement("");
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold">ແບບສຳຫຼວດຄວາມເພິ່ງພໍໃຈຂອງຜູ້ໃຊ້ Chatbot</h2>
              <p className="text-xs text-blue-100">ຊ່ວຍພວກເຮົາປັບປຸງປະສົບການຂອງທ່ານໃຫ້ດີຂຶ້ນ</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">ຂໍຂອບໃຈ!</h3>
              <p className="text-gray-600 max-w-md mx-auto text-sm leading-relaxed">
                ຄຳຕອບຂອງທ່ານຖືກສົ່ງຮຽບຮ້ອຍແລ້ວ. ພວກເຮົາຂໍຂອບໃຈຢ່າງຍິ່ງສຳລັບເວລາ ແລະ ຄຳຕິຊົມຂອງທ່ານ ເພື່ອຊ່ວຍພັດທະນາ AI Chatbot ໃຫ້ດີຂຶ້ນ!
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
                >
                  ປິດ
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Scale Legend */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-900">
                <span className="font-semibold">ເກນການໃຫ້ຄະແນນ:</span>
                <div className="flex flex-wrap items-center gap-3">
                  <span>1 = ບໍ່ເພິ່ງພໍໃຈຢ່າງຍິ່ງ</span>
                  <span>3 = ປານກາງ</span>
                  <span>5 = ເພິ່ງພໍໃຈຢ່າງຍິ່ງ</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-gray-500">
                  <span>ສະຖານະການຕອບຄຳຖາມ</span>
                  <span>ຕອບແລ້ວ {answeredCount} ຈາກ {QUESTIONS.length} ຂໍ້</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(answeredCount / QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-5">
                {QUESTIONS.map((q) => {
                  const currentRating = ratings[q.id];
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border transition-all ${currentRating
                          ? "border-blue-200 bg-blue-50/20"
                          : "border-gray-100 bg-white hover:border-gray-200"
                        }`}
                    >
                      <label className="block text-sm font-semibold text-gray-800 mb-3">
                        {q.label}
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {[1, 2, 3, 4, 5].map((val) => {
                          const isSelected = currentRating === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleRatingChange(q.id, val)}
                              className={`flex-1 min-w-[50px] py-2 px-3 rounded-lg font-bold text-sm border transition-all flex items-center justify-center gap-1.5 ${isSelected
                                  ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                }`}
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${isSelected ? "fill-white text-white" : "text-amber-400 fill-amber-400"
                                  }`}
                              />
                              <span>{val}</span>
                            </button>
                          );
                        })}
                      </div>
                      {currentRating && (
                        <p className={`mt-2 text-xs font-medium ${RATING_LABELS[currentRating].color} px-2 py-0.5 rounded inline-block`}>
                          {RATING_LABELS[currentRating].text}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Qualitative Feedback Section */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  ຄຳຕິຊົມເພີ່ມເຕີມ (ບໍ່ບັງຄັບ)
                </h4>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    ສິ່ງທີ່ທ່ານມັກຫຼາຍທີ່ສຸດກ່ຽວກັບ chatbot ແມ່ນຫຍັງ?
                  </label>
                  <textarea
                    rows={2}
                    value={likedMost}
                    onChange={(e) => setLikedMost(e.target.value)}
                    placeholder="ແບ່ງປັນສິ່ງທີ່ທ່ານປະທັບໃຈ..."
                    className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    ສິ່ງໃດທີ່ຄວນໄດ້ຮັບການປັບປຸງ?
                  </label>
                  <textarea
                    rows={2}
                    value={improvement}
                    onChange={(e) => setImprovement(e.target.value)}
                    placeholder="ຂໍ້ສະເໜີແນະໃນການປັບປຸງ..."
                    className="w-full text-sm p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  disabled={!isComplete || isSubmitting}
                  className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl text-white shadow-md transition-all ${isComplete && !isSubmitting
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-95"
                      : "bg-gray-300 cursor-not-allowed"
                    }`}
                >
                  {isSubmitting ? (
                    <span>ກຳລັງສົ່ງ...</span>
                  ) : (
                    <>
                      <span>ສົ່ງແບບສຳຫຼວດ</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
