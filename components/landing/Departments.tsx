"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Building2, Clock, MapPin, Loader2, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Department {
  id: string;
  name: string;
  description: string | null;
  openingHours: string | null;
  location: string | null;
  isActive: boolean;
}

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await api.get("/departments?limit=3");
        const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setDepartments(list.filter((d: Department) => d.isActive !== false));
      } catch (err) {
        console.error("Failed to load departments:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDepartments();
  }, []);

  const openChatWithTopic = (deptName: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-chatbot-widget", {
          detail: { prompt: `Tell me about the ${deptName} department` },
        })
      );
    }
  };

  return (
    <section id="departments" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Clinical Departments</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Specialized Care Centers
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Explore our state-of-the-art medical departments dedicated to delivering excellence in patient care and diagnosis.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-slate-800/80 border border-slate-700/60 p-6 flex flex-col space-y-4 shadow-sm">
                <Skeleton className="w-12 h-12 rounded-xl bg-slate-700" />
                <Skeleton className="h-6 w-3/4 bg-slate-700" />
                <Skeleton className="h-16 w-full bg-slate-700 mt-2" />
                <div className="mt-6 pt-4 border-t border-slate-700/50 space-y-3">
                  <Skeleton className="h-4 w-2/3 bg-slate-700" />
                  <Skeleton className="h-4 w-1/2 bg-slate-700" />
                  <Skeleton className="h-9 w-full rounded-lg bg-slate-700 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No departments available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="group relative rounded-2xl bg-slate-800/80 border border-slate-700/60 p-6 flex flex-col justify-between hover:border-blue-500/50 hover:bg-slate-800 transition-all duration-300 shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {dept.name}
                    </h3>
                    <p className="text-sm text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                      {dept.description || "Comprehensive clinical care and diagnostics."}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/50 space-y-2 text-xs text-slate-400">
                  {dept.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{dept.location}</span>
                    </div>
                  )}
                  {dept.openingHours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{dept.openingHours}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => openChatWithTopic(dept.name)}
                    className="mt-3 w-full inline-flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-blue-600 hover:text-white text-slate-300 font-medium text-xs transition-all cursor-pointer"
                  >
                    <span>Inquire with AI</span>
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
