import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  time: String,
  activity: String,
  location: String,
});

const DailyItinerarySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
  },
  theme: String,
  activities: {
    type: [String],
    required: true,
  },
});

const EstimatedBudgetSchema = new mongoose.Schema({
  flights: Number,
  accommodation: Number,
  food: Number,
  activities: Number,
  total: Number,
});

const HotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String, // 'Budget Friendly' | 'Mid Range' | 'Luxury'
    required: true,
  },
  rating: {
    type: String, // e.g., '4.5 stars'
    required: true,
  },
  priceEstimate: String,
});

const PackingItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String, // 'Essentials' | 'Clothing' | 'Gear' | 'Toiletries' | 'Other'
    required: true,
  },
  packed: {
    type: Boolean,
    default: false,
  },
});

const TripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // index for quick user-level queries
    },
    destination: {
      type: String,
      required: [true, 'Please add a destination'],
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Please add trip duration in days'],
      min: [1, 'Duration must be at least 1 day'],
      max: [30, 'Duration cannot exceed 30 days'],
    },
    budgetLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: [true, 'Please select a budget level'],
    },
    interests: {
      type: [String],
      default: [],
    },
    itinerary: {
      type: [DailyItinerarySchema],
      required: true,
    },
    estimatedBudget: {
      type: EstimatedBudgetSchema,
      required: true,
    },
    hotels: {
      type: [HotelSchema],
      default: [],
    },
    weatherForecast: {
      type: String,
      default: 'Sunny and pleasant',
    },
    packingChecklist: {
      type: [PackingItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Trip', TripSchema);
