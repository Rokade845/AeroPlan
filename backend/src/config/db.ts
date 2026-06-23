import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-travel-planner';
    
    // Redact password for security before logging
    const redactedURI = mongoURI.replace(/:([^:@]+)@/, ':****@');
    console.log(`Attempting to connect to MongoDB: ${redactedURI}`);

    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected successfully.');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // Do not call process.exit(1) so the Express server stays alive
  }
};
