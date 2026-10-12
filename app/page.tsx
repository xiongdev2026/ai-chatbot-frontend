import Hero from "@/components/landing/Hero";
import Departments from "@/components/landing/Departments";
import Doctors from "@/components/landing/Doctors";
import MedicalServices from "@/components/landing/MedicalServices";
import Services from "@/components/landing/Services";
import ChatbotWidget from "@/components/landing/ChatbotWidget";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 overflow-x-hidden">
      {/* Hero Section */}
      <Hero />

      {/* Clinical Departments Section */}
      <Departments />

      {/* Medical Specialists / Doctors Section */}
      <Doctors />

      {/* Diagnostic & Medical Services */}
      <MedicalServices />

      {/* General Hospital Services (Insurance, Ambulance, Booking) */}
      <Services />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p>© {new Date().getFullYear()} AI Hospital. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs">
            <a href="#departments" className="hover:text-white transition-colors">Departments</a>
            <a href="#doctors" className="hover:text-white transition-colors">Doctors</a>
            <a href="#medical-services" className="hover:text-white transition-colors">Medical Services</a>
            <a href="#services" className="hover:text-white transition-colors">Services</a>
          </div>
        </div>
      </footer>

      {/* Floating Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}
