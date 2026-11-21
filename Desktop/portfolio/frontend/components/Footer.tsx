"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp, Code2, Mail, Heart, Sparkles, Activity } from "lucide-react";
import { LinkedinIcon, GithubIcon } from "./Icons";

export default function Footer() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#05080e] border-t border-white/10 pt-16 pb-12 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-r from-purple-600/10 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/10">
          
          {/* Brand & Mission (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <a href="#hero" className="inline-flex items-center gap-2.5 font-mono text-lg font-bold tracking-wider text-white">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-[1px]">
                <div className="w-full h-full bg-[#090d16] rounded-xl flex items-center justify-center">
                  <span className="text-cyan-400 font-extrabold text-xs">AG</span>
                </div>
              </div>
              <span className="text-white">
                ANIL <span className="text-purple-400">GHODE</span>
              </span>
            </a>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              Junior Software Developer &amp; AI/Backend Engineer. Specializing in high-throughput FastAPI microservices, 
              distributed PostgreSQL state, and autonomous agentic AI graphs.
            </p>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Manipal Institute of Technology &apos;28</span>
              <span className="text-white/20">•</span>
              <span className="text-cyan-400">CGPA: 8.32</span>
            </div>
          </div>

          {/* Quick Nav Links (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-mono">
              <li><a href="#hero" className="hover:text-cyan-400 transition-colors">01. Hero &amp; 3D Core</a></li>
              <li><a href="#about" className="hover:text-cyan-400 transition-colors">02. About &amp; Education</a></li>
              <li><a href="#skills" className="hover:text-cyan-400 transition-colors">03. Tech Stack Matrix</a></li>
              <li><a href="#projects" className="hover:text-cyan-400 transition-colors">04. Featured Projects</a></li>
              <li><a href="#experience" className="hover:text-cyan-400 transition-colors">05. Experience &amp; Honors</a></li>
              <li><a href="#services" className="hover:text-cyan-400 transition-colors">06. Web Services &amp; Pricing</a></li>
              <li><a href="#terminal" className="hover:text-cyan-400 transition-colors">07. Interactive CLI</a></li>
              <li><a href="#contact" className="hover:text-cyan-400 transition-colors">08. Connect &amp; Social</a></li>
            </ul>
          </div>

          {/* Telemetry & System Status (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-slate-300 font-bold">
              System Telemetry
            </h4>

            <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Network Latency</span>
                </span>
                <span className="text-emerald-400 font-bold">14ms (Optimal)</span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Local Time (IST)</span>
                <span className="text-cyan-300 font-bold">{time || "12:00:00 PM"}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Architecture</span>
                <span className="text-purple-300 font-bold">Next.js 16 + R3F + TW4</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://github.com/AGmitmanipal"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/in/anay-ghode"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href="https://leetcode.com/u/Anil_Ghode"
                target="_blank"
                rel="noreferrer"
                aria-label="LeetCode"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-amber-400 transition-colors"
              >
                <Code2 className="w-4 h-4" />
              </a>
              <a
                href="mailto:ghodeanay@gmail.com"
                aria-label="Email"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Anil Ghode. All rights reserved.
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5 hover:border-white/10"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>

      </div>
    </footer>
  );
}
