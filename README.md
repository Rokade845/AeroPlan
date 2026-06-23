# AeroPlan | AI-Powered Travel Planner

AeroPlan is a multi-user, full-stack travel planner web application that generates complete travel itineraries, estimates trip budgets, suggests hotels, and compiles dynamic packing checklists using a generative AI agent.

This application is built in accordance with the Full Stack Engineering Assessment requirements, emphasizing clean architecture, strict data isolation, and visual design excellence.

---

## 🚀 Live Demo & Repository
- **GitHub Repository**: `Public repository or access granted`
- **Deployment URL**: `Frontend & Backend reachable URLs`
- **Walkthrough Video**: `3-4 minute walkthrough demonstration link`

---

## 🛠️ Chosen Tech Stack

We utilize the preferred stack for its robust performance, scalability, and developer ecosystem:

1. **Frontend**: **Next.js 15 (App Router)** + **Tailwind CSS v4** + **TypeScript**
   - **Justification**: Next.js App Router provides high-performance server-side compiling, file-based routing, and optimal static/dynamic page generation. Tailwind CSS v4 delivers a swift design utility workflow with modern CSS variables for a premium visual theme.
2. **Backend**: **Node.js** + **Express** + **TypeScript**
   - **Justification**: A separate Express API server provides clean division of labor. Express is fast, lightweight, and easily deployed, while TypeScript ensures strong type safety and robust contracts.
3. **Database**: **MongoDB** (via **Mongoose** ODM)
   - **Justification**: MongoDB's document model is perfect for storing hierarchical travel data (like nested days, activities, and checklists). Mongoose enforces strict validation schemas on top of a flexible document store.
4. **AI Integration**: **Gemini 1.5 Flash API** (via `@google/generative-ai` SDK)
   - **Justification**: Gemini 1.5 Flash offers high speed, low latency, structured JSON response mode, and a large context window, making it excellent for rapid itinerary creation.

---

## 📐 Architecture & System Design

```
+---------------------------------------+
|          Next.js Client (UI)          |
|    - App Router                       |
|    - Tailwind CSS / HSL Glows         |
|    - Local JWT / Session Cache        |
+---------------------------------------+
                   |
     HTTP Request  |  JWT Bearer Token Header
                   v
+---------------------------------------+
|          Express API Server           |
|    - Router & JWT Auth Middleware     |
|    - Controller (CRUD + AI logic)     |
+---------------------------------------+
          |                   |
          | Mongoose Connection| Generative SDK
          v                   v
+------------------+   +------------------+
|     MongoDB      |   |  Gemini AI API   |
|   (User/Trips)   |   |   (Mock Engine)  |
+------------------+   +------------------+
```

### 🔒 Authentication & Data Isolation Approach
- **JWT Authentication**: User passwords are encrypted using `bcryptjs` with a salt factor of 10 during sign-up. On login, the server signs a JSON Web Token (JWT) using a secure `JWT_SECRET`, which is sent to the client and stored in `localStorage`.
- **Authorization Guard**: The backend exposes a `protect` middleware that parses the `Authorization: Bearer <token>` header, verifies the signature, and injects the verified `userId` onto the request object.
- **Strict Data Isolation**: 
  - Every trip in the MongoDB database contains a `userId` reference field.
  - For all CRUD operations (`GET`, `PUT`, `DELETE`, `/regenerate-day`), the backend fetches the target trip and compares its owner ID (`trip.userId`) with the requesting user's ID (`req.user.id`).
  - If they do not match, the backend immediately returns a `403 Forbidden` response and terminates the call, preventing user data leaks.

### 🤖 AI Agent Design & Prompt Structure
The travel agent uses **Gemini 1.5 Flash** with JSON Mode configured (`responseMimeType: "application/json"`). This guarantees that responses comply exactly with a specified TypeScript schema, avoiding runtime JSON parsing exceptions.
- **Structured Prompts**: System instructions supply exact variables (`destination`, `duration`, `budgetLevel`, `interests`) and demand schema matches for itineraries, budget categories, hotels, weather descriptions, and packing items.
- **Mock Fallback Engine**: If no `GEMINI_API_KEY` is present in the server's environment variables, the backend automatically transitions to **Mock Mode**. It uses a local rules engine to dynamically build realistic, custom itineraries, budgets, and packing lists based on user destination and interests, ensuring that developers and assessors can evaluate the entire application flow out-of-the-box.

---

## 🎨 Creative/Custom Feature
### **Dynamic Weather & Interactive Packing Checklist Generator**
- **The Problem**: Packing is a friction point for travelers immediately after planning. Generic checklists fail to account for destination weather, duration, or trip goals (e.g. packing beachwear for culture trips, or hiking gear for budget sightseeing).
- **The Solution**: 
  - Alongside the itinerary, the AI agent estimates regional weather and designs a personalized checklist categorized into *Essentials*, *Clothing*, *Gear*, and *Toiletries*.
  - The checklist is tailored: selecting the `Adventure` interest adds outdoor gear (hiking boots, rain jackets); longer durations add laundry detergents; beach locations suggest swimwear.
  - **Dynamic State Persistence**: On the frontend, users can interactively check off items as they pack, or add their own custom items. These actions trigger PUT updates to the Express backend, keeping the checklist state persisted in MongoDB.

---

## 🛠️ Local Setup Instructions

### Prerequisites
- **Node.js** (v18+)
- **MongoDB** (running locally on port 27017, e.g. `mongodb://localhost:27017`)

### 1. Clone & Install
```bash
git clone <repo-url> ai-travel-planner
cd ai-travel-planner

# Install dependencies for both folders and the root development manager
npm install
npm run install:all
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` folder:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/ai-travel-planner
JWT_SECRET=travel_planner_super_secret_key_12345
GEMINI_API_KEY=your_optional_gemini_api_key_here
```

### 3. Run the Application
Start both the backend server and frontend development client simultaneously:
```bash
npm run dev
```
- **Frontend URL**: [http://localhost:3000](http://localhost:3000)
- **Backend URL**: [http://localhost:5001](http://localhost:5001)

### 4. Running Automated Tests
To run the automated endpoint validation and data isolation tests:
```bash
# Verify API flows, JWT verification, and cross-user data isolation
node backend/dist/tests/test_flow.js # or run from scratch files
```

---

## 📈 Key Design Decisions & Trade-offs

1. **Monorepo Structure**: Separate folders for `backend` and `frontend` keep the client and server decoupled. This allows independent deployments (e.g. backend on Render/Fly.io, frontend on Vercel) while keeping the code review process simple in a single repository.
2. **Client Components for Dynamic Views**: The details page uses Client Components (`"use client"`) rather than server-side rendering (SSR) because of the intensive real-time page changes: toggling checkmarks, live typing activities, tab switching, and launching day regenerations.
3. **Mongoose Subdocuments**: Itineraries and packing lists are embedded directly within the Trip document rather than references to separate tables. This is a trade-off that prioritizes query performance (fetching a single trip returns all details in one database read) over normalization.

---

## ⚠️ Known Limitations
- **No Map Integration**: Currently, activity details list locations textually. Integrations with map APIs (like Google Maps or Leaflet) were deferred to avoid introducing external paid key requirements.
- **LLM Rate Limits**: When using the free tier of Gemini, rapid consecutive clicks of the "Regenerate Day" button may hit rate limits. Debouncing handles this on the frontend, and error alerts inform the user.
