"use client";

import { useRouter } from "next/navigation";
import {
  BarChart3,
  Zap,
  ShieldCheck,
  Users,
  ArrowRight,
  LayoutDashboard,
  PlusCircle,
  Menu
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("poll_token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 overflow-x-hidden">

      {/* --- NAVIGATION --- */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-5 max-w-7xl mx-auto border-b border-gray-50 md:border-none">
        <div className="flex items-center gap-2">
          <div className="bg-gray-900 p-1.5 rounded-lg">
            <BarChart3 className="text-white w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter">POLL.IO</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {isLoggedIn ? (
            <Link href="/dashboard" className="text-sm font-bold text-gray-600 hover:text-black transition-colors">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-black transition-colors">
              Login
            </Link>
          )}
          <button
            onClick={() => router.push(isLoggedIn ? "/create" : "/register")}
            className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-md active:scale-95"
          >
            {isLoggedIn ? "Create Poll" : "Get Started"}
          </button>
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <button onClick={() => router.push(isLoggedIn ? "/dashboard" : "/login")}>
            <Menu className="w-6 h-6 text-gray-900" />
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="max-w-5xl mx-auto px-6 py-12 md:py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-black mb-6 animate-fade-in tracking-widest uppercase">
          <Zap className="w-3 h-3 fill-current" />
          <span>Real-Time Engine v1.0</span>
        </div>

        <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] md:leading-[0.9] mb-6">
          Decisions made <br className="hidden md:block" />
          <span className="text-blue-600">in real-time.</span>
        </h1>

        <p className="text-base md:text-xl text-gray-500 font-medium max-w-xl mx-auto mb-8 md:mb-12 leading-relaxed px-4 md:px-0">
          The polling engine for high-stakes decisions.
          Anonymous voting, live analytics, and instant sync.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4">
          <button
            onClick={() => router.push(isLoggedIn ? "/dashboard" : "/register")}
            className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:bg-black transition-all shadow-xl flex items-center justify-center group"
          >
            {isLoggedIn ? "Enter Workspace" : "Get Started Now"}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {!isLoggedIn && (
            <button
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border-2 border-gray-100 rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:bg-gray-50 transition-all"
            >
              Live Demo
            </button>
          )}
        </div>
      </header>

      {/* --- FEATURES SECTION --- */}
      <section className="bg-gray-50 py-16 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

            {/* FEATURE 1 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 space-y-4 shadow-sm md:shadow-none">
              <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center">
                <Zap className="text-blue-600 w-6 h-6 fill-blue-100" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Ultra-Fast Sync</h3>
              <p className="text-sm md:text-base text-gray-500 font-bold leading-relaxed">
                Powered by WebSockets. Watch the bars move live as your audience votes.
              </p>
            </div>

            {/* FEATURE 2 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 space-y-4 shadow-sm md:shadow-none">
              <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center">
                <ShieldCheck className="text-blue-600 w-6 h-6 fill-blue-100" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Secure & Private</h3>
              <p className="text-sm md:text-base text-gray-500 font-bold leading-relaxed">
                Toggle between anonymous collection or verified identities instantly.
              </p>
            </div>

            {/* FEATURE 3 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 space-y-4 shadow-sm md:shadow-none">
              <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center">
                <Users className="text-blue-600 w-6 h-6 fill-blue-100" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Deep Analytics</h3>
              <p className="text-sm md:text-base text-gray-500 font-bold leading-relaxed">
                Get a breakdown of every response. Track participation and trends.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- QUICK ACCESS SECTION --- */}
      <section className="py-16 md:py-24 max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-black mb-8 md:mb-12 tracking-tight">Quick Access</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Link href="/dashboard" className="p-4 md:p-6 bg-white border border-gray-200 rounded-2xl md:rounded-3xl hover:border-blue-500 transition-all group">
            <LayoutDashboard className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-gray-400 group-hover:text-blue-600 transition-colors" />
            <span className="font-black text-[10px] md:text-xs uppercase tracking-widest text-gray-900">Workspace</span>
          </Link>
          <Link href="/create" className="p-4 md:p-6 bg-white border border-gray-200 rounded-2xl md:rounded-3xl hover:border-blue-500 transition-all group">
            <PlusCircle className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-gray-400 group-hover:text-blue-600 transition-colors" />
            <span className="font-black text-[10px] md:text-xs uppercase tracking-widest text-gray-900">New Poll</span>
          </Link>
          <Link href="/register" className="p-4 md:p-6 bg-white border border-gray-200 rounded-2xl md:rounded-3xl hover:border-blue-500 transition-all group">
            <Users className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-gray-400 group-hover:text-blue-600 transition-colors" />
            <span className="font-black text-[10px] md:text-xs uppercase tracking-widest text-gray-900">Register</span>
          </Link>
          <Link href="/login" className="p-4 md:p-6 bg-white border border-gray-200 rounded-2xl md:rounded-3xl hover:border-blue-500 transition-all group">
            <BarChart3 className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-gray-400 group-hover:text-blue-600 transition-colors" />
            <span className="font-black text-[10px] md:text-xs uppercase tracking-widest text-gray-900">Login</span>
          </Link>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-gray-50 py-10 md:py-16 text-center text-gray-400 font-bold text-[10px] md:text-xs uppercase tracking-widest px-6">
        <p className="mb-2">&copy; 2026 POLL.IO — BUILT FOR PERFORMANCE</p>
        <div className="flex justify-center gap-6 mt-4">
          <a
            href="https://www.linkedin.com/in/arkaprava-chakraborty-a4a619239/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 cursor-pointer"
          >
            LinkedIn
          </a>
          <a
            href="https://x.com/Arkaprava01"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 cursor-pointer"
          >
            X
          </a>
          <a
            href="https://github.com/arkapravachakraborty"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 cursor-pointer"
          >
            GitHub
          </a>
        </div>
      </footer>

    </div>
  );
}