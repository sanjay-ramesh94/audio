import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    MessageSquare,
    Calendar,
    Handshake,
    Network,
    Download,
    CalendarPlus,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';

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

interface InsightsViewProps {
    insights: MeetingInsights;
}

export function InsightsView({ insights }: InsightsViewProps) {
    const [activeView, setActiveView] = useState<'summary' | 'conflicts' | 'calendar' | 'mindmap'>('summary');

    const generateICS = (event: CalendarEvent) => {
        const calendarData = `BEGIN:VCALENDAR
VERSION:2.0
PROID:-//Antigravity AI//Meeting Intelligence//EN
BEGIN:VEVENT
UID:${Date.now()}@antigravity.ai
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:Scheduled via Antigravity AI Transcriber
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([calendarData], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${event.title.replace(/\s+/g, '_')}.ics`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const tabs = [
        { id: 'summary', label: 'Executive Summary', icon: Sparkles },
        { id: 'conflicts', label: 'Disputes & Resolutions', icon: Handshake },
        { id: 'calendar', label: 'Smart Booking', icon: Calendar },
        { id: 'mindmap', label: 'Topic Mind Map', icon: Network },
    ] as const;

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800/50 w-fit mx-auto backdrop-blur-md">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveView(tab.id)}
                        className={cn(
                            "flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-semibold text-sm",
                            activeView === tab.id
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20"
                                : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide py-4">
                <AnimatePresence mode="wait">
                    {activeView === 'summary' && (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="p-10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 border border-slate-800 rounded-[2.5rem] relative overflow-hidden group">
                                <Sparkles className="absolute -top-10 -right-10 w-40 h-40 text-indigo-500/5 rotate-12 group-hover:text-indigo-500/10 transition-colors" />
                                <h3 className="text-2xl font-bold text-white mb-6">Executive Summary</h3>
                                <p className="text-xl text-slate-300 leading-relaxed font-medium">
                                    {insights.summary}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {activeView === 'conflicts' && (
                        <motion.div
                            key="conflicts"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 gap-4"
                        >
                            {insights.conflicts.length > 0 ? (
                                insights.conflicts.map((c, i) => (
                                    <div key={i} className="flex flex-col space-y-4 p-6 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-indigo-500/30 transition-all">
                                        <div className="flex items-start space-x-4">
                                            <div className="p-3 bg-amber-500/10 rounded-2xl flex-shrink-0">
                                                <AlertCircle className="w-6 h-6 text-amber-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-amber-500 font-bold uppercase tracking-wider text-xs mb-1">Issue</h4>
                                                <p className="text-white font-semibold text-lg">{c.point}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-4 ml-10 border-l border-slate-800 pl-4 py-2">
                                            <div className="p-3 bg-emerald-500/10 rounded-2xl flex-shrink-0">
                                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                            </div>
                                            <div>
                                                <h4 className="text-emerald-500 font-bold uppercase tracking-wider text-xs mb-1">Resolution</h4>
                                                <p className="text-slate-300">{c.resolution}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center text-slate-500 text-lg italic border-2 border-dashed border-slate-800 rounded-[2.5rem]">
                                    No significant disputes or conflicts detected in the transcript.
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeView === 'calendar' && (
                        <motion.div
                            key="calendar"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-2 gap-6"
                        >
                            {insights.calendar_events.length > 0 ? (
                                insights.calendar_events.map((e, i) => (
                                    <div key={i} className="p-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] flex flex-col justify-between group hover:border-indigo-500 transition-all">
                                        <div className="space-y-4">
                                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/20">
                                                <Calendar className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold text-white tracking-tight">{e.title}</h4>
                                                <p className="text-slate-400 mt-1 font-medium">{e.date} at {e.time}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => generateICS(e)}
                                            className="mt-8 w-full py-4 bg-slate-800 group-hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 shadow-xl shadow-slate-950/20"
                                        >
                                            <CalendarPlus className="w-5 h-5" />
                                            <span>Add to Calendar (.ics)</span>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 p-20 text-center text-slate-500 text-lg italic border-2 border-dashed border-slate-800 rounded-[2.5rem]">
                                    No upcoming meetings or calendar events found.
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeView === 'mindmap' && (
                        <motion.div
                            key="mindmap"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="relative min-h-[500px] p-8"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.05)_0%,transparent_70%)]" />
                            <div className="flex flex-wrap items-center justify-center gap-12 relative z-10">
                                {insights.mind_map.map((node, i) => (
                                    <div key={i} className="relative">
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            className="px-8 py-5 bg-indigo-600 text-white font-bold rounded-full shadow-2xl relative z-20 cursor-pointer border-4 border-indigo-400/20"
                                        >
                                            {node.topic}
                                        </motion.div>

                                        {/* Visual connections to subtopics */}
                                        <div className="flex flex-wrap justify-center gap-4 mt-6">
                                            {node.subtopics.map((sub, si) => (
                                                <motion.div
                                                    key={si}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.2 + (si * 0.1) }}
                                                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 hover:border-indigo-400 transition-colors"
                                                >
                                                    {sub}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
