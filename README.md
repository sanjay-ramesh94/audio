# AI Meeting Transcriber with Speaker Diarization

An AI-powered application that transcribes meeting recordings and automatically detects different speakers.

## Tech Stack
- **Backend:** FastAPI, AssemblyAI SDK
- **Frontend:** React, Vite, Tailwind CSS, Lucide React
- **AI Models:** AssemblyAI (Transcription & Diarization)

## Getting Started

### 1. Backend Setup
1. Navigate to the `backend` directory.
2. Create a `.env` file from the placeholder (if not already done).
3. Add your **AssemblyAI API Key** to the `.env` file:
   ```env
   ASSEMBLYAI_API_KEY=your_key_here
   ```
4. Run the backend using the provided script:
   ```powershell
   .\start-backend.ps1
   ```

### 2. Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Features
- **File Upload:** Support for MP3, WAV, and M4A files.
- **Smart Diarization:** Automatically identifies "Person A", "Person B", etc.
- **Chat UI:** Visualizes the transcript in a clean, side-by-side chat format.
- **Speaker Renaming:** Rename generic "Speaker A" to actual participant names.
- **Modern Design:** Built with a premium Dark Mode aesthetic.
