import express from 'express';
import {
  createTripItinerary,
  getMyTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  regenerateTripDay,
} from '../controllers/tripController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply protect middleware to all routes in this router
router.use(protect);

router.route('/')
  .post(createTripItinerary)
  .get(getMyTrips);

router.route('/:id')
  .get(getTripById)
  .put(updateTrip)
  .delete(deleteTrip);

router.post('/:id/regenerate-day', regenerateTripDay);

export default router;
