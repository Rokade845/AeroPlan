"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { apiTrips, Trip } from '../../utils/api';
import { Compass, Calendar, Plus, LogOut, Trash2, MapPin, DollarSign, Loader2, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const fetchTrips = async () => {
    setTripsLoading(true);
    try {
      const data = await apiTrips.getAll();
      setTrips(data);
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setTripsLoading(false);
    }
  };

  const handleDeleteTrip = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation(); // prevent card click redirect
    e.preventDefault();

    if (!confirm('Are you sure you want to delete this trip itinerary?')) {
      return;
    }

    setDeleteLoading(tripId);
    try {
      await apiTrips.delete(tripId);
      setTrips(trips.filter((t) => t._id !== tripId));
    } catch (error) {
      alert('Failed to delete trip. Please try again.');
      console.error(error);
    } finally {
      setDeleteLoading(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090a0f]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-sm text-gray-400">Verifying session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between relative px-6 py-6 md:px-12 max-w-7xl mx-auto w-full overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-500/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="flex justify-between items-center py-4 border-b border-white/5 mb-8 z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
            <Compass className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <span className="text-lg font-bold font-outfit text-white tracking-wider">AeroPlan</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Logged in as</p>
            <p className="text-sm font-bold text-gray-300">{user?.name}</p>
          </div>
          <button
            onClick={logout}
            className="p-2.5 rounded-xl border border-white/10 hover:border-red-500/20 text-gray-400 hover:text-red-400 bg-white/5 hover:bg-red-500/5 transition-all duration-200"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Dashboard Panel */}
      <main className="flex-1 z-10">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-outfit text-white">
              Welcome back, {user?.name.split(' ')[0]}
            </h1>
            <p className="text-gray-400 text-sm mt-1">Explore your previous itineraries or design a new one.</p>
          </div>

          <Link
            href="/trips/new"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-bold tracking-wide shadow-lg shadow-indigo-500/20 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Plan New Trip
          </Link>
        </div>

        {/* Trips List / Grid */}
        {tripsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-panel h-52 rounded-2xl p-6 relative overflow-hidden animate-pulse">
                <div className="h-6 w-32 bg-white/10 rounded mb-4" />
                <div className="h-4 w-24 bg-white/10 rounded mb-3" />
                <div className="h-4 w-40 bg-white/10 rounded mb-8" />
                <div className="flex justify-between items-center">
                  <div className="h-4 w-16 bg-white/10 rounded" />
                  <div className="h-10 w-24 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          /* Empty State */
          <div className="glass-panel max-w-lg mx-auto rounded-3xl p-12 text-center border border-white/5 shadow-xl mt-12 animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold font-outfit text-white mb-2">No itineraries found</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
              Ready to travel? Use our AI travel assistant to build a customized day-by-day itinerary in seconds.
            </p>
            <Link
              href="/trips/new"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-bold tracking-wide shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all duration-200"
            >
              <Sparkles className="w-4 h-4" />
              Create Your First Plan
            </Link>
          </div>
        ) : (
          /* Trips Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {trips.map((trip) => (
              <Link
                key={trip._id}
                href={`/trips/${trip._id}`}
                className="glass-panel-interactive rounded-2xl p-6 flex flex-col justify-between border border-white/5 group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5" />
                      {trip.destination.split(',')[0]}
                    </div>
                    
                    <button
                      onClick={(e) => handleDeleteTrip(e, trip._id)}
                      disabled={deleteLoading === trip._id}
                      className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                      title="Delete Trip"
                    >
                      {deleteLoading === trip._id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <h3 className="text-2xl font-bold font-outfit text-white tracking-tight group-hover:text-indigo-300 transition-colors duration-200">
                    Trip to {trip.destination}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-400 mt-4 font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {trip.duration} {trip.duration === 1 ? 'Day' : 'Days'}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <DollarSign className="w-3.5 h-3.5" />
                      {trip.budgetLevel} Budget
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/5 mt-6 pt-4 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Created {new Date(trip.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-xs font-bold text-indigo-400 group-hover:underline flex items-center gap-1">
                    View Details &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-6 mt-16 border-t border-white/5 text-center text-xs text-gray-500 z-10">
        &copy; 2026 AeroPlan. Secure and isolated sandbox.
      </footer>
    </div>
  );
}
