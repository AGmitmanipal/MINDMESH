"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AboutSkills from "@/components/AboutSkills";
import Projects from "@/components/Projects";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import Services from "@/components/Services";
import TerminalWidget from "@/components/Terminal";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ResumeModal from "@/components/ResumeModal";

export default function Home() {
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#090d16] text-slate-100 selection:bg-purple-600/30 selection:text-white flex flex-col">
      {/* Top Glassmorphic Navigation Bar */}
      <Navbar
        onOpenResume={() => setIsResumeOpen(true)}
        onOpenTerminal={() => {
          const el = document.getElementById("terminal");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Main Content Sections */}
      <main className="flex-1 w-full">
        {/* 1. Hero Section with 3D Core, Kinetic Typography, Avatar Ring, Dual CTAs & Stats */}
        <Hero onOpenResume={() => setIsResumeOpen(true)} />

        {/* 2. Architecture & Core Skills Matrix + Education & Honors Showcase */}
        <AboutSkills />

        {/* 3. Featured 3D Projects Grid (Smart Parking, Lead Score Agent, Hand Function ML) */}
        <Projects />

        {/* 4. Experience & Education Timeline (GoPerch, The Data Alchemists, MIT Manipal) */}
        <ExperienceTimeline />

        {/* 5. Website Development Services Section */}
        <Services />

        {/* 6. Interactive Terminal Easter Egg CLI Widget */}
        <TerminalWidget />

        {/* 7. Contact & Social Hub */}
        <Contact />
      </main>

      {/* Modern Cyber Footer */}
      <Footer />

      {/* Full-Featured Printable / Downloadable Resume Modal */}
      <ResumeModal
        isOpen={isResumeOpen}
        onClose={() => setIsResumeOpen(false)}
      />
    </div>
  );
}
