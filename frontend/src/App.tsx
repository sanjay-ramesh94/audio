import { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, User, Edit2, Play, Check, X, MessageSquare, AudioLines, Loader2 } from 'lucide-react';

interface TranscriptSegment {
  speaker: string;
  text: string;
  start: number;
  end: number;
}

interface SpeakerMap {
  [key: string]: string;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [speakerMap, setSpeakerMap] = useState<SpeakerMap>({});
  const [editingSpeaker, setEditingSpeaker] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/upload', formData);
      setTranscript(response.data);

      // Initialize speaker map
      const speakers = Array.from(new Set(response.data.map((s: TranscriptSegment) => s.speaker)));
      const initialMap: SpeakerMap = {};
      speakers.forEach((s: any) => {
        initialMap[s] = s;
      });
      setSpeakerMap(initialMap);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to process audio. Please check if the backend is running and your API key is set.");
    } finally {
      setLoading(false);
    }
  };

  const startRename = (speaker: string) => {
    setEditingSpeaker(speaker);
    setNewName(speakerMap[speaker]);
  };

  const saveRename = () => {
    if (editingSpeaker) {
      setSpeakerMap({
        ...speakerMap,
        [editingSpeaker]: newName
      });
      setEditingSpeaker(null);
    }
  };

  const cancelRename = () => {
    setEditingSpeaker(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-200 p-8 flex flex-col items-center">
      <header className="max-w-4xl w-full mb-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/20">
            <AudioLines className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              Antigravity Transcribe
            </h1>
            <p className="text-slate-500 text-sm">AI-Powered Meeting Intelligence</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl w-full flex flex-col gap-8">
        {/* Upload Section */}
        {!transcript.length && (
          <div
            className={`border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all ${file ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
              }`}
          >
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="audio/*"
            />

            <div className="mb-6 p-4 bg-slate-800 rounded-full">
              <Upload className="w-10 h-10 text-blue-400" />
            </div>

            <h2 className="text-xl font-semibold mb-2">
              {file ? file.name : "Upload your meeting audio"}
            </h2>
            <p className="text-slate-500 mb-8 text-center max-w-sm">
              Support MP3, WAV, M4A. We'll automatically detect speakers and transcribe the content.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium transition-colors"
              >
                Choose File
              </button>

              {file && (
                <button
                  onClick={uploadFile}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 rounded-xl font-bold text-white flex items-center gap-2 transition-all shadow-lg shadow-blue-900/30"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      Start Transcribing
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Transcript Section */}
        {transcript.length > 0 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="text-blue-400 w-5 h-5" />
                Transcript
              </h3>
              <button
                onClick={() => { setTranscript([]); setFile(null); }}
                className="text-sm text-slate-500 hover:text-slate-200 transition-colors"
              >
                Upload new file
              </button>
            </div>

            <div className="space-y-6">
              {transcript.map((segment, index) => {
                const isEven = segment.speaker.includes('B') || index % 2 !== 0; // Rough heuristic for visual split
                const displayName = speakerMap[segment.speaker] || segment.speaker;

                return (
                  <div
                    key={index}
                    className={`flex flex-col ${isEven ? 'items-end' : 'items-start'} group`}
                  >
                    <div className={`flex items-center gap-2 mb-2 ${isEven ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isEven ? 'bg-indigo-600' : 'bg-blue-600'
                        }`}>
                        <User className="w-4 h-4 text-white" />
                      </div>

                      <div className="flex items-center gap-2">
                        {editingSpeaker === segment.speaker ? (
                          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
                            <input
                              type="text"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              className="bg-transparent border-none focus:ring-0 text-sm px-2 w-32"
                              autoFocus
                            />
                            <button onClick={saveRename} className="p-1 hover:text-green-400 transition-colors">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={cancelRename} className="p-1 hover:text-red-400 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group/name">
                            <span className="text-sm font-bold text-white tracking-wide uppercase">
                              {displayName}
                            </span>
                            <button
                              onClick={() => startRename(segment.speaker)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-blue-400"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <span className="text-xs text-slate-600 font-mono">
                          {formatTime(segment.start)}
                        </span>
                      </div>
                    </div>

                    <div className={`max-w-[80%] p-4 rounded-3xl text-[15px] leading-relaxed shadow-sm ${isEven
                      ? 'bg-slate-900 border border-slate-800 rounded-tr-none text-right'
                      : 'bg-blue-600 text-white rounded-tl-none'
                      }`}>
                      {segment.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto pt-12 pb-6 text-slate-600 text-xs">
        <p>© 2026 Antigravity. Built with FastAPI, React & AssemblyAI.</p>
      </footer>
    </div>
  );
}

export default App;
