import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { UploadZone } from './components/UploadZone';
import { TranscriptView } from './components/TranscriptView';
import { Bell, Search, User } from 'lucide-react';
import { cn } from './lib/utils';

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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [file, setFile] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [speakerMap, setSpeakerMap] = useState<SpeakerMap>({});

  const uploadFile = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/upload', formData);
      setTranscript(response.data);

      const speakers = Array.from(new Set(response.data.map((s: TranscriptSegment) => s.speaker)));
      const initialMap: SpeakerMap = {};
      speakers.forEach((s: any) => {
        initialMap[s] = s;
      });
      setSpeakerMap(initialMap);
      setActiveTab('transcript');
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to process audio. Please check if the backend is running and your API key is set.");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'upload':
        return (
          <UploadZone
            file={file}
            setFile={setFile}
            loading={loading}
            onUpload={uploadFile}
          />
        );
      case 'transcript':
        return transcript.length > 0 ? (
          <TranscriptView
            transcript={transcript}
            speakerMap={speakerMap}
            onBack={() => setActiveTab('upload')}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 italic">
            No transcript active. Go to Upload to start.
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen w-full bg-[#0a0c10] text-slate-200 flex overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-transparent pointer-events-none" />

        <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-10 relative z-10 backdrop-blur-sm bg-slate-900/10">
          <div className="flex items-center space-x-6 w-1/3">
            <h1 className="text-xl font-display font-bold text-white tracking-tight mr-4">Antigravity</h1>
            <div className="relative group w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                placeholder="Search transcripts..."
                className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all relative group">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full group-hover:animate-ping" />
            </button>
            <div className="h-10 w-px bg-slate-800 mx-2" />
            <div className="flex items-center space-x-3 pl-2">
              <div className="text-right">
                <p className="text-sm font-bold text-white tracking-tight">Sanjay Ramesh</p>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Pro Member</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl p-0.5 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center overflow-hidden">
                  <User className="text-slate-400 w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="flex-1 p-10 relative z-10 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -10 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

export default App;
