"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Activity, Loader2, ArrowRight, CheckCircle2, Hospital } from "lucide-react";

interface MedicalService {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  department?: {
    id: string;
    name: string;
  };
}

export default function MedicalServices() {
  const [medicalServices, setMedicalServices] = useState<MedicalService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMedicalServices() {
      try {
        const res = await api.get("/medical-services?limit=3");
        const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setMedicalServices(list.filter((s: MedicalService) => s.isActive !== false));
      } catch (err) {
        console.error("Failed to load medical services:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMedicalServices();
  }, []);

  const openChatWithService = (serviceName: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-chatbot-widget", {
          detail: { prompt: `How can I get or prepare for ${serviceName}?` },
        })
      );
    }
  };

  return (
    <section id="medical-services" className="py-20 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            <span>Clinical Treatments</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Medical & Diagnostic Services
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            High-precision medical procedures, diagnostic scans, and wellness check-ups tailored to your health requirements.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-emerald-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : medicalServices.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No medical services listed at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicalServices.map((service) => (
              <div
                key={service.id}
                className="group rounded-2xl bg-slate-800/80 border border-slate-700/60 p-6 flex flex-col justify-between hover:border-emerald-500/50 hover:bg-slate-800 transition-all duration-300 shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <Activity className="w-5 h-5" />
                    </div>
                    {service.department && (
                      <span className="text-[11px] font-semibold text-emerald-400/90 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        {service.department.name}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors pt-1">
                    {service.name}
                  </h3>

                  <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                    {service.description || "Specialized hospital diagnostic and medical procedure."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/50">
                  <button
                    type="button"
                    onClick={() => openChatWithService(service.name)}
                    className="w-full inline-flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/5 hover:bg-emerald-600 hover:text-white text-slate-300 font-medium text-xs transition-all cursor-pointer"
                  >
                    <span>Check with AI</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
