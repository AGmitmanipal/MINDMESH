"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  FileText,
  Code2,
  Mail,
  Sparkles,
  Cpu,
  Layers,
  Award,
  Zap,
  CheckCircle2,
  UploadCloud
} from "lucide-react";
import { LinkedinIcon, GithubIcon } from "./Icons";
import Hero3D from "./Hero3D";

interface HeroProps {
  onOpenResume?: () => void;
}

export default function Hero({ onOpenResume }: HeroProps) {
  const [profileImgSrc, setProfileImgSrc] = useState<string>("/profile.jpg");
  const [imgLoadError, setImgLoadError] = useState(false);



  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-28 pb-20 overflow-hidden cyber-grid"
    >
      {/* 3D Visual Core in Background */}
      <Hero3D />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center text-center">

          {/* Top Status Pill: MIT & AI Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border-purple-500/30 text-purple-300 text-xs sm:text-sm font-medium mb-8 shadow-lg shadow-purple-950/40 animate-in fade-in slide-in-from-top-3 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 -ml-4" />
            <span className="font-mono text-cyan-300 font-semibold">MIT Manipal &apos;28</span>
            <span className="text-white/30">•</span>
            <span className="text-slate-300">Junior Software Developer | AI & Backend</span>
          </div>

          {/* Avatar Ring Section with 3D styled neon border & glowing hover pulse */}
          <div className="relative mb-8 group">
            {/* Outer Ambient Glow Effect */}
            <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 opacity-60 blur-xl group-hover:opacity-90 transition duration-700 group-hover:blur-2xl" />

            {/* Neon Ring Container */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-[3px] bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-600 avatar-ring-pulse shadow-2xl shadow-purple-900/50">
              <div className="w-full h-full rounded-full bg-[#090d16] p-1.5 overflow-hidden relative flex items-center justify-center">

                {/* Fallback & Image rendering */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profileImgSrc}
                  alt="Anil Ghode"
                  onError={() => {
                    if (!imgLoadError) {
                      setImgLoadError(true);
                      setProfileImgSrc("/avatar.svg");
                    }
                  }}
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                />

                {/* Subtle Scanline Overlay */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent via-cyan-500/10 to-purple-500/20 pointer-events-none" />


              </div>
            </div>

            {/* Floating 3D Status Badge */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-3.5 py-1.5 rounded-full bg-[#0d131f]/90 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-xl shadow-emerald-950/50 flex items-center gap-1.5 group-hover:border-emerald-400 transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>🟢 Open for High-Impact Projects</span>
            </div>
          </div>

          {/* Primary Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4 text-white">
            <span className="block text-gradient">
              Anil Ghode
            </span>
          </h1>

          {/* Kinetic Typography Subtitle */}
          <div className="h-10 sm:h-12 flex items-center justify-center mb-6">
            <div className="flex items-center gap-2 text-lg sm:text-2xl font-mono text-cyan-300 font-semibold tracking-wide">
              <span className="text-purple-400">&gt;</span>
              <span className="relative">
                Engineering Scalable Backends &amp; Autonomous AI Agents
                <span className="inline-block w-2 sm:w-2.5 h-5 bg-cyan-400 ml-1.5 animate-pulse align-middle" />
              </span>
            </div>
          </div>

          {/* Subheading with MIT B.Tech context & Tech Stack */}
          <p className="max-w-3xl text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed mb-8 font-normal">
            B.Tech in <span className="text-white font-medium">Electronics and Communication Engineering</span> at{" "}
            <span className="text-purple-300 font-semibold">Manipal Institute of Technology</span> (CGPA: 8.32 / 10 | Expected 2028).
            Specializing in high-throughput <span className="text-cyan-300 font-medium">FastAPI microservices</span>, distributed database synchronization,
            and autonomous <span className="text-purple-300 font-medium">Agentic AI systems</span> with LangChain, LangGraph &amp; PyTorch.
          </p>

          {/* Dual CTAs & Action Hub */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            {/* CTA 1: Explore Projects */}
            <a
              href="#projects"
              className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-xl shadow-purple-600/30 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span>Explore Projects</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            {/* CTA 2: Download Resume */}
            <button
              onClick={onOpenResume}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl glass-panel hover:bg-white/10 border border-white/15 text-slate-200 hover:text-white font-semibold text-sm transition-all duration-300 hover:border-purple-400/50 hover:shadow-xl hover:shadow-purple-500/20 active:scale-95"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Download Resume</span>
            </button>
          </div>

          {/* Social Profiles Hub */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-14">
            <a
              href="https://github.com/AGmitmanipal"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel hover:border-purple-500/50 hover:bg-purple-950/30 text-slate-300 hover:text-white text-xs font-mono transition-all group"
            >
              <GithubIcon className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">AGmitmanipal</span>
            </a>

            <a
              href="https://linkedin.com/in/anay-ghode"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel hover:border-cyan-500/50 hover:bg-cyan-950/30 text-slate-300 hover:text-white text-xs font-mono transition-all group"
            >
              <LinkedinIcon className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">anay-ghode</span>
            </a>

            <a
              href="https://leetcode.com/u/Anil_Ghode"
              target="_blank"
              rel="noreferrer"
              aria-label="LeetCode"
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel hover:border-amber-500/50 hover:bg-amber-950/30 text-slate-300 hover:text-white text-xs font-mono transition-all group"
            >
              <Code2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Anil_Ghode</span>
            </a>

            <a
              href="mailto:ghodeanay@gmail.com"
              aria-label="Email"
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel hover:border-emerald-500/50 hover:bg-emerald-950/30 text-slate-300 hover:text-white text-xs font-mono transition-all group"
            >
              <Mail className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">ghodeanay@gmail.com</span>
            </a>
          </div>

          {/* Quick Metrics / Proof-of-Work Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
            <div className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-purple-500/40 transition-colors text-left group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono text-slate-400">CGPA (MIT)</span>
                <Award className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">8.32 / 10</div>
              <div className="text-[11px] text-slate-400 mt-1">Electronics &amp; Communication</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-cyan-500/40 transition-colors text-left group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono text-slate-400">Sync Latency</span>
                <Zap className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">&lt;100ms</div>
              <div className="text-[11px] text-slate-400 mt-1">Real-time GoPerch APIs</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-amber-500/40 transition-colors text-left group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono text-slate-400">JEE Main</span>
                <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">Top 8%</div>
              <div className="text-[11px] text-slate-400 mt-1">Nationwide percentile</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-colors text-left group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono text-slate-400">Mentorship</span>
                <Layers className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">50+ Peers</div>
              <div className="text-[11px] text-slate-400 mt-1">The Data Alchemists</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
