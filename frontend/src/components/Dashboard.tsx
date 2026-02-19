import { motion } from 'framer-motion';
import { BarChart3, Clock, FileAudio, Users, Zap, TrendingUp, Calendar } from 'lucide-react';

export function Dashboard() {
    const stats = [
        { label: 'Total Transcripts', value: '12', icon: FileAudio, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: 'Total Minutes', value: '428', icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Active Speakers', value: '4', icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'AI Efficiency', value: '99.4%', icon: Zap, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    ];

    return (
        <div className="space-y-8 h-full overflow-y-auto pr-2 scrollbar-hide">
            <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Overview</h2>
                <p className="text-slate-400 mt-1">Track your meeting productivity and insights.</p>
            </div>

            <div className="grid grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="p-6 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl hover:border-slate-700 transition-all group"
                    >
                        <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                        <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 p-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                            <BarChart3 className="w-5 h-5 text-indigo-400" />
                            <span>Activity History</span>
                        </h3>
                        <div className="flex bg-slate-800 p-1 rounded-lg">
                            <button className="px-3 py-1 text-xs font-bold text-white bg-slate-700 rounded-md">7 Days</button>
                            <button className="px-3 py-1 text-xs font-bold text-slate-400 hover:text-white transition-colors">30 Days</button>
                        </div>
                    </div>
                    <div className="h-64 flex items-end justify-between space-x-2 pt-4">
                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center space-y-3">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ delay: 0.5 + (i * 0.1), duration: 0.8, ease: "easeOut" }}
                                    className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg relative group"
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {h}m
                                    </div>
                                </motion.div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Day {i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        <span>Updates</span>
                    </h3>
                    <div className="space-y-4">
                        {[
                            { title: "Weekly Sync", date: "2 hours ago", icon: Calendar },
                            { title: "Project Alpha", date: "Yesterday", icon: Calendar },
                            { title: "Design Review", date: "Feb 18, 2026", icon: Calendar },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center space-x-4 p-3 hover:bg-slate-800/50 rounded-2xl transition-all cursor-pointer group">
                                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-all">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white tracking-tight">{item.title}</h4>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{item.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all">
                        View All History
                    </button>
                </div>
            </div>
        </div>
    );
}
