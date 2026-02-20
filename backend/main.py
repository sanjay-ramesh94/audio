import os
import shutil
import json
import re
from typing import List, Dict, Any
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
    # FORCE LOG
    try:
        with open("backend_debug_log.txt", "a", encoding="utf-8") as f:
            f.write(f"\n--- Request Received: {file.filename} ---\n")
    except Exception as e:
        print(f"Failed to write log: {e}")

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
        lemur_output = {"conflicts": [], "resolutions": [], "events": []}
        
        try:
            with open("backend_debug_log.txt", "a", encoding="utf-8") as f:
                f.write(f"Transcript text length: {len(transcript.text)}\n")

            prompt = """
            You are an expert scheduler. Your ONLY goal is to extract calendar events from this transcript.
            Identify any meeting times that were AGREED UPON.
            - Format: YYYY-MM-DD and HH:MM
            - Default date: 2026-02-20
            - Assume "9" means 09:00 unless PM is specified.
            RETURN ONLY JSON:
            {"events": [{"subject": "Meeting", "date": "2026-02-20", "time": "09:00"}]}
            """
            
            result = transcript.lemur.task(
                prompt,
                final_model=aai.LemurModel.claude3_5_sonnet
            )
            
            response_text = result.response
            with open("backend_debug_log.txt", "a", encoding="utf-8") as f:
                f.write(f"LeMUR Response: {response_text}\n")
            
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                lemur_output = json.loads(json_match.group(0))
            
        except Exception as e:
            with open("backend_debug_log.txt", "a", encoding="utf-8") as f:
                f.write(f"LeMUR/Analysis Error: {str(e)}\n")

        # === FORCED DEBUG EVENT ===
        # If no events found, inject a dummy one to verify frontend works
        if not lemur_output.get("events"):
             lemur_output["events"] = [
                 {
                     "subject": "Detected Meeting (9 o'clock)",
                     "date": "2026-02-27",
                     "time": "09:00"
                 }
             ]
             with open("backend_debug_log.txt", "a", encoding="utf-8") as f:
                f.write("Triggering FORCED DEBUG EVENT\n")
        # ==========================

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
        # Log critical failures
        try:
             with open("backend_debug_log.txt", "a", encoding="utf-8") as f:
                f.write(f"CRITICAL ERROR: {str(e)}\n")
        except:
            pass
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
