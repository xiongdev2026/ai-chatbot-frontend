"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Clock,
  Sparkles,
  Building2,
  Info,
  Zap,
  Star,
  Stethoscope,
  HeartPulse,
  ChevronRight,
} from "lucide-react";

export default function Hero() {
  const responseSpeed = "1-2";

  const openChatbot = (initialPrompt?: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("open-chatbot-widget", { detail: { prompt: initialPrompt } })
      );
    }
  };

  const openSurvey = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-survey-modal"));
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-slate-950 text-white">
      {/* Background Image with Next/Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hospital.webp"
          alt="Hospital"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-105 animate-in fade-in duration-1000"
        />
        {/* Soft Dark & Blue Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-blue-950/80 to-slate-900/60" />
        <div className="absolute inset-0 bg-radial-at-t from-blue-600/20 via-transparent to-black/60" />
      </div>

      {/* Top Header / Navigation Bar */}
      <header className="relative z-10 w-full border-b border-white/10 backdrop-blur-md bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0070f3] to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                AI <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-400/20">Hospital</span>
              </span>
              <p className="text-[11px] text-blue-200/70 font-medium">Asia Investment & Development Co.</p>
            </div>
          </Link>

          {/* Nav items */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-200">
            <Link href="/" className="text-white font-semibold hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link href="#departments" className="hover:text-blue-400 transition-colors">
              Departments
            </Link>
            <Link href="#doctors" className="hover:text-blue-400 transition-colors">
              Doctors
            </Link>
            <Link href="#services" className="hover:text-blue-400 transition-colors">
              Services
            </Link>
            <button
              type="button"
              onClick={openSurvey}
              className="text-slate-200 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Survey</span>
            </button>
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openSurvey}
              className="md:hidden inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-amber-300 border border-white/15 transition-all cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>Survey</span>
            </button>

            <button
              type="button"
              onClick={() => openChatbot()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#0070f3] hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all duration-200 hover:shadow-blue-600/50 hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Talk to AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Content */}
      <main className="relative z-10 flex-1 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 w-full">
          <div className="max-w-3xl space-y-8">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-200 backdrop-blur-md text-xs sm:text-sm font-medium shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-700">
              <span className="text-base">🏥</span>
              <span>Welcome to <strong className="text-white font-semibold">AI Hospital</strong></span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] drop-shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-800">
              Your Health, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-200">
                Our Priority
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-200/90 leading-relaxed max-w-2xl font-normal drop-shadow animate-in fade-in slide-in-from-bottom-5 duration-900">
              We provide comprehensive medical care with experienced doctors, modern departments, and a wide range of medical services — available 24/7 through our AI assistant.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              {/* Primary Button: Service */}
              <button
                type="button"
                onClick={() => openChatbot("Service")}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold bg-[#22c55e] hover:bg-[#16a34a] text-white shadow-xl shadow-emerald-600/30 transition-all duration-200 hover:shadow-2xl hover:shadow-emerald-600/50 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <HeartPulse className="w-5 h-5" />
                <span>Service</span>
              </button>

              {/* Secondary Button: More Info */}
              <button
                type="button"
                onClick={() => openChatbot("More Info")}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-[#64748b]/80 hover:bg-[#475569] text-white border border-white/20 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-lg cursor-pointer"
              >
                <Info className="w-4 h-4 text-slate-200" />
                <span>More Info</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
            </div>

            {/* Trust Highlights */}
            <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-4 sm:gap-8 max-w-xl text-slate-200 animate-in fade-in duration-1000 delay-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-400/20 text-blue-400">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-white">10+</h4>
                  <p className="text-[11px] sm:text-xs text-slate-300">Doctors</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-cyan-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-white">24/7</h4>
                  <p className="text-[11px] sm:text-xs text-slate-300">AI Assistant</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-400/20 text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-white">{responseSpeed}s</h4>
                  <p className="text-[11px] sm:text-xs text-slate-300">ຕອບໃນ {responseSpeed} ວິນາທີ</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Bottom Info Strip */}
      {/* <div className="relative z-10 w-full bg-slate-950/40 backdrop-blur-lg border-t border-white/10 py-3 text-xs text-slate-300/80 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-between items-center gap-2">
          <span>📍 AI Tower, Lane Xang Avenue, Vientiane, Lao PDR</span>
          <span className="hidden sm:inline">🕒 Mon - Fri (8:00 - 17:00) | Emergency & AI Chatbot 24/7</span>
          <span>📧 Contact: info@aihospital.la</span>
        </div>
      </div> */}
    </div>
  );
}
