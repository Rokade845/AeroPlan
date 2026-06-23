"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { apiTrips } from '../../../utils/api';
import { Compass, ArrowLeft, Sliders, MapPin, Calendar, Wallet, Check, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const INTEREST_OPTIONS = [
  { id: 'Food', label: 'Food & Culinary', desc: 'Street eats, fine dining, cooking classes' },
  { id: 'Culture', label: 'Art & Culture', desc: 'Museums, historic landmarks, local heritage' },
  { id: 'Adventure', label: 'Adventure & Outdoors', desc: 'Hiking, wilderness exploration, action activities' },
  { id: 'Shopping', label: 'Markets & Shopping', desc: 'Bustling bazaars, local boutiques, artisan crafts' },
  { id: 'Relaxation', label: 'Relaxation & Spa', desc: 'Beaches, hot springs, scenic botanic walks' },
];

const LOADING_STATUSES = [
  "Contacting AI travel agent...",
  "Searching regional maps and attraction databases...",
  "Structuring custom day-by-day routes...",
  "Calculating realistic flights and dining budget...",
  "Finding traveler-approved hotel options...",
  "Generating custom weather and packing checklist..."
];

export default function NewTrip() {
  const { loading: authLoading } = useAuth(true);
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(3);
  const [budgetLevel, setBudgetLevel] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [interests, setInterests] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingStatusIdx, setLoadingStatusIdx] = useState(0);
  const [error, setError] = useState('');
  const router = useRouter();

  // Rotate loading text
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStatusIdx((prev) => (prev + 1) % LOADING_STATUSES.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const toggleInterest = (id: string) => {
    if (interests.includes(id)) {
      setInterests(interests.filter((item) => item !== id));
    } else {
      setInterests([...interests, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!destination.trim()) {
      setError('Please specify a travel destination.');
      return;
    }

    setLoading(true);
    setLoadingStatusIdx(0);
    
    try {
      const trip = await apiTrips.create({
        destination,
        duration,
        budgetLevel,
        interests,
      });

      // Confetti burst!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#14b8a6']
      });

      // Redirect to the trip details page
      router.push(`/trips/${trip._id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate itinerary. Please try again.');
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090a0f]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-sm text-gray-400">Verifying session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative px-6 py-6 md:px-12 max-w-3xl mx-auto w-full overflow-hidden flex flex-col justify-between">
      {/* Background Glows */}
      <div className="absolute top-10 right-[-20%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-[-20%] w-[50%] h-[50%] rounded-full bg-fuchsia-500/5 blur-[120px] pointer-events-none" />

      {/* Full screen AI generation loader */}
      {loading && (
        <div className="fixed inset-0 bg-[#090a0f]/90 z-50 flex flex-col items-center justify-center text-center p-8 backdrop-blur-md animate-fade-in">
          <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-8 border border-indigo-500/20 relative animate-pulse">
            <Compass className="w-12 h-12 text-indigo-400 animate-spin-slow" />
            <div className="absolute inset-0 rounded-3xl border-2 border-indigo-500/50 animate-ping opacity-25" />
          </div>
          
          <h2 className="text-3xl font-extrabold font-outfit text-white mb-3">Creating Your Dream Trip</h2>
          <p className="text-indigo-400 font-semibold text-sm max-w-md min-h-[40px] px-4">
            {LOADING_STATUSES[loadingStatusIdx]}
          </p>
          <div className="w-64 h-1 bg-white/5 rounded-full mt-8 overflow-hidden relative border border-white/5">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 rounded-full animate-shimmer-progress w-[70%]" style={{
              animation: 'shimmer-progress 10s infinite linear'
            }} />
          </div>
          
          <style jsx global>{`
            @keyframes shimmer-progress {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(150%); }
            }
          `}</style>
        </div>
      )}

      {/* Main Container */}
      <div className="z-10 flex-1">
        {/* Navigation */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-200 mb-8 mt-4 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:transform group-hover:translate-x-[-2px] transition-transform duration-200" />
          Back to Dashboard
        </button>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold font-outfit text-white">
            Plan a New Journey
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Provide details below, and our generative agent will tailor an itinerary.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-8 pb-12">
          {/* Destination */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 font-outfit">
              <MapPin className="w-4 h-4 text-indigo-400" />
              Where are you going?
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Tokyo, Japan or Paris, France"
              className="w-full px-4 py-3.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 text-base"
            />
          </div>

          {/* Duration */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 font-outfit">
              <Calendar className="w-4 h-4 text-fuchsia-400" />
              Trip Duration
            </label>
            <div className="flex items-center gap-6">
              <input
                type="range"
                min="1"
                max="14"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="flex-1 h-2 rounded-lg bg-black/40 accent-indigo-500 border border-white/5 outline-none cursor-pointer"
              />
              <div className="w-18 py-2 px-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-center font-bold font-outfit text-lg">
                {duration} {duration === 1 ? 'day' : 'days'}
              </div>
            </div>
          </div>

          {/* Budget preference */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 font-outfit">
              <Wallet className="w-4 h-4 text-teal-400" />
              What is your budget level?
            </label>
            <div className="grid grid-cols-3 gap-4">
              {(['Low', 'Medium', 'High'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setBudgetLevel(level)}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
                    budgetLevel === level
                      ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-md shadow-indigo-500/5'
                      : 'bg-black/30 border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="font-bold text-sm">{level}</span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {level === 'Low' ? '$ Economy' : level === 'Medium' ? '$$ Mid-Range' : '$$$ Luxury'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 font-outfit">
              <Sliders className="w-4 h-4 text-indigo-400" />
              What are your interests?
            </label>
            <div className="space-y-3">
              {INTEREST_OPTIONS.map((opt) => {
                const selected = interests.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleInterest(opt.id)}
                    className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all duration-200 ${
                      selected
                        ? 'bg-indigo-500/10 border-indigo-500/50 text-white'
                        : 'bg-black/20 border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm">{opt.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors duration-200 ${
                      selected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-white/20'
                    }`}>
                      {selected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 text-white font-bold tracking-wide shadow-lg shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-center"
          >
            Generate Custom Itinerary
          </button>
        </form>
      </div>

      <footer className="w-full py-4 text-center text-xs text-gray-500 z-10 border-t border-white/5">
        Powered by AeroPlan AI travel agent.
      </footer>
    </div>
  );
}
