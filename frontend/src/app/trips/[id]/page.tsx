"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { apiTrips, Trip, DailyItinerary, PackingItem } from '../../../utils/api';
import { 
  Compass, ArrowLeft, Calendar, Wallet, MapPin, 
  Trash2, Plus, Sparkles, CheckSquare, Square, 
  CloudSun, DollarSign, Hotel as HotelIcon, Loader2, RefreshCw 
} from 'lucide-react';

export default function TripDetails() {
  const { id } = useParams() as { id: string };
  const { user, loading: authLoading } = useAuth(true);
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Interactive Itinerary State
  const [activeDay, setActiveDay] = useState(1);
  const [newActivityText, setNewActivityText] = useState('');
  const [regenPrompt, setRegenPrompt] = useState('');
  const [regenLoading, setRegenLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Creative Packing List State
  const [newPackingText, setNewPackingText] = useState('');
  const [newPackingCat, setNewPackingCat] = useState<'Essentials' | 'Clothing' | 'Gear' | 'Toiletries' | 'Other'>('Essentials');
  const [packingTab, setPackingTab] = useState<'All' | 'Essentials' | 'Clothing' | 'Gear' | 'Toiletries'>('All');

  useEffect(() => {
    if (user && id) {
      fetchTripDetails();
    }
  }, [user, id]);

  const fetchTripDetails = async () => {
    setLoading(true);
    try {
      const data = await apiTrips.getById(id);
      setTrip(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load trip details. You may not have permission to view this trip.');
    } finally {
      setLoading(false);
    }
  };

  // --- ITINERARY MODIFICATION METHODS ---

  // Save full trip changes to MongoDB helper
  const saveTripChanges = async (updatedTrip: Trip) => {
    setSaveLoading(true);
    try {
      const saved = await apiTrips.update(id, {
        itinerary: updatedTrip.itinerary,
        packingChecklist: updatedTrip.packingChecklist,
        estimatedBudget: updatedTrip.estimatedBudget,
      });
      setTrip(saved);
    } catch (err) {
      console.error('Failed to sync changes with database:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  // Add a manual activity to the active day
  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityText.trim() || !trip) return;

    const updatedItinerary = trip.itinerary.map((dayPlan) => {
      if (dayPlan.day === activeDay) {
        return {
          ...dayPlan,
          activities: [...dayPlan.activities, newActivityText.trim()],
        };
      }
      return dayPlan;
    });

    const updatedTrip = { ...trip, itinerary: updatedItinerary };
    setTrip(updatedTrip);
    setNewActivityText('');
    await saveTripChanges(updatedTrip);
  };

  // Remove an activity from the active day
  const handleRemoveActivity = async (activityIndex: number) => {
    if (!trip) return;

    const updatedItinerary = trip.itinerary.map((dayPlan) => {
      if (dayPlan.day === activeDay) {
        return {
          ...dayPlan,
          activities: dayPlan.activities.filter((_, idx) => idx !== activityIndex),
        };
      }
      return dayPlan;
    });

    const updatedTrip = { ...trip, itinerary: updatedItinerary };
    setTrip(updatedTrip);
    await saveTripChanges(updatedTrip);
  };

  // Regenerate an entire day using AI instructions
  const handleRegenerateDay = async () => {
    if (!regenPrompt.trim() || !trip) return;

    setRegenLoading(true);
    try {
      const updatedTrip = await apiTrips.regenerateDay(id, activeDay, regenPrompt.trim());
      setTrip(updatedTrip);
      setRegenPrompt('');
    } catch (err: any) {
      alert(err.message || 'Error regenerating day activities.');
    } finally {
      setRegenLoading(false);
    }
  };

  // --- PACKING CHECKLIST METHODS ---

  // Toggle checklist checkmark (persists immediately to DB)
  const handleTogglePackingItem = async (itemId: string) => {
    if (!trip) return;

    const updatedChecklist = trip.packingChecklist.map((item) => {
      if (item._id === itemId) {
        return { ...item, packed: !item.packed };
      }
      return item;
    });

    const updatedTrip = { ...trip, packingChecklist: updatedChecklist };
    setTrip(updatedTrip);
    await saveTripChanges(updatedTrip);
  };

  // Add custom item to checklist (persists to DB)
  const handleAddPackingItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackingText.trim() || !trip) return;

    // Create a temporary mock ID that the backend replaces
    const newItem: PackingItem = {
      _id: Math.random().toString(),
      name: newPackingText.trim(),
      category: newPackingCat,
      packed: false,
    };

    const updatedTrip = {
      ...trip,
      packingChecklist: [...trip.packingChecklist, newItem],
    };

    setTrip(updatedTrip);
    setNewPackingText('');
    await saveTripChanges(updatedTrip);
  };

  if (authLoading || (loading && !trip)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090a0f]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-sm text-gray-400">Loading trip details...</span>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090a0f] p-6 text-center">
        <div className="glass-panel max-w-md p-8 rounded-2xl border border-red-500/10">
          <p className="text-red-300 font-semibold mb-6">{error || 'Trip not found'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold hover:bg-white/10 text-white transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Filter packing checklist items
  const filteredPackingItems = trip.packingChecklist.filter((item) => {
    if (packingTab === 'All') return true;
    return item.category === packingTab;
  });

  return (
    <div className="min-h-screen flex flex-col justify-between relative px-6 py-6 md:px-12 max-w-7xl mx-auto w-full overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-500/5 blur-[120px] pointer-events-none" />

      {/* Top Banner Navigation */}
      <header className="flex justify-between items-center py-4 border-b border-white/5 mb-8 z-10">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:transform group-hover:translate-x-[-2px] transition-transform duration-200" />
          Dashboard
        </button>

        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          {saveLoading ? 'Syncing...' : 'Saved to Cloud'}
        </div>
      </header>

      {/* Hero Header */}
      <div className="mb-8 z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold font-outfit text-white tracking-tight">
          Trip to {trip.destination}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mt-4">
          <div className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 px-3 py-1.5 rounded-xl border border-indigo-500/15 font-semibold">
            <Calendar className="w-4 h-4" />
            {trip.duration} {trip.duration === 1 ? 'Day' : 'Days'}
          </div>
          <div className="flex items-center gap-1.5 bg-fuchsia-500/10 text-fuchsia-300 px-3 py-1.5 rounded-xl border border-fuchsia-500/15 font-semibold">
            <Wallet className="w-4 h-4" />
            {trip.budgetLevel} Budget
          </div>
          <div className="flex items-center gap-1.5 bg-teal-500/10 text-teal-300 px-3 py-1.5 rounded-xl border border-teal-500/15 font-semibold">
            <MapPin className="w-4 h-4" />
            {trip.destination}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 flex-1">
        
        {/* Left Column: Itinerary Live Editor (8 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/5 flex-1 flex flex-col justify-between">
            <div>
              {/* Day Selector Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-white/5 scrollbar-thin">
                {trip.itinerary.map((dayPlan) => (
                  <button
                    key={dayPlan.day}
                    onClick={() => setActiveDay(dayPlan.day)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 shrink-0 ${
                      activeDay === dayPlan.day
                        ? 'bg-gradient-to-tr from-indigo-500 to-fuchsia-500 text-white shadow-lg'
                        : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    Day {dayPlan.day}
                  </button>
                ))}
              </div>

              {/* Day Theme */}
              {trip.itinerary.find((d) => d.day === activeDay)?.theme && (
                <div className="mb-6 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-0.5">Day Theme</p>
                  <p className="text-sm font-semibold text-gray-200">
                    {trip.itinerary.find((d) => d.day === activeDay)?.theme}
                  </p>
                </div>
              )}

              {/* Activity list */}
              <h3 className="text-lg font-bold font-outfit text-white mb-4">Activities</h3>
              <div className="space-y-3 mb-6">
                {trip.itinerary.find((d) => d.day === activeDay)?.activities.length === 0 ? (
                  <p className="text-sm text-gray-500 italic py-4 text-center">No activities scheduled for this day yet.</p>
                ) : (
                  trip.itinerary.find((d) => d.day === activeDay)?.activities.map((activity, index) => (
                    <div
                      key={index}
                      className="group flex justify-between items-start p-4 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 hover:bg-black/30 transition-all duration-200"
                    >
                      <span className="text-sm text-gray-300 leading-relaxed pr-4">{activity}</span>
                      <button
                        onClick={() => handleRemoveActivity(index)}
                        className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        title="Remove Activity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Manual Add Activity input */}
              <form onSubmit={handleAddActivity} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newActivityText}
                  onChange={(e) => setNewActivityText(e.target.value)}
                  placeholder="Add custom activity (e.g. 8:00 PM - Dinner at local cafe)..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-bold hover:bg-indigo-600 transition-colors duration-200 flex items-center justify-center gap-1 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </form>
            </div>

            {/* AI Day Regeneration box */}
            <div className="border-t border-white/5 mt-8 pt-6">
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-outfit">
                <Sparkles className="w-4 h-4 text-fuchsia-400 animate-pulse" />
                Ask AI Agent to Regenerate Day {activeDay}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={regenPrompt}
                  onChange={(e) => setRegenPrompt(e.target.value)}
                  placeholder="e.g. Regenerate with more hiking and nature trails..."
                  disabled={regenLoading}
                  className="flex-1 px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                />
                <button
                  onClick={handleRegenerateDay}
                  disabled={regenLoading || !regenPrompt.trim()}
                  className="px-5 py-3 rounded-xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 text-white text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-40 disabled:pointer-events-none"
                >
                  {regenLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    'Regenerate'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Widgets / Budget / Packing List (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Weather Widget */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5">
            <h3 className="flex items-center gap-2 text-lg font-bold font-outfit text-white mb-3">
              <CloudSun className="w-5 h-5 text-indigo-400 animate-pulse" />
              Weather Forecast
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              {trip.weatherForecast}
            </p>
          </div>

          {/* Dynamic Packing Checklist (Creative Feature) */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5">
            <h3 className="flex items-center gap-2 text-lg font-bold font-outfit text-white mb-2">
              <CheckSquare className="w-5 h-5 text-fuchsia-400" />
              Smart Packing Checklist
            </h3>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              Dynamically suggested by AI based on your destination weather and interests.
            </p>

            {/* Checklist Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none">
              {(['All', 'Essentials', 'Clothing', 'Gear', 'Toiletries'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPackingTab(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
                    packingTab === cat
                      ? 'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20'
                      : 'bg-white/5 text-gray-400 border border-transparent hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Checklist Items */}
            <div className="space-y-2 max-h-56 overflow-y-auto mb-4 scrollbar-thin pr-1">
              {filteredPackingItems.length === 0 ? (
                <p className="text-xs text-gray-500 italic py-4 text-center">No items found in this category.</p>
              ) : (
                filteredPackingItems.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => handleTogglePackingItem(item._id!)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-black/10 border border-white/5 hover:bg-black/20 text-left transition-all duration-200"
                  >
                    <div className="flex items-center gap-2.5 pr-4">
                      {item.packed ? (
                        <CheckSquare className="w-4 h-4 text-fuchsia-500 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-500 shrink-0" />
                      )}
                      <span className={`text-xs ${item.packed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-white/5 text-gray-500">
                      {item.category}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Add Custom Packing Item */}
            <form onSubmit={handleAddPackingItem} className="flex gap-1.5 mt-2 border-t border-white/5 pt-4">
              <input
                type="text"
                required
                value={newPackingText}
                onChange={(e) => setNewPackingText(e.target.value)}
                placeholder="Add custom packing item..."
                className="flex-1 px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-fuchsia-500"
              />
              <select
                value={newPackingCat}
                onChange={(e) => setNewPackingCat(e.target.value as any)}
                className="bg-black/30 border border-white/10 text-gray-400 text-xs rounded-xl px-2 py-2 focus:outline-none focus:text-white"
              >
                <option value="Essentials">Essentials</option>
                <option value="Clothing">Clothing</option>
                <option value="Gear">Gear</option>
                <option value="Toiletries">Toiletries</option>
                <option value="Other">Other</option>
              </select>
              <button
                type="submit"
                className="p-2 bg-fuchsia-500 hover:bg-fuchsia-600 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Budget Widget */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="flex items-center gap-2 text-lg font-bold font-outfit text-white">
                <DollarSign className="w-5 h-5 text-teal-400" />
                Budget Estimation
              </h3>
              <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                Total: ${trip.estimatedBudget.total}
              </span>
            </div>

            {/* Visual Budget Progress Bars */}
            <div className="space-y-4">
              {[
                { label: 'Flights', value: trip.estimatedBudget.flights, color: 'bg-indigo-500' },
                { label: 'Accommodation', value: trip.estimatedBudget.accommodation, color: 'bg-fuchsia-500' },
                { label: 'Food & Meals', value: trip.estimatedBudget.food, color: 'bg-teal-500' },
                { label: 'Activities & Ent.', value: trip.estimatedBudget.activities, color: 'bg-amber-500' },
              ].map((item) => {
                const percentage = Math.round((item.value / trip.estimatedBudget.total) * 100) || 0;
                return (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-gray-200">${item.value} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hotels Suggestions Widget */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5">
            <h3 className="flex items-center gap-2 text-lg font-bold font-outfit text-white mb-4">
              <HotelIcon className="w-5 h-5 text-indigo-400" />
              Recommended Hotels
            </h3>
            <div className="space-y-3">
              {trip.hotels.map((hotel, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5"
                >
                  <div>
                    <h4 className="text-sm font-bold text-gray-200">{hotel.name}</h4>
                    <p className="text-xs text-indigo-400 font-semibold mt-0.5">{hotel.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-yellow-500 font-bold">{hotel.rating}</p>
                    {hotel.priceEstimate && (
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">{hotel.priceEstimate}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="w-full py-6 mt-16 border-t border-white/5 text-center text-xs text-gray-500 z-10">
        &copy; 2026 AeroPlan. Safe and isolated sandbox.
      </footer>
    </div>
  );
}
