"use client";

import React, { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, Maximize2, Minimize2, Sparkles, CornerDownLeft, Copy, Check } from "lucide-react";
import confetti from "canvas-confetti";

interface CommandHistory {
  id: number;
  command: string;
  output: React.ReactNode;
}

export default function TerminalWidget() {
  const [inputVal, setInputVal] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [copied, setCopied] = useState(false);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandList, setCommandList] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initialHistory: CommandHistory[] = [
    {
      id: 1,
      command: "welcome",
      output: (
        <div className="space-y-1 font-mono text-xs text-slate-300">
          <p className="text-cyan-400 font-bold">
            ⚡ Welcome to Anil Ghode&apos;s Interactive Cyber Terminal v2.4.0
          </p>
          <p className="text-slate-400">
            Type <span className="text-purple-400 font-semibold">&apos;help&apos;</span> to view available system commands or click a chip below.
          </p>
        </div>
      ),
    },
  ];

  const [history, setHistory] = useState<CommandHistory[]>(initialHistory);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"],
    });
  };

  const handleCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    setCommandList((prev) => [...prev, cmd]);
    setHistoryIndex(-1);

    let output: React.ReactNode = null;

    switch (cmd) {
      case "help":
        output = (
          <div className="font-mono text-xs space-y-1.5 text-slate-300">
            <p className="text-purple-300 font-bold">AVAILABLE COMMANDS:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-slate-300">
              <div><span className="text-cyan-400 font-semibold">help</span> : Show this command index</div>
              <div><span className="text-cyan-400 font-semibold">skills</span> : Output verified tech stack</div>
              <div><span className="text-cyan-400 font-semibold">experience</span> : Print GoPerch &amp; MIT credentials</div>
              <div><span className="text-cyan-400 font-semibold">projects</span> : List core production systems</div>
              <div><span className="text-cyan-400 font-semibold">services</span> : Web development packages &amp; pricing</div>
              <div><span className="text-cyan-400 font-semibold">achievements</span> : Hackathon honors &amp; rankings</div>
              <div><span className="text-cyan-400 font-semibold">contact</span> : Print direct communication channels</div>
              <div><span className="text-cyan-400 font-semibold">stats</span> : System latency &amp; academic metrics</div>
              <div><span className="text-cyan-400 font-semibold">sudo hire</span> : Request interview / hire trigger 🎉</div>
              <div><span className="text-cyan-400 font-semibold">clear</span> : Clear terminal output window</div>
            </div>
          </div>
        );
        break;

      case "skills":
        output = (
          <div className="font-mono text-xs space-y-2 text-slate-300">
            <p className="text-cyan-400 font-bold">[ENGINEERING TECH STACK MATRIX]</p>
            <div>
              <span className="text-purple-400 font-semibold">• Languages: </span>
              Java, C++, C, Python, JavaScript, TypeScript
            </div>
            <div>
              <span className="text-purple-400 font-semibold">• Backend &amp; DB: </span>
              FastAPI, Node.js, REST APIs, Microservices, PostgreSQL, MongoDB, Supabase, Firebase, Real-Time Systems, Geofencing
            </div>
            <div>
              <span className="text-purple-400 font-semibold">• Frontend &amp; AI: </span>
              React.js, React Native, Next.js, Tailwind CSS, PyTorch, LangChain, LangGraph, n8n
            </div>
            <div>
              <span className="text-purple-400 font-semibold">• Core CS &amp; Tools: </span>
              Data Structures &amp; Algorithms, OOP, Git, Vercel, Distributed Systems
            </div>
          </div>
        );
        break;

      case "experience":
        output = (
          <div className="font-mono text-xs space-y-2 text-slate-300">
            <p className="text-cyan-400 font-bold">[CAREER &amp; EDUCATION]</p>
            <div className="p-2 rounded bg-white/[0.03] border border-white/5">
              <span className="text-emerald-400 font-semibold">1. Web Developer Intern @ GoPerch (Jul 2025 – Present)</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Real-time FastAPI backend, PostgreSQL, Supabase, React Native client (sub-100ms sync latency, geofencing).
              </p>
            </div>
            <div className="p-2 rounded bg-white/[0.03] border border-white/5">
              <span className="text-purple-400 font-semibold">2. Management Committee @ The Data Alchemists (Aug 2025 – Jun 2026)</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Mentored 50+ students in Python, Data Structures &amp; web architecture.
              </p>
            </div>
            <div className="p-2 rounded bg-white/[0.03] border border-white/5">
              <span className="text-amber-400 font-semibold">3. Manipal Institute of Technology (2024 – Expected 2028)</span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                B.Tech in Electronics &amp; Communication Engineering | CGPA: 8.32 / 10.
              </p>
            </div>
          </div>
        );
        break;

      case "projects":
        output = (
          <div className="font-mono text-xs space-y-2 text-slate-300">
            <p className="text-cyan-400 font-bold">[VERIFIED PRODUCTION REPOSITORIES &amp; APPS]</p>
            <div className="p-2 rounded bg-white/[0.03] border border-white/5 space-y-1">
              <p className="text-white font-semibold">1. Smart Parking System</p>
              <p className="text-[11px] text-slate-400">React Native, FastAPI, PostgreSQL, Supabase, REST APIs</p>
              <p>• Live App: <a href="https://smart-parking--t488dtvb0a.expo.app/" target="_blank" rel="noreferrer" className="text-cyan-300 underline">https://smart-parking--t488dtvb0a.expo.app/</a></p>
            </div>
            <div className="p-2 rounded bg-white/[0.03] border border-white/5 space-y-1">
              <p className="text-white font-semibold">2. Hand Function Prediction System</p>
              <p className="text-[11px] text-slate-400">Python, FastAPI, Machine Learning, Random Forest</p>
              <p>• GitHub: <a href="https://github.com/AGmitmanipal/Hand-Writing-Device-" target="_blank" rel="noreferrer" className="text-purple-300 underline">https://github.com/AGmitmanipal/Hand-Writing-Device-</a></p>
            </div>
            <div className="p-2 rounded bg-white/[0.03] border border-white/5 space-y-1">
              <p className="text-white font-semibold">3. Lead Score Agent</p>
              <p className="text-[11px] text-slate-400">React.js, AI/ML Integration, n8n, Git</p>
              <p>• GitHub: <a href="https://github.com/AGmitmanipal/lead-score-agent" target="_blank" rel="noreferrer" className="text-cyan-300 underline">https://github.com/AGmitmanipal/lead-score-agent</a></p>
            </div>
          </div>
        );
        break;

      case "services":
        output = (
          <div className="font-mono text-xs space-y-2 text-slate-300">
            <p className="text-cyan-400 font-bold">[WEBSITE DEVELOPMENT SERVICES]</p>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold">Business Websites</span>
                <span className="text-emerald-400 font-semibold">Starting at ₹8,999</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tailored for coaching centres, local businesses &amp; independent professionals.
              </p>
              <div className="text-[11px] text-slate-300 space-y-0.5 pt-1">
                <p>• Up to 5 pages (Home, About, Services/Courses, Contact)</p>
                <p>• Mobile-friendly responsive design</p>
                <p>• WhatsApp &amp; direct contact links</p>
                <p>• Hosting setup assistance &amp; custom domain connection</p>
                <p>• 2 rounds of revisions before launch</p>
                <p>• 30 days of post-launch bug fixing &amp; issue support</p>
              </div>
              <div className="pt-1.5 border-t border-white/5 text-[10px] text-purple-300">
                Need changes after launch? Contact anytime for a quote based on requirements. No monthly maintenance contracts.
              </div>
            </div>
          </div>
        );
        break;

      case "links":
        output = (
          <div className="font-mono text-xs space-y-2 text-slate-300">
            <p className="text-cyan-400 font-bold">[ALL EXTRACTED CV LINKS &amp; CREDENTIALS]</p>
            <p>• Smart Parking Live App: <a href="https://smart-parking--t488dtvb0a.expo.app/" target="_blank" rel="noreferrer" className="text-cyan-300 underline">smart-parking--t488dtvb0a.expo.app</a></p>
            <p>• Hand Function Repo: <a href="https://github.com/AGmitmanipal/Hand-Writing-Device-" target="_blank" rel="noreferrer" className="text-purple-300 underline">github.com/AGmitmanipal/Hand-Writing-Device-</a></p>
            <p>• Lead Score Agent Repo: <a href="https://github.com/AGmitmanipal/lead-score-agent" target="_blank" rel="noreferrer" className="text-cyan-300 underline">github.com/AGmitmanipal/lead-score-agent</a></p>
            <p>• Samsung PRISM Credential: <a href="https://drive.google.com/file/d/15vBbW3Jw5P3woUCnm1EBC7xoSgrAn3GQ/view" target="_blank" rel="noreferrer" className="text-amber-300 underline">drive.google.com/file/d/15vBbW3Jw5P3woUCnm1EBC7xoSgrAn3GQ</a></p>
            <p>• BioPharma 3rd Place: <a href="https://drive.google.com/file/d/1qFVD-Q5yd6PaMW_EUqiGQeAoTWAkTAdj/view" target="_blank" rel="noreferrer" className="text-amber-300 underline">drive.google.com/file/d/1qFVD-Q5yd6PaMW_EUqiGQeAoTWAkTAdj</a></p>
            <p>• Agentic AI Udemy Cert: <a href="https://www.udemy.com/certificate/UC-9eb95a70-43d5-4d66-b434-61f897b5cf7e/?utm_campaign=email&utm_medium=email&utm_source=sendgrid.com" target="_blank" rel="noreferrer" className="text-purple-300 underline">udemy.com/certificate/UC-9eb95a70...</a></p>
            <p>• PyTorch Coursera Cert: <a href="https://www.coursera.org/account/accomplishments/verify/FE8J3OEKM28I" target="_blank" rel="noreferrer" className="text-cyan-300 underline">coursera.org/account/accomplishments/verify/FE8J3OEKM28I</a></p>
            <p>• Unsupervised ML Cert: <a href="https://www.coursera.org/account/accomplishments/verify/XYH7MYQ4PFQR" target="_blank" rel="noreferrer" className="text-cyan-300 underline">coursera.org/account/accomplishments/verify/XYH7MYQ4PFQR</a></p>
            <p>• Finlatics BA Cert: <a href="https://drive.google.com/file/d/1ouOzPtO85kTCKjCUcHgUfvXl-98jm3Du/view?usp=sharing" target="_blank" rel="noreferrer" className="text-amber-300 underline">drive.google.com/file/d/1ouOzPtO85kTCKjCUcHgUfvXl-98jm3Du</a></p>
          </div>
        );
        break;

      case "certifications":
      case "certs":
        output = (
          <div className="font-mono text-xs space-y-2 text-slate-300">
            <p className="text-purple-400 font-bold">[VERIFIED TECHNICAL CERTIFICATIONS]</p>
            <p>1. Agentic AI Engineering (Udemy, 2026) — <a href="https://www.udemy.com/certificate/UC-9eb95a70-43d5-4d66-b434-61f897b5cf7e/?utm_campaign=email&utm_medium=email&utm_source=sendgrid.com" target="_blank" rel="noreferrer" className="text-purple-300 underline">View Credential</a></p>
            <p>2. PyTorch: Fundamentals (DeepLearning.AI, May 2026) — <a href="https://www.coursera.org/account/accomplishments/verify/FE8J3OEKM28I" target="_blank" rel="noreferrer" className="text-cyan-300 underline">View Credential</a></p>
            <p>3. Unsupervised ML for Customer Segmentation (Coursera, May 2026) — <a href="https://www.coursera.org/account/accomplishments/verify/XYH7MYQ4PFQR" target="_blank" rel="noreferrer" className="text-cyan-300 underline">View Credential</a></p>
            <p>4. Business Analyst Experience Certification (Finlatics, Jan 2025) — <a href="https://drive.google.com/file/d/1ouOzPtO85kTCKjCUcHgUfvXl-98jm3Du/view?usp=sharing" target="_blank" rel="noreferrer" className="text-amber-300 underline">View Credential</a></p>
          </div>
        );
        break;

      case "achievements":
        output = (
          <div className="font-mono text-xs space-y-1.5 text-slate-300">
            <p className="text-amber-400 font-bold">[VERIFIED HONORS &amp; RANKINGS]</p>
            <p>🏆 Finalist, Samsung PRISM WebAgent Hackathon — <a href="https://drive.google.com/file/d/15vBbW3Jw5P3woUCnm1EBC7xoSgrAn3GQ/view" target="_blank" rel="noreferrer" className="text-amber-300 underline">Proof</a></p>
            <p>🥉 3rd Place, Manipal BioPharma Hackathon 2026 — <a href="https://drive.google.com/file/d/1qFVD-Q5yd6PaMW_EUqiGQeAoTWAkTAdj/view" target="_blank" rel="noreferrer" className="text-cyan-300 underline">Proof</a></p>
            <p>🎯 Top 8% Nationwide in JEE Main Examination (NTA)</p>
          </div>
        );
        break;

      case "contact":
        output = (
          <div className="font-mono text-xs space-y-1.5 text-slate-300">
            <p className="text-emerald-400 font-bold">[DIRECT COMMUNICATION CHANNELS]</p>
            <p>• Email: <a href="mailto:ghodeanay@gmail.com" className="text-cyan-400 hover:underline">ghodeanay@gmail.com</a></p>
            <p>• Phone: <a href="tel:+919420954029" className="text-cyan-400 hover:underline">+91-9420954029</a></p>
            <p>• GitHub: <a href="https://github.com/AGmitmanipal" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">https://github.com/AGmitmanipal</a></p>
            <p>• LinkedIn: <a href="https://linkedin.com/in/anay-ghode" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">https://linkedin.com/in/anay-ghode</a></p>
            <p>• LeetCode: <a href="https://leetcode.com/u/Anil_Ghode" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">https://leetcode.com/u/Anil_Ghode</a></p>
          </div>
        );
        break;

      case "stats":
        output = (
          <div className="font-mono text-xs space-y-1 text-slate-300">
            <p className="text-cyan-400 font-bold">[TELEMETRY &amp; METRICS]</p>
            <p>• Academic CGPA: <span className="text-emerald-400">8.32 / 10</span> (Manipal Institute of Technology)</p>
            <p>• Production Latency: <span className="text-emerald-400">&lt;100ms</span> (GoPerch WebSocket &amp; REST sync)</p>
            <p>• Competitive Rank: <span className="text-emerald-400">Top 8% Nationwide</span> (JEE Main)</p>
            <p>• Mentorship Reach: <span className="text-emerald-400">50+ Students</span> (The Data Alchemists)</p>
          </div>
        );
        break;

      case "sudo hire":
      case "hire":
      case "hire-anil":
      case "hire-anay":
        triggerConfetti();
        output = (
          <div className="font-mono text-xs space-y-2 text-emerald-300 bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/40">
            <p className="font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>ACCESS GRANTED: Excellent choice! Anil Ghode is ready for high-impact roles.</span>
            </p>
            <p className="text-slate-300">
              Dispatch an email directly to <a href="mailto:ghodeanay@gmail.com" className="text-cyan-300 font-bold underline">ghodeanay@gmail.com</a> or phone <span className="text-white font-bold">+91-9420954029</span>.
            </p>
          </div>
        );
        break;

      case "clear":
        setHistory([]);
        setInputVal("");
        return;

      default:
        output = (
          <div className="font-mono text-xs text-red-400">
            command not found: {cmd}. Type <span className="text-cyan-400 font-semibold">&apos;help&apos;</span> for a list of valid commands.
          </div>
        );
        break;
    }

    setHistory((prev) => [
      ...prev,
      {
        id: Date.now(),
        command: rawCmd,
        output,
      },
    ]);

    setInputVal("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(inputVal);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandList.length > 0) {
        const nextIdx = historyIndex + 1 < commandList.length ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIdx);
        setInputVal(commandList[commandList.length - 1 - nextIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(commandList[commandList.length - 1 - nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal("");
      }
    }
  };

  const copyTerminalOutput = () => {
    const text = history
      .map((h) => `$ ${h.command}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="terminal" className="relative py-24 cyber-grid">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-3">
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Developer Sandbox</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Interactive <span className="text-gradient">Cyber Terminal</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Query resume telemetry, execute diagnostic routines, or discover Easter eggs.
          </p>
        </div>

        {/* Terminal Window */}
        <div className="glass-panel rounded-2xl border border-white/15 overflow-hidden shadow-2xl shadow-purple-950/40">
          
          {/* macOS / Cyber Window Header */}
          <div className="bg-[#05080e] px-4 py-3 flex items-center justify-between border-b border-white/10 select-none">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" onClick={() => setHistory([])} title="Clear terminal" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" onClick={() => setIsMinimized(!isMinimized)} title="Minimize/Maximize" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors cursor-pointer" onClick={triggerConfetti} title="Confetti" />
              <span className="ml-3 font-mono text-xs text-slate-400 flex items-center gap-1.5">
                <span>anil@mit-manipal:~</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  zsh
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyTerminalOutput}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors text-xs"
                title="Copy Terminal History"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors text-xs"
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Terminal Body */}
          {!isMinimized && (
            <div
              className="bg-[#090d16]/95 p-4 sm:p-6 font-mono text-xs min-h-[360px] max-h-[480px] overflow-y-auto space-y-4"
              onClick={() => inputRef.current?.focus()}
            >
              {/* Output History */}
              {history.map((item) => (
                <div key={item.id} className="space-y-1.5 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-cyan-400 font-bold">anil@node:~$</span>
                    <span className="text-white font-semibold">{item.command}</span>
                  </div>
                  <div className="pl-4 border-l border-white/10">{item.output}</div>
                </div>
              ))}

              {/* Current Active Input Prompt */}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-cyan-400 font-bold shrink-0">anil@node:~$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="type command (e.g. 'help', 'skills', 'sudo hire')..."
                  className="w-full bg-transparent text-white font-mono text-xs focus:outline-none placeholder-slate-600 caret-cyan-400"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  onClick={() => handleCommand(inputVal)}
                  aria-label="Send command"
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-white transition-colors"
                >
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div ref={bottomRef} />
            </div>
          )}

          {/* Command Pill Quick Triggers */}
          <div className="bg-[#05080e] px-4 py-3 border-t border-white/10 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">Quick commands:</span>
            {["help", "skills", "projects", "services", "links", "certifications", "experience", "achievements", "sudo hire"].map((chip) => (
              <button
                key={chip}
                onClick={() => handleCommand(chip)}
                className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-white/5 hover:bg-purple-600/30 border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-cyan-300 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
