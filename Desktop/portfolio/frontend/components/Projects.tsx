"use client";

import React, { useState } from "react";
import { 
  FolderGit2, 
  ExternalLink, 
  Sparkles, 
  Zap, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Code2, 
  X,
  Cpu,
  CheckCircle2,
  Car,
  Bot,
  HeartPulse,
  Play,
  RotateCcw,
  Navigation,
  Sliders,
  SendHorizontal
} from "lucide-react";
import { GithubIcon } from "./Icons";

interface Project {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  icon: React.ReactNode;
  tags: string[];
  metrics: string;
  status: string;
  statusColor: string;
  accentGradient: string;
  glowColor: string;
  githubUrl: string;
  liveUrl?: string;
  summary: string;
  architecturalHighlights: string[];
  systemWorkflow: string[];
}

export default function Projects() {
  const [activeModalProject, setActiveModalProject] = useState<Project | null>(null);
  const [activeSimTab, setActiveSimTab] = useState<string>("smart-parking");

  // --- 1. Smart Parking Interactive State ---
  const [parkingSlots, setParkingSlots] = useState<{ id: string; status: "available" | "occupied" | "reserved" }[]>([
    { id: "A-01", status: "available" },
    { id: "A-02", status: "occupied" },
    { id: "B-01", status: "available" },
    { id: "B-02", status: "available" },
    { id: "C-01", status: "occupied" },
    { id: "C-02", status: "available" },
  ]);
  const [geofenceActive, setGeofenceActive] = useState<boolean>(true);
  const [simLatency, setSimLatency] = useState<number>(38);
  const [parkingMessage, setParkingMessage] = useState<string>("System Ready • Supabase Realtime channel connected");

  const toggleSlot = (id: string) => {
    setParkingSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === id) {
          const next = slot.status === "available" ? "reserved" : slot.status === "reserved" ? "available" : "occupied";
          return { ...slot, status: next };
        }
        return slot;
      })
    );
    const newLat = 25 + Math.floor(Math.random() * 25);
    setSimLatency(newLat);
    setParkingMessage(`Slot ${id} updated via FastAPI WebSocket • Broadcasted in ${newLat}ms`);
  };

  // --- 2. Lead Score Agent Interactive State ---
  const [companySize, setCompanySize] = useState<string>("Enterprise (500+)");
  const [budget, setBudget] = useState<string>("$50,000 - $100,000");
  const [visits, setVisits] = useState<number>(18);
  const [agentRunning, setAgentRunning] = useState<boolean>(false);
  const [agentStep, setAgentStep] = useState<number>(0);
  const [leadResult, setLeadResult] = useState<{ score: number; verdict: string; tier: string } | null>({
    score: 94,
    verdict: "High Purchase Intent • Automatic Sales Routing",
    tier: "Tier 1 Priority A",
  });

  const runLeadAgent = () => {
    setAgentRunning(true);
    setAgentStep(1);
    setLeadResult(null);

    setTimeout(() => {
      setAgentStep(2);
      setTimeout(() => {
        setAgentStep(3);
        setTimeout(() => {
          setAgentRunning(false);
          const base = visits > 15 ? 50 : 30;
          const budgetBonus = budget.includes("50,000") || budget.includes("100,000") ? 35 : 20;
          const finalScore = Math.min(99, base + budgetBonus + (companySize.includes("Enterprise") ? 14 : 8));
          setLeadResult({
            score: finalScore,
            verdict: finalScore > 80 ? "Hot Prospect • Immediate AE Callback" : "Nurture Prospect • Scheduled Follow-up",
            tier: finalScore > 80 ? "Tier 1 Priority" : "Tier 2 Mid-Priority",
          });
        }, 600);
      }, 700);
    }, 600);
  };

  // --- 3. Hand Function ML Interactive State ---
  const [gripStrength, setGripStrength] = useState<number>(72);
  const [nerveVelocity, setNerveVelocity] = useState<number>(54);
  const [weeksPostOp, setWeeksPostOp] = useState<number>(8);

  // Compute Random Forest regression prediction approximation
  const calculatedRecovery = Math.min(
    99.2,
    Math.max(
      20.0,
      Number((gripStrength * 0.45 + nerveVelocity * 0.35 + weeksPostOp * 2.2 + 8).toFixed(1))
    )
  );

  const projects: Project[] = [
    {
      id: "smart-parking",
      title: "Smart Parking System",
      subtitle: "Real-Time Distributed Geospatial Platform",
      category: "Distributed Systems & Backend",
      icon: <Car className="w-6 h-6 text-cyan-400" />,
      tags: ["React Native", "FastAPI", "PostgreSQL", "Supabase", "REST APIs", "Geofencing"],
      metrics: "Sub-100ms Live Sync Latency",
      status: "Production Ready",
      statusColor: "emerald",
      accentGradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
      glowColor: "group-hover:border-cyan-500/50 group-hover:shadow-cyan-500/20",
      githubUrl: "https://github.com/AGmitmanipal",
      liveUrl: "https://smart-parking--t488dtvb0a.expo.app/",
      summary:
        "Built a real-time distributed parking platform with live availability at sub-100ms synchronization latency and tested, debugged backend services for reservation management.",
      architecturalHighlights: [
        "Built asynchronous FastAPI REST and WebSocket microservices managing concurrent slot reservations with zero lock collisions.",
        "Implemented PostgreSQL transactional locking with Supabase Realtime pub/sub channels ensuring sub-100ms multi-client synchronization.",
        "Engineered background geofencing protocols within the React Native client for automated proximity check-in and checkout.",
        "Tested and deployed on Expo with live mobile app container.",
      ],
      systemWorkflow: [
        "Geofence Detection: React Native GPS triggers background proximity boundary handshake.",
        "FastAPI Ingestion: Asynchronous worker validates reservation token and slot state.",
        "PostgreSQL & Supabase: Distributed atomic commit emits realtime WebSocket broadcast.",
        "Client UI: Instantaneous slot status rerender across all connected mobile dashboards.",
      ],
    },
    {
      id: "lead-score-agent",
      title: "Lead Score Agent",
      subtitle: "Autonomous AI/ML Lead Qualification Engine",
      category: "Agentic AI & Workflow Automation",
      icon: <Bot className="w-6 h-6 text-purple-400" />,
      tags: ["React.js", "AI/ML Integration", "n8n", "LangChain", "Git"],
      metrics: "Automated Multi-Factor Scoring",
      status: "Active Deployment",
      statusColor: "purple",
      accentGradient: "from-purple-500/20 via-indigo-500/10 to-transparent",
      glowColor: "group-hover:border-purple-500/50 group-hover:shadow-purple-500/20",
      githubUrl: "https://github.com/AGmitmanipal/lead-score-agent",
      liveUrl: "https://github.com/AGmitmanipal/lead-score-agent",
      summary:
        "Developed an AI/ML lead scoring platform that ranks CRM leads by behavioral and business metrics, with interactive sales dashboards and multi-agent workflow pipelines.",
      architecturalHighlights: [
        "Architected multi-agent graph pipelines that ingest raw CRM prospect data and query external web signals to compute predictive propensity scores.",
        "Integrated n8n automation loops with custom LangChain reasoning prompts to eliminate manual qualification delays.",
        "Constructed a reactive analytics dashboard in React.js featuring real-time lead status triage and scoring heatmaps.",
        "Engineered robust schema validation and webhook retry fallbacks with exponential backoff.",
      ],
      systemWorkflow: [
        "CRM Ingestion: Webhooks dispatch prospect metadata directly to n8n orchestration node.",
        "Agent Enrichment: Autonomous LangChain worker queries firmographic data and intent signals.",
        "Heuristic & ML Scoring: Multi-factor algorithm grades budget, authority, and behavioral fit.",
        "Actionable Dispatch: High-intent leads automatically routed to account executives in real-time.",
      ],
    },
    {
      id: "hand-function-prediction",
      title: "Hand Function Prediction System",
      subtitle: "Clinical Post-Injury Recovery ML Model",
      category: "Machine Learning & Healthcare AI",
      icon: <HeartPulse className="w-6 h-6 text-amber-400" />,
      tags: ["Python", "FastAPI", "Machine Learning", "Random Forest", "Medical Datasets"],
      metrics: "Validated with Medical Professionals",
      status: "Validated Research",
      statusColor: "amber",
      accentGradient: "from-amber-500/20 via-orange-500/10 to-transparent",
      glowColor: "group-hover:border-amber-500/50 group-hover:shadow-amber-500/20",
      githubUrl: "https://github.com/AGmitmanipal/Hand-Writing-Device-",
      liveUrl: "https://github.com/AGmitmanipal/Hand-Writing-Device-",
      summary:
        "Built and optimized a Random Forest model to predict injured-hand functionality scores from medical datasets; validated with medical professionals.",
      architecturalHighlights: [
        "Trained an ensemble Random Forest regression and classification model on comprehensive clinical medical datasets.",
        "Validated prognostic feature correlations with medical professionals to ensure clinical applicability.",
        "Wrapped trained models in a high-speed FastAPI inference microservice for instantaneous clinical diagnostic scoring.",
        "Demonstrated high feature correlation and explainability across post-operative rehab timelines.",
      ],
      systemWorkflow: [
        "Clinical Data Input: Patient motor metrics, nerve response, and demographic attributes uploaded.",
        "Preprocessing Pipeline: Normalized feature scaling, missing value imputation, and correlation filtering.",
        "Model Inference: Random Forest ensemble calculates expected functional rehabilitation trajectory.",
        "Diagnostic Report: Structured JSON output with confidence intervals and critical feature impact weights.",
      ],
    },
  ];

  return (
    <section id="projects" className="relative py-28 cyber-grid">
      {/* Background Accent Glows */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-purple-500/30 text-purple-400 text-xs font-mono uppercase tracking-widest mb-4">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Featured Engineering Work</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            High-Impact <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Real-world systems engineered with sub-100ms sync latency, autonomous AI multi-agent workflows, 
            and clinical machine learning models with verified repositories &amp; live deployments.
          </p>
        </div>

        {/* 3D-Tilt Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className={`group relative glass-panel rounded-3xl p-7 border border-white/10 ${proj.glowColor} transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl flex flex-col justify-between`}
            >
              {/* Card Top Glow Accent */}
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${proj.accentGradient} rounded-t-3xl opacity-60 group-hover:opacity-100 transition-opacity`}
              />

              <div>
                {/* Header: Icon + Status Pill */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {proj.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-white/[0.04] border border-white/10 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {proj.status}
                    </span>
                  </div>
                </div>

                {/* Category & Title */}
                <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1.5 font-semibold">
                  {proj.category}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {proj.title}
                </h3>
                <p className="text-xs text-purple-300 font-mono mb-4">{proj.subtitle}</p>

                {/* Summary */}
                <p className="text-slate-300 text-sm leading-relaxed mb-6 font-normal">
                  {proj.summary}
                </p>

                {/* Performance Metric Badge */}
                <div className="mb-6 p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-mono text-slate-200 font-medium">
                    {proj.metrics}
                  </span>
                </div>

                {/* Tech Chips */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {proj.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-white/5 border border-white/10 text-slate-300 group-hover:border-purple-500/30 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setActiveSimTab(proj.id);
                    const el = document.getElementById("interactive-lab");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 py-1.5 hover:underline"
                >
                  <Play className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                  <span>Interactive Sandbox</span>
                </button>

                <div className="flex items-center gap-2">
                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`GitHub repo for ${proj.title}`}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
                    title="View GitHub Repository"
                  >
                    <GithubIcon className="w-4 h-4" />
                  </a>

                  {proj.liveUrl && (
                    <a
                      href={proj.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Live Deployment for ${proj.title}`}
                      className="p-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 hover:text-white transition-colors"
                      title={proj.id === "smart-parking" ? "Open Live Expo App" : "Open Project Repo / App"}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* --- DEDICATED INTERACTIVE WORKFLOW LAB: "SHOW HOW IT WORKS" --- */}
        <div id="interactive-lab" className="glass-panel-glow rounded-3xl p-6 sm:p-10 border border-cyan-500/30 relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>Live Interactive Architecture Lab</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                See How The Systems Work In Real-Time
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Direct functional simulations showcasing backend latency, agentic reasoning loops, and ML inference.
              </p>
            </div>

            {/* Simulation Tab Switcher */}
            <div className="flex flex-wrap gap-2 bg-[#090d16] p-1.5 rounded-2xl border border-white/10 shrink-0">
              <button
                onClick={() => setActiveSimTab("smart-parking")}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 ${
                  activeSimTab === "smart-parking"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Smart Parking (Live)</span>
              </button>

              <button
                onClick={() => setActiveSimTab("lead-score-agent")}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 ${
                  activeSimTab === "lead-score-agent"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Lead Score Agent</span>
              </button>

              <button
                onClick={() => setActiveSimTab("hand-function")}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-2 ${
                  activeSimTab === "hand-function"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Hand Function ML</span>
              </button>
            </div>
          </div>

          {/* SIMULATION 1: SMART PARKING */}
          {activeSimTab === "smart-parking" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Sync Latency:</span>
                    <span className="text-emerald-400 font-bold">{simLatency}ms</span>
                  </div>

                  <button
                    onClick={() => setGeofenceActive(!geofenceActive)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all ${
                      geofenceActive
                        ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                        : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Geofence: {geofenceActive ? "INSIDE (150m)" : "OUTSIDE RANGE"}</span>
                  </button>
                </div>

                <a
                  href="https://smart-parking--t488dtvb0a.expo.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-semibold shadow-lg shadow-cyan-600/30 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Launch Live Expo App (smart-parking--t488dtvb0a.expo.app)</span>
                </a>
              </div>

              {/* Visual Parking Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {parkingSlots.map((slot) => {
                  const isAvailable = slot.status === "available";
                  const isReserved = slot.status === "reserved";
                  return (
                    <button
                      key={slot.id}
                      onClick={() => toggleSlot(slot.id)}
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between h-28 ${
                        isAvailable
                          ? "bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400 hover:scale-105"
                          : isReserved
                          ? "bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-500/20 animate-pulse"
                          : "bg-white/[0.02] border-white/10 opacity-70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-bold text-white">{slot.id}</span>
                        <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-emerald-400" : isReserved ? "bg-cyan-400" : "bg-red-400"}`} />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Status</div>
                        <div className={`text-xs font-bold font-mono ${isAvailable ? "text-emerald-400" : isReserved ? "text-cyan-300" : "text-slate-400"}`}>
                          {isAvailable ? "FREE" : isReserved ? "RESERVED" : "OCCUPIED"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-[#090d16] border border-white/10 text-xs font-mono text-cyan-300 flex items-center justify-between">
                <span>{parkingMessage}</span>
                <span className="text-slate-500 text-[11px] hidden sm:inline">Click any bay to trigger atomic PostgreSQL locking</span>
              </div>
            </div>
          )}

          {/* SIMULATION 2: LEAD SCORE AGENT */}
          {activeSimTab === "lead-score-agent" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">Company Size</label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full bg-[#090d16] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-purple-400 focus:outline-none"
                  >
                    <option>Startup (&lt;50)</option>
                    <option>Mid-Market (50-500)</option>
                    <option>Enterprise (500+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">Annual Budget</label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-[#090d16] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-purple-400 focus:outline-none"
                  >
                    <option>&lt; $10,000</option>
                    <option>$10,000 - $50,000</option>
                    <option>$50,000 - $100,000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">Web Telemetry Visits ({visits})</label>
                  <input
                    type="range"
                    min="1"
                    max="40"
                    value={visits}
                    onChange={(e) => setVisits(Number(e.target.value))}
                    className="w-full accent-purple-500 mt-2"
                  />
                </div>
              </div>

              {/* Execution Steps */}
              <div className="p-4 rounded-2xl bg-[#090d16] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                  <span className={`px-2.5 py-1 rounded-lg border ${agentStep >= 1 ? "bg-purple-950/40 border-purple-500 text-purple-300" : "bg-white/5 border-white/10 text-slate-500"}`}>
                    1. Ingestion (n8n Webhook)
                  </span>
                  <span className="text-slate-600">→</span>
                  <span className={`px-2.5 py-1 rounded-lg border ${agentStep >= 2 ? "bg-indigo-950/40 border-indigo-500 text-indigo-300" : "bg-white/5 border-white/10 text-slate-500"}`}>
                    2. LangChain Enrichment
                  </span>
                  <span className="text-slate-600">→</span>
                  <span className={`px-2.5 py-1 rounded-lg border ${agentStep >= 3 ? "bg-cyan-950/40 border-cyan-500 text-cyan-300" : "bg-white/5 border-white/10 text-slate-500"}`}>
                    3. Propensity Scoring
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={runLeadAgent}
                    disabled={agentRunning}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-mono text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{agentRunning ? "Evaluating..." : "Run Agent Loop"}</span>
                  </button>

                  <a
                    href="https://github.com/AGmitmanipal/lead-score-agent"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white"
                    title="View GitHub Repository"
                  >
                    <GithubIcon className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Output Result */}
              {leadResult && (
                <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/40 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono text-purple-400 font-semibold">{leadResult.tier}</span>
                    <h4 className="text-xl font-bold text-white mt-0.5">{leadResult.verdict}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono text-slate-400">Calculated Score</span>
                    <div className="text-3xl font-extrabold font-mono text-cyan-400">{leadResult.score} / 100</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SIMULATION 3: HAND FUNCTION PREDICTION ML */}
          {activeSimTab === "hand-function" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">Pinch Grip Strength:</span>
                    <span className="text-amber-400 font-bold">{gripStrength}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={gripStrength}
                    onChange={(e) => setGripStrength(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">Measured via dynamometer sensors</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">Nerve Velocity:</span>
                    <span className="text-cyan-400 font-bold">{nerveVelocity} m/s</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    value={nerveVelocity}
                    onChange={(e) => setNerveVelocity(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">Electromyogram conduction metric</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300">Recovery Duration:</span>
                    <span className="text-purple-400 font-bold">{weeksPostOp} Weeks</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="24"
                    value={weeksPostOp}
                    onChange={(e) => setWeeksPostOp(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">Post-operative rehabilitation time</span>
                </div>
              </div>

              {/* Live Inference Output */}
              <div className="p-6 rounded-2xl bg-[#090d16] border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                    <HeartPulse className="w-4 h-4 text-amber-400" />
                    <span>Random Forest Ensemble Prognosis</span>
                  </div>
                  <h4 className="text-xl font-bold text-white">
                    {calculatedRecovery > 75
                      ? "Favorable Functional Recovery Projected"
                      : "Moderate Rehabilitation Assistance Required"}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Validated with clinical practitioners for explainable post-trauma assessment.
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-400">Predicted Score</div>
                    <div className="text-3xl font-extrabold font-mono text-amber-400">
                      {calculatedRecovery} <span className="text-sm text-slate-500">/ 100</span>
                    </div>
                  </div>

                  <a
                    href="https://github.com/AGmitmanipal/Hand-Writing-Device-"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-white font-mono text-xs font-semibold transition-all"
                  >
                    <GithubIcon className="w-4 h-4" />
                    <span>GitHub Repo</span>
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Architecture Deep Dive Modal */}
      {activeModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#0d131f] border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/60 max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setActiveModalProject(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                {activeModalProject.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{activeModalProject.title}</h3>
                <p className="text-xs font-mono text-cyan-400">{activeModalProject.subtitle}</p>
              </div>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {activeModalProject.summary}
            </p>

            {/* Architectural Highlights */}
            <div className="mb-6">
              <h4 className="text-xs font-mono text-purple-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Core Engineering Highlights</span>
              </h4>
              <ul className="space-y-2.5">
                {activeModalProject.architecturalHighlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* System Pipeline / Workflow */}
            <div className="mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <h4 className="text-xs font-mono text-cyan-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Execution Pipeline</span>
              </h4>
              <div className="space-y-2 font-mono text-xs text-slate-400">
                {activeModalProject.systemWorkflow.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-purple-400 font-bold">0{idx + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Tech Tags & Direct Links */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-1.5">
                {activeModalProject.tags.map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-white/5 text-slate-300 border border-white/10">
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {activeModalProject.liveUrl && (
                  <a
                    href={activeModalProject.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-lg shadow-cyan-600/30"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Live Project</span>
                  </a>
                )}

                <a
                  href={activeModalProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/30"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>View Repository</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
