import { Link } from "react-router-dom";
import {
  Brain,
  Lock,
  Zap,
  Globe,
  Search,
  Layers,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-foreground relative overflow-hidden">
      <div className="main-bg" />
      <Header />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-40 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 animate-in fade-in slide-in-from-top-4 duration-700">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Personal Web Assistant</span>
            </div>
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.9] text-slate-900 dark:text-white animate-in fade-in slide-in-from-left-4 duration-700">
              Find anything <br /><span className="text-primary italic">instantly.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed animate-in fade-in slide-in-from-left-6 duration-700 delay-100">
              Cortex is a smart helper for your browser. it remembers the pages you visit and organizes them so you can find them later by just asking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-blue-500/20"
              >
                Open Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative h-[400px] lg:h-full flex items-center justify-center animate-in zoom-in duration-700 delay-300">
            <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-[100px]" />
            <div className="relative w-full max-w-sm space-y-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Search className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">Smart Search</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Find pages by meaning, not just exact words. It's like having a perfect memory.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3 translate-x-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <Lock className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">100% Private</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your data never leaves your computer. Everything is stored locally and safely.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <Zap className="w-5 h-5 text-amber-500" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">Easy Suggestions</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Get helpful links and reminders based on what you're working on.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="max-w-7xl mx-auto px-6 lg:px-12 py-32 relative z-10"
      >
        <div className="text-center mb-20 space-y-2">
          <h2 className="text-xs font-bold tracking-widest text-primary uppercase">Main Features</h2>
          <h3 className="text-4xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white">Simply powerful.</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 text-blue-500">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Smart Search</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Search your history by topics and ideas. Finding that one article from three days ago is now instant.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 text-blue-500">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Auto Groups</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Cortex automatically groups related pages together, making it easy to organize your research or shopping.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-all shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 text-blue-500">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Helpful Tips</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Get relevant suggestions as you browse. Cortex helps you find the next step in your workflow.
            </p>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-32 relative z-10">
        <div className="p-12 lg:p-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px]" />
          <div className="relative z-10 space-y-12">
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white">Safety first.</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="flex gap-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-white">No Cloud Storage</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    Everything stays on your device. We don't have servers that store your data.
                  </p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 text-blue-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1 text-slate-900 dark:text-white">You're in Control</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    Pause saving or delete any part of your history with one click.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-32 text-center relative z-10">
        <div className="space-y-8">
          <h2 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Give your browser <br /><span className="text-primary">a boost.</span>
          </h2>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl"
          >
            Go to Dashboard
            <ArrowRight className="ml-3 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Cortex • Samsung Prism Hackathon 2025
          </p>
          <div className="flex gap-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Privacy Protected</span>
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">System Online</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
