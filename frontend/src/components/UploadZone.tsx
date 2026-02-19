import { useRef } from 'react';
import { Upload, AudioLines, FileAudio, Play, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadZoneProps {
    file: File | null;
    setFile: (file: File | null) => void;
    loading: boolean;
    onUpload: () => void;
}

export function UploadZone({ file, setFile, loading, onUpload }: UploadZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white tracking-tight">New Transcription</h2>
                <p className="text-slate-400">Upload your meeting audio and let AI do the heavy lifting.</p>
            </div>

            <div
                onClick={() => inputRef.current?.click()}
                className="group relative border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/40 rounded-[2.5rem] p-16 transition-all duration-500 cursor-pointer overflow-hidden"
            >
                <input
                    type="file"
                    ref={inputRef}
                    onChange={handleFileChange}
                    accept="audio/*"
                    className="hidden"
                />

                {/* Decorative background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative flex flex-col items-center justify-center space-y-6">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors duration-500 shadow-2xl"
                    >
                        {file ? (
                            <FileAudio className="w-10 h-10 text-indigo-400 group-hover:text-white" />
                        ) : (
                            <Upload className="w-10 h-10 text-slate-500 group-hover:text-white" />
                        )}
                    </motion.div>

                    <div className="text-center">
                        <h3 className="text-xl font-semibold text-white group-hover:text-indigo-400 transition-colors">
                            {file ? file.name : "Drop or select audio file"}
                        </h3>
                        <p className="text-slate-500 mt-2">MP3, WAV, M4A up to 50MB</p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {file && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex justify-center"
                    >
                        <button
                            onClick={onUpload}
                            disabled={loading}
                            className="relative group px-12 py-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_50px_rgba(79,70,229,0.5)] flex items-center space-x-3 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Play className="w-6 h-6 fill-current" />
                                    <span>Transcribe Now</span>
                                </>
                            )}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-3 gap-6 pt-8">
                {[
                    { icon: AudioLines, label: "Automatic Speakers", desc: "Identify who is talking" },
                    { icon: Upload, label: "Bulk Upload", desc: "Process multiple files" },
                    { icon: FileAudio, label: "99% Accuracy", desc: "Powered by Universal models" },
                ].map((feat, i) => (
                    <div key={i} className="p-4 bg-slate-900/30 rounded-2xl border border-slate-800/50">
                        <feat.icon className="w-5 h-5 text-indigo-400 mb-2" />
                        <h4 className="text-sm font-semibold text-slate-200">{feat.label}</h4>
                        <p className="text-[11px] text-slate-500">{feat.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
