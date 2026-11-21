"use client";

import React from "react";
import { 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  MapPin, 
  Award, 
  Sparkles, 
  ChevronRight, 
  CheckCircle2, 
  Users, 
  Zap, 
  ShieldAlert,
  ExternalLink
} from "lucide-react";

interface TimelineEvent {
  id: string;
  type: "work" | "leadership" | "education";
  title: string;
  organization: string;
  period: string;
  location: string;
  statusBadge?: string;
  summary: string;
  points: string[];
  skills: string[];
  accentColor: string;
}

interface HonorOrCert {
  title: string;
  scope: string;
  icon: string;
  tag: string;
  detail: string;
  credentialUrl?: string;
}

export default function ExperienceTimeline() {
  const timelineData: TimelineEvent[] = [
    {
      id: "goperch",
      type: "work",
      title: "Web Developer Intern",
      organization: "GoPerch",
      period: "Jul 2025 – Present",
      location: "Manipal, Hybrid",
      statusBadge: "Active Role",
      summary:
        "Developed, tested, and debugged real-time features and backend APIs using FastAPI, PostgreSQL, Supabase, and React Native.",
      points: [
        "Achieved sub-100ms synchronization latency across distributed clients for live state tracking.",
        "Implemented geofencing-based location services and optimized backend API performance, improving reliability and scalability across the SDLC.",
        "Collaborated with engineers using Git version control to resolve bugs, streamline deployment workflows, and improve release velocity.",
      ],
      skills: ["FastAPI", "PostgreSQL", "Supabase", "React Native", "Geofencing", "Sub-100ms Latency"],
      accentColor: "border-cyan-500 bg-cyan-500",
    },
    {
      id: "data-alchemists",
      type: "leadership",
      title: "Management Committee Member",
      organization: "The Data Alchemists",
      period: "Aug 2025 – Jun 2026",
      location: "Manipal, On-site",
      statusBadge: "Technical Mentorship",
      summary:
        "Fostering competitive coding, systems thinking, and data science proficiency across the university campus.",
      points: [
        "Mentored 50+ students in Python and web development through project-based lessons on data structures, algorithms, and problem solving.",
        "Coordinated student teams to organize technical events, workshops, and coding competitions.",
        "Guided students on clean code architecture, Git version control, and scalable API design.",
      ],
      skills: ["Python", "DSA", "Web Development", "Technical Mentorship", "Git Collaboration"],
      accentColor: "border-purple-500 bg-purple-500",
    },
    {
      id: "mit-manipal",
      type: "education",
      title: "B.Tech in Electronics and Communication Engineering",
      organization: "Manipal Institute of Technology",
      period: "2024 – 2028 (Expected)",
      location: "Manipal, Karnataka",
      statusBadge: "CGPA: 8.32 / 10",
      summary:
        "Rigorous engineering education covering core computer science principles, embedded systems, signal theory, and software development fundamentals.",
      points: [
        "Maintained strong academic standing with a CGPA of 8.32 / 10.",
        "Extensive coursework in Data Structures & Algorithms, Object-Oriented Programming, and Software Engineering.",
        "Active contributor to departmental hackathons, tech symposiums, and engineering clubs.",
      ],
      skills: ["Electronics & Comm", "DSA", "OOP", "Embedded Systems", "Computer Architecture"],
      accentColor: "border-amber-500 bg-amber-500",
    },
  ];

  const honors: HonorOrCert[] = [
    {
      title: "Finalist, Samsung PRISM WebAgent Hackathon",
      scope: "Nationwide Autonomous AI Hackathon",
      icon: "🏆",
      tag: "Agentic AI",
      detail: "Engineered AI-powered automation agents executing multi-step workflows; selected among top teams nationally.",
      credentialUrl: "https://drive.google.com/file/d/15vBbW3Jw5P3woUCnm1EBC7xoSgrAn3GQ/view",
    },
    {
      title: "3rd Place, Manipal BioPharma Hackathon 2026",
      scope: "National Healthcare & Biotech Hackathon",
      icon: "🥉",
      tag: "Clinical ML",
      detail: "Developed a healthcare/biotech predictive solution in a high-stakes national hackathon.",
      credentialUrl: "https://drive.google.com/file/d/1qFVD-Q5yd6PaMW_EUqiGQeAoTWAkTAdj/view",
    },
    {
      title: "JEE Main Examination — Top 8% Nationwide",
      scope: "National Testing Agency (NTA)",
      icon: "🎯",
      tag: "National Rank",
      detail: "Secured top 8% percentile among hundreds of thousands of candidates nationwide in advanced engineering entrance.",
    },
    {
      title: "Agentic AI Engineering with LangChain and LangGraph",
      scope: "Udemy Credential — 2026",
      icon: "📜",
      tag: "Certification",
      detail: "Certified in designing cyclical multi-agent workflows, state persistence graphs, tool-calling runtimes, and memory systems.",
      credentialUrl: "https://www.udemy.com/certificate/UC-9eb95a70-43d5-4d66-b434-61f897b5cf7e/?utm_campaign=email&utm_medium=email&utm_source=sendgrid.com",
    },
    {
      title: "PyTorch: Fundamentals",
      scope: "DeepLearning.AI & Coursera — May 2026",
      icon: "🔥",
      tag: "Certification",
      detail: "Certified in building neural network architectures, autograd pipelines, tensor manipulation, and gradient descent optimization.",
      credentialUrl: "https://www.coursera.org/account/accomplishments/verify/FE8J3OEKM28I",
    },
    {
      title: "Unsupervised Machine Learning for Customer Segmentation",
      scope: "Coursera — May 2026",
      icon: "📊",
      tag: "Certification",
      detail: "Trained and evaluated clustering models (K-Means, PCA, Hierarchical) for customer market segmentation and dimensionality reduction.",
      credentialUrl: "https://www.coursera.org/account/accomplishments/verify/XYH7MYQ4PFQR",
    },
    {
      title: "Business Analyst Experience Certification",
      scope: "Finlatics — Jan 2025",
      icon: "💼",
      tag: "Certification",
      detail: "Practical business analysis, metric evaluation, financial modeling, and operational problem solving.",
      credentialUrl: "https://drive.google.com/file/d/1ouOzPtO85kTCKjCUcHgUfvXl-98jm3Du/view?usp=sharing",
    },
  ];

  return (
    <section id="experience" className="relative py-28 cyber-dots">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-cyan-500/30 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-4">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Career Milestones</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Experience &amp; <span className="text-gradient">Education</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Real-world backend production experience at GoPerch, technical mentorship at The Data Alchemists, 
            and academic pedigree from Manipal Institute of Technology.
          </p>
        </div>

        {/* Vertical Timeline */}
        <div className="relative max-w-4xl mx-auto mb-24">
          {/* Vertical Glowing Line */}
          <div className="absolute top-0 bottom-0 left-4 sm:left-8 w-0.5 bg-gradient-to-b from-purple-500 via-cyan-400 to-amber-500/40 opacity-50" />

          <div className="space-y-12">
            {timelineData.map((item, idx) => (
              <div key={item.id} className="relative pl-12 sm:pl-20 group">
                
                {/* Timeline Node Dot */}
                <div className="absolute left-2 sm:left-6 -translate-x-1/2 top-1.5 w-5 h-5 rounded-full bg-[#090d16] border-2 border-cyan-400 flex items-center justify-center group-hover:scale-125 transition-transform duration-300 shadow-lg shadow-cyan-500/40">
                  <div className={`w-2 h-2 rounded-full ${item.accentColor}`} />
                </div>

                {/* Event Card */}
                <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 group-hover:border-purple-500/40 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-purple-950/20">
                  
                  {/* Card Header */}
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                        {item.organization}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h3>
                    </div>

                    {item.statusBadge && (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        {item.statusBadge}
                      </span>
                    )}
                  </div>

                  {/* Meta: Period & Location */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 mb-5">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      {item.period}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      {item.location}
                    </span>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed mb-5">
                    {item.summary}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="space-y-2.5 mb-6">
                    {item.points.map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                        <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tech / Competency Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/5">
                    {item.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-white/[0.03] border border-white/10 text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Achievements & Certifications Grid */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Recognized Honors &amp; <span className="text-gradient">Verified Credentials</span>
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              National hackathons, engineering entrance percentiles, and verified certifications with live credential proofs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {honors.map((h, i) => (
              <div
                key={i}
                className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-amber-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-amber-950/20 flex flex-col justify-between"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl shrink-0 p-3 rounded-2xl bg-white/5 border border-white/10">
                    {h.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {h.tag}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{h.scope}</span>
                    </div>
                    <h4 className="text-base font-bold text-white mb-1">{h.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{h.detail}</p>
                  </div>
                </div>

                {/* Direct Link to Credential if available */}
                {h.credentialUrl && (
                  <div className="pt-3 border-t border-white/5 flex justify-end">
                    <a
                      href={h.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-mono transition-all"
                    >
                      <span>View Verified Credential</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
