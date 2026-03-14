# EAMCET Career Platform - Frontend

A modern React application built with Vite for the EAMCET Career Counseling platform.

## Features

- **Onboarding Flow**: Multi-step form to capture user profile.
- **Assessment**: RIASEC-based behavioral assessment with interactive UI.
- **Analysis**: Personality insights and career matching.
- **Career Roadmap**: AI-generated personalized career paths.
- **College Search**: Search and filter M.Tech colleges.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **State Management**: React Context / Hooks
- **API Client**: Axios

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```

## Project Structure

- `src/components`: Reusable UI components.
- `src/pages`: Application pages (Onboarding, Assessment, Roadmap, etc.).
- `src/lib`: Utility functions and API clients.
- `src/context`: Global state management.

## Environment Variables

Create a `.env` file in the root of the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```
