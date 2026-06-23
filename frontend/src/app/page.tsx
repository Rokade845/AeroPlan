"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, Sparkles, Map, ShieldCheck, CheckSquare, Hotel, DollarSign, CloudSun } from "lucide-react";
import { apiAuth } from "../utils/api";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!apiAuth.getLocalUser());
  }, []);

  return (
    <div className="flex flex-col min-h-screen justify-between relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="w-full px-6 py-6 max-w-7xl mx-auto flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Compass className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <span className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400 font-outfit">
            AeroPlan
          </span>
        </div>
        
        <div className="flex gap-4 items-center">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide glass-panel-interactive text-white border border-white/10 hover:border-indigo-500/30"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold hover:text-white transition-colors duration-200 px-4 py-2">
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold tracking-wide bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/20 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center z-10 py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-semibold mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          Next-Gen AI Itinerary Planner
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight font-outfit mb-6 animate-fade-in">
          Craft Your Next Adventure<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-teal-400">
            Powered by Artificial Intelligence
          </span>
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed animate-fade-in">
          AeroPlan utilizes advanced AI models to synthesize custom day-by-day itineraries, estimate budget breakdowns, find hotels, and generate smart packing checklists based on your unique interests.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md animate-fade-in mb-20">
          <Link
            href={isLoggedIn ? "/dashboard" : "/register"}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 text-center"
          >
            Start Planning For Free
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-semibold glass-panel-interactive border border-white/15 text-gray-300 hover:text-white text-center"
          >
            Learn More
          </a>
        </div>

        {/* Feature Cards Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-16 border-t border-white/5">
          <div className="glass-panel p-8 rounded-2xl text-left border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full group-hover:bg-indigo-500/10 transition-colors duration-300" />
            <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 mb-6">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-outfit mb-3 text-white">Dynamic AI Itineraries</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Day-by-day schedules tailormade to your destination and duration. Modify activities easily or regenerate individual days to fit your pace.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl text-left border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/5 rounded-bl-full group-hover:bg-fuchsia-500/10 transition-colors duration-300" />
            <div className="w-12 h-12 rounded-xl bg-fuchsia-500/15 flex items-center justify-center text-fuchsia-400 mb-6">
              <CloudSun className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-outfit mb-3 text-white">Weather & Packing lists</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Receive live climate expectations and dynamic, checkable packing lists matching your itinerary activities and target interests.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl text-left border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-full group-hover:bg-teal-500/10 transition-colors duration-300" />
            <div className="w-12 h-12 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-400 mb-6">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-outfit mb-3 text-white">Budget & Hotels</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Get detailed expense estimations split by flights, accommodation, food, and activities alongside custom tiered hotel selections.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-white/5 px-6 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
          <div>
            &copy; 2026 AeroPlan. Designed for modern travel engineering.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-gray-400 transition-colors duration-200 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 transition-colors duration-200 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-400 transition-colors duration-200 cursor-pointer flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-teal-500" /> Data Isolated
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
