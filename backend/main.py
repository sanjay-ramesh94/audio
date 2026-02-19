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

@app.get("/")
async def root():
    return {"message": "AI Meeting Transcriber API is running"}

@app.post("/upload")
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

        # Run LeMUR analysis
        lemur_output = {}
        try:
            prompt = """
            Analyze the transcript and identifying the following:
            1. Conflicts: Disagreements between speakers. Provide the exact text segment showing the conflict.
            2. Resolutions: Agreements or consensus reached after a conflict. Provide the exact text segment.
            3. Calendar Events: Specific meeting requests with date, time, and subject.
            
            Return the result as a JSON object with keys: "conflicts" (list of objects with 'text', 'speaker'), "resolutions" (list of objects with 'text', 'speaker'), "events" (list of objects with 'subject', 'date', 'time').
            """
            
            result = transcript.lemur.task(
                prompt, 
                final_model=aai.LemurModel.claude3_5_sonnet
            )
            
            # Simple parsing attempt (LeMUR returns text, we need to ensure it's JSON)
            # In a production app, we would use structured output or more robust parsing
            lemur_output = result.response
        except Exception as e:
            print(f"LeMUR analysis failed: {e}")
            lemur_output = "Analysis unavailable"

        # Format the response
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

        return {
            "transcript": formatted_transcript,
            "analysis": lemur_output
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
