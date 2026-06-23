import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Trip from '../models/Trip';
import { generateTrip, regenerateDay } from '../services/ai';

// @desc    Create a new trip itinerary using AI
// @route   POST /api/trips
// @access  Private
export const createTripItinerary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { destination, duration, budgetLevel, interests } = req.body;

    if (!destination || !duration || !budgetLevel) {
      res.status(400).json({ message: 'Destination, duration, and budgetLevel are required' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Call AI service to generate itinerary, budget, hotels, weather, packing checklist
    const aiData = await generateTrip({
      destination,
      duration: Number(duration),
      budgetLevel,
      interests: interests || [],
    });

    // Create the trip document in DB
    const trip = await Trip.create({
      userId: req.user.id,
      destination,
      duration: Number(duration),
      budgetLevel,
      interests: interests || [],
      itinerary: aiData.itinerary,
      estimatedBudget: aiData.estimatedBudget,
      hotels: aiData.hotels,
      weatherForecast: aiData.weatherForecast,
      packingChecklist: aiData.packingChecklist,
    });

    res.status(201).json(trip);
  } catch (error: any) {
    console.error('Create trip error:', error);
    res.status(500).json({ message: 'Server error generating trip', error: error.message });
  }
};

// @desc    Get all trips of the logged-in user
// @route   GET /api/trips
// @access  Private
export const getMyTrips = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Find only trips belonging to this user
    const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error: any) {
    console.error('Get trips error:', error);
    res.status(500).json({ message: 'Server error fetching trips', error: error.message });
  }
};

// @desc    Get trip by ID (with strict user ownership verification)
// @route   GET /api/trips/:id
// @access  Private
export const getTripById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }

    // Strict authorization check: Check if trip belongs to the requesting user
    if (trip.userId.toString() !== req.user.id) {
      res.status(403).json({ message: 'Not authorized to access this trip' });
      return;
    }

    res.json(trip);
  } catch (error: any) {
    console.error('Get trip by ID error:', error);
    res.status(500).json({ message: 'Server error retrieving trip details', error: error.message });
  }
};

// @desc    Update trip details (e.g. itinerary edits, checking off packing checklist)
// @route   PUT /api/trips/:id
// @access  Private
export const updateTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }

    // Authorization check
    if (trip.userId.toString() !== req.user.id) {
      res.status(403).json({ message: 'Not authorized to update this trip' });
      return;
    }

    // Fields that can be updated directly: itinerary, packingChecklist, hotels, weatherForecast
    const { itinerary, packingChecklist, hotels, weatherForecast, estimatedBudget } = req.body;

    if (itinerary !== undefined) trip.itinerary = itinerary;
    if (packingChecklist !== undefined) trip.packingChecklist = packingChecklist;
    if (hotels !== undefined) trip.hotels = hotels;
    if (weatherForecast !== undefined) trip.weatherForecast = weatherForecast;
    if (estimatedBudget !== undefined) trip.estimatedBudget = estimatedBudget;

    const updatedTrip = await trip.save();
    res.json(updatedTrip);
  } catch (error: any) {
    console.error('Update trip error:', error);
    res.status(500).json({ message: 'Server error updating trip', error: error.message });
  }
};

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private
export const deleteTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }

    // Authorization check
    if (trip.userId.toString() !== req.user.id) {
      res.status(403).json({ message: 'Not authorized to delete this trip' });
      return;
    }

    await trip.deleteOne();
    res.json({ message: 'Trip deleted successfully' });
  } catch (error: any) {
    console.error('Delete trip error:', error);
    res.status(500).json({ message: 'Server error deleting trip', error: error.message });
  }
};

// @desc    Regenerate a specific day's activities using AI
// @route   POST /api/trips/:id/regenerate-day
// @access  Private
export const regenerateTripDay = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { day, prompt } = req.body;

    if (day === undefined || !prompt) {
      res.status(400).json({ message: 'Day and prompt instruction are required' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      res.status(404).json({ message: 'Trip not found' });
      return;
    }

    // Authorization check
    if (trip.userId.toString() !== req.user.id) {
      res.status(403).json({ message: 'Not authorized to modify this trip' });
      return;
    }

    // Find the day in current itinerary
    const currentDayItinerary = trip.itinerary.find((item) => item.day === Number(day));
    if (!currentDayItinerary) {
      res.status(400).json({ message: `Day ${day} does not exist in this itinerary` });
      return;
    }

    // Call AI service to regenerate the day
    const input = {
      destination: trip.destination,
      duration: trip.duration,
      budgetLevel: trip.budgetLevel as 'Low' | 'Medium' | 'High',
      interests: trip.interests,
    };

    const updatedDayData = await regenerateDay(
      input,
      trip.itinerary as any,
      Number(day),
      prompt
    );

    // Update the day in the trip object
    currentDayItinerary.theme = updatedDayData.theme;
    currentDayItinerary.activities = updatedDayData.activities;

    // Save and return
    const updatedTrip = await trip.save();
    res.json(updatedTrip);
  } catch (error: any) {
    console.error('Regenerate day error:', error);
    res.status(500).json({ message: 'Server error regenerating trip day', error: error.message });
  }
};
