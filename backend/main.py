import os
import shutil
from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import assemblyai as aai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Meeting Transcriber API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set AssemblyAI API Key
# The user should set ASSEMBLYAI_API_KEY in their .env file
aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY")

class ContextItem(BaseModel):
    title: str
    description: str
    action_text: str
    action_url: str

class TranscriptSegment(BaseModel):
    speaker: str
    text: str
    start: float
    end: float
    context: List[ContextItem] = []

# Mock Knowledge Base for Demo
KNOWLEDGE_BASE = {
    "react native": {
        "title": "React Native",
        "description": "Current Version: 0.76.1. A framework for building native apps using React.",
        "action_text": "View Docs",
        "action_url": "https://reactnative.dev/"
    },
    "budget": {
        "title": "Project Budget",
        "description": "Allocated: ₹5,00,000. Remaining: ₹3,20,000. Status: On Track.",
        "action_text": "View Financials",
        "action_url": "#"
    },
    "assemblyai": {
        "title": "AssemblyAI",
        "description": "API for Speech-to-Text, Speaker Diarization, and Audio Intelligence.",
        "action_text": "API Reference",
        "action_url": "https://www.assemblyai.com/docs"
    },
    "next.js": {
        "title": "Next.js",
        "description": "The React Framework for the Web. Current Version: 14.1.0.",
        "action_text": "View Docs",
        "action_url": "https://nextjs.org/"
    }
}

def get_context(text: str) -> List[ContextItem]:
    text_lower = text.lower()
    context_items = []
    
    # Check for keywords in the Knowledge Base
    for key, data in KNOWLEDGE_BASE.items():
        if key in text_lower:
            context_items.append(ContextItem(**data))
            
    return context_items

@app.get("/")
async def root():
    return {"message": "AI Meeting Transcriber API is running"}

@app.post("/upload", response_model=List[TranscriptSegment])
async def upload_audio(file: UploadFile = File(...)):
    if not aai.settings.api_key:
        raise HTTPException(status_code=500, detail="AssemblyAI API Key not configured")

    if not file.filename.lower().endswith(('.mp3', '.wav', '.m4a', '.ogg')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an audio file.")

    # Create a temporary file
    temp_file_path = f"temp_{file.filename}"
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Configuration for transcription and diarization
        config = aai.TranscriptionConfig(
            speaker_labels=True,
            speech_models=["universal-3-pro"]
        )
        
        transcriber = aai.Transcriber()
        transcript = transcriber.transcribe(temp_file_path, config=config)

        if transcript.status == aai.TranscriptStatus.error:
            raise HTTPException(status_code=500, detail=f"Transcription failed: {transcript.error}")

        # Format the response
        formatted_transcript = []
        if transcript.utterances:
            for utterance in transcript.utterances:
                segment_context = get_context(utterance.text)
                formatted_transcript.append(
                    TranscriptSegment(
                        speaker=f"Speaker {utterance.speaker}",
                        text=utterance.text,
                        start=utterance.start / 1000.0, # Convert ms to seconds
                        end=utterance.end / 1000.0,
                        context=segment_context
                    )
                )
        else:
            # Fallback if no utterances found (single speaker)
            segment_context = get_context(transcript.text)
            formatted_transcript.append(
                TranscriptSegment(
                    speaker="Speaker A",
                    text=transcript.text,
                    start=0.0,
                    end=transcript.audio_duration or 0.0,
                    context=segment_context
                )
            )

        return formatted_transcript

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
