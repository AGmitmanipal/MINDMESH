"use client";

import React, { useState } from "react";
import { 
  Terminal, 
  Database, 
  Cpu, 
  Code, 
  Server, 
  Bot, 
  Layers, 
  ShieldCheck, 
  GraduationCap, 
  Sparkles, 
  Search, 
  Award, 
  ExternalLink 
} from "lucide-react";

interface SkillItem {
  name: string;
  level: string;
  highlight?: boolean;
}

interface SkillCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  accentColor: string;
  borderGlow: string;
  skills: SkillItem[];
}

export default function AboutSkills() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const skillCategories: SkillCategory[] = [
    {
      id: "backend",
      title: "Backend & Distributed Systems",
      icon: <Server className="w-5 h-5 text-cyan-400" />,
      description: "High-throughput asynchronous APIs, microservices, and live transactional state engines.",
      accentColor: "from-cyan-500/20 to-blue-500/20",
      borderGlow: "group-hover:border-cyan-500/50",
      skills: [
        { name: "FastAPI", level: "Advanced", highlight: true },
        { name: "Node.js", level: "Proficient" },
        { name: "REST APIs", level: "Advanced", highlight: true },
        { name: "Microservices", level: "Proficient", highlight: true },
        { name: "PostgreSQL", level: "Advanced", highlight: true },
        { name: "MongoDB", level: "Proficient" },
        { name: "Supabase", level: "Advanced", highlight: true },
        { name: "Firebase", level: "Proficient" },
        { name: "Real-Time Systems", level: "Advanced", highlight: true },
        { name: "Geofencing", level: "Specialized", highlight: true },
      ],
    },
    {
      id: "ai",
      title: "AI/ML & Agentic Architectures",
      icon: <Bot className="w-5 h-5 text-purple-400" />,
      description: "Autonomous reasoning agents, graph execution workflows, and predictive ML models.",
      accentColor: "from-purple-500/20 to-indigo-500/20",
      borderGlow: "group-hover:border-purple-500/50",
      skills: [
        { name: "PyTorch", level: "Certified", highlight: true },
        { name: "LangChain", level: "Advanced", highlight: true },
        { name: "LangGraph", level: "Certified Agentic AI", highlight: true },
        { name: "n8n Workflow Automation", level: "Proficient", highlight: true },
        { name: "Random Forest Models", level: "Proficient" },
        { name: "Multi-Agent Systems", level: "Specialized", highlight: true },
        { name: "Vector Databases", level: "Proficient" },
        { name: "Prompt Engineering", level: "Advanced" },
      ],
    },
    {
      id: "languages",
      title: "Core Programming Languages",
      icon: <Code className="w-5 h-5 text-amber-400" />,
      description: "Strong foundation in systems programming, object-oriented design, and type-safe scripting.",
      accentColor: "from-amber-500/20 to-orange-500/20",
      borderGlow: "group-hover:border-amber-500/50",
      skills: [
        { name: "Python", level: "Advanced", highlight: true },
        { name: "C++", level: "Proficient", highlight: true },
        { name: "Java", level: "Proficient", highlight: true },
        { name: "TypeScript", level: "Proficient", highlight: true },
        { name: "JavaScript (ES6+)", level: "Advanced" },
        { name: "C", level: "Academic Core" },
      ],
    },
    {
      id: "frontend-tools",
      title: "Frontend, Core CS & Tools",
      icon: <Layers className="w-5 h-5 text-emerald-400" />,
      description: "Cross-platform user interfaces, data structures, algorithm design, and continuous delivery.",
      accentColor: "from-emerald-500/20 to-teal-500/20",
      borderGlow: "group-hover:border-emerald-500/50",
      skills: [
        { name: "React.js", level: "Advanced", highlight: true },
        { name: "React Native", level: "Proficient", highlight: true },
        { name: "Next.js", level: "Advanced", highlight: true },
        { name: "Tailwind CSS", level: "Advanced" },
        { name: "DSA & OOP", level: "Core Strength", highlight: true },
        { name: "Git & GitHub", level: "Daily Driver" },
        { name: "Vercel & CI/CD", level: "Proficient" },
        { name: "Distributed Systems", level: "Specialized", highlight: true },
      ],
    },
  ];

  return (
    <section id="skills" className="relative py-28 cyber-dots">
      {/* Background Section Glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>Technical Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Architecture &amp; <span className="text-gradient">Core Skills</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Bridging hardware intuition from Electronics &amp; Communication with scalable distributed software 
            and autonomous agentic AI models.
          </p>

          {/* Search & Filter Controls */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search skills (e.g. FastAPI, PyTorch)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d131f]/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {[
                { id: "all", label: "All Tech" },
                { id: "backend", label: "Backend" },
                { id: "ai", label: "AI/ML" },
                { id: "languages", label: "Languages" },
                { id: "frontend-tools", label: "Tools & CS" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    selectedCategory === tab.id
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 font-semibold"
                      : "glass-panel text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Tech Pods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {skillCategories
            .filter((cat) => selectedCategory === "all" || selectedCategory === cat.id)
            .map((cat) => {
              const filteredSkills = cat.skills.filter((s) =>
                s.name.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (searchQuery && filteredSkills.length === 0) return null;

              return (
                <div
                  key={cat.id}
                  className={`group relative glass-panel rounded-2xl p-6 sm:p-7 border border-white/10 ${cat.borderGlow} transition-all duration-300 hover:shadow-2xl hover:shadow-purple-950/20`}
                >
                  {/* Subtle Top Gradient Shimmer */}
                  <div
                    className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${cat.accentColor} rounded-t-2xl opacity-60 group-hover:opacity-100 transition-opacity`}
                  />

                  {/* Category Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                        {cat.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {cat.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{cat.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Skill Chips */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {filteredSkills.map((skill) => (
                      <div
                        key={skill.name}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 ${
                          skill.highlight
                            ? "bg-purple-950/40 border border-purple-500/40 text-purple-200 hover:border-purple-400 hover:bg-purple-900/40 shadow-sm"
                            : "bg-white/[0.03] border border-white/10 text-slate-300 hover:border-cyan-500/40 hover:text-white"
                        }`}
                      >
                        {skill.highlight && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-[10px] text-slate-500 border-l border-white/10 pl-1.5">
                          {skill.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Education & Certifications Highlight Card */}
        <div id="about" className="glass-panel-glow rounded-3xl p-6 sm:p-10 border border-purple-500/30 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Academic Credentials */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span>Academic Rigor &amp; Engineering Pedigree</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Electronics &amp; Communication Engineering
              </h3>

              <div className="flex flex-wrap items-center gap-3 text-sm font-mono text-slate-300">
                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-cyan-300">
                  Manipal Institute of Technology
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                  CGPA: 8.32 / 10
                </span>
                <span className="px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300">
                  Class of 2028
                </span>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed">
                Applying deep grounding in digital circuit dynamics, embedded systems, and algorithmic problem-solving 
                to build resilient distributed systems and low-latency microservices that scale under heavy concurrency.
              </p>
            </div>

            {/* Right: Key Verified Achievements */}
            <div className="lg:col-span-5 bg-[#090d16]/80 rounded-2xl p-5 border border-white/10 space-y-3">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Verified Honors &amp; Certifications</span>
              </div>

              <div className="space-y-2.5">
                <a
                  href="https://drive.google.com/file/d/15vBbW3Jw5P3woUCnm1EBC7xoSgrAn3GQ/view"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-amber-500/40 hover:bg-amber-950/20 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-amber-400 font-bold text-sm">🏆</span>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                        Finalist, Samsung PRISM WebAgent Hackathon
                      </div>
                      <div className="text-[11px] text-slate-400">Nationwide autonomous agent hackathon</div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-300 transition-colors shrink-0 ml-2" />
                </a>

                <a
                  href="https://drive.google.com/file/d/1qFVD-Q5yd6PaMW_EUqiGQeAoTWAkTAdj/view"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/40 hover:bg-cyan-950/20 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-cyan-400 font-bold text-sm">🥉</span>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        3rd Place, Manipal BioPharma Hackathon 2026
                      </div>
                      <div className="text-[11px] text-slate-400">Medical AI prediction systems</div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300 transition-colors shrink-0 ml-2" />
                </a>

                <a
                  href="https://www.udemy.com/certificate/UC-9eb95a70-43d5-4d66-b434-61f897b5cf7e/?utm_campaign=email&utm_medium=email&utm_source=sendgrid.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-purple-500/40 hover:bg-purple-950/20 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-purple-400 font-bold text-sm">📜</span>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                        Agentic AI Engineering (LangChain &amp; LangGraph)
                      </div>
                      <div className="text-[11px] text-slate-400">Multi-agent graphs, memory &amp; state persistence</div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-300 transition-colors shrink-0 ml-2" />
                </a>

                <a
                  href="https://www.coursera.org/account/accomplishments/verify/FE8J3OEKM28I"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/40 hover:bg-cyan-950/20 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-cyan-400 font-bold text-sm">🔥</span>
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        PyTorch Fundamentals (DeepLearning.AI)
                      </div>
                      <div className="text-[11px] text-slate-400">Neural network architectures &amp; tensors</div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-300 transition-colors shrink-0 ml-2" />
                </a>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-colors">
                  <span className="text-emerald-400 font-bold text-sm">🎯</span>
                  <div>
                    <div className="text-xs font-semibold text-white">Top 8% Nationwide - JEE Main</div>
                    <div className="text-[11px] text-slate-400">National engineering entrance competitive rank</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
