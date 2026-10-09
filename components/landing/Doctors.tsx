"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { Stethoscope, UserCheck, Loader2, ArrowRight, Award } from "lucide-react";

interface Doctor {
  id: string;
  fullName: string;
  specialty: string;
  bio: string | null;
  isActive: boolean;
  department?: {
    id: string;
    name: string;
  };
}

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await api.get("/doctors?limit=3");
        const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setDoctors(list.filter((d: Doctor) => d.isActive !== false));
      } catch (err) {
        console.error("Failed to load doctors:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, []);

  const openChatWithDoctor = (docName: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-chatbot-widget", {
          detail: { prompt: `Tell me about ${docName} and appointment schedule` },
        })
      );
    }
  };

  return (
    <section id="doctors" className="py-20 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Medical Specialists</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Meet Our Doctors & Specialists
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Our experienced team of board-certified physicians is committed to providing compassionate and world-class healthcare.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-cyan-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No doctors listed at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => {
              // Extract initials
              const initials = doctor.fullName
                .replace(/^Dr\.\s*/i, "")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <div
                  key={doctor.id}
                  className="group rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all duration-300 shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 font-bold text-lg group-hover:scale-105 transition-transform shadow-inner">
                        {initials || "DR"}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {doctor.fullName}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                            {doctor.specialty}
                          </span>
                        </div>
                      </div>
                    </div>

                    {doctor.department && (
                      <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-blue-400" />
                        <span>Department: <strong className="text-slate-300">{doctor.department.name}</strong></span>
                      </div>
                    )}

                    <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                      {doctor.bio || "Dedicated specialist providing personalized consultation and treatment."}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => openChatWithDoctor(doctor.fullName)}
                      className="w-full inline-flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 font-semibold text-xs transition-all cursor-pointer"
                    >
                      <span>Ask AI about {doctor.fullName.split(" ")[0] || "Doctor"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
