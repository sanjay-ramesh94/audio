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

class TranscriptSegment(BaseModel):
    speaker: str
    text: str
    start: float
    end: float

class Conflict(BaseModel):
    point: str
    resolution: str

class CalendarEvent(BaseModel):
    title: str
    date: str
    time: str

class MindMapNode(BaseModel):
    topic: str
    subtopics: List[str]

class MeetingInsights(BaseModel):
    summary: str
    conflicts: List[Conflict]
    calendar_events: List[CalendarEvent]
    mind_map: List[MindMapNode]

class TranscriptionResponse(BaseModel):
    transcript: List[TranscriptSegment]
    insights: MeetingInsights

@app.get("/")
async def root():
    return {"message": "AI Meeting Transcriber API is running"}

@app.post("/upload", response_model=TranscriptionResponse)
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

        # Format the transcript response
        formatted_transcript = []
        if transcript.utterances:
            for utterance in transcript.utterances:
                formatted_transcript.append(
                    TranscriptSegment(
                        speaker=f"Speaker {utterance.speaker}",
                        text=utterance.text,
                        start=utterance.start / 1000.0,
                        end=utterance.end / 1000.0
                    )
                )
        else:
            formatted_transcript.append(
                TranscriptSegment(
                    speaker="Speaker A",
                    text=transcript.text,
                    start=0.0,
                    end=transcript.audio_duration or 0.0
                )
            )

        # Generate Insights using LeMUr
        prompt = """
        Analyze this transcript and provide a JSON response with:
        1. 'summary': A 2-sentence executive summary.
        2. 'conflicts': A list of objects {point, resolution} identifying disagreements and their outcomes.
        3. 'calendar_events': A list of {title, date, time} for any future meetings or deadlines mentioned.
        4. 'mind_map': A list of {topic, subtopics[]} representing the core themes discussed.
        
        Ensure the output is ONLY valid JSON.
        """
        
        result = transcript.lemur.task(
            prompt,
            final_model=aai.LemurModel.default
        )
        
        # Simple cleanup of LLM response to get JSON
        import json
        import re
        
        json_match = re.search(r'\{.*\}', result.response, re.DOTALL)
        if json_match:
            insights_data = json.loads(json_match.group())
        else:
            # Fallback empty insights if LLM fails format
            insights_data = {
                "summary": "Transcription complete.",
                "conflicts": [],
                "calendar_events": [],
                "mind_map": []
            }

        return TranscriptionResponse(
            transcript=formatted_transcript,
            insights=MeetingInsights(**insights_data)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
