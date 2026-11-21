"use client";

import React from "react";
import {
  Globe,
  Smartphone,
  MessageCircle,
  Server,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Store,
  UserCheck,
  AlertCircle,
  Layers,
  Sparkles,
  ExternalLink,
  Clock,
  HelpCircle,
  FileCheck
} from "lucide-react";
import { WhatsAppIcon } from "./Icons";

export default function Services() {
  const targetAudiences = [
    {
      title: "Coaching Centres & Educators",
      icon: <GraduationCap className="w-5 h-5 text-purple-400" />,
      badge: "Education & Institutes",
      description:
        "Present your courses, batch schedules, faculty credentials, and student enquiry forms with direct WhatsApp admission links.",
      highlights: [
        "Course & fee structure showcases",
        "Upcoming batch schedules",
        "Direct WhatsApp inquiry buttons",
        "Student enrollment & contact forms",
      ],
      accent: "from-purple-500/20 to-indigo-500/20",
      borderHover: "hover:border-purple-500/40",
    },
    {
      title: "Local Businesses & Retail",
      icon: <Store className="w-5 h-5 text-cyan-400" />,
      badge: "Local Stores & Services",
      description:
        "Put your store, clinic, salon, or service business on the digital map with clear service menus, operating hours, and location guidance.",
      highlights: [
        "Product / service catalogs",
        "Interactive Google Maps location",
        "Business hours & direct call button",
        "Customer quote / booking inquiries",
      ],
      accent: "from-cyan-500/20 to-blue-500/20",
      borderHover: "hover:border-cyan-500/40",
    },
    {
      title: "Independent Professionals",
      icon: <UserCheck className="w-5 h-5 text-emerald-400" />,
      badge: "Consultants & Specialists",
      description:
        "Build authority for doctors, lawyers, chartered accountants, and consultants with a credible online presence and effortless client onboarding.",
      highlights: [
        "Credentials & practice areas",
        "Consultation booking flow",
        "Clean, professional design",
        "Direct email & telephone links",
      ],
      accent: "from-emerald-500/20 to-teal-500/20",
      borderHover: "hover:border-emerald-500/40",
    },
  ];

  const packageFeatures = [
    {
      title: "Up to 5 Custom Pages",
      detail:
        "Clean, structured pages tailored to your brand — such as Home, About Us, Services / Courses, and Contact.",
      icon: <Layers className="w-4 h-4 text-purple-400" />,
    },
    {
      title: "Mobile-Friendly Responsive Design",
      detail:
        "Engineered to look sharp, fast, and easy to navigate on all screen sizes — smartphones, tablets, and desktops.",
      icon: <Smartphone className="w-4 h-4 text-cyan-400" />,
    },
    {
      title: "WhatsApp & Direct Contact Links",
      detail:
        "Instant click-to-chat WhatsApp button, direct phone dialer, and an inquiry form so prospective clients can reach you immediately.",
      icon: <MessageCircle className="w-4 h-4 text-emerald-400" />,
    },
    {
      title: "Hosting Setup & Domain Connection",
      detail:
        "Hands-on guidance and assistance in connecting your custom domain name and deploying your website to reliable, fast hosting.",
      icon: <Server className="w-4 h-4 text-indigo-400" />,
    },
    {
      title: "Two Rounds of Revisions",
      detail:
        "Review layouts, text, and visuals before going live, with two thorough revision rounds to match your exact vision.",
      icon: <RefreshCw className="w-4 h-4 text-amber-400" />,
    },
    {
      title: "30 Days of Post-Launch Fixes",
      detail:
        "Prompt technical fixes for any issues or display bugs in the delivered website for 30 full days after launch.",
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
    },
  ];

  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("contact");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="services" className="relative py-28 cyber-grid">
      {/* Background Section Glows */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-purple-500/30 text-purple-400 text-xs font-mono uppercase tracking-widest mb-4">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Website Development Services</span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Modern, Fast Websites for <span className="text-gradient">Local Businesses &amp; Professionals</span>
          </h2>
          
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Designed specifically for coaching centres, local establishments, and independent professionals who need a 
            credible, high-performing online presence that turns visitors into direct inquiries.
          </p>
        </div>

        {/* Who This Is For: Target Audience Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {targetAudiences.map((audience) => (
            <div
              key={audience.title}
              className={`glass-panel rounded-2xl p-6 sm:p-7 border border-white/10 ${audience.borderHover} transition-all duration-300 flex flex-col justify-between group hover:shadow-xl hover:shadow-purple-950/20`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:scale-105 transition-transform">
                    {audience.icon}
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                    {audience.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {audience.title}
                </h3>
                
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-5">
                  {audience.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-2">
                {audience.highlights.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Main Service & Pricing Offer Showcase */}
        <div className="glass-panel-glow rounded-3xl p-6 sm:p-10 lg:p-12 border border-purple-500/30 relative overflow-hidden mb-12">
          {/* Subtle Top Gradient Shimmer */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-purple-500 via-cyan-400 to-indigo-500 opacity-80" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Pricing & Core Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Standard Business Website Package</span>
              </div>

              <div>
                <div className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-1">
                  All-Inclusive Starter Package
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                    ₹8,999
                  </span>
                  <span className="text-xs sm:text-sm font-mono text-cyan-400 font-semibold">
                    starting price
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  The final price depends on the client’s specific requirements, features, and custom scope.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Transparent, Goal-Driven Delivery</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Get a complete, professional web presence launched without technical complexity. Everything is built to highlight what makes your business unique.
                </p>
              </div>

              {/* Direct CTAs */}
              <div className="space-y-3 pt-2">
                <a
                  href="#contact"
                  onClick={scrollToContact}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white text-sm font-semibold shadow-lg shadow-purple-600/30 hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>Let&apos;s discuss your website</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="https://wa.me/919420954029?text=Hi%20Anil,%20I'm%20interested%20in%20discussing%20a%20website%20for%20my%20business."
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-semibold transition-all duration-200"
                >
                  <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
                  <span>Chat directly on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Right Column: What's Included Grid (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  What&apos;s Included in the Starting Package
                </h3>
                <p className="text-xs text-slate-400">
                  Every essential building block for a solid, conversion-ready business website:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {packageFeatures.map((feat) => (
                  <div
                    key={feat.title}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 transition-colors space-y-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 shrink-0">
                        {feat.icon}
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-white">
                        {feat.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed pl-1">
                      {feat.detail}
                    </p>
                  </div>
                ))}
              </div>

              {/* Clear Scope & Separately Charged Items */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#090d16]/80 border border-white/10 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 uppercase tracking-wide">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Clear Scope &amp; Third-Party Services</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-400 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>
                      <strong className="text-slate-300">Domain &amp; Hosting:</strong> Domain registration and renewal, website hosting fees, and any paid third-party services are charged separately at actual cost.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    <span>
                      <strong className="text-slate-300">Custom Scope:</strong> Additional features, extra pages, and major redesigns are quoted separately based on project requirements.
                    </span>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        </div>

        {/* Changes After Launch Notice (No recurring monthly fees) */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>On-Demand Flexibility • No Monthly Retainers</span>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Need changes after launch?
              </h3>
              
              <p className="text-sm text-slate-300 leading-relaxed">
                Contact me whenever you’d like to update your website. We’ll discuss your requirements, 
                and I’ll provide a quote based on the changes needed.
              </p>
              
              <p className="text-xs text-slate-400 leading-relaxed">
                No monthly maintenance plan or recurring support fee. You have full peace of mind and complete ownership of your website, paying only when you actually want enhancements.
              </p>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <a
                href="#contact"
                onClick={scrollToContact}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 hover:border-cyan-400/50 text-white text-xs font-semibold font-mono transition-all"
              >
                <span>Discuss Your Project</span>
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}