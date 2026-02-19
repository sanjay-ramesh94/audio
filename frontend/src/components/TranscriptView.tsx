import { useState } from 'react';
import { User, MessageSquare, Download, Share2, MoreHorizontal, ArrowLeft, Clock, Users, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { InsightsView } from './InsightsView';

interface TranscriptSegment {
    speaker: string;
    text: string;
    start: number;
    end: number;
}

interface Conflict {
    point: string;
    resolution: string;
}

interface CalendarEvent {
    title: string;
    date: string;
    time: string;
}

interface MindMapNode {
    topic: string;
    subtopics: string[];
}

interface MeetingInsights {
    summary: string;
    conflicts: Conflict[];
    calendar_events: CalendarEvent[];
    mind_map: MindMapNode[];
}

interface TranscriptViewProps {
    transcript: TranscriptSegment[];
    insights: MeetingInsights;
    onBack: () => void;
    speakerMap: Record<string, string>;
}

export function TranscriptView({ transcript, insights, onBack, speakerMap }: TranscriptViewProps) {
    const [activeTab, setActiveTab] = useState<'transcript' | 'intelligence'>('transcript');

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const totalSpeakers = new Set(transcript.map(t => t.speaker)).size;
    const lastTimestamp = transcript[transcript.length - 1]?.end || 0;

    const handleExport = () => {
        const textContent = transcript.map(segment => {
            const speakerName = speakerMap[segment.speaker] || segment.speaker;
            return `[${formatTime(segment.start)}] ${speakerName}: ${segment.text}`;
        }).join('\n\n');

        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `transcript-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="h-full flex flex-col space-y-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Meeting Transcript</h2>
                        <div className="flex items-center space-x-4 text-sm text-slate-400 mt-1">
                            <span className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(lastTimestamp)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{totalSpeakers} Speakers detected</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-inner">
                    <button
                        onClick={() => setActiveTab('transcript')}
                        className={cn(
                            "flex items-center space-x-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                            activeTab === 'transcript' ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>Transcript</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('intelligence')}
                        className={cn(
                            "flex items-center space-x-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                            activeTab === 'intelligence' ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Intelligence</span>
                    </button>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all font-medium border border-slate-700"
                    >
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                    </button>
                    <button className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide py-4 relative">
                <AnimatePresence mode="wait">
                    {activeTab === 'transcript' ? (
                        <motion.div
                            key="transcript-content"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            {transcript.map((segment, i) => {
                                const isUser = i % 2 === 0;
                                const displayName = speakerMap[segment.speaker] || segment.speaker;

                                return (
                                    <motion.div
                                        initial={{ opacity: 0, x: isUser ? -10 : 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={i}
                                        className={cn(
                                            "flex flex-col space-y-2",
                                            !isUser && "items-end text-right"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex items-center space-x-3",
                                            !isUser && "flex-row-reverse space-x-reverse"
                                        )}>
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-slate-800",
                                                isUser ? "bg-indigo-600 text-white" : "bg-emerald-600 text-white"
                                            )}>
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-bold text-slate-100">{displayName}</span>
                                                <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded leading-tight">
                                                    {formatTime(segment.start)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={cn(
                                            "group relative max-w-[80%]",
                                            !isUser && "text-right"
                                        )}>
                                            <div className={cn(
                                                "p-5 rounded-[2rem] text-[15px] leading-relaxed relative transition-all duration-300",
                                                isUser
                                                    ? "bg-slate-800/80 backdrop-blur-md border border-slate-700/50 text-slate-200 rounded-tl-none hover:bg-slate-800"
                                                    : "bg-indigo-600 border border-indigo-500 text-white rounded-tr-none shadow-xl shadow-indigo-900/10 hover:bg-indigo-500"
                                            )}>
                                                {segment.text}
                                            </div>

                                            <button className={cn(
                                                "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-500 hover:text-white",
                                                isUser ? "-right-12" : "-left-12"
                                            )}>
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="intelligence-content"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <InsightsView insights={insights} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

