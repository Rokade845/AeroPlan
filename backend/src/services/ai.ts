import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API client if key is available
const apiKey = process.env.GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn('GEMINI_API_KEY not found in environment. Backend will run in MOCK MODE.');
}

export interface TripInput {
  destination: string;
  duration: number;
  budgetLevel: 'Low' | 'Medium' | 'High';
  interests: string[];
}

export interface TripAIResponse {
  itinerary: {
    day: number;
    theme: string;
    activities: string[];
  }[];
  estimatedBudget: {
    flights: number;
    accommodation: number;
    food: number;
    activities: number;
    total: number;
  };
  hotels: {
    name: string;
    category: 'Budget Friendly' | 'Mid Range' | 'Luxury';
    rating: string;
    priceEstimate: string;
  }[];
  weatherForecast: string;
  packingChecklist: {
    name: string;
    category: 'Essentials' | 'Clothing' | 'Gear' | 'Toiletries' | 'Other';
    packed: boolean;
  }[];
}

// Generate the initial trip itinerary
export const generateTrip = async (input: TripInput): Promise<TripAIResponse> => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });

      const prompt = `
        You are an expert AI Travel Planner. Generate a detailed, high-quality travel plan for the following inputs:
        - Destination: ${input.destination}
        - Duration: ${input.duration} days
        - Budget preference: ${input.budgetLevel}
        - Interests: ${input.interests.join(', ')}

        You must reply with a valid JSON object matching this schema. Do not output any markdown wrapping or other text besides the JSON.
        
        JSON Schema:
        {
          "itinerary": [
            {
              "day": 1,
              "theme": "Short description of the theme for the day",
              "activities": [
                "Detailed description of activity 1",
                "Detailed description of activity 2",
                "Detailed description of activity 3"
              ]
            }
          ],
          "estimatedBudget": {
            "flights": number (typical flight cost to this destination for one person based on budget level),
            "accommodation": number (accommodation cost for the entire stay based on budget level),
            "food": number (food expenses for the entire stay based on budget level),
            "activities": number (activity costs for the entire stay based on budget level),
            "total": number (sum of the above values)
          },
          "hotels": [
            {
              "name": "Name of Recommended Hotel 1",
              "category": "Budget Friendly",
              "rating": "Rating (e.g. 4.5 stars)",
              "priceEstimate": "Estimated price range per night"
            },
            {
              "name": "Name of Recommended Hotel 2",
              "category": "Mid Range",
              "rating": "Rating",
              "priceEstimate": "Estimated price range per night"
            },
            {
              "name": "Name of Recommended Hotel 3",
              "category": "Luxury",
              "rating": "Rating",
              "priceEstimate": "Estimated price range per night"
            }
          ],
          "weatherForecast": "A brief summary of what the weather is typically like at this destination for travelers.",
          "packingChecklist": [
            {
              "name": "Name of item to pack (e.g. Passport, specific clothing, adapter, gear based on interests like camera for culture, hiking shoes for adventure)",
              "category": "Essentials" | "Clothing" | "Gear" | "Toiletries" | "Other",
              "packed": false
            }
          ]
        }

        Make sure you provide at least 3-4 activities per day. Provide 3 hotel recommendations (one for each category: Budget Friendly, Mid Range, Luxury).
        Generate at least 8-12 packing items matching the duration, destination, and interests.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const responseObj = JSON.parse(text) as TripAIResponse;
      return responseObj;
    } catch (error) {
      console.error('Error generating trip with Gemini:', error);
      console.log('Falling back to local mock generation...');
    }
  }

  // Fallback / Mock Mode
  return getMockTrip(input);
};

// Regenerate a single day's itinerary
export const regenerateDay = async (
  input: TripInput,
  currentItinerary: { day: number; theme: string; activities: string[] }[],
  dayToRegenerate: number,
  userPrompt: string
): Promise<{ theme: string; activities: string[] }> => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });

      const prompt = `
        You are an AI Travel Planner modifying an existing itinerary.
        The user wants to regenerate Day ${dayToRegenerate} of their trip to ${input.destination}.
        
        Current trip context:
        - Destination: ${input.destination}
        - Budget Preference: ${input.budgetLevel}
        - Overall Interests: ${input.interests.join(', ')}
        - Current full itinerary details: ${JSON.stringify(currentItinerary)}
        
        Specific instruction from the user for Day ${dayToRegenerate}:
        "${userPrompt}"

        You must regenerate Day ${dayToRegenerate}'s itinerary. You must respond with a JSON object containing the replacement values for that day ONLY. Do not output any other text besides the JSON.

        JSON Schema:
        {
          "theme": "Updated day theme description",
          "activities": [
            "Updated activity 1",
            "Updated activity 2",
            "Updated activity 3",
            "Updated activity 4"
          ]
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const responseObj = JSON.parse(text) as { theme: string; activities: string[] };
      return responseObj;
    } catch (error) {
      console.error('Error regenerating day with Gemini:', error);
      console.log('Falling back to local mock day regeneration...');
    }
  }

  // Mock Day Regeneration
  return getMockRegeneratedDay(dayToRegenerate, userPrompt, input);
};

// --- MOCK ENGINE LOCAL LOGIC ---
const getMockTrip = (input: TripInput): TripAIResponse => {
  const { destination, duration, budgetLevel, interests } = input;

  // Base pricing based on budget level
  let flightCost = 350;
  let hotelCostPerNight = 80;
  let foodCostPerDay = 30;
  let activityCostPerDay = 20;

  if (budgetLevel === 'Medium') {
    flightCost = 550;
    hotelCostPerNight = 150;
    foodCostPerDay = 60;
    activityCostPerDay = 45;
  } else if (budgetLevel === 'High') {
    flightCost = 950;
    hotelCostPerNight = 350;
    foodCostPerDay = 120;
    activityCostPerDay = 100;
  }

  const accommodation = hotelCostPerNight * duration;
  const food = foodCostPerDay * duration;
  const activitiesTotal = activityCostPerDay * duration;
  const total = flightCost + accommodation + food + activitiesTotal;

  // Generate activities dynamically based on interests
  const itinerary = [];
  const interestPool = interests.length > 0 ? interests : ['Sightseeing', 'Culture', 'Food'];

  const activityOptions: { [key: string]: string[] } = {
    food: [
      'Join a guided street food walking tour in the foodie district',
      'Attend a hands-on local cooking class with a professional chef',
      'Visit a traditional farmer\'s market and sample local artisanal cheese and wine',
      'Dine at a renowned local bistro specializing in regional heritage dishes',
      'Enjoy breakfast at a historic, local coffee house',
      'Embark on a brewery or vineyard tasting tour'
    ],
    culture: [
      'Take a guided tour of the famous historical palace or cathedral',
      'Explore the national history museum and art gallery exhibits',
      'Attend an evening theater performance or live traditional folk dance',
      'Walk through the oldest preservation quarter and architecture tour',
      'Visit a local spiritual temple or landmark building'
    ],
    adventure: [
      'Go on a scenic early morning hike to a panoramic valley viewpoint',
      'Embark on an exciting outdoor adventure activity (ziplining/kayaking)',
      'Rent bikes and explore a forest trail or park path',
      'Take a boat tour along the coastline or central river',
      'Participate in a guided wilderness wildlife safari tour'
    ],
    shopping: [
      'Explore the main shopping avenue and upscale designer boutiques',
      'Bargain hunting at the sprawling central flea market',
      'Browse local craft shops and souvenir stores',
      'Visit a modern glass-domed department store complex',
      'Stroll through an evening artisan craft fair'
    ],
    relaxation: [
      'Spend a quiet morning relaxing at the main local beach or lakefront',
      'Indulge in a premium thermal spa treatment and massage center',
      'Stroll leisurely through the city botanic gardens and greenhouse',
      'Unwind at a cozy rooftop lounge overlooking the city skyline',
      'Enjoy a scenic picnic in a quiet public meadow'
    ]
  };

  const genericActivities = [
    'Take a hop-on hop-off city sightseeing bus tour',
    'Visit the iconic central town square and watch street performers',
    'Walk across the historic bridge and check out local street artists',
    'Climb up to the city tower or viewpoint for sunset photos',
    'Relax in a central park and read a book or people-watch'
  ];

  for (let d = 1; d <= duration; d++) {
    const dayActivities: string[] = [];
    const dayInterest = interestPool[(d - 1) % interestPool.length].toLowerCase();
    
    // Choose theme based on interest
    let theme = `Discovering local ${dayInterest}`;
    if (dayInterest === 'food') theme = 'Culinary Journeys & Local Flavors';
    else if (dayInterest === 'culture') theme = 'Historical Landmarks & Heritage';
    else if (dayInterest === 'adventure') theme = 'Scenic Trails & Outdoor Thrills';
    else if (dayInterest === 'shopping') theme = 'Bustling Markets & Artisan Finds';
    else if (dayInterest === 'relaxation') theme = 'Unwinding & Scenic Relaxation';

    const pool = activityOptions[dayInterest] || genericActivities;
    // select 3 distinct activities from pool
    const selected = [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);
    
    dayActivities.push(`Morning: ${selected[0]}`);
    dayActivities.push(`Afternoon: ${selected[1]}`);
    dayActivities.push(`Evening: ${selected[2]}`);
    
    // add a generic fourth activity
    const generic = genericActivities[Math.floor(Math.random() * genericActivities.length)];
    dayActivities.push(`Night: ${generic}`);

    itinerary.push({
      day: d,
      theme,
      activities: dayActivities,
    });
  }

  // Generate packing list based on interests
  const packingChecklist: TripAIResponse['packingChecklist'] = [
    { name: 'Passport, Visas & Travel ID Documents', category: 'Essentials' as const, packed: false },
    { name: 'Copies of Bookings & Insurance Documents', category: 'Essentials' as const, packed: false },
    { name: 'Universal Travel Power Adapter', category: 'Essentials' as const, packed: false },
    { name: 'Toothbrush, Toothpaste & Floss', category: 'Toiletries' as const, packed: false },
    { name: 'Travel-size Shampoo & Body Wash', category: 'Toiletries' as const, packed: false },
    { name: 'Comfortable Walking Shoes', category: 'Clothing' as const, packed: false },
    { name: 'Versatile layering shirts and jacket', category: 'Clothing' as const, packed: false },
    { name: 'Undergarments & Socks (enough for duration)', category: 'Clothing' as const, packed: false },
  ];

  if (interests.includes('Adventure')) {
    packingChecklist.push({ name: 'Hiking boots / sturdy outdoor footwear', category: 'Gear' as const, packed: false });
    packingChecklist.push({ name: 'Refillable insulated water bottle', category: 'Gear' as const, packed: false });
    packingChecklist.push({ name: 'Quick-dry athletic clothes & rain jacket', category: 'Clothing' as const, packed: false });
  }
  if (interests.includes('Food')) {
    packingChecklist.push({ name: 'Digestive aids & travel medicine kit', category: 'Toiletries' as const, packed: false });
  }
  if (interests.includes('Culture')) {
    packingChecklist.push({ name: 'Good camera or smartphone with high storage', category: 'Gear' as const, packed: false });
    packingChecklist.push({ name: 'Modest clothing for visiting temples/churches', category: 'Clothing' as const, packed: false });
  }
  if (interests.includes('Shopping')) {
    packingChecklist.push({ name: 'Foldable lightweight duffel bag for souvenirs', category: 'Gear' as const, packed: false });
  }
  if (duration > 5) {
    packingChecklist.push({ name: 'Mini laundry detergent packets', category: 'Other' as const, packed: false });
  }

  // Hotels based on destination
  const hotels = [
    {
      name: `${destination} Cozy Inn`,
      category: 'Budget Friendly' as const,
      rating: '4.1 stars',
      priceEstimate: `$${Math.round(hotelCostPerNight * 0.6)} - $${Math.round(hotelCostPerNight * 0.8)} / night`
    },
    {
      name: `${destination} Plaza Grand Hotel`,
      category: 'Mid Range' as const,
      rating: '4.5 stars',
      priceEstimate: `$${Math.round(hotelCostPerNight * 0.9)} - $${Math.round(hotelCostPerNight * 1.2)} / night`
    },
    {
      name: `The Royal Imperial Resort & Spa ${destination}`,
      category: 'Luxury' as const,
      rating: '4.8 stars',
      priceEstimate: `$${Math.round(hotelCostPerNight * 2.0)} - $${Math.round(hotelCostPerNight * 3.0)} / night`
    }
  ];

  const weatherForecast = `Typically mild and pleasant in ${destination} for travel. Expected temperatures range from 15°C to 25°C. Check localized conditions closer to departure.`;

  return {
    itinerary,
    estimatedBudget: {
      flights: flightCost,
      accommodation,
      food,
      activities: activitiesTotal,
      total,
    },
    hotels,
    weatherForecast,
    packingChecklist,
  };
};

const getMockRegeneratedDay = (
  day: number,
  prompt: string,
  input: TripInput
): { theme: string; activities: string[] } => {
  const lowercasePrompt = prompt.toLowerCase();
  
  let theme = `Regenerated Day ${day}`;
  let activities = [
    'Morning: Relaxed start and breakfast at the hotel cafe',
    `Afternoon: Exploration inspired by: "${prompt}"`,
    'Evening: Enjoy a nice dinner and walk around the local neighborhood',
    'Night: Rest and prepare for the next day\'s adventure'
  ];

  if (lowercasePrompt.includes('outdoor') || lowercasePrompt.includes('adventure') || lowercasePrompt.includes('nature') || lowercasePrompt.includes('hike')) {
    theme = 'Outdoor Exploration & Nature Trails';
    activities = [
      'Morning: Set off early for a spectacular scenic nature hike',
      'Afternoon: Picnic lunch followed by kayaking or forest canopy walk',
      'Evening: Sunset viewing from a high ridge or lakeside park',
      'Night: Campfire dinner or hearty meal at an rustic mountain lodge'
    ];
  } else if (lowercasePrompt.includes('food') || lowercasePrompt.includes('eat') || lowercasePrompt.includes('culinary') || lowercasePrompt.includes('cooking')) {
    theme = 'Gourmet Discoveries & Local Eats';
    activities = [
      'Morning: Breakfast bakery crawl through the older neighborhood markets',
      'Afternoon: Interactive local ingredients tasting & food tour',
      'Evening: Hands-on chef masterclass to cook traditional recipes',
      'Night: Multi-course dining experience at a secret dining club'
    ];
  } else if (lowercasePrompt.includes('museum') || lowercasePrompt.includes('history') || lowercasePrompt.includes('culture') || lowercasePrompt.includes('art')) {
    theme = 'Art Galleries & Historic Landmarks';
    activities = [
      'Morning: Skip-the-line guided tour of the city\'s historic castle/monument',
      'Afternoon: Visit the modern museum of art and historical archives',
      'Evening: Walking tour of historic lanes and architectural heritage sites',
      'Night: Live concert or cultural theater show'
    ];
  } else if (lowercasePrompt.includes('shopping') || lowercasePrompt.includes('market') || lowercasePrompt.includes('buy')) {
    theme = 'Bargain Hunting & Shopping Spree';
    activities = [
      'Morning: Visit the local artisan crafts market for handmade products',
      'Afternoon: Explore the fashionable boutiques and trendsetting avenues',
      'Evening: Tea break followed by souvenir buying and duty-free centers',
      'Night: Dine at a trendy food hall located inside the premium shopping complex'
    ];
  }

  return { theme, activities };
};
