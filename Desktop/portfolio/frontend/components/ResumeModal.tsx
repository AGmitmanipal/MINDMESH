"use client";

import React, { useEffect } from "react";
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  ExternalLink, 
  Mail, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  Award, 
  Code,
  FileDown
} from "lucide-react";
import { LinkedinIcon, GithubIcon } from "./Icons";

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0d131f] border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-950/70 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Controls Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#090d16] border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span className="font-mono text-sm font-bold text-white">
              AnilGhodeResume.pdf
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/AnilGhodeResume.docx"
              download="AnilGhodeResume.docx"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 hover:bg-cyan-900/40 text-cyan-300 text-xs font-mono transition-colors"
              title="Download Original Resume (.docx)"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download .DOCX</span>
            </a>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono transition-colors"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              aria-label="Close Resume"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Resume Content Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 font-sans space-y-8 bg-[#090d16]/60">
          
          {/* Header */}
          <div className="border-b border-white/15 pb-6 flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                ANIL ALIAS ANAY AMRISH GHODE
              </h1>
              <p className="text-lg text-cyan-400 font-mono font-medium mt-1">
                Junior Software Developer | B.Tech in Electronics and Communication Engineering, Manipal Institute of Technology
              </p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Margao, Goa, India &amp; Manipal, Karnataka
              </p>

              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-400" />
                  <a href="mailto:ghodeanay@gmail.com" className="hover:underline text-cyan-300">ghodeanay@gmail.com</a>
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  <a href="tel:+919420954029" className="hover:underline text-slate-200">+91-9420954029</a>
                </span>
                <span className="flex items-center gap-1.5">
                  <GithubIcon className="w-3.5 h-3.5 text-slate-400" />
                  <a href="http://github.com/AGmitmanipal" target="_blank" rel="noreferrer" className="hover:underline text-purple-300">github.com/AGmitmanipal</a>
                </span>
                <span className="flex items-center gap-1.5">
                  <LinkedinIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <a href="http://linkedin.com/in/anay-ghode" target="_blank" rel="noreferrer" className="hover:underline text-cyan-300">linkedin.com/in/anay-ghode</a>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">LC</span>
                  <a href="http://leetcode.com/u/Anil_Ghode/" target="_blank" rel="noreferrer" className="hover:underline text-amber-300">leetcode.com/u/Anil_Ghode</a>
                </span>
              </div>
            </div>

            <div className="shrink-0 self-start sm:self-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-1 bg-gradient-to-tr from-purple-500 to-cyan-400 shadow-xl shadow-purple-950/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/profile.jpg"
                  alt="Anil alias Anay Amrish Ghode"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="space-y-2">
            <h2 className="text-sm font-mono uppercase tracking-widest text-slate-300 font-bold">
              Professional Summary
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Junior Software Developer and B.Tech student (CGPA 8.32/10) with strong programming fundamentals in Java, C++, and C, solid Data Structures and Algorithms (DSA), Object-Oriented Programming (OOP), and software development fundamentals. Hands-on experience in API development and backend development using Python, FastAPI, PostgreSQL, and Git version control, including testing, debugging, and optimizing live applications with sub-100ms latency.
            </p>
          </div>

          {/* Education */}
          <div className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-widest text-purple-400 font-bold flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              <span>Education</span>
            </h2>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="flex flex-wrap items-center justify-between font-bold text-white text-base">
                <span>Manipal Institute of Technology (MIT)</span>
                <span className="text-xs font-mono text-cyan-400">2024 – 2028</span>
              </div>
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-300">
                <span>B.Tech in Electronics and Communication Engineering</span>
                <span className="font-mono text-emerald-400 font-semibold">CGPA: 8.32 / 10</span>
              </div>
            </div>
          </div>

          {/* Work Experience */}
          <div className="space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span>Professional Experience</span>
            </h2>

            {/* GoPerch */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex flex-wrap items-center justify-between text-sm font-bold text-white">
                <span>Web Developer Intern — GoPerch</span>
                <span className="text-xs font-mono text-purple-300">Jul 2025 – Present | Manipal, Hybrid</span>
              </div>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 leading-relaxed">
                <li>Developed, tested, and debugged real-time features and backend APIs using FastAPI, PostgreSQL, Supabase, and React Native, achieving sub-100ms synchronization latency across distributed clients.</li>
                <li>Implemented geofencing-based location services and optimized backend API performance, improving reliability and scalability across the SDLC.</li>
                <li>Collaborated with engineers using Git version control to resolve bugs, streamline deployment workflows, and improve release velocity.</li>
              </ul>
            </div>

            {/* The Data Alchemists */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex flex-wrap items-center justify-between text-sm font-bold text-white">
                <span>Management Committee Member — The Data Alchemists</span>
                <span className="text-xs font-mono text-purple-300">Aug 2025 – Jun 2026 | Manipal, On-site</span>
              </div>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 leading-relaxed">
                <li>Mentored 50+ students in Python and web development through project-based lessons on data structures, algorithms, and problem solving.</li>
                <li>Coordinated student teams to organize technical events, workshops, and coding competitions.</li>
              </ul>
            </div>
          </div>

          {/* Key Projects */}
          <div className="space-y-4">
            <h2 className="text-sm font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-2">
              <Code className="w-4 h-4" />
              <span>Projects (With Verified URLs)</span>
            </h2>

            {/* Smart Parking */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex flex-wrap items-center justify-between text-sm font-bold text-white">
                <span>Smart Parking System</span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://smart-parking--t488dtvb0a.expo.app/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Live Expo App</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                React Native, FastAPI, PostgreSQL, Supabase, REST APIs
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Built a real-time distributed parking platform with live availability at sub-100ms synchronization latency and tested, debugged backend services for reservation management.
              </p>
            </div>

            {/* Hand Function */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex flex-wrap items-center justify-between text-sm font-bold text-white">
                <span>Hand Function Prediction System</span>
                <a
                  href="https://github.com/AGmitmanipal/Hand-Writing-Device-"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-mono text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Python, FastAPI, Machine Learning, Random Forest
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Built and optimized a Random Forest model to predict injured-hand functionality scores from medical datasets; validated with medical professionals.
              </p>
            </div>

            {/* Lead Score Agent */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex flex-wrap items-center justify-between text-sm font-bold text-white">
                <span>Lead Score Agent</span>
                <a
                  href="https://github.com/AGmitmanipal/lead-score-agent"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-mono text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                React.js, AI/ML Integration, n8n, Git
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Developed an AI/ML lead scoring platform that ranks CRM leads by behavioral and business metrics, with interactive sales dashboards.
              </p>
            </div>
          </div>

          {/* Core Technical Skills */}
          <div className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-widest text-emerald-400 font-bold">
              Technical Skills
            </h2>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 space-y-2 font-mono">
              <p><span className="text-white font-bold">Languages:</span> Java, C++, C, Python, JavaScript, TypeScript</p>
              <p><span className="text-white font-bold">Core CS:</span> Data Structures and Algorithms (DSA), Object-Oriented Programming (OOP), Software Development Fundamentals, Debugging, Code Optimization, Distributed Systems</p>
              <p><span className="text-white font-bold">Backend and Databases:</span> API Development, REST APIs, Backend Development, Microservices, FastAPI, Node.js, PostgreSQL, MongoDB, Supabase, Firebase, Real-Time Systems, Geofencing</p>
              <p><span className="text-white font-bold">Frontend, Tools, AI/ML:</span> React.js, React Native, Next.js, HTML5, CSS3, Tailwind CSS, Git, GitHub, Version Control, Code Review, Software Testing, SDLC, Vercel, PyTorch, LangChain, LangGraph, n8n</p>
            </div>
          </div>

          {/* Awards & Achievements with Verified Links */}
          <div className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-widest text-amber-300 font-bold flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Awards &amp; Achievements</span>
            </h2>
            <div className="space-y-2 text-xs text-slate-300 font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span>Finalist, Samsung PRISM WebAgent Hackathon — AI-powered automation agent</span>
                <a
                  href="https://drive.google.com/file/d/15vBbW3Jw5P3woUCnm1EBC7xoSgrAn3GQ/view"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold shrink-0 ml-2"
                >
                  <span>Credential</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span>3rd Place, Manipal BioPharma Hackathon 2026 — healthcare/biotech solution</span>
                <a
                  href="https://drive.google.com/file/d/1qFVD-Q5yd6PaMW_EUqiGQeAoTWAkTAdj/view"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold shrink-0 ml-2"
                >
                  <span>Credential</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span>JEE Main Examination — top 8% of candidates nationwide</span>
              </div>
            </div>
          </div>

          {/* Certifications with Verified Links */}
          <div className="space-y-3">
            <h2 className="text-sm font-mono uppercase tracking-widest text-purple-400 font-bold flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Verified Certifications</span>
            </h2>
            <div className="space-y-2 text-xs text-slate-300 font-mono">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span>Agentic AI Engineering with LangChain and LangGraph, Udemy (2026)</span>
                <a
                  href="https://www.udemy.com/certificate/UC-9eb95a70-43d5-4d66-b434-61f897b5cf7e/?utm_campaign=email&utm_medium=email&utm_source=sendgrid.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-300 hover:underline flex items-center gap-1 font-semibold shrink-0 ml-2"
                >
                  <span>Credential</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span>PyTorch: Fundamentals, DeepLearning.AI (May 2026)</span>
                <a
                  href="https://www.coursera.org/account/accomplishments/verify/FE8J3OEKM28I"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-300 hover:underline flex items-center gap-1 font-semibold shrink-0 ml-2"
                >
                  <span>Credential</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span>Unsupervised Machine Learning for Customer Segmentation, Coursera (May 2026)</span>
                <a
                  href="https://www.coursera.org/account/accomplishments/verify/XYH7MYQ4PFQR"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-300 hover:underline flex items-center gap-1 font-semibold shrink-0 ml-2"
                >
                  <span>Credential</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <span>Business Analyst Experience Certification, Finlatics (Jan 2025)</span>
                <a
                  href="https://drive.google.com/file/d/1ouOzPtO85kTCKjCUcHgUfvXl-98jm3Du/view?usp=sharing"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-300 hover:underline flex items-center gap-1 font-semibold shrink-0 ml-2"
                >
                  <span>Credential</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#090d16] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-xs font-mono text-slate-500">
            Updated from AnilGhodeResume.docx • Verified Profile
          </span>

          <div className="flex items-center gap-2">
            <a
              href="/AnilGhodeResume.docx"
              download="AnilGhodeResume.docx"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-mono transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download .docx</span>
            </a>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg shadow-purple-600/30"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
