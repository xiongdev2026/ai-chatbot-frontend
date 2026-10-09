"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bot,
  X,
  Sparkles,
  MessageSquare,
  Loader2,
  Clock,
  Star,
} from "lucide-react";
import { api } from "@/lib/axios";
import { 
  ensureSession, 
  createSession, 
  bumpSession, 
  renameSessionIfDefault 
} from "@/lib/chatSessions";
import SurveyModal from "@/components/landing/SurveyModal";

interface ChatMessageItem {
  id: string;
  sender: "user" | "bot";
  text: string;
  time?: string;
  loading?: boolean;
  responseTimeMs?: number;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch chat history from server on session load
  const fetchChatHistory = useCallback(async (sid: string) => {
    if (!sid) return;
    try {
      const res = await api.get(`/chat/${sid}`);
      const logs = res.data?.data || res.data || [];
      if (Array.isArray(logs) && logs.length > 0) {
        const formatted: ChatMessageItem[] = logs.flatMap((log: any) => [
          {
            id: `${log.id}-q`,
            sender: "user" as const,
            text: log.question,
            time: new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
          {
            id: `${log.id}-a`,
            sender: "bot" as const,
            text: log.answer,
            time: new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            responseTimeMs: log.responseTimeMs,
          },
        ]);
        setMessages(formatted);
      }
    } catch (err) {
      console.error("Failed to load chat history in widget:", err);
    }
  }, []);

  useEffect(() => {
    const session = ensureSession();
    setSessionId(session.id);
    fetchChatHistory(session.id);
  }, [fetchChatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  useEffect(() => {
    const handleOpenWidget = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.prompt) {
        handleSendMessage(customEvent.detail.prompt);
      }
    };

    const handleOpenSurvey = () => {
      setIsSurveyOpen(true);
    };

    window.addEventListener("open-chatbot-widget", handleOpenWidget);
    window.addEventListener("open-survey-modal", handleOpenSurvey);
    return () => {
      window.removeEventListener("open-chatbot-widget", handleOpenWidget);
      window.removeEventListener("open-survey-modal", handleOpenSurvey);
    };
  }, [messages, loading, sessionId]);

  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend || input).trim();
    if (!question || loading) return;

    setInput("");
    const userMsgId = crypto.randomUUID();
    const botMsgId = crypto.randomUUID();

    const newMessages: ChatMessageItem[] = [
      ...messages,
      {
        id: userMsgId,
        sender: "user",
        text: question,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      {
        id: botMsgId,
        sender: "bot",
        text: "",
        loading: true,
      },
    ];

    setMessages(newMessages);
    setLoading(true);

    const activeSid = sessionId || ensureSession().id;
    bumpSession(activeSid);
    renameSessionIfDefault(activeSid, question);

    try {
      const res = await api.post("/chat", {
        question,
        sessionId: activeSid,
      });

      const answer = res.data?.data?.answer || res.data?.answer || "ຂໍອະໄພ, ບໍ່ສາມາດຕອບຄຳຖາມໄດ້ໃນເວລານີ້.";
      const responseTimeMs = res.data?.data?.responseTimeMs ?? res.data?.responseTimeMs;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? {
              ...msg,
              text: answer,
              loading: false,
              responseTimeMs,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
            : msg
        )
      );
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? {
              ...msg,
              text: "ຂໍອະໄພ, ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ກັບ AI. ກະລຸນາລອງໃໝ່ອີກຄັ້ງ.",
              loading: false,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (actionText: string) => {
    handleSendMessage(actionText);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Popup Window */}
      {isOpen && (
        <div className="mb-4 w-[360px] sm:w-[390px] h-[520px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">

          {/* Header */}
          <div className="bg-[#0070f3] text-white px-4 py-3.5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-wide">
                AI HR Assistant
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/15 text-white/90 hover:text-white transition-colors cursor-pointer"
                aria-label="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">

            {/* Welcome Greeting Card (matches design in image) */}
            <div className="bg-slate-100/90 rounded-2xl p-4 space-y-3 border border-slate-200/60 shadow-xs">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <span>👋</span>
                <span>Welcome to <strong className="font-bold">AI AI-Chatbot (HR)</strong>!</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                I'm here 24/7 to help you with job openings, job descriptions, and applications.
              </p>

              {/* Action Buttons inside Welcome Card */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickAction("Service")}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#22c55e] hover:bg-[#16a34a] text-white transition-all shadow-sm hover:scale-[1.02] active:scale-95"
                >
                  Service
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAction("More Info")}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#64748b] hover:bg-[#475569] text-white transition-all shadow-sm hover:scale-[1.02] active:scale-95"
                >
                  More Info
                </button>
              </div>
            </div>

            {/* Conversation Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${msg.sender === "user"
                      ? "bg-[#0070f3] text-white rounded-br-xs shadow-sm"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs"
                    }`}
                >
                  {msg.loading ? (
                    <div className="flex h-4 items-center space-x-1.5 px-1 py-1">
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-blue-400"
                        style={{ animationDelay: "0ms", animationDuration: "1s" }}
                      />
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-blue-400"
                        style={{ animationDelay: "200ms", animationDuration: "1s" }}
                      />
                      <div
                        className="h-2 w-2 animate-bounce rounded-full bg-blue-400"
                        style={{ animationDelay: "400ms", animationDuration: "1s" }}
                      />
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  )}

                  {msg.sender === "bot" && !msg.loading && typeof msg.responseTimeMs === "number" && (
                    <div className="text-[10px] mt-1 text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>ຕອບໃນ {(msg.responseTimeMs / 1000).toFixed(1)} ວິນາທີ</span>
                    </div>
                  )}

                  {msg.time && !msg.loading && msg.sender === "user" && (
                    <div className="text-[10px] mt-1 text-right text-blue-100">
                      {msg.time}
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area (matches design in image) */}
          <div className="p-3 bg-white border-t border-slate-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Message Input Pill */}
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="w-full text-xs sm:text-sm px-4 py-2.5 bg-white border border-slate-300 rounded-full focus:outline-none focus:border-[#0070f3] focus:ring-1 focus:ring-[#0070f3] text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>

              {/* Send Pill Button */}
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white transition-all shadow-md ${input.trim() && !loading
                    ? "bg-[#0070f3] hover:bg-blue-600 shadow-blue-500/30 hover:scale-105 active:scale-95 cursor-pointer"
                    : "bg-blue-400 opacity-60 cursor-not-allowed"
                  }`}
              >
                Send
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Floating Launcher Pill Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2.5 sm:px-5 sm:py-3 rounded-full shadow-xl shadow-slate-900/15 border border-slate-100 hover:border-blue-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20 active:translate-y-0 cursor-pointer"
          aria-label="Open AI HR Assistant"
        >
          {/* Chatbot Icon */}
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0070f3] via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform duration-300">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[8px] text-white shadow">
              <Sparkles className="w-2.5 h-2.5" />
            </span>
          </div>

          {/* Label & Status */}
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-900 group-hover:text-[#0070f3] transition-colors">
                AI Chatbot
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-medium text-emerald-600">
                Online
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 group-hover:bg-blue-50 group-hover:text-[#0070f3] text-slate-400 transition-colors ml-1">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
        </button>
      )}

      {/* Survey Satisfaction Modal */}
      <SurveyModal
        isOpen={isSurveyOpen}
        onClose={() => setIsSurveyOpen(false)}
        sessionId={sessionId}
      />
    </div>
  );
}
