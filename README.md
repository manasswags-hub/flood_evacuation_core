# SafeRoute - Flood Evacuation & Personalized Safe Routing

SafeRoute is a flood evacuation assistance system that helps users find the safest available evacuation shelter based on their location, personal needs, route safety, and shelter availability.

The system does not simply select the nearest shelter. Instead, it evaluates available routes and shelters to find a safer and more suitable evacuation option.

## Core Features

- Personalized evacuation routing
- Safest shelter selection
- Flood-risk-aware route selection
- Shelter capacity and availability
- Dynamic rerouting when the current route becomes unsafe
- Elderly-friendly evacuation planning
- Walking route support
- Two-wheeler route support
- Four-wheeler route support
- Real OpenStreetMap-based maps
- Turn-by-turn navigation
- SOS / emergency assistance interface
- Responsive web interface

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- OpenStreetMap

### Backend

- Python
- FastAPI
- Uvicorn
- Requests

### Routing and Maps

- OSRM (Open Source Routing Machine)
- OpenStreetMap

### Data and APIs

- JSON datasets
- REST APIs
- FastAPI JSON endpoints

### Development Tools

- Git
- GitHub
- Visual Studio Code
- npm

## Project Architecture

The project is divided into four main modules:

### P1 - Core Application / Integration

Handles the overall application integration and supporting project functionality.

### P2 - Route Engine

Responsible for:

- Route generation and evaluation
- Shelter selection
- Safety scoring
- Rerouting
- Flood-risk-aware route decisions

### P3 - Personalization Engine

Personalizes route selection according to the user's profile.

Supported profiles include:

- Elderly
- Walking
- Two-wheeler
- Four-wheeler

The personalization logic considers factors such as:

- Safety
- Distance
- Accessibility
- ETA
- Road conditions

### P4 - Frontend

Responsible for:

- User interface
- Profile selection
- Map visualization
- Shelter information
- Route display
- Turn-by-turn navigation
- Reroute notifications
- Shelter capacity display
- SOS interface

## Project Structure

    flood_evacuation_core/
    |
    +-- backend/
    |   +-- main.py
    |   +-- main_backup.py
    |   +-- geocode_shelters.py
    |   +-- get_gcc_shelters.py
    |   |
    |   +-- data/
    |       +-- flood_zones.json
    |       +-- roads.json
    |       +-- shelters.json
    |
    +-- frontend/
    |   +-- src/
    |       +-- App.tsx
    |       +-- types.ts
    |       +-- components/
    |       +-- data/
    |       +-- services/
    |
    +-- p2/
    |   +-- models/
    |   +-- shelter_selector/
    |   +-- safety_score/
    |   +-- rerouting/
    |   +-- main.py
    |
    +-- p3/
    |   +-- profiles.py
    |   +-- personalization.py
    |   +-- test_personalization.py
    |
    +-- README.md

## How to Access the Project

GitHub Repository:

https://github.com/manasswags-hub/flood_evacuation_core

Clone the repository:

    git clone https://github.com/manasswags-hub/flood_evacuation_core.git

    cd flood_evacuation_core

## Requirements

Make sure the following are installed:

- Python 3
- Node.js
- npm
- Git
- Visual Studio Code
- A modern web browser

## Running the Backend

Open a terminal and run:

    cd backend

Install the backend dependencies:

    python -m pip install fastapi uvicorn requests

Start the FastAPI server:

    python -m uvicorn main:app --reload --port 8000

The backend will run at:

    http://127.0.0.1:8000

FastAPI documentation:

    http://127.0.0.1:8000/docs

## Running the Frontend

Open a second terminal.

From the project root:

    cd frontend

Install dependencies:

    npm install

Start the development server:

    npm run dev

The frontend will normally run at:

    http://localhost:3000

Open the above address in your browser.

## Running the Complete Project

### Terminal 1 - Backend

    cd flood_evacuation_core/backend
    python -m uvicorn main:app --reload --port 8000

### Terminal 2 - Frontend

    cd flood_evacuation_core/frontend
    npm run dev

Then open:

    http://localhost:3000

## Main API Endpoints

### Get Available Shelters

    GET /api/shelters

Returns the shelters currently available for evacuation.

### Get Shelter Capacity

    GET /api/shelters/{shelter_id}/availability

Returns:

- Total shelter capacity
- Occupied capacity
- Available spots
- Shelter status
- Last updated time

### Find Safest Route

    POST /api/safest-route

The request contains information such as:

- User location
- User profile
- Mobility
- Transport mode
- Traveling group

The backend evaluates routes to available shelters and returns the recommended route.

### Dynamic Rerouting

    POST /api/reroute

The rerouting endpoint is used when the current route is no longer preferred.

The current route and current shelter are excluded, and an alternative route and shelter are selected.

## Shelter Selection Logic

SafeRoute does not simply choose the closest shelter.

The decision process is:

    User Location
          |
          v
    User Profile
          |
          v
    Available Shelters
          |
          v
    Candidate Routes
          |
          v
    Safety Evaluation
          |
          v
    Personalized Ranking
          |
          v
    Safest Suitable Shelter
          |
          v
    Evacuation Route

A shelter may be rejected if:

- It is unavailable
- It is full
- The route to it has higher flood risk
- The route is unsuitable for the user's profile
- A safer alternative exists

## Personalization

SafeRoute supports different evacuation requirements.

### Elderly

Prioritizes:

- Safety
- Accessibility
- Distance
- ETA

### Walking

Considers:

- Safety
- Distance
- Accessibility
- ETA

### Two-Wheeler

Considers:

- Safety
- Road conditions
- Distance
- ETA

### Four-Wheeler

Considers:

- Safety
- Road conditions
- Distance
- ETA

## Dynamic Rerouting

If a route becomes unsafe, SafeRoute can select a safer alternative.

The process is:

    Current Route
          |
          v
    Hazard / Increased Risk
          |
          v
    Exclude Current Route
          |
          v
    Exclude Current Shelter
          |
          v
    Evaluate Alternative Routes
          |
          v
    Select Safer Shelter + Route
          |
          v
    Update Navigation

The frontend displays a reroute notification and updates the route on the map.

## Shelter Capacity

Shelter availability is checked using the backend availability API.

The system can display:

- Total capacity
- Occupied capacity
- Available spots
- Occupancy percentage
- Shelter status

This helps prevent users from being directed toward a shelter that does not have enough capacity.

## Maps and Routing

SafeRoute uses:

- OpenStreetMap for map data and map tiles
- OSRM for route generation

The map displays:

- User location
- Evacuation shelters
- Selected shelter
- Current route
- Hazard locations
- Rerouted route

## Navigation

The navigation interface provides:

- Turn-by-turn directions
- Current navigation step
- Distance
- ETA
- Previous step
- Next step
- Safe arrival confirmation

Walking ETA is calculated using a walking speed of approximately 5 km/h.

Vehicle ETA uses the backend routing duration.

## Demo Location

The current demonstration is centered around:

Kelambakkam, Tamil Nadu

The main demo shelters are:

- S02 - St. Mary's Matriculation Higher Secondary School
- S03 - Bhuvana Krishana Matriculation Higher Secondary School
- S04 - Government Higher Secondary School, Kelambakkam

The project also contains a Kelambakkam Backwaters flood-risk scenario for demonstrating rerouting.

## Testing

### Test P3 Personalization

From the project root:

    python -m p3.test_personalization

### Build the Frontend

    cd frontend

    npm run build

A successful build confirms that the React and TypeScript frontend compiles successfully.

## Git Workflow

Check the current repository status:

    git status

Pull the latest changes:

    git pull --rebase origin main

After making changes:

    git add .

    git commit -m "Describe your change"

    git push origin main

Avoid force-pushing to the shared repository.

## Hackathon Demo Flow

1. Open the SafeRoute application.
2. Select a user profile.
3. Provide or use the user's location.
4. Let the system calculate the safest route.
5. Show the recommended shelter.
6. Display distance, ETA, safety score and shelter capacity.
7. Start evacuation navigation.
8. Demonstrate turn-by-turn navigation.
9. Trigger the reroute demonstration.
10. Show the new safer route and shelter.
11. Demonstrate shelter availability and capacity.

## Core Objective

The main objective of SafeRoute is:

"Find a safe evacuation path to a suitable available shelter, personalized to the user's needs, and adapt the route when conditions change."

Instead of asking:

"What is the nearest shelter?"

SafeRoute asks:

"What is the safest suitable shelter I can actually reach?"

## Project Scope

SafeRoute focuses on evacuation planning and routing.

Flood detection itself is not implemented as part of this project.

Flood-risk zones and road-condition information are treated as inputs to the routing and safety evaluation system.

## Team

SafeRoute is developed as a collaborative four-person project.

P1 - Core Application / Integration

P2 - Route Engine

P3 - Personalization Engine

P4 - Frontend UI and User Experience

## Built With

React
TypeScript
Vite
Tailwind CSS
Python
FastAPI
Uvicorn
OSRM
OpenStreetMap
JSON
REST APIs
Git
GitHub
"""
from pathlib import Path
Path("/mnt/data/README.txt").write_text(readme, encoding="utf-8")
print("done")