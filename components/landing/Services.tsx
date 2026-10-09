"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { ShieldCheck, Loader2, ArrowRight, Ambulance, CalendarCheck, HelpCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ServiceItem {
  id: string;
  name: string;
  shortDescription: string | null;
  fullDescription: string | null;
  category: string;
  isActive: boolean;
}

export default function Services() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await api.get("/services?limit=3");
        const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setServices(list.filter((s: ServiceItem) => s.isActive !== false));
      } catch (err) {
        console.error("Failed to load services:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const openChatWithService = (serviceName: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-chatbot-widget", {
          detail: { prompt: `How does ${serviceName} work?` },
        })
      );
    }
  };

  const getServiceIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("ambulance") || lower.includes("emergency")) {
      return <Ambulance className="w-6 h-6 text-rose-400" />;
    }
    if (lower.includes("appointment") || lower.includes("booking")) {
      return <CalendarCheck className="w-6 h-6 text-blue-400" />;
    }
    if (lower.includes("insurance")) {
      return <ShieldCheck className="w-6 h-6 text-amber-400" />;
    }
    return <HelpCircle className="w-6 h-6 text-indigo-400" />;
  };

  return (
    <section id="services" className="py-20 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hospital Services</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Patient Support & Hospital Services
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            24/7 Ambulance dispatch, insurance consultation, appointment scheduling, and patient assistance.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <Skeleton className="w-12 h-12 rounded-xl bg-slate-800" />
                  <Skeleton className="h-5 w-24 rounded-full bg-slate-800" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4 bg-slate-800 mt-1" />
                  <Skeleton className="h-16 w-full bg-slate-800 mt-2" />
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <Skeleton className="h-11 w-full rounded-xl bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No hospital services available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="group rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between hover:border-blue-500/50 hover:bg-slate-800/80 transition-all duration-300 shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {getServiceIcon(service.name)}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                      {service.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                      {service.shortDescription || service.fullDescription || "Comprehensive healthcare assistance."}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => openChatWithService(service.name)}
                    className="w-full inline-flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-blue-600 hover:text-white text-slate-300 font-medium text-xs transition-all cursor-pointer"
                  >
                    <span>Ask AI Assistant</span>
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
