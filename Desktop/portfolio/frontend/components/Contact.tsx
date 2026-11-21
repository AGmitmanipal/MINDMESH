"use client";

import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  Send, 
  CheckCircle2, 
  Copy, 
  Check, 
  Code2, 
  Sparkles, 
  MapPin, 
  MessageSquare,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { LinkedinIcon, GithubIcon, WhatsAppIcon } from "./Icons";
import confetti from "canvas-confetti";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sentRemotely, setSentRemotely] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("ghodeanay@gmail.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText("+919420954029");
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg("Please fill in all required fields (Name, Email, Message).");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    const emailSubject = formData.subject.trim() || `Portfolio Inquiry from ${formData.name}`;
    const emailBody = `Hi Anil,\n\nName: ${formData.name}\nEmail: ${formData.email}\nSubject: ${emailSubject}\n\nMessage:\n${formData.message}\n\n---\nSent from Anil Ghode Portfolio Website`;

    let remoteSuccess = false;
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

    if (accessKey) {
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: accessKey,
            name: formData.name,
            email: formData.email,
            subject: emailSubject,
            message: emailBody,
            from_name: "Portfolio Contact Form",
          }),
        });
        const result = await res.json();
        if (result.success) {
          remoteSuccess = true;
        }
      } catch (err) {
        console.warn("Direct API submission attempt finished, falling back to client dispatcher.", err);
      }
    }

    setIsSubmitting(false);
    setSentRemotely(remoteSuccess);
    setSubmitted(true);

    confetti({
      particleCount: 110,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"],
    });

    // If no background API key is set, automatically trigger the user's mail client
    if (!remoteSuccess) {
      const mailtoUrl = `mailto:ghodeanay@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoUrl;
    }
  };

  return (
    <section id="contact" className="relative py-28 cyber-dots">
      {/* Background Section Glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-purple-500/30 text-purple-400 text-xs font-mono uppercase tracking-widest mb-4">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Connect &amp; Collaborate</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Get In <span className="text-gradient">Touch</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Available for high-impact software engineering roles, distributed systems development, 
            and agentic AI research initiatives.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Contact Info & Social Hub (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Direct Channel Cards */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Direct Contact Channels</span>
              </h3>

              {/* Email Card */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/40 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono text-slate-400">Direct Email</div>
                    <a
                      href="mailto:ghodeanay@gmail.com"
                      className="text-xs sm:text-sm font-semibold text-white hover:text-cyan-300 transition-colors"
                    >
                      ghodeanay@gmail.com
                    </a>
                  </div>
                </div>

                <button
                  onClick={handleCopyEmail}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Copy email to clipboard"
                  aria-label="Copy Email"
                >
                  {copiedEmail ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400 group-hover:text-white" />
                  )}
                </button>
              </div>

              {/* Phone Card */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/40 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono text-slate-400">Telephone / WhatsApp</div>
                    <a
                      href="tel:+919420954029"
                      className="text-xs sm:text-sm font-semibold text-white hover:text-cyan-300 transition-colors"
                    >
                      +91-9420954029
                    </a>
                  </div>
                </div>

                <button
                  onClick={handleCopyPhone}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Copy phone to clipboard"
                  aria-label="Copy Phone"
                >
                  {copiedPhone ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400 group-hover:text-white" />
                  )}
                </button>
              </div>

              {/* Location Card */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-slate-400">Base Location</div>
                  <div className="text-xs sm:text-sm font-semibold text-white">
                    Manipal, Karnataka, India
                  </div>
                </div>
              </div>

              {/* Availability Notice */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-mono">Current Status: Open for Internships &amp; Full-Time Roles</span>
              </div>
            </div>

            {/* Social Grid Pills */}
            <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-white/10">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-4">
                Professional Profiles
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href="https://linkedin.com/in/anay-ghode"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-cyan-950/40 border border-white/10 hover:border-cyan-500/50 text-slate-200 hover:text-white text-xs font-medium transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <LinkedinIcon className="w-4 h-4 text-cyan-400" />
                    <span>LinkedIn</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>

                <a
                  href="https://github.com/AGmitmanipal"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-purple-950/40 border border-white/10 hover:border-purple-500/50 text-slate-200 hover:text-white text-xs font-medium transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <GithubIcon className="w-4 h-4 text-purple-400" />
                    <span>GitHub</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>

                <a
                  href="https://leetcode.com/u/Anil_Ghode"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-amber-950/40 border border-white/10 hover:border-amber-500/50 text-slate-200 hover:text-white text-xs font-medium transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-amber-400" />
                    <span>LeetCode</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>

          </div>

          {/* Right: Glassmorphic Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 relative overflow-hidden">
              
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  Send a Direct Message
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Fill out the form below and it will route directly to my inbox with priority delivery.
                </p>
              </div>

              {submitted ? (
                <div className="py-8 text-center space-y-6 animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <h4 className="text-2xl font-bold text-white">
                      {sentRemotely ? "Message Sent Directly!" : "Message Ready to Dispatch!"}
                    </h4>
                    <p className="text-slate-300 text-sm max-w-md mx-auto mt-2">
                      {sentRemotely ? (
                        <>Thank you, <span className="text-cyan-400 font-semibold">{formData.name}</span>. Your message was transmitted to <strong className="text-white">ghodeanay@gmail.com</strong>.</>
                      ) : (
                        <>Your message for <strong className="text-cyan-300">ghodeanay@gmail.com</strong> has been prepared. If your mail client didn&apos;t open automatically, send it directly using one of the options below:</>
                      )}
                    </p>
                  </div>

                  {/* Action buttons if not sent remotely */}
                  {!sentRemotely && (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
                      {/* Gmail Web */}
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=ghodeanay@gmail.com&su=${encodeURIComponent(formData.subject || "Portfolio Inquiry from " + formData.name)}&body=${encodeURIComponent(`Hi Anil,\n\nName: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject || "Website Inquiry"}\n\nMessage:\n${formData.message}\n\n---\nSent from Portfolio Website`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-semibold text-xs shadow-lg shadow-red-900/30 transition-all"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Send via Gmail</span>
                      </a>

                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/919420954029?text=${encodeURIComponent(`Hi Anil, my name is ${formData.name} (${formData.email}).\n\nSubject: ${formData.subject || "Portfolio Inquiry"}\nMessage: ${formData.message}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-500/40 text-emerald-300 hover:text-white font-semibold text-xs transition-all"
                      >
                        <WhatsAppIcon className="w-4 h-4 text-emerald-400" />
                        <span>Send via WhatsApp</span>
                      </a>

                      {/* Default Mail Client */}
                      <a
                        href={`mailto:ghodeanay@gmail.com?subject=${encodeURIComponent(formData.subject || "Portfolio Inquiry from " + formData.name)}&body=${encodeURIComponent(`Hi Anil,\n\nName: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject || "Website Inquiry"}\n\nMessage:\n${formData.message}`)}`}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs transition-all border border-white/10"
                      >
                        <Send className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Mail App</span>
                      </a>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setSentRemotely(false);
                        setFormData({ name: "", email: "", subject: "", message: "" });
                      }}
                      className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono transition-colors"
                    >
                      Compose Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs font-mono">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1.5">
                        Your Name <span className="text-purple-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Alex Hunter"
                        className="w-full bg-[#090d16]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-300 mb-1.5">
                        Your Email <span className="text-purple-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="alex@company.com"
                        className="w-full bg-[#090d16]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Backend Engineering Opportunity / AI Collaboration"
                      className="w-full bg-[#090d16]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1.5">
                      Message <span className="text-purple-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Hi Anil, we are impressed by your work with FastAPI and Agentic AI at GoPerch..."
                      className="w-full bg-[#090d16]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full group flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-xl shadow-purple-600/30 hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Transmitting Payload...</span>
                      </>
                    ) : (
                      <>
                        <span>Transmit Message</span>
                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] font-mono text-slate-500 text-center mt-2">
                    🔒 Direct delivery to ghodeanay@gmail.com. You can also reach out directly on WhatsApp at +91-9420954029.
                  </p>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
